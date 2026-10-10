
import React, { useState, useEffect } from 'react';

import type {
  Activity,
  TripPlan,
  ItineraryDay,
  Expense,
  WeatherDay,
  ActiveNavTab,
} from './types/travel';

import { generateItinerary } from './services/itineraryEngine';
import { generateSampleWeather } from './services/weatherService';
import { analyzeBudget } from './services/aiAgentEngine';

import { Navbar } from './components/Navbar';
import { HomePage } from './components/HomePage';
import { TripForm } from './components/TripForm';
import { ItineraryAndMapView } from './components/ItineraryAndMapView';
import { BudgetAndExpensesView } from './components/BudgetAndExpensesView';
import { WeatherAndCrowdsView } from './components/WeatherAndCrowdsView';
import AIAgentPanel from './components/AIAgentPanel';

import { Compass, Sparkles } from 'lucide-react';

type AIActionData = Record<string, unknown>;

const DEFAULT_PLAN: TripPlan = {
  id: 'trip-tokyo-2026',
  destination: 'Tokyo',
  country: 'Japan',
  startDate: '2026-11-10',
  durationDays: 4,
  totalBudget: 1500,
  currency: 'USD',
  travelerType: 'solo',
  travelerCount: 1,
  travelerNames: ['Alex'],
  interests: ['culture', 'food', 'landmarks', 'art'],
  travelStyle: 'balanced',
  travelPace: 'moderate',
  accommodationType: 'hotel',
  transportPreference: 'public_transit',
  dailySpendingLimit: 375,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const DEFAULT_SAMPLE_EXPENSES: Expense[] = [
  {
    id: 'exp-1',
    title: 'Metro 72-Hour Unlimited Pass',
    amount: 14,
    category: 'transport',
    date: '2026-11-10',
    paidBy: 'Alex',
    splitType: 'equal',
    costNature: 'shared',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'exp-2',
    title: 'Traditional Tempura Lunch',
    amount: 22,
    category: 'food',
    date: '2026-11-10',
    paidBy: 'Alex',
    splitType: 'equal',
    costNature: 'individual',
    assignedTo: 'Alex',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'exp-3',
    title: 'TeamLab Museum Ticket',
    amount: 32,
    category: 'tickets',
    date: '2026-11-11',
    paidBy: 'Alex',
    splitType: 'equal',
    costNature: 'individual',
    assignedTo: 'Alex',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'exp-4',
    title: 'Souvenirs & Merch',
    amount: 45,
    category: 'shopping',
    date: '2026-11-11',
    paidBy: 'Alex',
    splitType: 'individual',
    costNature: 'individual',
    assignedTo: 'Alex',
    createdAt: new Date().toISOString(),
    },
];

function readSavedValue<T>(key: string, fallback: T): T {
  try {
    const saved = localStorage.getItem(key);
    return saved ? (JSON.parse(saved) as T) : fallback;
  } catch {
    return fallback;
  }
}

function calculateDayCost(
  activities: ItineraryDay['activities'],
  travelerCount: number
): number {
  return activities.reduce(
    (sum, activity) =>
      sum +
      (activity.estimatedCostPerPerson +
        (activity.transportToNext?.cost || 0)) *
        travelerCount,
    0
  );
}

export default function App() {
  const [currentPlan, setCurrentPlan] = useState<TripPlan>(() =>
    readSavedValue('ai_travel_plan', DEFAULT_PLAN)
  );

  const [itinerary, setItinerary] = useState<ItineraryDay[]>(() =>
    readSavedValue(
      'ai_travel_itinerary',
      generateItinerary(DEFAULT_PLAN)
    )
  );

  const [expenses, setExpenses] = useState<Expense[]>(() =>
    readSavedValue('ai_travel_expenses', DEFAULT_SAMPLE_EXPENSES)
  );

  const [weatherList, setWeatherList] = useState<WeatherDay[]>(() =>
    generateSampleWeather(
      DEFAULT_PLAN.destination,
      DEFAULT_PLAN.startDate,
      DEFAULT_PLAN.durationDays
    )
  );

  const [activeTab, setActiveTab] = useState<ActiveNavTab>('home');
  const [isAIAgentOpen, setIsAIAgentOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem('ai_travel_plan', JSON.stringify(currentPlan));
    } catch (error) {
      console.warn('Could not save trip plan:', error);
    }
  }, [currentPlan]);

  useEffect(() => {
    try {
      localStorage.setItem(
        'ai_travel_itinerary',
        JSON.stringify(itinerary)
      );
    } catch (error) {
      console.warn('Could not save itinerary:', error);
    }
  }, [itinerary]);

  useEffect(() => {
    try {
      localStorage.setItem(
        'ai_travel_expenses',
        JSON.stringify(expenses)
      );
    } catch (error) {
      console.warn('Could not save expenses:', error);
    }
  }, [expenses]);

  const showToast = (message: string) => {
    setToastMessage(message);
    window.setTimeout(() => setToastMessage(null), 3200);
  };

  // Generate or update the trip and its itinerary.
  const handlePlanSubmit = async (
    newPlan: TripPlan,
    pregeneratedDays?: ItineraryDay[]
  ) => {
    const updatedPlan: TripPlan = {
      ...newPlan,
      updatedAt: new Date().toISOString(),
    };

    setCurrentPlan(updatedPlan);

    let newItinerary = pregeneratedDays;

    if (!newItinerary || newItinerary.length === 0) {
      try {
        const response = await fetch('/api/itinerary/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ plan: updatedPlan }),
        });

        if (response.ok) {
          const data = await response.json();

          if (Array.isArray(data.days) && data.days.length > 0) {
            newItinerary = data.days as ItineraryDay[];
          }
        }
      } catch (error) {
        console.warn('API itinerary generation fallback:', error);
      }

      if (!newItinerary || newItinerary.length === 0) {
        newItinerary = generateItinerary(updatedPlan);
      }
    }

    setItinerary(newItinerary);

    setWeatherList(
      generateSampleWeather(
        updatedPlan.destination,
        updatedPlan.startDate,
        updatedPlan.durationDays
      )
    );

    setActiveTab('itinerary_map');
    showToast(
      `Generated ${updatedPlan.durationDays}-day itinerary for ${updatedPlan.destination}.`
    );
  };

  // Trip fields updated by AI without automatically regenerating the itinerary.
  const handleAIUpdatePlan = (changes: Partial<TripPlan>) => {
    setCurrentPlan((previous) => {
      const nextPlan = {
        ...previous,
        ...changes,
        updatedAt: new Date().toISOString(),
      };

      setWeatherList(
        generateSampleWeather(
          nextPlan.destination,
          nextPlan.startDate,
          nextPlan.durationDays
        )
      );

      return nextPlan;
    });

    setActiveTab(
      'totalBudget' in changes ? 'budget' : 'itinerary_map'
    );
    showToast('Trip details updated.');
  };

  // Expense handlers.
  const handleAddExpense = (newExpense: Expense) => {
    setExpenses((previous) => [newExpense, ...previous]);
    showToast(`Added expense: ${newExpense.title}`);
  };

  const handleUpdateExpense = (updatedExpense: Expense) => {
    setExpenses((previous) =>
      previous.map((expense) =>
        expense.id === updatedExpense.id ? updatedExpense : expense
      )
    );

    showToast(`Updated expense: ${updatedExpense.title}`);
  };

  const handleRemoveExpense = (id: string) => {
    setExpenses((previous) =>
      previous.filter((expense) => expense.id !== id)
    );

    showToast('Expense removed.');
  };

  const handleAIRemoveExpense = (id: string): boolean => {
    if (!expenses.some((expense) => expense.id === id)) {
      showToast('Could not remove expense: it was not found.');
      return false;
    }

    handleRemoveExpense(id);
    setActiveTab('budget');
    return true;
  };

  const handleAIAddExpense = (data: AIActionData): boolean => {
    const title =
      typeof data.title === 'string' ? data.title.trim() : '';

    const amount =
      typeof data.amount === 'number' ? data.amount : Number(data.amount);

    if (!title || !Number.isFinite(amount) || amount < 0) {
      showToast('Could not add expense: invalid title or amount.');
      return false;
    }

    const expenseCategories: Expense['category'][] = [
      'food',
      'transport',
      'accommodation',
      'tickets',
      'shopping',
      'other',
    ];
    const category =
      typeof data.category === 'string' &&
      expenseCategories.includes(
        data.category.toLowerCase() as Expense['category']
      )
        ? (data.category.toLowerCase() as Expense['category'])
        : 'other';
    const expense: Expense = {
      id: `exp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      title,
      amount,
      category,
      date:
        typeof data.date === 'string'
          ? data.date
          : currentPlan.startDate,
      paidBy:
        typeof data.paidBy === 'string'
          ? data.paidBy
          : currentPlan.travelerNames[0] || 'Me',
      splitType: 'equal',
      costNature: 'individual',
      notes: typeof data.notes === 'string' ? data.notes : undefined,
      createdAt: new Date().toISOString(),
    };

    handleAddExpense(expense);
    setActiveTab('budget');
    return true;
  };

  // Itinerary handlers.
  const handleUpdateItinerary = (updated: ItineraryDay[]) => {
    setItinerary(updated);
    showToast('Itinerary updated.');
  };

  const handleAIAddActivity = (
    dayNumber: number,
    data: AIActionData
  ): boolean => {
    const title =
      typeof data.title === 'string' ? data.title.trim() : '';

    if (!title) {
      showToast('Could not add activity: a title is required.');
      return false;
    }

    if (!itinerary.some((day) => day.dayNumber === dayNumber)) {
      showToast(`Day ${dayNumber} does not exist in this itinerary.`);
      return false;
    }

    const categories: Activity['category'][] = [
      'attraction',
      'food',
      'culture',
      'outdoor',
      'nightlife',
      'relaxation',
      'shopping',
    ];
    const timeSlots: Activity['timeSlot'][] = [
      'morning',
      'midday',
      'afternoon',
      'evening',
    ];
    const activity: Activity = {
      id: `activity-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      dayNumber,
      timeSlot:
        typeof data.timeSlot === 'string' &&
        timeSlots.includes(data.timeSlot as Activity['timeSlot'])
          ? (data.timeSlot as Activity['timeSlot'])
          : 'afternoon',
      timeString:
        typeof data.timeString === 'string' ? data.timeString : '',
      title,
      description:
        typeof data.description === 'string' ? data.description : '',
      category:
        typeof data.category === 'string' &&
        categories.includes(data.category as Activity['category'])
          ? (data.category as Activity['category'])
          : 'attraction',
      locationName:
        typeof data.locationName === 'string'
          ? data.locationName
          : title,
      address: typeof data.address === 'string' ? data.address : '',
      coordinates: { lat: 0, lng: 0 },
      estimatedCostPerPerson:
        typeof data.estimatedCostPerPerson === 'number'
          ? data.estimatedCostPerPerson
          : 0,
      crowdLevel: 'moderate',
      crowdPeakNote: '',
      crowdDataNotice: 'AI-generated estimate; verify locally before travel.',
      weatherSuitability: 'all-weather',
      isCompleted: false,
    };

    setItinerary((previous) =>
      previous.map((day) => {
        if (day.dayNumber !== dayNumber) return day;

        const activities = [...day.activities, activity];

        return {
          ...day,
          activities,
          estimatedCostTotal: calculateDayCost(
            activities,
            currentPlan.travelerCount
          ),
        };
      })
    );

    setActiveTab('itinerary_map');
    showToast(`Added activity: ${title}`);
    return true;
  };

  const handleAIRemoveActivity = (
    dayNumber: number,
    activityId?: string,
    activityTitle?: string
  ): boolean => {
    if (!activityId && !activityTitle) {
      showToast('Could not remove activity: no activity was specified.');
      return false;
    }

    const day = itinerary.find((item) => item.dayNumber === dayNumber);
    const activityExists = day?.activities.some((activity) =>
      activityId
        ? activity.id === activityId
        : activity.title.toLowerCase() === activityTitle!.toLowerCase()
    );

    if (!activityExists) {
      showToast(`Could not find an activity on day ${dayNumber}.`);
      return false;
    }

    setItinerary((previous) =>
      previous.map((day) => {
        if (day.dayNumber !== dayNumber) return day;

        const activities = day.activities.filter((activity) => {
          if (activityId) return activity.id !== activityId;

          return (
            activity.title.toLowerCase() !==
            activityTitle!.toLowerCase()
          );
        });

        return {
          ...day,
          activities,
          estimatedCostTotal: calculateDayCost(
            activities,
            currentPlan.travelerCount
          ),
        };
      })
    );

    setActiveTab('itinerary_map');
    showToast('Activity removed.');
    return true;
  };

  const handleAIUpdateActivity = (
    dayNumber: number,
    activityId: string | undefined,
    activityTitle: string | undefined,
    changes: AIActionData
  ): boolean => {
    if (!activityId && !activityTitle) {
      showToast('Could not update activity: no activity was specified.');
      return false;
    }

    const day = itinerary.find((item) => item.dayNumber === dayNumber);
    const activityExists = day?.activities.some((activity) =>
      activityId
        ? activity.id === activityId
        : activity.title.toLowerCase() === activityTitle!.toLowerCase()
    );

    if (!activityExists) {
      showToast(`Could not find an activity on day ${dayNumber}.`);
      return false;
    }

    setItinerary((previous) =>
      previous.map((day) => {
        if (day.dayNumber !== dayNumber) return day;

        const activities = day.activities.map((activity) => {
          const matches = activityId
            ? activity.id === activityId
            : activity.title.toLowerCase() ===
              activityTitle!.toLowerCase();

          if (!matches) return activity;

          return { ...activity, ...changes };
        });

        return {
          ...day,
          activities,
          estimatedCostTotal: calculateDayCost(
            activities,
            currentPlan.travelerCount
          ),
        };
      })
    );

    setActiveTab('itinerary_map');
    showToast('Activity updated.');
    return true;
  };

  const handleSwapRainAlternative = () => {
    const updated = itinerary.map((day) => {
      if (day.dayNumber !== 2) return day;

      const activities = day.activities.map((activity) => {
        if (!activity.indoorAlternative) return activity;

        return {
          ...activity,
          title: activity.indoorAlternative.title,
          description: activity.indoorAlternative.description,
          weatherSuitability: 'indoor' as const,
          estimatedCostPerPerson:
            activity.indoorAlternative.estimatedCostPerPerson,
          indoorAlternative: undefined,
        };
      });

      return {
        ...day,
        activities,
        estimatedCostTotal: calculateDayCost(
          activities,
          currentPlan.travelerCount
        ),
      };
    });

    setItinerary(updated);
    showToast('Day 2 indoor alternatives applied.');
  };

  const handleApplyOptimization = () => {
    const updated = itinerary.map((day) => {
      const activities = day.activities.map((activity) => {
        if (activity.estimatedCostPerPerson <= 20) {
          return activity;
        }

        return {
          ...activity,
          estimatedCostPerPerson: Math.round(
            activity.estimatedCostPerPerson * 0.75
          ),
        };
      });

      return {
        ...day,
        activities,
        estimatedCostTotal: calculateDayCost(
          activities,
          currentPlan.travelerCount
        ),
      };
    });

    setItinerary(updated);
    showToast('Activity cost estimates optimized.');
  };

  const budgetAnalysis = analyzeBudget(
    currentPlan,
    itinerary,
    expenses
  );

  const hasWeatherAlert = weatherList.some(
    (weather) => !weather.isOutdoorFriendly
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs sm:text-sm font-semibold px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 border border-slate-700 animate-fade-in">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      <Navbar
        currentPlan={currentPlan}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onToggleAIAgent={() => setIsAIAgentOpen((open) => !open)}
        isAIAgentOpen={isAIAgentOpen}
        hasBudgetOverrun={budgetAnalysis.isOverBudget}
        hasWeatherAlert={hasWeatherAlert}
        totalSpent={budgetAnalysis.actualSpent}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'home' && (
          <HomePage onNavigate={(tab) => setActiveTab(tab)} />
        )}

        {activeTab === 'plan' && (
          <div className="max-w-3xl mx-auto">
            <TripForm
              initialPlan={currentPlan}
              onSubmit={handlePlanSubmit}
              onCancel={() => setActiveTab('home')}
            />
          </div>
        )}

        {activeTab === 'itinerary_map' && (
          <ItineraryAndMapView
            plan={currentPlan}
            itinerary={itinerary}
            weatherList={weatherList}
            onUpdateItinerary={handleUpdateItinerary}
            onOpenLocalBenchmarks={() => {}}
            onSwapWithIndoor={handleSwapRainAlternative}
          />
        )}

        {activeTab === 'budget' && (
          <BudgetAndExpensesView
            plan={currentPlan}
            itinerary={itinerary}
            expenses={expenses}
            onAddExpense={handleAddExpense}
            onUpdateExpense={handleUpdateExpense}
            onRemoveExpense={handleRemoveExpense}
            onUpdatePlan={handlePlanSubmit}
          />
        )}

        {activeTab === 'weather_crowds' && (
          <WeatherAndCrowdsView
            plan={currentPlan}
            weatherList={weatherList}
            itinerary={itinerary}
          />
        )}
      </main>

      <AIAgentPanel
        plan={currentPlan}
        itinerary={itinerary}
        expenses={expenses}
        isOpen={isAIAgentOpen}
        onClose={() => setIsAIAgentOpen(false)}
        onApplyOptimization={handleApplyOptimization}
        onSwapRainAlternative={handleSwapRainAlternative}
        onViewBudget={() => {
          setActiveTab('budget');
          setIsAIAgentOpen(false);
        }}
        onRegenerateItinerary={(
          newPlan: TripPlan,
          reason?: string
        ) => {
          void handlePlanSubmit(newPlan);
          setIsAIAgentOpen(false);
          showToast(reason || 'Regenerating itinerary.');
        }}
        onUpdatePlan={handleAIUpdatePlan}
        onAddActivity={handleAIAddActivity}
        onRemoveActivity={handleAIRemoveActivity}
        onUpdateActivity={handleAIUpdateActivity}
        onAddExpense={handleAIAddExpense}
        onRemoveExpense={handleAIRemoveExpense}
      />

      <footer className="bg-white border-t border-slate-200 py-6 text-xs text-slate-500 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-indigo-600" />
            <span className="font-semibold text-slate-700">
              AI Travel Planning Agent
            </span>
          </div>

          <span className="text-slate-400">
            Accurate itineraries, verified maps &amp; budget tracking
          </span>
        </div>
      </footer>
    </div>
  );
}
