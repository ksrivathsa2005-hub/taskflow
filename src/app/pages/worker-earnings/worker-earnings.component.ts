import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppService } from '../../app.service';
import { ToastService } from '../../services/toast.service';
import { User, Task, TaskStatus } from '../../types';
import { CURRENCY } from '../../constants';
import {
    LucideAngularModule,
    TrendingUp,
    DollarSign,
    Clock,
    CheckCircle2,
    FileText,
    Download,
    ArrowRight,
    Calendar
} from 'lucide-angular';

interface Transaction {
    date: string;
    taskTitle: string;
    customerName: string;
    amount: number;
    status: 'Paid' | 'Pending';
    taskId: string;
}

@Component({
    selector: 'app-worker-earnings',
    standalone: true,
    imports: [CommonModule, LucideAngularModule],
    template: `
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <!-- Header -->
            <div class="mb-12">
                <h1 class="text-4xl font-black text-slate-900 tracking-tight">Earnings</h1>
                <p class="text-slate-500 mt-2 font-medium">Track your income and payment status</p>
            </div>

            <!-- Key Metrics Grid -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                <!-- Total Earnings -->
                <div class="bg-white border border-slate-100 rounded-2xl p-8 hover:shadow-lg transition-shadow">
                    <div class="flex items-center justify-between mb-4">
                        <h3 class="text-slate-600 font-bold text-sm uppercase tracking-widest">Total Earnings</h3>
                        <div class="bg-indigo-100 p-3 rounded-xl">
                            <lucide-icon [img]="DollarSign" class="w-6 h-6 text-indigo-600"></lucide-icon>
                        </div>
                    </div>
                    <p class="text-3xl font-black text-slate-900">{{CURRENCY}}{{totalEarnings | number:'1.0-0'}}</p>
                    <p class="text-xs text-slate-500 mt-2 font-medium">{{completedTasksCount}} tasks completed</p>
                </div>

                <!-- This Month -->
                <div class="bg-white border border-slate-100 rounded-2xl p-8 hover:shadow-lg transition-shadow">
                    <div class="flex items-center justify-between mb-4">
                        <h3 class="text-slate-600 font-bold text-sm uppercase tracking-widest">This Month</h3>
                        <div class="bg-green-100 p-3 rounded-xl">
                            <lucide-icon [img]="Calendar" class="w-6 h-6 text-green-600"></lucide-icon>
                        </div>
                    </div>
                    <p class="text-3xl font-black text-slate-900">{{CURRENCY}}{{thisMonthEarnings | number:'1.0-0'}}</p>
                    <p class="text-xs text-slate-500 mt-2 font-medium">{{thisMonthTasksCount}} tasks this month</p>
                </div>

                <!-- This Week -->
                <div class="bg-white border border-slate-100 rounded-2xl p-8 hover:shadow-lg transition-shadow">
                    <div class="flex items-center justify-between mb-4">
                        <h3 class="text-slate-600 font-bold text-sm uppercase tracking-widest">This Week</h3>
                        <div class="bg-blue-100 p-3 rounded-xl">
                            <lucide-icon [img]="TrendingUp" class="w-6 h-6 text-blue-600"></lucide-icon>
                        </div>
                    </div>
                    <p class="text-3xl font-black text-slate-900">{{CURRENCY}}{{thisWeekEarnings | number:'1.0-0'}}</p>
                    <p class="text-xs text-slate-500 mt-2 font-medium">{{thisWeekTasksCount}} tasks this week</p>
                </div>

                <!-- Pending Payments -->
                <div class="bg-white border border-slate-100 rounded-2xl p-8 hover:shadow-lg transition-shadow">
                    <div class="flex items-center justify-between mb-4">
                        <h3 class="text-slate-600 font-bold text-sm uppercase tracking-widest">Pending Payments</h3>
                        <div class="bg-amber-100 p-3 rounded-xl">
                            <lucide-icon [img]="Clock" class="w-6 h-6 text-amber-600"></lucide-icon>
                        </div>
                    </div>
                    <p class="text-3xl font-black text-slate-900">{{CURRENCY}}{{pendingPayments | number:'1.0-0'}}</p>
                    <p class="text-xs text-slate-500 mt-2 font-medium">Awaiting customer approval</p>
                </div>
            </div>

            <!-- Transactions List -->
            <div class="bg-white border border-slate-100 rounded-2xl overflow-hidden">
                <div class="px-8 py-6 border-b border-slate-100">
                    <h2 class="text-2xl font-black text-slate-900 flex items-center gap-2">
                        <lucide-icon [img]="FileText" class="w-6 h-6"></lucide-icon>
                        Transaction History
                    </h2>
                    <p class="text-slate-500 text-sm mt-1 font-medium">Last 50 transactions</p>
                </div>

                <div class="overflow-x-auto">
                    <table class="w-full">
                        <thead class="bg-slate-50 border-b border-slate-100">
                            <tr>
                                <th class="text-left px-8 py-4 font-bold text-slate-700 text-sm">Date</th>
                                <th class="text-left px-8 py-4 font-bold text-slate-700 text-sm">Task</th>
                                <th class="text-left px-8 py-4 font-bold text-slate-700 text-sm">Customer</th>
                                <th class="text-right px-8 py-4 font-bold text-slate-700 text-sm">Amount</th>
                                <th class="text-center px-8 py-4 font-bold text-slate-700 text-sm">Status</th>
                                <th class="text-center px-8 py-4 font-bold text-slate-700 text-sm">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr *ngFor="let transaction of transactions" class="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                                <td class="px-8 py-4 text-slate-700 font-medium text-sm">
                                    {{formatDate(transaction.date)}}
                                </td>
                                <td class="px-8 py-4 text-slate-900 font-bold">{{transaction.taskTitle}}</td>
                                <td class="px-8 py-4 text-slate-600">{{transaction.customerName}}</td>
                                <td class="px-8 py-4 text-right font-bold text-slate-900">{{CURRENCY}}{{transaction.amount}}</td>
                                <td class="px-8 py-4 text-center">
                                    <span *ngIf="transaction.status === 'Paid'" 
                                        class="inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">
                                        <lucide-icon [img]="CheckCircle2" class="w-3 h-3"></lucide-icon>
                                        Paid
                                    </span>
                                    <span *ngIf="transaction.status === 'Pending'" 
                                        class="inline-flex items-center gap-2 px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold">
                                        <lucide-icon [img]="Clock" class="w-3 h-3"></lucide-icon>
                                        Pending
                                    </span>
                                </td>
                                <td class="px-8 py-4 text-center">
                                    <button (click)="viewReceipt(transaction.taskId)" 
                                        class="inline-flex items-center gap-1 px-3 py-2 text-indigo-600 font-bold text-sm hover:bg-indigo-50 rounded-lg transition-colors">
                                        <lucide-icon [img]="Download" class="w-4 h-4"></lucide-icon>
                                        Receipt
                                    </button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div *ngIf="transactions.length === 0" class="px-8 py-12 text-center">
                    <div class="bg-slate-50 p-8 rounded-xl">
                        <lucide-icon [img]="DollarSign" class="w-12 h-12 text-slate-300 mx-auto mb-4"></lucide-icon>
                        <p class="text-slate-500 font-medium">No transactions yet. Complete your first task to start earning!</p>
                    </div>
                </div>
            </div>

            <!-- Receipt Modal -->
            <div *ngIf="showReceiptModal" class="fixed inset-0 z-[70] flex items-center justify-center px-4 bg-slate-900/60 backdrop-blur-sm">
                <div class="bg-white rounded-[2rem] w-full max-w-md overflow-hidden shadow-2xl p-8">
                    <h2 class="text-2xl font-black text-slate-900 mb-6">Receipt</h2>
                    <div *ngIf="selectedReceiptTask" class="space-y-4 mb-6">
                        <div class="border-b border-slate-100 pb-4">
                            <p class="text-sm text-slate-600 font-medium">Task</p>
                            <p class="text-lg font-black text-slate-900">{{selectedReceiptTask.title}}</p>
                        </div>
                        <div class="border-b border-slate-100 pb-4">
                            <p class="text-sm text-slate-600 font-medium">Customer</p>
                            <p class="text-lg font-bold text-slate-900">{{getCustomerName(selectedReceiptTask.customerId)}}</p>
                        </div>
                        <div class="border-b border-slate-100 pb-4">
                            <p class="text-sm text-slate-600 font-medium">Amount Earned</p>
                            <p class="text-2xl font-black text-indigo-600">{{CURRENCY}}{{selectedReceiptTask.finalPrice || selectedReceiptTask.budgetMax}}</p>
                        </div>
                        <div class="border-b border-slate-100 pb-4">
                            <p class="text-sm text-slate-600 font-medium">Completion Date</p>
                            <p class="text-lg font-bold text-slate-900">{{formatDate(selectedReceiptTask.completionDate || '')}}</p>
                        </div>
                        <div>
                            <p class="text-sm text-slate-600 font-medium">Receipt ID</p>
                            <p class="text-sm font-mono text-slate-500">RCP-{{selectedReceiptTask.id}}</p>
                        </div>
                    </div>
                    <div class="flex gap-4">
                        <button (click)="downloadReceipt()" 
                            class="flex-1 bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2">
                            <lucide-icon [img]="Download" class="w-5 h-5"></lucide-icon>
                            Download
                        </button>
                        <button (click)="closeReceiptModal()" 
                            class="flex-1 bg-slate-100 text-slate-700 font-bold py-3 rounded-xl hover:bg-slate-200 transition-colors">
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `,
    styles: [`
        :host ::ng-deep {
            lucide-icon {
                display: inline-block;
            }
        }
    `]
})
export class WorkerEarningsComponent implements OnInit {
    currentUser: User | null = null;
    transactions: Transaction[] = [];
    totalEarnings = 0;
    thisMonthEarnings = 0;
    thisWeekEarnings = 0;
    pendingPayments = 0;
    completedTasksCount = 0;
    thisMonthTasksCount = 0;
    thisWeekTasksCount = 0;
    showReceiptModal = false;
    selectedReceiptTask: Task | null = null;

