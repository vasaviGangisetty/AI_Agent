
import {
  TripPlan,
  ItineraryDay,
  Expense,
  AgentInsight,
} from '../types/travel';

import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { createAgent } from 'langchain';

import { tool } from '@langchain/core/tools';
import { z } from 'zod';

/* =========================================================
   TYPES
========================================================= */

export interface BudgetAnalysis {
  totalBudget: number;
  plannedItineraryCost: number;
  actualSpent: number;
  projectedTotal: number;
  remainingBalance: number;
  isOverBudget: boolean;
  overrunAmount: number;
  utilizationPercent: number;
  perPersonBudget: number;
  perPersonSpent: number;
  perPersonRemaining: number;
  suggestedSavings: {
    category: string;
    description: string;
    savingAmount: number;
    actionable: boolean;
  }[];
}

export interface AgentChatResponse {
  reply: string;
  action?: {
    label: string;
    actionType: AgentInsight['actionType'];
  };
}

/* =========================================================
   BUDGET ANALYSIS TOOL
   Uses your application's actual trip and expense data.
========================================================= */

export function analyzeBudget(
  plan: TripPlan,
  itinerary: ItineraryDay[],
  expenses: Expense[]
): BudgetAnalysis {
  const travelers = Math.max(1, plan.travelerCount);

  const plannedItineraryCost = itinerary.reduce(
    (sum, day) => sum + day.estimatedCostTotal,
    0
  );

  const actualSpent = expenses.reduce(
    (sum, expense) => sum + expense.amount,
    0
  );

  const projectedTotal = Math.max(
    plannedItineraryCost,
    actualSpent
  );

  const remainingBalance = plan.totalBudget - actualSpent;

  const isOverBudget =
    actualSpent > plan.totalBudget ||
    plannedItineraryCost > plan.totalBudget;

  const overrunAmount = isOverBudget
    ? Math.max(
        actualSpent - plan.totalBudget,
        plannedItineraryCost - plan.totalBudget
      )
    : 0;

  const utilizationPercent =
    plan.totalBudget > 0
      ? Math.round((actualSpent / plan.totalBudget) * 100)
      : 100;

  const perPersonBudget = Math.round(
    plan.totalBudget / travelers
  );

  const perPersonSpent = Math.round(
    actualSpent / travelers
  );

  const perPersonRemaining = Math.round(
    remainingBalance / travelers
  );

  const suggestedSavings: BudgetAnalysis['suggestedSavings'] = [];

  if (isOverBudget || utilizationPercent > 80) {
    suggestedSavings.push(
      {
        category: 'transport',
        description:
          'Compare public transport passes with individual fares and taxis before choosing.',
        savingAmount: 25 * travelers,
        actionable: true,
      },
      {
        category: 'food',
        description:
          'Compare affordable local restaurants and lunch specials with more expensive dining options.',
        savingAmount: 45 * travelers,
        actionable: true,
      },
      {
        category: 'activities',
        description:
          'Consider free attractions and lower-cost alternatives to paid tourist attractions.',
        savingAmount: 30 * travelers,
        actionable: true,
      }
    );
  }

  return {
    totalBudget: plan.totalBudget,
    plannedItineraryCost,
    actualSpent,
    projectedTotal,
    remainingBalance,
    isOverBudget,
    overrunAmount,
    utilizationPercent,
    perPersonBudget,
    perPersonSpent,
    perPersonRemaining,
    suggestedSavings,
  };
}

/* =========================================================
   AGENT INSIGHTS
========================================================= */

