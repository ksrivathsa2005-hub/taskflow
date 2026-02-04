import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AppService } from '../../../app.service';
import { ToastService } from '../../../services/toast.service';
import { Task, TaskStatus } from '../../../types';
import { STATUS_COLORS, CURRENCY } from '../../../constants';
import { TaskStatusTimelineComponent } from '../../../components/task-status-timeline/task-status-timeline.component';
import {
    LucideAngularModule,
    MapPin,
    Calendar,
    DollarSign,
    Star,
    User,
    Phone,
    MessageSquare,
    X,
    ChevronDown,
    ChevronUp,
    CheckCircle2
} from 'lucide-angular';

@Component({
    selector: 'app-my-bookings',
    standalone: true,
    imports: [CommonModule, FormsModule, LucideAngularModule, TaskStatusTimelineComponent],
    template: `
        <div class="min-h-screen bg-gradient-to-b from-slate-50 to-white">
            <!-- Header -->
            <div class="bg-gradient-to-r from-indigo-600 to-indigo-800 text-white py-12 px-4">
                <div class="max-w-7xl mx-auto">
                    <h1 class="text-4xl font-black mb-2 tracking-tight">My Bookings</h1>
                    <p class="text-indigo-100 text-lg font-medium">Track all your service bookings in one place</p>
                </div>
            </div>

            <div class="max-w-7xl mx-auto px-4 py-12">
                <!-- Tabs -->
                <div class="mb-8 border-b border-slate-200">
                    <div class="flex gap-8 overflow-x-auto">
                        <button *ngFor="let tab of tabs"
                            (click)="selectTab(tab)"
                            [class.border-b-2]="selectedTab === tab"
                            [class.border-indigo-600]="selectedTab === tab"
                            [class.text-indigo-600]="selectedTab === tab"
                            [class.text-slate-500]="selectedTab !== tab"
                            class="pb-4 font-bold whitespace-nowrap transition-colors">
                            {{ tab }}
                            <span class="ml-2 text-sm bg-slate-100 text-slate-700 px-2 py-1 rounded-full">
                                {{ getTabCount(tab) }}
                            </span>
                        </button>
                    </div>
                </div>

                <!-- Empty State -->
                <div *ngIf="getFilteredTasks().length === 0" class="text-center py-16">
                    <div class="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <lucide-icon [img]="MessageSquare" class="w-8 h-8 text-slate-400"></lucide-icon>
                    </div>
                    <h3 class="text-xl font-bold text-slate-900 mb-2">No bookings found</h3>
                    <p class="text-slate-500 mb-6">You don't have any {{ selectedTab.toLowerCase() }} bookings yet.</p>
                </div>

                <!-- Bookings List -->
                <div *ngIf="getFilteredTasks().length > 0" class="space-y-4">
                    <div *ngFor="let task of getFilteredTasks()"
                        class="bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-lg transition-shadow"
                        [class.border-l-4]="true"
                        [class.border-l-indigo-600]="task.status === TaskStatus.BIDDING"
                        [class.border-l-amber-600]="task.status === TaskStatus.ASSIGNED"
                        [class.border-l-emerald-600]="task.status === TaskStatus.IN_PROGRESS"
                        [class.border-l-green-600]="task.status === TaskStatus.COMPLETED">
                        
                        <!-- Collapsed View -->
                        <div (click)="toggleExpandedTask(task.id)"
                            class="p-6 cursor-pointer hover:bg-slate-50 transition-colors">
                            <div class="flex items-start justify-between">
                                <div class="flex-1">
                                    <!-- Title and Status -->
                                    <div class="flex items-center gap-3 mb-2">
                                        <h3 class="text-lg font-bold text-slate-900">{{ task.title }}</h3>
                                        <span [ngClass]="STATUS_COLORS[task.status]" class="text-xs font-bold px-3 py-1 rounded-full border">
                                            {{ formatStatus(task.status) }}
                                        </span>
                                    </div>

                                    <!-- Details Grid -->
                                    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 text-sm">
                                        <div class="flex items-center gap-2 text-slate-600">
                                            <lucide-icon [img]="MapPin" class="w-4 h-4 text-slate-400"></lucide-icon>
                                            {{ task.location.city }}
                                        </div>
                                        <div class="flex items-center gap-2 text-slate-600">
                                            <lucide-icon [img]="Calendar" class="w-4 h-4 text-slate-400"></lucide-icon>
                                            {{ formatDate(task.preferredDate) }}
                                        </div>
                                        <div class="flex items-center gap-2 text-slate-600">
                                            <lucide-icon [img]="DollarSign" class="w-4 h-4 text-slate-400"></lucide-icon>
                                            ₹{{ task.budgetMin }} - ₹{{ task.budgetMax }}
                                        </div>
                                        <div *ngIf="task.workerId" class="flex items-center gap-2 text-slate-600">
                                            <lucide-icon [img]="User" class="w-4 h-4 text-slate-400"></lucide-icon>
                                            <span>Worker Assigned</span>
                                        </div>
                                    </div>
                                </div>

                                <!-- Toggle Icon -->
                                <lucide-icon [img]="expandedTaskId === task.id ? ChevronUp : ChevronDown"
                                    class="w-6 h-6 text-slate-400 ml-4 flex-shrink-0"></lucide-icon>
                            </div>
                        </div>

                        <!-- Expanded View -->
                        <div *ngIf="expandedTaskId === task.id" class="border-t border-slate-100 bg-slate-50">
                            <!-- Full Description -->
                            <div class="p-6 border-b border-slate-200">
                                <h4 class="font-bold text-slate-900 mb-2">Description</h4>
                                <p class="text-slate-600 font-medium">{{ task.description }}</p>
                            </div>

                            <!-- Worker Info (if assigned) -->
                            <div *ngIf="task.workerId && getWorkerForTask(task)" class="p-6 border-b border-slate-200">
                                <h4 class="font-bold text-slate-900 mb-4">Assigned Professional</h4>
                                <div class="flex items-start justify-between">
                                    <div class="flex items-start gap-4">
                                        <img [src]="getWorkerForTask(task)?.avatar" 
                                            [alt]="getWorkerForTask(task)?.name"
                                            class="w-12 h-12 rounded-lg object-cover">
                                        <div>
                                            <p class="font-bold text-slate-900">{{ getWorkerForTask(task)?.name }}</p>
                                            <div class="flex items-center gap-2 mt-1">
                                                <div class="flex">
                                                    <lucide-icon [img]="Star" class="w-4 h-4 fill-amber-400 text-amber-400" *ngFor="let i of [1,2,3,4,5]"></lucide-icon>
                                                </div>
                                                <span class="text-sm font-bold text-slate-600">{{ getWorkerForTask(task)?.rating }}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <button class="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors font-bold text-sm">
                                        <lucide-icon [img]="Phone" class="w-4 h-4"></lucide-icon>
                                        Call
                                    </button>
                                </div>
                            </div>

                            <!-- Timeline -->
                            <div class="p-6 border-b border-slate-200">
                                <app-task-status-timeline [task]="task"></app-task-status-timeline>
                            </div>

                            <!-- Action Buttons -->
                            <div class="p-6 flex items-center justify-between gap-3">
                                <button *ngIf="task.status === TaskStatus.WORK_COMPLETED"
                                    (click)="approveTask(task)"
                                    class="flex-1 bg-emerald-600 text-white px-4 py-3 rounded-lg hover:bg-emerald-700 transition-colors font-bold flex items-center justify-center gap-2">
                                    <lucide-icon [img]="CheckCircle2" class="w-5 h-5"></lucide-icon>
                                    Approve Work
                                </button>
                                <button class="flex-1 bg-slate-100 text-slate-700 px-4 py-3 rounded-lg hover:bg-slate-200 transition-colors font-bold">
                                    Cancel Booking
                                </button>
                                <button *ngIf="task.status === TaskStatus.COMPLETED && !hasReviewed(task)"
                                    (click)="leaveReview(task)"
                                    class="flex-1 bg-indigo-600 text-white px-4 py-3 rounded-lg hover:bg-indigo-700 transition-colors font-bold">
                                    Leave Review
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `,
    styles: []
})
export class MyBookingsComponent implements OnInit {
    selectedTab = 'All';
    tabs = ['All', 'Active', 'Pending', 'Completed', 'Cancelled'];
    expandedTaskId: string | null = null;
    myTasks: Task[] = [];

