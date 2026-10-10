
import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT || 3000);

app.use(express.json({ limit: '1mb' }));

// Keep the Gemini API key on the server.
// Add GEMINI_API_KEY=your_actual_key to your .env file.
const apiKey = process.env.GEMINI_API_KEY;

const aiClient =
  apiKey && apiKey.trim() && apiKey !== 'MY_GEMINI_API_KEY'
    ? new GoogleGenAI({ apiKey })
    : null;

if (aiClient) {
  console.log('Gemini AI initialized.');
} else {
  console.warn('GEMINI_API_KEY is missing. AI endpoints require a valid key.');
}

const MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

type ActionType =
  | 'update_trip'
  | 'regenerate_itinerary'
  | 'add_activity'
  | 'remove_activity'
  | 'update_activity'
  | 'add_expense'
  | 'remove_expense'
  | 'none';

interface AgentAction {
  type: ActionType;
  changes?: Record<string, unknown>;
  dayNumber?: number;
  activityId?: string;
  activityTitle?: string;
  activity?: Record<string, unknown>;
  expense?: Record<string, unknown>;
  expenseId?: string;
  reason?: string;
}

interface AgentResult {
  reply: string;
  actions: AgentAction[];
}

function isObject(value: unknown): value is Record<string, any> {
  return (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value)
  );
}

function getGemini() {
  if (!aiClient) {
    throw new Error(
      'Gemini is not configured. Add GEMINI_API_KEY to your server .env file.'
    );
  }

  return aiClient;
}

function cleanJson(text: string): string {
  return text
    .trim()
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/, '')
    .trim();
}

function validateAction(value: unknown): AgentAction | null {
  if (!isObject(value) || typeof value.type !== 'string') {
    return null;
  }

  const allowedTypes: ActionType[] = [
    'update_trip',
    'regenerate_itinerary',
    'add_activity',
    'remove_activity',
    'update_activity',
    'add_expense',
    'remove_expense',
    'none',
  ];

  if (!allowedTypes.includes(value.type as ActionType)) {
    return null;
  }

  const action = value as AgentAction;

  if (
    action.dayNumber !== undefined &&
    (!Number.isInteger(action.dayNumber) ||
      action.dayNumber < 1 ||
      action.dayNumber > 30)
  ) {
    return null;
  }

  if (
    action.type === 'update_trip' &&
    !isObject(action.changes)
  ) {
    return null;
  }

  if (
    action.type === 'add_activity' &&
    !isObject(action.activity)
  ) {
    return null;
  }

  if (
    action.type === 'add_expense' &&
    !isObject(action.expense)
  ) {
    return null;
  }

  if (
    ['remove_activity', 'update_activity'].includes(action.type) &&
    !action.activityId &&
    !action.activityTitle
  ) {
    return null;
  }

  if (
    action.type === 'remove_expense' &&
    !action.expenseId
  ) {
    return null;
  }

  return action;
}

