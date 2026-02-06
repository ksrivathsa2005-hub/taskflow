
import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { Router } from '@angular/router';
import { User, UserRole, Task, TaskStatus, Bid, AppState, Dispute, DisputeStatus, UserStatus, ProgressUpdate } from './types';
import { MockApiService } from './services/mock-api.service';
import { ToastService } from './services/toast.service';
import { TaskFlowApiService } from './services/taskflow-api.service';
import { ApiMapper } from './services/api-mapper';
import { CreateTaskRequest, CreateBidRequest } from './services/api-types';

// Set to true to use real API, false to use mock data
const USE_REAL_API = true;

@Injectable({
    providedIn: 'root'
})
export class AppService {
    private currentUserSubject = new BehaviorSubject<User | null>(null);
    private tasksSubject = new BehaviorSubject<Task[]>([]);
    private usersSubject = new BehaviorSubject<User[]>([]);
    private disputesSubject = new BehaviorSubject<Dispute[]>([]);
    private initializationComplete = new BehaviorSubject<boolean>(false);

    currentUser$ = this.currentUserSubject.asObservable();
    tasks$ = this.tasksSubject.asObservable();
    users$ = this.usersSubject.asObservable();
    disputes$ = this.disputesSubject.asObservable();
    initializationComplete$ = this.initializationComplete.asObservable();

    private toastService = inject(ToastService);
    private apiService = inject(TaskFlowApiService);

    constructor(private mockApi: MockApiService, private router: Router) {
        this.initializeApp();
    }

    private async initializeApp() {
        if (USE_REAL_API) {
            // Try to restore user session from token
            const token = localStorage.getItem('accessToken');
            if (token) {
                console.log('Token found, restoring user session...');
                try {
                    const apiUser = await firstValueFrom(this.apiService.getCurrentUser());
                    const localUser = ApiMapper.toLocalUser(apiUser);
                    this.currentUserSubject.next(localUser);
                    console.log('User session restored:', localUser);
                    
                    // Load user-specific data
                    await this.loadTasksFromApi();
                    await this.loadDisputesFromApi();
                } catch (error) {
                    console.error('Failed to restore user session:', error);
                    // Token might be expired, clear it
                    localStorage.removeItem('accessToken');
                    localStorage.removeItem('refreshToken');
                    this.currentUserSubject.next(null);
                    
                    // Only redirect if not already on login/register page
                    const currentPath = window.location.pathname;
                    if (!currentPath.includes('/login') && !currentPath.includes('/register') && currentPath !== '/') {
                        this.router.navigate(['/']);
                    }
                }
            } else {
                console.log('No token found, user needs to login');
                this.currentUserSubject.next(null);
                
                // Only redirect if trying to access protected route
                const currentPath = window.location.pathname;
                if (!currentPath.includes('/login') && !currentPath.includes('/register') && currentPath !== '/') {
                    this.router.navigate(['/']);
                }
            }
        } else {
            // Mock mode - use localStorage
            this.loadFromLocalStorage();
        }
        
        // Mark initialization as complete
        this.initializationComplete.next(true);
    }

    get currentUser() {
        return this.currentUserSubject.value;
    }

    get tasks() {
        return this.tasksSubject.value;
    }

    get users() {
        return this.usersSubject.value;
    }

    get disputes() {
        return this.disputesSubject.value;
    }

    private loadFromLocalStorage() {
        const saved = localStorage.getItem('taskflow_appstate');
        if (saved) {
            try {
                const state: AppState = JSON.parse(saved);
                this.currentUserSubject.next(state.currentUser);
                
                // Fix location data in tasks if it's stringified
                const fixedTasks = state.tasks.map(task => {
                    if (task.location && typeof task.location === 'string') {
                        try {
                            task.location = JSON.parse(task.location);
                        } catch (e) {
                            console.error('Failed to parse location for task:', task.id);
                        }
                    }
                    return task;
                });
                
                this.tasksSubject.next(fixedTasks);
                this.usersSubject.next(state.users);
                this.disputesSubject.next(state.disputes || []);
            } catch (error) {
                console.error('Failed to load state from localStorage', error);
                this.initializeFromApi();
            }
        } else {
            this.initializeFromApi();
        }
    }