    readonly TaskStatus = TaskStatus;
    readonly STATUS_COLORS = STATUS_COLORS;
    readonly CURRENCY = CURRENCY;

    readonly MapPin = MapPin;
    readonly Calendar = Calendar;
    readonly DollarSign = DollarSign;
    readonly Star = Star;
    readonly User = User;
    readonly Phone = Phone;
    readonly MessageSquare = MessageSquare;
    readonly X = X;
    readonly ChevronDown = ChevronDown;
    readonly ChevronUp = ChevronUp;
    readonly CheckCircle2 = CheckCircle2;

    constructor(public appService: AppService) {}

    ngOnInit() {
        this.appService.tasks$.subscribe((tasks: Task[]) => {
            this.myTasks = tasks.filter((t: Task) => t.customerId === this.appService.currentUser?.id);
        });
    }

    selectTab(tab: string) {
        this.selectedTab = tab;
        this.expandedTaskId = null;
    }

    getFilteredTasks(): Task[] {
        const currentUserId = this.appService.currentUser?.id;
        let tasks = this.myTasks;

        switch (this.selectedTab) {
            case 'Active':
                tasks = tasks.filter(t => 
                    [TaskStatus.BIDDING, TaskStatus.ASSIGNED, TaskStatus.CONFIRMED, 
                     TaskStatus.TRAVELING, TaskStatus.ARRIVED, TaskStatus.IN_PROGRESS].includes(t.status)
                );
                break;
            case 'Pending':
                tasks = tasks.filter(t => t.status === TaskStatus.POSTED);
                break;
            case 'Completed':
                tasks = tasks.filter(t => t.status === TaskStatus.COMPLETED);
                break;
            case 'Cancelled':
                tasks = tasks.filter(t => t.status === TaskStatus.CANCELLED);
                break;
        }

        return tasks.sort((a, b) => new Date(b.createdDate || '').getTime() - new Date(a.createdDate || '').getTime());
    }

