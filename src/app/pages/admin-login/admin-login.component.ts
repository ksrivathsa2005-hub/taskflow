import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AppService } from '../../app.service';
import { UserRole } from '../../types';
import { LucideAngularModule, Shield, Lock, Mail } from 'lucide-angular';

@Component({
    selector: 'app-admin-login',
    standalone: true,
    imports: [CommonModule, FormsModule, LucideAngularModule],
    template: `
        <div class="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 flex items-center justify-center p-4">
            <div class="max-w-md w-full">
                <!-- Admin Badge -->
                <div class="text-center mb-8">
                    <div class="inline-flex items-center justify-center w-20 h-20 bg-amber-500 rounded-3xl mb-4 shadow-2xl">
                        <lucide-icon [img]="Shield" class="w-10 h-10 text-white"></lucide-icon>
                    </div>
                    <h1 class="text-4xl font-black text-white mb-2">Admin Portal</h1>
                    <p class="text-slate-400 font-medium">Restricted Access Only</p>
                </div>

                <!-- Login Form -->
                <div class="bg-white rounded-3xl shadow-2xl p-8">
                    <form (submit)="handleLogin($event)">
                        <!-- Error Message -->
                        <div *ngIf="errorMessage" class="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm font-medium">
                            {{ errorMessage }}
                        </div>

                        <!-- Email Field -->
                        <div class="mb-6">
                            <label class="block text-sm font-bold text-slate-700 mb-2">
                                <lucide-icon [img]="Mail" class="w-4 h-4 inline mr-2"></lucide-icon>
                                Admin Email
                            </label>
                            <input
                                type="email"
                                name="email"
                                [(ngModel)]="email"
                                required
                                email
                                pattern="^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
                                #emailField="ngModel"
                                placeholder="admin@taskflow.com"
                                class="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none transition-all font-medium"
                                [class.border-red-500]="emailField.invalid && emailField.touched"
                            />
                            <p *ngIf="emailField.invalid && emailField.touched" class="mt-1 text-xs text-red-600">
                                Please enter a valid admin email
                            </p>
                        </div>

                        <!-- Password Field -->
                        <div class="mb-6">
                            <label class="block text-sm font-bold text-slate-700 mb-2">
                                <lucide-icon [img]="Lock" class="w-4 h-4 inline mr-2"></lucide-icon>
                                Password
                            </label>
                            <input
                                type="password"
                                name="password"
                                [(ngModel)]="password"
                                required
                                minlength="6"
                                #passwordField="ngModel"
                                placeholder="Enter admin password"
                                class="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none transition-all font-medium"
                                [class.border-red-500]="passwordField.invalid && passwordField.touched"
                            />
                            <p *ngIf="passwordField.invalid && passwordField.touched" class="mt-1 text-xs text-red-600">
                                Password is required (minimum 6 characters)
                            </p>
                        </div>

                        <!-- Login Button -->
                        <button
                            type="submit"
                            [disabled]="isLoading"
                            class="w-full bg-gradient-to-r from-amber-500 to-amber-600 text-white font-black py-4 rounded-xl hover:from-amber-600 hover:to-amber-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <span *ngIf="!isLoading">Access Admin Panel</span>
                            <span *ngIf="isLoading">Verifying Credentials...</span>
                        </button>
                    </form>

                    <!-- Security Notice -->
                    <div class="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                        <p class="text-xs text-amber-800 font-medium">
                            <lucide-icon [img]="Shield" class="w-3 h-3 inline mr-1"></lucide-icon>
                            This portal is for authorized administrators only. All access attempts are logged and monitored.
                        </p>
                    </div>

                    <!-- Back to Home -->
                    <div class="mt-6 text-center">
                        <button
                            type="button"
                            (click)="goToHome()"
                            class="text-sm text-slate-600 hover:text-slate-900 font-medium"
                        >
                            ← Back to Home
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
export class AdminLoginComponent {
    email = '';
    password = '';
    isLoading = false;
    errorMessage = '';

    readonly Shield = Shield;
    readonly Lock = Lock;
    readonly Mail = Mail;

    constructor(
        private appService: AppService,
        private router: Router
    ) {}

    async handleLogin(event: Event) {
        event.preventDefault();
        this.errorMessage = '';
        this.isLoading = true;

        try {
            // Use the appService login which will handle authentication
            const success = await this.appService.login(this.email, this.password);
            
            if (success) {
                // The login method already navigates, so we just need to verify it was admin
                const currentUser = this.appService.currentUser;
                console.log('Admin login - current user:', currentUser);
                
                if (currentUser?.role !== UserRole.ADMIN) {
                    this.errorMessage = 'Access denied. Admin credentials required.';
                    this.appService.logout();
                }
                // If admin, the appService.login() already navigated to /admin
            } else {
                this.errorMessage = 'Invalid admin credentials';
            }
        } catch (error: any) {
            console.error('Admin login error:', error);
            this.errorMessage = error.message || 'Login failed. Please try again.';
        } finally {
            this.isLoading = false;
        }
    }

    goToHome() {
        this.router.navigate(['/']);
    }
}
