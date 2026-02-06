import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  RefreshTokenRequest,
  LogoutRequest,
  ApiTask,
  TasksResponse,
  CreateTaskRequest,
  UpdateTaskStatusRequest,
  ApiBid,
  BidsResponse,
  CreateBidRequest,
  TaskFilters,
  ApiUser,
  ApiTaskStatus,
  CreateReviewRequest,
  ReviewsResponse,
  WorkerStatsResponse,
  ReviewFilters,
  ApiReview,
  CreateDisputeRequest,
  AddDisputeMessageRequest,
  ResolveDisputeRequest,
  DisputesResponse,
  DisputeMessagesResponse,
  DisputeFilters,
  ApiDispute,
  UpdateUserRequest,
  UsersResponse,
  UserFilters,
  WorkerFilters,
  UpdateBusyStatusRequest,
  AdminDashboardResponse,
  ApproveTaskRequest,
  RejectTaskRequest,
  ApiUserAddress,
  CreateAddressRequest,
  UpdateAddressRequest
} from './api-types';

@Injectable({
  providedIn: 'root'
})
export class TaskFlowApiService {
  private baseUrl = environment.apiUrl;
  private currentUserSubject = new BehaviorSubject<ApiUser | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    // Load user from localStorage on init
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      try {
        this.currentUserSubject.next(JSON.parse(storedUser));
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('currentUser');
      }
    }
  }

  // ==================== AUTH ====================

  register(data: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/auth/register`, data)
      .pipe(tap(response => this.handleAuthSuccess(response)));
  }

  login(data: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/auth/login`, data)
      .pipe(tap(response => this.handleAuthSuccess(response)));
  }

  logout(refreshToken: string): Observable<any> {
    const request: LogoutRequest = { refreshToken };
    return this.http.post(`${this.baseUrl}/auth/logout`, request)
      .pipe(tap(() => this.handleLogout()));
  }

  refreshToken(refreshToken: string): Observable<AuthResponse> {
    const request: RefreshTokenRequest = { refreshToken };
    return this.http.post<AuthResponse>(`${this.baseUrl}/auth/refresh-token`, request)
      .pipe(tap(response => this.handleAuthSuccess(response)));
  }

  getCurrentUser(): Observable<ApiUser> {
    return this.http.get<ApiUser>(`${this.baseUrl}/auth/me`);
  }

  private handleAuthSuccess(response: AuthResponse): void {
    console.log('Auth Success - Storing tokens:', response);
    localStorage.setItem('accessToken', response.accessToken);
    localStorage.setItem('refreshToken', response.refreshToken);
    localStorage.setItem('currentUser', JSON.stringify(response.user));
    this.currentUserSubject.next(response.user);
    console.log('Tokens stored. Access token:', localStorage.getItem('accessToken'));
  }

  private handleLogout(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
  }

  // ==================== TASKS ====================

  getTasks(filters?: TaskFilters): Observable<TasksResponse> {
    let params = new HttpParams();
    
    if (filters) {
      if (filters.status) {
        params = params.set('status', filters.status);
      }
      if (filters.category) {
        params = params.set('category', filters.category);
      }
      if (filters.customerId) {
        params = params.set('customerId', filters.customerId);
      }
      if (filters.workerId) {
        params = params.set('workerId', filters.workerId);
      }
    }

    return this.http.get<TasksResponse>(`${this.baseUrl}/tasks`, { params });
  }

  getTaskById(id: string): Observable<ApiTask> {
    return this.http.get<ApiTask>(`${this.baseUrl}/tasks/${id}`);
  }

  createTask(task: CreateTaskRequest): Observable<ApiTask> {
    return this.http.post<ApiTask>(`${this.baseUrl}/tasks`, task);
  }

  updateTaskStatus(id: string, status: ApiTaskStatus): Observable<ApiTask> {
    const request: UpdateTaskStatusRequest = { status };
    return this.http.put<ApiTask>(`${this.baseUrl}/tasks/${id}/status`, request);
  }

  deleteTask(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/tasks/${id}`);
  }

  // ==================== BIDS ====================

  getBidsForTask(taskId: string): Observable<BidsResponse> {
    return this.http.get<BidsResponse>(`${this.baseUrl}/bids/task/${taskId}`);
  }

  createBid(bid: CreateBidRequest): Observable<ApiBid> {
    return this.http.post<ApiBid>(`${this.baseUrl}/bids`, bid);
  }

  acceptBid(bidId: string): Observable<ApiBid> {
    return this.http.put<ApiBid>(`${this.baseUrl}/bids/${bidId}/accept`, {});
  }

  rejectBid(bidId: string): Observable<ApiBid> {
    return this.http.put<ApiBid>(`${this.baseUrl}/bids/${bidId}/reject`, {});
  }

  // ==================== REVIEWS ====================

  getReviews(filters?: ReviewFilters): Observable<ReviewsResponse> {
    let params = new HttpParams();
    if (filters) {
      if (filters.workerId) params = params.set('workerId', filters.workerId);
      if (filters.taskId) params = params.set('taskId', filters.taskId);
      if (filters.rating) params = params.set('rating', filters.rating.toString());
    }
    return this.http.get<ReviewsResponse>(`${this.baseUrl}/reviews`, { params });
  }

  getReviewById(id: string): Observable<ApiReview> {
    return this.http.get<ApiReview>(`${this.baseUrl}/reviews/${id}`);
  }

  createReview(review: CreateReviewRequest): Observable<ApiReview> {
    return this.http.post<ApiReview>(`${this.baseUrl}/reviews`, review);
  }

  deleteReview(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/reviews/${id}`);
  }

  getWorkerStats(workerId: string): Observable<WorkerStatsResponse> {
    return this.http.get<WorkerStatsResponse>(`${this.baseUrl}/reviews/stats/${workerId}`);
  }

  // ==================== DISPUTES ====================

  getDisputes(filters?: DisputeFilters): Observable<DisputesResponse> {
    let params = new HttpParams();
    if (filters?.status) {
      params = params.set('status', filters.status);
    }
    return this.http.get<DisputesResponse>(`${this.baseUrl}/disputes`, { params });
  }

  getDisputeById(id: string): Observable<ApiDispute> {
    return this.http.get<ApiDispute>(`${this.baseUrl}/disputes/${id}`);
  }

  createDispute(dispute: CreateDisputeRequest): Observable<ApiDispute> {
    return this.http.post<ApiDispute>(`${this.baseUrl}/disputes`, dispute);
  }

  addDisputeMessage(disputeId: string, message: AddDisputeMessageRequest): Observable<any> {
    return this.http.post(`${this.baseUrl}/disputes/${disputeId}/messages`, message);
  }

  getDisputeMessages(disputeId: string): Observable<DisputeMessagesResponse> {
    return this.http.get<DisputeMessagesResponse>(`${this.baseUrl}/disputes/${disputeId}/messages`);
  }

  resolveDispute(disputeId: string, request: ResolveDisputeRequest): Observable<ApiDispute> {
    return this.http.put<ApiDispute>(`${this.baseUrl}/disputes/${disputeId}/resolve`, request);
  }

  // ==================== USERS ====================

  getUsers(filters?: UserFilters): Observable<UsersResponse> {
    let params = new HttpParams();
    if (filters) {
      if (filters.role) params = params.set('role', filters.role);
      if (filters.status) params = params.set('status', filters.status);
    }
    return this.http.get<UsersResponse>(`${this.baseUrl}/users`, { params });
  }

  getUserById(id: string): Observable<ApiUser> {
    return this.http.get<ApiUser>(`${this.baseUrl}/users/${id}`);
  }

  updateUser(id: string, data: UpdateUserRequest): Observable<ApiUser> {
    return this.http.put<ApiUser>(`${this.baseUrl}/users/${id}`, data);
  }

  suspendUser(id: string): Observable<any> {
    return this.http.put(`${this.baseUrl}/users/${id}/suspend`, {});
  }

  activateUser(id: string): Observable<any> {
    return this.http.put(`${this.baseUrl}/users/${id}/activate`, {});
  }

  updateBusyStatus(id: string, request: UpdateBusyStatusRequest): Observable<any> {
    return this.http.put(`${this.baseUrl}/users/${id}/busy`, request);
  }

  getWorkers(filters?: WorkerFilters): Observable<UsersResponse> {
    let params = new HttpParams();
    if (filters) {
      if (filters.category) params = params.set('category', filters.category);
      if (filters.available !== undefined) params = params.set('available', filters.available.toString());
      if (filters.minRating) params = params.set('minRating', filters.minRating.toString());
    }
    return this.http.get<UsersResponse>(`${this.baseUrl}/users/workers`, { params });
  }

  // ==================== ADDRESSES ====================

  getUserAddresses(userId: string): Observable<{ data: ApiUserAddress[] }> {
    return this.http.get<{ data: ApiUserAddress[] }>(`${this.baseUrl}/users/${userId}/addresses`);
  }

  addUserAddress(userId: string, address: CreateAddressRequest): Observable<ApiUserAddress> {
    return this.http.post<ApiUserAddress>(`${this.baseUrl}/users/${userId}/addresses`, address);
  }

  updateUserAddress(userId: string, addressId: string, address: UpdateAddressRequest): Observable<ApiUserAddress> {
    return this.http.put<ApiUserAddress>(`${this.baseUrl}/users/${userId}/addresses/${addressId}`, address);
  }

  deleteUserAddress(userId: string, addressId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/users/${userId}/addresses/${addressId}`);
  }

  setDefaultAddress(userId: string, addressId: string): Observable<ApiUserAddress> {
    return this.http.put<ApiUserAddress>(`${this.baseUrl}/users/${userId}/addresses/${addressId}/default`, {});
  }

  // ==================== ADMIN ====================

  getAdminDashboard(): Observable<AdminDashboardResponse> {
    return this.http.get<AdminDashboardResponse>(`${this.baseUrl}/admin/dashboard`);
  }

  getPendingTasks(): Observable<TasksResponse> {
    return this.http.get<TasksResponse>(`${this.baseUrl}/admin/tasks/pending`);
  }

  approveTask(id: string, request?: ApproveTaskRequest): Observable<ApiTask> {
    return this.http.put<ApiTask>(`${this.baseUrl}/admin/tasks/${id}/approve`, request || {});
  }

  rejectTask(id: string, request: RejectTaskRequest): Observable<ApiTask> {
    return this.http.put<ApiTask>(`${this.baseUrl}/admin/tasks/${id}/reject`, request);
  }

  getActivityLog(count?: number): Observable<any> {
    let params = new HttpParams();
    if (count) params = params.set('count', count.toString());
    return this.http.get(`${this.baseUrl}/admin/activities`, { params });
  }

  // ==================== HELPERS ====================

  get isLoggedIn(): boolean {
    return !!localStorage.getItem('accessToken');
  }

  get currentUser(): ApiUser | null {
    return this.currentUserSubject.value;
  }

  clearAuthData(): void {
    this.handleLogout();
  }
}
