import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      @for (toast of toastService.toasts(); track toast.id) {
        <div 
          class="pointer-events-auto min-w-[300px] max-w-md rounded-lg shadow-lg p-4 flex items-start gap-3 animate-in slide-in-from-right duration-300"
          [ngClass]="{
            'bg-green-50 border border-green-200': toast.type === 'success',
            'bg-red-50 border border-red-200': toast.type === 'error',
            'bg-yellow-50 border border-yellow-200': toast.type === 'warning',
            'bg-blue-50 border border-blue-200': toast.type === 'info'
          }">
          
          <!-- Icon -->
          <div class="flex-shrink-0">
            @if (toast.type === 'success') {
              <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            }
            @if (toast.type === 'error') {
              <svg class="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            }
            @if (toast.type === 'warning') {
              <svg class="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
              </svg>
            }
            @if (toast.type === 'info') {
              <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            }
          </div>

          <!-- Message -->
          <div class="flex-1 pt-0.5">
            <p class="text-sm font-medium"
              [ngClass]="{
                'text-green-800': toast.type === 'success',
                'text-red-800': toast.type === 'error',
                'text-yellow-800': toast.type === 'warning',
                'text-blue-800': toast.type === 'info'
              }">
              {{ toast.message }}
            </p>
          </div>

          <!-- Close button -->
          <button 
            (click)="toastService.remove(toast.id)"
            class="flex-shrink-0 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2"
            [ngClass]="{
              'text-green-500 hover:text-green-600 focus:ring-green-500': toast.type === 'success',
              'text-red-500 hover:text-red-600 focus:ring-red-500': toast.type === 'error',
              'text-yellow-500 hover:text-yellow-600 focus:ring-yellow-500': toast.type === 'warning',
              'text-blue-500 hover:text-blue-600 focus:ring-blue-500': toast.type === 'info'
            }">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
      }
    </div>
  `
})
export class ToastComponent {
  toastService = inject(ToastService);
}
