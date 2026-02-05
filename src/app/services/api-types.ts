// API Type Definitions matching backend responses

// Backend expects role as number: 0 = CUSTOMER, 1 = WORKER, 2 = ADMIN
export type ApiUserRole = 0 | 1 | 2;

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role: ApiUserRole;
  phone?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: ApiUser;
}

export interface ApiUser {
  id: string;
  name: string;
  email: string;
  role: string | number; // Backend sends as number (0, 1, 2) but can also be string
  avatar?: string;
  status: string;
  rating: number;
  completedJobs: number;
  phone?: string;
  isBusy?: boolean;
  skills?: string[];
  categories?: string[];
  experience?: number;
}

export type ApiTaskStatus = 
  | 'POSTED' 
  | 'BIDDING' 
  | 'ASSIGNED' 
  | 'CONFIRMED' 
  | 'TRAVELING' 
  | 'ARRIVED' 
  | 'IN_PROGRESS' 
  | 'WORK_COMPLETED' 
  | 'VERIFIED' 
  | 'PAID' 
  | 'COMPLETED' 
  | 'CANCELLED' 
  | 'DISPUTED';

export interface ApiTaskLocation {
  id?: string;
  taskId?: string;
  state: string;
  city: string;
  area?: string;
  fullAddress: string;
  latitude?: number;
  longitude?: number;
}

export interface ApiTaskPhoto {
  id: string;
  taskId: string;
  photoUrl: string;
  uploadedDate: string;
}

export interface ApiBid {
  id: string;
  taskId: string;
  workerId: string;
  workerName: string;
  workerAvatar?: string;
  workerRating: number;
  amount: number;
  estimatedDays: number;
  message?: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  createdDate: string;
  worker?: ApiUser;
}

export interface ApiProgressUpdate {
  id: string;
  taskId: string;
  status: ApiTaskStatus;
  title: string;
  description: string;
  timestamp: string;
}

export interface ApiReview {
  id: string;
  taskId: string;
  reviewerId: string;
  reviewerName: string;
  revieweeId: string;
  revieweeName: string;
  rating: number;
  comment: string;
  createdDate: string;
}

export interface ApiDispute {
  id: string;
  taskId: string;
  taskTitle?: string;
  initiatorId: string;
  initiatorName?: string;
  initiatorRole: string;
  respondentId: string;
  respondentName?: string;
  reason: string;
  issueType?: string;
  evidence?: ApiEvidence[];
  status: 'PENDING' | 'IN_PROGRESS' | 'RESOLVED';
  messages: ApiChatMessage[];
  messagesCount?: number;
  evidenceCount?: number;
  createdDate: string;
  resolvedDate?: string;
  adminNotes?: string;
}

export interface ApiEvidence {
  id: string;
  evidenceUrl: string;
  uploadedDate: string;
}

export interface ApiChatMessage {
  id: string;
  disputeId?: string;
  senderId: string;
  senderName: string;
  message: string;
  timestamp: string;
}

export interface ApiTask {
  id: string;
  title: string;
  description: string;
  category: string;
  customerId: string;
  workerId?: string;
  workerName?: string;
  status: ApiTaskStatus;
  budgetMin: number;
  budgetMax: number;
  preferredDate: string;
  checkInTime?: string;
  adminReviewNotes?: string;
  createdDate: string;
  completionDate?: string;
  updatedDate: string;
  location?: ApiTaskLocation | string; // Can be object or stringified JSON
  photos: ApiTaskPhoto[];
  bids: ApiBid[];
  progressUpdates: ApiProgressUpdate[];
  reviews: ApiReview[];
  disputes: ApiDispute[];
}

export interface CreateTaskRequest {
  title: string;
  description: string;
  category: string;
  budgetMin: number;
  budgetMax: number;
  preferredDate: string; // ISO date string
  location: CreateTaskLocation;
  photos?: string[];
}

export interface CreateTaskLocation {
  state: string;
  city: string;
  area?: string;
  fullAddress: string;
  latitude?: number;
  longitude?: number;
}

export interface UpdateTaskStatusRequest {
  status: ApiTaskStatus;
}

export interface CreateBidRequest {
  taskId: string;
  amount: number;
  estimatedDays: number;
  message?: string;
}

export interface TasksResponse {
  data: ApiTask[];
  total: number;
}

export interface BidsResponse {
  data: ApiBid[];
}

export interface TaskFilters {
  status?: ApiTaskStatus;
  category?: string;
  customerId?: string;
  workerId?: string;
}

export interface ErrorResponse {
  message: string;
  statusCode?: number;
  details?: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface LogoutRequest {
  refreshToken: string;
}

// ==================== REVIEW TYPES ====================

export interface CreateReviewRequest {
  taskId: string;
  revieweeId: string;
  rating: number;
  comment: string;
}

export interface ReviewsResponse {
  data: ApiReview[];
  averageRating?: number;
  totalReviews?: number;
}

export interface WorkerStatsResponse {
  workerId: string;
  averageRating: number;
  totalReviews: number;
}

export interface ReviewFilters {
  workerId?: string;
  taskId?: string;
  rating?: number;
}

// ==================== DISPUTE TYPES ====================

export interface CreateDisputeRequest {
  taskId: string;
  respondentId: string;
  reason: string;
  issueType?: string;
  evidence?: string[];
}

export interface AddDisputeMessageRequest {
  message: string;
}

export interface ResolveDisputeRequest {
  adminNotes: string;
}

export interface DisputesResponse {
  data: ApiDispute[];
}

export interface DisputeMessagesResponse {
  data: ApiChatMessage[];
}

export interface DisputeFilters {
  status?: 'PENDING' | 'IN_PROGRESS' | 'RESOLVED';
}

// ==================== USER TYPES ====================

export interface UpdateUserRequest {
  name?: string;
  phone?: string;
  avatar?: string;
  experience?: number;
  skills?: string[];
  categories?: string[];
}

export interface UsersResponse {
  data: ApiUser[];
  total: number;
}

export interface UserFilters {
  role?: string;
  status?: string;
}

export interface WorkerFilters {
  category?: string;
  available?: boolean;
  minRating?: number;
}

export interface UpdateBusyStatusRequest {
  isBusy: boolean;
}

// ==================== ADMIN TYPES ====================

export interface AdminDashboardResponse {
  totalUsers: number;
  totalCustomers: number;
  totalWorkers: number;
  totalTasks: number;
  totalDisputes: number;
  pendingDisputes: number;
  activeWorkers: number;
  pendingApprovals: number;
  tasksCompletedThisMonth: number;
  tasksPostedThisMonth: number;
  totalRevenue: number;
  revenueThisMonth: number;
  tasksByStatus: Record<string, number>;
  recentActivities: AdminActivity[];
}

export interface AdminActivity {
  id: string;
  activityType: string;
  message: string;
  timestamp: string;
  icon?: string;
  color?: string;
}

export interface ApproveTaskRequest {
  notes?: string;
}

export interface RejectTaskRequest {
  reason: string;
}
