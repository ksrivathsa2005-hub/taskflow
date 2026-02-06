import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AppService } from '../../app.service';
import { TaskFlowApiService } from '../../services/taskflow-api.service';
import { ToastService } from '../../services/toast.service';
import { LucideAngularModule, Save, ArrowLeft } from 'lucide-angular';

@Component({
  selector: 'app-customer-profile-update',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 py-12 px-4">
      <div class="max-w-2xl mx-auto">
        <!-- Header -->
        <div class="mb-8 flex items-center gap-4">
          <button 
            (click)="goBack()"
            class="flex items-center justify-center w-12 h-12 rounded-full bg-white shadow-lg hover:shadow-xl transition-shadow">
            <lucide-icon [img]="ArrowLeft" class="w-5 h-5 text-slate-600"></lucide-icon>
          </button>
          <div>
            <h1 class="text-3xl font-black text-slate-900">Update Profile</h1>
            <p class="text-slate-500 mt-1">Manage your account information</p>
          </div>
        </div>

        <!-- Main Card -->
        <div class="bg-white rounded-3xl shadow-xl p-8">
          <div *ngIf="isLoading" class="text-center py-12">
            <div class="inline-block">
              <div class="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
            </div>
            <p class="mt-4 text-slate-600 font-medium">Loading profile...</p>
          </div>

          <form (ngSubmit)="onSubmit()" [hidden]="isLoading">
            <!-- Basic Information Section -->
            <div class="mb-8">
              <h2 class="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
                <span class="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center text-sm font-bold">1</span>
                Basic Information
              </h2>

              <!-- Name -->
              <div class="mb-6">
                <label class="block text-sm font-semibold text-slate-700 mb-2">Full Name</label>
                <input 
                  type="text" 
                  [(ngModel)]="profileForm.name"
                  name="name"
                  class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                  placeholder="Your full name"
                />
              </div>

              <!-- Email (Read-only) -->
              <div class="mb-6">
                <label class="block text-sm font-semibold text-slate-700 mb-2">Email Address</label>
                <input 
                  type="email" 
                  [value]="currentUser?.email"
                  disabled
                  class="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-600 outline-none cursor-not-allowed"
                />
                <p class="text-xs text-slate-500 mt-2">Email cannot be changed</p>
              </div>

              <!-- Phone -->
              <div class="mb-6">
                <label class="block text-sm font-semibold text-slate-700 mb-2">Phone Number</label>
                <input 
                  type="tel" 
                  [(ngModel)]="profileForm.phone"
                  name="phone"
                  class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                  placeholder="+91 9876543210"
                />
              </div>

              <!-- Avatar URL -->
              <div class="mb-6">
                <label class="block text-sm font-semibold text-slate-700 mb-2">Profile Picture URL</label>
                <input 
                  type="url" 
                  [(ngModel)]="profileForm.avatar"
                  name="avatar"
                  class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                  placeholder="https://example.com/photo.jpg"
                />
              </div>
            </div>

            <!-- Account Summary -->
            <div class="mb-8 p-4 bg-indigo-50 rounded-xl border border-indigo-200">
              <p class="text-sm text-slate-700 mb-3 font-semibold">Account Summary</p>
              <div class="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p class="text-slate-500">Rating</p>
                  <p class="font-bold text-slate-900">{{ currentUser?.rating || 0 }}/5</p>
                </div>
                <div>
                  <p class="text-slate-500">Completed Tasks</p>
                  <p class="font-bold text-slate-900">{{ currentUser?.completedJobs || 0 }}</p>
                </div>
                <div>
                  <p class="text-slate-500">Account Status</p>
                  <p class="font-bold text-emerald-600">{{ currentUser?.status }}</p>
                </div>
                <div>
                  <p class="text-slate-500">Member Since</p>
                  <p class="font-bold text-slate-900">{{ (currentUser?.createdDate | date:'short') || 'N/A' }}</p>
                </div>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex gap-4">
              <button 
                type="button"
                (click)="goBack()"
                class="flex-1 px-6 py-3 border-2 border-slate-200 text-slate-900 font-bold rounded-xl hover:bg-slate-50 transition-all">
                Cancel
              </button>
              <button 
                type="submit"
                [disabled]="isSaving"
                class="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-lg shadow-indigo-200">
                <lucide-icon [img]="Save" class="w-5 h-5"></lucide-icon>
                {{ isSaving ? 'Saving...' : 'Save Changes' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class CustomerProfileUpdateComponent implements OnInit {
  currentUser: any = null;
  isLoading = false;
  isSaving = false;

  profileForm = {
    name: '',
    phone: '',
    avatar: ''
  };

  private appService = inject(AppService);
  private apiService = inject(TaskFlowApiService);
  private toastService = inject(ToastService);
  private router = inject(Router);

  readonly Save = Save;
  readonly ArrowLeft = ArrowLeft;

  ngOnInit() {
    this.currentUser = this.appService.currentUser;
    if (!this.currentUser) {
      this.router.navigate(['/login']);
      return;
    }

    this.loadProfileData();
  }

  private loadProfileData() {
    this.isLoading = true;
    const user = this.currentUser;

    this.profileForm = {
      name: user.name || '',
      phone: user.phone || '',
      avatar: user.avatar || ''
    };

    this.isLoading = false;
  }

  onSubmit() {
    if (this.isSaving) return;

    this.isSaving = true;

    const updateData = {
      name: this.profileForm.name,
      phone: this.profileForm.phone,
      avatar: this.profileForm.avatar
    };

    this.apiService.updateUser(this.currentUser.id, updateData).subscribe({
      next: (response) => {
        this.toastService.success('Profile updated successfully!');
        this.isSaving = false;
        
        // Update local user
        const updatedUser = {
          ...this.currentUser,
          ...updateData
        };
        this.appService.updateCurrentUser(updatedUser);

        // Redirect to customer dashboard
        this.router.navigate(['/customer']);
      },
      error: (error) => {
        console.error('Error updating profile:', error);
        this.toastService.error('Failed to update profile. Please try again.');
        this.isSaving = false;
      }
    });
  }

  goBack() {
    this.router.navigate(['/customer']);
  }
}
