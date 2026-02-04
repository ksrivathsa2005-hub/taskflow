import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { User, Review } from '../../types';
import { LucideAngularModule } from 'lucide-angular';

@Component({
    selector: 'app-worker-profile-card',
    standalone: true,
    imports: [CommonModule, LucideAngularModule],
    template: `
        <div class="bg-white rounded-2xl shadow-md p-6 border border-slate-100">
            <!-- Header -->
            <div class="flex items-center gap-4 mb-6">
                <img [src]="worker.avatar" [alt]="worker.name" class="w-16 h-16 rounded-full object-cover">
                <div class="flex-1">
                    <h3 class="text-lg font-bold text-slate-900">{{ worker.name }}</h3>
                    <p class="text-sm text-slate-600">{{ worker.email }}</p>
                </div>
            </div>

            <!-- Stats -->
            <div class="grid grid-cols-2 gap-4 mb-6">
                <div class="bg-slate-50 rounded-lg p-4">
                    <p class="text-xs text-slate-500 font-semibold uppercase">Rating</p>
                    <div class="flex items-center gap-1 mt-1">
                        <i data-lucide="star" class="w-5 h-5 text-yellow-400 fill-yellow-400"></i>
                        <span class="text-xl font-bold text-slate-900">{{ worker.rating }}</span>
                    </div>
                </div>
                <div class="bg-slate-50 rounded-lg p-4">
                    <p class="text-xs text-slate-500 font-semibold uppercase">Jobs Completed</p>
                    <p class="text-xl font-bold text-slate-900 mt-1">{{ worker.completedJobs }}</p>
                </div>
            </div>

            <!-- Skills -->
            <div *ngIf="worker.skills && worker.skills.length > 0" class="mb-6">
                <p class="text-xs text-slate-600 font-semibold uppercase mb-2">Skills</p>
                <div class="flex flex-wrap gap-2">
                    <span *ngFor="let skill of worker.skills" 
                        class="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                        {{ skill }}
                    </span>
                </div>
            </div>

            <!-- Contact -->
            <div class="border-t border-slate-100 pt-4">
                <p class="text-sm text-slate-600 font-medium">
                    <span class="text-slate-900 font-bold">Phone:</span> {{ worker.phone || 'Not provided' }}
                </p>
            </div>
        </div>
    `,
    styles: [`
        :host ::ng-deep {
            i[data-lucide] {
                display: inline-block;
            }
        }
    `]
})
export class WorkerProfileCardComponent {
    @Input() worker!: User;
    @Input() reviews: Review[] = [];
}
