import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AppService } from '../../app.service';
import { TaskCardComponent } from '../../components/task-card/task-card.component';
import { TaskStatusTimelineComponent } from '../../components/task-status-timeline/task-status-timeline.component';
import { Task, TaskStatus, UserRole } from '../../types';
import { STATUS_COLORS, CURRENCY } from '../../constants';
import {
    LucideAngularModule,
    Plus,
    AlertCircle,
    CheckCircle2,
    Clock,
    ChevronDown,
    ChevronUp
} from 'lucide-angular';
import { Observable, map } from 'rxjs';

@Component({
    selector: 'app-customer-dashboard',
    standalone: true,
    imports: [CommonModule, FormsModule, LucideAngularModule, TaskCardComponent, TaskStatusTimelineComponent],
    templateUrl: './customer-dashboard.component.html',
    styleUrls: ['./customer-dashboard.component.css']
})
export class CustomerDashboardComponent implements OnInit {
    currentUser: any = null;
    selectedTaskTab = 'All';
    myTasks: Task[] = [];
    expandedTaskIds: Set<string> = new Set();

    readonly TaskStatus = TaskStatus;
    readonly STATUS_COLORS = STATUS_COLORS;
                <div class="max-w-6xl mx-auto flex items-center justify-between">
                    <div>
                        <h1 class="text-3xl font-black mb-2 tracking-tight">Welcome, {{ currentUser?.name }}!</h1>
                        <p class="text-indigo-100 font-medium">Manage all your service bookings</p>
                    </div>
                    <button (click)="router.navigate(['/customer/post-task'])"
                        class="flex items-center gap-2 bg-white text-indigo-600 px-6 py-3 rounded-xl hover:bg-indigo-50 font-bold shadow-lg transition-all">
                        <lucide-icon [img]="Plus" class="w-5 h-5"></lucide-icon>
                        Post Task
                    </button>
                </div>
            </div>

            <div class="max-w-6xl mx-auto px-4 py-12">
                <!-- Pending Actions Section -->
                <div class="mb-12">
                    <h2 class="text-2xl font-black text-slate-900 mb-6">Pending Actions</h2>
                    
                    <div *ngIf="(getPendingActions() | async) as pendingTasks" class="space-y-4">
                        <div *ngIf="pendingTasks.length === 0" class="text-center py-12 bg-slate-50 rounded-xl border border-slate-200">
                            <lucide-icon [img]="CheckCircle2" class="w-12 h-12 text-emerald-300 mx-auto mb-3"></lucide-icon>
                            <p class="text-slate-600 font-medium">No pending actions required</p>
                        </div>

                        <div *ngFor="let task of pendingTasks" class="bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-lg transition-shadow">
                            <div class="p-6">
                                <!-- Task Header with Expand Toggle -->
                                <div class="flex items-start justify-between cursor-pointer" (click)="toggleExpandedTask(task.id)">
                                    <div class="flex-1">
                                        <div class="flex items-center gap-3 mb-2">
                                            <h3 class="text-lg font-bold text-slate-900">{{ task.title }}</h3>
                                            <span [ngClass]="STATUS_COLORS[task.status]" class="text-xs font-bold px-3 py-1 rounded-full border whitespace-nowrap">
                                                {{ formatStatus(task.status) }}
                                            </span>
                                        </div>
                                        <p class="text-sm text-slate-600 font-medium">{{ task.description | slice:0:100 }}...</p>
                                    </div>
                                    <button (click)="$event.stopPropagation()" class="text-slate-400 hover:text-slate-600">
                                        <lucide-icon *ngIf="!isTaskExpanded(task.id)" [img]="ChevronDown" class="w-6 h-6"></lucide-icon>
                                        <lucide-icon *ngIf="isTaskExpanded(task.id)" [img]="ChevronUp" class="w-6 h-6"></lucide-icon>
                                    </button>
                                </div>

                                <!-- Progress Bar -->
                                <div class="mt-4 mb-4">
                                    <div class="flex items-center justify-between mb-2">
                                        <span class="text-xs font-semibold text-slate-600 uppercase">Progress</span>
                                        <span class="text-xs font-bold text-slate-900">{{ getTaskProgress(task) }}%</span>
                                    </div>
                                    <div class="w-full bg-slate-200 rounded-full h-2">
                                        <div class="bg-gradient-to-r from-indigo-500 to-indigo-600 h-2 rounded-full transition-all duration-300"
                                            [style.width.%]="getTaskProgress(task)"></div>
                                    </div>
                                </div>

                                <!-- Quick Info Grid -->
                                <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm py-4 border-y border-slate-100">
                                    <div>
                                        <p class="text-slate-500 font-semibold text-xs uppercase">Location</p>
                                        <p class="font-bold text-slate-900">{{ task.location.city }}</p>
                                    </div>
                                    <div>
                                        <p class="text-slate-500 font-semibold text-xs uppercase">Date</p>
                                        <p class="font-bold text-slate-900">{{ formatDate(task.preferredDate) }}</p>
                                    </div>
                                    <div>
                                        <p class="text-slate-500 font-semibold text-xs uppercase">Budget</p>
                                        <p class="font-bold text-slate-900">{{ CURRENCY }}{{ task.budgetMin }}-{{ task.budgetMax }}</p>
                                    </div>
                                    <div>
                                        <p class="text-slate-500 font-semibold text-xs uppercase">Status</p>
                                        <p class="font-bold text-slate-900">{{ getPendingActionText(task) }}</p>
                                    </div>
                                </div>

