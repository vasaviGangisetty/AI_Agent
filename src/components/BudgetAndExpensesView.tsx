import React, { useState } from 'react';
import {
  DollarSign,
  Plus,
  Trash2,
  Edit2,
  X,
  AlertTriangle,
  AlertCircle,
  Users,
  User,
  Minus,
  CheckCircle2,
  TrendingDown,
  CreditCard,
  Scale,
} from 'lucide-react';
import { TripPlan, ItineraryDay, Expense, ExpenseCategory, TravelerType } from '../types/travel';

interface BudgetAndExpensesViewProps {
  plan: TripPlan;
  itinerary: ItineraryDay[];
  expenses: Expense[];
  onAddExpense: (expense: Expense) => void;
  onUpdateExpense: (expense: Expense) => void;
  onRemoveExpense: (id: string) => void;
  onUpdatePlan?: (updated: TripPlan) => void;
}

type BasicCategoryKey = 'transport' | 'accommodation' | 'food' | 'activities' | 'other';

const BASIC_CATEGORIES: { id: BasicCategoryKey; label: string; icon: string }[] = [
  { id: 'transport', label: 'Transport', icon: '🚇' },
  { id: 'accommodation', label: 'Accommodation', icon: '🏨' },
  { id: 'food', label: 'Food', icon: '🍜' },
  { id: 'activities', label: 'Activities', icon: '🎟️' },
  { id: 'other', label: 'Other', icon: '📦' },
];

