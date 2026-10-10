import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import {
  MapPin,
  Clock,
  Train,
  Maximize2,
  Navigation,
} from 'lucide-react';
import { ItineraryDay, Activity, TripPlan } from '../types/travel';
import { getDestinationBenchmark } from '../services/destinationsData';

interface DestinationMapViewProps {
  plan: TripPlan;
  itinerary: ItineraryDay[];
  selectedActivity?: Activity | null;
  onSelectActivity?: (activity: Activity) => void;
}

export const DestinationMapView: React.FC<DestinationMapViewProps> = ({
  plan,
  itinerary,
  selectedActivity,
  onSelectActivity,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const polylineLayerRef = useRef<L.Polyline | null>(null);

  const [selectedDayFilter, setSelectedDayFilter] = useState<number | 'all'>('all');
  const [activePin, setActivePin] = useState<Activity | null>(selectedActivity || null);

  const benchmark = getDestinationBenchmark(plan.destination);

  // All activities flat list
  const allActivities = itinerary.flatMap((day) => day.activities);

  // Filter activities by day
  const visibleActivities: Activity[] = allActivities.filter((act) => {
    if (selectedDayFilter === 'all') return true;
    return act.dayNumber === selectedDayFilter;
  });

  // Synchronize when parent passes selectedActivity (e.g. from Itinerary card)
  useEffect(() => {
    if (selectedActivity) {
      setActivePin(selectedActivity);
      setSelectedDayFilter(selectedActivity.dayNumber);
      if (mapInstanceRef.current && selectedActivity.coordinates?.lat && selectedActivity.coordinates?.lng) {
        mapInstanceRef.current.flyTo(
          [selectedActivity.coordinates.lat, selectedActivity.coordinates.lng],
          15,
          { animate: true, duration: 1.0 }
        );
      }
    }
  }, [selectedActivity]);

  // Initialize Leaflet map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const initialLat = selectedActivity?.coordinates?.lat || benchmark.coordinates.lat || 35.6762;
      const initialLng = selectedActivity?.coordinates?.lng || benchmark.coordinates.lng || 139.6503;

      const map = L.map(mapContainerRef.current, {
        center: [initialLat, initialLng],
        zoom: 13,
        zoomControl: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      markersLayerRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // 'Fit to Itinerary' handler: centers map across scheduled locations
  const handleFitToItinerary = () => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const targetActivities = visibleActivities.length > 0 ? visibleActivities : allActivities;
    if (targetActivities.length === 0) return;

    const validCoords = targetActivities
      .filter((act) => act.coordinates && typeof act.coordinates.lat === 'number' && typeof act.coordinates.lng === 'number')
      .map((act) => [act.coordinates.lat, act.coordinates.lng] as [number, number]);

    if (validCoords.length === 0) return;

    const bounds = L.latLngBounds(validCoords);
    map.fitBounds(bounds, {
      padding: [40, 40],
      maxZoom: 15,
      animate: true,
      duration: 1.0,
    });
  };

  // Render markers and polyline when visibleActivities or activePin changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !markersLayerRef.current) return;

    markersLayerRef.current.clearLayers();
    if (polylineLayerRef.current) {
      polylineLayerRef.current.remove();
      polylineLayerRef.current = null;
    }

    if (visibleActivities.length === 0) return;

    const latLngs: L.LatLngExpression[] = [];

    visibleActivities.forEach((act, index) => {
      if (!act.coordinates || typeof act.coordinates.lat !== 'number' || typeof act.coordinates.lng !== 'number') return;

      const isSelected = activePin?.id === act.id;
      latLngs.push([act.coordinates.lat, act.coordinates.lng]);

      const timeSlotColor =
        act.timeSlot === 'morning'
          ? '#10b981'
          : act.timeSlot === 'midday'
          ? '#f59e0b'
          : act.timeSlot === 'afternoon'
          ? '#3b82f6'
          : '#8b5cf6';

      // Custom marker icon without pin badges
      const customIcon = L.divIcon({
        className: 'custom-leaflet-marker',
        iconSize: [34, 42],
        iconAnchor: [17, 42],
        popupAnchor: [0, -38],
        html: `
          <div style="position: relative; width: 34px; height: 42px; display: flex; flex-direction: column; align-items: center; cursor: pointer;">
            <div style="
              width: 32px; 
              height: 32px; 
              border-radius: 50%; 
              background-color: ${isSelected ? '#4f46e5' : timeSlotColor}; 
              color: white; 
              display: flex; 
              align-items: center; 
              justify-content: center; 
              font-weight: 800; 
              font-size: 13px; 
              box-shadow: 0 3px 8px rgba(0,0,0,0.3); 
              border: 2px solid white;
              ${isSelected ? 'transform: scale(1.2); outline: 3px solid #818cf8;' : ''}
            ">
              ${index + 1}
            </div>
            <div style="
              width: 0; 
              height: 0; 
              border-left: 5px solid transparent; 
              border-right: 5px solid transparent; 
              border-top: 7px solid ${isSelected ? '#4f46e5' : timeSlotColor}; 
              margin-top: -1px;
            "></div>
          </div>
        `,
      });

      const marker = L.marker([act.coordinates.lat, act.coordinates.lng], { icon: customIcon });

      const popupContent = `
        <div style="font-family: system-ui, -apple-system, sans-serif; min-width: 200px; padding: 2px;">
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 6px; margin-bottom: 4px;">
            <span style="font-size: 10px; font-weight: 700; text-transform: uppercase; color: #4f46e5; background: #eef2ff; padding: 2px 6px; border-radius: 4px;">Day ${act.dayNumber} • ${act.timeSlot}</span>
            <span style="font-size: 10px; font-weight: 600; color: #64748b;">${act.timeString}</span>
          </div>
          <h4 style="font-size: 13px; font-weight: 800; color: #0f172a; margin: 4px 0;">${act.title}</h4>
          <p style="font-size: 11px; color: #475569; margin: 0 0 6px 0;">${act.locationName}</p>
          ${act.address ? `<p style="font-size: 10px; color: #64748b; margin: 0 0 6px 0;">📍 ${act.address}</p>` : ''}
          <div style="display: flex; justify-content: space-between; font-size: 11px; font-weight: 600; border-top: 1px solid #e2e8f0; padding-top: 4px; color: #334155;">
            <span>Cost: ${act.estimatedCostPerPerson === 0 ? 'Free' : `$${act.estimatedCostPerPerson}/ea`}</span>
            <span>Crowd: <strong style="text-transform: capitalize;">${act.crowdLevel}</strong></span>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent);

      marker.on('click', () => {
        setActivePin(act);
        if (onSelectActivity) onSelectActivity(act);
      });

      markersLayerRef.current?.addLayer(marker);

      if (isSelected) {
        marker.openPopup();
      }
    });

    // Draw route line
    if (latLngs.length > 1) {
      polylineLayerRef.current = L.polyline(latLngs, {
        color: '#4f46e5',
        weight: 3,
        dashArray: '5, 8',
        opacity: 0.8,
      }).addTo(map);
    }
  }, [visibleActivities, activePin]);

  const currentPin = activePin || (visibleActivities.length > 0 ? visibleActivities[0] : null);

  const handleFlyTo = (act: Activity) => {
    setActivePin(act);
    if (onSelectActivity) onSelectActivity(act);
    if (mapInstanceRef.current && act.coordinates?.lat && act.coordinates?.lng) {
      mapInstanceRef.current.flyTo([act.coordinates.lat, act.coordinates.lng], 15, {
        animate: true,
        duration: 0.8,
      });
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Map Controls */}
      <div className="bg-white rounded-2xl border border-slate-200 p-3 sm:p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <button
            onClick={() => {
              setSelectedDayFilter('all');
              setActivePin(null);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 cursor-pointer ${
              selectedDayFilter === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            All Stops ({allActivities.length})
          </button>

          {itinerary.map((d) => (
            <button
              key={d.dayNumber}
              onClick={() => {
                setSelectedDayFilter(d.dayNumber);
                if (d.activities.length > 0) {
                  handleFlyTo(d.activities[0]);
                }
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                selectedDayFilter === d.dayNumber
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Day {d.dayNumber}
            </button>
          ))}
        </div>

        <button
          onClick={handleFitToItinerary}
          className="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold text-xs border border-indigo-200 transition-colors flex items-center gap-1.5 cursor-pointer self-start sm:self-auto shrink-0"
        >
          <Maximize2 className="w-3.5 h-3.5 text-indigo-600" />
          <span>Fit to Itinerary</span>
        </button>
      </div>

      {/* Map and Inspector Grid */}
      <div className="space-y-4">
        {/* Leaflet Map */}
        <div className="bg-white rounded-2xl border border-slate-200 p-2 shadow-xs">
          <div className="w-full h-[400px] sm:h-[480px] rounded-xl overflow-hidden border border-slate-200">
            <div ref={mapContainerRef} className="w-full h-full" />
          </div>

          {/* Quick Location Pills */}
          <div className="p-2.5 bg-slate-50 border-t border-slate-200 rounded-b-xl flex items-center gap-2 overflow-x-auto text-xs">
            <span className="font-semibold text-slate-500 uppercase tracking-wider shrink-0 text-[10px]">
              Locations:
            </span>
            {visibleActivities.map((act, i) => {
              const isSelected = currentPin?.id === act.id;

              return (
                <button
                  key={act.id}
                  onClick={() => handleFlyTo(act)}
                  className={`px-2.5 py-1 rounded-lg border text-xs font-medium transition-all shrink-0 cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <span className="font-bold mr-1">#{i + 1}</span>
                  <span className="truncate max-w-[120px]">{act.title}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Activity Details Card */}
        {currentPin && (
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200">
                    Day {currentPin.dayNumber} • {currentPin.timeSlot}
                  </span>
                  <span className="text-xs text-slate-500 flex items-center gap-1 font-medium">
                    <Clock className="w-3 h-3 text-slate-400" />
                    {currentPin.timeString}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900">{currentPin.title}</h3>

                <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  <span>{currentPin.locationName}</span>
                  {currentPin.address && <span className="text-slate-400">• {currentPin.address}</span>}
                </p>

                {currentPin.metroStation && (
                  <p className="text-xs text-slate-600 flex items-center gap-1 mt-1 font-medium">
                    <Train className="w-3 h-3 text-indigo-500 shrink-0" />
                    <span>Nearest Station: {currentPin.metroStation}</span>
                  </p>
                )}
              </div>

              <div className="text-left sm:text-right shrink-0">
                <span className="text-[10px] uppercase font-semibold text-slate-400 block">Est. Admission</span>
                <strong className="text-sm font-bold text-slate-900">
                  {currentPin.estimatedCostPerPerson === 0 ? 'Free' : `$${currentPin.estimatedCostPerPerson}/person`}
                </strong>
              </div>
            </div>

            <p className="text-xs text-slate-600 mt-2.5 pt-2.5 border-t border-slate-100 leading-relaxed">
              {currentPin.description}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