    private initializeFromApi() {
        this.usersSubject.next(this.mockApi.getAllUsers());
        this.tasksSubject.next(this.mockApi.getAllTasks());
        this.disputesSubject.next(this.mockApi.getAllDisputes());
        this.currentUserSubject.next(this.mockApi.getUsersByRole(UserRole.CUSTOMER)[0] || null);
        this.saveToLocalStorage();
    }

    private saveToLocalStorage() {
        const state: AppState = {
            currentUser: this.currentUserSubject.value,
            tasks: this.tasksSubject.value,
            users: this.usersSubject.value,
            disputes: this.disputesSubject.value
        };
        localStorage.setItem('taskflow_appstate', JSON.stringify(state));
    }

    setCurrentUser(user: User | null) {
        this.currentUserSubject.next(user);
        this.saveToLocalStorage();
    }

    updateCurrentUser(updates: Partial<User>) {
        const currentUser = this.currentUserSubject.value;
        if (currentUser) {
            const updatedUser = { ...currentUser, ...updates };
            this.setCurrentUser(updatedUser);
            // Also update localStorage
            if (USE_REAL_API) {
                localStorage.setItem('currentUser', JSON.stringify(updatedUser));
            }
        }
    }

    loginAs(role: UserRole) {
        if (USE_REAL_API) {
            // For API mode, would need proper login with email/password
            console.log('API login not implemented - use mock mode or implement proper authentication');
            this.toastService.error('Please use mock mode for quick role switching');
        } else {
            const user = this.users.find(u => u.role === role);
            if (user) {
                this.setCurrentUser(user);
                // Navigate to appropriate dashboard
                const loginAsRoleRoute: { [key in UserRole]: string } = {
                    [UserRole.CUSTOMER]: '/customer',
                    [UserRole.WORKER]: '/worker',
                    [UserRole.ADMIN]: '/admin'
                };
                this.router.navigate([loginAsRoleRoute[role]]);
            }
        }
    }

    // New API authentication methods
    async login(email: string, password: string): Promise<boolean> {
        if (!USE_REAL_API) {
            this.toastService.error('Please enable API mode to use login');
            return false;
        }

        try {
            const response = await firstValueFrom(this.apiService.login({ email, password }));
            console.log('Login API response:', response);
            console.log('API User role (raw):', response.user.role);
            console.log('Token in localStorage after login:', localStorage.getItem('accessToken'));
            
            const localUser = ApiMapper.toLocalUser(response.user);
            console.log('Mapped local user:', localUser);
            console.log('Local user role:', localUser.role);
            this.currentUserSubject.next(localUser);
            
            // Navigate based on role
            const loginRoleRoute: { [key in UserRole]: string } = {
                [UserRole.CUSTOMER]: '/customer',
                [UserRole.WORKER]: '/worker',
                [UserRole.ADMIN]: '/admin'
            };
            this.router.navigate([loginRoleRoute[localUser.role]]);
            
            this.toastService.success('Login successful');
            await this.loadTasksFromApi();
            await this.loadDisputesFromApi();
            return true;
        } catch (error: any) {
            console.error('Login error:', error);
            this.toastService.error(error?.error?.message || 'Login failed');
            return false;
        }
    }