export function generateAgentInsights(
  plan: TripPlan,
  itinerary: ItineraryDay[],
  expenses: Expense[]
): AgentInsight[] {
  const insights: AgentInsight[] = [];
  const analysis = analyzeBudget(plan, itinerary, expenses);

  if (analysis.isOverBudget) {
    insights.push({
      id: 'insight-budget-overrun',
      timestamp: 'Just now',
      type: 'alert',
      title: `Budget Alert: $${analysis.overrunAmount.toLocaleString()} Over Budget`,
      description:
        `Your planned itinerary or recorded spending exceeds your $${plan.totalBudget.toLocaleString()} budget. Review the suggested savings before changing your plans.`,
      actionLabel: 'Apply Budget Optimization',
      actionType: 'apply_budget_fix',
      savingsAmount: analysis.suggestedSavings.reduce(
        (sum, item) => sum + item.savingAmount,
        0
      ),
    });
  } else if (analysis.utilizationPercent >= 75) {
    insights.push({
      id: 'insight-budget-warning',
      timestamp: 'Just now',
      type: 'optimization',
      title: `Budget Warning: ${analysis.utilizationPercent}% Spent`,
      description:
        `$${analysis.remainingBalance.toLocaleString()} remains from your budget. Your planned itinerary costs $${analysis.plannedItineraryCost.toLocaleString()}.`,
      actionLabel: 'View Expense Breakdown',
      actionType: 'view_expenses',
    });
  }

  insights.push({
    id: 'insight-itinerary-review',
    timestamp: 'Just now',
    type: 'tip',
    title: 'Itinerary Review',
    description:
      `Review travel times, attraction opening hours and alternative indoor activities in ${plan.destination}. Verify current conditions before travelling.`,
  });

  if (plan.travelerType === 'group' && plan.travelerCount > 1) {
    insights.push({
      id: 'insight-group-shared',
      timestamp: 'Just now',
      type: 'tip',
      title: `Group Travel (${plan.travelerCount} Travelers)`,
      description:
        'Compare shared transport and group meal options. Record who paid each expense to make splitting costs easier.',
    });
  } else {
    insights.push({
      id: 'insight-solo-mobility',
      timestamp: 'Just now',
      type: 'tip',
      title: 'Flexible Travel Planning',
      description:
        'Keep alternative activities available so you can adapt your itinerary if weather, opening hours or travel times change.',
    });
  }

  return insights;
}

/* =========================================================
   REAL AI AGENT
   Gemini reasons over the user's question and can call tools.
========================================================= */

