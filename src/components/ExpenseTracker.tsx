import React, { useState } from 'react';
import {
  Plus,
  Trash2,
  Edit2,
  Search,
  Filter,
  DollarSign,
  Download,
  Users,
  User,
  Calendar,
  Tag,
  Receipt,
  FileText,
  X,
  Sparkles,
  Building,
  CreditCard,
  CheckCircle2,
} from 'lucide-react';
import { Expense, ExpenseCategory, TripPlan } from '../types/travel';

interface ExpenseTrackerProps {
  plan: TripPlan;
  expenses: Expense[];
  onAddExpense: (expense: Expense) => void;
  onUpdateExpense: (expense: Expense) => void;
  onRemoveExpense: (id: string) => void;
  onSeedSampleExpenses: () => void;
}

const CATEGORY_META: Record<
  ExpenseCategory,
  { label: string; icon: string; bg: string; text: string }
> = {
  food: { label: 'Food & Dining', icon: '🍜', bg: 'bg-amber-50 border-amber-200', text: 'text-amber-800' },
  transport: { label: 'Transportation', icon: '🚇', bg: 'bg-blue-50 border-blue-200', text: 'text-blue-800' },
  accommodation: { label: 'Accommodation', icon: '🏨', bg: 'bg-purple-50 border-purple-200', text: 'text-purple-800' },
  tickets: { label: 'Tickets & Entry', icon: '🎟️', bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-800' },
  shopping: { label: 'Shopping', icon: '🛍️', bg: 'bg-pink-50 border-pink-200', text: 'text-pink-800' },
  other: { label: 'Other', icon: '📦', bg: 'bg-slate-50 border-slate-200', text: 'text-slate-800' },
};

export const ExpenseTracker: React.FC<ExpenseTrackerProps> = ({
  plan,
  expenses,
  onAddExpense,
  onUpdateExpense,
  onRemoveExpense,
  onSeedSampleExpenses,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'amount-high' | 'amount-low'>('newest');

  // Form fields
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState<number | ''>('');
  const [category, setCategory] = useState<ExpenseCategory>('food');
  const [date, setDate] = useState(plan.startDate || new Date().toISOString().split('T')[0]);
  const [paidBy, setPaidBy] = useState(plan.travelerNames?.[0] || 'You');
  const [splitType, setSplitType] = useState<'equal' | 'individual'>('equal');
  const [costNature, setCostNature] = useState<'shared' | 'individual'>('shared');
  const [notes, setNotes] = useState('');

  const handleOpenAdd = () => {
    setEditingExpenseId(null);
    setTitle('');
    setAmount('');
    setCategory('food');
    setDate(plan.startDate || new Date().toISOString().split('T')[0]);
    setPaidBy(plan.travelerNames?.[0] || 'You');
    setSplitType('equal');
    setCostNature('shared');
    setNotes('');
    setShowModal(true);
  };

  const handleOpenEdit = (exp: Expense) => {
    setEditingExpenseId(exp.id);
    setTitle(exp.title);
    setAmount(exp.amount);
    setCategory(exp.category);
    setDate(exp.date);
    setPaidBy(exp.paidBy);
    setSplitType(exp.splitType);
    setCostNature(exp.costNature || (exp.splitType === 'equal' ? 'shared' : 'individual'));
    setNotes(exp.notes || '');
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !amount || Number(amount) <= 0) return;

    if (editingExpenseId) {
      const updatedExpense: Expense = {
        id: editingExpenseId,
        title: title.trim(),
        amount: Number(amount),
        category,
        date,
        paidBy,
        splitType: plan.travelerType === 'solo' ? 'individual' : splitType,
        costNature: plan.travelerType === 'solo' ? 'individual' : costNature,
        notes: notes.trim(),
        createdAt: new Date().toISOString(),
      };
      onUpdateExpense(updatedExpense);
    } else {
      const newExpense: Expense = {
        id: `exp-${Date.now()}`,
        title: title.trim(),
        amount: Number(amount),
        category,
        date,
        paidBy,
        splitType: plan.travelerType === 'solo' ? 'individual' : splitType,
        costNature: plan.travelerType === 'solo' ? 'individual' : costNature,
        notes: notes.trim(),
        createdAt: new Date().toISOString(),
      };
      onAddExpense(newExpense);
    }

    setShowModal(false);
  };

  // Filter & sort logic
  const filteredExpenses = expenses
    .filter((exp) => {
      const matchCat = categoryFilter === 'all' || exp.category === categoryFilter;
      const matchSearch =
        exp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        exp.notes?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        exp.paidBy.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'amount-high') return b.amount - a.amount;
      if (sortBy === 'amount-low') return a.amount - b.amount;
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });

  const totalFiltered = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);

  // Group vs individual breakdown
  const sharedTotal = expenses
    .filter((e) => e.costNature === 'shared' || e.splitType === 'equal')
    .reduce((s, e) => s + e.amount, 0);

  const individualTotal = expenses
    .filter((e) => e.costNature === 'individual' || e.splitType === 'individual')
    .reduce((s, e) => s + e.amount, 0);

  // Export to CSV
  const handleExportCSV = () => {
    const headers = ['Title', 'Category', 'Amount (USD)', 'Date', 'Paid By', 'Nature', 'Split Type', 'Notes'];
    const rows = expenses.map((e) => [
      `"${e.title.replace(/"/g, '""')}"`,
      e.category,
      e.amount,
      e.date,
      `"${e.paidBy}"`,
      e.costNature || 'shared',
      e.splitType,
      `"${(e.notes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${plan.destination.toLowerCase()}_trip_expenses.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header & Quick Action Row */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-bold text-slate-900 tracking-tight">Trip Expense Receipts</h3>
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
              {expenses.length} Records
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Log, edit, and organize payments. Distinguishes shared group items from personal individual expenses.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {expenses.length === 0 && (
            <button
              onClick={onSeedSampleExpenses}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Load Sample Receipts</span>
            </button>
          )}

          {expenses.length > 0 && (
            <button
              onClick={handleExportCSV}
              className="px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Download CSV spreadsheet"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Export CSV</span>
            </button>
          )}

          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/20 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Expense</span>
          </button>
        </div>
      </div>

      {/* Solo vs Group Expense Structure Overview Card */}
      {plan.travelerType === 'group' && plan.travelerCount > 1 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-indigo-50/70 p-4 rounded-xl border border-indigo-200">
            <span className="text-xs font-semibold text-indigo-800 block">Shared Group Expenses</span>
            <span className="text-xl font-black text-indigo-950 mt-1 block">
              ${sharedTotal.toLocaleString()}
            </span>
            <span className="text-[11px] text-indigo-700 mt-0.5 block">
              Hotel rooms, rental rides (${Math.round(sharedTotal / plan.travelerCount)} / person)
            </span>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <span className="text-xs font-semibold text-slate-700 block">Individual Personal Expenses</span>
            <span className="text-xl font-black text-slate-900 mt-1 block">
              ${individualTotal.toLocaleString()}
            </span>
            <span className="text-[11px] text-slate-500 mt-0.5 block">
              Private meals, snacks, souvenirs
            </span>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <span className="text-xs font-semibold text-slate-700 block">Total Combined Outlay</span>
            <span className="text-xl font-black text-slate-900 mt-1 block">
              ${(sharedTotal + individualTotal).toLocaleString()}
            </span>
            <span className="text-[11px] text-slate-500 mt-0.5 block">
              Across {plan.travelerCount} active travelers
            </span>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search expenses, notes, payers..."
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Sort By */}
          <div className="flex items-center gap-2 self-end md:self-auto w-full md:w-auto justify-end">
            <span className="text-xs text-slate-500 font-medium">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="newest">Date (Newest first)</option>
              <option value="amount-high">Amount (Highest first)</option>
              <option value="amount-low">Amount (Lowest first)</option>
            </select>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <button
            onClick={() => setCategoryFilter('all')}
            className={`px-3 py-1.5 rounded-xl font-medium transition-colors shrink-0 ${
              categoryFilter === 'all'
                ? 'bg-slate-900 text-white font-semibold'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Categories
          </button>
          {(Object.keys(CATEGORY_META) as ExpenseCategory[]).map((catKey) => {
            const meta = CATEGORY_META[catKey];
            const isSelected = categoryFilter === catKey;
            return (
              <button
                key={catKey}
                onClick={() => setCategoryFilter(catKey)}
                className={`px-3 py-1.5 rounded-xl font-medium transition-colors shrink-0 flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-indigo-600 text-white font-semibold'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span>{meta.icon}</span>
                <span>{meta.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Expenses List */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        {filteredExpenses.length === 0 ? (
          <div className="p-12 text-center">
            <Receipt className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h4 className="text-base font-bold text-slate-800">No expenses recorded yet</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Start logging your real-world payments or click "Load Sample Receipts" to view pre-filled expenses.
            </p>
            <div className="mt-4 flex justify-center gap-2">
              <button
                onClick={onSeedSampleExpenses}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 transition-colors cursor-pointer"
              >
                Load Sample Receipts
              </button>
              <button
                onClick={handleOpenAdd}
                className="px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors cursor-pointer"
              >
                Add Custom Expense
              </button>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredExpenses.map((exp) => {
              const meta = CATEGORY_META[exp.category];
              const isShared = exp.costNature === 'shared' || exp.splitType === 'equal';

              return (
                <div
                  key={exp.id}
                  className="p-4 sm:px-6 hover:bg-slate-50/80 transition-colors flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 border ${meta.bg}`}
                    >
                      {meta.icon}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm sm:text-base font-bold text-slate-900 truncate">{exp.title}</h4>
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${meta.bg} ${meta.text}`}
                        >
                          {meta.label}
                        </span>
                        {plan.travelerType === 'group' && (
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              isShared
                                ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                                : 'bg-slate-100 text-slate-600 border border-slate-200'
                            }`}
                          >
                            {isShared ? 'Shared Group Cost' : 'Individual Personal'}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5 flex-wrap">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          {exp.date}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1 font-medium text-slate-700">
                          <User className="w-3 h-3 text-slate-400" />
                          Paid by {exp.paidBy}
                        </span>
                        {exp.notes && (
                          <>
                            <span>•</span>
                            <span className="text-slate-400 italic truncate max-w-[200px]">"{exp.notes}"</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <span className="text-base sm:text-lg font-black text-slate-900">${exp.amount.toLocaleString()}</span>
                      {plan.travelerType === 'group' && isShared && plan.travelerCount > 1 && (
                        <span className="text-[10px] text-slate-400 block">
                          ${Math.round(exp.amount / plan.travelerCount)}/ea
                        </span>
                      )}
                    </div>

                    {/* Edit and Delete Buttons */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEdit(exp)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
                        title="Edit expense"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onRemoveExpense(exp.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Delete expense"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer Subtotal */}
        {filteredExpenses.length > 0 && (
          <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex items-center justify-between text-xs sm:text-sm">
            <span className="font-semibold text-slate-600">Showing {filteredExpenses.length} receipts:</span>
            <span className="font-extrabold text-slate-900 text-base">
              Total: ${totalFiltered.toLocaleString()}
            </span>
          </div>
        )}
      </div>

      {/* Add / Edit Expense Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100">
              <h3 className="font-bold text-slate-900 text-lg">
                {editingExpenseId ? 'Edit Expense Record' : 'Record New Expense'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Expense Title / Description</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Traditional Ramen Dinner, Subway Pass, Museum Entry..."
                  className="w-full px-3 py-2 text-sm border rounded-xl border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Amount ($ USD)</label>
                  <input
                    type="number"
                    min="1"
                    step="0.5"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="e.g. 45"
                    className="w-full px-3 py-2 text-sm border rounded-xl border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                    className="w-full px-3 py-2 text-sm border rounded-xl border-slate-300 bg-white"
                  >
                    <option value="food">🍜 Food & Dining</option>
                    <option value="transport">🚇 Transport</option>
                    <option value="accommodation">🏨 Accommodation</option>
                    <option value="tickets">🎟️ Tickets & Tours</option>
                    <option value="shopping">🛍️ Shopping</option>
                    <option value="other">📦 Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 text-sm border rounded-xl border-slate-300 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Paid By</label>
                  <select
                    value={paidBy}
                    onChange={(e) => setPaidBy(e.target.value)}
                    className="w-full px-3 py-2 text-sm border rounded-xl border-slate-300 bg-white"
                  >
                    {(plan.travelerNames && plan.travelerNames.length > 0
                      ? plan.travelerNames
                      : ['You']
                    ).map((name) => (
                      <option key={name} value={name}>
                        {name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {plan.travelerType === 'group' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Cost Nature (Shared vs Personal)
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setCostNature('shared');
                        setSplitType('equal');
                      }}
                      className={`py-2 px-3 text-xs rounded-xl font-bold border text-center transition-all cursor-pointer ${
                        costNature === 'shared'
                          ? 'bg-indigo-50 border-indigo-500 text-indigo-700 shadow-2xs'
                          : 'bg-white border-slate-200 text-slate-600'
                      }`}
                    >
                      🏨 Shared Group (Hotel, Ride)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setCostNature('individual');
                        setSplitType('individual');
                      }}
                      className={`py-2 px-3 text-xs rounded-xl font-bold border text-center transition-all cursor-pointer ${
                        costNature === 'individual'
                          ? 'bg-indigo-50 border-indigo-500 text-indigo-700 shadow-2xs'
                          : 'bg-white border-slate-200 text-slate-600'
                      }`}
                    >
                      👤 Personal Individual (Meal, Item)
                    </button>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Notes / Merchant</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Receipt #124, merchant note..."
                  className="w-full px-3 py-2 text-sm border rounded-xl border-slate-300"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs cursor-pointer"
                >
                  {editingExpenseId ? 'Update Expense' : 'Save Expense'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
