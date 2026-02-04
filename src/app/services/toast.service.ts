import { Injectable, signal } from '@angular/core';

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  toasts = signal<Toast[]>([]);

  show(type: Toast['type'], message: string, duration: number = 3000) {
    const id = `toast-${Date.now()}-${Math.random()}`;
    const toast: Toast = { id, type, message, duration };
    
    this.toasts.update(toasts => [...toasts, toast]);

    if (duration > 0) {
      setTimeout(() => this.remove(id), duration);
    }
  }

  success(message: string, duration?: number) {
    this.show('success', message, duration);
  }

  error(message: string, duration?: number) {
    this.show('error', message, duration);
  }

  warning(message: string, duration?: number) {
    this.show('warning', message, duration);
  }

  info(message: string, duration?: number) {
    this.show('info', message, duration);
  }

  remove(id: string) {
    this.toasts.update(toasts => toasts.filter(t => t.id !== id));
  }

  confirm(message: string, onConfirm: () => void, onCancel?: () => void) {
    const confirmed = window.confirm(message);
    if (confirmed) {
      onConfirm();
    } else if (onCancel) {
      onCancel();
    }
    return confirmed;
  }
}
