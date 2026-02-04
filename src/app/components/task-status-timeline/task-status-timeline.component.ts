import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Task, TaskStatus } from '../../types';
import {
    LucideAngularModule,
    CheckCircle2,
    Circle,
    AlertCircle,
    Clock
} from 'lucide-angular';

interface TimelineStep {
    status: TaskStatus;
    label: string;
    description: string;
    completed: boolean;
    current: boolean;
    timestamp?: string;
}

@Component({
    selector: 'app-task-status-timeline',
    standalone: true,
    imports: [CommonModule, LucideAngularModule],
    template: `
        <div class="w-full">
            <!-- Timeline Header -->
            <div class="mb-6">
                <h3 class="text-lg font-black text-slate-900">Task Progress Timeline</h3>
                <p class="text-sm text-slate-500 mt-1">{{ getStatusDescription(task.status) }}</p>
            </div>

            <!-- Progress Bar -->
            <div class="mb-8">
                <div class="flex items-center justify-between mb-2">
                    <span class="text-xs font-bold text-slate-700">{{ getCurrentProgress() }}% Complete</span>
                    <span class="text-xs text-slate-500">{{ task.progressUpdates.length }} updates</span>
                </div>
                <div class="h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div class="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 transition-all duration-500"
                        [style.width.%]="getCurrentProgress()"></div>
                </div>
            </div>

            <!-- Booking History (Progress Updates) -->
            <div *ngIf="task.progressUpdates.length > 0" class="mb-8">
                <h4 class="text-sm font-black text-slate-700 mb-4">Booking History</h4>
                <div class="space-y-3">
                    <div *ngFor="let update of getReversedUpdates()" 
                        class="flex gap-4 p-4 bg-white border border-slate-200 rounded-xl hover:shadow-md transition-shadow">
                        <!-- Time -->
                        <div class="flex-shrink-0 text-right">
                            <div class="text-sm font-bold text-slate-900">{{ formatTime(update.timestamp) }}</div>
                            <div class="text-xs text-slate-500">{{ formatDateShort(update.timestamp) }}</div>
                        </div>
                        <!-- Status Dot -->
                        <div class="flex-shrink-0 pt-1">
                            <div class="w-2 h-2 rounded-full" 
                                [ngClass]="getStatusColor(update.status)"></div>
                        </div>
                        <!-- Content -->
                        <div class="flex-grow">
                            <h5 class="text-sm font-bold text-slate-900">{{ update.title }}</h5>
                            <p class="text-xs text-slate-600 mt-0.5">{{ update.description }}</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Timeline Steps -->
            <div class="relative">
                <h4 class="text-sm font-black text-slate-700 mb-4">Workflow Steps</h4>
                
                <!-- Connecting Line -->
                <div *ngIf="getTimelineSteps().length > 1" class="absolute top-12 left-5 h-[calc(100%-5rem)] w-1 bg-slate-200"></div>

                <!-- Steps -->
                <div class="space-y-6">
                    <div *ngFor="let step of getTimelineSteps(); let i = index; let last = last"
                        class="relative">
                        <!-- Step Circle and Label -->
                        <div class="flex items-start gap-4">
                            <!-- Circle Icon -->
                            <div class="flex-shrink-0 relative z-10">
                                <div *ngIf="step.completed" 
                                    class="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg">
                                    <lucide-icon [img]="CheckCircle2" class="w-6 h-6 text-white"></lucide-icon>
                                </div>
                                <div *ngIf="step.current && !step.completed"
                                    class="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center shadow-lg animate-pulse">
                                    <lucide-icon [img]="Clock" class="w-6 h-6 text-white"></lucide-icon>
                                </div>
                                <div *ngIf="!step.completed && !step.current"
                                    class="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center">
                                    <lucide-icon [img]="Circle" class="w-5 h-5 text-slate-400"></lucide-icon>
                                </div>
                            </div>

                            <!-- Step Content -->
                            <div class="flex-grow pt-1">
                                <div class="flex items-center gap-2 mb-1">
                                    <h4 class="font-bold text-slate-900">{{ step.label }}</h4>
                                    <span *ngIf="step.completed" class="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full font-semibold">
                                        ✓ Completed
                                    </span>
                                    <span *ngIf="step.current" class="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full font-semibold">
                                        ● Current
                                    </span>
                                </div>
                                <p class="text-sm text-slate-600 font-medium">{{ step.description }}</p>
                                <p *ngIf="step.timestamp" class="text-xs text-slate-400 mt-1">{{ formatFullDate(step.timestamp) }}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Status Details Card -->
            <div class="mt-8 p-4 bg-gradient-to-r from-slate-50 to-indigo-50 rounded-xl border border-slate-200">
                <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                        <p class="text-xs text-slate-500 font-semibold uppercase tracking-wide">Current Status</p>
                        <p class="text-sm font-bold text-slate-900 mt-1">{{ formatStatus(task.status) }}</p>
                    </div>
                    <div>
                        <p class="text-xs text-slate-500 font-semibold uppercase tracking-wide">Progress</p>
                        <p class="text-sm font-bold text-indigo-600 mt-1">{{ getCurrentProgress() }}%</p>
                    </div>
                    <div>
                        <p class="text-xs text-slate-500 font-semibold uppercase tracking-wide">Last Updated</p>
                        <p class="text-sm font-bold text-slate-900 mt-1">{{ getLastUpdateTime() }}</p>
                    </div>
                </div>
            </div>
        </div>
    `,
    styles: []
})
export class TaskStatusTimelineComponent {
    @Input() task!: Task;