export const BudgetAndExpensesView: React.FC<BudgetAndExpensesViewProps> = ({
  plan,
  itinerary,
  expenses,
  onAddExpense,
  onUpdateExpense,
  onRemoveExpense,
  onUpdatePlan,
}) => {
  const [showForm, setShowForm] = useState(false);
  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null);

  // Form fields
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<BasicCategoryKey>('food');
  const [costNature, setCostNature] = useState<'shared' | 'individual'>('shared');
  const [paidBy, setPaidBy] = useState(plan.travelerNames[0] || 'Traveler 1');
  const [assignedTo, setAssignedTo] = useState(plan.travelerNames[0] || 'Traveler 1');

  const travelersCount = Math.max(1, plan.travelerCount);
  const isGroup = plan.travelerType === 'group' && travelersCount > 1;
  const travelerList = plan.travelerNames.length >= travelersCount
    ? plan.travelerNames.slice(0, travelersCount)
    : Array.from({ length: travelersCount }, (_, i) => plan.travelerNames[i] || `Traveler ${i + 1}`);

  // 1. Calculations
  const totalBudget = plan.totalBudget;

  // Estimated itinerary total cost (calculated from scheduled days)
  const estimatedTotalCost = itinerary.reduce((sum, day) => sum + day.estimatedCostTotal, 0);
  const estimatedCostPerDay = Math.round(estimatedTotalCost / Math.max(1, plan.durationDays));
  const estimatedCostPerPerson = Math.round(estimatedTotalCost / travelersCount);

  // Actual recorded expenses
  const actualExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const remainingBudget = totalBudget - actualExpenses;

  // Budget progress and threshold warnings
  const percentUsed = totalBudget > 0 ? Math.min(100, Math.round((actualExpenses / totalBudget) * 100)) : 0;
  const isWarning80 = percentUsed >= 80 && percentUsed <= 100;
  const isOverBudget = actualExpenses > totalBudget;
  const overAmount = actualExpenses - totalBudget;

  // Category mapping
  const mapToBasicCategory = (expCat: ExpenseCategory): BasicCategoryKey => {
    if (expCat === 'transport') return 'transport';
    if (expCat === 'accommodation') return 'accommodation';
    if (expCat === 'food') return 'food';
    if (expCat === 'tickets') return 'activities';
    return 'other';
  };

  const mapFromBasicCategory = (basicCat: BasicCategoryKey): ExpenseCategory => {
    if (basicCat === 'activities') return 'tickets';
    return basicCat;
  };

  // Category breakdown calculations (Estimated vs Actual)
  const categoryStats: Record<BasicCategoryKey, { estimated: number; actual: number }> = {
    transport: { estimated: 0, actual: 0 },
    accommodation: { estimated: 0, actual: 0 },
    food: { estimated: 0, actual: 0 },
    activities: { estimated: 0, actual: 0 },
    other: { estimated: 0, actual: 0 },
  };

  // Sum estimated from itinerary
  itinerary.forEach((day) => {
    day.activities.forEach((act) => {
      const basicCat = act.category === 'food'
        ? 'food'
        : act.category === 'attraction' || act.category === 'culture'
        ? 'activities'
        : 'other';

      const actCost = act.estimatedCostPerPerson * travelersCount;
      categoryStats[basicCat].estimated += actCost;

      if (act.transportToNext) {
        categoryStats.transport.estimated += act.transportToNext.cost * travelersCount;
      }
    });
  });

  // Estimated accommodation benchmark if duration > 1
  if (plan.durationDays > 1) {
    categoryStats.accommodation.estimated = Math.round(
      (plan.travelStyle === 'budget' ? 60 : plan.travelStyle === 'luxury' ? 220 : 120) *
      (plan.durationDays - 1)
    );
  }

  // Sum actual from recorded expenses
  expenses.forEach((exp) => {
    const basicCat = mapToBasicCategory(exp.category);
    categoryStats[basicCat].actual += exp.amount;
  });

  // 2. Solo vs Group calculations
  // Shared expenses vs individual expenses
  const sharedExpensesTotal = expenses
    .filter((e) => e.costNature === 'shared' || (!e.costNature && e.splitType === 'equal'))
    .reduce((sum, e) => sum + e.amount, 0);

  const individualExpensesTotal = expenses
    .filter((e) => e.costNature === 'individual' || (!e.costNature && e.splitType === 'individual'))
    .reduce((sum, e) => sum + e.amount, 0);

  const sharedSharePerPerson = travelersCount > 0 ? sharedExpensesTotal / travelersCount : 0;

  // Member-by-member accounting
  const memberAccounts = travelerList.map((memberName) => {
    // Individual expenses specifically assigned to this member
    const memberIndividualExpenses = expenses
      .filter((e) => (e.costNature === 'individual' || e.splitType === 'individual') && (e.assignedTo === memberName || e.paidBy === memberName))
      .reduce((sum, e) => sum + e.amount, 0);

    const totalDue = sharedSharePerPerson + memberIndividualExpenses;

    // Total amount actually paid out-of-pocket by this member
    const amountPaid = expenses
      .filter((e) => e.paidBy === memberName)
      .reduce((sum, e) => sum + e.amount, 0);

    // Balance: paid - due. Positive means member is owed money; negative means member owes.
    const netBalance = amountPaid - totalDue;

    return {
      name: memberName,
      sharedShare: sharedSharePerPerson,
      individualCost: memberIndividualExpenses,
      totalDue,
      amountPaid,
      netBalance,
    };
  });

  // Traveler Type and Count updates
  const handleToggleTravelerType = (type: TravelerType) => {
    if (!onUpdatePlan) return;
    const count = type === 'solo' ? 1 : Math.max(2, travelersCount);
    onUpdatePlan({
      ...plan,
      travelerType: type,
      travelerCount: count,
      travelerNames: type === 'solo' ? ['Traveler'] : travelerList.length >= 2 ? travelerList : ['Alex', 'Jordan'],
    });
  };

  const handleUpdateCount = (newCount: number) => {
    if (!onUpdatePlan) return;
    const clamped = Math.max(1, newCount);
    const newType = clamped > 1 ? 'group' : 'solo';
    const names = Array.from({ length: clamped }, (_, i) => travelerList[i] || `Traveler ${i + 1}`);
    onUpdatePlan({
      ...plan,
      travelerCount: clamped,
      travelerType: newType,
      travelerNames: names,
    });
  };

  const handleOpenAdd = () => {
    setEditingExpenseId(null);
    setName('');
    setAmount('');
    setCategory('food');
    setCostNature('shared');
    setPaidBy(travelerList[0]);
    setAssignedTo(travelerList[0]);
    setShowForm(true);
  };

  const handleOpenEdit = (exp: Expense) => {
    setEditingExpenseId(exp.id);
    setName(exp.title);
    setAmount(exp.amount.toString());
    setCategory(mapToBasicCategory(exp.category));
    setCostNature(exp.costNature || (exp.splitType === 'individual' ? 'individual' : 'shared'));
    setPaidBy(exp.paidBy || travelerList[0]);
    setAssignedTo(exp.assignedTo || exp.paidBy || travelerList[0]);
    setShowForm(true);
  };

  const handleSaveExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(amount);
    if (!name.trim() || isNaN(num) || num < 0) return;

    if (editingExpenseId) {
      const existing = expenses.find((e) => e.id === editingExpenseId);
      if (existing) {
        onUpdateExpense({
          ...existing,
          title: name.trim(),
          amount: Math.round(num * 100) / 100,
          category: mapFromBasicCategory(category),
          costNature: isGroup ? costNature : 'individual',
          splitType: costNature === 'individual' ? 'individual' : 'equal',
          paidBy: isGroup ? paidBy : 'Traveler',
          assignedTo: costNature === 'individual' ? assignedTo : undefined,
        });
      }
    } else {
      const newExp: Expense = {
        id: `exp-${Date.now()}`,
        title: name.trim(),
        amount: Math.round(num * 100) / 100,
        category: mapFromBasicCategory(category),
        costNature: isGroup ? costNature : 'individual',
        splitType: costNature === 'individual' ? 'individual' : 'equal',
        paidBy: isGroup ? paidBy : 'Traveler',
        assignedTo: costNature === 'individual' ? assignedTo : undefined,
        date: new Date().toISOString().split('T')[0],
        createdAt: new Date().toISOString(),
      };
      onAddExpense(newExp);
    }

    setShowForm(false);
    setEditingExpenseId(null);
    setName('');
    setAmount('');
  };

  return (
    <div className="space-y-6">
      {/* Travel Party Dynamic Controller */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
            {isGroup ? <Users className="w-5 h-5" /> : <User className="w-5 h-5" />}
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
              {isGroup ? `Group Travel (${travelersCount} Members)` : 'Solo Travel (1 Person)'}
            </h2>
            <p className="text-xs text-slate-500">
              {isGroup
                ? 'Shared expenses split among members; personal expenses charged individually.'
                : 'All costs calculated for 1 individual traveler.'}
            </p>
          </div>
        </div>

        {/* Solo / Group Toggle & Count Stepper */}
        {onUpdatePlan && (
          <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
            <div className="flex p-0.5 rounded-xl bg-slate-100 border border-slate-200 text-xs">
              <button
                type="button"
                onClick={() => handleToggleTravelerType('solo')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                  !isGroup
                    ? 'bg-white text-indigo-700 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Solo
              </button>
              <button
                type="button"
                onClick={() => handleToggleTravelerType('group')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                  isGroup
                    ? 'bg-white text-indigo-700 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Group
              </button>
            </div>

            {isGroup && (
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-xl text-xs">
                <span className="text-slate-500 font-medium">Travelers:</span>
                <button
                  onClick={() => handleUpdateCount(travelersCount - 1)}
                  className="w-5 h-5 rounded bg-white hover:bg-slate-200 border border-slate-200 flex items-center justify-center font-bold text-slate-700 cursor-pointer"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <strong className="text-xs font-bold text-slate-900 px-1">{travelersCount}</strong>
                <button
                  onClick={() => handleUpdateCount(travelersCount + 1)}
                  className="w-5 h-5 rounded bg-white hover:bg-slate-200 border border-slate-200 flex items-center justify-center font-bold text-slate-700 cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 4 Primary Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Budget */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 block uppercase tracking-wider">
            Total Budget
          </span>
          <strong className="text-2xl font-black text-slate-900 block mt-1">
            ${totalBudget.toLocaleString()}
          </strong>
          <span className="text-[11px] text-slate-400 mt-0.5 block">
            {isGroup ? `$${Math.round(totalBudget / travelersCount).toLocaleString()} / person` : 'Allocated trip budget'}
          </span>
        </div>

        {/* Card 2: Estimated Total Cost */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 block uppercase tracking-wider">
            Estimated Total Cost
          </span>
          <strong className="text-2xl font-black text-slate-800 block mt-1">
            ${estimatedTotalCost.toLocaleString()}
          </strong>
          <span className="text-[11px] text-slate-400 mt-0.5 block">
            {isGroup
              ? `~$${estimatedCostPerPerson.toLocaleString()} per member`
              : `~$${estimatedCostPerDay.toLocaleString()} / day estimate`}
          </span>
        </div>

        {/* Card 3: Actual Expenses */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 block uppercase tracking-wider">
            Actual Expenses
          </span>
          <strong className="text-2xl font-black text-amber-600 block mt-1">
            ${actualExpenses.toLocaleString()}
          </strong>
          <span className="text-[11px] text-slate-400 mt-0.5 block">
            {isGroup
              ? `$${Math.round(sharedExpensesTotal).toLocaleString()} shared • $${Math.round(individualExpensesTotal).toLocaleString()} individual`
              : `${expenses.length} recorded receipts`}
          </span>
        </div>

        {/* Card 4: Remaining Budget */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 block uppercase tracking-wider">
            Remaining Budget
          </span>
          <strong
            className={`text-2xl font-black block mt-1 ${
              remainingBudget >= 0 ? 'text-emerald-600' : 'text-rose-600'
            }`}
          >
            ${remainingBudget.toLocaleString()}
          </strong>
          <span className="text-[11px] text-slate-400 mt-0.5 block">
            {remainingBudget >= 0
              ? isGroup
                ? `$${Math.round(remainingBudget / travelersCount).toLocaleString()} / person left`
                : 'Available balance'
              : `Exceeded by $${Math.abs(remainingBudget).toLocaleString()}`}
          </span>
        </div>
      </div>

      {/* Progress Bar & Warning / Alert Notification */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
        <div className="flex items-center justify-between text-xs font-semibold">
          <span className="text-slate-700">Budget Usage</span>
          <span className={isOverBudget ? 'text-rose-600 font-bold' : isWarning80 ? 'text-amber-600 font-bold' : 'text-slate-600'}>
            ${actualExpenses.toLocaleString()} of ${totalBudget.toLocaleString()} ({percentUsed}%)
          </span>
        </div>

        {/* Bar */}
        <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden">
          <div
            className={`h-full transition-all duration-500 rounded-full ${
              isOverBudget
                ? 'bg-rose-500'
                : isWarning80
                ? 'bg-amber-500'
                : 'bg-indigo-600'
            }`}
            style={{ width: `${Math.min(100, percentUsed)}%` }}
          />
        </div>

        {/* Warning Banner at 80% */}
        {isWarning80 && !isOverBudget && (
          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>Warning:</strong> Spending has reached {percentUsed}% of your budget limit. Consider monitoring non-essential purchases.
            </span>
          </div>
        )}

        {/* Alert Banner when exceeding 100% */}
        {isOverBudget && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-900 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>
              <strong>Budget Alert:</strong> Spending has exceeded your total budget by ${overAmount.toLocaleString()} ({percentUsed}% utilized).
            </span>
          </div>
        )}
      </div>

      {/* Group Travel: Member Breakdown and Settlement Balances */}
      {isGroup && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Scale className="w-4 h-4 text-indigo-600" /> Member Cost Breakdown & Settlements
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Shared costs ($ {sharedExpensesTotal.toLocaleString()}) are split equally (${Math.round(sharedSharePerPerson).toLocaleString()}/each). Personal costs are assigned individually.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {memberAccounts.map((member) => (
              <div
                key={member.name}
                className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-2">
                    <span className="font-bold text-slate-900 text-sm truncate">{member.name}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        member.netBalance > 0
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : member.netBalance < 0
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}
                    >
                      {member.netBalance > 0
                        ? `Owed $${Math.round(member.netBalance).toLocaleString()}`
                        : member.netBalance < 0
                        ? `Owes $${Math.round(Math.abs(member.netBalance)).toLocaleString()}`
                        : 'Settled'}
                    </span>
                  </div>

                  <div className="space-y-1 text-xs text-slate-600">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Equal Shared Share:</span>
                      <span>${Math.round(member.sharedShare).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Personal Expenses:</span>
                      <span>${Math.round(member.individualCost).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between font-bold text-slate-800 pt-1 border-t border-slate-200">
                      <span>Total Obligation:</span>
                      <span>${Math.round(member.totalDue).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-200 flex justify-between text-xs">
                  <span className="text-slate-500">Paid so far:</span>
                  <strong className="text-slate-900">${Math.round(member.amountPaid).toLocaleString()}</strong>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Category Breakdown (Transport, Accommodation, Food, Activities, Other) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
          Expense Breakdown by Category
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {BASIC_CATEGORIES.map((cat) => {
            const stats = categoryStats[cat.id];
            const catActualPct = actualExpenses > 0 ? Math.round((stats.actual / actualExpenses) * 100) : 0;

            return (
              <div
                key={cat.id}
                className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-1.5 mb-2">
                    <span className="text-base">{cat.icon}</span>
                    <strong className="text-xs font-bold text-slate-900">{cat.label}</strong>
                  </div>

                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between text-slate-500">
                      <span>Estimated:</span>
                      <span className="font-semibold text-slate-700">${stats.estimated.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-slate-500">
                      <span>Actual Spend:</span>
                      <span className="font-bold text-slate-900">${stats.actual.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Share of spend:</span>
                  <span className="font-bold text-indigo-600">{catActualPct}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Expenses List & Add/Edit Management */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Recorded Expense Items ({expenses.length})
            </h3>
            <p className="text-xs text-slate-500">
              Add individual or shared receipts. Group balances update automatically.
            </p>
          </div>

          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Add Expense</span>
          </button>
        </div>

        {/* Add / Edit Expense Form Modal */}
        {showForm && (
          <div className="bg-white rounded-2xl border border-indigo-200 p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h4 className="text-sm font-bold text-slate-900">
                {editingExpenseId ? 'Edit Expense' : 'Add New Expense'}
              </h4>
              <button
                onClick={() => setShowForm(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveExpense} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Expense Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Shared Hotel, Subway pass, Ramen"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Amount ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as BasicCategoryKey)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {BASIC_CATEGORIES.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.icon} {c.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Group specific cost distribution */}
              {isGroup && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Expense Type
                    </label>
                    <select
                      value={costNature}
                      onChange={(e) => setCostNature(e.target.value as 'shared' | 'individual')}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="shared">Shared (Split equally among group)</option>
                      <option value="individual">Individual (Charged to 1 member)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Paid By
                    </label>
                    <select
                      value={paidBy}
                      onChange={(e) => setPaidBy(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      {travelerList.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>

                  {costNature === 'individual' && (
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Charged To
                      </label>
                      <select
                        value={assignedTo}
                        onChange={(e) => setAssignedTo(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        {travelerList.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </>
              )}

              <div className="sm:col-span-3 flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors cursor-pointer"
                >
                  {editingExpenseId ? 'Update Expense' : 'Save Expense'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Expenses List */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs divide-y divide-slate-100">
          {expenses.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              No recorded expenses yet. Click "Add Expense" above to record receipts.
            </div>
          ) : (
            expenses.map((exp) => {
              const basicCat = BASIC_CATEGORIES.find((c) => c.id === mapToBasicCategory(exp.category));
              const isShared = exp.costNature === 'shared' || (!exp.costNature && exp.splitType === 'equal');

              return (
                <div
                  key={exp.id}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/60 transition-colors"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <span className="text-lg p-2 rounded-xl bg-slate-100 shrink-0">
                      {basicCat?.icon || '📦'}
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm font-bold text-slate-900 truncate">{exp.title}</h4>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 capitalize">
                          {basicCat?.label || exp.category}
                        </span>
                        {isGroup && (
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                              isShared
                                ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                                : 'bg-purple-50 text-purple-700 border border-purple-200'
                            }`}
                          >
                            {isShared ? 'Shared' : `Individual (${exp.assignedTo || exp.paidBy})`}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {exp.date} {isGroup && exp.paidBy ? `• Paid by ${exp.paidBy}` : ''}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                    <strong className="text-base font-black text-slate-900">
                      ${exp.amount.toLocaleString()}
                    </strong>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEdit(exp)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
                        title="Edit expense"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => onRemoveExpense(exp.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Delete expense"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
