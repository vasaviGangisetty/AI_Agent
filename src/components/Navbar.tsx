import React from 'react';
import {
  Home,
  Compass,
  Map,
  DollarSign,
  CloudSun,
  Bot,
  Sparkles,
} from 'lucide-react';
import { TripPlan, ActiveNavTab } from '../types/travel';

interface NavbarProps {
  currentPlan: TripPlan;
  activeTab: ActiveNavTab;
  setActiveTab: (tab: ActiveNavTab) => void;
  onOpenNewTripModal?: () => void;
  onToggleAIAgent: () => void;
  isAIAgentOpen: boolean;
  hasBudgetOverrun?: boolean;
  hasWeatherAlert?: boolean;
  totalSpent?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onToggleAIAgent,
  isAIAgentOpen,
  hasBudgetOverrun,
  hasWeatherAlert,
}) => {
  const navItems = [
    { id: 'home' as ActiveNavTab, label: 'Home', icon: Home },
    { id: 'plan' as ActiveNavTab, label: 'Plan a Trip', icon: Compass },
    { id: 'itinerary_map' as ActiveNavTab, label: 'Itinerary & Map', icon: Map },
    { id: 'budget' as ActiveNavTab, label: 'Budget & Expenses', icon: DollarSign },
    { id: 'weather_crowds' as ActiveNavTab, label: 'Weather & Crowds', icon: CloudSun },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Name */}
          <button
            onClick={() => setActiveTab('home')}
            className="flex items-center gap-2.5 text-left cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-sm group-hover:bg-indigo-700 transition-colors">
              <Compass className="w-5 h-5" />
            </div>
            <span className="font-bold text-slate-900 tracking-tight text-base sm:text-lg">
              AI Travel Planning Agent
            </span>
          </button>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200/60">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isSelected = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-white text-indigo-700 shadow-xs font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Action: AI Assistant */}
          <div className="flex items-center gap-2">
            <button
              onClick={onToggleAIAgent}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer border ${
                isAIAgentOpen
                  ? 'bg-indigo-50 border-indigo-200 text-indigo-700 font-bold'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
              title="Open AI Travel Advisor"
            >
              <Bot className="w-3.5 h-3.5 text-indigo-600" />
              <span className="hidden sm:inline">AI Advisor</span>
              {(hasBudgetOverrun || hasWeatherAlert) && (
                <span className="w-2 h-2 rounded-full bg-amber-400" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Bar */}
      <div className="flex md:hidden border-t border-slate-200 px-3 py-1.5 bg-slate-50 overflow-x-auto gap-1 scrollbar-none">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isSelected = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition-all cursor-pointer ${
                isSelected
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-200/70'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
};
