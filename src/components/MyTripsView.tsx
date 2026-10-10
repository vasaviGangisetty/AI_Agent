import React from 'react';
import {
  MapPin,
  Calendar,
  DollarSign,
  Users,
  User,
  Plus,
  Trash2,
  Copy,
  CheckCircle2,
  Compass,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { TripPlan } from '../types/travel';

interface MyTripsViewProps {
  trips: TripPlan[];
  activeTripId: string;
  onSelectTrip: (tripId: string) => void;
  onCreateNewTrip: () => void;
  onDuplicateTrip: (trip: TripPlan) => void;
  onDeleteTrip: (tripId: string) => void;
}

export const MyTripsView: React.FC<MyTripsViewProps> = ({
  trips,
  activeTripId,
  onSelectTrip,
  onCreateNewTrip,
  onDuplicateTrip,
  onDeleteTrip,
}) => {
  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-300 border border-purple-400/30">
              Workspace Trips Manager
            </span>
            <span className="text-xs text-slate-400">{trips.length} Saved Trips</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
            My Travel Itineraries
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-0.5">
            Switch between destinations, archive past vacations, or spin up new journeys.
          </p>
        </div>

        <button
          onClick={onCreateNewTrip}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center gap-2 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Trip</span>
        </button>
      </div>

      {/* Trips Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {trips.map((trip) => {
          const isActive = trip.id === activeTripId;

          return (
            <div
              key={trip.id}
              className={`rounded-2xl border p-5 transition-all flex flex-col justify-between ${
                isActive
                  ? 'bg-white border-indigo-500 shadow-md ring-2 ring-indigo-400/30'
                  : 'bg-white border-slate-200 shadow-2xs hover:border-slate-300 hover:shadow-sm'
              }`}
            >
              <div>
                {/* Status Badges */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span
                    className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold ${
                      isActive
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {isActive ? '● Active Trip' : 'Saved Plan'}
                  </span>

                  <span className="text-[11px] text-slate-400">
                    {trip.durationDays} Days
                  </span>
                </div>

                <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span>{trip.destination}</span>
                </h3>

                <p className="text-xs text-slate-500 mt-1">
                  Starting {trip.startDate} • {trip.travelStyle} style
                </p>

                {/* Metrics */}
                <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-100 text-xs">
                  <div className="p-2.5 bg-slate-50 rounded-xl">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Budget</span>
                    <strong className="text-sm font-extrabold text-slate-900">
                      ${trip.totalBudget.toLocaleString()}
                    </strong>
                  </div>

                  <div className="p-2.5 bg-slate-50 rounded-xl">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Travelers</span>
                    <strong className="text-sm font-extrabold text-slate-900 flex items-center gap-1">
                      {trip.travelerType === 'solo' ? (
                        <>
                          <User className="w-3.5 h-3.5 text-slate-500" /> Solo
                        </>
                      ) : (
                        <>
                          <Users className="w-3.5 h-3.5 text-slate-500" /> Group ({trip.travelerCount})
                        </>
                      )}
                    </strong>
                  </div>
                </div>

                {/* Interests Chips */}
                <div className="flex flex-wrap gap-1 mt-3">
                  {trip.interests.slice(0, 3).map((item) => (
                    <span
                      key={item}
                      className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-semibold rounded-md capitalize"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              {/* Actions Footer */}
              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => onDuplicateTrip(trip)}
                    className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                    title="Duplicate this trip"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  {trips.length > 1 && (
                    <button
                      onClick={() => onDeleteTrip(trip.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="Delete this trip"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {!isActive ? (
                  <button
                    onClick={() => onSelectTrip(trip.id)}
                    className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors cursor-pointer"
                  >
                    Switch to This Trip
                  </button>
                ) : (
                  <span className="text-xs font-bold text-indigo-600 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Selected
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
