import React, { useState } from 'react';
import {
  Sparkles,
  MapPin,
  Calendar,
  Clock,
  DollarSign,
  Users,
  User,
  Compass,
  Check,
  X,
  Layers,
  Zap,
  AlertCircle,
} from 'lucide-react';
import { TripPlan, TravelerType, TravelStyle, TravelPace, ItineraryDay } from '../types/travel';
import { POPULAR_DESTINATIONS } from '../services/destinationsData';
import { calculateEndDate, calculateDurationFromDates } from '../utils/travelUtils';

interface TripFormProps {
  initialPlan?: TripPlan;
  onSubmit: (plan: TripPlan, generatedDays?: ItineraryDay[]) => void;
  onCancel?: () => void;
  isModal?: boolean;
}

const INTERESTS_OPTIONS = [
  { id: 'culture', label: 'Culture & Shrines', icon: '🏛️' },
  { id: 'food', label: 'Culinary & Street Food', icon: '🍜' },
  { id: 'art', label: 'Art & Museums', icon: '🎨' },
  { id: 'nature', label: 'Nature & Parks', icon: '🌿' },
  { id: 'landmarks', label: 'Iconic Landmarks', icon: '🗼' },
  { id: 'shopping', label: 'Shopping & Bazaars', icon: '🛍️' },
  { id: 'nightlife', label: 'Nightlife & Bars', icon: '🍸' },
  { id: 'photography', label: 'Photography Vistas', icon: '📸' },
  { id: 'wellness', label: 'Wellness & Onsen', icon: '🧘' },
];