    async register(name: string, email: string, password: string, role: UserRole): Promise<boolean> {
        if (!USE_REAL_API) {
            this.toastService.error('Please enable API mode to use registration');
            return false;
        }

        try {
            // Convert role enum to number for API: 0 = CUSTOMER, 1 = WORKER, 2 = ADMIN
            const roleToNumber: Record<UserRole, 0 | 1 | 2> = {
                [UserRole.CUSTOMER]: 0,
                [UserRole.WORKER]: 1,
                [UserRole.ADMIN]: 2
            };

            const response = await firstValueFrom(this.apiService.register({
                name,
                email,
                password,
                role: roleToNumber[role]
            }));
            console.log('Register API response:', response);
            console.log('Token in localStorage after register:', localStorage.getItem('accessToken'));
            
            const localUser = ApiMapper.toLocalUser(response.user);
            this.currentUserSubject.next(localUser);
            
            // Navigate based on role
            const roleToRoute: { [key in UserRole]: string } = {
                [UserRole.CUSTOMER]: '/customer',
                [UserRole.WORKER]: '/worker',
                [UserRole.ADMIN]: '/admin'
            };
            this.router.navigate([roleToRoute[localUser.role]]);
            
            this.toastService.success('Registration successful');
            await this.loadTasksFromApi();
            await this.loadDisputesFromApi();
            return true;
        } catch (error: any) {
            console.error('Registration error:', error);
            this.toastService.error(error?.error?.message || 'Registration failed');
            return false;
        }
    }

    postTask(taskData: any) {
        if (USE_REAL_API) {
            this.postTaskApi(taskData);
        } else {
            this.postTaskMock(taskData);
        }
    }

    private postTaskMock(taskData: any) {
        const newTask = this.mockApi.createTask(taskData);
        this.tasksSubject.next([newTask, ...this.tasks]);
        this.saveToLocalStorage();
    }

    private async postTaskApi(taskData: any) {
        try {
            const request: CreateTaskRequest = {
                title: taskData.title,
                description: taskData.description,
                category: taskData.category,
                budgetMin: taskData.budgetMin,
                budgetMax: taskData.budgetMax,
                preferredDate: taskData.preferredDate,
                location: taskData.location,
                photos: taskData.photos
            };

            const apiTask = await firstValueFrom(this.apiService.createTask(request));
            console.log('Task created via API:', apiTask);
            
            const localTask = ApiMapper.toLocalTask(apiTask);
            console.log('Mapped to local task:', localTask);
            
            // Add the new task to the beginning of the list
            const currentTasks = this.tasksSubject.value;
            this.tasksSubject.next([localTask, ...currentTasks]);
            
            this.toastService.success('Task created successfully');
            
            // Refresh all tasks from API to ensure consistency
            await this.loadTasksFromApi();
        } catch (error: any) {
            console.error('Error creating task:', error);
            this.toastService.error(error?.error?.message || 'Failed to create task');
        }
    }

    placeBid(bidData: any) {
        if (USE_REAL_API) {
            this.placeBidApi(bidData);
        } else {
            this.placeBidMock(bidData);
        }
    }

    private placeBidMock(bidData: any) {
        const task = this.mockApi.getTaskById(bidData.taskId);
        if (task) {
            const updatedTask = this.mockApi.addBidToTask(bidData.taskId, bidData);
            if (updatedTask) {
                const updatedTasks = this.tasks.map(t => t.id === updatedTask.id ? updatedTask : t);
                this.tasksSubject.next(updatedTasks);
                this.saveToLocalStorage();
            }
        }
    }

    private async placeBidApi(bidData: any) {
        try {
            const request: CreateBidRequest = {
                taskId: bidData.taskId,
                amount: bidData.amount,
                estimatedDays: bidData.estimatedDays,
                message: bidData.message
            };

            await firstValueFrom(this.apiService.createBid(request));
            this.toastService.success('Bid placed successfully');
            await this.refreshTasks();
        } catch (error: any) {
            console.error('Error placing bid:', error);
            this.toastService.error(error?.error?.message || 'Failed to place bid');
        }
    }

    selectWorker(taskId: string, bidId: string) {
        if (USE_REAL_API) {
            this.selectWorkerApi(taskId, bidId);
        } else {
            this.selectWorkerMock(taskId, bidId);
        }
    }