export async function getAgentChatResponse(
  userQuery: string,
  plan: TripPlan,
  itinerary: ItineraryDay[],
  expenses: Expense[]
): Promise<AgentChatResponse> {
  const apiKey =
    process.env.GOOGLE_API_KEY ||
    process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error(
      'Gemini API key is missing. Add GOOGLE_API_KEY to your server environment.'
    );
  }

  // Tool 1: Analyze the actual trip budget.
  const budgetTool = tool(
    async () => {
      const analysis = analyzeBudget(plan, itinerary, expenses);

      return JSON.stringify(analysis, null, 2);
    },
    {
      name: 'analyze_trip_budget',
      description:
        'Analyze the current trip budget using actual trip data. Use this when the user asks about spending, savings, remaining budget, affordability or overspending.',
      schema: z.object({}),
    }
  );

  // Tool 2: Inspect the current itinerary.
  const itineraryTool = tool(
    async () => {
      return JSON.stringify(
        {
          destination: plan.destination,
          travelerCount: plan.travelerCount,
          totalBudget: plan.totalBudget,
          itinerary,
        },
        null,
        2
      );
    },
    {
      name: 'inspect_trip_itinerary',
      description:
        'Inspect the current destination, budget and planned itinerary. Use this before recommending schedule changes, alternative activities or itinerary improvements.',
      schema: z.object({}),
    }
  );

  // Tool 3: Inspect recorded expenses.
  const expensesTool = tool(
    async () => {
      const analysis = analyzeBudget(plan, itinerary, expenses);

      return JSON.stringify(
        {
          expenses,
          actualSpent: analysis.actualSpent,
          remainingBalance: analysis.remainingBalance,
          perPersonSpent: analysis.perPersonSpent,
          perPersonRemaining: analysis.perPersonRemaining,
        },
        null,
        2
      );
    },
    {
      name: 'inspect_trip_expenses',
      description:
        'Inspect recorded expenses and spending totals. Use this when the user asks who spent what, how much has been spent or how much budget remains.',
      schema: z.object({}),
    }
  );

  const model = new ChatGoogleGenerativeAI({
    apiKey,
    model: 'gemini-2.5-flash',
    temperature: 0.2,
  });

  const agent = createAgent({
    model,
    tools: [
      budgetTool,
      itineraryTool,
      expensesTool,
    ],
    systemPrompt: `
You are the AI Travel Advisor for a real travel-planning application.

Your job is to understand the user's intent, reason about their trip,
use tools when relevant, and provide specific, useful travel advice.

CURRENT TRIP
Destination: ${plan.destination}
Traveler count: ${plan.travelerCount}
Traveler type: ${plan.travelerType}
Total budget: ${plan.totalBudget}

CURRENT ITINERARY
${JSON.stringify(itinerary)}

RECORDED EXPENSES
${JSON.stringify(expenses)}

RULES
1. Answer the user's actual question rather than returning generic chatbot replies.
2. Use the budget tool for budget calculations and the itinerary tool when the
   question depends on planned activities or scheduling.
3. Use the expenses tool for questions about actual spending.
4. Base calculations on tool results and supplied data. Never invent expenses,
   prices, opening hours, weather forecasts, bookings or travel availability.
5. If current weather or live information is required but unavailable through
   your tools, clearly say it needs to be checked using a live data source.
6. Make recommendations that fit the destination, group size and budget.
7. Do not claim that you modified an itinerary, booked a ticket, changed an
   expense or performed another external action. You can suggest an action,
   but the application must execute and confirm it.
8. If important information is missing, ask one concise follow-up question.
9. Keep answers clear and practical. Use numbered steps when useful.

RESPONSE FORMAT
Return valid JSON only, with this structure:
{
  "reply": "Your helpful answer to the user",
  "action": null
}

If a relevant application action would help, action may instead be:
{
  "label": "A short button label",
  "actionType": "apply_budget_fix"
}

Allowed actionType values:
- apply_budget_fix
- swap_rain_activity
- view_expenses

Only suggest an action when it is relevant. Do not claim the action has
already been performed. Do not use Markdown code fences around the JSON.
`,
  });

  const result = await agent.invoke({
    messages: [
      {
        role: 'user',
        content: userQuery,
      },
    ],
  });

  const lastMessage = result.messages[result.messages.length - 1];

  const rawContent = lastMessage?.content;

  const textContent =
    typeof rawContent === 'string'
      ? rawContent
      : Array.isArray(rawContent)
        ? rawContent
            .map((part) =>
              typeof part === 'string'
                ? part
                : 'text' in part
                  ? String(part.text)
                  : ''
            )
            .join('')
        : '';

  if (!textContent.trim()) {
    throw new Error(
      'The AI agent returned an empty response. Please try again.'
    );
  }

  // Parse the agent's JSON response safely.
  try {
    const cleaned = textContent
      .trim()
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/\s*```$/, '');

    const parsed: unknown = JSON.parse(cleaned);

    if (
      typeof parsed === 'object' &&
      parsed !== null &&
      'reply' in parsed &&
      typeof parsed.reply === 'string'
    ) {
      const data = parsed as {
        reply: string;
        action?: {
          label?: string;
          actionType?: string;
        } | null;
      };

      const allowedActions = [
        'apply_budget_fix',
        'swap_rain_activity',
        'view_expenses',
      ] as const;

      if (
        data.action?.label &&
        allowedActions.includes(
          data.action.actionType as (typeof allowedActions)[number]
        )
      ) {
        return {
          reply: data.reply,
          action: {
            label: data.action.label,
            actionType:
              data.action.actionType as AgentInsight['actionType'],
          },
        };
      }

      return { reply: data.reply };
    }
  } catch {
    // If Gemini returns plain text instead of JSON, keep its answer.
  }

  return { reply: textContent };
}
