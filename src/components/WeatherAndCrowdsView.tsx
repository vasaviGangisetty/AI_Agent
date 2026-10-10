import React, { useState } from 'react';
import {
  Sun,
  CloudSun,
  CloudRain,
  Cloud,
  Thermometer,
  Droplets,
  Clock,
  MapPin,
  Info,
} from 'lucide-react';
import { WeatherDay, TripPlan, ItineraryDay, CrowdLevel } from '../types/travel';
import { getDestinationBenchmark } from '../services/destinationsData';

interface WeatherAndCrowdsViewProps {
  plan: TripPlan;
  weatherList: WeatherDay[];
  itinerary: ItineraryDay[];
  onSwapIndoorActivity?: (dayNumber: number, activityId?: string) => void;
}

export const WeatherAndCrowdsView: React.FC<WeatherAndCrowdsViewProps> = ({
  plan,
  weatherList,
  itinerary,
}) => {
  const [useFahrenheit, setUseFahrenheit] = useState(false);
  const benchmark = getDestinationBenchmark(plan.destination);

  const formatTemp = (celsius: number) => {
    if (useFahrenheit) {
      return `${Math.round((celsius * 9) / 5 + 32)}°F`;
    }
    return `${celsius}°C`;
  };

  const getWeatherIcon = (cond: WeatherDay['condition']) => {
    switch (cond) {
      case 'Sunny':
        return <Sun className="w-6 h-6 text-amber-500" />;
      case 'Partly Cloudy':
        return <CloudSun className="w-6 h-6 text-indigo-400" />;
      case 'Rain':
        return <CloudRain className="w-6 h-6 text-blue-500" />;
      case 'Showers':
        return <CloudRain className="w-6 h-6 text-sky-400" />;
      case 'Cloudy':
        return <Cloud className="w-6 h-6 text-slate-400" />;
      default:
        return <Sun className="w-6 h-6 text-amber-500" />;
    }
  };

  const getCrowdBand = (level: CrowdLevel) => {
    switch (level) {
      case 'low':
        return {
          label: 'Low',
          badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        };
      case 'moderate':
        return {
          label: 'Moderate',
          badge: 'bg-amber-50 text-amber-700 border-amber-200',
        };
      case 'high':
        return {
          label: 'High',
          badge: 'bg-rose-50 text-rose-700 border-rose-200',
        };
      default:
        return {
          label: 'Moderate',
          badge: 'bg-slate-50 text-slate-700 border-slate-200',
        };
    }
  };

  // Flatten venues from itinerary activities
  const venueList = itinerary.flatMap((day) =>
    day.activities.map((act) => ({
      dayNumber: day.dayNumber,
      venueName: act.locationName || act.title,
      crowdLevel: act.crowdLevel,
      bestHour: act.crowdPeakNote || 'Morning before 10:30 AM',
      waitMinutes: act.crowdHourly?.midday || 15,
    }))
  );

  return (
    <div className="space-y-8">
      {/* Page Header (No Journey Box or Trip Summary) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Weather & Crowds
          </h2>
          <p className="text-xs text-slate-500">
            Weather conditions and crowd estimates for {plan.destination}.
          </p>
        </div>

        {/* Temperature Unit Toggle */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs self-start sm:self-auto">
          <button
            onClick={() => setUseFahrenheit(false)}
            className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
              !useFahrenheit ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            °C
          </button>
          <button
            onClick={() => setUseFahrenheit(true)}
            className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
              useFahrenheit ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            °F
          </button>
        </div>
      </div>

      {/* Weather Forecast Section */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
          Daily Weather Forecast
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {weatherList.map((day) => (
            <div
              key={day.dayNumber}
              className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-xs font-bold text-slate-500 uppercase">
                    Day {day.dayNumber}
                  </span>
                  <span className="text-[11px] text-slate-400">{day.date}</span>
                </div>

                <div className="flex items-center gap-3 my-2">
                  {getWeatherIcon(day.condition)}
                  <div>
                    <strong className="text-xl font-extrabold text-slate-900">
                      {formatTemp(day.tempHighC)}
                    </strong>
                    <span className="text-xs text-slate-400 ml-1">
                      / {formatTemp(day.tempLowC)}
                    </span>
                    <span className="block text-xs font-medium text-slate-600">
                      {day.condition}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <Droplets className="w-3.5 h-3.5 text-blue-500" /> Rain: {day.rainChancePercent}%
                </span>
                <span className="text-[11px] text-slate-400">
                  {day.isOutdoorFriendly ? 'Outdoor friendly' : 'Rain advisory'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Crowd Levels Section */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Attraction Crowd Levels
          </h3>
          <span className="text-xs text-slate-400 flex items-center gap-1">
            <Info className="w-3.5 h-3.5" />
            Estimated values based on historical venue visitor patterns
          </span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs divide-y divide-slate-100">
          {venueList.slice(0, 8).map((venue, idx) => {
            const crowd = getCrowdBand(venue.crowdLevel);

            return (
              <div
                key={idx}
                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/50 transition-colors"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-400">Day {venue.dayNumber}</span>
                    <h4 className="text-sm font-bold text-slate-900">{venue.venueName}</h4>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    Recommended: {venue.bestHour}
                  </p>
                </div>

                <div className="flex items-center gap-3 self-start sm:self-auto">
                  <span className="text-xs text-slate-400">
                    ~{venue.waitMinutes}m typical wait
                  </span>
                  <span
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${crowd.badge}`}
                  >
                    {crowd.label} Crowd
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
