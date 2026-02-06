import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AppService } from '../../app.service';
import { TaskFlowApiService } from '../../services/taskflow-api.service';
import { ToastService } from '../../services/toast.service';
import { SERVICE_CATEGORIES } from '../../service-categories';
import { LucideAngularModule, Save, ArrowLeft, Check } from 'lucide-angular';

@Component({
  selector: 'app-worker-profile-update',
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
            <p class="text-slate-500 mt-1">Manage your worker profile and skills</p>
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

            <!-- Professional Information Section -->
            <div class="mb-8">
              <h2 class="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
                <span class="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center text-sm font-bold">2</span>
                Professional Information
              </h2>

              <!-- Experience -->
              <div class="mb-6">
                <label class="block text-sm font-semibold text-slate-700 mb-2">Years of Experience</label>
                <input 
                  type="number" 
                  [(ngModel)]="profileForm.experience"
                  name="experience"
                  min="0"
                  max="70"
                  class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                  placeholder="5"
                />
              </div>

              <!-- Categories (Services) -->
              <div class="mb-6">
                <label class="block text-sm font-semibold text-slate-700 mb-3">Service Categories</label>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button 
                    *ngFor="let category of SERVICE_CATEGORIES"
                    type="button"
                    (click)="toggleCategory(category.id)"
                    [class.ring-2]="isSelectedCategory(category.id)"
                    [class.ring-indigo-600]="isSelectedCategory(category.id)"
                    [class.bg-indigo-50]="isSelectedCategory(category.id)"
                    class="p-4 border-2 border-slate-200 rounded-xl hover:border-indigo-300 transition-all text-left"
                  >
                    <div class="flex items-start justify-between">
                      <div>
                        <p class="font-bold text-slate-900">{{ category.name }}</p>
                        <p class="text-xs text-slate-500 mt-1">{{ category.description }}</p>
                      </div>
                      <div *ngIf="isSelectedCategory(category.id)" class="flex-shrink-0 ml-2">
                        <lucide-icon [img]="Check" class="w-5 h-5 text-indigo-600"></lucide-icon>
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              <!-- Skills -->
              <div class="mb-6">
                <label class="block text-sm font-semibold text-slate-700 mb-2">Skills (comma separated)</label>
                <textarea 
                  [(ngModel)]="skillsText"
                  name="skillsText"
                  rows="3"
                  class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition resize-none"
                  placeholder="e.g. Pipe Fitting, Leak Repair, Water Heater Installation"
                ></textarea>
                <p class="text-xs text-slate-500 mt-2">Enter your professional skills, separated by commas</p>
              </div>
            </div>

            <!-- Summary -->
            <div class="mb-8 p-4 bg-indigo-50 rounded-xl border border-indigo-200">
              <p class="text-sm text-slate-700">
                <span class="font-bold">Selected Categories:</span>
                <span class="text-indigo-600 font-semibold">{{ profileForm.categories.length }}</span>
              </p>
              <p class="text-sm text-slate-700 mt-2">
                <span class="font-bold">Skills Added:</span>
                <span class="text-indigo-600 font-semibold">{{ profileForm.skills.length }}</span>
              </p>
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
export class WorkerProfileUpdateComponent implements OnInit {
  currentUser: any = null;
  isLoading = false;
  isSaving = false;
  SERVICE_CATEGORIES = SERVICE_CATEGORIES;

  profileForm = {
    name: '',
    phone: '',
    avatar: '',
    experience: 0,
    categories: [] as string[],
    skills: [] as string[]
  };

  skillsText = '';

  private appService = inject(AppService);
  private apiService = inject(TaskFlowApiService);
  private toastService = inject(ToastService);
  private router = inject(Router);

  readonly Save = Save;
  readonly ArrowLeft = ArrowLeft;
  readonly Check = Check;

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
      avatar: user.avatar || '',
      experience: user.experience || 0,
      categories: user.categories || [],
      skills: user.skills || []
    };

    this.skillsText = (user.skills || []).join(', ');
    this.isLoading = false;
  }

  toggleCategory(categoryId: string) {
    const index = this.profileForm.categories.indexOf(categoryId);
    if (index > -1) {
      this.profileForm.categories.splice(index, 1);
    } else {
      this.profileForm.categories.push(categoryId);
    }
  }

  isSelectedCategory(categoryId: string): boolean {
    return this.profileForm.categories.includes(categoryId);
  }

  onSubmit() {
    if (this.isSaving) return;

    // Parse skills from textarea
    this.profileForm.skills = this.skillsText
      .split(',')
      .map(skill => skill.trim())
      .filter(skill => skill.length > 0);

    this.isSaving = true;

    const updateData = {
      name: this.profileForm.name,
      phone: this.profileForm.phone,
      avatar: this.profileForm.avatar,
      experience: this.profileForm.experience,
      categories: this.profileForm.categories,
      skills: this.profileForm.skills
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

        // Redirect to worker dashboard
        this.router.navigate(['/worker']);
      },
      error: (error) => {
        console.error('Error updating profile:', error);
        this.toastService.error('Failed to update profile. Please try again.');
        this.isSaving = false;
      }
    });
  }

  goBack() {
    this.router.navigate(['/worker']);
  }
}
