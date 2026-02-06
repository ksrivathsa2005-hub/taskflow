
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AppService } from '../../app.service';
import { TaskCardComponent } from '../../components/task-card/task-card.component';
import { PlatformActivityComponent } from '../../components/platform-activity/platform-activity.component';
import { ToastService } from '../../services/toast.service';
import { LocationApiService, City, Area } from '../../services/location-api.service';
import { TaskFlowApiService } from '../../services/taskflow-api.service';
import { ApiMapper } from '../../services/api-mapper';
import { Task, TaskStatus, UserRole, User } from '../../types';
import { CURRENCY } from '../../constants';
import { SERVICE_CATEGORIES } from '../../service-categories';
import {
    LucideAngularModule,
    Search,
    Star,
    Clock,
    Briefcase,
    Navigation,
    CheckCircle2,
    TrendingUp,
    DollarSign,
    X,
    AlertCircle,
    MapPin,
    Filter
} from 'lucide-angular';
import { Observable, BehaviorSubject } from 'rxjs';

@Component({
    selector: 'app-worker-dashboard',
    standalone: true,
    imports: [CommonModule, FormsModule, LucideAngularModule, TaskCardComponent, PlatformActivityComponent],
    templateUrl: './worker-dashboard.component.html',
    styleUrls: ['./worker-dashboard.component.css']
})
export class WorkerDashboardComponent implements OnInit {
    // Use BehaviorSubjects to manage data locally
    private availableTasksSubject = new BehaviorSubject<Task[]>([]);
    private activeTaskSubject = new BehaviorSubject<Task | undefined>(undefined);
    private completedTasksSubject = new BehaviorSubject<Task[]>([]);

    availableTasks$ = this.availableTasksSubject.asObservable();
    myActiveTask$ = this.activeTaskSubject.asObservable();
    myCompletedTasks$ = this.completedTasksSubject.asObservable();
    
    currentUser: User | null = null;
    isLoadingTasks = false;

    biddingOn: any = null;
    showDisputeModal = false;
    disputeTaskId: string = '';
    disputeReason: string = '';
    showEarningsTab = false;

    // Location filter properties
    showLocationFilter = false;
    isLoadingLocation = false;
    locationError = '';
    selectedCityFilter = '';
    selectedAreaFilter: string | null = null;
    allCities: City[] = [];
    filteredAreas: Area[] = [];

    // Category filter properties
    showCategoryFilter = false;
    selectedCategoryFilter: string | null = null;
    serviceCategories = SERVICE_CATEGORIES;

    readonly CURRENCY = CURRENCY;
    readonly TaskStatus = TaskStatus;
    readonly UserRole = UserRole;

    readonly Search = Search;
    readonly Star = Star;
    readonly Clock = Clock;
    readonly Briefcase = Briefcase;
    readonly Navigation = Navigation;
    readonly CheckCircle2 = CheckCircle2;
    readonly TrendingUp = TrendingUp;
    readonly DollarSign = DollarSign;
    readonly X = X;
    readonly AlertCircle = AlertCircle;
    readonly MapPin = MapPin;
    readonly Filter = Filter;

    private toastService = inject(ToastService);
    private locationApi = inject(LocationApiService);
    private apiService = inject(TaskFlowApiService);

    constructor(public appService: AppService, public router: Router) {}

    ngOnInit() {
        this.appService.currentUser$.subscribe(user => {
            this.currentUser = user;
            if (user && user.role === UserRole.WORKER) {
                // Load tasks only for worker
                this.loadWorkerTasks();
            }
        });
    }

