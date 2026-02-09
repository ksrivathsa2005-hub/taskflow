import { Component, OnInit, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AppService } from '../../app.service';
import { UserRole } from '../../types';
import { LucideAngularModule, LogIn, UserPlus, AlertCircle, Loader2, Eye, EyeOff, ArrowLeft, Shield, Zap, Users } from 'lucide-angular';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  template: `
    <div class="min-h-screen flex">
      <!-- Left Panel — Hero Illustration -->
      <div class="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800">
        <!-- Decorative Elements -->
        <div class="absolute inset-0 bg-grid opacity-10"></div>
        <div class="absolute -top-40 -right-40 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-float-slow"></div>
        <div class="absolute -bottom-32 -left-32 w-80 h-80 bg-cyan-400/20 rounded-full blur-3xl animate-float-reverse"></div>
        <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/5 rounded-full blur-3xl"></div>

        <!-- Floating Particles -->
        <div class="particle particle-1 absolute top-[15%] left-[20%]"></div>
        <div class="particle particle-2 absolute top-[45%] left-[70%]"></div>
        <div class="particle particle-3 absolute top-[75%] left-[30%]"></div>
        <div class="particle particle-1 absolute top-[25%] left-[80%]"></div>
        <div class="particle particle-2 absolute top-[60%] left-[15%]"></div>

        <!-- Content -->
        <div class="relative z-10 flex flex-col justify-between p-12 xl:p-16 w-full" #heroPanel>
          <!-- Logo -->
          <div>
            <h2 class="text-2xl font-black text-white tracking-tight">TaskFlow</h2>
          </div>

          <!-- Center Message -->
          <div class="space-y-8 login-hero-text">
            <h1 class="text-5xl xl:text-6xl font-black text-white leading-tight">
              {{ isRegisterMode ? 'Start your journey today.' : 'Welcome back to excellence.' }}
            </h1>
            <p class="text-indigo-200 text-lg font-medium max-w-md leading-relaxed">
              {{ isRegisterMode 
                ? 'Join thousands of professionals and customers connecting on India\'s most trusted service marketplace.' 
                : 'Your projects and connections are waiting. Sign in to continue where you left off.' }}
            </p>

            <!-- Trust Indicators -->
            <div class="flex items-center gap-8 pt-4">
              <div class="flex items-center gap-2 text-indigo-200">
                <div class="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                  <lucide-icon [img]="Shield" class="w-5 h-5 text-white"></lucide-icon>
                </div>
                <span class="text-sm font-bold">Verified Pros</span>
              </div>
              <div class="flex items-center gap-2 text-indigo-200">
                <div class="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                  <lucide-icon [img]="Zap" class="w-5 h-5 text-white"></lucide-icon>
                </div>
                <span class="text-sm font-bold">Instant Match</span>
              </div>
              <div class="flex items-center gap-2 text-indigo-200">
                <div class="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                  <lucide-icon [img]="Users" class="w-5 h-5 text-white"></lucide-icon>
                </div>
                <span class="text-sm font-bold">10K+ Users</span>
              </div>
            </div>
          </div>

          <!-- Testimonial -->
          <div class="glass rounded-2xl p-6 max-w-md">
            <p class="text-white/90 text-sm font-medium italic leading-relaxed">"TaskFlow transformed how I find clients. Within a week, I had more bookings than the entire previous month."</p>
            <div class="flex items-center gap-3 mt-4">
              <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face" alt="User" class="w-10 h-10 rounded-full object-cover border-2 border-white/30" />
              <div>
                <p class="text-white font-bold text-sm">Rajesh Kumar</p>
                <p class="text-indigo-300 text-xs font-medium">Electrician — Mumbai</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Panel — Form -->
      <div class="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-10 bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 relative">
        <!-- Back to Home -->
        <button (click)="goToLanding()"
          class="absolute top-6 left-6 flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 font-medium transition-colors group">
          <lucide-icon [img]="ArrowLeft" class="w-4 h-4 group-hover:-translate-x-1 transition-transform"></lucide-icon>
          Back to home
        </button>

        <div class="w-full max-w-md animate-fade-up" #formPanel>
          <!-- Header -->
          <div class="mb-8">
            <div class="lg:hidden mb-6">
              <h2 class="text-xl font-black text-indigo-600">TaskFlow</h2>
            </div>
            <h1 class="text-3xl font-black text-slate-900 mb-2">
              {{ isRegisterMode ? 'Create your account' : 'Sign in' }}
            </h1>
            <p class="text-slate-500 font-medium">
              {{ isRegisterMode ? 'Get started in under 2 minutes' : 'Enter your credentials to continue' }}
            </p>
          </div>

          <!-- Error Alert -->
          @if (errorMessage) {
            <div class="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 animate-scale-in">
              <lucide-icon [img]="AlertCircle" class="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5"></lucide-icon>
              <p class="text-sm font-medium text-red-800 flex-1">{{ errorMessage }}</p>
              <button (click)="errorMessage = null" class="text-red-400 hover:text-red-600 transition-colors">
                <span class="text-lg leading-none">&times;</span>
              </button>
            </div>
          }

          <!-- Success Alert -->
          @if (successMessage) {
            <div class="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl animate-scale-in">
              <p class="text-sm font-medium text-emerald-800">{{ successMessage }}</p>
            </div>
          }

          <!-- Form -->
          <form (ngSubmit)="handleSubmit()" #authForm="ngForm" class="space-y-5">
            <!-- Name Field (Register) -->
            @if (isRegisterMode) {
              <div>
                <label class="block text-sm font-bold text-slate-700 mb-1.5">Full Name</label>
                <input
                  type="text" name="name" [(ngModel)]="formData.name"
                  required minlength="3" maxlength="50" pattern="^[a-zA-Z\s]+$"
                  #nameField="ngModel"
                  class="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all font-medium"
                  [class.border-red-400]="nameField.invalid && nameField.touched"
                  [class.focus:ring-red-100]="nameField.invalid && nameField.touched"
                  placeholder="John Doe"
                />
                @if (nameField.invalid && nameField.touched) {
                  <p class="mt-1.5 text-xs text-red-600 font-medium">
                    @if (nameField.errors?.['required']) { Name is required }
                    @if (nameField.errors?.['minlength']) { Name must be at least 3 characters }
                    @if (nameField.errors?.['pattern']) { Name can only contain letters and spaces }
                  </p>
                }
              </div>
            }

            <!-- Email -->
            <div>
              <label class="block text-sm font-bold text-slate-700 mb-1.5">Email Address</label>
              <input
                type="email" name="email" [(ngModel)]="formData.email"
                required email pattern="^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
                #emailField="ngModel"
                class="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all font-medium"
                [class.border-red-400]="emailField.invalid && emailField.touched"
                placeholder="you@example.com"
              />
              @if (emailField.invalid && emailField.touched) {
                <p class="mt-1.5 text-xs text-red-600 font-medium">
                  @if (emailField.errors?.['required']) { Email is required }
                  @if (emailField.errors?.['email'] || emailField.errors?.['pattern']) { Please enter a valid email }
                </p>
              }
            </div>

            <!-- Password -->
            <div>
              <label class="block text-sm font-bold text-slate-700 mb-1.5">Password</label>
              <div class="relative">
                <input
                  [type]="showPassword ? 'text' : 'password'"
                  name="password" [(ngModel)]="formData.password"
                  required minlength="6" maxlength="50"
                  #passwordField="ngModel"
                  class="w-full px-4 py-3 pr-12 bg-white border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all font-medium"
                  [class.border-red-400]="passwordField.invalid && passwordField.touched"
                  placeholder="••••••••"
                />
                <button type="button" (click)="showPassword = !showPassword"
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1">
                  <lucide-icon [img]="showPassword ? EyeOff : Eye" class="w-5 h-5"></lucide-icon>
                </button>
              </div>
              @if (isRegisterMode && !passwordField.touched) {
                <p class="mt-1.5 text-xs text-slate-400 font-medium">Minimum 6 characters</p>
              }
              @if (passwordField.invalid && passwordField.touched) {
                <p class="mt-1.5 text-xs text-red-600 font-medium">
                  @if (passwordField.errors?.['required']) { Password is required }
                  @if (passwordField.errors?.['minlength']) { Password must be at least 6 characters }
                </p>
              }
            </div>

            <!-- Role Selection (Register) -->
            @if (isRegisterMode) {
              <div>
                <label class="block text-sm font-bold text-slate-700 mb-2">I want to</label>
                <div class="grid grid-cols-2 gap-3">
                  <button type="button" (click)="formData.role = UserRole.CUSTOMER"
                    class="p-4 rounded-xl border-2 transition-all duration-200 text-left group"
                    [class]="formData.role === UserRole.CUSTOMER
                      ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-200 shadow-md'
                      : 'border-slate-200 bg-white hover:border-indigo-300 hover:bg-indigo-50/50'">
                    <div class="text-2xl mb-2">🏠</div>
                    <p class="font-bold text-slate-900">Hire</p>
                    <p class="text-xs text-slate-500 mt-1">Find service providers</p>
                  </button>
                  <button type="button" (click)="formData.role = UserRole.WORKER"
                    class="p-4 rounded-xl border-2 transition-all duration-200 text-left group"
                    [class]="formData.role === UserRole.WORKER
                      ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-200 shadow-md'
                      : 'border-slate-200 bg-white hover:border-indigo-300 hover:bg-indigo-50/50'">
                    <div class="text-2xl mb-2">🔧</div>
                    <p class="font-bold text-slate-900">Work</p>
                    <p class="text-xs text-slate-500 mt-1">Provide services</p>
                  </button>
                </div>
              </div>
            }

            <!-- Submit -->
            <button type="submit" [disabled]="isLoading || !authForm.valid"
              class="w-full py-3.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all duration-200 disabled:bg-slate-300 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-indigo-200 hover:shadow-xl hover:shadow-indigo-300 active:scale-[0.98] btn-glow">
              @if (isLoading) {
                <lucide-icon [img]="Loader2" class="w-5 h-5 animate-spin"></lucide-icon>
              } @else if (!isRegisterMode) {
                <lucide-icon [img]="LogIn" class="w-5 h-5"></lucide-icon>
              } @else {
                <lucide-icon [img]="UserPlus" class="w-5 h-5"></lucide-icon>
              }
              <span>{{ isLoading ? 'Please wait...' : (isRegisterMode ? 'Create Account' : 'Sign In') }}</span>
            </button>
          </form>

          <!-- Divider -->
          <div class="flex items-center gap-3 my-6">
            <div class="flex-1 h-px bg-slate-200"></div>
            <span class="text-xs text-slate-400 font-bold uppercase tracking-wider">or</span>
            <div class="flex-1 h-px bg-slate-200"></div>
          </div>

          <!-- Toggle Mode -->
          <div class="text-center">
            <button (click)="toggleMode()"
              class="text-sm text-slate-600 hover:text-indigo-600 font-medium transition-colors">
              {{ isRegisterMode ? 'Already have an account?' : "Don't have an account?" }}
              <span class="font-bold text-indigo-600 ml-1">{{ isRegisterMode ? 'Sign in' : 'Sign up' }}</span>
            </button>
          </div>

          <!-- Footer Note -->
          <p class="text-center text-xs text-slate-400 mt-8">
            By continuing, you agree to TaskFlow's Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
    .login-hero-text {
      animation: fade-up 0.8s ease-out both;
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
  readonly Shield = Shield;
  readonly Zap = Zap;
  readonly Users = Users;

  isRegisterMode = false;
  isLoading = false;
  showPassword = false;
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
