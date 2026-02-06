import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AppService } from '../../app.service';
import { TaskFlowApiService } from '../../services/taskflow-api.service';
import { ToastService } from '../../services/toast.service';
import { SERVICE_CATEGORIES } from '../../service-categories';
import { LucideAngularModule, ArrowRight, Check } from 'lucide-angular';

@Component({
  selector: 'app-worker-profile-completion',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 py-12 px-4">
      <div class="max-w-4xl mx-auto">
        <!-- Progress Bar -->
        <div class="mb-12">
          <div class="flex items-center justify-between mb-4">
            <h1 class="text-3xl font-black text-slate-900">Complete Your Profile</h1>
            <span class="text-sm font-bold text-indigo-600 bg-indigo-50 px-4 py-2 rounded-full">Step 1 of 2</span>
          </div>
          <p class="text-slate-600 mb-6">Select your service categories and add your professional skills to get started</p>
          <div class="w-full bg-slate-200 rounded-full h-2">
            <div class="bg-indigo-600 h-2 rounded-full" style="width: 50%"></div>
          </div>
        </div>

        <!-- Main Card -->
        <div class="bg-white rounded-3xl shadow-xl p-8 mb-8">
          <form (ngSubmit)="onSubmit()">
            <!-- Section 1: Service Categories -->
            <div class="mb-12">
              <h2 class="text-2xl font-black text-slate-900 mb-2">Select Your Services</h2>
              <p class="text-slate-600 mb-6">Choose the service categories you specialize in</p>

              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <button 
                  *ngFor="let category of SERVICE_CATEGORIES"
                  type="button"
                  (click)="toggleCategory(category.id)"
                  [class.ring-2]="isSelectedCategory(category.id)"
                  [class.ring-indigo-600]="isSelectedCategory(category.id)"
                  [class.bg-indigo-50]="isSelectedCategory(category.id)"
                  [class.border-indigo-200]="isSelectedCategory(category.id)"
                  class="p-6 border-2 border-slate-200 rounded-2xl hover:border-indigo-300 transition-all text-left hover:shadow-lg"
                >
                  <div class="flex items-start justify-between">
                    <div class="flex-1">
                      <p class="font-bold text-slate-900 text-lg">{{ category.name }}</p>
                      <p class="text-sm text-slate-500 mt-1">{{ category.description }}</p>
                    </div>
                    <div *ngIf="isSelectedCategory(category.id)" class="flex-shrink-0 ml-2 mt-1">
                      <lucide-icon [img]="Check" class="w-6 h-6 text-indigo-600"></lucide-icon>
                    </div>
                  </div>
                </button>
              </div>

              <div class="mt-6 p-4 bg-indigo-50 rounded-xl border border-indigo-200">
                <p class="text-sm text-indigo-700">
                  <span class="font-bold">Selected:</span>
                  <span class="ml-2">{{ selectedCategoryNames() || 'No categories selected' }}</span>
                </p>
              </div>
            </div>

            <!-- Section 2: Professional Skills -->
            <div class="mb-8">
              <h2 class="text-2xl font-black text-slate-900 mb-2">Your Professional Skills</h2>
              <p class="text-slate-600 mb-6">List your key professional skills (comma separated)</p>

              <textarea 
                [(ngModel)]="skillsText"
                name="skillsText"
                rows="4"
                class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition resize-none"
                placeholder="e.g. Pipe Fitting, Leak Repair, Water Heater Installation, Bathroom Fitting, Drainage Cleaning"
              ></textarea>
              <p class="text-xs text-slate-500 mt-2">Add at least 2 skills to continue</p>

              <div *ngIf="parsedSkills.length > 0" class="mt-6">
                <p class="text-sm font-semibold text-slate-700 mb-3">Your Skills:</p>
                <div class="flex flex-wrap gap-2">
                  <span 
                    *ngFor="let skill of parsedSkills"
                    class="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-full text-sm font-semibold flex items-center gap-2">
                    {{ skill }}
                    <lucide-icon [img]="Check" class="w-4 h-4"></lucide-icon>
                  </span>
                </div>
              </div>
            </div>

            <!-- Section 3: Experience -->
            <div class="mb-8">
              <h2 class="text-2xl font-black text-slate-900 mb-2">Years of Experience</h2>
              <p class="text-slate-600 mb-6">How many years of experience do you have?</p>

              <div class="flex items-center gap-6">
                <input 
                  type="range" 
                  [(ngModel)]="experience"
                  name="experience"
                  min="0"
                  max="50"
                  class="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
                <span class="text-2xl font-black text-indigo-600 min-w-16 text-right">{{ experience }} yrs</span>
              </div>
            </div>

            <!-- Summary Card -->
            <div class="p-6 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-2xl border border-indigo-200 mb-8">
              <h3 class="font-bold text-slate-900 mb-4">Your Profile Summary</h3>
              <div class="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p class="text-slate-600">Service Categories</p>
                  <p class="font-black text-indigo-600 text-lg">{{ selectedCategories.length }}</p>
                </div>
                <div>
                  <p class="text-slate-600">Professional Skills</p>
                  <p class="font-black text-indigo-600 text-lg">{{ parsedSkills.length }}</p>
                </div>
                <div>
                  <p class="text-slate-600">Years of Experience</p>
                  <p class="font-black text-indigo-600 text-lg">{{ experience }}</p>
                </div>
                <div>
                  <p class="text-slate-600">Profile Status</p>
                  <p [class.text-emerald-600]="isFormValid()" [class.text-amber-600]="!isFormValid()" class="font-black text-lg">
                    {{ isFormValid() ? 'Complete' : 'Incomplete' }}
                  </p>
                </div>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex gap-4">
              <button 
                type="button"
                (click)="goBack()"
                class="flex-1 px-6 py-4 border-2 border-slate-200 text-slate-900 font-bold rounded-xl hover:bg-slate-50 transition-all">
                Skip for Now
              </button>
              <button 
                type="submit"
                [disabled]="!isFormValid() || isSaving"
                class="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-indigo-200">
                <span>{{ isSaving ? 'Creating Profile...' : 'Create Profile & Continue' }}</span>
                <lucide-icon *ngIf="!isSaving" [img]="ArrowRight" class="w-5 h-5"></lucide-icon>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class WorkerProfileCompletionComponent implements OnInit {
  currentUser: any = null;
  isSaving = false;
  selectedCategories: string[] = [];
  skillsText = '';
  experience = 0;
  SERVICE_CATEGORIES = SERVICE_CATEGORIES;

  private appService = inject(AppService);
  private apiService = inject(TaskFlowApiService);
  private toastService = inject(ToastService);
  private router = inject(Router);

  readonly Check = Check;
  readonly ArrowRight = ArrowRight;

  ngOnInit() {
    this.currentUser = this.appService.currentUser;
    if (!this.currentUser) {
      this.router.navigate(['/login']);
      return;
    }

    // If user already has categories set, redirect to dashboard
    if (this.currentUser.categories && this.currentUser.categories.length > 0) {
      this.router.navigate(['/worker']);
      return;
    }
  }

  toggleCategory(categoryId: string) {
    const index = this.selectedCategories.indexOf(categoryId);
    if (index > -1) {
      this.selectedCategories.splice(index, 1);
    } else {
      this.selectedCategories.push(categoryId);
    }
  }

  isSelectedCategory(categoryId: string): boolean {
    return this.selectedCategories.includes(categoryId);
  }

  selectedCategoryNames(): string {
    return this.selectedCategories
      .map(id => this.SERVICE_CATEGORIES.find(c => c.id === id)?.name)
      .filter(Boolean)
      .join(', ');
  }

  get parsedSkills(): string[] {
    return this.skillsText
      .split(',')
      .map(skill => skill.trim())
      .filter(skill => skill.length > 0);
  }

  isFormValid(): boolean {
    return this.selectedCategories.length > 0 && this.parsedSkills.length >= 2;
  }

  onSubmit() {
    if (!this.isFormValid() || this.isSaving) return;

    this.isSaving = true;

    const updateData = {
      categories: this.selectedCategories,
      skills: this.parsedSkills,
      experience: this.experience
    };

    this.apiService.updateUser(this.currentUser.id, updateData).subscribe({
      next: (response) => {
        this.toastService.success('Profile created successfully! You\'re ready to accept jobs.');
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
        console.error('Error creating profile:', error);
        this.toastService.error('Failed to create profile. Please try again.');
        this.isSaving = false;
      }
    });
  }

  goBack() {
    this.router.navigate(['/worker']);
  }
}
