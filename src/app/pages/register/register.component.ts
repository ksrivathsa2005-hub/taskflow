import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AppService } from '../../app.service';
import { ToastService } from '../../services/toast.service';

@Component({
    selector: 'app-register',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterLink],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <div class="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center p-4">
            <div class="w-full max-w-md">
                <!-- Logo/Brand -->
                <div class="text-center mb-8">
                    <h1 class="text-4xl font-bold text-gray-900 mb-2">TaskFlow</h1>
                    <p class="text-gray-600">Create your account</p>
                </div>

                <!-- Register Card -->
                <div class="bg-white rounded-2xl shadow-xl p-8">
                    <form (ngSubmit)="onSubmit()" #registerForm="ngForm">
                        <!-- Name -->
                        <div class="mb-4">
                            <label class="block text-sm font-semibold text-gray-700 mb-2">
                                Full Name
                            </label>
                            <input
                                type="text"
                                name="name"
                                [(ngModel)]="name"
                                required
                                minlength="2"
                                class="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition"
                                placeholder="John Doe"
                                [disabled]="isLoading"
                            />
                        </div>

                        <!-- Email -->
                        <div class="mb-4">
                            <label class="block text-sm font-semibold text-gray-700 mb-2">
                                Email Address
                            </label>
                            <input
                                type="email"
                                name="email"
                                [(ngModel)]="email"
                                required
                                email
                                class="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition"
                                placeholder="you@example.com"
                                [disabled]="isLoading"
                            />
                        </div>

                        <!-- Phone (Optional) -->
                        <div class="mb-4">
                            <label class="block text-sm font-semibold text-gray-700 mb-2">
                                Phone Number (Optional)
                            </label>
                            <input
                                type="tel"
                                name="phone"
                                [(ngModel)]="phone"
                                class="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition"
                                placeholder="+1-555-0100"
                                [disabled]="isLoading"
                            />
                        </div>

                        <!-- Password -->
                        <div class="mb-4">
                            <label class="block text-sm font-semibold text-gray-700 mb-2">
                                Password
                            </label>
                            <input
                                type="password"
                                name="password"
                                [(ngModel)]="password"
                                required
                                minlength="6"
                                class="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition"
                                placeholder="••••••••"
                                [disabled]="isLoading"
                            />
                            <p class="text-xs text-gray-500 mt-1">At least 6 characters</p>
                        </div>

                        <!-- Role Selection -->
                        <div class="mb-6 hidden">
                            <input
                                type="hidden"
                                name="role"
                                value="0"
                                [(ngModel)]="role"
                                required
                            />
                        </div>

                        <!-- Error Message -->
                        <div *ngIf="errorMessage" class="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p class="text-sm text-red-600">{{ errorMessage }}</p>
                        </div>

                        <!-- Submit Button -->
                        <button
                            type="submit"
                            [disabled]="!registerForm.form.valid || isLoading"
                            class="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-xl transition duration-200 shadow-lg hover:shadow-xl disabled:cursor-not-allowed"
                        >
                            <span *ngIf="!isLoading">Create Account</span>
                            <span *ngIf="isLoading" class="flex items-center justify-center">
                                <svg class="animate-spin h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Creating account...
                            </span>
                        </button>
                    </form>

                    <!-- Divider -->
                    <div class="my-6 flex items-center">
                        <div class="flex-1 border-t border-gray-300"></div>
                        <span class="px-4 text-sm text-gray-500">or</span>
                        <div class="flex-1 border-t border-gray-300"></div>
                    </div>

                    <!-- Login Link -->
                    <div class="text-center">
                        <p class="text-gray-600">
                            Already have an account?
                            <a routerLink="/login" class="text-purple-600 hover:text-purple-700 font-semibold">
                                Sign in
                            </a>
                        </p>
                    </div>
                </div>

                <!-- Back to Landing -->
                <div class="text-center mt-6">
                    <a routerLink="/" class="text-gray-600 hover:text-gray-900">
                        ← Back to Home
                    </a>
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
export class RegisterComponent {
    private appService = inject(AppService);
    private toastService = inject(ToastService);
    private router = inject(Router);

    name = '';
    email = '';
    phone = '';
    password = '';
    role: number = 0;  // 0 = CUSTOMER, 1 = WORKER, 2 = ADMIN
    isLoading = false;
    errorMessage = '';

    onSubmit() {
        if (!this.name || !this.email || !this.password) {
            this.errorMessage = 'Please fill in all required fields';
            return;
        }

        this.isLoading = true;
        this.errorMessage = '';

        this.appService.register(
            this.name,
            this.email,
            this.password,
            'CUSTOMER',  // Always register as CUSTOMER since role 0
            this.phone || undefined
        ).subscribe({
            next: (response) => {
                setTimeout(() => {
                    this.isLoading = false;
                    this.toastService.success('Account created successfully!');
                }, 0);
            },
            error: (error) => {
                setTimeout(() => {
                    this.isLoading = false;
                    this.errorMessage = error.message || 'Failed to create account';
                    this.toastService.error(this.errorMessage);
                }, 0);
            }
        });
    }
}
