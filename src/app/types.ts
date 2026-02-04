
export enum UserRole {
    CUSTOMER = 'CUSTOMER',
    WORKER = 'WORKER',
    ADMIN = 'ADMIN'
}

export enum TaskStatus {
    POSTED = 'POSTED',
    BIDDING = 'BIDDING',
    ASSIGNED = 'ASSIGNED',
    CONFIRMED = 'CONFIRMED',
    TRAVELING = 'TRAVELING',
    ARRIVED = 'ARRIVED',
    IN_PROGRESS = 'IN_PROGRESS',
    WORK_COMPLETED = 'WORK_COMPLETED',
    VERIFIED = 'VERIFIED',
    PAID = 'PAID',
    COMPLETED = 'COMPLETED',
    CANCELLED = 'CANCELLED',
    DISPUTED = 'DISPUTED'
}

export enum DisputeStatus {
    PENDING = 'PENDING',
    IN_PROGRESS = 'IN_PROGRESS',
    RESOLVED = 'RESOLVED'
}

export enum UserStatus {
    ACTIVE = 'ACTIVE',
    SUSPENDED = 'SUSPENDED',
    UNVERIFIED = 'UNVERIFIED'
}

export interface Address {
    state: string;
    city: string;
    area: string;
    fullAddress: string;
    coordinates?: {
        latitude: number;
        longitude: number;
    };
}

export interface User {
    id: string;
    name: string;
    email: string;
    password?: string;
    role: UserRole;
    avatar: string;
    phone?: string;
    address?: Address;
    isBusy?: boolean;
    rating: number;
    completedJobs: number;
    skills?: string[];
    categories?: string[];
    experience?: number;
    status: UserStatus;
    createdDate?: string;
}

export interface Bid {
    id: string;
    taskId: string;
    workerId: string;
    workerName: string;
    workerAvatar: string;
    workerRating: number;
    amount: number;
    estimatedDays: number;
    message: string;
    status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
}

export interface ProgressUpdate {
    timestamp: string;
    status: TaskStatus;
    title: string;
    description: string;
}

export interface Task {
    id: string;
    title: string;
    description: string;
    category: string;
    location: Address;
    customerId: string;
    workerId?: string;
    workerName?: string;
    status: TaskStatus;
    budgetMin: number;
    budgetMax: number;
    preferredDate: string;
    photos: string[];
    bids: Bid[];
    checkInTime?: string;
    progressUpdates: ProgressUpdate[];
    reviews: Review[];
    adminReviewNotes?: string;
    createdDate?: string;
    completionDate?: string;
}

export interface Review {
    id: string;
    taskId: string;
    reviewerId: string;
    reviewerName: string;
    rating: number;
    comment: string;
    createdDate: string;
    revieweeId: string;
}

export interface ChatMessage {
    id: string;
    senderId: string;
    senderName: string;
    message: string;
    timestamp: string;
}

export interface Dispute {
    id: string;
    taskId: string;
    initiatorId: string;
    initiatorRole: UserRole;
    respondentId: string;
    reason: string;
    issueType?: string;
    evidence?: string[];
    status: DisputeStatus;
    messages: ChatMessage[];
    createdDate: string;
    resolvedDate?: string;
    adminNotes?: string;
}

export interface AppState {
    currentUser: User | null;
    tasks: Task[];
    users: User[];
    disputes: Dispute[];
}
