import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AppService } from '../../app.service';
import { ToastService } from '../../services/toast.service';
import { ConfirmDialogService } from '../../services/confirm-dialog.service';
import { User, UserRole, UserStatus } from '../../types';
import {
    LucideAngularModule,
    CheckCircle,
    XCircle
} from 'lucide-angular';

@Component({
    selector: 'app-user-management',
    standalone: true,
    imports: [CommonModule, FormsModule, LucideAngularModule],
    template: `
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <!-- Header -->
            <div class="mb-8">
                <h1 class="text-4xl font-black text-slate-900 tracking-tight">User Management</h1>
                <p class="text-slate-500 mt-2 font-medium">Manage all platform users</p>
            </div>

            <!-- Filters -->
            <div class="bg-white rounded-2xl border border-slate-100 p-6 mb-8">
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label class="block text-sm font-bold text-slate-700 mb-2">Role</label>
                        <select [(ngModel)]="filterRole" (change)="applyFilter()" 
                            class="w-full px-4 py-2 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500">
                            <option value="">All Roles</option>
                            <option value="CUSTOMER">Customers</option>
                            <option value="WORKER">Workers</option>
                            <option value="ADMIN">Admins</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-bold text-slate-700 mb-2">Status</label>
                        <select [(ngModel)]="filterStatus" (change)="applyFilter()"
                            class="w-full px-4 py-2 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500">
                            <option value="">All Status</option>
                            <option value="ACTIVE">Active</option>
                            <option value="SUSPENDED">Suspended</option>
                            <option value="UNVERIFIED">Unverified</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-bold text-slate-700 mb-2">Search</label>
                        <input [(ngModel)]="searchTerm" (change)="applyFilter()" placeholder="Search by name or email"
                            class="w-full px-4 py-2 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500">
                    </div>
                </div>
            </div>

            <!-- Users Table -->
            <div class="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-lg">
                <div class="overflow-x-auto">
                    <table class="w-full">
                        <thead class="bg-slate-50 border-b border-slate-100">
                            <tr>
                                <th class="text-left px-6 py-4 font-bold text-slate-700">Name</th>
                                <th class="text-left px-6 py-4 font-bold text-slate-700">Email</th>
                                <th class="text-left px-6 py-4 font-bold text-slate-700">Role</th>
                                <th class="text-left px-6 py-4 font-bold text-slate-700">Status</th>
                                <th class="text-left px-6 py-4 font-bold text-slate-700">Rating</th>
                                <th class="text-left px-6 py-4 font-bold text-slate-700">Jobs</th>
                                <th class="text-center px-6 py-4 font-bold text-slate-700">Actions</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-100">
                            <tr *ngFor="let user of filteredUsers" class="hover:bg-slate-50 transition-colors">
                                <td class="px-6 py-4">
                                    <div class="flex items-center gap-3">
                                        <img [src]="user.avatar" [alt]="user.name" class="w-10 h-10 rounded-full object-cover">
                                        <div>
                                            <p class="font-bold text-slate-900">{{ user.name }}</p>
                                            <p *ngIf="user.categories && user.categories.length > 0" class="text-xs text-slate-500">
                                                {{ user.categories.join(', ') }}
                                            </p>
                                        </div>
                                    </div>
                                </td>
                                <td class="px-6 py-4 text-slate-600">{{ user.email }}</td>
                                <td class="px-6 py-4">
                                    <span [class.bg-blue-100]="user.role === 'WORKER'" 
                                          [class.bg-green-100]="user.role === 'CUSTOMER'"
                                          [class.bg-purple-100]="user.role === 'ADMIN'"
                                          [class.text-blue-700]="user.role === 'WORKER'"
                                          [class.text-green-700]="user.role === 'CUSTOMER'"
                                          [class.text-purple-700]="user.role === 'ADMIN'"
                                          class="px-3 py-1 rounded-full text-sm font-bold">
                                        {{ user.role }}
                                    </span>
                                </td>
                                <td class="px-6 py-4">
                                    <span [class.bg-green-100]="user.status === 'ACTIVE'"
                                          [class.bg-red-100]="user.status === 'SUSPENDED'"
                                          [class.bg-yellow-100]="user.status === 'UNVERIFIED'"
                                          [class.text-green-700]="user.status === 'ACTIVE'"
                                          [class.text-red-700]="user.status === 'SUSPENDED'"
                                          [class.text-yellow-700]="user.status === 'UNVERIFIED'"
                                          class="px-3 py-1 rounded-full text-sm font-bold">
                                        {{ user.status }}
                                    </span>
                                </td>
                                <td class="px-6 py-4">
                                    <span class="text-amber-500 font-bold">★ {{ user.rating }}</span>
                                </td>
                                <td class="px-6 py-4 text-slate-600 font-medium">{{ user.completedJobs }}</td>
                                <td class="px-6 py-4">
                                    <div class="flex justify-center gap-2">
                                        <button *ngIf="user.role === 'WORKER' && user.status !== 'SUSPENDED'" 
                                                (click)="verifyUser(user)" 
                                                class="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                title="Verify">
                                            <lucide-icon [img]="CheckCircle" class="w-5 h-5"></lucide-icon>
                                        </button>
                                        <button *ngIf="user.status !== 'SUSPENDED'" 
                                                (click)="suspendUser(user)" 
                                                class="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Suspend">
                                            <lucide-icon [img]="XCircle" class="w-5 h-5"></lucide-icon>
                                        </button>
                                        <button *ngIf="user.status === 'SUSPENDED'" 
                                                (click)="activateUser(user)" 
                                                class="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                                title="Activate">
                                            <lucide-icon [img]="CheckCircle" class="w-5 h-5"></lucide-icon>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div *ngIf="filteredUsers.length === 0" class="px-6 py-12 text-center">
                    <p class="text-slate-500 font-medium">No users found</p>
                </div>
            </div>
        </div>
    `,
    styles: []
})
export class UserManagementComponent implements OnInit {
    users: User[] = [];
    filteredUsers: User[] = [];
    filterRole: string = '';
    filterStatus: string = '';
    searchTerm: string = '';

    readonly CheckCircle = CheckCircle;
    readonly XCircle = XCircle;

    constructor(private appService: AppService) {}

    ngOnInit() {
        this.appService.users$.subscribe(users => {
            this.users = users;
            this.applyFilter();
        });
    }

    applyFilter() {
        this.filteredUsers = this.users.filter(user => {
            const roleMatch = !this.filterRole || user.role === this.filterRole;
            const statusMatch = !this.filterStatus || user.status === this.filterStatus;
            const searchMatch = !this.searchTerm || 
                user.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                user.email.toLowerCase().includes(this.searchTerm.toLowerCase());
            return roleMatch && statusMatch && searchMatch;
        });
    }

    private toastService = inject(ToastService);
    private confirmService = inject(ConfirmDialogService);

    verifyUser(user: User) {
        this.appService.verifyUser(user.id);
    }

    async suspendUser(user: User) {
        const confirmed = await this.confirmService.show(
            `Are you sure you want to suspend ${user.name}?`,
            { title: 'Suspend User', type: 'warning', confirmText: 'Suspend' }
        );
        if (confirmed) {
            this.appService.suspendUser(user.id);
            this.toastService.success(`${user.name} has been suspended`);
        }
    }

    async activateUser(user: User) {
        const confirmed = await this.confirmService.show(
            `Are you sure you want to activate ${user.name}?`,
            { title: 'Activate User', type: 'primary', confirmText: 'Activate' }
        );
        if (confirmed) {
            this.appService.activateUser(user.id);
            this.toastService.success(`${user.name} has been activated`);
        }
    }
}
