import React from 'react';
import { Compass } from 'lucide-react';
import { ActiveNavTab } from '../types/travel';

interface HomePageProps {
  onNavigate: (tab: ActiveNavTab) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 py-16 sm:py-24 max-w-3xl mx-auto">
      <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mb-8 shadow-xs">
        <Compass className="w-8 h-8" />
      </div>

      <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight mb-4">
        AI Travel Planning Agent
      </h1>

      <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-xl mb-10">
        Welcome to your intelligent travel planner. Easily create day-by-day itineraries, explore interactive maps, manage budgets, and review weather forecasts.
      </p>

      <button
        onClick={() => onNavigate('plan')}
        className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-base shadow-sm transition-all cursor-pointer active:scale-98"
      >
        <Compass className="w-5 h-5" />
        <span>Plan a Trip</span>
      </button>
    </div>
  );
};