function validateTripChanges(
  input: Record<string, unknown>
): Record<string, unknown> {
  const changes: Record<string, unknown> = {};

  // Only these trip-plan fields may be changed through this action.
  const allowedFields = [
    'destination',
    'durationDays',
    'totalBudget',
    'travelerCount',
    'travelerType',
    'travelStyle',
    'travelPace',
    'accommodationType',
    'transportPreference',
    'startDate',
    'interests',
  ];

  for (const field of allowedFields) {
    if (!(field in input)) continue;

    const value = input[field];

    if (field === 'destination') {
      if (typeof value !== 'string' || !value.trim()) {
        throw new Error('Destination must be a non-empty string.');
      }

      changes.destination = value.trim();
    } else if (
      ['durationDays', 'travelerCount'].includes(field)
    ) {
      if (
        typeof value !== 'number' ||
        !Number.isInteger(value) ||
        value < 1 ||
        value > (field === 'durationDays' ? 30 : 100)
      ) {
        throw new Error(`Invalid ${field}.`);
      }

      changes[field] = value;
    } else if (field === 'totalBudget') {
      if (
        typeof value !== 'number' ||
        !Number.isFinite(value) ||
        value < 0
      ) {
        throw new Error('Budget must be a non-negative number.');
      }

      changes.totalBudget = value;
    } else if (
      [
        'travelerType',
        'travelStyle',
        'travelPace',
        'accommodationType',
        'transportPreference',
        'startDate',
      ].includes(field)
    ) {
      if (typeof value !== 'string') {
        throw new Error(`Invalid ${field}.`);
      }

      changes[field] = value;
    } else if (field === 'interests') {
      if (
        !Array.isArray(value) ||
        value.length > 30 ||
        !value.every((item) => typeof item === 'string')
      ) {
        throw new Error('Interests must be a list of strings.');
      }

      changes.interests = value;
    }
  }

  if (Object.keys(changes).length === 0) {
    throw new Error('No valid trip fields were provided.');
  }

  return changes;
}

function validateExpense(
  input: Record<string, unknown>
): Record<string, unknown> {
  const title = input.title;
  const amount = input.amount;

  if (typeof title !== 'string' || !title.trim()) {
    throw new Error('Expense title is required.');
  }

  if (
    typeof amount !== 'number' ||
    !Number.isFinite(amount) ||
    amount < 0
  ) {
    throw new Error('Expense amount must be non-negative.');
  }

  return {
    title: title.trim(),
    amount,
    category:
      typeof input.category === 'string'
        ? input.category
        : 'Other',
    date:
      typeof input.date === 'string'
        ? input.date
        : new Date().toISOString().slice(0, 10),
    notes: typeof input.notes === 'string' ? input.notes : '',
  };
}

function validateActivity(
  input: Record<string, unknown>
): Record<string, unknown> {
  if (
    typeof input.title !== 'string' ||
    !input.title.trim()
  ) {
    throw new Error('Activity title is required.');
  }

  const result: Record<string, unknown> = {
    title: input.title.trim(),
  };

  const stringFields = [
    'description',
    'category',
    'timeSlot',
    'timeString',
    'locationName',
    'address',
  ];

  for (const field of stringFields) {
    if (input[field] !== undefined) {
      if (typeof input[field] !== 'string') {
        throw new Error(`Invalid activity ${field}.`);
      }

      result[field] = input[field];
    }
  }

  if (input.estimatedCostPerPerson !== undefined) {
    if (
      typeof input.estimatedCostPerPerson !== 'number' ||
      !Number.isFinite(input.estimatedCostPerPerson) ||
      input.estimatedCostPerPerson < 0
    ) {
      throw new Error('Activity cost must be non-negative.');
    }

    result.estimatedCostPerPerson =
      input.estimatedCostPerPerson;
  }

  return result;
}

// -------------------------------------------------------
// AI ADVISOR: returns structured, validated action proposals
// -------------------------------------------------------

