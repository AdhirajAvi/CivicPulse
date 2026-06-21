import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import L from 'leaflet';
import { MapContainer, Marker, Popup, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import { CATEGORY_META, defaultCenter } from '../lib/constants';
import { CategoryBadge, StatusBadge } from './Badges';

function makePin(category) {
  const meta = CATEGORY_META[category] || CATEGORY_META.Other;
  return L.divIcon({
    className: '',
    html: `<div class="civic-pin" style="background:${meta.color}"><span>${category.slice(0, 1)}</span></div>`,
    iconSize: [34, 34],
    iconAnchor: [17, 34],
    popupAnchor: [0, -30]
  });
}

function makeCluster(count) {
  return L.divIcon({
    className: '',
    html: `<div class="civic-cluster">${count}</div>`,
    iconSize: [42, 42],
    iconAnchor: [21, 21]
  });
}

function ZoomTracker({ onZoom }) {
  const map = useMapEvents({
    zoomend() {
      onZoom(map.getZoom());
    }
  });
  return null;
}

function ClusterMarker({ cluster }) {
  const map = useMap();
  return (
    <Marker
      position={[cluster.lat, cluster.lng]}
      icon={makeCluster(cluster.items.length)}
      eventHandlers={{
        click: () => map.setView([cluster.lat, cluster.lng], Math.min(map.getZoom() + 2, 18))
      }}
    />
  );
}

function groupIssues(issues, zoom) {
  if (zoom >= 14) return issues.map((issue) => ({ type: 'issue', issue }));
  const precision = zoom <= 11 ? 70 : 140;
  const groups = new Map();

  issues.forEach((issue) => {
    const [lng, lat] = issue.location.coordinates;
    const key = `${Math.round(lat * precision)}:${Math.round(lng * precision)}`;
    const existing = groups.get(key) || { items: [], latSum: 0, lngSum: 0 };
    existing.items.push(issue);
    existing.latSum += lat;
    existing.lngSum += lng;
    groups.set(key, existing);
  });

  return Array.from(groups.values()).map((group) => {
    if (group.items.length === 1) return { type: 'issue', issue: group.items[0] };
    return {
      type: 'cluster',
      items: group.items,
      lat: group.latSum / group.items.length,
      lng: group.lngSum / group.items.length
    };
  });
}

export default function CivicMap({ issues, height = 'min-h-[520px]' }) {
  const [zoom, setZoom] = useState(12);
  const points = useMemo(() => groupIssues(issues, zoom), [issues, zoom]);

  return (
    <div className={`${height} overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm`}>
      <MapContainer center={defaultCenter} zoom={12} scrollWheelZoom className="h-full min-h-[inherit] w-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ZoomTracker onZoom={setZoom} />
        {points.map((point) => {
          if (point.type === 'cluster') {
            return <ClusterMarker key={`cluster-${point.lat}-${point.lng}-${point.items.length}`} cluster={point} />;
          }

          const issue = point.issue;
          const [lng, lat] = issue.location.coordinates;
          return (
            <Marker key={issue.id} position={[lat, lng]} icon={makePin(issue.category)}>
              <Popup>
                <div className="space-y-2">
                  <img src={issue.photoUrl} alt={issue.title} className="h-24 w-full rounded-md object-cover" />
                  <div className="flex flex-wrap gap-1.5">
                    <CategoryBadge category={issue.category} />
                    <StatusBadge status={issue.status} />
                  </div>
                  <p className="font-black leading-5 text-ink">{issue.title}</p>
                  <p className="text-sm font-bold text-slate-600">{issue.upvoteCount} upvotes</p>
                  <Link to={`/issue/${issue.id}`} className="inline-flex rounded-full bg-teal-civic px-3 py-1.5 text-sm font-black text-white">
                    View Details
                  </Link>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
