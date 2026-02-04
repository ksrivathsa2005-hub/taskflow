import { Injectable, signal } from '@angular/core';

export interface ConfirmDialogConfig {
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  type: 'danger' | 'warning' | 'primary';
}

@Injectable({
  providedIn: 'root'
})
export class ConfirmDialogService {
  isVisible = signal(false);
  config = signal<ConfirmDialogConfig>({
    title: 'Confirm',
    message: '',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    type: 'primary'
  });

  private resolveCallback?: (value: boolean) => void;

  show(message: string, options?: Partial<ConfirmDialogConfig>): Promise<boolean> {
    this.config.set({
      title: options?.title || 'Confirm',
      message,
      confirmText: options?.confirmText || 'Confirm',
      cancelText: options?.cancelText || 'Cancel',
      type: options?.type || 'primary'
    });
    
    this.isVisible.set(true);

    return new Promise<boolean>((resolve) => {
      this.resolveCallback = resolve;
    });
  }

  confirm() {
    this.isVisible.set(false);
    this.resolveCallback?.(true);
  }

  cancel() {
    this.isVisible.set(false);
    this.resolveCallback?.(false);
  }
}