app.post('/api/advisor/chat', async (req: Request, res: Response) => {
  try {
    const { query, plan, itinerary, expenses } = req.body;

    if (typeof query !== 'string' || !query.trim()) {
      return res.status(400).json({
        success: false,
        error: 'A user message is required.',
      });
    }

    if (!isObject(plan)) {
      return res.status(400).json({
        success: false,
        error: 'The current trip plan is required.',
      });
    }

    const ai = getGemini();

    const prompt = `
You are the action-planning AI for a travel-planning website.

Understand the user's command and return JSON only.
Never claim that an action has already been executed.
The backend and frontend will execute approved actions.

CURRENT TRIP PLAN:
${JSON.stringify(plan)}

CURRENT ITINERARY:
${JSON.stringify(Array.isArray(itinerary) ? itinerary : [])}

CURRENT EXPENSES:
${JSON.stringify(Array.isArray(expenses) ? expenses : [])}

USER COMMAND:
${query}

Allowed action types:
1. update_trip
   changes may contain only:
   destination, durationDays, totalBudget, travelerCount,
   travelerType, travelStyle, travelPace, accommodationType,
   transportPreference, startDate, interests.

2. regenerate_itinerary
   Use when a change requires rebuilding the schedule, such as
   a destination or trip-duration change.

3. add_activity
   Requires dayNumber and activity with title.
   Optional activity fields: description, category, timeSlot,
   timeString, locationName, address, estimatedCostPerPerson.

4. remove_activity
   Requires dayNumber and activityId or activityTitle.

5. update_activity
   Requires dayNumber and activityId or activityTitle.
   Include changes in the "activity" object.

6. add_expense
   Requires expense with title and numeric amount.
   Optional fields: category, date, notes.

7. remove_expense
   Requires expenseId.

8. none
   Use for questions, advice, or unsupported requests.

Rules:
- Return only actions that match the user's actual intent.
- A destination or duration change should normally include
  update_trip and regenerate_itinerary.
- Budget-only changes do not require regenerating the itinerary.
- Never invent existing activity IDs or expense IDs.
- When the user refers to an activity by position, use its title
  only if the current itinerary clearly identifies it.
- Do not fabricate prices as verified facts.
- For unclear destructive actions, ask a clarifying question and
  return no destructive action.
- Keep the reply concise.

Return exactly this JSON shape:
{
  "reply": "Short response explaining the intended change",
  "actions": [
    {
      "type": "update_trip",
      "changes": {
        "totalBudget": 1000
      },
      "reason": "User requested a budget change"
    }
  ]
}
`;

    const response = await ai.models.generateContent({
      model: MODEL,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.1,
      },
    });

    const rawText = response.text;

    if (!rawText) {
      throw new Error('Gemini returned an empty response.');
    }

    const parsed = JSON.parse(cleanJson(rawText));

    if (
      !isObject(parsed) ||
      typeof parsed.reply !== 'string' ||
      !Array.isArray(parsed.actions)
    ) {
      throw new Error('Gemini returned an invalid action response.');
    }

    const actions: AgentAction[] = [];

    for (const rawAction of parsed.actions) {
      const action = validateAction(rawAction);

      if (!action) {
        continue;
      }

      if (action.type === 'update_trip') {
        action.changes = validateTripChanges(
          action.changes || {}
        );
      }

      if (action.type === 'add_activity') {
        action.activity = validateActivity(
          action.activity || {}
        );
      }

      if (action.type === 'update_activity') {
        action.activity = validateActivity(
          action.activity || {}
        );
      }

      if (action.type === 'add_expense') {
        action.expense = validateExpense(
          action.expense || {}
        );
      }

      actions.push(action);
    }

    return res.json({
      success: true,
      reply: parsed.reply,
      actions,
      requiresFrontendExecution: actions.length > 0,
    });
  } catch (error: unknown) {
    console.error('Advisor chat error:', error);

    return res.status(500).json({
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'The AI advisor failed.',
    });
  }
});

// -------------------------------------------------------
// REVIEW TRIP CHANGES
// -------------------------------------------------------

