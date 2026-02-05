
import { Injectable, inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';
import { User, UserRole, Task, TaskStatus, Bid, AppState, Dispute, UserStatus, ProgressUpdate } from './types';
import { MockApiService } from './services/mock-api.service';
import { ToastService } from './services/toast.service';
import { SERVICE_CATEGORIES } from './service-categories';
import { AuthService } from './services/auth.service';

@Injectable({
    providedIn: 'root'
})
export class AppService {
    private currentUserSubject = new BehaviorSubject<User | null>(null);
    private tasksSubject = new BehaviorSubject<Task[]>([]);
    private usersSubject = new BehaviorSubject<User[]>([]);
    private disputesSubject = new BehaviorSubject<Dispute[]>([]);

    currentUser$ = this.currentUserSubject.asObservable();
    tasks$ = this.tasksSubject.asObservable();
    users$ = this.usersSubject.asObservable();
    disputes$ = this.disputesSubject.asObservable();

    private toastService = inject(ToastService);
    private authService = inject(AuthService);

    constructor(private mockApi: MockApiService, private router: Router) {
        // Subscribe to auth service for current user
        this.authService.currentUser$.subscribe(user => {
            this.currentUserSubject.next(user);
        });
        
        this.loadFromLocalStorage();
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
                this.tasksSubject.next(state.tasks);
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

    // For backward compatibility - redirects to auth service
    loginAs(role: UserRole) {
        // This is now handled by AuthService
        // Keep for backward compatibility with existing UI
        const user = this.users.find(u => u.role === role);
        if (user) {
            this.setCurrentUser(user);
            const roleMap: { [key in UserRole]: string } = {
                [UserRole.CUSTOMER]: '/customer',
                [UserRole.WORKER]: '/worker',
                [UserRole.ADMIN]: '/admin'
            };
            this.router.navigate([roleMap[role]]);
        }
    }

    // Delegate to AuthService for real authentication
    login(email: string, password: string) {
        return this.authService.login({ email, password });
    }

    register(name: string, email: string, password: string, role: 'CUSTOMER' | 'WORKER' | 'ADMIN', phone?: string) {
        return this.authService.register({ name, email, password, role, phone });
    }

    logout() {
        return this.authService.logout();
    }

    postTask(taskData: any) {
        const newTask = this.mockApi.createTask(taskData);
        this.tasksSubject.next([newTask, ...this.tasks]);
        this.saveToLocalStorage();
    }

    createTask(taskData: any) {
        return this.postTask(taskData);
    }

    getServiceCategories() {
        return SERVICE_CATEGORIES;
    }

    acceptBid(taskId: string, bidId: string) {
        return this.selectWorker(taskId, bidId);
    }

    placeBid(bidData: any) {
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

    selectWorker(taskId: string, bidId: string) {
        const updatedTask = this.mockApi.acceptBid(taskId, bidId);
        if (updatedTask) {
            const updatedTasks = this.tasks.map(t => t.id === updatedTask.id ? updatedTask : t);
            this.tasksSubject.next(updatedTasks);

            const updatedUsers = this.mockApi.getAllUsers();
            this.usersSubject.next(updatedUsers);
            this.saveToLocalStorage();
        }
    }

    updateTaskStatus(taskId: string, status: TaskStatus) {
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
    createDispute(disputeData: any) {
        const newDispute = this.mockApi.createDispute(disputeData);
        this.disputesSubject.next(this.mockApi.getAllDisputes());
        this.saveToLocalStorage();
        return newDispute;
    }

    addMessageToDispute(disputeId: string, message: any) {
        const updatedDispute = this.mockApi.addMessageToDispute(disputeId, message);
        if (updatedDispute) {
            this.disputesSubject.next(this.mockApi.getAllDisputes());
            this.saveToLocalStorage();
        }
    }

    resolveDispute(disputeId: string, adminNotes?: string) {
        const updatedDispute = this.mockApi.resolveDispute(disputeId, adminNotes);
        if (updatedDispute) {
            this.disputesSubject.next(this.mockApi.getAllDisputes());
            this.saveToLocalStorage();
        }
    }

    getUnresolvedDisputeCount(): number {
        return this.mockApi.getUnresolvedDisputeCount();
    }
}
