
import React, { useState } from 'react';
import {
  Calendar,
  MapPin,
  Clock,
  DollarSign,
  CloudRain,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Circle,
  Navigation,
} from 'lucide-react';

import type {
  ItineraryDay,
  Activity,
  TripPlan,
  WeatherDay,
} from '../types/travel';

import MapLinks from './MapLinks';

interface ItineraryViewProps {
  plan: TripPlan;
  itinerary: ItineraryDay[];
  weatherList: WeatherDay[];
  onUpdateItinerary: (updated: ItineraryDay[]) => void;
  onSelectMapActivity: (activity: Activity) => void;
  onOpenLocalBenchmarks: () => void;
  onSwapWithIndoor: (dayNumber: number, activityId?: string) => void;
}

export const ItineraryView: React.FC<ItineraryViewProps> = ({
  plan,
  itinerary,
  weatherList,
  onUpdateItinerary,
  onSelectMapActivity,
  onOpenLocalBenchmarks,
  onSwapWithIndoor,
}) => {
  const [expandedDays, setExpandedDays] = useState<number[]>([
    itinerary[0]?.dayNumber ?? 1,
  ]);

  const toggleDay = (dayNumber: number) => {
    setExpandedDays((previous) =>
      previous.includes(dayNumber)
        ? previous.filter((day) => day !== dayNumber)
        : [...previous, dayNumber]
    );
  };

  const toggleCompleted = (
    dayNumber: number,
    activityId: string
  ) => {
    const updated = itinerary.map((day) => {
      if (day.dayNumber !== dayNumber) return day;

      const activities = day.activities.map((activity) =>
        activity.id === activityId
          ? { ...activity, isCompleted: !activity.isCompleted }
          : activity
      );

      return { ...day, activities };
    });

    onUpdateItinerary(updated);
  };

  const getWeatherForDay = (date: string) =>
    weatherList.find((weather) => weather.date === date);

  const getGoogleMapsUrl = (activity: Activity) => {
    const lat = activity.coordinates?.lat;
    const lng = activity.coordinates?.lng;

    const hasCoordinates =
      typeof lat === 'number' &&
      typeof lng === 'number' &&
      Number.isFinite(lat) &&
      Number.isFinite(lng) &&
      lat >= -90 &&
      lat <= 90 &&
      lng >= -180 &&
      lng <= 180 &&
      !(lat === 0 && lng === 0);

    const query = encodeURIComponent(
      [
        activity.locationName || activity.title,
        activity.address,
        plan.destination,
      ]
        .filter(Boolean)
        .join(', ')
    );

    return hasCoordinates
      ? `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`
      : `https://www.google.com/maps/search/?api=1&query=${query}`;
  };

  const getOpenStreetMapUrl = (activity: Activity) => {
    const lat = activity.coordinates?.lat;
    const lng = activity.coordinates?.lng;

    const hasCoordinates =
      typeof lat === 'number' &&
      typeof lng === 'number' &&
      Number.isFinite(lat) &&
      Number.isFinite(lng) &&
      lat >= -90 &&
      lat <= 90 &&
      lng >= -180 &&
      lng <= 180 &&
      !(lat === 0 && lng === 0);

    const query = encodeURIComponent(
      [
        activity.locationName || activity.title,
        activity.address,
        plan.destination,
      ]
        .filter(Boolean)
        .join(', ')
    );

    return hasCoordinates
      ? `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=16/${lat}/${lng}`
      : `https://www.openstreetmap.org/search?query=${query}`;
  };

  const getDirectionsUrl = (activity: Activity) => {
    const lat = activity.coordinates?.lat;
    const lng = activity.coordinates?.lng;

    const hasCoordinates =
      typeof lat === 'number' &&
      typeof lng === 'number' &&
      Number.isFinite(lat) &&
      Number.isFinite(lng) &&
      lat >= -90 &&
      lat <= 90 &&
      lng >= -180 &&
      lng <= 180 &&
      !(lat === 0 && lng === 0);

    const query = encodeURIComponent(
      [
        activity.locationName || activity.title,
        activity.address,
        plan.destination,
      ]
        .filter(Boolean)
        .join(', ')
    );

    const destination = hasCoordinates
      ? `${lat},${lng}`
      : query;

    return `https://www.google.com/maps/dir/?api=1&destination=${destination}`;
  };

  if (!itinerary.length) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
        <Calendar className="mx-auto mb-3 h-10 w-10 text-indigo-500" />
        <h2 className="text-lg font-bold text-slate-900">
          No itinerary available
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          Create a travel plan to see your daily activities.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            Your Travel Itinerary
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            {plan.destination} · {plan.durationDays} days
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenLocalBenchmarks}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Local cost benchmarks
        </button>
      </div>

      {itinerary.map((day) => {
        const isExpanded = expandedDays.includes(day.dayNumber);
        const weather = getWeatherForDay(day.date);

        return (
          <section
            key={`${day.dayNumber}-${day.date}`}
            className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
          >
            <button
              type="button"
              onClick={() => toggleDay(day.dayNumber)}
              className="flex w-full items-center justify-between gap-4 p-4 text-left hover:bg-slate-50"
              aria-expanded={isExpanded}
            >
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-xl bg-indigo-50 text-indigo-700">
                  <span className="text-xs font-medium">DAY</span>
                  <span className="text-lg font-bold">
                    {day.dayNumber}
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-slate-900">
                    {day.title}
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    {day.date} · {day.theme}
                  </p>

                  {weather && (
                    <p className="mt-2 flex items-center gap-1 text-xs text-slate-600">
                      <CloudRain className="h-4 w-4" />
                      {weather.condition} · {weather.tempHighC}°C high
                      {weather.isSampleData ? ' · Sample data' : ''}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-3">
                <span className="text-sm font-semibold text-slate-700">
                  ${Number(day.estimatedCostTotal || 0).toFixed(2)}
                </span>

                {isExpanded ? (
                  <ChevronUp className="h-5 w-5 text-slate-500" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-slate-500" />
                )}
              </div>
            </button>

            {isExpanded && (
              <div className="space-y-4 border-t border-slate-100 p-4">
                {day.activities.map((activity) => (
                  <article
                    key={activity.id}
                    className={`rounded-xl border p-4 transition ${
                      activity.isCompleted
                        ? 'border-green-200 bg-green-50/50'
                        : 'border-slate-200 bg-white'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <button
                        type="button"
                        onClick={() =>
                          toggleCompleted(day.dayNumber, activity.id)
                        }
                        aria-label={
                          activity.isCompleted
                            ? 'Mark activity incomplete'
                            : 'Mark activity complete'
                        }
                        className="mt-1 shrink-0 text-indigo-600"
                      >
                        {activity.isCompleted ? (
                          <CheckCircle2 className="h-5 w-5 text-green-600" />
                        ) : (
                          <Circle className="h-5 w-5" />
                        )}
                      </button>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <h4
                            className={`font-semibold ${
                              activity.isCompleted
                                ? 'text-slate-500 line-through'
                                : 'text-slate-900'
                            }`}
                          >
                            {activity.title}
                          </h4>

                          <span className="rounded-full bg-indigo-50 px-2 py-1 text-xs font-medium capitalize text-indigo-700">
                            {activity.category}
                          </span>
                        </div>

                        <p className="mt-2 text-sm leading-6 text-slate-600">
                          {activity.description}
                        </p>

                        <div className="mt-3 space-y-2 text-sm text-slate-500">
                          <p className="flex items-start gap-2">
                            <Clock className="mt-0.5 h-4 w-4 shrink-0" />
                            <span>
                              {activity.timeString || 'Time to be confirmed'}
                            </span>
                          </p>

                          <p className="flex items-start gap-2">
                            <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                            <span>
                              {activity.locationName || activity.title}
                              {activity.address
                                ? ` — ${activity.address}`
                                : ''}
                            </span>
                          </p>

                          <p className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4 shrink-0" />
                            <span>
                              Estimated cost per person: $
                              {Number(
                                activity.estimatedCostPerPerson || 0
                              ).toFixed(2)}
                            </span>
                          </p>
                        </div>

                        {/* External map links */}
                        <div className="mt-4 flex flex-wrap gap-2">
                          <a
                            href={getGoogleMapsUrl(activity)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 rounded-lg border border-blue-200 px-3 py-2 text-sm font-medium text-blue-700 hover:bg-blue-50"
                          >
                            <Navigation className="h-4 w-4" />
                            Google Maps
                          </a>

                          <a
                            href={getOpenStreetMapUrl(activity)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 rounded-lg border border-green-200 px-3 py-2 text-sm font-medium text-green-700 hover:bg-green-50"
                          >
                            <MapPin className="h-4 w-4" />
                            OpenStreetMap
                          </a>

                          <a
                            href={getDirectionsUrl(activity)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                          >
                            Get Directions
                          </a>

                          <button
                            type="button"
                            onClick={() => onSelectMapActivity(activity)}
                            className="rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                          >
                            Show on app map
                          </button>
                        </div>

                        {activity.indoorAlternative && (
                          <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3">
                            <p className="text-sm font-semibold text-amber-900">
                              Indoor alternative
                            </p>

                            <p className="mt-1 text-sm text-amber-800">
                              {activity.indoorAlternative.title}
                            </p>

                            <p className="mt-1 text-xs text-amber-800">
                              {activity.indoorAlternative.description}
                            </p>

                            <button
                              type="button"
                              onClick={() =>
                                onSwapWithIndoor(
                                  day.dayNumber,
                                  activity.id
                                )
                              }
                              className="mt-3 rounded-lg border border-amber-300 bg-white px-3 py-2 text-sm font-medium text-amber-900 hover:bg-amber-100"
                            >
                              Replace with indoor alternative
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
};

export default ItineraryView;