    private selectWorkerMock(taskId: string, bidId: string) {
        const updatedTask = this.mockApi.acceptBid(taskId, bidId);
        if (updatedTask) {
            const updatedTasks = this.tasks.map(t => t.id === updatedTask.id ? updatedTask : t);
            this.tasksSubject.next(updatedTasks);

            const updatedUsers = this.mockApi.getAllUsers();
            this.usersSubject.next(updatedUsers);
            this.saveToLocalStorage();
        }
    }

    private async selectWorkerApi(taskId: string, bidId: string) {
        try {
            await firstValueFrom(this.apiService.acceptBid(bidId));
            this.toastService.success('Worker selected successfully');
            await this.refreshTasks();
        } catch (error: any) {
            console.error('Error selecting worker:', error);
            this.toastService.error(error?.error?.message || 'Failed to select worker');
        }
    }

    updateTaskStatus(taskId: string, status: TaskStatus) {
        if (USE_REAL_API) {
            this.updateTaskStatusApi(taskId, status);
        } else {
            this.updateTaskStatusMock(taskId, status);
        }
    }

    private updateTaskStatusMock(taskId: string, status: TaskStatus) {
        const updatedTask = this.mockApi.updateTaskStatus(taskId, status);
        if (updatedTask) {
            const updatedTasks = this.tasks.map(t => t.id === updatedTask.id ? updatedTask : t);
            
            // Show toast notification for status change
            const statusMessages: Record<TaskStatus, string> = {
                [TaskStatus.POSTED]: 'Task posted successfully',
                [TaskStatus.BIDDING]: 'Task is now open for bidding',
                [TaskStatus.ASSIGNED]: 'Worker has been assigned',
                [TaskStatus.CONFIRMED]: 'Booking confirmed',
                [TaskStatus.TRAVELING]: 'Worker is on the way',
                [TaskStatus.ARRIVED]: 'Worker has arrived',
                [TaskStatus.IN_PROGRESS]: 'Work is in progress',
                [TaskStatus.WORK_COMPLETED]: 'Work has been completed',
                [TaskStatus.VERIFIED]: 'Work verified successfully',
                [TaskStatus.PAID]: 'Payment processed',
                [TaskStatus.COMPLETED]: 'Task completed successfully',
                [TaskStatus.CANCELLED]: 'Task has been cancelled',
                [TaskStatus.DISPUTED]: 'Dispute has been raised'
            };
            this.toastService.success(statusMessages[status] || 'Status updated');
            this.tasksSubject.next(updatedTasks);
            this.saveToLocalStorage();
        }
    }

    private async updateTaskStatusApi(taskId: string, status: TaskStatus) {
        try {
            const apiStatus = ApiMapper.toApiTaskStatus(status);
            const apiTask = await firstValueFrom(this.apiService.updateTaskStatus(taskId, apiStatus));
            const localTask = ApiMapper.toLocalTask(apiTask);
            
            const updatedTasks = this.tasks.map(t => t.id === localTask.id ? localTask : t);
            this.tasksSubject.next(updatedTasks);
            
            const statusMessages: Record<TaskStatus, string> = {
                [TaskStatus.POSTED]: 'Task posted successfully',
                [TaskStatus.BIDDING]: 'Task is now open for bidding',
                [TaskStatus.ASSIGNED]: 'Worker has been assigned',
                [TaskStatus.CONFIRMED]: 'Booking confirmed',
                [TaskStatus.TRAVELING]: 'Worker is on the way',
                [TaskStatus.ARRIVED]: 'Worker has arrived',
                [TaskStatus.IN_PROGRESS]: 'Work is in progress',
                [TaskStatus.WORK_COMPLETED]: 'Work has been completed',
                [TaskStatus.VERIFIED]: 'Work verified successfully',
                [TaskStatus.PAID]: 'Payment processed',
                [TaskStatus.COMPLETED]: 'Task completed successfully',
                [TaskStatus.CANCELLED]: 'Task has been cancelled',
                [TaskStatus.DISPUTED]: 'Dispute has been raised'
            };
            this.toastService.success(statusMessages[status] || 'Status updated');
        } catch (error: any) {
            console.error('Error updating task status:', error);
            this.toastService.error(error?.error?.message || 'Failed to update task status');
        }
    }