app.post(
  '/api/advisor/review-changes',
  async (req: Request, res: Response) => {
    try {
      const { plan } = req.body;

      if (!isObject(plan)) {
        return res.status(400).json({
          success: false,
          error: 'A trip plan is required.',
        });
      }

      const duration = Number(plan.durationDays || 4);
      const budget = Number(plan.totalBudget || 1500);
      const travelers = Number(plan.travelerCount || 1);

      if (
        !Number.isInteger(duration) ||
        duration < 1 ||
        duration > 30 ||
        !Number.isFinite(budget) ||
        budget < 0 ||
        !Number.isInteger(travelers) ||
        travelers < 1
      ) {
        return res.status(400).json({
          success: false,
          error: 'Trip duration, budget, or traveler count is invalid.',
        });
      }

      const ai = getGemini();

      const prompt = `
Review this travel plan and provide practical suggestions.
Do not claim to have changed the website.
Return JSON only:
{
  "summary": "Brief summary",
  "keyChanges": ["Suggestion 1", "Suggestion 2"],
  "budgetAdvice": "Budget recommendation"
}
Trip plan:
${JSON.stringify(plan)}
`;

      const response = await ai.models.generateContent({
        model: MODEL,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.2,
        },
      });

      const parsed = JSON.parse(cleanJson(response.text || ''));

      if (
        typeof parsed.summary !== 'string' ||
        !Array.isArray(parsed.keyChanges) ||
        typeof parsed.budgetAdvice !== 'string'
      ) {
        throw new Error('Invalid review response.');
      }

      return res.json(parsed);
    } catch (error: unknown) {
      console.error('Review changes error:', error);

      return res.status(500).json({
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Could not review trip changes.',
      });
    }
  }
);

// -------------------------------------------------------
// GENERATE ITINERARY
// -------------------------------------------------------

