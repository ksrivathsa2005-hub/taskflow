import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AppService } from '../../app.service';
import { ToastService } from '../../services/toast.service';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterLink],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <div class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
            <div class="w-full max-w-md">
                <!-- Logo/Brand -->
                <div class="text-center mb-8">
                    <h1 class="text-4xl font-bold text-gray-900 mb-2">TaskFlow</h1>
                    <p class="text-gray-600">Sign in to your account</p>
                </div>

                <!-- Login Card -->
                <div class="bg-white rounded-2xl shadow-xl p-8">
                    <form (ngSubmit)="onSubmit()" #loginForm="ngForm">
                        <!-- Email -->
                        <div class="mb-6">
                            <label class="block text-sm font-semibold text-gray-700 mb-2">
                                Email Address
                            </label>
                            <input
                                type="email"
                                name="email"
                                [(ngModel)]="email"
                                required
                                email
                                class="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                                placeholder="you@example.com"
                                [disabled]="isLoading"
                            />
                        </div>

                        <!-- Password -->
                        <div class="mb-6">
                            <label class="block text-sm font-semibold text-gray-700 mb-2">
                                Password
                            </label>
                            <input
                                type="password"
                                name="password"
                                [(ngModel)]="password"
                                required
                                minlength="6"
                                class="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                                placeholder="••••••••"
                                [disabled]="isLoading"
                            />
                        </div>

                        <!-- Error Message -->
                        <div *ngIf="errorMessage" class="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p class="text-sm text-red-600">{{ errorMessage }}</p>
                        </div>

                        <!-- Submit Button -->
                        <button
                            type="submit"
                            [disabled]="!loginForm.form.valid || isLoading"
                            class="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-xl transition duration-200 shadow-lg hover:shadow-xl disabled:cursor-not-allowed"
                        >
                            <span *ngIf="!isLoading">Sign In</span>
                            <span *ngIf="isLoading" class="flex items-center justify-center">
                                <svg class="animate-spin h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Signing in...
                            </span>
                        </button>
                    </form>

                    <!-- Divider -->
                    <div class="my-6 flex items-center">
                        <div class="flex-1 border-t border-gray-300"></div>
                        <span class="px-4 text-sm text-gray-500">or</span>
                        <div class="flex-1 border-t border-gray-300"></div>
                    </div>

                    <!-- Register Link -->
                    <div class="text-center">
                        <p class="text-gray-600">
                            Don't have an account?
                            <a routerLink="/register" class="text-blue-600 hover:text-blue-700 font-semibold">
                                Sign up
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
export class LoginComponent {
    private appService = inject(AppService);
    private toastService = inject(ToastService);
    private router = inject(Router);

    email = '';
    password = '';
    role: 'CUSTOMER' = 'CUSTOMER';
    isLoading = false;
    errorMessage = '';

    onSubmit() {
        if (!this.email || !this.password) {
            this.errorMessage = 'Please fill in all required fields';
            return;
        }

        this.isLoading = true;
        this.errorMessage = '';

        this.appService.login(this.email, this.password).subscribe({
            next: (response) => {
                setTimeout(() => {
                    this.isLoading = false;
                    this.toastService.success('Welcome back!');
                }, 0);
            },
            error: (error) => {
                setTimeout(() => {
                    this.isLoading = false;
                    this.errorMessage = error.message || 'Invalid email or password';
                    this.toastService.error(this.errorMessage);
                }, 0);
            }
        });
    }
}
