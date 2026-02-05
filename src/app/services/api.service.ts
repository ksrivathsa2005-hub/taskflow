import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

// Request/Response interfaces matching API documentation
export interface TaskLocation {
    id?: string;
    taskId?: string;
    state: string;
    city: string;
    area: string;
    fullAddress: string;
    latitude?: number;
    longitude?: number;
}

export interface TaskPhoto {
    id?: string;
    taskId?: string;
    photoUrl: string;
    uploadedDate?: string;
}

export interface TaskBid {
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
    createdDate: string;
    worker?: any;
}

export interface TaskProgressUpdate {
    id?: string;
    taskId?: string;
    status: string;
    title: string;
    description: string;
    timestamp: string;
}

export interface ApiTask {
    id: string;
    title: string;
    description: string;
    category: string;
    customerId: string;
    customerName?: string;
    workerId?: string | null;
    workerName?: string | null;
    status: string;
    budgetMin: number;
    budgetMax: number;
    preferredDate: string;
    checkInTime?: string | null;
    adminReviewNotes?: string | null;
    createdDate: string;
    completionDate?: string | null;
    updatedDate: string;
    location: TaskLocation;
    photos: TaskPhoto[];
    bids: TaskBid[];
    progressUpdates: TaskProgressUpdate[];
    reviews: any[];
    disputes: any[];
}

export interface TaskListResponse {
    data: ApiTask[];
    total: number;
}

export interface CreateTaskRequest {
    title: string;
    description: string;
    category: string;
    budgetMin: number;
    budgetMax: number;
    preferredDate: string;
    location: {
        state: string;
        city: string;
        area: string;
        fullAddress: string;
        latitude?: number;
        longitude?: number;
    };
    photos?: string[];
}

export interface CreateBidRequest {
    taskId: string;
    amount: number;
    estimatedDays: number;
    message: string;
}

export interface CreateReviewRequest {
    taskId: string;
    revieweeId: string;
    rating: number;
    comment: string;
}

export interface ReviewListResponse {
    data: any[];
    averageRating?: number;
    totalReviews?: number;
}

export interface CreateDisputeRequest {
    taskId: string;
    respondentId: string;
    reason: string;
    issueType: string;
    evidence?: string[];
}

export interface DisputeListResponse {
    data: any[];
}

export interface UserListResponse {
    data: any[];
    total: number;
}

// ==================== LOCATION APIS ====================

export interface ApiResponse<T> {
    data: T;
}

export interface LocationState {
    id: string;
    name: string;
    code: string;
}

export interface LocationCity {
    id: string;
    name: string;
    stateId: string;
    latitude: number;
    longitude: number;
}

export interface LocationCityWithDetails extends LocationCity {
    stateName?: string;
    distance?: number;
}

export interface LocationArea {
    id: string;
    name: string;
    cityId: string;
    pincode: string;
    latitude: number;
    longitude: number;
}

export interface LocationAreaWithDetails extends LocationArea {
    cityName?: string;
    distance?: number;
}

export interface LocationSearchResult {
    type: 'city' | 'area';
    id: string;
    name: string;
    subtext: string;
    latitude: number;
    longitude: number;
}

export interface LocationServiceCategory {
    id: string;
    name: string;
    icon: string;
    description: string;
}

export interface LocationFull {
    areaId: string;
    areaName: string;
    cityId: string;
    cityName: string;
    stateId: string;
    stateName: string;
    pincode: string;
    latitude: number;
    longitude: number;
    fullAddress: string;
}

export interface LocationAddressResult {
    fullAddress: string;
    area: string;
    city: string;
    state: string;
    pincode: string;
    latitude: number;
    longitude: number;
}

export interface LocationDistanceResult {
    distanceKm: number;
    distanceFormatted: string;
}

@Injectable({
    providedIn: 'root'
})
export class ApiService {
    private http = inject(HttpClient);
    private authService = inject(AuthService);

    private readonly API_BASE_URL = 'https://unsplendorous-scarcely-ashley.ngrok-free.dev/api';

    private get headers(): HttpHeaders {
        const token = this.authService.accessToken;
        return new HttpHeaders({
            'Content-Type': 'application/json',
            'ngrok-skip-browser-warning': 'true',
            ...(token && { Authorization: `Bearer ${token}` })
        });
    }

    // ==================== TASK APIS ====================

    /**
     * Get all tasks with optional filters
     */
    getTasks(filters?: {
        status?: string;
        category?: string;
        customerId?: string;
        workerId?: string;
    }): Observable<TaskListResponse> {
        let params = new HttpParams();
        if (filters?.status) params = params.set('status', filters.status);
        if (filters?.category) params = params.set('category', filters.category);
        if (filters?.customerId) params = params.set('customerId', filters.customerId);
        if (filters?.workerId) params = params.set('workerId', filters.workerId);

        return this.http.get<TaskListResponse>(`${this.API_BASE_URL}/tasks`, {
            headers: this.headers,
            params
        });
    }

