import { useEffect } from 'react';
import L from 'leaflet';
import { MapContainer, Marker, TileLayer, useMapEvents } from 'react-leaflet';
import { Crosshair } from 'lucide-react';
import { defaultCenter } from '../lib/constants';

const pinIcon = L.divIcon({
  className: '',
  html: '<div class="civic-pin" style="background:#F59E0B"><span>+</span></div>',
  iconSize: [34, 34],
  iconAnchor: [17, 34]
});

function PickerEvents({ onPick }) {
  useMapEvents({
    click(event) {
      onPick([event.latlng.lat, event.latlng.lng]);
    }
  });
  return null;
}

function Recentre({ position }) {
  const map = useMapEvents({});
  useEffect(() => {
    if (position) map.setView(position, Math.max(map.getZoom(), 15));
  }, [position, map]);
  return null;
}

export default function LocationPicker({ position, onPick, onError }) {
  const useMyLocation = () => {
    if (!navigator.geolocation) {
      onError('Geolocation is not supported by this browser.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (result) => onPick([result.coords.latitude, result.coords.longitude]),
      () => onError('Could not read your location. Please drop a pin on the map.'),
      { enableHighAccuracy: true, timeout: 9000 }
    );
  };

  return (
    <div className="space-y-3">
      <div className="h-72 overflow-hidden rounded-lg border border-slate-200">
        <MapContainer center={position || defaultCenter} zoom={13} className="h-full w-full">
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <PickerEvents onPick={onPick} />
          <Recentre position={position} />
          {position && <Marker position={position} icon={pinIcon} />}
        </MapContainer>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-bold text-slate-600">
          {position ? `${position[0].toFixed(5)}, ${position[1].toFixed(5)}` : 'Tap the map to place the issue pin.'}
        </p>
        <button
          type="button"
          onClick={useMyLocation}
          className="focus-ring inline-flex items-center gap-2 rounded-full bg-teal-civic px-4 py-2 text-sm font-black text-white hover:bg-teal-700"
        >
          <Crosshair className="h-4 w-4" />
          Use My Location
        </button>
      </div>
    </div>
  );
}
