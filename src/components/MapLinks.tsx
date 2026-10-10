
import React from 'react';

interface MapLinksProps {
  locationName: string;
  destination: string;
  address?: string;
  coordinates?: {
    lat?: number | null;
    lng?: number | null;
  };
}

const MapLinks: React.FC<MapLinksProps> = ({
  locationName,
  destination,
  address,
  coordinates,
}) => {
  const searchQuery = [
    locationName,
    address,
    destination,
  ]
    .filter(Boolean)
    .join(', ');

  const query = encodeURIComponent(searchQuery);

  const lat = coordinates?.lat;
  const lng = coordinates?.lng;

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

  const googleMapsUrl = hasCoordinates
    ? `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`
    : `https://www.google.com/maps/search/?api=1&query=${query}`;

  const openStreetMapUrl = hasCoordinates
    ? `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=16/${lat}/${lng}`
    : `https://www.openstreetmap.org/search?query=${query}`;

  const directionsUrl = hasCoordinates
    ? `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`
    : `https://www.google.com/maps/dir/?api=1&destination=${query}`;

  const commonStyle =
    'inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors hover:bg-slate-100';

  return (
    <div className="mt-3 flex flex-wrap gap-2">
      <a
        href={googleMapsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={`${commonStyle} border-blue-200 text-blue-700`}
      >
        <span aria-hidden="true">↗</span>
        Open in Google Maps
      </a>

      <a
        href={openStreetMapUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={`${commonStyle} border-green-200 text-green-700`}
      >
        <span aria-hidden="true">↗</span>
        Open in OpenStreetMap
      </a>

      <a
        href={directionsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={`${commonStyle} border-slate-200 text-slate-700`}
      >
        <span aria-hidden="true">↗</span>
        Get Directions
      </a>
    </div>
  );
};

export default MapLinks;