    /**
     * Get task by ID
     */
    getTaskById(id: string): Observable<ApiTask> {
        return this.http.get<ApiTask>(`${this.API_BASE_URL}/tasks/${id}`, {
            headers: this.headers
        });
    }

    /**
     * Create a new task (Customer only)
     */
    createTask(task: CreateTaskRequest): Observable<ApiTask> {
        return this.http.post<ApiTask>(`${this.API_BASE_URL}/tasks`, task, {
            headers: this.headers
        });
    }

    /**
     * Update task status
     */
    updateTaskStatus(id: string, status: string): Observable<ApiTask> {
        return this.http.put<ApiTask>(`${this.API_BASE_URL}/tasks/${id}/status`, 
            { status }, 
            { headers: this.headers }
        );
    }

    /**
     * Delete task (Customer/Admin only)
     */
    deleteTask(id: string): Observable<void> {
        return this.http.delete<void>(`${this.API_BASE_URL}/tasks/${id}`, {
            headers: this.headers
        });
    }

    // ==================== LOCATION APIS ====================

    getLocationStates(): Observable<ApiResponse<LocationState[]>> {
        return this.http.get<ApiResponse<LocationState[]>>(`${this.API_BASE_URL}/locations/states`, {
            headers: this.headers
        });
    }

    getLocationCities(stateId?: string): Observable<ApiResponse<LocationCity[]>> {
        let params = new HttpParams();
        if (stateId) params = params.set('stateId', stateId);

        return this.http.get<ApiResponse<LocationCity[]>>(`${this.API_BASE_URL}/locations/cities`, {
            headers: this.headers,
            params
        });
    }

    getPopularLocationCities(): Observable<ApiResponse<LocationCity[]>> {
        return this.http.get<ApiResponse<LocationCity[]>>(`${this.API_BASE_URL}/locations/cities/popular`, {
            headers: this.headers
        });
    }

    getLocationCityById(cityId: string): Observable<LocationCityWithDetails> {
        return this.http.get<LocationCityWithDetails>(`${this.API_BASE_URL}/locations/cities/${cityId}`, {
            headers: this.headers
        });
    }

    getLocationAreas(cityId?: string): Observable<ApiResponse<LocationArea[]>> {
        let params = new HttpParams();
        if (cityId) params = params.set('cityId', cityId);

        return this.http.get<ApiResponse<LocationArea[]>>(`${this.API_BASE_URL}/locations/areas`, {
            headers: this.headers,
            params
        });
    }

    getLocationAreaById(areaId: string): Observable<LocationAreaWithDetails> {
        return this.http.get<LocationAreaWithDetails>(`${this.API_BASE_URL}/locations/areas/${areaId}`, {
            headers: this.headers
        });
    }

    searchLocations(query: string, cityId?: string): Observable<ApiResponse<LocationSearchResult[]>> {
        let params = new HttpParams().set('query', query);
        if (cityId) params = params.set('cityId', cityId);

        return this.http.get<ApiResponse<LocationSearchResult[]>>(`${this.API_BASE_URL}/locations/search`, {
            headers: this.headers,
            params
        });
    }

    getNearbyAreas(latitude: number, longitude: number, radiusKm = 10): Observable<ApiResponse<LocationAreaWithDetails[]>> {
        const params = new HttpParams()
            .set('latitude', latitude)
            .set('longitude', longitude)
            .set('radiusKm', radiusKm);

        return this.http.get<ApiResponse<LocationAreaWithDetails[]>>(`${this.API_BASE_URL}/locations/nearby/areas`, {
            headers: this.headers,
            params
        });
    }

    getNearbyCities(latitude: number, longitude: number, radiusKm = 100): Observable<ApiResponse<LocationCityWithDetails[]>> {
        const params = new HttpParams()
            .set('latitude', latitude)
            .set('longitude', longitude)
            .set('radiusKm', radiusKm);

        return this.http.get<ApiResponse<LocationCityWithDetails[]>>(`${this.API_BASE_URL}/locations/nearby/cities`, {
            headers: this.headers,
            params
        });
    }

    getLocationDistance(lat1: number, lon1: number, lat2: number, lon2: number): Observable<LocationDistanceResult> {
        const params = new HttpParams()
            .set('lat1', lat1)
            .set('lon1', lon1)
            .set('lat2', lat2)
            .set('lon2', lon2);

        return this.http.get<LocationDistanceResult>(`${this.API_BASE_URL}/locations/distance`, {
            headers: this.headers,
            params
        });
    }