export const TripForm: React.FC<TripFormProps> = ({
  initialPlan,
  onSubmit,
  onCancel,
  isModal = false,
}) => {
  const [destination, setDestination] = useState(initialPlan?.destination || 'Tokyo');
  const [startDate, setStartDate] = useState(
    initialPlan?.startDate || new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0]
  );
  const [durationDays, setDurationDays] = useState(initialPlan?.durationDays || 4);
  const [totalBudget, setTotalBudget] = useState(initialPlan?.totalBudget || 1600);
  const [currency, setCurrency] = useState(initialPlan?.currency || 'USD');
  const [travelerType, setTravelerType] = useState<TravelerType>(initialPlan?.travelerType || 'solo');
  const [travelerCount, setTravelerCount] = useState(initialPlan?.travelerCount || 1);
  const [travelerNamesInput, setTravelerNamesInput] = useState(
    initialPlan?.travelerNames?.join(', ') || 'Alex, Jordan'
  );
  const [selectedInterests, setSelectedInterests] = useState<string[]>(
    initialPlan?.interests || ['culture', 'food', 'landmarks', 'art']
  );
  const [travelStyle, setTravelStyle] = useState<TravelStyle>(initialPlan?.travelStyle || 'balanced');
  const [travelPace, setTravelPace] = useState<TravelPace>(initialPlan?.travelPace || 'moderate');
  const [accommodationType, setAccommodationType] = useState<any>(initialPlan?.accommodationType || 'hotel');
  const [transportPreference, setTransportPreference] = useState<any>(initialPlan?.transportPreference || 'public_transit');
  const [dailySpendingLimit, setDailySpendingLimit] = useState<number>(initialPlan?.dailySpendingLimit || Math.round((initialPlan?.totalBudget || 1600) / (initialPlan?.durationDays || 4)));
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState('');
  const [generationError, setGenerationError] = useState<string | null>(null);

  const toggleInterest = (id: string) => {
    setSelectedInterests((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleTravelerTypeChange = (type: TravelerType) => {
    setTravelerType(type);
    if (type === 'solo') {
      setTravelerCount(1);
    } else if (travelerCount === 1) {
      setTravelerCount(2);
    }
  };

  // Quick preset loader
  const applyPreset = (preset: {
    dest: string;
    days: number;
    budget: number;
    type: TravelerType;
    count: number;
    interests: string[];
    style: TravelStyle;
    names: string;
  }) => {
    setDestination(preset.dest);
    setDurationDays(preset.days);
    setTotalBudget(preset.budget);
    setTravelerType(preset.type);
    setTravelerCount(preset.count);
    setSelectedInterests(preset.interests);
    setTravelStyle(preset.style);
    setTravelerNamesInput(preset.names);
    setGenerationError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    setGenerationError(null);

    const names =
      travelerType === 'solo'
        ? ['Traveler']
        : travelerNamesInput
            .split(',')
            .map((n) => n.trim())
            .filter((n) => n.length > 0);

    const calculatedEnd = calculateEndDate(startDate, Math.max(1, Number(durationDays)));
    const plan: TripPlan = {
      id: initialPlan?.id || `trip-${Date.now()}`,
      destination: destination.trim() || 'Tokyo',
      country: '',
      startDate,
      endDate: calculatedEnd,
      durationDays: Math.max(1, Math.min(90, Number(durationDays))),
      totalBudget: Math.max(100, Number(totalBudget)),
      currency,
      travelerType,
      travelerCount: travelerType === 'solo' ? 1 : Math.max(2, Number(travelerCount)),
      travelerNames: names.length > 0 ? names : ['Traveler 1', 'Traveler 2'],
      interests: selectedInterests.length > 0 ? selectedInterests : ['culture', 'food'],
      travelStyle,
      travelPace,
      accommodationType,
      transportPreference,
      dailySpendingLimit: Number(dailySpendingLimit) || Math.round(Number(totalBudget) / Math.max(1, Number(durationDays))),
      createdAt: initialPlan?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setGenerationStep(`Connecting to AI Travel Planning Engine for ${plan.destination}...`);

    const stepTimers: NodeJS.Timeout[] = [
      setTimeout(() => setGenerationStep(`Curating distinct, non-repeating attractions for ${plan.durationDays} days...`), 1800),
      setTimeout(() => setGenerationStep('Geographically clustering nearby venues & transit routes...'), 4500),
      setTimeout(() => setGenerationStep('Calculating accurate activity costs & budget allocations...'), 7500),
    ];

    try {
      const response = await fetch('/api/itinerary/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      });

      stepTimers.forEach(clearTimeout);

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to generate personalized itinerary.');
      }

      if (!result.days || !Array.isArray(result.days) || result.days.length === 0) {
        throw new Error('AI generation returned an empty itinerary schedule.');
      }

      setIsGenerating(false);
      onSubmit(plan, result.days);
    } catch (err: any) {
      stepTimers.forEach(clearTimeout);
      console.error('Itinerary generation error:', err);
      setIsGenerating(false);
      setGenerationError(err.message || 'Generation failed. Please try again.');
    }
  };

  return (
    <div className={`bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden ${isModal ? 'max-w-3xl w-full mx-auto' : ''}`}>
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-5 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-600">
              <Compass className="w-5 h-5 text-indigo-600" />
            </span>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Plan a Trip</h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Configure your destination, dates, budget, and travel preferences to generate your itinerary.
          </p>
        </div>
        {onCancel && (
          <button
            onClick={onCancel}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Quick Presets Bar */}
      <div className="bg-slate-50 border-b border-slate-200 px-6 py-3">
        <div className="flex items-center justify-between gap-2 overflow-x-auto text-xs pb-1 sm:pb-0">
          <span className="font-semibold text-slate-500 uppercase tracking-wider shrink-0 flex items-center gap-1">
            <Zap className="w-3.5 h-3.5 text-amber-500" /> Quick Presets:
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() =>
                applyPreset({
                  dest: 'Tokyo',
                  days: 4,
                  budget: 1500,
                  type: 'solo',
                  count: 1,
                  interests: ['culture', 'food', 'landmarks', 'art'],
                  style: 'balanced',
                  names: 'Solo Explorer',
                })
              }
              className="px-2.5 py-1 rounded-md bg-white border border-slate-200 text-slate-700 hover:border-indigo-400 hover:text-indigo-600 font-medium transition-colors whitespace-nowrap shadow-2xs"
            >
              🇯🇵 Tokyo Solo 4-Day
            </button>
            <button
              type="button"
              onClick={() =>
                applyPreset({
                  dest: 'Paris',
                  days: 4,
                  budget: 2400,
                  type: 'group',
                  count: 2,
                  interests: ['art', 'culture', 'food', 'photography'],
                  style: 'balanced',
                  names: 'Emma, Lucas',
                })
              }
              className="px-2.5 py-1 rounded-md bg-white border border-slate-200 text-slate-700 hover:border-indigo-400 hover:text-indigo-600 font-medium transition-colors whitespace-nowrap shadow-2xs"
            >
              🇫🇷 Paris Duo 4-Day
            </button>
            <button
              type="button"
              onClick={() =>
                applyPreset({
                  dest: 'Rome',
                  days: 3,
                  budget: 1800,
                  type: 'group',
                  count: 3,
                  interests: ['culture', 'landmarks', 'food'],
                  style: 'balanced',
                  names: 'Marco, Sofia, Leo',
                })
              }
              className="px-2.5 py-1 rounded-md bg-white border border-slate-200 text-slate-700 hover:border-indigo-400 hover:text-indigo-600 font-medium transition-colors whitespace-nowrap shadow-2xs"
            >
              🇮🇹 Rome Group 3-Day
            </button>
            <button
              type="button"
              onClick={() =>
                applyPreset({
                  dest: 'Bali',
                  days: 6,
                  budget: 1200,
                  type: 'group',
                  count: 2,
                  interests: ['nature', 'wellness', 'food', 'photography'],
                  style: 'budget',
                  names: 'Maya, Dave',
                })
              }
              className="px-2.5 py-1 rounded-md bg-white border border-slate-200 text-slate-700 hover:border-indigo-400 hover:text-indigo-600 font-medium transition-colors whitespace-nowrap shadow-2xs"
            >
              🇮🇩 Bali Nature 6-Day
            </button>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Destination & Quick Chips */}
        <div>
          <label className="block text-sm font-semibold text-slate-800 mb-1.5 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-indigo-600" /> Destination
            </span>
            <span className="text-xs font-normal text-slate-500">Global benchmarks supported</span>
          </label>
          <div className="relative">
            <input
              type="text"
              required
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="e.g. Tokyo, Paris, Rome, Bali, New York, Barcelona..."
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-900 font-medium shadow-2xs"
            />
          </div>
          {/* Quick Destination Chips */}
          <div className="flex flex-wrap gap-1.5 mt-2">
            {POPULAR_DESTINATIONS.map((d) => (
              <button
                key={d.id}
                type="button"
                onClick={() => setDestination(d.name)}
                className={`text-xs px-2.5 py-1 rounded-lg border transition-all ${
                  destination.toLowerCase() === d.name.toLowerCase()
                    ? 'bg-indigo-50 border-indigo-500 text-indigo-700 font-semibold'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {d.name}
              </button>
            ))}
          </div>
        </div>

        {/* Dates & Duration & Budget Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-indigo-600" /> Start Date
            </label>
            <input
              type="date"
              required
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 font-medium text-sm shadow-2xs"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-indigo-600" /> Duration
              </span>
              <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200">
                {durationDays} {durationDays === 1 ? 'Day' : 'Days'}
              </span>
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="1"
                max="90"
                value={durationDays}
                onChange={(e) => setDurationDays(Math.max(1, Number(e.target.value) || 1))}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-2xs text-center"
              />
            </div>
            <div className="flex justify-between text-[11px] text-slate-400 mt-1">
              <span>Quick:</span>
              <div className="flex gap-1.5">
                {[3, 5, 7, 10, 14, 21].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDurationDays(d)}
                    className="hover:text-indigo-600 underline font-medium cursor-pointer"
                  >
                    {d}d
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-purple-600" /> End Date
            </label>
            <input
              type="date"
              required
              value={calculateEndDate(startDate, durationDays)}
              onChange={(e) => {
                const diff = calculateDurationFromDates(startDate, e.target.value);
                setDurationDays(diff);
              }}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-900 font-medium text-sm shadow-2xs"
            />
            <span className="text-[10px] text-slate-400 mt-1 block">
              Auto-calculated ({durationDays} days)
            </span>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-indigo-600" /> Total Budget
              </span>
              <span className="text-xs text-slate-500">
                {travelerType === 'group' && travelerCount > 1
                  ? `$${Math.round(totalBudget / travelerCount)}/ea`
                  : ''}
              </span>
            </label>
            <div className="flex rounded-xl shadow-2xs">
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="px-2.5 py-2 bg-slate-100 border border-r-0 border-slate-300 rounded-l-xl text-xs font-semibold text-slate-700 focus:outline-none"
              >
                <option value="USD">USD $</option>
                <option value="EUR">EUR €</option>
                <option value="GBP">GBP £</option>
                <option value="JPY">JPY ¥</option>
              </select>
              <input
                type="number"
                min="100"
                step="50"
                required
                value={totalBudget}
                onChange={(e) => setTotalBudget(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-r-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 font-semibold text-sm"
              />
            </div>
          </div>
        </div>

        {/* Traveler Type & Group Setup */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
            <div>
              <span className="text-sm font-semibold text-slate-900 block">Travel Party Dynamics</span>
              <span className="text-xs text-slate-500">Per-person cost calculation & shared expense allocation</span>
            </div>
            {/* Toggle */}
            <div className="flex p-0.5 rounded-lg bg-slate-200/80 border border-slate-300/80 w-fit">
              <button
                type="button"
                onClick={() => handleTravelerTypeChange('solo')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  travelerType === 'solo'
                    ? 'bg-white text-indigo-700 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <User className="w-3.5 h-3.5" /> Solo Traveler
              </button>
              <button
                type="button"
                onClick={() => handleTravelerTypeChange('group')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  travelerType === 'group'
                    ? 'bg-white text-indigo-700 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Users className="w-3.5 h-3.5" /> Group / Couple
              </button>
            </div>
          </div>

          {travelerType === 'group' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Number of Travelers: <strong className="text-indigo-600">{travelerCount}</strong>
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="2"
                    max="10"
                    value={travelerCount}
                    onChange={(e) => setTravelerCount(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-300 rounded appearance-none cursor-pointer accent-indigo-600"
                  />
                  <span className="text-xs font-bold text-slate-700 w-6 text-right">{travelerCount}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Traveler Names (comma-separated for expense tracker):
                </label>
                <input
                  type="text"
                  value={travelerNamesInput}
                  onChange={(e) => setTravelerNamesInput(e.target.value)}
                  placeholder="e.g. Alex, Jordan, Taylor"
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                />
              </div>
            </div>
          )}
        </div>

        {/* Travel Style & Pace */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-1.5 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-indigo-600" /> Travel Style
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['budget', 'balanced', 'luxury'] as TravelStyle[]).map((style) => (
                <button
                  key={style}
                  type="button"
                  onClick={() => setTravelStyle(style)}
                  className={`py-2 px-2 text-xs rounded-xl font-medium capitalize border transition-all text-center ${
                    travelStyle === style
                      ? 'bg-indigo-50 border-indigo-600 text-indigo-700 font-semibold ring-1 ring-indigo-600'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {style}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-1.5 flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-indigo-600" /> Travel Pace
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['relaxed', 'moderate', 'packed'] as TravelPace[]).map((pace) => (
                <button
                  key={pace}
                  type="button"
                  onClick={() => setTravelPace(pace)}
                  className={`py-2 px-2 text-xs rounded-xl font-medium capitalize border transition-all text-center ${
                    travelPace === pace
                      ? 'bg-indigo-50 border-indigo-600 text-indigo-700 font-semibold ring-1 ring-indigo-600'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {pace === 'relaxed' ? 'Relaxed (3/day)' : pace === 'moderate' ? 'Moderate (4/day)' : 'Packed (5/day)'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Accommodation & Transport Preferences */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-800 mb-1">
              Accommodation Type
            </label>
            <select
              value={accommodationType}
              onChange={(e) => setAccommodationType(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="hotel">Standard Hotel</option>
              <option value="hostel">Budget Hostel</option>
              <option value="luxury">Luxury Resort</option>
              <option value="apartment">Apartment / Airbnb</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-800 mb-1">
              Transit Preference
            </label>
            <select
              value={transportPreference}
              onChange={(e) => setTransportPreference(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="public_transit">Metro & Public Transit</option>
              <option value="walking">Scenic Walking</option>
              <option value="taxi">Taxis & Rideshare</option>
              <option value="rental">Rental Car</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-800 mb-1">
              Daily Spending Limit ($)
            </label>
            <input
              type="number"
              min="10"
              value={dailySpendingLimit}
              onChange={(e) => setDailySpendingLimit(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Interests Selection */}
        <div>
          <label className="block text-sm font-semibold text-slate-800 mb-1.5">
            Interests & Priorities <span className="text-xs font-normal text-slate-500">(Choose 2 or more)</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {INTERESTS_OPTIONS.map((item) => {
              const isSelected = selectedInterests.includes(item.id);
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => toggleInterest(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                    isSelected
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                  {isSelected && <Check className="w-3 h-3 ml-0.5" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Error Alert when Generation Fails */}
        {generationError && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-sm flex items-start gap-3 animate-fade-in">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-semibold text-rose-900 text-sm">Itinerary Generation Failed</h4>
              <p className="text-xs sm:text-sm text-rose-700 mt-0.5 leading-relaxed">
                {generationError}
              </p>
              <div className="mt-3 flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                >
                  Retry Generation
                </button>
                <button
                  type="button"
                  onClick={() => setGenerationError(null)}
                  className="px-3 py-1.5 bg-white border border-rose-300 hover:bg-rose-100 text-rose-700 rounded-lg text-xs font-medium transition-colors cursor-pointer"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isGenerating}
            className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold text-sm sm:text-base shadow-lg shadow-indigo-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
          >
            {isGenerating ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span className="text-sm font-medium">{generationStep || 'Building custom itinerary...'}</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 text-indigo-200" />
                <span>{initialPlan ? 'Update My Trip & Regenerate Itinerary' : 'Generate Intelligent Itinerary'}</span>
              </>
            )}
          </button>
          <p className="text-center text-[11px] text-slate-400 mt-2">
            AI Agent analyzes crowd patterns, weather contingencies, and local benchmark expenses.
          </p>
        </div>
      </form>
    </div>
  );
};
