import React from 'react';
import {
  Users,
  Clock,
  ShieldCheck,
  CheckCircle,
  HelpCircle,
  Compass,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import { TripPlan, CrowdLevel } from '../types/travel';
import { getDestinationBenchmark } from '../services/destinationsData';
import { SampleDataBadge } from './SampleDataBadge';

interface CrowdWidgetProps {
  plan: TripPlan;
}

export const CrowdWidget: React.FC<CrowdWidgetProps> = ({ plan }) => {
  const benchmark = getDestinationBenchmark(plan.destination);

  const crowdLevelColor = (level: CrowdLevel) => {
    switch (level) {
      case 'low':
        return {
          bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
          dot: 'bg-emerald-500',
          label: 'Low Crowds (< 30% Capacity)',
          bar: 'bg-emerald-500',
        };
      case 'moderate':
        return {
          bg: 'bg-amber-50 text-amber-800 border-amber-200',
          dot: 'bg-amber-500',
          label: 'Moderate Traffic (30% - 70%)',
          bar: 'bg-amber-500',
        };
      case 'high':
        return {
          bg: 'bg-rose-50 text-rose-800 border-rose-200',
          dot: 'bg-rose-500',
          label: 'High Density (> 70% Capacity)',
          bar: 'bg-rose-500',
        };
      default:
        return {
          bg: 'bg-slate-50 text-slate-800 border-slate-200',
          dot: 'bg-slate-500',
          label: 'Standard',
          bar: 'bg-slate-500',
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
              Crowd Density & Queue Forecaster
            </span>
            <SampleDataBadge label="Venue Peak Hours Model" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
            Crowd Awareness & Peak Hours: {plan.destination}
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Historical visitor patterns indicate when major venues face peak bus tour arrivals.
          </p>
        </div>

        <div className="text-xs text-slate-300 bg-white/10 p-3 rounded-xl border border-white/20 max-w-xs">
          <strong className="text-white block font-semibold mb-0.5">Queue Avoidance Rule</strong>
          Landmarks in your itinerary are staged before 09:30 AM to cut waiting times by ~45 minutes.
        </div>
      </div>

      {/* 3 Crowd Levels Explanation Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {(['low', 'moderate', 'high'] as CrowdLevel[]).map((lvl) => {
          const style = crowdLevelColor(lvl);
          return (
            <div key={lvl} className={`p-4 rounded-2xl border ${style.bg} flex items-start gap-3`}>
              <span className={`w-3 h-3 rounded-full ${style.dot} mt-1 shrink-0 ring-4 ring-white`} />
              <div>
                <strong className="text-xs font-bold uppercase tracking-wider block">{style.label}</strong>
                <p className="text-xs mt-1 opacity-90 leading-relaxed">
                  {lvl === 'low'
                    ? 'Walk right in, easy photography, 0-10 min ticket delay (Early morning or post-dinner).'
                    : lvl === 'moderate'
                    ? '15-25 min typical wait. Steady foot traffic. Timed advance mobile reservation advised.'
                    : '45-90 min queue without fast-track voucher. Heavy tour group volume.'}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Hourly Crowd Distribution Cards */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div>
          <h3 className="font-bold text-slate-900 text-base">Key Venue Hourly Crowd Meters</h3>
          <p className="text-xs text-slate-500">
            Estimated queue duration across 4 daily time windows for popular destinations in {plan.destination}.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {benchmark.attractionsGuide.map((att, idx) => {
            const style = crowdLevelColor(att.crowdLevel);
            // Simulated realistic wait times
            const waits =
              att.crowdLevel === 'high'
                ? { morning: 10, midday: 60, afternoon: 45, evening: 20 }
                : { morning: 5, midday: 25, afternoon: 20, evening: 10 };

            return (
              <div
                key={idx}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-white transition-all space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{att.name}</h4>
                    <span className="text-xs text-indigo-700 font-semibold flex items-center gap-1 mt-0.5">
                      <Clock className="w-3.5 h-3.5" /> Best window: {att.bestHour}
                    </span>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border capitalize ${style.bg}`}
                  >
                    {att.crowdLevel}
                  </span>
                </div>

                {/* 4-Period Hourly Wait Meter */}
                <div className="space-y-1.5 pt-2 border-t border-slate-200/80">
                  <div className="flex justify-between text-[11px] text-slate-500 font-medium">
                    <span>Morning (8-11am): <strong className="text-slate-800">{waits.morning}m</strong></span>
                    <span>Midday (11-2pm): <strong className="text-slate-800">{waits.midday}m</strong></span>
                    <span>Afternoon (2-5pm): <strong className="text-slate-800">{waits.afternoon}m</strong></span>
                    <span>Evening (5-9pm): <strong className="text-slate-800">{waits.evening}m</strong></span>
                  </div>

                  {/* Visual Bar Meter */}
                  <div className="grid grid-cols-4 gap-1.5 h-2">
                    <div
                      className="bg-emerald-500 rounded-full"
                      style={{ opacity: 0.85 }}
                      title={`Morning: ${waits.morning} mins wait`}
                    />
                    <div
                      className={`rounded-full ${waits.midday > 40 ? 'bg-rose-500' : 'bg-amber-500'}`}
                      title={`Midday: ${waits.midday} mins wait`}
                    />
                    <div
                      className="bg-amber-500 rounded-full"
                      style={{ opacity: 0.9 }}
                      title={`Afternoon: ${waits.afternoon} mins wait`}
                    />
                    <div
                      className="bg-emerald-500 rounded-full"
                      style={{ opacity: 0.7 }}
                      title={`Evening: ${waits.evening} mins wait`}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                  <span>Typical Admission: ${att.typicalCost === 0 ? 'Free' : att.typicalCost}</span>
                  <span className="text-emerald-700 font-bold">
                    Save ~{att.crowdLevel === 'high' ? '45-60' : '20-30'} mins at recommended hour
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
