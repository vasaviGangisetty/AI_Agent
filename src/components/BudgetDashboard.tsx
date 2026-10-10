import React, { useState } from 'react';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Users,
  User,
  PieChart,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Wallet,
  Calendar,
  Layers,
  CheckCircle2,
  Clock,
  Scale,
  Plus,
  Minus,
  HelpCircle,
} from 'lucide-react';
import { TripPlan, ItineraryDay, Expense, ExpenseCategory } from '../types/travel';
import { analyzeBudget } from '../services/aiAgentEngine';

interface BudgetDashboardProps {
  plan: TripPlan;
  itinerary: ItineraryDay[];
  expenses: Expense[];
  onApplyOptimization: () => void;
  onOpenAddExpense: () => void;
  onOpenGroupSplit: () => void;
  onUpdateGroupSize?: (newCount: number) => void;
}

const CATEGORY_COLORS: Record<ExpenseCategory, { bg: string; text: string; bar: string }> = {
  food: { bg: 'bg-amber-100 text-amber-800 border-amber-200', text: 'text-amber-700', bar: 'bg-amber-500' },
  transport: { bg: 'bg-blue-100 text-blue-800 border-blue-200', text: 'text-blue-700', bar: 'bg-blue-500' },
  accommodation: { bg: 'bg-purple-100 text-purple-800 border-purple-200', text: 'text-purple-700', bar: 'bg-purple-500' },
  tickets: { bg: 'bg-emerald-100 text-emerald-800 border-emerald-200', text: 'text-emerald-700', bar: 'bg-emerald-500' },
  shopping: { bg: 'bg-pink-100 text-pink-800 border-pink-200', text: 'text-pink-700', bar: 'bg-pink-500' },
  other: { bg: 'bg-slate-100 text-slate-800 border-slate-200', text: 'text-slate-700', bar: 'bg-slate-500' },
};

