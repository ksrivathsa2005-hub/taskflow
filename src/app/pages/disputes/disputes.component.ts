import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AppService } from '../../app.service';
import { Dispute, DisputeStatus, UserRole } from '../../types';
import { LucideAngularModule } from 'lucide-angular';

@Component({
    selector: 'app-disputes',
    standalone: true,
    imports: [CommonModule, FormsModule, LucideAngularModule],
    template: `
        <div class="p-6 bg-gray-50 min-h-screen">
            <div class="max-w-6xl mx-auto">
                <!-- Header with Create Button -->
                <div class="flex justify-between items-center mb-8">
                    <h1 class="text-3xl font-bold text-gray-900">Disputes</h1>
                    <button *ngIf="currentUserRole !== 'ADMIN'" (click)="showCreateDisputeModal = true" 
                        class="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700">
                        <i data-lucide="alert-circle" class="w-5 h-5"></i>
                        Raise Dispute
                    </button>
                </div>

                <!-- No Disputes -->
                <div *ngIf="disputes.length === 0" class="bg-white rounded-lg shadow-md p-12 text-center">
                    <i data-lucide="check-circle" class="w-12 h-12 text-green-500 mx-auto mb-4"></i>
                    <p class="text-gray-600 text-lg">No disputes. All good!</p>
                </div>

                <!-- Disputes List -->
                <div *ngIf="disputes.length > 0" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <!-- Disputes Sidebar -->
                    <div class="lg:col-span-1">
                        <div class="bg-white rounded-lg shadow-md overflow-hidden">
                            <div *ngFor="let dispute of disputes; let i = index"
                                (click)="selectDispute(dispute)"
                                class="p-4 border-b cursor-pointer transition-colors hover:bg-blue-50"
                                [class.bg-blue-100]="selectedDispute?.id === dispute.id">
                                <div class="flex items-start justify-between">
                                    <div class="flex-1">
                                        <h3 class="font-semibold text-gray-900">Dispute {{i + 1}}</h3>
                                        <p class="text-xs text-gray-500 mt-1">{{dispute.taskId}}</p>
                                    </div>
                                    <span [class]="getStatusBadge(dispute.status)" class="px-2 py-1 rounded text-xs font-semibold">
                                        {{dispute.status}}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Dispute Details and Chat -->
                    <div *ngIf="selectedDispute" class="lg:col-span-2">
                        <div class="bg-white rounded-lg shadow-md overflow-hidden flex flex-col h-[600px]">
                            <!-- Header -->
                            <div class="border-b p-4 bg-gradient-to-r from-blue-50 to-indigo-50">
                                <div class="flex justify-between items-start mb-3">
                                    <div>
                                        <h2 class="text-xl font-bold text-gray-900">Dispute Details</h2>
                                        <p class="text-sm text-gray-600 mt-1">Task: {{selectedDispute.taskId}}</p>
                                    </div>
                                    <span [class]="getStatusBadge(selectedDispute.status)" class="px-3 py-1 rounded-full text-sm font-semibold">
                                        {{selectedDispute.status}}
                                    </span>
                                </div>
                                <p class="text-sm text-gray-700 bg-white rounded p-3 mt-2">
                                    <span class="font-semibold">Issue:</span> {{selectedDispute.reason}}
                                </p>
                            </div>

                            <!-- Messages -->
                            <div class="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                                <div *ngFor="let message of selectedDispute.messages"
                                    class="flex"
                                    [class.justify-end]="message.senderId === currentUserId"
                                    [class.justify-start]="message.senderId !== currentUserId">
                                    <div [class]="'max-w-xs px-4 py-2 rounded-lg'"
                                        [class.bg-blue-500]="message.senderId === currentUserId"
                                        [class.text-white]="message.senderId === currentUserId"
                                        [class.bg-white]="message.senderId !== currentUserId"
                                        [class.text-gray-900]="message.senderId !== currentUserId"
                                        [class.border]="message.senderId !== currentUserId"
                                        [class.border-gray-200]="message.senderId !== currentUserId">
                                        <p class="text-xs font-semibold mb-1 opacity-75">{{message.senderName}}</p>
                                        <p>{{message.message}}</p>
                                        <p class="text-xs mt-1 opacity-60">{{message.timestamp | date: 'short'}}</p>
                                    </div>
                                </div>
                            </div>

                            <!-- Input Area -->
                            <div class="border-t p-4 bg-white">
                                <div *ngIf="selectedDispute.status !== DisputeStatus.RESOLVED" class="space-y-3">
                                    <textarea [(ngModel)]="newMessage" placeholder="Type your message..."
                                        class="w-full border rounded-lg px-3 py-2 resize-none focus:ring-2 focus:ring-blue-500 outline-none"
                                        rows="2"></textarea>
                                    <div class="flex gap-2">
                                        <button (click)="sendMessage()" [disabled]="!newMessage.trim()"
                                            class="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-300">
                                            <i data-lucide="send" class="w-4 h-4"></i>
                                            Send
                                        </button>
                                        <button *ngIf="currentUserRole === 'ADMIN'" (click)="openResolveForm()"
                                            class="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
                                            Resolve
                                        </button>
                                    </div>
                                </div>
                                <div *ngIf="selectedDispute.status === DisputeStatus.RESOLVED" class="text-center py-4">
                                    <div class="flex items-center justify-center gap-2 text-green-600">
                                        <i data-lucide="check-circle" class="w-5 h-5"></i>
                                        <span class="font-semibold">Dispute Resolved</span>
                                    </div>
                                    <p class="text-xs text-gray-600 mt-2">Admin Notes: {{selectedDispute.adminNotes}}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Create Dispute Modal -->
            <div *ngIf="showCreateDisputeModal" class="fixed inset-0 z-[80] flex items-center justify-center px-4 bg-slate-900/60 backdrop-blur-sm">
                <div class="bg-white rounded-lg w-full max-w-md shadow-2xl overflow-y-auto max-h-[90vh]">
                    <div class="px-6 py-4 border-b flex justify-between items-center sticky top-0 bg-white">
                        <h3 class="text-lg font-bold">Raise a Dispute</h3>
                        <button (click)="showCreateDisputeModal = false" class="text-gray-500 hover:text-gray-700">
                            <i data-lucide="x" class="w-5 h-5"></i>
                        </button>
                    </div>
                    <div class="p-6 space-y-4">
                        <!-- Admin Availability Message -->
                        <div class="bg-blue-50 border border-blue-200 rounded-lg p-3">
                            <p class="text-sm text-blue-900"><strong>Admin Support:</strong> Admins are currently busy. Average response time: 5 minutes during business hours</p>
                        </div>

                        <!-- Task Selection -->
                        <div>
                            <label class="block text-sm font-semibold text-gray-700 mb-2">Select Task *</label>
                            <select [(ngModel)]="newDisputeForm.taskId" 
                                class="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 outline-none">
                                <option value="">-- Choose a task --</option>
                                <option *ngFor="let task of availableTasks" [value]="task.id">
                                    {{task.title}} (ID: {{task.id}})
                                </option>
                            </select>
                            <p *ngIf="availableTasks.length === 0" class="text-sm text-gray-500 mt-2">No eligible tasks to raise disputes</p>
                        </div>

                        <!-- Issue Type -->
                        <div>
                            <label class="block text-sm font-semibold text-gray-700 mb-2">Issue Type *</label>
                            <select [(ngModel)]="newDisputeForm.issueType" 
                                class="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 outline-none">
                                <option value="">-- Select issue type --</option>
                                <ng-container *ngIf="currentUserRole === 'CUSTOMER'">
                                    <option value="poor-quality">Poor Quality of Work</option>
                                    <option value="incomplete-work">Incomplete Work</option>
                                    <option value="unprofessional-behavior">Unprofessional Behavior</option>
                                    <option value="payment-issue">Payment Issue</option>
                                </ng-container>
                                <ng-container *ngIf="currentUserRole === 'WORKER'">
                                    <option value="payment-not-released">Payment Not Released</option>
                                    <option value="unfair-rating">Unfair Rating</option>
                                    <option value="customer-behavior">Customer Behavior</option>
                                    <option value="payment-dispute">Payment Dispute</option>
                                </ng-container>
                            </select>
                        </div>

                        <!-- Description -->
                        <div>
                            <label class="block text-sm font-semibold text-gray-700 mb-2">Description of Problem *</label>
                            <textarea [(ngModel)]="newDisputeForm.reason" placeholder="Describe the issue in detail..."
                                class="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 outline-none"
                                rows="4"></textarea>
                        </div>

                        <!-- Evidence Upload -->
                        <div>
                            <label class="block text-sm font-semibold text-gray-700 mb-2">Upload Evidence (Optional)</label>
                            <p class="text-xs text-gray-500 mb-2">Photos, screenshots, or documents supporting your claim</p>
                            <input type="file" multiple accept="image/*,.pdf" 
                                (change)="onEvidenceSelected($event)"
                                class="w-full border rounded-lg px-3 py-2 text-sm">
                            <div *ngIf="newDisputeForm.evidence && newDisputeForm.evidence.length > 0" class="mt-2">
                                <p class="text-xs font-semibold text-gray-600 mb-1">Evidence files: {{newDisputeForm.evidence.length}}</p>
                                <div class="flex flex-wrap gap-1">
                                    <span *ngFor="let file of newDisputeForm.evidence" class="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                                        {{file}}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <!-- Submit Button -->
                        <div class="flex gap-2">
                            <button (click)="createDispute()" [disabled]="!newDisputeForm.taskId || !newDisputeForm.issueType || !newDisputeForm.reason"
                                class="flex-1 bg-red-600 text-white font-bold py-2 rounded-lg hover:bg-red-700 disabled:bg-gray-300">
                                Submit Dispute
                            </button>
                            <button (click)="showCreateDisputeModal = false" class="flex-1 bg-gray-300 text-gray-700 font-bold py-2 rounded-lg hover:bg-gray-400">
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Resolve Modal -->
            <div *ngIf="showResolveModal && selectedDispute" class="fixed inset-0 z-[70] flex items-center justify-center px-4 bg-slate-900/60 backdrop-blur-sm">
                <div class="bg-white rounded-lg w-full max-w-md shadow-2xl">
                    <div class="px-6 py-4 border-b flex justify-between items-center">
                        <h3 class="text-lg font-bold">Resolve Dispute</h3>
                        <button (click)="showResolveModal = false" class="text-gray-500 hover:text-gray-700">
                            <i data-lucide="x" class="w-5 h-5"></i>
                        </button>
                    </div>
                    <div class="p-6 space-y-4">
                        <textarea [(ngModel)]="resolutionNotes" placeholder="Resolution notes..."
                            class="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 outline-none"
                            rows="4"></textarea>
                        <div class="flex gap-2">
                            <button (click)="confirmResolve()" class="flex-1 bg-green-600 text-white font-bold py-2 rounded-lg hover:bg-green-700">
                                Confirm
                            </button>
                            <button (click)="showResolveModal = false" class="flex-1 bg-gray-300 text-gray-700 font-bold py-2 rounded-lg hover:bg-gray-400">
                                Cancel
                            </button>
                        </div>
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
export class DisputesComponent implements OnInit {
    disputes: Dispute[] = [];
    selectedDispute: Dispute | null = null;
    newMessage = '';
    showResolveModal = false;
    showCreateDisputeModal = false;
    resolutionNotes = '';
    currentUserId: string = '';
    currentUserRole: UserRole = UserRole.CUSTOMER;
    availableTasks: any[] = [];

    newDisputeForm = {
        taskId: '',
        reason: '',
        issueType: '',
        evidence: [] as string[]
    };

    readonly DisputeStatus = DisputeStatus;

    constructor(private appService: AppService) {}

    ngOnInit() {
        this.appService.currentUser$.subscribe(user => {
            if (user) {
                this.currentUserId = user.id;
                this.currentUserRole = user.role;
                this.loadAvailableTasks();
            }
        });

        this.appService.disputes$.subscribe(disputes => {
            this.disputes = disputes.filter(d => 
                d.initiatorId === this.currentUserId || 
                d.respondentId === this.currentUserId ||
                this.currentUserRole === UserRole.ADMIN
            );
            if (this.disputes.length > 0 && !this.selectedDispute) {
                this.selectDispute(this.disputes[0]);
            }
        });
    }

    loadAvailableTasks() {
        // Get tasks based on user role
        if (this.currentUserRole === UserRole.CUSTOMER) {
            // Customers can see their posted tasks
            this.availableTasks = this.appService.tasks.filter(t => 
                t.customerId === this.currentUserId && (t.status === 'IN_PROGRESS' || t.status === 'COMPLETED')
            );
        } else if (this.currentUserRole === UserRole.WORKER) {
            // Workers can see their assigned tasks
            this.availableTasks = this.appService.tasks.filter(t => 
                t.workerId === this.currentUserId && (t.status === 'IN_PROGRESS' || t.status === 'COMPLETED')
            );
        }
    }

    selectDispute(dispute: Dispute) {
        this.selectedDispute = dispute;
        this.newMessage = '';
    }

    onEvidenceSelected(event: any) {
        const files = event.target.files;
        if (files && files.length > 0) {
            const fileList: string[] = [];
            for (let i = 0; i < files.length; i++) {
                fileList.push(files[i].name);
            }
            this.newDisputeForm.evidence = fileList;
        }
    }

    private toastService = inject(ToastService);

    createDispute() {
        if (!this.newDisputeForm.taskId || !this.newDisputeForm.issueType || !this.newDisputeForm.reason) {
            this.toastService.error('Please fill in all required fields');
            return;
        }

        const task = this.appService.tasks.find(t => t.id === this.newDisputeForm.taskId);
        if (!task) {
            this.toastService.error('Task not found');
            return;
        }

        const disputeData = {
            taskId: this.newDisputeForm.taskId,
            initiatorId: this.currentUserId,
            respondentId: task.customerId === this.currentUserId ? task.workerId : task.customerId,
            reason: this.newDisputeForm.reason,
            issueType: this.newDisputeForm.issueType,
            evidence: this.newDisputeForm.evidence
        };

        this.appService.createDispute(disputeData);
        this.showCreateDisputeModal = false;
        this.newDisputeForm = { taskId: '', reason: '', issueType: '', evidence: [] };
    }

    sendMessage() {
        if (!this.selectedDispute || !this.newMessage.trim()) return;

        this.appService.addMessageToDispute(this.selectedDispute.id, {
            senderId: this.currentUserId,
            senderName: this.appService.currentUser?.name || 'Unknown',
            message: this.newMessage
        });

        this.newMessage = '';
    }

    openResolveForm() {
        this.showResolveModal = true;
    }

    confirmResolve() {
        if (this.selectedDispute) {
            this.appService.resolveDispute(this.selectedDispute.id, this.resolutionNotes);
            this.showResolveModal = false;
            this.resolutionNotes = '';
            this.selectedDispute = null;
        }
    }

    getStatusBadge(status: DisputeStatus): string {
        switch (status) {
            case DisputeStatus.PENDING:
                return 'bg-yellow-100 text-yellow-800';
            case DisputeStatus.IN_PROGRESS:
                return 'bg-blue-100 text-blue-800';
            case DisputeStatus.RESOLVED:
                return 'bg-green-100 text-green-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    }
}
