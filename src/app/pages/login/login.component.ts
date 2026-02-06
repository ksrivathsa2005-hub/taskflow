import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AppService } from '../../app.service';
import { UserRole } from '../../types';
import { LucideAngularModule, LogIn, UserPlus, AlertCircle, Loader2 } from 'lucide-angular';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 flex items-center justify-center p-6">
      <div class="max-w-lg w-full">
        <!-- Card -->
        <div class="bg-white rounded-[2.5rem] shadow-2xl shadow-indigo-100 p-10 md:p-12 border border-slate-100">
          <!-- Logo/Header -->
          <div class="text-center mb-10">
            <div class="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-2xl mb-6 shadow-lg shadow-indigo-200">
                <lucide-icon [img]="LogIn" class="w-8 h-8 text-white"></lucide-icon>
            </div>
            <h1 class="text-4xl font-black text-slate-900 mb-3 tracking-tight">TaskFlow</h1>
            <p class="text-slate-500 font-medium text-lg">{{ isRegisterMode ? 'Create your account' : 'Welcome back' }}</p>
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
          <form (ngSubmit)="handleSubmit()" #authForm="ngForm">
            <!-- Name Field (Register Only) -->
            <div *ngIf="isRegisterMode" class="mb-6">
              <label class="block text-sm font-bold text-slate-700 mb-2">Full Name</label>
              <input
                type="text"
                name="name"
                [(ngModel)]="formData.name"
                required
                minlength="3"
                maxlength="50"
                pattern="^[a-zA-Z\s]+$"
                #nameField="ngModel"
                class="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100 outline-none transition-all font-medium"
                [class.border-red-500]="nameField.invalid && nameField.touched"
                placeholder="Enter your full name"
              />
              <p *ngIf="nameField.invalid && nameField.touched" class="mt-2 text-xs text-red-600 font-bold">
                <span *ngIf="nameField.errors?.['required']">Name is required</span>
                <span *ngIf="nameField.errors?.['minlength']">Name must be at least 3 characters</span>
                <span *ngIf="nameField.errors?.['pattern']">Name can only contain letters and spaces</span>
              </p>
            </div>

            <!-- Email Field -->
            <div class="mb-6">
              <label class="block text-sm font-bold text-slate-700 mb-2">Email Address</label>
              <input
                type="email"
                name="email"
                [(ngModel)]="formData.email"
                required
                email
                pattern="^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
                #emailField="ngModel"
                class="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100 outline-none transition-all font-medium"
                [class.border-red-500]="emailField.invalid && emailField.touched"
                placeholder="Enter your email"
              />
              <p *ngIf="emailField.invalid && emailField.touched" class="mt-2 text-xs text-red-600 font-bold">
                <span *ngIf="emailField.errors?.['required']">Email is required</span>
                <span *ngIf="emailField.errors?.['email'] || emailField.errors?.['pattern']">Please enter a valid email address</span>
              </p>
            </div>

            <!-- Password Field -->
            <div class="mb-6">
              <label class="block text-sm font-bold text-slate-700 mb-2">Password</label>
              <input
                type="password"
                name="password"
                [(ngModel)]="formData.password"
                required
                minlength="6"
                maxlength="50"
                #passwordField="ngModel"
                class="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100 outline-none transition-all font-medium"
                [class.border-red-500]="passwordField.invalid && passwordField.touched"
                placeholder="Enter your password"
              />
              <p *ngIf="isRegisterMode && !passwordField.touched" class="mt-2 text-xs text-slate-500 font-medium italic">Minimum 6 characters</p>
              <p *ngIf="passwordField.invalid && passwordField.touched" class="mt-2 text-xs text-red-600 font-bold">
                <span *ngIf="passwordField.errors?.['required']">Password is required</span>
                <span *ngIf="passwordField.errors?.['minlength']">Password must be at least 6 characters</span>
              </p>
            </div>

            <!-- Role Selection (Register Only) -->
            <div *ngIf="isRegisterMode" class="mb-10">
              <label class="block text-sm font-bold text-slate-700 mb-3">I want to</label>
              <div class="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  (click)="formData.role = UserRole.CUSTOMER"
                  [class.border-indigo-600]="formData.role === UserRole.CUSTOMER"
                  [class.bg-indigo-50]="formData.role === UserRole.CUSTOMER"
                  class="p-5 border-2 border-slate-100 rounded-[1.5rem] hover:border-indigo-300 transition-all text-left group"
                >
                  <p class="font-black text-slate-900 group-hover:text-indigo-600 transition-colors">Hire</p>
                  <p class="text-xs text-slate-500 mt-1 font-medium">Find service providers</p>
                </button>
                <button
                  type="button"
                  (click)="formData.role = UserRole.WORKER"
                  [class.border-indigo-600]="formData.role === UserRole.WORKER"
                  [class.bg-indigo-50]="formData.role === UserRole.WORKER"
                  class="p-5 border-2 border-slate-100 rounded-[1.5rem] hover:border-indigo-300 transition-all text-left group"
                >
                  <p class="font-black text-slate-900 group-hover:text-indigo-600 transition-colors">Work</p>
                  <p class="text-xs text-slate-500 mt-1 font-medium">Provide services</p>
                </button>
              </div>
            </div>

            <!-- Submit Button -->
            <button
              type="submit"
              [disabled]="isLoading || !authForm.valid"
              class="w-full py-4 px-6 bg-slate-900 hover:bg-black text-white font-black rounded-2xl transition-all disabled:bg-slate-300 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-xl hover:shadow-2xl active:scale-[0.98]"
            >
              <lucide-icon *ngIf="isLoading" [img]="Loader2" class="w-6 h-6 animate-spin"></lucide-icon>
              <lucide-icon *ngIf="!isLoading && !isRegisterMode" [img]="LogIn" class="w-6 h-6"></lucide-icon>
              <lucide-icon *ngIf="!isLoading && isRegisterMode" [img]="UserPlus" class="w-6 h-6"></lucide-icon>
              <span class="text-lg">{{ isLoading ? 'Processing...' : (isRegisterMode ? 'Create Account' : 'Sign In') }}</span>
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
            class="text-sm text-gray-600 hover:text-gray-900"
          >
            ← Back to home
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

  isRegisterMode = false;
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