    getLocationCategories(): Observable<ApiResponse<LocationServiceCategory[]>> {
        return this.http.get<ApiResponse<LocationServiceCategory[]>>(`${this.API_BASE_URL}/locations/categories`, {
            headers: this.headers
        });
    }

    getLocationCategoryById(categoryId: string): Observable<LocationServiceCategory> {
        return this.http.get<LocationServiceCategory>(`${this.API_BASE_URL}/locations/categories/${categoryId}`, {
            headers: this.headers
        });
    }

    getLocationFull(areaId: string): Observable<LocationFull> {
        return this.http.get<LocationFull>(`${this.API_BASE_URL}/locations/full/${areaId}`, {
            headers: this.headers
        });
    }

    buildLocationAddress(areaId: string, houseNo?: string, landmark?: string): Observable<LocationAddressResult> {
        let params = new HttpParams().set('areaId', areaId);
        if (houseNo) params = params.set('houseNo', houseNo);
        if (landmark) params = params.set('landmark', landmark);

        return this.http.get<LocationAddressResult>(`${this.API_BASE_URL}/locations/address`, {
            headers: this.headers,
            params
        });
    }

    getSuggestedRadius(categoryId: string): Observable<{ categoryId: string; suggestedRadiusKm: number }> {
        return this.http.get<{ categoryId: string; suggestedRadiusKm: number }>(`${this.API_BASE_URL}/locations/suggested-radius/${categoryId}`, {
            headers: this.headers
        });
    }

    // ==================== BID APIS ====================

    /**
     * Get bids for a specific task
     */
    getBidsForTask(taskId: string): Observable<{ data: TaskBid[] }> {
        return this.http.get<{ data: TaskBid[] }>(`${this.API_BASE_URL}/bids/task/${taskId}`, {
            headers: this.headers
        });
    }

    /**
     * Create a bid (Worker only)
     */
    createBid(bid: CreateBidRequest): Observable<TaskBid> {
        return this.http.post<TaskBid>(`${this.API_BASE_URL}/bids`, bid, {
            headers: this.headers
        });
    }

    /**
     * Accept a bid (Customer only)
     */
    acceptBid(bidId: string): Observable<TaskBid> {
        return this.http.put<TaskBid>(`${this.API_BASE_URL}/bids/${bidId}/accept`, {}, {
            headers: this.headers
        });
    }

    /**
     * Reject a bid (Customer only)
     */
    rejectBid(bidId: string): Observable<TaskBid> {
        return this.http.put<TaskBid>(`${this.API_BASE_URL}/bids/${bidId}/reject`, {}, {
            headers: this.headers
        });
    }

    // ==================== REVIEW APIS ====================

    /**
     * Get all reviews with optional filters
     */
    getReviews(filters?: {
        workerId?: string;
        taskId?: string;
        rating?: number;
    }): Observable<ReviewListResponse> {
        let params = new HttpParams();
        if (filters?.workerId) params = params.set('workerId', filters.workerId);
        if (filters?.taskId) params = params.set('taskId', filters.taskId);
        if (filters?.rating) params = params.set('rating', filters.rating.toString());

        return this.http.get<ReviewListResponse>(`${this.API_BASE_URL}/reviews`, {
            headers: this.headers,
            params
        });
    }

    /**
     * Get review by ID
     */
    getReviewById(id: string): Observable<any> {
        return this.http.get<any>(`${this.API_BASE_URL}/reviews/${id}`, {
            headers: this.headers
        });
    }

    /**
     * Create a review (Customer only)
     */
    createReview(review: CreateReviewRequest): Observable<any> {
        return this.http.post<any>(`${this.API_BASE_URL}/reviews`, review, {
            headers: this.headers
        });
    }

    /**
     * Delete a review
     */
    deleteReview(id: string): Observable<void> {
        return this.http.delete<void>(`${this.API_BASE_URL}/reviews/${id}`, {
            headers: this.headers
        });
    }

    /**
     * Get worker stats
     */
    getWorkerStats(workerId: string): Observable<{ workerId: string; averageRating: number; totalReviews: number }> {
        return this.http.get<any>(`${this.API_BASE_URL}/reviews/stats/${workerId}`, {
            headers: this.headers
        });
    }

    // ==================== DISPUTE APIS ====================

    /**
     * Get all disputes with optional filters
     */
    getDisputes(filters?: { status?: string }): Observable<DisputeListResponse> {
        let params = new HttpParams();
        if (filters?.status) params = params.set('status', filters.status);

        return this.http.get<DisputeListResponse>(`${this.API_BASE_URL}/disputes`, {
            headers: this.headers,
            params
        });
    }

    /**
     * Get dispute by ID
     */
    getDisputeById(id: string): Observable<any> {
        return this.http.get<any>(`${this.API_BASE_URL}/disputes/${id}`, {
            headers: this.headers
        });
    }

