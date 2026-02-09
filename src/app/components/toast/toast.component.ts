import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed top-4 right-4 z-[100] flex flex-col gap-3 pointer-events-none">
      @for (toast of toastService.toasts(); track toast.id) {
        <div 
          class="pointer-events-auto min-w-[340px] max-w-md rounded-2xl shadow-2xl overflow-hidden animate-slide-in-right backdrop-blur-sm"
          [ngClass]="{
            'bg-emerald-50/95 border border-emerald-200': toast.type === 'success',
            'bg-red-50/95 border border-red-200': toast.type === 'error',
            'bg-amber-50/95 border border-amber-200': toast.type === 'warning',
            'bg-blue-50/95 border border-blue-200': toast.type === 'info'
          }">
          <div class="p-4 flex items-start gap-3">
            <!-- Icon -->
            <div class="flex-shrink-0 mt-0.5">
              <div class="w-8 h-8 rounded-xl flex items-center justify-center"
                [ngClass]="{
                  'bg-emerald-100': toast.type === 'success',
                  'bg-red-100': toast.type === 'error',
                  'bg-amber-100': toast.type === 'warning',
                  'bg-blue-100': toast.type === 'info'
                }">
                @if (toast.type === 'success') {
                  <svg class="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                }
                @if (toast.type === 'error') {
                  <svg class="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                }
                @if (toast.type === 'warning') {
                  <svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                  </svg>
                }
                @if (toast.type === 'info') {
                  <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                }
              </div>
            </div>

            <!-- Message -->
            <div class="flex-1 pt-1">
              <p class="text-sm font-bold leading-snug"
                [ngClass]="{
                  'text-emerald-900': toast.type === 'success',
                  'text-red-900': toast.type === 'error',
                  'text-amber-900': toast.type === 'warning',
                  'text-blue-900': toast.type === 'info'
                }">
                {{ toast.message }}
              </p>
            </div>

            <!-- Close button -->
            <button 
              (click)="toastService.remove(toast.id)"
              class="flex-shrink-0 p-1 rounded-lg transition-colors hover:bg-black/5">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                [ngClass]="{
                  'text-emerald-400': toast.type === 'success',
                  'text-red-400': toast.type === 'error',
                  'text-amber-400': toast.type === 'warning',
                  'text-blue-400': toast.type === 'info'
                }">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>

          <!-- Auto-dismiss progress bar -->
          <div class="h-1 w-full opacity-30"
            [ngClass]="{
              'bg-emerald-200': toast.type === 'success',
              'bg-red-200': toast.type === 'error',
              'bg-amber-200': toast.type === 'warning',
              'bg-blue-200': toast.type === 'info'
            }">
            <div class="h-full animate-progress rounded-r-full"
              [ngClass]="{
                'bg-emerald-500': toast.type === 'success',
                'bg-red-500': toast.type === 'error',
                'bg-amber-500': toast.type === 'warning',
                'bg-blue-500': toast.type === 'info'
              }"
              [style.animation-duration]="'3s'"></div>
          </div>
        </div>
      }
    </div>
  `
})
export class ToastComponent {
  toastService = inject(ToastService);
}
