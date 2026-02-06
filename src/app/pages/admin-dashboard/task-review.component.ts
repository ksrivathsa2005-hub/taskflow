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
