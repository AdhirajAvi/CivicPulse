import {
  AlertTriangle,
  CircleHelp,
  Construction,
  Dog,
  Droplets,
  Lightbulb,
  Trash2,
  Wrench
} from 'lucide-react';

export const CATEGORIES = [
  'Pothole',
  'Garbage & Waste',
  'Streetlight',
  'Water Leakage/Logging',
  'Broken Road/Footpath',
  'Public Property Damage',
  'Stray Animals',
  'Other'
];

export const STATUSES = ['Reported', 'In Progress', 'Resolved'];

export const CATEGORY_META = {
  Pothole: { color: '#DC2626', icon: AlertTriangle },
  'Garbage & Waste': { color: '#15803D', icon: Trash2 },
  Streetlight: { color: '#CA8A04', icon: Lightbulb },
  'Water Leakage/Logging': { color: '#0284C7', icon: Droplets },
  'Broken Road/Footpath': { color: '#7C3AED', icon: Construction },
  'Public Property Damage': { color: '#B45309', icon: Wrench },
  'Stray Animals': { color: '#DB2777', icon: Dog },
  Other: { color: '#475569', icon: CircleHelp }
};

export const STATUS_META = {
  Reported: { color: '#64748B', bg: 'bg-slate-100', text: 'text-slate-700' },
  'In Progress': { color: '#F59E0B', bg: 'bg-amber-100', text: 'text-amber-800' },
  Resolved: { color: '#16A34A', bg: 'bg-green-100', text: 'text-green-800' }
};

export const defaultCenter = [
  Number(import.meta.env.VITE_DEFAULT_MAP_CENTER_LAT || 23.2599),
  Number(import.meta.env.VITE_DEFAULT_MAP_CENTER_LNG || 77.4126)
];
