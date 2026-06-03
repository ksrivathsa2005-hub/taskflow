import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AppService } from '../../app.service';
import { UserRole } from '../../types';
import {
  LucideAngularModule,
  LogIn,
  UserPlus,
  AlertCircle,
  Loader2,
  Eye,
  EyeOff,
  ArrowLeft,
} from 'lucide-angular';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div class="max-w-md w-full">
        <!-- Card -->
        <div class="bg-white rounded-2xl shadow-xl p-8">
          <!-- Logo/Header -->
          <div class="text-center mb-8">
            <h1 class="text-3xl font-bold text-gray-900 mb-2">TaskFlow</h1>
            <p class="text-gray-600">{{ isRegisterMode ? 'Create your account' : 'Welcome back' }}</p>
          </div>

          <!-- Error Alert -->
          <div *ngIf="errorMessage" class="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <lucide-icon [img]="AlertCircle" class="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5"></lucide-icon>
            <div class="flex-1">
              <p class="text-sm font-medium text-red-800">{{ errorMessage }}</p>
            </div>
            <button (click)="errorMessage = null" class="text-red-600 hover:text-red-800">
              <span class="text-xl">&times;</span>
            </button>
          </div>

          <!-- Success Alert -->
          <div *ngIf="successMessage" class="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p class="text-sm font-medium text-green-800">{{ successMessage }}</p>
          </div>

          <!-- Login/Register Form -->
          <form (ngSubmit)="handleSubmit()" #authForm="ngForm" novalidate>
            <!-- Name Field (Register Only) -->
            <div *ngIf="isRegisterMode" class="mb-4">
              <label for="fullName" class="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
              <input
                id="fullName"
                type="text"
                name="name"
                [(ngModel)]="formData.name"
                required
                minlength="3"
                maxlength="50"
                pattern="^[a-zA-Z\s]+$"
                #nameField="ngModel"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                [class.border-red-500]="nameField.invalid && nameField.touched"
                [attr.aria-invalid]="nameField.invalid && nameField.touched"
                [attr.aria-describedby]="nameField.invalid && nameField.touched ? 'name-error' : null"
                placeholder="Enter your full name"
              />
              <p *ngIf="nameField.invalid && nameField.touched" id="name-error" class="mt-1 text-xs text-red-600">
                <span *ngIf="nameField.errors?.['required']">Name is required</span>
                <span *ngIf="nameField.errors?.['minlength']">Name must be at least 3 characters</span>
                <span *ngIf="nameField.errors?.['pattern']">Name can only contain letters and spaces</span>
              </p>
            </div>

            <!-- Email Field -->
            <div class="mb-4">
              <label for="email" class="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
              <input
                id="email"
                type="email"
                name="email"
                [(ngModel)]="formData.email"
                required
                email
                pattern="^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
                #emailField="ngModel"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                [class.border-red-500]="emailField.invalid && emailField.touched"
                [attr.aria-invalid]="emailField.invalid && emailField.touched"
                [attr.aria-describedby]="emailField.invalid && emailField.touched ? 'email-error' : null"
                placeholder="Enter your email"
              />
              <p *ngIf="emailField.invalid && emailField.touched" id="email-error" class="mt-1 text-xs text-red-600">
                <span *ngIf="emailField.errors?.['required']">Email is required</span>
                <span *ngIf="emailField.errors?.['email'] || emailField.errors?.['pattern']">Please enter a valid email address</span>
              </p>
            </div>

            <!-- Password Field -->
            <div class="mb-4">
              <label for="password" class="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <div class="relative">
                <input
                  id="password"
                  [type]="showPassword ? 'text' : 'password'"
                  name="password"
                  [(ngModel)]="formData.password"
                  required
                  minlength="6"
                  maxlength="50"
                  #passwordField="ngModel"
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent pr-12"
                  [class.border-red-500]="passwordField.invalid && passwordField.touched"
                  [attr.aria-invalid]="passwordField.invalid && passwordField.touched"
                  [attr.aria-describedby]="(passwordField.invalid && passwordField.touched) ? 'password-error' : (isRegisterMode && !passwordField.touched ? 'password-hint' : null)"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  (click)="showPassword = !showPassword"
                  class="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-md transition-colors"
                  [attr.aria-label]="showPassword ? 'Hide password' : 'Show password'"
                >
                  <lucide-icon [img]="showPassword ? EyeOff : Eye" class="w-5 h-5"></lucide-icon>
                </button>
              </div>
              <p *ngIf="isRegisterMode && !passwordField.touched" id="password-hint" class="mt-1 text-xs text-gray-500">Minimum 6 characters</p>
              <p *ngIf="passwordField.invalid && passwordField.touched" id="password-error" class="mt-1 text-xs text-red-600">
                <span *ngIf="passwordField.errors?.['required']">Password is required</span>
                <span *ngIf="passwordField.errors?.['minlength']">Password must be at least 6 characters</span>
              </p>
            </div>

            <!-- Role Selection (Register Only) -->
            <div *ngIf="isRegisterMode" class="mb-6">
              <label class="block text-sm font-medium text-gray-700 mb-2">I want to</label>
              <div class="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  (click)="formData.role = UserRole.CUSTOMER"
                  [class.ring-2]="formData.role === UserRole.CUSTOMER"
                  [class.ring-indigo-600]="formData.role === UserRole.CUSTOMER"
                  [class.bg-indigo-50]="formData.role === UserRole.CUSTOMER"
                  class="p-4 border-2 border-gray-200 rounded-lg hover:border-indigo-300 transition-all"
                >
                  <p class="font-semibold text-gray-900">Hire</p>
                  <p class="text-xs text-gray-600 mt-1">Find service providers</p>
                </button>
                <button
                  type="button"
                  (click)="formData.role = UserRole.WORKER"
                  [class.ring-2]="formData.role === UserRole.WORKER"
                  [class.ring-indigo-600]="formData.role === UserRole.WORKER"
                  [class.bg-indigo-50]="formData.role === UserRole.WORKER"
                  class="p-4 border-2 border-gray-200 rounded-lg hover:border-indigo-300 transition-all"
                >
                  <p class="font-semibold text-gray-900">Work</p>
                  <p class="text-xs text-gray-600 mt-1">Provide services</p>
                </button>
              </div>
            </div>

            <!-- Submit Button -->
            <button
              type="submit"
              [disabled]="isLoading || !authForm.valid"
              class="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <lucide-icon *ngIf="isLoading" [img]="Loader2" class="w-5 h-5 animate-spin"></lucide-icon>
              <lucide-icon *ngIf="!isLoading && !isRegisterMode" [img]="LogIn" class="w-5 h-5"></lucide-icon>
              <lucide-icon *ngIf="!isLoading && isRegisterMode" [img]="UserPlus" class="w-5 h-5"></lucide-icon>
              <span>{{ isLoading ? 'Please wait...' : (isRegisterMode ? 'Create Account' : 'Sign In') }}</span>
            </button>
          </form>

          <!-- Toggle Mode -->
          <div class="mt-6 text-center">
            <button
              (click)="toggleMode()"
              class="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
            >
              {{ isRegisterMode ? 'Already have an account? Sign in' : "Don't have an account? Sign up" }}
            </button>
          </div>
        </div>

        <!-- Back to Home -->
        <div class="mt-6 text-center">
          <button
            (click)="goToLanding()"
            class="text-sm text-gray-600 hover:text-gray-900 inline-flex items-center gap-2 group"
          >
            <lucide-icon [img]="ArrowLeft" class="w-4 h-4 transition-transform group-hover:-translate-x-1"></lucide-icon>
            Back to home
          </button>
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
export class LoginComponent implements OnInit {
  readonly UserRole = UserRole;
  readonly LogIn = LogIn;
  readonly UserPlus = UserPlus;
  readonly AlertCircle = AlertCircle;
  readonly Loader2 = Loader2;
  readonly Eye = Eye;
  readonly EyeOff = EyeOff;
  readonly ArrowLeft = ArrowLeft;

