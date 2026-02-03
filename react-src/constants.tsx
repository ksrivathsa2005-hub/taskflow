
import React from 'react';
import { 
  Wrench, 
  Zap, 
  Droplets, 
  Brush, 
  Hammer, 
  Truck, 
  LayoutGrid,
  ShieldCheck,
  Star,
  Clock,
  MapPin,
  CheckCircle,
  Search,
  Users
} from 'lucide-react';

export const CURRENCY = '₹';

export const CATEGORIES = [
  { id: 'plumbing', name: 'Plumbing', icon: <Droplets className="w-5 h-5" /> },
  { id: 'electrical', name: 'Electrical', icon: <Zap className="w-5 h-5" /> },
  { id: 'cleaning', name: 'Home Cleaning', icon: <Brush className="w-5 h-5" /> },
  { id: 'carpentry', name: 'Carpentry', icon: <Hammer className="w-5 h-5" /> },
  { id: 'moving', name: 'Packers & Movers', icon: <Truck className="w-5 h-5" /> },
  { id: 'ac', name: 'AC Repair', icon: <Zap className="w-5 h-5" /> },
];

export const STATUS_COLORS: Record<string, string> = {
  OPEN: 'bg-blue-50 text-blue-700 border-blue-100',
  RECEIVING_BIDS: 'bg-indigo-50 text-indigo-700 border-indigo-100',
  ASSIGNED: 'bg-amber-50 text-amber-700 border-amber-100',
  IN_PROGRESS: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  COMPLETED: 'bg-slate-50 text-slate-700 border-slate-200',
  CANCELLED: 'bg-red-50 text-red-700 border-red-100',
};

export const FEATURES = [
  {
    title: "Verified Experts",
    desc: "Every service partner undergoes a rigorous background check and skill assessment.",
    icon: <ShieldCheck className="w-6 h-6 text-indigo-600" />
  },
  {
    title: "Transparent Pricing",
    desc: "Compare bids from multiple professionals and choose what fits your budget.",
    icon: <Search className="w-6 h-6 text-indigo-600" />
  },
  {
    title: "Instant Support",
    desc: "Dedicated support team available to resolve any disputes or queries.",
    icon: <Users className="w-6 h-6 text-indigo-600" />
  }
];