    /**
     * Create a dispute (Customer/Worker)
     */
    createDispute(dispute: CreateDisputeRequest): Observable<any> {
        return this.http.post<any>(`${this.API_BASE_URL}/disputes`, dispute, {
            headers: this.headers
        });
    }

    /**
     * Add message to dispute
     */
    addDisputeMessage(disputeId: string, message: string): Observable<any> {
        return this.http.post<any>(`${this.API_BASE_URL}/disputes/${disputeId}/messages`, 
            { message }, 
            { headers: this.headers }
        );
    }

    /**
     * Get dispute messages
     */
    getDisputeMessages(disputeId: string): Observable<{ data: any[] }> {
        return this.http.get<{ data: any[] }>(`${this.API_BASE_URL}/disputes/${disputeId}/messages`, {
            headers: this.headers
        });
    }

    /**
     * Resolve dispute (Admin only)
     */
    resolveDispute(disputeId: string, adminNotes: string): Observable<any> {
        return this.http.put<any>(`${this.API_BASE_URL}/disputes/${disputeId}/resolve`, 
            { adminNotes }, 
            { headers: this.headers }
        );
    }

    // ==================== USER APIS ====================

    /**
     * Get all users (Admin only)
     */
    getUsers(filters?: { role?: string; status?: string }): Observable<UserListResponse> {
        let params = new HttpParams();
        if (filters?.role) params = params.set('role', filters.role);
        if (filters?.status) params = params.set('status', filters.status);

        return this.http.get<UserListResponse>(`${this.API_BASE_URL}/users`, {
            headers: this.headers,
            params
        });
    }

    /**
     * Get user by ID
     */
    getUserById(id: string): Observable<any> {
        return this.http.get<any>(`${this.API_BASE_URL}/users/${id}`, {
            headers: this.headers
        });
    }

    /**
     * Update user profile
     */
    updateUserProfile(id: string, data: any): Observable<any> {
        return this.http.put<any>(`${this.API_BASE_URL}/users/${id}`, data, {
            headers: this.headers
        });
    }

    /**
     * Suspend user (Admin only)
     */
    suspendUser(id: string): Observable<any> {
        return this.http.put<any>(`${this.API_BASE_URL}/users/${id}/suspend`, {}, {
            headers: this.headers
        });
    }

    /**
     * Activate user (Admin only)
     */
    activateUser(id: string): Observable<any> {
        return this.http.put<any>(`${this.API_BASE_URL}/users/${id}/activate`, {}, {
            headers: this.headers
        });
    }

    /**
     * Update busy status (Worker only)
     */
    updateBusyStatus(id: string, isBusy: boolean): Observable<any> {
        return this.http.put<any>(`${this.API_BASE_URL}/users/${id}/busy`, 
            { isBusy }, 
            { headers: this.headers }
        );
    }

    /**
     * Get available workers
     */
    getWorkers(filters?: {
        category?: string;
        available?: boolean;
        minRating?: number;
    }): Observable<UserListResponse> {
        let params = new HttpParams();
        if (filters?.category) params = params.set('category', filters.category);
        if (filters?.available !== undefined) params = params.set('available', filters.available.toString());
        if (filters?.minRating) params = params.set('minRating', filters.minRating.toString());

        return this.http.get<UserListResponse>(`${this.API_BASE_URL}/users/workers`, {
            headers: this.headers,
            params
        });
    }

    // ==================== ADMIN APIS ====================

    /**
     * Get admin dashboard stats
     */
    getAdminDashboard(): Observable<any> {
        return this.http.get<any>(`${this.API_BASE_URL}/admin/dashboard`, {
            headers: this.headers
        });
    }

    /**
     * Get pending tasks for approval
     */
    getPendingTasks(): Observable<{ data: ApiTask[]; total: number }> {
        return this.http.get<{ data: ApiTask[]; total: number }>(`${this.API_BASE_URL}/admin/tasks/pending`, {
            headers: this.headers
        });
    }

    /**
     * Approve task (Admin only)
     */
    approveTask(id: string, notes?: string): Observable<any> {
        return this.http.put<any>(`${this.API_BASE_URL}/admin/tasks/${id}/approve`, 
            { notes }, 
            { headers: this.headers }
        );
    }

    /**
     * Reject task (Admin only)
     */
    rejectTask(id: string, reason?: string): Observable<any> {
        return this.http.put<any>(`${this.API_BASE_URL}/admin/tasks/${id}/reject`, 
            { reason }, 
            { headers: this.headers }
        );
    }

    /**
     * Get activity log (Admin only)
     */
    getActivityLog(count: number = 50): Observable<{ data: any[] }> {
        const params = new HttpParams().set('count', count.toString());
        return this.http.get<{ data: any[] }>(`${this.API_BASE_URL}/admin/activities`, {
            headers: this.headers,
            params
        });
    }
}