  isRegisterMode = false;
  showPassword = false;
  isLoading = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  formData = {
    name: '',
    email: '',
    password: '',
    role: UserRole.CUSTOMER
  };

  constructor(
    private appService: AppService,
    private router: Router
  ) {}

  ngOnInit() {
    // Check if user is already logged in
    if (this.appService.currentUser) {
      this.navigateBasedOnRole(this.appService.currentUser.role);
    }
  }

  async handleSubmit() {
    this.errorMessage = null;
    this.successMessage = null;
    this.isLoading = true;

    // Use setTimeout to avoid ExpressionChangedAfterItHasBeenCheckedError
    setTimeout(async () => {
      try {
        if (this.isRegisterMode) {
          await this.handleRegister();
        } else {
          await this.handleLogin();
        }
      } catch (error: any) {
        console.error('Auth error:', error);
        this.errorMessage = error?.message || 'An error occurred. Please try again.';
      } finally {
        this.isLoading = false;
      }
    }, 0);
  }

  private async handleLogin() {
    const success = await this.appService.login(
      this.formData.email,
      this.formData.password
    );

    if (!success) {
      this.errorMessage = 'Invalid email or password. Please try again.';
      return;
    }
  }

  private async handleRegister() {
    const success = await this.appService.register(
      this.formData.name,
      this.formData.email,
      this.formData.password,
      this.formData.role
    );

    if (!success) {
      this.errorMessage = 'Registration failed. Please check your details and try again.';
    }
  }

  toggleMode() {
    this.isRegisterMode = !this.isRegisterMode;
    this.errorMessage = null;
    this.successMessage = null;
    this.showPassword = false;
    
    // Reset form
    this.formData = {
      name: '',
      email: '',
      password: '',
      role: UserRole.CUSTOMER
    };
  }

  goToLanding() {
    this.router.navigate(['/']);
  }

  private navigateBasedOnRole(role: UserRole) {
    const routes = {
      [UserRole.CUSTOMER]: '/customer',
      [UserRole.WORKER]: '/worker',
      [UserRole.ADMIN]: '/admin'
    };
    this.router.navigate([routes[role] || '/']);
  }
}
