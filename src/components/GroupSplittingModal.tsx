import React, { useState } from 'react';
import {
  Users,
  User,
  ArrowRight,
  DollarSign,
  CheckCircle,
  Plus,
  Trash2,
  X,
  Scale,
} from 'lucide-react';
import { TripPlan, Expense } from '../types/travel';

interface GroupSplittingModalProps {
  plan: TripPlan;
  expenses: Expense[];
  onClose: () => void;
  onUpdateTravelers?: (travelers: string[]) => void;
}

export const GroupSplittingModal: React.FC<GroupSplittingModalProps> = ({
  plan,
  expenses,
  onClose,
  onUpdateTravelers,
}) => {
  const travelers = plan.travelerNames && plan.travelerNames.length > 0
    ? plan.travelerNames
    : ['Traveler 1', 'Traveler 2'];

  const [newTravelerName, setNewTravelerName] = useState('');

  // Calculate shared expenses vs personal expenses
  const sharedExpenses = expenses.filter((e) => e.splitType === 'equal');
  const personalExpenses = expenses.filter((e) => e.splitType === 'individual');

  const totalShared = sharedExpenses.reduce((sum, e) => sum + e.amount, 0);
  const fairSharePerPerson = travelers.length > 0 ? totalShared / travelers.length : 0;

  // Track how much each traveler actually paid for shared expenses
  const paidMap: Record<string, number> = {};
  travelers.forEach((t) => {
    paidMap[t] = 0;
  });

  sharedExpenses.forEach((e) => {
    if (paidMap[e.paidBy] !== undefined) {
      paidMap[e.paidBy] += e.amount;
    } else {
      // If paidBy name doesn't match, assign to first traveler
      paidMap[travelers[0]] = (paidMap[travelers[0]] || 0) + e.amount;
    }
  });

  // Calculate net balance for each person (Paid - fairShare)
  // Positive = should receive money; Negative = owes money
  const balances = travelers.map((t) => {
    const paid = paidMap[t] || 0;
    const net = paid - fairSharePerPerson;
    return { name: t, paid, net };
  });

  // Simple settlement suggestion algorithm
  const debtors = balances.filter((b) => b.net < -0.01).map((b) => ({ ...b, owes: -b.net }));
  const creditors = balances.filter((b) => b.net > 0.01).map((b) => ({ ...b, receives: b.net }));

  const settlementSteps: { from: string; to: string; amount: number }[] = [];
  let dIdx = 0;
  let cIdx = 0;

  while (dIdx < debtors.length && cIdx < creditors.length) {
    const debt = debtors[dIdx];
    const cred = creditors[cIdx];
    const amountToTransfer = Math.min(debt.owes, cred.receives);

    settlementSteps.push({
      from: debt.name,
      to: cred.name,
      amount: Math.round(amountToTransfer),
    });

    debt.owes -= amountToTransfer;
    cred.receives -= amountToTransfer;

    if (debt.owes < 0.01) dIdx++;
    if (cred.receives < 0.01) cIdx++;
  }

  const handleAddTraveler = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTravelerName.trim() || !onUpdateTravelers) return;
    const updated = [...travelers, newTravelerName.trim()];
    onUpdateTravelers(updated);
    setNewTravelerName('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b pb-4 border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-lg">Group Cost Splitting & Settlements</h3>
              <p className="text-xs text-slate-500">
                Fair calculation based on {sharedExpenses.length} shared group receipts.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Totals Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-xs text-slate-500 font-medium block">Total Shared Costs</span>
            <span className="text-xl font-extrabold text-slate-900 mt-1 block">
              ${Math.round(totalShared).toLocaleString()}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-indigo-50/60 border border-indigo-200">
            <span className="text-xs text-indigo-700 font-semibold block">Equal Share / Person</span>
            <span className="text-xl font-extrabold text-indigo-950 mt-1 block">
              ${Math.round(fairSharePerPerson).toLocaleString()}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-xs text-slate-500 font-medium block">Active Travelers</span>
            <span className="text-xl font-extrabold text-slate-900 mt-1 block">
              {travelers.length} people
            </span>
          </div>
        </div>

        {/* Individual Balances List */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
            Who Paid What & Net Balances
          </h4>
          <div className="space-y-2">
            {balances.map((b) => (
              <div
                key={b.name}
                className="p-3.5 rounded-xl border border-slate-200 bg-white flex items-center justify-between text-xs sm:text-sm"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-700 text-xs">
                    {b.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <strong className="text-slate-900 block font-semibold">{b.name}</strong>
                    <span className="text-slate-400 text-xs">Paid ${Math.round(b.paid)} for group</span>
                  </div>
                </div>

                <div className="text-right">
                  {b.net > 0.01 ? (
                    <span className="text-emerald-600 font-bold bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                      Gets back ${Math.round(b.net)}
                    </span>
                  ) : b.net < -0.01 ? (
                    <span className="text-rose-600 font-bold bg-rose-50 px-2.5 py-1 rounded-md border border-rose-200">
                      Owes ${Math.round(Math.abs(b.net))}
                    </span>
                  ) : (
                    <span className="text-slate-500 font-medium bg-slate-100 px-2 py-1 rounded-md">
                      Settled Up
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recommended Transfers */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
            Recommended Settlement Transfers
          </h4>
          {settlementSteps.length === 0 ? (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>All travelers are completely settled! No outstanding reimbursements required.</span>
            </div>
          ) : (
            <div className="space-y-2">
              {settlementSteps.map((step, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs sm:text-sm"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{step.from}</span>
                    <span className="text-slate-400">pays</span>
                    <span className="font-bold text-slate-900">{step.to}</span>
                  </div>
                  <span className="font-black text-indigo-700 text-base">
                    ${step.amount.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
