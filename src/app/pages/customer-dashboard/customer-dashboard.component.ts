import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AppService } from '../../app.service';
import { TaskCardComponent } from '../../components/task-card/task-card.component';
import { TaskStatusTimelineComponent } from '../../components/task-status-timeline/task-status-timeline.component';
import { ReviewModalComponent } from '../../components/review-modal/review-modal.component';
import { PlatformActivityComponent } from '../../components/platform-activity/platform-activity.component';
import { Task, TaskStatus, UserRole, Bid } from '../../types';
import { STATUS_COLORS, CURRENCY } from '../../constants';
import {
    LucideAngularModule,
    Plus,
    AlertCircle,
    CheckCircle,
    CheckCircle2,
    Clock,
    ChevronDown,
    ChevronUp,
    Search,
    ChevronRight,
    X,
    Star
} from 'lucide-angular';
import { Observable, map } from 'rxjs';

@Component({
    selector: 'app-customer-dashboard',
    standalone: true,
    imports: [CommonModule, FormsModule, LucideAngularModule, TaskCardComponent, TaskStatusTimelineComponent, ReviewModalComponent, PlatformActivityComponent],
    templateUrl: './customer-dashboard.component.html',
    styleUrls: ['./customer-dashboard.component.css']
})
export class CustomerDashboardComponent implements OnInit {
    currentUser: any = null;
    selectedTaskTab = 'All';
    myTasks: Task[] = [];
    expandedTaskIds: Set<string> = new Set();
    selectedTask: Task | null = null;
    isPostingTask = false;
    showCompletedTasks = false;
    selectedState = '';
    selectedCity = '';
    selectedArea = '';
    fullAddress = '';
    availableCities: string[] = [];
    availableAreas: string[] = [];
    showReviewModal = false;
    reviewingWorkerId = '';
    reviewingTaskId = '';
    bidSortOrder: 'asc' | 'desc' = 'asc';

    readonly TaskStatus = TaskStatus;
    readonly STATUS_COLORS = STATUS_COLORS;
    readonly CURRENCY = CURRENCY;
    readonly UserRole = UserRole;

    readonly Plus = Plus;
    readonly AlertCircle = AlertCircle;
    readonly CheckCircle = CheckCircle;
    readonly CheckCircle2 = CheckCircle2;
    readonly Clock = Clock;
    readonly ChevronDown = ChevronDown;
    readonly ChevronUp = ChevronUp;
    readonly Search = Search;
    readonly ChevronRight = ChevronRight;
    readonly X = X;
    readonly Star = Star;

    constructor(public appService: AppService, public router: Router) {}

    ngOnInit() {
        this.appService.currentUser$.subscribe(user => {
            this.currentUser = user;
        });

        this.appService.tasks$.subscribe(tasks => {
            this.myTasks = tasks.filter(t => t.customerId === this.appService.currentUser?.id);
        });
    }

    getPendingActions(): Observable<Task[]> {
        return this.appService.tasks$.pipe(
            map(tasks => {
                const userTasks = tasks.filter(t => t.customerId === this.appService.currentUser?.id);
                
                // Filter tasks that need action
                const pendingTasks = userTasks.filter(t => {
                    // Tasks with bids pending review
                    if (t.status === TaskStatus.POSTED && t.bids.length > 0) return true;
                    
                    // Tasks waiting for work completion approval
                    if (t.status === TaskStatus.WORK_COMPLETED) return true;
                    
                    // Tasks waiting for review after verification
                    if (t.status === TaskStatus.VERIFIED && !this.hasReview(t)) return true;
                    
                    // Tasks with payment status
                    if (t.status === TaskStatus.PAID) return true;
                    
                    return false;
                });
                
                return pendingTasks.sort((a, b) => 
                    new Date(b.createdDate || '').getTime() - new Date(a.createdDate || '').getTime()
                );
            })
        );
    }

    getTaskProgress(task: Task): number {
        const statusProgression = [
            TaskStatus.POSTED, TaskStatus.BIDDING, TaskStatus.ASSIGNED, 
            TaskStatus.CONFIRMED, TaskStatus.TRAVELING, TaskStatus.ARRIVED,
            TaskStatus.IN_PROGRESS, TaskStatus.WORK_COMPLETED, TaskStatus.VERIFIED,
            TaskStatus.PAID, TaskStatus.COMPLETED
        ];
        
        const currentIndex = statusProgression.indexOf(task.status);
        if (currentIndex === -1) return 0;
        
        return Math.round((currentIndex / (statusProgression.length - 1)) * 100);
    }

    getPendingActionText(task: Task): string {
        switch (task.status) {
            case TaskStatus.POSTED:
                return `${task.bids.length} bid${task.bids.length !== 1 ? 's' : ''} received`;
            case TaskStatus.WORK_COMPLETED:
                return 'Awaiting approval';
            case TaskStatus.VERIFIED:
                return 'Review pending';
            case TaskStatus.PAID:
                return 'Payment done';
            default:
                return this.formatStatus(task.status);
        }
    }

    hasReview(task: Task): boolean {
        return this.appService.currentUser && (task as any).reviews?.some(
            (r: any) => r.reviewerId === this.appService.currentUser?.id
        );
    }

    toggleExpandedTask(taskId: string) {
        if (this.expandedTaskIds.has(taskId)) {
            this.expandedTaskIds.delete(taskId);
        } else {
            this.expandedTaskIds.add(taskId);
        }
    }