    // Helper method to refresh all tasks from API
    private async refreshTasks() {
        try {
            // Build filters based on user role
            const filters: any = {};
            const currentUser = this.currentUserSubject.value;
            
            if (currentUser) {
                if (currentUser.role === UserRole.CUSTOMER) {
                    filters.customerId = currentUser.id;
                } else if (currentUser.role === UserRole.WORKER) {
                    // Workers see tasks they can bid on or are assigned to
                    // Don't filter - let backend handle worker-specific logic
                }
                // Admin sees all tasks - no filters needed
            }
            
            console.log('Fetching tasks with filters:', filters);
            const response = await firstValueFrom(this.apiService.getTasks(Object.keys(filters).length > 0 ? filters : undefined));
            console.log('Tasks response:', response);
            
            const localTasks = ApiMapper.toLocalTasks(response.data);
            console.log('Mapped local tasks:', localTasks);
            
            this.tasksSubject.next(localTasks);
        } catch (error) {
            console.error('Error refreshing tasks:', error);
        }
    }

    // Helper method to load tasks from API on initialization
    async loadTasksFromApi() {
        if (USE_REAL_API) {
            try {
                // Build filters based on user role
                const filters: any = {};
                const currentUser = this.currentUserSubject.value;
                
                if (currentUser) {
                    if (currentUser.role === UserRole.CUSTOMER) {
                        filters.customerId = currentUser.id;
                    } else if (currentUser.role === UserRole.WORKER) {
                        // Workers see tasks they can bid on or are assigned to
                        // Don't filter - let backend handle worker-specific logic
                    }
                    // Admin sees all tasks - no filters needed
                }
                
                console.log('Loading tasks from API with filters:', filters);
                const response = await firstValueFrom(this.apiService.getTasks(Object.keys(filters).length > 0 ? filters : undefined));
                console.log('API tasks response:', response);
                
                const localTasks = ApiMapper.toLocalTasks(response.data);
                console.log('Mapped tasks:', localTasks);
                
                this.tasksSubject.next(localTasks);
            } catch (error) {
                console.error('Error loading tasks from API:', error);
            }
        }
    }

    markWorkerArrival(taskId: string) {
        const updatedTask = this.mockApi.markWorkerArrival(taskId);
        if (updatedTask) {
            const updatedTasks = this.tasks.map(t => t.id === updatedTask.id ? updatedTask : t);
            this.tasksSubject.next(updatedTasks);
            this.saveToLocalStorage();
        }
    }

    approveTask(taskId: string) {
        const updatedTask = this.mockApi.completeTask(taskId);
        if (updatedTask) {
            const updatedTasks = this.tasks.map(t => t.id === updatedTask.id ? updatedTask : t);
            this.tasksSubject.next(updatedTasks);

            const updatedUsers = this.mockApi.getAllUsers();
            this.usersSubject.next(updatedUsers);
            this.saveToLocalStorage();
        }
    }

    // Admin Operations
    approveTaskForBidding(taskId: string, notes?: string) {
        const updatedTask = this.mockApi.approveTaskForBidding(taskId);
        if (updatedTask) {
            const updatedTasks = this.tasks.map(t => t.id === updatedTask.id ? updatedTask : t);
            this.tasksSubject.next(updatedTasks);
            this.saveToLocalStorage();
        }
    }

