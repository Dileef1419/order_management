import { Injectable, signal } from '@angular/core';

export interface Toast {
  id: string;
  title: string;
  description?: string;
  variant?: 'default' | 'destructive';
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  toasts = signal<Toast[]>([]);

  show(toast: Omit<Toast, 'id'>) {
    const id = Math.random().toString(36).substring(2, 9);
    this.toasts.update((val: Toast[]) => [...val, { ...toast, id }]);
    setTimeout(() => this.remove(id), 5000);
  }

  remove(id: string) {
    this.toasts.update((val: Toast[]) => val.filter((t: Toast) => t.id !== id));
  }
}