                                <!-- Expanded Details -->
                                <div *ngIf="isTaskExpanded(task.id)" class="pt-4 space-y-4 border-t border-slate-100 mt-4">
                                    <div>
                                        <p class="text-xs text-slate-500 font-semibold uppercase mb-2">Full Description</p>
                                        <p class="text-sm text-slate-700">{{ task.description }}</p>
                                    </div>

                                    <!-- Action Buttons -->
                                    <div class="flex gap-3 pt-4">
                                        <button *ngIf="task.status === TaskStatus.POSTED"
                                            (click)="router.navigate(['/customer/bookings'])"
                                            class="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                                            Review Bids
                                        </button>
                                        <button *ngIf="task.status === TaskStatus.WORK_COMPLETED"
                                            (click)="router.navigate(['/customer/bookings'])"
                                            class="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                                            Approve Work
                                        </button>
                                        <button *ngIf="task.status === TaskStatus.VERIFIED && !hasReview(task)"
                                            (click)="router.navigate(['/customer/bookings'])"
                                            class="flex-1 bg-amber-600 hover:bg-amber-700 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                                            Leave Review
                                        </button>
                                        <button *ngIf="task.status === TaskStatus.PAID"
                                            class="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                                            Payment Complete
                                        </button>
                                        <button (click)="router.navigate(['/customer/bookings'])"
                                            class="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-900 font-bold py-2 px-4 rounded-lg transition-colors">
                                            View Full Details
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- All Tasks Tab Section -->
                <div>
                    <h2 class="text-2xl font-black text-slate-900 mb-6">All Tasks</h2>
                    
                    <!-- Task Tabs -->
                    <div class="mb-6 border-b border-slate-200">
                        <div class="flex gap-6 overflow-x-auto">
                            <button *ngFor="let tab of ['All', 'Active', 'Pending', 'Completed', 'Cancelled']"
                                (click)="selectedTaskTab = tab"
                                [class.border-b-2]="selectedTaskTab === tab"
                                [class.border-indigo-600]="selectedTaskTab === tab"
                                [class.text-indigo-600]="selectedTaskTab === tab"
                                [class.text-slate-500]="selectedTaskTab !== tab"
                                class="pb-4 font-bold whitespace-nowrap transition-colors">
                                {{ tab }}
                            </button>
                        </div>
                    </div>

                    <!-- Tasks List -->
                    <div *ngIf="(getFilteredTasks() | async) as tasks" class="space-y-4">
                        <div *ngIf="tasks.length === 0" class="text-center py-12 bg-slate-50 rounded-xl border border-slate-200">
                            <lucide-icon [img]="AlertCircle" class="w-12 h-12 text-slate-300 mx-auto mb-3"></lucide-icon>
                            <p class="text-slate-600 font-medium">No {{ selectedTaskTab.toLowerCase() }} tasks yet</p>
                        </div>

                        <div *ngFor="let task of tasks" class="bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-lg transition-shadow"
                            [class.border-l-4]="true"
                            [class.border-l-indigo-600]="task.status === TaskStatus.BIDDING"
                            [class.border-l-amber-600]="task.status === TaskStatus.ASSIGNED"
                            [class.border-l-emerald-600]="task.status === TaskStatus.IN_PROGRESS"
                            [class.border-l-green-600]="task.status === TaskStatus.COMPLETED">
                            
                            <div class="p-6">
                                <div class="flex items-start justify-between mb-4">
                                    <div>
                                        <h3 class="text-lg font-bold text-slate-900">{{ task.title }}</h3>
                                        <p class="text-sm text-slate-600 mt-1 font-medium">{{ task.description | slice:0:80 }}...</p>
                                    </div>
                                    <span [ngClass]="STATUS_COLORS[task.status]" class="text-xs font-bold px-3 py-1 rounded-full border whitespace-nowrap">
                                        {{ formatStatus(task.status) }}
                                    </span>
                                </div>

                                <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                    <div>
                                        <p class="text-slate-500 font-semibold text-xs uppercase">Location</p>
                                        <p class="font-bold text-slate-900">{{ task.location.city }}</p>
                                    </div>
                                    <div>
                                        <p class="text-slate-500 font-semibold text-xs uppercase">Date</p>
                                        <p class="font-bold text-slate-900">{{ formatDate(task.preferredDate) }}</p>
                                    </div>
                                    <div>
                                        <p class="text-slate-500 font-semibold text-xs uppercase">Budget</p>
                                        <p class="font-bold text-slate-900">{{ CURRENCY }}{{ task.budgetMin }}-{{ task.budgetMax }}</p>
                                    </div>
                                    <div>
                                        <p class="text-slate-500 font-semibold text-xs uppercase">Bids</p>
                                        <p class="font-bold text-slate-900">{{ task.bids.length }} proposal{{ task.bids.length !== 1 ? 's' : '' }}</p>
                                    </div>
                                </div>

                                <div class="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                                    <button (click)="router.navigate(['/customer/bookings'])"
                                        class="text-indigo-600 hover:text-indigo-700 font-bold text-sm transition-colors">
                                        View Details →
                                    </button>
                                    <span class="text-xs text-slate-500 font-medium">ID: {{ task.id }}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `,
    styles: []
})
export class CustomerDashboardComponent implements OnInit {
    currentUser: any = null;
    selectedTaskTab = 'All';
    myTasks: Task[] = [];
    expandedTaskIds: Set<string> = new Set();

    readonly TaskStatus = TaskStatus;
    readonly STATUS_COLORS = STATUS_COLORS;
    readonly CURRENCY = CURRENCY;
    readonly UserRole = UserRole;

    readonly Plus = Plus;
    readonly AlertCircle = AlertCircle;
    readonly CheckCircle2 = CheckCircle2;
    readonly Clock = Clock;
    readonly ChevronDown = ChevronDown;
    readonly ChevronUp = ChevronUp;

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
}
