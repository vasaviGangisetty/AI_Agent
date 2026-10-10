import React from 'react';
import {
  DollarSign,
  Utensils,
  Train,
  Bed,
  Ticket,
  Info,
  CheckCircle,
  HelpCircle,
  X,
  CreditCard,
  MapPin,
} from 'lucide-react';
import { TripPlan } from '../types/travel';
import { getDestinationBenchmark } from '../services/destinationsData';
import { SampleDataBadge } from './SampleDataBadge';

interface LocalBenchmarksPanelProps {
  plan: TripPlan;
  onClose?: () => void;
  isModal?: boolean;
}

export const LocalBenchmarksPanel: React.FC<LocalBenchmarksPanelProps> = ({
  plan,
  onClose,
  isModal = false,
}) => {
  const benchmark = getDestinationBenchmark(plan.destination);

  return (
    <div
      className={`bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xl ${
        isModal ? 'max-w-3xl w-full mx-auto' : ''
      }`}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 px-6 py-5 text-white flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="px-2 py-0.5 rounded text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
              Cost Intelligence Guide
            </span>
            <SampleDataBadge label="Sample Benchmark Data" />
          </div>
          <h3 className="text-xl font-bold tracking-tight">
            {benchmark.name}, {benchmark.country} Expense Baseline
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 mt-0.5">
            Local currency: {benchmark.currency} ({benchmark.currencySymbol}) • Historical tourist averages
          </p>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <div className="p-6 space-y-6">
        {/* Daily Tier Overview */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
            Estimated Daily Total Per Person (Excluding Long-Haul Flights)
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
              <span className="text-xs font-semibold text-slate-500 block">Budget Backpacker</span>
              <span className="text-2xl font-black text-slate-900 mt-1 block">
                ${benchmark.avgDailyCosts.budget}
                <span className="text-xs font-normal text-slate-500"> / day</span>
              </span>
              <p className="text-[11px] text-slate-500 mt-1">Hostels, street food, public transport only.</p>
            </div>

            <div className="p-4 rounded-xl border border-indigo-200 bg-indigo-50/50 ring-1 ring-indigo-400/30">
              <span className="text-xs font-bold text-indigo-700 block">Balanced Explorer</span>
              <span className="text-2xl font-black text-indigo-950 mt-1 block">
                ${benchmark.avgDailyCosts.moderate}
                <span className="text-xs font-normal text-slate-500"> / day</span>
              </span>
              <p className="text-[11px] text-indigo-900/80 mt-1">3-star hotel, casual sit-down dining, key paid sights.</p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
              <span className="text-xs font-semibold text-slate-500 block">Premium & Luxury</span>
              <span className="text-2xl font-black text-slate-900 mt-1 block">
                ${benchmark.avgDailyCosts.luxury}
                <span className="text-xs font-normal text-slate-500"> / day</span>
              </span>
              <p className="text-[11px] text-slate-500 mt-1">4/5-star boutique, fine dining, private tours & taxis.</p>
            </div>
          </div>
        </div>

        {/* Detailed Benchmark Categories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Meals */}
          <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-3">
            <div className="flex items-center gap-2 text-amber-700 font-bold text-sm">
              <Utensils className="w-4 h-4 text-amber-600" />
              <span>Dining & Food</span>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between border-b border-slate-100 pb-1.5">
                <span className="text-slate-600">Street / Market snack:</span>
                <strong className="text-slate-900">${benchmark.mealCosts.streetFood}</strong>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-1.5">
                <span className="text-slate-600">Casual sit-down meal:</span>
                <strong className="text-slate-900">${benchmark.mealCosts.casualDining}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Fine dining / Multi-course:</span>
                <strong className="text-slate-900">${benchmark.mealCosts.fineDining}+</strong>
              </div>
            </div>
          </div>

          {/* Transport */}
          <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-3">
            <div className="flex items-center gap-2 text-blue-700 font-bold text-sm">
              <Train className="w-4 h-4 text-blue-600" />
              <span>Transportation</span>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between border-b border-slate-100 pb-1.5">
                <span className="text-slate-600">Single metro/bus ticket:</span>
                <strong className="text-slate-900">${benchmark.transportCosts.metroSingle}</strong>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-1.5">
                <span className="text-slate-600">24-hour transit pass:</span>
                <strong className="text-slate-900">${benchmark.transportCosts.dayPass}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Taxi base fare:</span>
                <strong className="text-slate-900">${benchmark.transportCosts.taxiBase}</strong>
              </div>
            </div>
          </div>

          {/* Lodging */}
          <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-3">
            <div className="flex items-center gap-2 text-purple-700 font-bold text-sm">
              <Bed className="w-4 h-4 text-purple-600" />
              <span>Lodging / Night</span>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between border-b border-slate-100 pb-1.5">
                <span className="text-slate-600">Hostel dormitory:</span>
                <strong className="text-slate-900">${benchmark.lodgingCosts.hostel}</strong>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-1.5">
                <span className="text-slate-600">Mid-range hotel / Airbnb:</span>
                <strong className="text-slate-900">${benchmark.lodgingCosts.midRangeHotel}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Luxury hotel:</span>
                <strong className="text-slate-900">${benchmark.lodgingCosts.luxuryHotel}+</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Local Etiquette & Tipping Note */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3 text-xs text-slate-700">
          <CreditCard className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
          <div>
            <strong className="font-semibold text-slate-900 block mb-0.5">Tipping & Local Customs</strong>
            <span>{benchmark.tippingAndCustoms}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