    getTabCount(tab: string): number {
        if (tab === 'All') return this.myTasks.length;
        
        const originalTab = this.selectedTab;
        this.selectedTab = tab;
        const count = this.getFilteredTasks().length;
        this.selectedTab = originalTab;
        return count;
    }

    toggleExpandedTask(taskId: string) {
        this.expandedTaskId = this.expandedTaskId === taskId ? null : taskId;
    }

    getWorkerForTask(task: Task): any {
        return this.appService.users.find((u: any) => u.id === task.workerId);
    }

    formatStatus(status: string): string {
        return status.replace(/_/g, ' ');
    }

    formatDate(date: string): string {
        return new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    }

    private toastService = inject(ToastService);

    approveTask(task: Task) {
        this.appService.updateTaskStatus(task.id, TaskStatus.VERIFIED);
        this.toastService.success('Work approved! Payment processing...');
    }

    leaveReview(task: Task) {
        const rating = prompt('Rate the worker (1-5):', '5');
        const reviewText = prompt('Share your feedback:');
        
        if (rating && reviewText) {
            this.appService.submitReview(task.id, {
                rating: parseInt(rating),
                text: reviewText,
                customerId: this.appService.currentUser?.id
            });
        }
    }

    hasReviewed(task: Task): boolean {
        return (task.reviews || []).some((r: any) => r.customerId === this.appService.currentUser?.id);
    }
}