    readonly CheckCircle2 = CheckCircle2;
    readonly Circle = Circle;
    readonly AlertCircle = AlertCircle;
    readonly Clock = Clock;

    // Workflow sequence
    private readonly WORKFLOW_SEQUENCE: TaskStatus[] = [
        TaskStatus.POSTED,
        TaskStatus.BIDDING,
        TaskStatus.ASSIGNED,
        TaskStatus.CONFIRMED,
        TaskStatus.TRAVELING,
        TaskStatus.ARRIVED,
        TaskStatus.IN_PROGRESS,
        TaskStatus.WORK_COMPLETED,
        TaskStatus.VERIFIED,
        TaskStatus.PAID,
        TaskStatus.COMPLETED
    ];

    private readonly STATUS_LABELS: Record<TaskStatus, string> = {
        [TaskStatus.POSTED]: 'Task Posted',
        [TaskStatus.BIDDING]: 'Open for Bidding',
        [TaskStatus.ASSIGNED]: 'Worker Assigned',
        [TaskStatus.CONFIRMED]: 'Confirmed',
        [TaskStatus.TRAVELING]: 'Worker Traveling',
        [TaskStatus.ARRIVED]: 'Worker Arrived',
        [TaskStatus.IN_PROGRESS]: 'Work in Progress',
        [TaskStatus.WORK_COMPLETED]: 'Work Completed',
        [TaskStatus.VERIFIED]: 'Verified by Customer',
        [TaskStatus.PAID]: 'Payment Completed',
        [TaskStatus.COMPLETED]: 'Task Completed',
        [TaskStatus.CANCELLED]: 'Task Cancelled',
        [TaskStatus.DISPUTED]: 'Under Dispute'
    };

    private readonly STATUS_DESCRIPTIONS: Record<TaskStatus, string> = {
        [TaskStatus.POSTED]: 'Your task has been posted to the platform',
        [TaskStatus.BIDDING]: 'Workers are submitting their bids',
        [TaskStatus.ASSIGNED]: 'You have selected a worker',
        [TaskStatus.CONFIRMED]: 'Worker has confirmed the booking',
        [TaskStatus.TRAVELING]: 'Worker is on the way to your location',
        [TaskStatus.ARRIVED]: 'Worker has arrived at your location',
        [TaskStatus.IN_PROGRESS]: 'Work is currently in progress',
        [TaskStatus.WORK_COMPLETED]: 'Worker has completed the work',
        [TaskStatus.VERIFIED]: 'You have verified the completed work',
        [TaskStatus.PAID]: 'Payment has been processed',
        [TaskStatus.COMPLETED]: 'Task has been completed successfully',
        [TaskStatus.CANCELLED]: 'This task has been cancelled',
        [TaskStatus.DISPUTED]: 'A dispute has been raised on this task'
    };

