import { Component, inject, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfirmDialogService } from '../../services/confirm-dialog.service';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (confirmService.isVisible()) {
      <div
        class="fixed inset-0 z-[80] flex items-center justify-center px-4 bg-slate-900/60 backdrop-blur-sm"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        aria-describedby="confirm-message">
        <div class="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
          <div class="px-6 py-5 border-b border-slate-100">
            <h3 id="confirm-title" class="text-lg font-bold text-slate-900">{{ confirmService.config().title }}</h3>
          </div>
          
          <div class="px-6 py-6">
            <p id="confirm-message" class="text-slate-600">{{ confirmService.config().message }}</p>
          </div>
          
          <div class="px-6 py-4 bg-slate-50 flex justify-end gap-3">
            <button 
              (click)="confirmService.cancel()"
              type="button"
              class="px-4 py-2 rounded-lg font-medium text-slate-700 hover:bg-slate-200 transition-colors focus-visible:ring-2 focus-visible:ring-indigo-500 outline-none">
              {{ confirmService.config().cancelText }}
            </button>
            <button 
              (click)="confirmService.confirm()"
              type="button"
              class="px-4 py-2 rounded-lg font-medium text-white transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 outline-none"
              [ngClass]="{
                'bg-red-600 hover:bg-red-700 focus-visible:ring-red-500': confirmService.config().type === 'danger',
                'bg-indigo-600 hover:bg-indigo-700 focus-visible:ring-indigo-500': confirmService.config().type === 'primary',
                'bg-amber-600 hover:bg-amber-700 focus-visible:ring-amber-500': confirmService.config().type === 'warning'
              }">
              {{ confirmService.config().confirmText }}
            </button>
          </div>
        </div>
      </div>
    }
  `
})
export class ConfirmDialogComponent {
  confirmService = inject(ConfirmDialogService);

  @HostListener('window:keydown.escape')
  onEscape() {
    if (this.confirmService.isVisible()) {
      this.confirmService.cancel();
    }
  }
}
