import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AppService } from '../../app.service';
import { Dispute, DisputeStatus, User } from '../../types';
import { CURRENCY } from '../../constants';
import {
    LucideAngularModule,
    MessageCircle,
    User as UserIcon,
    Clock,
    CheckCircle,
    X,
    Send,
    AlertCircle
} from 'lucide-angular';

@Component({
    selector: 'app-admin-disputes',
    standalone: true,
    imports: [CommonModule, FormsModule, LucideAngularModule],
    template: `
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <h1 class="text-4xl font-black text-slate-900 mb-10">Dispute Management</h1>

            <div class="grid grid-cols-1 lg:grid-cols-4 gap-10">
                <!-- Disputes List -->
                <div class="lg:col-span-1 bg-white rounded-[2rem] border border-slate-100 overflow-hidden h-fit">
                    <div class="px-6 py-6 border-b border-slate-100">
                        <h2 class="text-lg font-black text-slate-900 mb-4">Filter by Status</h2>
                        <div class="space-y-2">
                            <button *ngFor="let status of statuses"
                                (click)="filterByStatus(status)"
                                [ngClass]="{'bg-indigo-100 text-indigo-900 border-indigo-300': selectedStatus === status, 'bg-slate-50 text-slate-700 border-slate-100': selectedStatus !== status}"
                                class="w-full text-left px-4 py-2 rounded-lg border font-semibold text-sm transition-colors">
                                {{ status === 'ALL' ? 'All Disputes' : status }}
                            </button>
                        </div>
                    </div>

                    <div class="divide-y max-h-[70vh] overflow-y-auto">
                        <div *ngFor="let dispute of filteredDisputes"
                            (click)="selectDispute(dispute)"
                            [ngClass]="{'bg-indigo-50 border-l-4 border-indigo-600': selectedDispute?.id === dispute.id}"
                            class="px-6 py-4 cursor-pointer hover:bg-slate-50 transition-colors border-l-4 border-transparent">
                            <div class="flex items-center gap-3 mb-2">
                                <div [ngClass]="getStatusBadgeClass(dispute.status)" class="px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest">
                                    {{ dispute.status }}
                                </div>
                            </div>
                            <p class="text-sm font-bold text-slate-900 truncate">Task #{{dispute.taskId}}</p>
                            <p class="text-xs text-slate-500 mt-1">{{ dispute.messages.length || 0 }} messages</p>
                        </div>
                    </div>
                </div>

                <!-- Dispute Details -->
                <div class="lg:col-span-3">
                    <div *ngIf="selectedDispute" class="bg-white rounded-[2rem] border border-slate-100 overflow-hidden h-[70vh] flex flex-col">
                        <!-- Header -->
                        <div class="px-8 py-6 border-b border-slate-100 flex justify-between items-center">
                            <div>
                                <h2 class="text-2xl font-black text-slate-900">Dispute #{{selectedDispute.id}}</h2>
                                <p class="text-sm text-slate-500 mt-1">Task ID: {{selectedDispute.taskId}}</p>
                            </div>
                            <div [ngClass]="getStatusBadgeClass(selectedDispute.status)" class="px-4 py-2 rounded-lg font-bold uppercase tracking-wider">
                                {{ selectedDispute.status }}
                            </div>
                        </div>

                        <!-- Messages -->
                        <div class="flex-1 overflow-y-auto p-8 space-y-6">
                            <div *ngFor="let msg of selectedDispute.messages" 
                                [ngClass]="{'ml-auto': msg.senderId === 'admin'}"
                                class="max-w-xs">
                                <div [ngClass]="msg.senderId === 'admin' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-900'"
                                    class="rounded-2xl px-6 py-4 w-fit">
                                    <p class="font-bold text-sm">{{ msg.message }}</p>
                                </div>
                                <p class="text-xs text-slate-400 mt-2">{{ msg.timestamp | date:'short' }}</p>
                            </div>

                            <!-- Admins Busy Message -->
                            <div class="bg-blue-50 border border-blue-200 rounded-xl p-4 flex gap-3 my-6">
                                <lucide-icon [img]="Clock" class="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5"></lucide-icon>
                                <div>
                                    <p class="font-bold text-blue-900 text-sm">Admins are currently busy</p>
                                    <p class="text-xs text-blue-700 mt-1">Average response time: 5 minutes during business hours</p>
                                </div>
                            </div>
                        </div>

                        <!-- Message Input -->
                        <div class="px-8 py-6 border-t border-slate-100 bg-slate-50">
                            <div class="flex gap-3">
                                <input [(ngModel)]="newAdminMessage" placeholder="Type your message..."
                                    class="flex-1 px-5 py-3 rounded-xl bg-white border border-slate-100 outline-none focus:ring-2 focus:ring-indigo-500" />
                                <button (click)="sendAdminMessage()"
                                    [disabled]="!newAdminMessage.trim()"
                                    class="px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors disabled:bg-slate-300 disabled:cursor-not-allowed flex items-center gap-2">
                                    <lucide-icon [img]="Send" class="w-4 h-4"></lucide-icon>
                                    Send
                                </button>
                            </div>
                        </div>

                        <!-- Resolve Button -->
                        <div class="px-8 py-4 border-t border-slate-100 flex gap-3">
                            <button *ngIf="selectedDispute.status !== 'RESOLVED'"
                                (click)="showResolveModal = true"
                                class="flex-1 px-6 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2">
                                <lucide-icon [img]="CheckCircle" class="w-4 h-4"></lucide-icon>
                                Resolve Dispute
                            </button>
                            <div *ngIf="selectedDispute.status === 'RESOLVED'" class="flex-1 px-6 py-3 bg-emerald-50 text-emerald-700 font-bold rounded-xl text-center">
                                ✓ Dispute Resolved
                            </div>
                        </div>
                    </div>
                    <div *ngIf="!selectedDispute" class="bg-slate-50 rounded-[2rem] h-[70vh] flex items-center justify-center">
                        <div class="text-center">
                            <lucide-icon [img]="MessageCircle" class="w-16 h-16 text-slate-300 mx-auto mb-4"></lucide-icon>
                            <p class="text-slate-500 font-bold">Select a dispute to view details</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Resolve Modal -->
            <div *ngIf="showResolveModal" class="fixed inset-0 z-[60] flex items-center justify-center px-4 bg-slate-900/60 backdrop-blur-sm">
                <div class="bg-white rounded-[2rem] w-full max-w-lg overflow-hidden shadow-2xl">
                    <div class="px-8 py-6 border-b border-slate-100 flex justify-between items-center">
                        <h2 class="text-2xl font-black text-slate-900">Resolve Dispute</h2>
                        <button (click)="showResolveModal = false" class="p-2 bg-slate-50 rounded-xl text-slate-400 hover:text-slate-600">
                            <lucide-icon [img]="X"></lucide-icon>
                        </button>
                    </div>
                    <div class="p-8">
                        <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Resolution Notes</label>
                        <textarea [(ngModel)]="resolutionNotes" placeholder="Explain how this dispute was resolved..."
                            class="w-full px-5 py-3.5 rounded-xl bg-slate-50 border border-slate-100 outline-none focus:ring-2 focus:ring-emerald-500 min-h-32"></textarea>
                        <button (click)="confirmResolve()"
                            class="w-full mt-6 bg-emerald-600 text-white font-black py-4 rounded-2xl hover:bg-emerald-700 transition-all">
                            Mark as Resolved
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `,
    styles: [`
        :host {
            display: block;
        }
    `]
})
export class AdminDisputesComponent implements OnInit {
    disputes: Dispute[] = [];
    selectedDispute: Dispute | null = null;
    selectedStatus: string = 'ALL';
    newAdminMessage: string = '';
    resolutionNotes: string = '';
    showResolveModal = false;