    readonly CURRENCY = CURRENCY;
    readonly DollarSign = DollarSign;
    readonly TrendingUp = TrendingUp;
    readonly Clock = Clock;
    readonly CheckCircle2 = CheckCircle2;
    readonly FileText = FileText;
    readonly Download = Download;
    readonly Calendar = Calendar;

    constructor(public appService: AppService) {}

    ngOnInit() {
        this.appService.currentUser$.subscribe(user => {
            this.currentUser = user;
            this.calculateEarnings();
        });

        this.appService.tasks$.subscribe(() => {
            this.calculateEarnings();
        });
    }

    calculateEarnings() {
        if (!this.currentUser) return;

        const completedTasks = this.appService.tasks.filter(
            t => t.workerId === this.currentUser?.id && t.status === TaskStatus.COMPLETED
        );

        const now = new Date();
        const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const thisWeekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

        this.totalEarnings = completedTasks.reduce((sum, task) => sum + (task.finalPrice || task.budgetMax || 0), 0);
        this.completedTasksCount = completedTasks.length;

        this.thisMonthEarnings = completedTasks
            .filter(t => new Date(t.completionDate || '') >= thisMonthStart)
            .reduce((sum, task) => sum + (task.finalPrice || task.budgetMax || 0), 0);
        
        this.thisMonthTasksCount = completedTasks.filter(t => 
            new Date(t.completionDate || '') >= thisMonthStart
        ).length;

        this.thisWeekEarnings = completedTasks
            .filter(t => new Date(t.completionDate || '') >= thisWeekStart)
            .reduce((sum, task) => sum + (task.finalPrice || task.budgetMax || 0), 0);
        
        this.thisWeekTasksCount = completedTasks.filter(t => 
            new Date(t.completionDate || '') >= thisWeekStart
        ).length;

        // Calculate pending payments from tasks completed but not yet reviewed
        const inProgressTasks = this.appService.tasks.filter(
            t => t.workerId === this.currentUser?.id && t.status === TaskStatus.IN_PROGRESS
        );
        this.pendingPayments = inProgressTasks.reduce((sum, task) => sum + (task.finalPrice || task.budgetMax || 0), 0);

        this.buildTransactionList();
    }