    private loadWorkerTasks() {
        if (!this.currentUser) return;
        
        this.isLoadingTasks = true;

        // Load available tasks (POSTED or BIDDING status)
        this.apiService.getTasks({ 
            status: 'POSTED' as any 
        }).subscribe({
            next: (response) => {
                let tasks = response.data.map(apiTask => ApiMapper.toLocalTask(apiTask));
                
                // Filter by worker categories if defined
                if (this.currentUser?.categories && this.currentUser.categories.length > 0) {
                    tasks = tasks.filter(t => {
                        if (t.category) {
                            return this.currentUser!.categories!.some(cat => 
                                cat.toLowerCase() === t.category!.toLowerCase()
                            );
                        }
                        return true;
                    });
                }
                
                // Also include BIDDING tasks
                this.apiService.getTasks({ 
                    status: 'BIDDING' as any 
                }).subscribe({
                    next: (biddingResponse) => {
                        let biddingTasks = biddingResponse.data.map(apiTask => ApiMapper.toLocalTask(apiTask));
                        
                        // Filter by worker categories
                        if (this.currentUser?.categories && this.currentUser.categories.length > 0) {
                            biddingTasks = biddingTasks.filter(t => {
                                if (t.category) {
                                    return this.currentUser!.categories!.some(cat => 
                                        cat.toLowerCase() === t.category!.toLowerCase()
                                    );
                                }
                                return true;
                            });
                        }
                        
                        this.availableTasksSubject.next([...tasks, ...biddingTasks]);
                    },
                    error: (error) => console.error('Error loading bidding tasks:', error)
                });
            },
            error: (error) => {
                console.error('Error loading available tasks:', error);
                this.isLoadingTasks = false;
            }
        });

        // Load worker's active task
        this.apiService.getTasks({ 
            workerId: this.currentUser.id 
        }).subscribe({
            next: (response) => {
                const tasks = response.data.map(apiTask => ApiMapper.toLocalTask(apiTask));
                const activeTask = tasks.find(t => 
                    t.status === TaskStatus.ASSIGNED ||
                    t.status === TaskStatus.CONFIRMED ||
                    t.status === TaskStatus.TRAVELING ||
                    t.status === TaskStatus.ARRIVED ||
                    t.status === TaskStatus.IN_PROGRESS ||
                    t.status === TaskStatus.WORK_COMPLETED
                );
                this.activeTaskSubject.next(activeTask);
                
                // Also extract completed tasks
                const completedTasks = tasks.filter(t => 
                    t.status === TaskStatus.VERIFIED ||
                    t.status === TaskStatus.PAID ||
                    t.status === TaskStatus.COMPLETED
                );
                this.completedTasksSubject.next(completedTasks);
                
                this.isLoadingTasks = false;
            },
            error: (error) => {
                console.error('Error loading worker tasks:', error);
                this.isLoadingTasks = false;
            }
        });
    }

    handleBidSubmit(event: Event) {
        event.preventDefault();
        const form = event.target as HTMLFormElement;
        const formData = new FormData(form);

        const data = {
            taskId: this.biddingOn.id,
            workerId: this.currentUser?.id,
            workerName: this.currentUser?.name,
            workerAvatar: this.currentUser?.avatar,
            workerRating: this.currentUser?.rating,
            amount: Number(formData.get('amount')),
            estimatedDays: Number(formData.get('estimatedDays')),
            message: formData.get('message') as string,
        };

        this.appService.placeBid(data);
        this.biddingOn = null;
        // Reload available tasks after bid
        setTimeout(() => this.loadWorkerTasks(), 500);
    }

    markArrival(taskId: string) {
        this.appService.markWorkerArrival(taskId);
    }

    markAsArrived(taskId: string) {
        this.appService.updateTaskStatus(taskId, TaskStatus.ARRIVED);
        setTimeout(() => this.loadWorkerTasks(), 500);
    }

    startWork(taskId: string) {
        this.appService.updateTaskStatus(taskId, TaskStatus.IN_PROGRESS);
        setTimeout(() => this.loadWorkerTasks(), 500);
    }

    completeWork(taskId: string) {
        this.appService.updateTaskStatus(taskId, TaskStatus.WORK_COMPLETED);
        setTimeout(() => this.loadWorkerTasks(), 500);
    }

    confirmBooking(taskId: string) {
        this.appService.updateTaskStatus(taskId, TaskStatus.CONFIRMED);
        setTimeout(() => this.loadWorkerTasks(), 500);
    }

    startTraveling(taskId: string) {
        this.appService.updateTaskStatus(taskId, TaskStatus.TRAVELING);
        setTimeout(() => this.loadWorkerTasks(), 500);
    }

    setBiddingOn(task: Task | null) {
        this.biddingOn = task;
    }

