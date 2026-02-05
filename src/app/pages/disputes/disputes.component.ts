import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AppService } from '../../app.service';
import { Dispute, DisputeStatus, UserRole, TaskStatus } from '../../types';
import { LucideAngularModule } from 'lucide-angular';
import { ToastService } from '../../services/toast.service';

@Component({
    selector: 'app-disputes',
    standalone: true,
    imports: [CommonModule, FormsModule, LucideAngularModule],
    template: `
        <div class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 p-4 sm:p-6 lg:p-8">
            <div class="max-w-7xl mx-auto">
                <!-- Header with Create Button -->
                <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
                    <div>
                        <h1 class="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">Disputes</h1>
                        <p class="text-slate-600 text-sm mt-1">Manage and resolve service disputes</p>
                    </div>
                    <button *ngIf="currentUserRole !== 'ADMIN'" (click)="showCreateDisputeModal = true" 
                        class="flex items-center justify-center gap-2 bg-gradient-to-r from-red-600 to-rose-600 text-white px-5 py-2.5 rounded-xl font-semibold shadow-lg shadow-red-500/30 hover:shadow-xl hover:shadow-red-500/40 hover:scale-105 transition-all duration-200">
                        <i data-lucide="alert-circle" class="w-5 h-5"></i>
                        Raise Dispute
                    </button>
                </div>

                <!-- No Disputes -->
                <div *ngIf="disputes.length === 0" class="bg-white rounded-2xl shadow-sm border border-slate-100 p-12 text-center">
                    <div class="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <i data-lucide="check-circle" class="w-10 h-10 text-green-600"></i>
                    </div>
                    <h3 class="text-xl font-bold text-slate-900 mb-2">All Clear!</h3>
                    <p class="text-slate-600">No active disputes at the moment</p>
                </div>

                <!-- Disputes List -->
                <div *ngIf="disputes.length > 0" class="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    <!-- Disputes Sidebar -->
                    <div class="lg:col-span-4 xl:col-span-3">
                        <div class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden sticky top-6">
                            <div class="p-4 border-b border-slate-100 bg-slate-50">
                                <h3 class="text-sm font-bold text-slate-900 uppercase tracking-wider">All Disputes</h3>
                                <p class="text-xs text-slate-500 mt-0.5">{{disputes.length}} total</p>
                            </div>
                            <div class="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
                                <div *ngFor="let dispute of disputes; let i = index"
                                    (click)="selectDispute(dispute)"
                                    class="p-4 cursor-pointer transition-all duration-200 hover:bg-slate-50 group"
                                    [class.bg-blue-50]="selectedDispute?.id === dispute.id"
                                    [class.border-l-4]="selectedDispute?.id === dispute.id"
                                    [class.border-l-blue-600]="selectedDispute?.id === dispute.id">
                                    <div class="flex items-start justify-between gap-3">
                                        <div class="flex-1 min-w-0">
                                            <div class="flex items-center gap-2 mb-1.5">
                                                <div class="w-8 h-8 bg-gradient-to-br from-slate-200 to-slate-300 rounded-full flex items-center justify-center flex-shrink-0">
                                                    <span class="text-xs font-bold text-slate-700">#{{i + 1}}</span>
                                                </div>
                                                <h4 class="font-semibold text-slate-900 text-sm truncate">Dispute #{{i + 1}}</h4>
                                            </div>
                                            <p class="text-xs text-slate-500 truncate pl-10">Task: {{dispute.taskId}}</p>
                                            <p class="text-xs text-slate-400 mt-1 pl-10">{{dispute.messages.length || 0}} messages</p>
                                        </div>
                                        <span [class]="getStatusBadge(dispute.status)" class="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide whitespace-nowrap flex-shrink-0">
                                            {{dispute.status}}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Dispute Details and Chat -->
                    <div class="lg:col-span-8 xl:col-span-9">
                        <div *ngIf="selectedDispute" class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col h-[700px]">
                            <!-- Header -->
                            <div class="border-b border-slate-100 p-6 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50">
                                <div class="flex justify-between items-start gap-4 mb-4">
                                    <div class="flex-1">
                                        <h2 class="text-2xl font-black text-slate-900 mb-1">Dispute Details</h2>
                                        <p class="text-sm text-slate-600">Task ID: <span class="font-mono font-semibold">{{selectedDispute.taskId}}</span></p>
                                    </div>
                                    <span [class]="getStatusBadge(selectedDispute.status)" class="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider shadow-sm">
                                        {{selectedDispute.status}}
                                    </span>
                                </div>
                                <div class="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-white/50 shadow-sm">
                                    <p class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Issue Reported</p>
                                    <p class="text-sm text-slate-800 leading-relaxed">{{selectedDispute.reason}}</p>
                                </div>
                            </div>

                            <!-- Messages -->
                            <div class="flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-br from-slate-50 to-white">
                                <div *ngFor="let message of selectedDispute.messages"
                                    class="flex items-end gap-2"
                                    [class.flex-row-reverse]="message.senderId === currentUserId">
                                    <!-- Avatar -->
                                    <div class="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold"
                                        [class.bg-blue-600]="message.senderId === currentUserId"
                                        [class.text-white]="message.senderId === currentUserId"
                                        [class.bg-slate-300]="message.senderId !== currentUserId"
                                        [class.text-slate-700]="message.senderId !== currentUserId">
                                        {{message.senderName.charAt(0).toUpperCase()}}
                                    </div>
                                    <!-- Message Bubble -->
                                    <div class="flex flex-col max-w-md"
                                        [class.items-end]="message.senderId === currentUserId"
                                        [class.items-start]="message.senderId !== currentUserId">
                                        <div class="px-4 py-3 rounded-2xl shadow-sm"
                                            [class.bg-gradient-to-br]="message.senderId === currentUserId"
                                            [class.from-blue-600]="message.senderId === currentUserId"
                                            [class.to-blue-700]="message.senderId === currentUserId"
                                            [class.text-white]="message.senderId === currentUserId"
                                            [class.bg-white]="message.senderId !== currentUserId"
                                            [class.text-slate-900]="message.senderId !== currentUserId"
                                            [class.border]="message.senderId !== currentUserId"
                                            [class.border-slate-200]="message.senderId !== currentUserId">
                                            <p class="text-xs font-bold mb-1"
                                                [class.text-blue-100]="message.senderId === currentUserId"
                                                [class.text-slate-500]="message.senderId !== currentUserId">
                                                {{message.senderName}}
                                            </p>
                                            <p class="text-sm leading-relaxed">{{message.message}}</p>
                                        </div>
                                        <p class="text-[10px] text-slate-400 mt-1 px-1">{{message.timestamp | date: 'short'}}</p>
                                    </div>
                                </div>
                            </div>

                            <!-- Input Area -->
                            <div class="border-t border-slate-100 p-6 bg-white">
                                <div *ngIf="selectedDispute.status !== DisputeStatus.RESOLVED" class="space-y-3">
                                    <textarea [(ngModel)]="newMessage" 
                                        name="message"
                                        placeholder="Type your message..."
                                        minlength="2"
                                        maxlength="1000"
                                        #messageField="ngModel"
                                        class="w-full border border-slate-200 rounded-xl px-4 py-3 resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm"
                                        [class.border-red-500]="messageField.invalid && messageField.touched"
                                        rows="2"></textarea>
                                    <p *ngIf="messageField.invalid && messageField.touched" class="text-xs text-red-600">
                                        Message must be at least 2 characters
                                    </p>
                                    <div class="flex gap-2">
                                        <button (click)="sendMessage()" [disabled]="!newMessage.trim()"
                                            class="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-5 py-2.5 rounded-xl font-semibold shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all duration-200">
                                            <i data-lucide="send" class="w-4 h-4"></i>
                                            Send Message
                                        </button>
                                        <button *ngIf="currentUserRole === 'ADMIN'" (click)="openResolveForm()"
                                            class="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-5 py-2.5 rounded-xl font-semibold shadow-lg shadow-green-500/30 hover:shadow-xl hover:shadow-green-500/40 hover:scale-105 transition-all duration-200">
                                            Mark Resolved
                                        </button>
                                    </div>
                                </div>
                                <div *ngIf="selectedDispute.status === DisputeStatus.RESOLVED" class="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 text-center border border-green-200">
                                    <div class="flex items-center justify-center gap-2 text-green-700 mb-2">
                                        <i data-lucide="check-circle" class="w-6 h-6"></i>
                                        <span class="font-bold text-lg">Dispute Resolved</span>
                                    </div>
                                    <p class="text-sm text-green-600 bg-white/60 rounded-lg p-3 mt-3"><strong>Resolution:</strong> {{selectedDispute.adminNotes}}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Create Dispute Modal -->
            <div *ngIf="showCreateDisputeModal" class="fixed inset-0 z-[80] flex items-center justify-center px-4 bg-slate-900/70 backdrop-blur-md animate-in fade-in duration-200">
                <div class="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200">
                    <div class="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-gradient-to-r from-red-50 to-rose-50 sticky top-0 z-10">
                        <div>
                            <h3 class="text-xl font-black text-slate-900">Raise a Dispute</h3>
                            <p class="text-xs text-slate-600 mt-0.5">Submit your concern for admin review</p>
                        </div>
                        <button (click)="showCreateDisputeModal = false" class="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-slate-200 text-slate-400 hover:text-slate-600 hover:border-slate-300 transition-colors">
                            <i data-lucide="x" class="w-4 h-4"></i>
                        </button>
                    </div>
                    <div class="p-6 space-y-5 overflow-y-auto">
                        <!-- Admin Availability Message -->
                        <div class="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4">
                            <div class="flex gap-3">
                                <i data-lucide="info" class="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5"></i>
                                <div>
                                    <p class="font-bold text-blue-900 text-sm">Admin Support Available</p>
                                    <p class="text-xs text-blue-700 mt-1">Average response time: 5 minutes during business hours</p>
                                </div>
                            </div>
                        </div>

                        <!-- Task Selection -->
                        <div>
                            <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Select Task *</label>
                            <select [(ngModel)]="newDisputeForm.taskId" 
                                class="w-full border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all bg-white text-sm">
                                <option value="">-- Choose a task --</option>
                                <option *ngFor="let task of availableTasks" [value]="task.id">
                                    {{task.title}} (ID: {{task.id}})
                                </option>
                            </select>
                            <p *ngIf="availableTasks.length === 0" class="text-sm text-amber-600 mt-2 bg-amber-50 rounded-lg px-3 py-2 border border-amber-200">No eligible tasks to raise disputes</p>
                        </div>

                        <!-- Issue Type -->
                        <div>
                            <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Issue Type *</label>
                            <select [(ngModel)]="newDisputeForm.issueType" 
                                class="w-full border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all bg-white text-sm">
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
                            <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Description of Problem *</label>
                            <textarea [(ngModel)]="newDisputeForm.reason" 
                                name="description"
                                placeholder="Describe the issue in detail..."
                                required
                                minlength="20"
                                maxlength="1000"
                                #descriptionField="ngModel"
                                class="w-full border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all text-sm resize-none"
                                [class.border-red-500]="descriptionField.invalid && descriptionField.touched"
                                rows="4"></textarea>
                            <div class="flex justify-between items-center mt-1">
                                <p *ngIf="descriptionField.invalid && descriptionField.touched" class="text-xs text-red-600">
                                    <span *ngIf="descriptionField.errors?.['required']">Description is required</span>
                                    <span *ngIf="descriptionField.errors?.['minlength']">Please provide at least 20 characters</span>
                                </p>
                                <p class="text-xs text-slate-500 ml-auto">{{newDisputeForm.reason.length}}/1000</p>
                            </div>
                        </div>

                        <!-- Evidence Upload -->
                        <div>
                            <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Upload Evidence (Optional)</label>
                            <p class="text-xs text-slate-500 mb-2">Photos, screenshots, or documents supporting your claim</p>
                            <div class="relative">
                                <input type="file" multiple accept="image/*,.pdf" 
                                    (change)="onEvidenceSelected($event)"
                                    class="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100 cursor-pointer">
                            </div>
                            <div *ngIf="newDisputeForm.evidence && newDisputeForm.evidence.length > 0" class="mt-3 bg-red-50 rounded-xl p-3 border border-red-100">
                                <p class="text-xs font-bold text-red-900 mb-2">Attached files ({{newDisputeForm.evidence.length}})</p>
                                <div class="flex flex-wrap gap-2">
                                    <span *ngFor="let file of newDisputeForm.evidence" class="text-xs bg-white text-red-800 px-3 py-1.5 rounded-lg border border-red-200 font-medium">
                                        {{file}}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Submit Button -->
                    <div class="p-6 border-t border-slate-100 bg-slate-50 flex gap-3">
                        <button (click)="createDispute()" [disabled]="!newDisputeForm.taskId || !newDisputeForm.issueType || !newDisputeForm.reason"
                            class="flex-1 bg-gradient-to-r from-red-600 to-rose-600 text-white font-bold py-3 rounded-xl shadow-lg shadow-red-500/30 hover:shadow-xl hover:shadow-red-500/40 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all duration-200">
                            Submit Dispute
                        </button>
                        <button (click)="showCreateDisputeModal = false" class="flex-1 bg-white border-2 border-slate-200 text-slate-700 font-bold py-3 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all duration-200">
                            Cancel
                        </button>
                    </div>
                </div>
            </div>

            <!-- Resolve Modal -->
            <div *ngIf="showResolveModal && selectedDispute" class="fixed inset-0 z-[70] flex items-center justify-center px-4 bg-slate-900/70 backdrop-blur-md animate-in fade-in duration-200">
                <div class="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                    <div class="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-gradient-to-r from-green-50 to-emerald-50">
                        <div>
                            <h3 class="text-xl font-black text-slate-900">Resolve Dispute</h3>
                            <p class="text-xs text-slate-600 mt-0.5">Mark this dispute as resolved</p>
                        </div>
                        <button (click)="showResolveModal = false" class="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-slate-200 text-slate-400 hover:text-slate-600 hover:border-slate-300 transition-colors">
                            <i data-lucide="x" class="w-4 h-4"></i>
                        </button>
                    </div>
                    <div class="p-6 space-y-4">
                        <div>
                            <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Resolution Notes</label>
                            <textarea [(ngModel)]="resolutionNotes" 
                                name="resolution"
                                placeholder="Explain how this dispute was resolved..."
                                required
                                minlength="10"
                                maxlength="500"
                                #resolutionField="ngModel"
                                class="w-full border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all text-sm resize-none"
                                [class.border-red-500]="resolutionField.invalid && resolutionField.touched"
                                rows="4"></textarea>
                            <div class="flex justify-between items-center mt-1">
                                <p *ngIf="resolutionField.invalid && resolutionField.touched" class="text-xs text-red-600">
                                    <span *ngIf="resolutionField.errors?.['required']">Resolution notes are required</span>
                                    <span *ngIf="resolutionField.errors?.['minlength']">Please provide at least 10 characters</span>
                                </p>
                                <p class="text-xs text-slate-500 ml-auto">{{resolutionNotes.length}}/500</p>
                            </div>
                        </div>
                        <div class="flex gap-3">
                            <button (click)="confirmResolve()" 
                                [disabled]="resolutionField.invalid"
                                class="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold py-3 rounded-xl shadow-lg shadow-green-500/30 hover:shadow-xl hover:shadow-green-500/40 hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100">
                                Confirm Resolution
                            </button>
                            <button (click)="showResolveModal = false" class="flex-1 bg-white border-2 border-slate-200 text-slate-700 font-bold py-3 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all duration-200">
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
        console.log('Disputes component initializing...');
        
        this.appService.currentUser$.subscribe(user => {
            if (user) {
                console.log('Current user for disputes:', user);
                this.currentUserId = user.id;
                this.currentUserRole = user.role;
                this.loadAvailableTasks();
            }
        });

        // Load disputes from API if needed
        console.log('Current disputes count:', this.appService.disputes.length);
        if (this.appService.disputes.length === 0) {
            console.log('No disputes loaded, calling loadDisputesFromApi()');
            this.appService.loadDisputesFromApi();
        }

        this.appService.disputes$.subscribe(disputes => {
            console.log('Disputes updated:', disputes);
            this.disputes = disputes.filter(d => {
                const isInitiator = d.initiatorId === this.currentUserId;
                const isRespondent = d.respondentId === this.currentUserId;
                const isAdmin = this.currentUserRole === UserRole.ADMIN;
                console.log(`Dispute ${d.id}: initiator=${isInitiator}, respondent=${isRespondent}, admin=${isAdmin}`);
                return isInitiator || isRespondent || isAdmin;
            });
            console.log('Filtered disputes for user:', this.disputes);
            
            if (this.disputes.length > 0 && !this.selectedDispute) {
                this.selectDispute(this.disputes[0]);
            }
        });
    }

    loadAvailableTasks() {
        // Get tasks based on user role - only show tasks that can have disputes
        if (this.currentUserRole === UserRole.CUSTOMER) {
            // Customers can dispute tasks that are in progress, work completed, verified or completed
            this.availableTasks = this.appService.tasks.filter(t => 
                t.customerId === this.currentUserId && 
                (t.status === TaskStatus.IN_PROGRESS || 
                 t.status === TaskStatus.WORK_COMPLETED ||
                 t.status === TaskStatus.VERIFIED ||
                 t.status === TaskStatus.COMPLETED)
            );
        } else if (this.currentUserRole === UserRole.WORKER) {
            // Workers can dispute tasks they're assigned to
            this.availableTasks = this.appService.tasks.filter(t => 
                t.workerId === this.currentUserId && 
                (t.status === TaskStatus.IN_PROGRESS ||
                 t.status === TaskStatus.WORK_COMPLETED ||
                 t.status === TaskStatus.VERIFIED ||
                 t.status === TaskStatus.COMPLETED)
            );
        }
    }

    selectDispute(dispute: Dispute) {
        this.selectedDispute = dispute;
        this.newMessage = '';
    }

    private toastService = inject(ToastService);

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

        // Determine respondent: if customer is initiator, respondent is worker (if assigned)
        // If worker is initiator, respondent is customer
        let respondentId: string;
        if (task.customerId === this.currentUserId) {
            // Customer is initiator, worker is respondent (if task has worker)
            respondentId = task.workerId || task.customerId; // Fallback to customer if no worker
        } else {
            // Worker is initiator, customer is respondent
            respondentId = task.customerId;
        }

        const disputeData = {
            taskId: this.newDisputeForm.taskId,
            initiatorId: this.currentUserId,
            respondentId: respondentId,
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
                return 'bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-800 border border-amber-200';
            case DisputeStatus.IN_PROGRESS:
                return 'bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border border-blue-200';
            case DisputeStatus.RESOLVED:
                return 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200';
            default:
                return 'bg-gradient-to-r from-slate-100 to-gray-100 text-slate-800 border border-slate-200';
        }
    }
}