export const BudgetDashboard: React.FC<BudgetDashboardProps> = ({
  plan,
  itinerary,
  expenses,
  onApplyOptimization,
  onOpenAddExpense,
  onOpenGroupSplit,
  onUpdateGroupSize,
}) => {
  // View mode: 'group' shows group totals; 'per-person' shows individual share
  const [viewMode, setViewMode] = useState<'group' | 'per-person'>(
    plan.travelerType === 'solo' ? 'per-person' : 'group'
  );
  const [activeDayFilter, setActiveDayFilter] = useState<number | 'all'>('all');

  const analysis = analyzeBudget(plan, itinerary, expenses);
  const travelers = Math.max(1, plan.travelerCount);

  // Group actual expenses by category
  const categoryTotals: Record<ExpenseCategory, number> = {
    food: 0,
    transport: 0,
    accommodation: 0,
    tickets: 0,
    shopping: 0,
    other: 0,
  };

  expenses.forEach((e) => {
    categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
  });

  // Calculate planned expenses by category across all itinerary activities
  const plannedCategoryTotals: Record<ExpenseCategory, number> = {
    food: 0,
    transport: 0,
    accommodation: 0,
    tickets: 0,
    shopping: 0,
    other: 0,
  };

  itinerary.forEach((day) => {
    day.activities.forEach((act) => {
      const catKey: ExpenseCategory =
        act.category === 'food'
          ? 'food'
          : act.category === 'attraction' || act.category === 'culture'
          ? 'tickets'
          : act.category === 'shopping'
          ? 'shopping'
          : 'other';

      const actCost = act.costType === 'shared_group'
        ? (act.sharedGroupCost || act.estimatedCostPerPerson * travelers)
        : act.estimatedCostPerPerson * travelers;

      plannedCategoryTotals[catKey] += actCost;
      if (act.transportToNext) {
        plannedCategoryTotals.transport += act.transportToNext.cost * travelers;
      }
    });
  });

  const totalSpent = analysis.actualSpent;
  const isOver = totalSpent > plan.totalBudget;
  const remaining = plan.totalBudget - totalSpent;
  const percentUsed =
    plan.totalBudget > 0 ? Math.min(100, Math.round((totalSpent / plan.totalBudget) * 100)) : 0;
  const isCaution = percentUsed >= 80 && percentUsed <= 100;

  // Multiplier for display: 1 if group, 1/travelers if per-person
  const displayFactor = viewMode === 'per-person' ? 1 / travelers : 1;

  // Daily target vs actual burn rate
  const dailyBudgetPerPerson = Math.round(plan.totalBudget / (travelers * Math.max(1, plan.durationDays)));
  const dailySpentPerPerson = Math.round(totalSpent / (travelers * Math.max(1, plan.durationDays)));

  // Filter activities for activity-based breakdown
  const visibleDays = itinerary.filter(
    (d) => activeDayFilter === 'all' || d.dayNumber === activeDayFilter
  );

  return (
    <div className="space-y-6">
      {/* Top Banner with Clear View Mode & Group Size Controls */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
              Transparent Financial Analytics
            </span>
            <span className="text-xs text-slate-300 font-medium">
              {plan.travelerType === 'solo' ? 'Solo Traveler Calculation' : `Group Plan (${travelers} Travelers)`}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
            Trip Budget & Expense Pacing
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Clearly separates planned budget limits, estimated itinerary costs, and actual recorded receipts.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
          {/* Interactive Group Size Stepper */}
          {plan.travelerType === 'group' && onUpdateGroupSize && (
            <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-xl border border-white/20 text-xs">
              <span className="text-slate-300 font-semibold">Group Size:</span>
              <button
                onClick={() => onUpdateGroupSize(Math.max(2, travelers - 1))}
                className="w-5 h-5 rounded bg-white/20 hover:bg-white/30 flex items-center justify-center font-bold text-white transition-colors cursor-pointer"
                title="Decrease traveler count"
              >
                <Minus className="w-3 h-3" />
              </button>
              <strong className="text-sm font-black text-white px-1">{travelers}</strong>
              <button
                onClick={() => onUpdateGroupSize(travelers + 1)}
                className="w-5 h-5 rounded bg-white/20 hover:bg-white/30 flex items-center justify-center font-bold text-white transition-colors cursor-pointer"
                title="Increase traveler count"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
          )}

          {/* Solo vs Group Toggle Switch */}
          {plan.travelerType === 'group' && (
            <div className="flex items-center gap-1 bg-white/10 p-1 rounded-xl border border-white/20">
              <button
                onClick={() => setViewMode('group')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'group'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Group Total</span>
              </button>
              <button
                onClick={() => setViewMode('per-person')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'per-person'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>Per Person</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 80% Caution Alert Banner */}
      {isCaution && !isOver && (
        <div className="rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 p-5 text-white shadow-md flex items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-white/20 shrink-0">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg">Budget Warning: 80% Allocated</h3>
              <p className="text-xs sm:text-sm text-amber-100 mt-0.5">
                You have utilized <strong>{percentUsed}%</strong> of your total budget. ${Math.round(remaining * displayFactor).toLocaleString()} remains for incidental expenses.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 100%+ Overrun Alert Banner */}
      {isOver && (
        <div className="rounded-2xl bg-gradient-to-r from-rose-500 to-red-600 p-5 text-white shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-white/20 shrink-0">
              <ShieldAlert className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-lg">Budget Overrun Detected</h3>
              <p className="text-sm text-rose-100 mt-0.5">
                Actual spending exceeds your target budget by{' '}
                <strong>${Math.round((totalSpent - plan.totalBudget) * displayFactor).toLocaleString()}</strong>{' '}
                {viewMode === 'per-person' ? 'per person' : 'in total'}.
              </p>
            </div>
          </div>

          <button
            onClick={onApplyOptimization}
            className="px-4 py-2.5 rounded-xl bg-white text-rose-700 hover:bg-rose-50 font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-rose-600" />
            <span>AI Rebalance & Save</span>
          </button>
        </div>
      )}

      {/* 4 Primary Summary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Budget Card */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              1. Planned Budget Limit
            </span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              ${Math.round(plan.totalBudget * displayFactor).toLocaleString()}
            </span>
            <span className="text-xs text-slate-400 block mt-1">
              {viewMode === 'per-person'
                ? `1 of ${travelers} travelers ($${dailyBudgetPerPerson}/day target)`
                : `Across ${plan.durationDays} days for ${travelers} traveler${travelers > 1 ? 's' : ''}`}
            </span>
          </div>
        </div>

        {/* Estimated Itinerary Cost */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              2. Estimated Itinerary
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              ${Math.round(analysis.plannedItineraryCost * displayFactor).toLocaleString()}
            </span>
            <span className="text-xs text-slate-400 block mt-1">
              Sum of activities & local transit
            </span>
          </div>
        </div>

        {/* Actual Spent Recorded */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              3. Actual Spent (Receipts)
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              ${Math.round(totalSpent * displayFactor).toLocaleString()}
            </span>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="text-xs font-semibold text-slate-700">{percentUsed}% utilized</span>
              <span className="text-xs text-slate-400">({expenses.length} receipts)</span>
            </div>
          </div>
        </div>

        {/* Remaining Balance */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              4. Remaining Balance
            </span>
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                remaining >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
              }`}
            >
              {remaining >= 0 ? <CheckCircle className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            </div>
          </div>
          <div className="mt-3">
            <span
              className={`text-2xl sm:text-3xl font-extrabold ${
                remaining >= 0 ? 'text-emerald-600' : 'text-rose-600'
              }`}
            >
              {remaining < 0
                ? `-$${Math.abs(Math.round(remaining * displayFactor)).toLocaleString()}`
                : `$${Math.round(remaining * displayFactor).toLocaleString()}`}
            </span>
            <span className="text-xs text-slate-400 block mt-1">
              {remaining >= 0 ? 'Available spending buffer' : 'Over budget allocation'}
            </span>
          </div>
        </div>
      </div>

      {/* Progress & Utilization Bar with Daily Burn Rate */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-bold text-slate-900 text-base">Budget Allocation Gauge</h3>
            <p className="text-xs text-slate-500">
              Daily burn rate: ${dailySpentPerPerson}/day spent vs ${dailyBudgetPerPerson}/day target ({viewMode === 'per-person' ? 'Per-person rate' : 'Total group rate'}).
            </p>
          </div>
          <div className="flex items-center gap-3">
            {plan.travelerType === 'group' && (
              <button
                onClick={onOpenGroupSplit}
                className="text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3.5 py-2 rounded-xl border border-indigo-200 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Scale className="w-3.5 h-3.5" />
                <span>Group Cost Settlements</span>
              </button>
            )}
            <button
              onClick={onOpenAddExpense}
              className="text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 px-3.5 py-2 rounded-xl shadow-xs transition-colors flex items-center gap-1 cursor-pointer"
            >
              <span>+ Record New Expense</span>
            </button>
          </div>
        </div>

        {/* Progress Track */}
        <div className="w-full bg-slate-100 rounded-full h-4 overflow-hidden p-0.5 border border-slate-200">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              percentUsed > 95
                ? 'bg-rose-500'
                : percentUsed >= 80
                ? 'bg-amber-500'
                : 'bg-gradient-to-r from-emerald-500 to-indigo-600'
            }`}
            style={{ width: `${Math.min(100, Math.max(2, percentUsed))}%` }}
          />
        </div>

        <div className="flex justify-between text-xs text-slate-600 font-medium">
          <span>Spent: ${Math.round(totalSpent * displayFactor).toLocaleString()}</span>
          <span>{percentUsed}% Used</span>
          <span>Target: ${Math.round(plan.totalBudget * displayFactor).toLocaleString()}</span>
        </div>
      </div>

      {/* Planned vs Actual by Category */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div>
          <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
            <PieChart className="w-4 h-4 text-indigo-600" /> Category Breakdown: Planned vs Actual
          </h3>
          <p className="text-xs text-slate-500">
            Compare estimated activity allocations against actual receipts logged.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {(
            [
              { id: 'food', label: 'Food & Dining', icon: '🍜' },
              { id: 'transport', label: 'Transport', icon: '🚇' },
              { id: 'tickets', label: 'Tickets & Attractions', icon: '🎟️' },
              { id: 'accommodation', label: 'Accommodation', icon: '🏨' },
              { id: 'shopping', label: 'Shopping & Souvenirs', icon: '🛍️' },
              { id: 'other', label: 'Other Miscellaneous', icon: '📦' },
            ] as const
          ).map((cat) => {
            const actualAmt = Math.round(categoryTotals[cat.id] * displayFactor);
            const plannedAmt = Math.round(plannedCategoryTotals[cat.id] * displayFactor);
            const styling = CATEGORY_COLORS[cat.id];

            return (
              <div
                key={cat.id}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xl">{cat.icon}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${styling.bg}`}>
                      {cat.label}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-4 pt-2 border-t border-slate-200/80">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Planned</span>
                      <span className="text-base font-bold text-slate-800">${plannedAmt.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Actual Spent</span>
                      <span className="text-base font-extrabold text-slate-900">${actualAmt.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Mini bar */}
                <div className="mt-3 w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                  <div
                    className={`h-full ${styling.bar}`}
                    style={{
                      width: `${Math.min(100, plannedAmt > 0 ? (actualAmt / plannedAmt) * 100 : 0)}%`,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Activity-Based Itinerary Expense Breakdown */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-600" /> Itemized Itinerary Expense Breakdown
            </h3>
            <p className="text-xs text-slate-500">
              Costs for each scheduled attraction and transfer, separated by per-person vs shared group outlay.
            </p>
          </div>

          {/* Day Filter */}
          <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
            <button
              onClick={() => setActiveDayFilter('all')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 cursor-pointer ${
                activeDayFilter === 'all'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All Days
            </button>
            {itinerary.map((d) => (
              <button
                key={d.dayNumber}
                onClick={() => setActiveDayFilter(d.dayNumber)}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 cursor-pointer ${
                  activeDayFilter === d.dayNumber
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Day {d.dayNumber}
              </button>
            ))}
          </div>
        </div>

        {/* Table of Activities with Cost breakdown */}
        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[11px] font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Day & Slot</th>
                <th className="py-3 px-4">Activity Title</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4 text-right">Per Person</th>
                <th className="py-3 px-4 text-right">Group Total</th>
                <th className="py-3 px-4 text-center">Receipt Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {visibleDays.flatMap((day) =>
                day.activities.map((act) => {
                  const hasReceipt = expenses.some(
                    (e) =>
                      e.title.toLowerCase().includes(act.title.toLowerCase().slice(0, 10)) ||
                      e.activityId === act.id
                  );

                  return (
                    <tr key={act.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-semibold text-slate-600">
                        <span className="font-bold text-indigo-700">Day {act.dayNumber}</span> • {act.timeSlot}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900">{act.title}</td>
                      <td className="py-3 px-4">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                          {act.category}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-semibold text-slate-700">
                        {act.estimatedCostPerPerson === 0 ? 'Free' : `$${act.estimatedCostPerPerson}`}
                      </td>
                      <td className="py-3 px-4 text-right font-black text-slate-900">
                        {act.estimatedCostPerPerson === 0 ? 'Free' : `$${act.estimatedCostPerPerson * travelers}`}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {hasReceipt ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Logged
                          </span>
                        ) : (
                          <span className="text-[11px] font-medium text-slate-400 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-md">
                            Planned
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
