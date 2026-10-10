import React, { useState } from 'react';

import {
  Calendar,
  Map,
  Columns,
  Maximize2,
  Navigation,
  DollarSign,
  Sparkles,
} from 'lucide-react';
import { ItineraryDay, Activity, TripPlan, WeatherDay } from '../types/travel';
import { ItineraryView } from './ItineraryView';
import { DestinationMapView } from './DestinationMapView';
import MapLinks from './MapLinks';


interface ItineraryAndMapViewProps {
  plan: TripPlan;
  itinerary: ItineraryDay[];
  weatherList: WeatherDay[];
  onUpdateItinerary: (updated: ItineraryDay[]) => void;
  onOpenLocalBenchmarks: () => void;
  onSwapWithIndoor: (dayNumber: number, activityId?: string) => void;
}

export const ItineraryAndMapView: React.FC<ItineraryAndMapViewProps> = ({
  plan,
  itinerary,
  weatherList,
  onUpdateItinerary,
  onOpenLocalBenchmarks,
  onSwapWithIndoor,
}) => {
  const [layoutMode, setLayoutMode] = useState<'split' | 'timeline' | 'map'>('split');
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(
    itinerary[0]?.activities[0] || null
  );

  const handleSelectActivity = (activity: Activity) => {
    setSelectedActivity(activity);
  };

  return (
    <div className="space-y-6">
      {/* Top Controls Bar with Layout Switcher */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Map className="w-5 h-5 text-indigo-600" />
            <span>Itinerary & Interactive Map</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Select an activity to view its location on the map.
          </p>
        </div>

        {/* Layout Switcher */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
          <button
            onClick={() => setLayoutMode('split')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              layoutMode === 'split'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Columns className="w-3.5 h-3.5" />
            <span>Split View</span>
          </button>

          <button
            onClick={() => setLayoutMode('timeline')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              layoutMode === 'timeline'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Timeline Only</span>
          </button>

          <button
            onClick={() => setLayoutMode('map')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              layoutMode === 'map'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Map className="w-3.5 h-3.5" />
            <span>Map Only</span>
          </button>
        </div>
      </div>

      {/* View Content depending on layout mode */}
      {layoutMode === 'split' && (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
          {/* Left Column: Itinerary Timeline */}
          <div className="xl:col-span-6 space-y-6">
            <ItineraryView
              plan={plan}
              itinerary={itinerary}
              weatherList={weatherList}
              onUpdateItinerary={onUpdateItinerary}
              onSelectMapActivity={handleSelectActivity}
              onOpenLocalBenchmarks={onOpenLocalBenchmarks}
              onSwapWithIndoor={onSwapWithIndoor}
            />
          </div>

          {/* Right Column: Sticky Interactive Map */}
          <div className="xl:col-span-6 xl:sticky xl:top-20 space-y-6">
            <DestinationMapView
              plan={plan}
              itinerary={itinerary}
              selectedActivity={selectedActivity}
              onSelectActivity={handleSelectActivity}
            />
          </div>
        </div>
      )}

      {layoutMode === 'timeline' && (
        <ItineraryView
          plan={plan}
          itinerary={itinerary}
          weatherList={weatherList}
          onUpdateItinerary={onUpdateItinerary}
          onSelectMapActivity={(act) => {
            handleSelectActivity(act);
            setLayoutMode('split');
          }}
          onOpenLocalBenchmarks={onOpenLocalBenchmarks}
          onSwapWithIndoor={onSwapWithIndoor}
        />
      )}

      {layoutMode === 'map' && (
        <DestinationMapView
          plan={plan}
          itinerary={itinerary}
          selectedActivity={selectedActivity}
          onSelectActivity={handleSelectActivity}
        />
      )}
    </div>
  );
};