app.post(
  '/api/itinerary/generate',
  async (req: Request, res: Response) => {
    try {
      const { plan } = req.body;

      if (
        !isObject(plan) ||
        typeof plan.destination !== 'string' ||
        !plan.destination.trim()
      ) {
        return res.status(400).json({
          success: false,
          error: 'A destination is required.',
        });
      }

      const duration = Number(plan.durationDays || 4);
      const budget = Number(plan.totalBudget || 1500);
      const travelerCount = Number(plan.travelerCount || 1);

      if (
        !Number.isInteger(duration) ||
        duration < 1 ||
        duration > 30 ||
        !Number.isFinite(budget) ||
        budget < 0 ||
        !Number.isInteger(travelerCount) ||
        travelerCount < 1
      ) {
        return res.status(400).json({
          success: false,
          error: 'The trip plan contains invalid values.',
        });
      }

      const ai = getGemini();

      const startDate = plan.startDate || '2026-11-04';
      const interests =
        Array.isArray(plan.interests) && plan.interests.length
          ? plan.interests.join(', ')
          : 'Culture, Food, Sightseeing';

      const prompt = `
Generate a travel itinerary as valid JSON.
Return exactly ${duration} days in an array named "days".
Use different attractions on each day.
Group nearby attractions together where possible.
Generate 3-4 activities per day.
Use realistic approximate costs in USD; do not claim prices are verified.
Do not invent precise coordinates when uncertain; use 0 for unknown coordinates.
Each activity should have:
timeSlot, timeString, title, description, category,
locationName, address, metroStation, coordinates,
estimatedCostPerPerson, transportToNext, crowdLevel,
crowdPeakNote, crowdHourly, weatherSuitability, indoorAlternative.

Each day should have:
dayNumber, date, title, theme, estimatedCostTotal, activities.

Trip:
Destination: ${plan.destination}
Start date: ${startDate}
Duration: ${duration} days
Total budget: $${budget}
Budget per day: $${Math.round(budget / duration)}
Travelers: ${travelerCount}
Travel style: ${plan.travelStyle || 'balanced'}
Travel pace: ${plan.travelPace || 'moderate'}
Interests: ${interests}

Return JSON in this structure:
{
  "days": [
    {
      "dayNumber": 1,
      "date": "${startDate}",
      "title": "Day 1: Local area",
      "theme": "Theme",
      "estimatedCostTotal": 100,
      "activities": [
        {
          "timeSlot": "morning",
          "timeString": "09:00 AM - 11:00 AM",
          "title": "Attraction",
          "description": "Description",
          "category": "culture",
          "locationName": "Venue",
          "address": "Area",
          "metroStation": "Nearest stop",
          "coordinates": {"lat": 0, "lng": 0},
          "estimatedCostPerPerson": 15,
          "transportToNext": {
            "mode": "walk",
            "durationMinutes": 10,
            "cost": 0,
            "note": "Short walk"
          },
          "crowdLevel": "moderate",
          "crowdPeakNote": "Visit earlier",
          "crowdHourly": {
            "morning": 10,
            "midday": 20,
            "afternoon": 30,
            "evening": 10
          },
          "weatherSuitability": "all-weather",
          "indoorAlternative": null
        }
      ]
    }
  ]
}
`;

      const response = await ai.models.generateContent({
        model: MODEL,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.2,
        },
      });

      const parsed = JSON.parse(cleanJson(response.text || ''));

      if (!Array.isArray(parsed.days)) {
        throw new Error('AI did not return an itinerary.');
      }

      const days = parsed.days.slice(0, duration).map(
        (day: any, dayIndex: number) => {
          const dayNumber = dayIndex + 1;

          const activities = (
            Array.isArray(day.activities) ? day.activities : []
          ).slice(0, 4).map((activity: any, activityIndex: number) => ({
            id: `act-${Date.now()}-${dayNumber}-${activityIndex}`,
            dayNumber,
            timeSlot:
              activity.timeSlot ||
              ['morning', 'midday', 'afternoon', 'evening'][activityIndex],
            timeString: activity.timeString || '',
            title: activity.title || 'Local attraction',
            description: activity.description || '',
            category: activity.category || 'attraction',
            locationName: activity.locationName || activity.title || '',
            address: activity.address || '',
            metroStation: activity.metroStation || '',
            coordinates: {
              lat: Number(activity.coordinates?.lat) || 0,
              lng: Number(activity.coordinates?.lng) || 0,
            },
            estimatedCostPerPerson:
              Math.max(0, Number(activity.estimatedCostPerPerson) || 0),
            transportToNext: activity.transportToNext
              ? {
                  mode: activity.transportToNext.mode || 'walk',
                  durationMinutes:
                    Number(activity.transportToNext.durationMinutes) || 0,
                  cost: Math.max(
                    0,
                    Number(activity.transportToNext.cost) || 0
                  ),
                  note: activity.transportToNext.note || '',
                }
              : undefined,
            crowdLevel: activity.crowdLevel || 'moderate',
            crowdPeakNote: activity.crowdPeakNote || '',
            crowdDataNotice:
              'AI-generated estimates; verify locally before travel.',
            crowdHourly: activity.crowdHourly || {
              morning: 15,
              midday: 30,
              afternoon: 35,
              evening: 15,
            },
            weatherSuitability:
              activity.weatherSuitability || 'all-weather',
            indoorAlternative: activity.indoorAlternative || undefined,
            isCompleted: false,
          }));

          const estimatedCostTotal = activities.reduce(
            (sum: number, activity: any) =>
              sum +
              (
                activity.estimatedCostPerPerson +
                (activity.transportToNext?.cost || 0)
              ) *
                travelerCount,
            0
          );

          return {
            dayNumber,
            date: day.date || startDate,
            title: day.title || `Day ${dayNumber}: ${plan.destination}`,
            theme: day.theme || 'Exploration',
            estimatedCostTotal,
            activities,
          };
        }
      );

      if (days.length !== duration) {
        throw new Error(
          `AI returned ${days.length} days instead of ${duration}. Please try again.`
        );
      }

      return res.json({
        success: true,
        days,
        source: 'gemini_ai',
      });
    } catch (error: unknown) {
      console.error('Itinerary generation error:', error);

      return res.status(500).json({
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to generate itinerary.',
      });
    }
  }
);

// -------------------------------------------------------
// SERVER STARTUP
// -------------------------------------------------------

async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'dist')));

    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');

    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });

    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`AI Travel Agent running on port ${PORT}`);
  });
}

startServer().catch((error) => {
  console.error('Could not start server:', error);
  process.exitCode = 1;
});