    formatDate(date: string) {
        return new Date(date).toLocaleDateString();
    }

    getLocationDisplay(location: any): string {
        if (!location) return 'N/A';
        if (typeof location === 'string') return location;
        if (typeof location === 'object' && location.fullAddress) {
            return location.fullAddress;
        }
        // Fallback: construct from available parts
        const parts = [];
        if (location.area) parts.push(location.area);
        if (location.city) parts.push(location.city);
        if (location.state) parts.push(location.state);
        return parts.length > 0 ? parts.join(', ') : 'Location not specified';
    }

    canRaiseDispute(task: Task): boolean {
        if (!task.completionDate) return false;
        const completionDate = new Date(task.completionDate).getTime();
        const now = new Date().getTime();
        const hoursDiff = (now - completionDate) / (1000 * 60 * 60);
        return hoursDiff <= 72;
    }

    openDisputeModal(taskId: string) {
        this.disputeTaskId = taskId;
        this.showDisputeModal = true;
        this.disputeReason = '';
    }

    submitDispute() {
        if (this.disputeReason.trim() && this.currentUser) {
            this.appService.createDispute({
                taskId: this.disputeTaskId,
                initiatorId: this.currentUser.id,
                initiatorRole: UserRole.WORKER,
                respondentId: '',
                reason: this.disputeReason
            });
            this.showDisputeModal = false;
            this.disputeReason = '';
            this.router.navigate(['/disputes']);
        }
    }

    getEarnings(): number {
        const completedTasks = this.completedTasksSubject.value;
        return completedTasks.reduce((sum, task) => sum + (task.finalPrice || task.budgetMax || 0), 0);
    }

    getCompletedJobsCount(): number {
        return this.completedTasksSubject.value.length;
    }

    getAverageRating(): number {
        return this.currentUser?.rating || 0;
    }

    // Location filter methods
    loadLocationFilter() {
        this.showLocationFilter = true;
        this.isLoadingLocation = true;
        this.locationError = '';

        this.locationApi.getPopularCities().subscribe({
            next: (response) => {
                this.allCities = response.data;
                this.isLoadingLocation = false;
            },
            error: (error) => {
                this.locationError = 'Failed to load cities';
                this.isLoadingLocation = false;
            }
        });
    }

    onCitySelect(cityId: string) {
        if (!cityId) {
            this.filteredAreas = [];
            this.selectedAreaFilter = null;
            return;
        }

        this.isLoadingLocation = true;
        this.locationApi.getAreas(cityId).subscribe({
            next: (response) => {
                this.filteredAreas = response.data;
                this.isLoadingLocation = false;
                this.selectedAreaFilter = null;
            },
            error: (error) => {
                this.locationError = 'Failed to load areas';
                this.isLoadingLocation = false;
            }
        });
    }

    filterByArea(areaName: string) {
        this.selectedAreaFilter = areaName;
    }

    clearLocationFilter() {
        this.showLocationFilter = false;
        this.selectedCityFilter = '';
        this.selectedAreaFilter = null;
        this.filteredAreas = [];
        this.locationError = '';
    }

    getFilteredTasks(tasks: Task[]): Task[] {
        let filtered = tasks;

        // Filter by location
        if (this.selectedAreaFilter) {
            filtered = filtered.filter(task => {
                const taskArea = task.location?.area?.toLowerCase();
                return taskArea === this.selectedAreaFilter?.toLowerCase();
            });
        }

        // Filter by category
        if (this.selectedCategoryFilter) {
            filtered = filtered.filter(task => {
                const taskCategory = task.category?.toLowerCase();
                return taskCategory === this.selectedCategoryFilter?.toLowerCase();
            });
        }
        
        return filtered;
    }

    // Category filter methods
    toggleCategoryFilter() {
        this.showCategoryFilter = !this.showCategoryFilter;
        if (!this.showCategoryFilter) {
            this.selectedCategoryFilter = null;
        }
    }

    filterByCategory(categoryName: string | null) {
        this.selectedCategoryFilter = categoryName;
    }

    clearCategoryFilter() {
        this.selectedCategoryFilter = null;
        this.showCategoryFilter = false;
    }
}