    isTaskExpanded(taskId: string): boolean {
        return this.expandedTaskIds.has(taskId);
    }

    getFilteredTasks(): Observable<Task[]> {
        return this.appService.tasks$.pipe(
            map(tasks => {
                let filtered = tasks.filter(t => t.customerId === this.appService.currentUser?.id);

                switch (this.selectedTaskTab) {
                    case 'Active':
                        filtered = filtered.filter(t => 
                            [TaskStatus.BIDDING, TaskStatus.ASSIGNED, TaskStatus.CONFIRMED,
                             TaskStatus.TRAVELING, TaskStatus.ARRIVED, TaskStatus.IN_PROGRESS].includes(t.status)
                        );
                        break;
                    case 'Pending':
                        filtered = filtered.filter(t => t.status === TaskStatus.POSTED);
                        break;
                    case 'Completed':
                        filtered = filtered.filter(t => t.status === TaskStatus.COMPLETED);
                        break;
                    case 'Cancelled':
                        filtered = filtered.filter(t => t.status === TaskStatus.CANCELLED);
                        break;
                }

                return filtered.sort((a, b) => new Date(b.createdDate || '').getTime() - new Date(a.createdDate || '').getTime());
            })
        );
    }

    formatStatus(status: string): string {
        return status.replace(/_/g, ' ');
    }

    formatDate(date: string): string {
        return new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
    }

    get customerTasks$(): Observable<Task[]> {
        return this.appService.tasks$.pipe(
            map(tasks => tasks.filter(t => t.customerId === this.appService.currentUser?.id))
        );
    }

    get completedTasks(): Task[] {
        return this.myTasks.filter(t => t.status === TaskStatus.COMPLETED);
    }

    get CATEGORIES() {
        return this.appService.getServiceCategories();
    }

    get STATES() {
        return ['Delhi', 'Maharashtra', 'Karnataka', 'Tamil Nadu', 'West Bengal'];
    }

    setSelectedTask(task: Task | null) {
        this.selectedTask = task;
    }

    togglePreviousBookings() {
        this.showCompletedTasks = !this.showCompletedTasks;
    }

    getStarArray(count: number): number[] {
        return Array(Math.floor(count)).fill(0);
    }

    getAverageRating(task: Task): number {
        const reviews = (task as any).reviews || [];
        if (reviews.length === 0) return 0;
        const sum = reviews.reduce((acc: number, r: any) => acc + r.rating, 0);
        return +(sum / reviews.length).toFixed(1);
    }

    onStateChange() {
        this.selectedCity = '';
        this.selectedArea = '';
        if (this.selectedState) {
            // Mock cities for each state
            const citiesMap: any = {
                'Delhi': ['North Delhi', 'South Delhi', 'East Delhi', 'West Delhi'],
                'Maharashtra': ['Mumbai', 'Pune', 'Nagpur', 'Thane'],
                'Karnataka': ['Bangalore', 'Mysore', 'Mangalore', 'Hubli'],
                'Tamil Nadu': ['Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli'],
                'West Bengal': ['Kolkata', 'Howrah', 'Durgapur', 'Siliguri']
            };
            this.availableCities = citiesMap[this.selectedState] || [];
        } else {
            this.availableCities = [];
        }
    }

    onCityChange() {
        this.selectedArea = '';
        if (this.selectedCity) {
            // Mock areas
            this.availableAreas = ['Area 1', 'Area 2', 'Area 3', 'Area 4'];
        } else {
            this.availableAreas = [];
        }
    }

    handleSubmitTask(event: Event) {
        event.preventDefault();
        const form = event.target as HTMLFormElement;
        const formData = new FormData(form);
        
        const taskData = {
            title: formData.get('title') as string,
            description: formData.get('description') as string,
            category: formData.get('category') as string,
            budgetMin: Number(formData.get('budgetMin')),
            budgetMax: Number(formData.get('budgetMax')),
            preferredDate: formData.get('preferredDate') as string,
            location: {
                state: this.selectedState,
                city: this.selectedCity,
                area: this.selectedArea,
                fullAddress: formData.get('fullAddress') as string
            }
        };

        this.appService.createTask(taskData);
        this.isPostingTask = false;
        form.reset();
        this.selectedState = '';
        this.selectedCity = '';
        this.selectedArea = '';
    }

    get sortedBids(): Bid[] {
        if (!this.selectedTask) return [];
        const bids = [...this.selectedTask.bids];
        return bids.sort((a, b) => {
            return this.bidSortOrder === 'asc' ? a.amount - b.amount : b.amount - a.amount;
        });
    }

    toggleBidSort() {
        this.bidSortOrder = this.bidSortOrder === 'asc' ? 'desc' : 'asc';
    }

    selectWorker(taskId: string, bidId: string) {
        this.appService.acceptBid(taskId, bidId);
    }

    approveTask(taskId: string) {
        this.appService.updateTaskStatus(taskId, TaskStatus.VERIFIED);
    }

    openReviewModal(taskId: string, workerId: string | null | undefined) {
        if (workerId) {
            this.reviewingTaskId = taskId;
            this.reviewingWorkerId = workerId;
            this.showReviewModal = true;
        }
    }

    handleReviewSubmit(event: any) {
        console.log('Review submitted:', event);
        this.showReviewModal = false;
    }
}
