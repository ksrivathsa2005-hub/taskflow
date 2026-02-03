
export enum UserRole {
  CUSTOMER = 'CUSTOMER',
  WORKER = 'WORKER',
  ADMIN = 'ADMIN'
}

export enum TaskStatus {
  OPEN = 'OPEN',
  RECEIVING_BIDS = 'RECEIVING_BIDS',
  ASSIGNED = 'ASSIGNED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  phone?: string;
  address?: string;
  isBusy?: boolean;
  rating: number;
  completedJobs: number;
  skills?: string[];
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

export interface Task {
  id: string;
  title: string;
  description: string;
  category: string;
  location: string;
  customerId: string;
  workerId?: string;
  status: TaskStatus;
  budgetMin: number;
  budgetMax: number;
  preferredDate: string;
  photos: string[];
  bids: Bid[];
  checkInTime?: string;
  progressUpdates: string[];
}

export interface AppState {
  currentUser: User | null;
  tasks: Task[];
  users: User[];
}