    getTimelineSteps(): TimelineStep[] {
        const steps: TimelineStep[] = [];
        const currentIndex = this.WORKFLOW_SEQUENCE.indexOf(this.task.status);

        // Only show main workflow steps, exclude disputed/cancelled if in main flow
        const visibleSteps = this.WORKFLOW_SEQUENCE.slice(0, -2); // Exclude CANCELLED and DISPUTED

        for (let i = 0; i < visibleSteps.length; i++) {
            const status = visibleSteps[i];
            const isCompleted = i < currentIndex;
            const isCurrent = i === currentIndex;

            // Find timestamp from progressUpdates
            const progressUpdate = this.task.progressUpdates.find(u => u.status === status);

            steps.push({
                status,
                label: this.STATUS_LABELS[status],
                description: this.getStepDescription(status),
                completed: isCompleted,
                current: isCurrent,
                timestamp: progressUpdate?.timestamp
            });
        }

        return steps;
    }

    getReversedUpdates() {
        return [...this.task.progressUpdates].reverse();
    }

    getStatusColor(status: TaskStatus): string {
        const colors: Record<TaskStatus, string> = {
            [TaskStatus.POSTED]: 'bg-yellow-500',
            [TaskStatus.BIDDING]: 'bg-indigo-500',
            [TaskStatus.ASSIGNED]: 'bg-amber-500',
            [TaskStatus.CONFIRMED]: 'bg-cyan-500',
            [TaskStatus.TRAVELING]: 'bg-orange-500',
            [TaskStatus.ARRIVED]: 'bg-orange-600',
            [TaskStatus.IN_PROGRESS]: 'bg-emerald-500',
            [TaskStatus.WORK_COMPLETED]: 'bg-green-500',
            [TaskStatus.VERIFIED]: 'bg-green-600',
            [TaskStatus.PAID]: 'bg-slate-500',
            [TaskStatus.COMPLETED]: 'bg-slate-600',
            [TaskStatus.CANCELLED]: 'bg-red-500',
            [TaskStatus.DISPUTED]: 'bg-purple-500'
        };
        return colors[status] || 'bg-slate-400';
    }

    formatTime(timestamp: string): string {
        const date = new Date(timestamp);
        return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
    }

    formatDateShort(timestamp: string): string {
        const date = new Date(timestamp);
        return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
    }

    formatFullDate(timestamp: string): string {
        const date = new Date(timestamp);
        return date.toLocaleString('en-IN', {
            day: 'numeric',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    getLastUpdateTime(): string {
        if (this.task.progressUpdates.length === 0) {
            return this.formatDate(this.task.createdDate);
        }
        const lastUpdate = this.task.progressUpdates[this.task.progressUpdates.length - 1];
        return this.formatFullDate(lastUpdate.timestamp);
    }

    private getStepDescription(status: TaskStatus): string {
        const descriptions: Record<TaskStatus, string> = {
            [TaskStatus.POSTED]: 'Waiting for workers to submit bids',
            [TaskStatus.BIDDING]: 'Reviewing worker proposals',
            [TaskStatus.ASSIGNED]: 'Worker confirmed and ready to start',
            [TaskStatus.CONFIRMED]: 'Both parties have agreed to proceed',
            [TaskStatus.TRAVELING]: 'Estimated 15-30 minutes arrival',
            [TaskStatus.ARRIVED]: 'Ready to begin work',
            [TaskStatus.IN_PROGRESS]: 'Work is underway',
            [TaskStatus.WORK_COMPLETED]: 'Awaiting your approval',
            [TaskStatus.VERIFIED]: 'Work accepted, processing payment',
            [TaskStatus.PAID]: 'Payment confirmed to worker',
            [TaskStatus.COMPLETED]: 'All done! Leave a review.',
            [TaskStatus.CANCELLED]: 'Task was cancelled',
            [TaskStatus.DISPUTED]: 'Dispute is being resolved'
        };
        return descriptions[status] || '';
    }

    getStatusDescription(status: TaskStatus): string {
        return this.STATUS_DESCRIPTIONS[status] || 'Unknown status';
    }

    formatStatus(status: string): string {
        return status.replace(/_/g, ' ');
    }

    formatDate(date?: string): string {
        if (!date) return 'N/A';
        return new Date(date).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    getCurrentProgress(): number {
        const currentIndex = this.WORKFLOW_SEQUENCE.indexOf(this.task.status);
        if (currentIndex === -1) return 0;
        const progress = Math.round(((currentIndex + 1) / this.WORKFLOW_SEQUENCE.length) * 100);
        return Math.min(progress, 100);
    }
}