    buildTransactionList() {
        this.transactions = [];
        
        const completedTasks = this.appService.tasks.filter(
            t => t.workerId === this.currentUser?.id && t.status === TaskStatus.COMPLETED
        );

        completedTasks.forEach(task => {
            const customer = this.appService.users.find(u => u.id === task.customerId);
            this.transactions.push({
                date: task.completionDate || '',
                taskTitle: task.title,
                customerName: customer?.name || 'Unknown',
                amount: task.finalPrice || task.budgetMax || 0,
                status: 'Paid',
                taskId: task.id
            });
        });

        // Also add in-progress tasks as pending
        const inProgressTasks = this.appService.tasks.filter(
            t => t.workerId === this.currentUser?.id && t.status === TaskStatus.IN_PROGRESS
        );

        inProgressTasks.forEach(task => {
            const customer = this.appService.users.find(u => u.id === task.customerId);
            this.transactions.push({
                date: new Date().toISOString(),
                taskTitle: task.title,
                customerName: customer?.name || 'Unknown',
                amount: task.finalPrice || task.budgetMax || 0,
                status: 'Pending',
                taskId: task.id
            });
        });

        // Sort by date descending
        this.transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        this.transactions = this.transactions.slice(0, 50);
    }

    formatDate(date: string): string {
        if (!date) return '';
        return new Date(date).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    getCustomerName(customerId: string): string {
        const customer = this.appService.users.find(u => u.id === customerId);
        return customer?.name || 'Unknown';
    }

    viewReceipt(taskId: string) {
        this.selectedReceiptTask = this.appService.tasks.find(t => t.id === taskId) || null;
        this.showReceiptModal = true;
    }

    closeReceiptModal() {
        this.showReceiptModal = false;
        this.selectedReceiptTask = null;
    }

    private toastService = inject(ToastService);

    downloadReceipt() {
        if (!this.selectedReceiptTask) return;
        this.toastService.info('Receipt download feature will be available soon. Receipt ID: RCP-' + this.selectedReceiptTask.id);
    }
}
