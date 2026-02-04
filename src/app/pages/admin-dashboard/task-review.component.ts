import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AppService } from '../../app.service';
import { ConfirmDialogService } from '../../services/confirm-dialog.service';
import { ToastService } from '../../services/toast.service';
import { Task, TaskStatus } from '../../types';
import { LucideAngularModule } from 'lucide-angular';

@Component({
    selector: 'app-task-review',
    standalone: true,
    imports: [CommonModule, FormsModule, LucideAngularModule],
    template: `
        <div class="p-6 bg-gray-50 min-h-screen">
            <div class="max-w-6xl mx-auto">
                <!-- Header -->
                <h1 class="text-3xl font-bold text-gray-900 mb-8">Task Review Queue</h1>

                <!-- Pending Tasks -->
                <div *ngIf="pendingTasks.length === 0" class="bg-white rounded-lg shadow-md p-8 text-center">
                    <p class="text-gray-600 text-lg">No tasks pending review</p>
                </div>

                <div *ngFor="let task of pendingTasks" class="bg-white rounded-lg shadow-md p-6 mb-6">
                    <div class="grid grid-cols-3 gap-6">
                        <!-- Task Details -->
                        <div class="col-span-2">
                            <div class="mb-4">
                                <h2 class="text-2xl font-bold text-gray-900">{{ task.title }}</h2>
                                <p class="text-gray-600 text-sm">ID: {{ task.id }}</p>
                            </div>

                            <div class="space-y-3">
                                <div>
                                    <p class="text-sm text-gray-600">Description</p>
                                    <p class="text-gray-900">{{ task.description }}</p>
                                </div>

                                <div class="grid grid-cols-2 gap-4">
                                    <div>
                                        <p class="text-sm text-gray-600">Category</p>
                                        <p class="text-gray-900 font-semibold">{{ task.category }}</p>
                                    </div>
                                    <div>
                                        <p class="text-sm text-gray-600">Location</p>
                                        <p class="text-gray-900 font-semibold">{{ task.location.area }}, {{ task.location.city }}</p>
                                    </div>
                                    <div>
                                        <p class="text-sm text-gray-600">Budget</p>
                                        <p class="text-gray-900 font-semibold">₹{{ task.budgetMin }} - ₹{{ task.budgetMax }}</p>
                                    </div>
                                    <div>
                                        <p class="text-sm text-gray-600">Preferred Date</p>
                                        <p class="text-gray-900 font-semibold">{{ task.preferredDate }}</p>
                                    </div>
                                </div>

                                <div *ngIf="task.photos && task.photos.length > 0">
                                    <p class="text-sm text-gray-600 mb-2">Photos</p>
                                    <div class="flex gap-2">
                                        <img *ngFor="let photo of task.photos" [src]="photo" alt="Task photo" class="w-16 h-16 rounded object-cover">
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Review Section -->
                        <div class="border-l pl-6">
                            <h3 class="font-semibold text-lg mb-4">Admin Review</h3>

                            <div class="space-y-3">
                                <textarea [(ngModel)]="reviewNotes[task.id]" placeholder="Review notes..." 
                                         class="w-full border rounded px-3 py-2 text-sm" rows="4"></textarea>

                                <div class="flex flex-col gap-2">
                                    <button (click)="approveTask(task)" class="flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                                        <i data-lucide="check" class="w-5 h-5"></i>
                                        Approve
                                    </button>
                                    <button (click)="rejectTask(task)" class="flex items-center justify-center gap-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">
                                        <i data-lucide="x" class="w-5 h-5"></i>
                                        Reject
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Previously Reviewed -->
                <div class="mt-12">
                    <h2 class="text-2xl font-bold text-gray-900 mb-6">Previously Reviewed</h2>
                    <div class="bg-white rounded-lg shadow-md overflow-hidden">
                        <table class="w-full">
                            <thead class="bg-gray-100 border-b">
                                <tr>
                                    <th class="text-left px-6 py-3 font-semibold">Task</th>
                                    <th class="text-left px-6 py-3 font-semibold">Status</th>
                                    <th class="text-left px-6 py-3 font-semibold">Admin Notes</th>
                                    <th class="text-left px-6 py-3 font-semibold">Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr *ngFor="let task of reviewedTasks" class="border-b hover:bg-gray-50">
                                    <td class="px-6 py-3 font-medium">{{ task.title }}</td>
                                    <td class="px-6 py-3">
                                        <span [class]="getStatusBadge(task.status)">{{ task.status }}</span>
                                    </td>
                                    <td class="px-6 py-3 text-gray-600">{{ task.adminReviewNotes }}</td>
                                    <td class="px-6 py-3 text-gray-600">{{ task.createdDate | date: 'short' }}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    `,
    styles: [`
        :host ::ng-deep {
            i[data-lucide] {
                display: inline-block;
            }
        }
    `]
})
export class TaskReviewComponent implements OnInit {
    pendingTasks: Task[] = [];
    reviewedTasks: Task[] = [];
    reviewNotes: { [key: string]: string } = {};

    constructor(private appService: AppService) {}

    ngOnInit() {
        this.appService.tasks$.subscribe(tasks => {
            this.pendingTasks = tasks.filter(t => t.status === TaskStatus.POSTED);
            this.reviewedTasks = tasks.filter(t => 
                t.status !== TaskStatus.POSTED
            ).sort((a, b) => new Date(b.createdDate || '').getTime() - new Date(a.createdDate || '').getTime());
        });
    }

    approveTask(task: Task) {
        const notes = this.reviewNotes[task.id] || 'Approved by admin';
        this.appService.approveTaskForBidding(task.id, notes);
        delete this.reviewNotes[task.id];
    }

    private confirmService = inject(ConfirmDialogService);
    private toastService = inject(ToastService);

    async rejectTask(task: Task) {
        const reason = this.reviewNotes[task.id] || 'Rejected by admin';
        const confirmed = await this.confirmService.show(
            'Are you sure you want to reject this task? The customer will be notified.',
            { title: 'Reject Task', type: 'danger', confirmText: 'Reject' }
        );
        if (confirmed) {
            this.appService.rejectTask(task.id, reason);
            delete this.reviewNotes[task.id];
            this.toastService.info('Task rejected and customer notified');
        }
    }

    getStatusBadge(status: TaskStatus): string {
        const baseClass = 'px-3 py-1 rounded-full text-sm font-semibold';
        switch (status) {
            case TaskStatus.POSTED:
                return `${baseClass} bg-yellow-100 text-yellow-800`;
            case TaskStatus.BIDDING:
                return `${baseClass} bg-blue-100 text-blue-800`;
            case TaskStatus.ASSIGNED:
                return `${baseClass} bg-indigo-100 text-indigo-800`;
            case TaskStatus.CONFIRMED:
                return `${baseClass} bg-cyan-100 text-cyan-800`;
            case TaskStatus.TRAVELING:
            case TaskStatus.ARRIVED:
                return `${baseClass} bg-orange-100 text-orange-800`;
            case TaskStatus.IN_PROGRESS:
            case TaskStatus.WORK_COMPLETED:
                return `${baseClass} bg-emerald-100 text-emerald-800`;
            case TaskStatus.VERIFIED:
            case TaskStatus.PAID:
                return `${baseClass} bg-green-100 text-green-800`;
            case TaskStatus.COMPLETED:
                return `${baseClass} bg-slate-100 text-slate-800`;
            case TaskStatus.CANCELLED:
                return `${baseClass} bg-red-100 text-red-800`;
            case TaskStatus.DISPUTED:
                return `${baseClass} bg-purple-100 text-purple-800`;
            default:
                return baseClass;
        }
    }
}
