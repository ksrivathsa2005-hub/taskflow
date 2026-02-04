export const SERVICE_CATEGORIES = [
    {
        id: 'plumber',
        name: 'Plumber',
        icon: 'Droplet',
        description: 'Plumbing repairs and installation',
        color: 'bg-blue-100 text-blue-700'
    },
    {
        id: 'electrician',
        name: 'Electrician',
        icon: 'Zap',
        description: 'Electrical repairs and wiring',
        color: 'bg-yellow-100 text-yellow-700'
    },
    {
        id: 'carpenter',
        name: 'Carpenter',
        icon: 'Hammer',
        description: 'Carpentry and woodwork',
        color: 'bg-amber-100 text-amber-700'
    },
    {
        id: 'painter',
        name: 'Painter',
        icon: 'Paintbrush',
        description: 'Painting and decorating',
        color: 'bg-rose-100 text-rose-700'
    },
    {
        id: 'cleaner',
        name: 'Cleaner',
        icon: 'Trash2',
        description: 'Cleaning services',
        color: 'bg-green-100 text-green-700'
    },
    {
        id: 'ac-repair',
        name: 'AC Repair',
        icon: 'Wind',
        description: 'Air conditioning repair',
        color: 'bg-cyan-100 text-cyan-700'
    },
    {
        id: 'pest-control',
        name: 'Pest Control',
        icon: 'Bug',
        description: 'Pest control services',
        color: 'bg-purple-100 text-purple-700'
    },
    {
        id: 'gardener',
        name: 'Gardener',
        icon: 'Leaf',
        description: 'Gardening and landscaping',
        color: 'bg-emerald-100 text-emerald-700'
    },
    {
        id: 'locksmith',
        name: 'Locksmith',
        icon: 'Lock',
        description: 'Lock and key services',
        color: 'bg-slate-100 text-slate-700'
    },
    {
        id: 'appliance-repair',
        name: 'Appliance Repair',
        icon: 'Wrench',
        description: 'Appliance repair services',
        color: 'bg-orange-100 text-orange-700'
    }
];

export function getCategoryName(categoryId: string): string {
    const category = SERVICE_CATEGORIES.find(c => c.id === categoryId);
    return category ? category.name : categoryId;
}

export function getCategoryIcon(categoryId: string): string {
    const category = SERVICE_CATEGORIES.find(c => c.id === categoryId);
    return category ? category.icon : 'Briefcase';
}

export function getCategoryColor(categoryId: string): string {
    const category = SERVICE_CATEGORIES.find(c => c.id === categoryId);
    return category ? category.color : 'bg-gray-100 text-gray-700';
}