    rejectTask(taskId: string, reason: string) {
        const updatedTask = this.mockApi.rejectTask(taskId, reason);
        if (updatedTask) {
            const updatedTasks = this.tasks.map(t => t.id === updatedTask.id ? updatedTask : t);
            this.tasksSubject.next(updatedTasks);
            this.saveToLocalStorage();
        }
    }

    // User Management
    createUser(userData: any) {
        const newUser = this.mockApi.createUser({
            ...userData,
            role: userData.role || UserRole.CUSTOMER
        });
        this.usersSubject.next(this.mockApi.getAllUsers());
        this.saveToLocalStorage();
        return newUser;
    }

    createWorker(workerData: any) {
        const newWorker = this.mockApi.createUser({
            ...workerData,
            role: UserRole.WORKER
        });
        this.usersSubject.next(this.mockApi.getAllUsers());
        this.saveToLocalStorage();
        return newWorker;
    }

    updateUser(userId: string, updates: any) {
        const updatedUser = this.mockApi.updateUser(userId, updates);
        if (updatedUser) {
            this.usersSubject.next(this.mockApi.getAllUsers());
            if (this.currentUser?.id === userId) {
                this.setCurrentUser(updatedUser);
            }
            this.saveToLocalStorage();
        }
    }

    suspendUser(userId: string) {
        this.mockApi.suspendUser(userId);
        this.usersSubject.next(this.mockApi.getAllUsers());
        this.saveToLocalStorage();
    }

    activateUser(userId: string) {
        this.mockApi.activateUser(userId);
        this.usersSubject.next(this.mockApi.getAllUsers());
        this.saveToLocalStorage();
    }

    verifyUser(userId: string) {
        this.mockApi.verifyUser(userId);
        this.usersSubject.next(this.mockApi.getAllUsers());
        this.saveToLocalStorage();
    }

    // Review Operations
    submitReview(taskId: string, reviewData: any) {
        const review = this.mockApi.submitReview(taskId, reviewData);
        const updatedTasks = this.mockApi.getAllTasks();
        this.tasksSubject.next(updatedTasks);

        const updatedUsers = this.mockApi.getAllUsers();
        this.usersSubject.next(updatedUsers);
        this.saveToLocalStorage();

        return review;
    }

    // Dispute Operations
    async createDispute(disputeData: any): Promise<void> {
        if (USE_REAL_API) {
            await this.createDisputeApi(disputeData);
        } else {
            const newDispute = this.mockApi.createDispute(disputeData);
            this.disputesSubject.next(this.mockApi.getAllDisputes());
            this.saveToLocalStorage();
        }
    }

    private async createDisputeApi(disputeData: any) {
        try {
            console.log('Creating dispute:', disputeData);
            const apiDispute = await firstValueFrom(this.apiService.createDispute(disputeData));
            const localDispute = ApiMapper.toLocalDispute(apiDispute);
            
            // Reload all disputes
            await this.loadDisputesFromApi();
            
            // Reload tasks to get updated status
            await this.loadTasksFromApi();
            
            this.toastService.success('Dispute created successfully');
        } catch (error: any) {
            console.error('Error creating dispute:', error);
            this.toastService.error(error.error?.message || 'Failed to create dispute');
        }
    }

    addMessageToDispute(disputeId: string, message: any) {
        if (USE_REAL_API) {
            this.addDisputeMessageApi(disputeId, message);
        } else {
            const updatedDispute = this.mockApi.addMessageToDispute(disputeId, message);
            if (updatedDispute) {
                this.disputesSubject.next(this.mockApi.getAllDisputes());
                this.saveToLocalStorage();
            }
        }
    }

    private async addDisputeMessageApi(disputeId: string, message: any) {
        try {
            await firstValueFrom(this.apiService.addDisputeMessage(disputeId, message));
            
            // Reload the dispute
            const apiDispute = await firstValueFrom(this.apiService.getDisputeById(disputeId));
            const localDispute = ApiMapper.toLocalDispute(apiDispute);
            
            const updatedDisputes = this.disputes.map(d => d.id === localDispute.id ? localDispute : d);
            this.disputesSubject.next(updatedDisputes);
            this.toastService.success('Message sent');
        } catch (error: any) {
            console.error('Error sending message:', error);
            this.toastService.error('Failed to send message');
        }
    }

