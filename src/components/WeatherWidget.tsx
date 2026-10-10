import React, { useState } from 'react';
import {
  CloudSun,
  Sun,
  CloudRain,
  Cloud,
  Thermometer,
  Droplets,
  Wind,
  Umbrella,
  RefreshCw,
  Clock,
  Sparkles,
} from 'lucide-react';
import { WeatherDay, TripPlan, ItineraryDay } from '../types/travel';
import { SampleDataBadge } from './SampleDataBadge';

interface WeatherWidgetProps {
  plan: TripPlan;
  weatherList: WeatherDay[];
  itinerary: ItineraryDay[];
  onSwapIndoorActivity: (dayNumber: number, activityId?: string) => void;
}

export const WeatherWidget: React.FC<WeatherWidgetProps> = ({
  plan,
  weatherList,
  itinerary,
  onSwapIndoorActivity,
}) => {
  const [useFahrenheit, setUseFahrenheit] = useState(false);
  const [activeDayFilter, setActiveDayFilter] = useState<number | 'all'>('all');

  const formatTemp = (celsius: number) => {
    if (useFahrenheit) {
      return `${Math.round((celsius * 9) / 5 + 32)}°F`;
    }
    return `${celsius}°C`;
  };

  const getWeatherIcon = (cond: WeatherDay['condition']) => {
    switch (cond) {
      case 'Sunny':
        return <Sun className="w-8 h-8 text-amber-500" />;
      case 'Partly Cloudy':
        return <CloudSun className="w-8 h-8 text-indigo-400" />;
      case 'Rain':
        return <CloudRain className="w-8 h-8 text-blue-500" />;
      case 'Showers':
        return <CloudRain className="w-8 h-8 text-sky-400" />;
      case 'Cloudy':
        return <Cloud className="w-8 h-8 text-slate-400" />;
      default:
        return <Sun className="w-8 h-8 text-amber-500" />;
    }
  };

  const rainyDays = weatherList.filter((w) => !w.isOutdoorFriendly);
  const visibleWeather = weatherList.filter(
    (w) => activeDayFilter === 'all' || w.dayNumber === activeDayFilter
  );

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-400/30">
              Trip Climate & Indoor Contingency
            </span>
            <SampleDataBadge label="Historical Climate Model" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
            Weather Outlook for {plan.destination}
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Day-by-day morning, afternoon, and evening temperature forecasts with automatic rain backups.
          </p>
        </div>

        {/* Temperature unit switch */}
        <div className="flex items-center gap-2 bg-white/10 p-1 rounded-xl border border-white/20 self-start md:self-auto">
          <button
            onClick={() => setUseFahrenheit(false)}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              !useFahrenheit ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-300 hover:text-white'
            }`}
          >
            Metric (°C)
          </button>
          <button
            onClick={() => setUseFahrenheit(true)}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              useFahrenheit ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-300 hover:text-white'
            }`}
          >
            Imperial (°F)
          </button>
        </div>
      </div>

      {/* Unsuitable Weather Alert Card (if any rainy day exists) */}
      {rainyDays.length > 0 && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-300/80 rounded-2xl p-5 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-amber-500 text-white shadow-xs shrink-0 mt-0.5">
                <Umbrella className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-amber-950 text-base">
                  Precipitation Predicted on Day {rainyDays.map((d) => d.dayNumber).join(', ')}
                </h3>
                <p className="text-xs sm:text-sm text-amber-900 mt-0.5">
                  High probability of rainfall ({rainyDays[0].rainChancePercent}%). We have matched sheltered indoor venues (museums, covered arcades, indoor markets) for these dates.
                </p>
              </div>
            </div>

            <button
              onClick={() => onSwapIndoorActivity(rainyDays[0].dayNumber)}
              className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Swap Day {rainyDays[0].dayNumber} to Indoor Alternative</span>
            </button>
          </div>
        </div>
      )}

      {/* Quick Day Selector for multi-day trips */}
      {weatherList.length > 5 && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <button
            onClick={() => setActiveDayFilter('all')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 ${
              activeDayFilter === 'all'
                ? 'bg-slate-900 text-white'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            All {weatherList.length} Days
          </button>
          {weatherList.map((d) => (
            <button
              key={d.dayNumber}
              onClick={() => setActiveDayFilter(d.dayNumber)}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 ${
                activeDayFilter === d.dayNumber
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              Day {d.dayNumber}
            </button>
          ))}
        </div>
      )}

      {/* Multi-Day Weather Forecast Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {visibleWeather.map((day) => {
          const isUnsuitable = !day.isOutdoorFriendly;

          return (
            <div
              key={day.dayNumber}
              className={`rounded-2xl border p-5 transition-all flex flex-col justify-between ${
                isUnsuitable
                  ? 'bg-amber-50/50 border-amber-300 shadow-xs ring-1 ring-amber-300/60'
                  : 'bg-white border-slate-200 shadow-xs hover:border-indigo-300 hover:shadow-md'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <span className="text-xs font-bold text-slate-500 block uppercase">
                      Day {day.dayNumber}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">{day.date}</span>
                  </div>

                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      isUnsuitable
                        ? 'bg-amber-100 text-amber-800 border border-amber-200'
                        : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                    }`}
                  >
                    {isUnsuitable ? 'Wet Weather' : 'Outdoor Friendly'}
                  </span>
                </div>

                {/* Weather Icon & Temps */}
                <div className="flex items-center gap-4 my-2">
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 shrink-0">
                    {getWeatherIcon(day.condition)}
                  </div>
                  <div>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-2xl font-black text-slate-900">
                        {formatTemp(day.tempHighC)}
                      </span>
                      <span className="text-sm font-semibold text-slate-400">
                        / {formatTemp(day.tempLowC)}
                      </span>
                    </div>
                    <span className="text-xs font-semibold text-slate-700 block">
                      {day.condition}
                    </span>
                  </div>
                </div>

                {/* Hourly Morning / Afternoon / Evening temperature chips */}
                {day.hourlyTemps && (
                  <div className="grid grid-cols-3 gap-1.5 my-3 p-2 rounded-xl bg-slate-50 border border-slate-100 text-center">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-semibold">Morning</span>
                      <strong className="text-xs text-slate-800">{formatTemp(day.hourlyTemps.morning)}</strong>
                    </div>
                    <div className="border-x border-slate-200">
                      <span className="text-[10px] text-slate-400 block font-semibold">Afternoon</span>
                      <strong className="text-xs text-slate-800">{formatTemp(day.hourlyTemps.afternoon)}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-semibold">Evening</span>
                      <strong className="text-xs text-slate-800">{formatTemp(day.hourlyTemps.evening)}</strong>
                    </div>
                  </div>
                )}

                {/* Key Metrics Grid */}
                <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-100 text-[11px] text-slate-600">
                  <div className="flex flex-col">
                    <span className="text-slate-400 flex items-center gap-1">
                      <Droplets className="w-3 h-3 text-blue-500" /> Rain
                    </span>
                    <strong className="text-slate-900 font-bold">{day.rainChancePercent}%</strong>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-slate-400 flex items-center gap-1">
                      <Wind className="w-3 h-3 text-slate-500" /> Wind
                    </span>
                    <strong className="text-slate-900 font-bold">{day.windKmH || 15} km/h</strong>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-slate-400 flex items-center gap-1">
                      <Sun className="w-3 h-3 text-amber-500" /> UV
                    </span>
                    <strong className="text-slate-900 font-bold">{day.uvIndex}</strong>
                  </div>
                </div>

                {/* Advisory text */}
                <p className="text-[11px] text-slate-600 mt-3 leading-relaxed bg-white/80 p-2.5 rounded-xl border border-slate-100">
                  {day.advisory}
                </p>
              </div>

              {/* Indoor suggestion trigger */}
              {day.indoorAlternativeSuggested && (
                <div className="mt-3 pt-3 border-t border-amber-200/60">
                  <span className="text-[10px] font-bold text-amber-900 uppercase block mb-1">
                    Backup Indoor Venue:
                  </span>
                  <p className="text-[11px] text-amber-950 font-medium">{day.indoorAlternativeSuggested}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
