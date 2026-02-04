
export const CURRENCY = '₹';

export const CATEGORIES = [
    { id: 'plumbing', name: 'Plumbing', icon: 'droplets' },
    { id: 'electrical', name: 'Electrical', icon: 'zap' },
    { id: 'cleaning', name: 'Home Cleaning', icon: 'brush' },
    { id: 'carpentry', name: 'Carpentry', icon: 'hammer' },
    { id: 'moving', name: 'Packers & Movers', icon: 'truck' },
    { id: 'ac', name: 'AC Repair', icon: 'zap' },
];

export const STATUS_COLORS: Record<string, string> = {
    POSTED: 'bg-yellow-50 text-yellow-700 border-yellow-100',
    BIDDING: 'bg-indigo-50 text-indigo-700 border-indigo-100',
    ASSIGNED: 'bg-amber-50 text-amber-700 border-amber-100',
    CONFIRMED: 'bg-cyan-50 text-cyan-700 border-cyan-100',
    TRAVELING: 'bg-orange-50 text-orange-700 border-orange-100',
    ARRIVED: 'bg-orange-50 text-orange-700 border-orange-100',
    IN_PROGRESS: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    WORK_COMPLETED: 'bg-green-50 text-green-700 border-green-100',
    VERIFIED: 'bg-green-50 text-green-700 border-green-100',
    PAID: 'bg-slate-50 text-slate-700 border-slate-200',
    COMPLETED: 'bg-slate-50 text-slate-700 border-slate-200',
    CANCELLED: 'bg-red-50 text-red-700 border-red-100',
    DISPUTED: 'bg-purple-50 text-purple-700 border-purple-100',
    // Legacy statuses for backward compatibility
    OPEN: 'bg-blue-50 text-blue-700 border-blue-100',
    ADMIN_REVIEW: 'bg-yellow-50 text-yellow-700 border-yellow-100',
    RECEIVING_BIDS: 'bg-indigo-50 text-indigo-700 border-indigo-100',
};

export const FEATURES = [
    {
        title: "Verified Experts",
        desc: "Every service partner undergoes a rigorous background check and skill assessment.",
        icon: 'shield-check'
    },
    {
        title: "Transparent Pricing",
        desc: "Compare bids from multiple professionals and choose what fits your budget.",
        icon: 'search'
    },
    {
        title: "Instant Support",
        desc: "Dedicated support team available to resolve any disputes or queries.",
        icon: 'users'
    }
];

// Indian States, Cities, and Areas
export const LOCATIONS = {
    'Delhi': {
        'North Delhi': ['Chandni Chowk', 'Civil Lines', 'Kasturba Nagar', 'Model Town'],
        'South Delhi': ['Powai', 'Greater Kailash', 'Vasant Kunj', 'Malviya Nagar', 'Hauz Khas'],
        'East Delhi': ['Preet Vihar', 'Vivek Vihar', 'Laxmi Nagar', 'Krishnanagar'],
        'West Delhi': ['Dwarka', 'Janakpuri', 'Patel Nagar', 'Rohini'],
        'Central Delhi': ['Connaught Place', 'Karol Bagh', 'Paharganj', 'Daryaganj']
    },
    'Maharashtra': {
        'Mumbai': ['Bandra', 'Andheri', 'Dadar', 'Powai', 'Fort', 'Lower Parel', 'Worli'],
        'Pune': ['Hinjewadi', 'Koregaon Park', 'Camp', 'Viman Nagar', 'Kalyani Nagar'],
        'Nagpur': ['Sitabuldi', 'Dharampeth', 'South Nagpur', 'Ramdaspeth']
    },
    'Karnataka': {
        'Bangalore': ['Whitefield', 'Indiranagar', 'Koramangala', 'MG Road', 'Jayanagar', 'BTM Layout'],
        'Mysore': ['Chamundeshwari', 'Ramakrishnanagar', 'Lakshmipuram']
    },
    'Tamil Nadu': {
        'Chennai': ['Adyar', 'Velachery', 'T Nagar', 'Anna Nagar', 'Besant Nagar', 'Nungambakkam'],
        'Coimbatore': ['Gandhipuram', 'R S Puram', 'Peelamedu']
    },
    'Telangana': {
        'Hyderabad': ['Banjara Hills', 'Jubilee Hills', 'HITECH City', 'Gachibowli', 'Secunderabad', 'Somajiguda']
    },
    'West Bengal': {
        'Kolkata': ['Park Circus', 'Ballygunge', 'Alipore', 'Salt Lake', 'Howrah']
    }
};

export const STATES = Object.keys(LOCATIONS);

export function getCities(state: string): string[] {
    return Object.keys((LOCATIONS as any)[state] || {});
}

export function getAreas(state: string, city: string): string[] {
    return (LOCATIONS as any)[state]?.[city] || [];
}