    resolveDispute(disputeId: string, adminNotes?: string) {
        console.log('resolveDispute called:', { disputeId, adminNotes, USE_REAL_API });
        if (USE_REAL_API) {
            this.resolveDisputeApi(disputeId, adminNotes);
        } else {
            const updatedDispute = this.mockApi.resolveDispute(disputeId, adminNotes);
            if (updatedDispute) {
                this.disputesSubject.next(this.mockApi.getAllDisputes());
                this.saveToLocalStorage();
            }
        }
    }

    private async resolveDisputeApi(disputeId: string, adminNotes?: string) {
        try {
            console.log('=== RESOLVE DISPUTE DEBUG ===');
            console.log('Current user:', this.currentUser);
            console.log('Current user role:', this.currentUser?.role);
            console.log('Access token:', localStorage.getItem('accessToken'));
            console.log('Dispute ID:', disputeId);
            console.log('Admin notes:', adminNotes);
            
            const requestBody = { adminNotes: adminNotes || '' };
            console.log('Request body:', requestBody);
            console.log('API URL will be:', `${this.apiService['baseUrl']}/disputes/${disputeId}/resolve`);
            
            const apiDispute = await firstValueFrom(
                this.apiService.resolveDispute(disputeId, requestBody)
            );
            console.log('Dispute resolved, API response:', apiDispute);
            
            const localDispute = ApiMapper.toLocalDispute(apiDispute);
            console.log('Mapped local dispute:', localDispute);
            
            const updatedDisputes = this.disputes.map(d => d.id === localDispute.id ? localDispute : d);
            this.disputesSubject.next(updatedDisputes);
            this.toastService.success('Dispute resolved successfully');
        } catch (error: any) {
            console.error('=== RESOLVE DISPUTE ERROR ===');
            console.error('Error object:', error);
            console.error('Error status:', error.status);
            console.error('Error statusText:', error.statusText);
            console.error('Error message:', error.message);
            console.error('Error details:', error.error);
            console.error('Full error response:', JSON.stringify(error, null, 2));
            
            if (error.status === 403) {
                this.toastService.error('Access denied. Admin privileges required.');
            } else {
                this.toastService.error(error.error?.message || 'Failed to resolve dispute');
            }
        }
    }

    async loadDisputesFromApi() {
        try {
            console.log('Loading disputes from API...');
            const response = await firstValueFrom(this.apiService.getDisputes());
            console.log('Disputes API response:', response);
            
            if (!response || !response.data) {
                console.error('Invalid disputes response:', response);
                return;
            }
            
            const localDisputes = response.data.map((d: any) => {
                console.log('Mapping dispute:', d);
                return ApiMapper.toLocalDispute(d);
            });
            
            console.log('Loaded disputes:', localDisputes);
            this.disputesSubject.next(localDisputes);
        } catch (error: any) {
            console.error('Error loading disputes:', error);
            console.error('Error details:', error.error);
        }
    }

    getUnresolvedDisputeCount(): number {
        if (USE_REAL_API) {
            return this.disputes.filter((d: Dispute) => d.status !== DisputeStatus.RESOLVED).length;
        }
        return this.mockApi.getUnresolvedDisputeCount();
    }

    logout() {
        if (USE_REAL_API) {
            const refreshToken = localStorage.getItem('refreshToken');
            if (refreshToken) {
                firstValueFrom(this.apiService.logout(refreshToken))
                    .catch(error => console.error('Logout error:', error));
            }
            this.apiService.clearAuthData();
        }
        
        this.setCurrentUser(null);
        localStorage.removeItem('taskflow_appstate');
        this.router.navigate(['/']);
    }
}
