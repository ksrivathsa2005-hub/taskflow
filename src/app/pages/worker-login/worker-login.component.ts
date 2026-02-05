import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AppService } from '../../app.service';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { UserRole } from '../../types';

@Component({
    selector: 'app-worker-login',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterLink],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <div class="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 flex items-center justify-center p-4">
            <div class="w-full max-w-md">
                <div class="text-center mb-8">
                    <h1 class="text-4xl font-bold text-gray-900 mb-2">TaskFlow</h1>
                    <p class="text-gray-600">Worker sign in</p>
                </div>

                <div class="bg-white rounded-2xl shadow-xl p-8">
                    <form (ngSubmit)="onSubmit()" #loginForm="ngForm">
                        <div class="mb-6">
                            <label class="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                            <input
                                type="email"
                                name="email"
                                [(ngModel)]="email"
                                required
                                email
                                class="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition"
                                placeholder="you@example.com"
                                [disabled]="isLoading"
                            />
                        </div>

                        <div class="mb-6">
                            <label class="block text-sm font-semibold text-gray-700 mb-2">Password</label>
                            <input
                                type="password"
                                name="password"
                                [(ngModel)]="password"
                                required
                                minlength="6"
                                class="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition"
                                placeholder="••••••••"
                                [disabled]="isLoading"
                            />
                        </div>

                        @if (errorMessage) {
                            <div class="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                                <p class="text-sm text-red-600">{{ errorMessage }}</p>
                            </div>
                        }

                        <button
                            type="submit"
                            [disabled]="!loginForm.form.valid || isLoading"
                            class="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-xl transition duration-200 shadow-lg hover:shadow-xl disabled:cursor-not-allowed"
                        >
                            @if (!isLoading) {<span>Sign In as Worker</span>}
                            @if (isLoading) {
                                <span class="flex items-center justify-center">
                                    <svg class="animate-spin h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Signing in...
                                </span>
                            }
                        </button>
                    </form>

                    <div class="my-6 flex items-center">
                        <div class="flex-1 border-t border-gray-300"></div>
                        <span class="px-4 text-sm text-gray-500">or</span>
                        <div class="flex-1 border-t border-gray-300"></div>
                    </div>

                    <div class="text-center">
                        <p class="text-gray-600">
                            New worker?
                            <a routerLink="/worker/register" class="text-indigo-600 hover:text-indigo-700 font-semibold">Create a worker account</a>
                        </p>
                    </div>
                </div>

                <div class="text-center mt-6">
                    <a routerLink="/" class="text-gray-600 hover:text-gray-900">← Back to Home</a>
                </div>
            </div>
        </div>
    `
})
export class WorkerLoginComponent {
    private appService = inject(AppService);
    private authService = inject(AuthService);
    private toastService = inject(ToastService);

    email = '';
    password = '';
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
                if (response.user.role !== UserRole.WORKER) {
                    this.authService.logout().subscribe();
                    this.errorMessage = 'This account is not a worker account.';
                    this.toastService.error(this.errorMessage);
                    this.isLoading = false;
                    return;
                }

                this.isLoading = false;
                this.toastService.success('Welcome back!');
            },
            error: (error) => {
                this.isLoading = false;
                this.errorMessage = error.message || 'Invalid email or password';
                this.toastService.error(this.errorMessage);
            }
        });
    }
}