    readonly CURRENCY = CURRENCY;
    readonly MessageCircle = MessageCircle;
    readonly UserIcon = UserIcon;
    readonly Clock = Clock;
    readonly CheckCircle = CheckCircle;
    readonly X = X;
    readonly Send = Send;
    readonly AlertCircle = AlertCircle;

    statuses = ['ALL', 'PENDING', 'IN_PROGRESS', 'RESOLVED'];

    get filteredDisputes(): Dispute[] {
        if (this.selectedStatus === 'ALL') {
            return this.disputes;
        }
        return this.disputes.filter(d => d.status === this.selectedStatus);
    }

    constructor(public appService: AppService) {}

    ngOnInit() {
        this.appService.disputes$.subscribe(disputes => {
            this.disputes = disputes;
        });
    }

    selectDispute(dispute: Dispute) {
        this.selectedDispute = dispute;
        this.newAdminMessage = '';
    }

    filterByStatus(status: string) {
        this.selectedStatus = status;
    }

    getStatusBadgeClass(status: string): string {
        const baseClass = 'text-white font-bold';
        switch (status) {
            case DisputeStatus.PENDING:
                return baseClass + ' bg-yellow-500';
            case DisputeStatus.IN_PROGRESS:
                return baseClass + ' bg-blue-500';
            case DisputeStatus.RESOLVED:
                return baseClass + ' bg-emerald-500';
            default:
                return baseClass + ' bg-slate-500';
        }
    }

    sendAdminMessage() {
        if (this.selectedDispute && this.newAdminMessage.trim()) {
            this.appService.addMessageToDispute(this.selectedDispute.id, {
                message: this.newAdminMessage,
                senderId: 'admin',
                senderName: 'Admin Support',
                timestamp: new Date().toISOString()
            });
            this.newAdminMessage = '';
        }
    }

    confirmResolve() {
        if (this.selectedDispute) {
            this.appService.resolveDispute(this.selectedDispute.id, this.resolutionNotes);
            this.showResolveModal = false;
            this.resolutionNotes = '';
            this.selectedDispute = null;
        }
    }
}
