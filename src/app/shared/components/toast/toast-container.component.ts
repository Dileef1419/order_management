import { Component, inject } from '@angular/core';
import { ToastService } from './toast.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  template: `
    <div class="fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]">
      @for(toast of toastService.toasts(); track toast.id) {
        <div 
          class="pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all mb-2"
          [class.bg-background]="!toast.variant || toast.variant === 'default'"
          [class.border]="!toast.variant || toast.variant === 'default'"
          [class.text-foreground]="!toast.variant || toast.variant === 'default'"
          [class.bg-destructive]="toast.variant === 'destructive'"
          [class.text-destructive-foreground]="toast.variant === 'destructive'"
          [class.border-destructive]="toast.variant === 'destructive'"
        >
          <div class="grid gap-1">
            <div class="text-sm font-semibold">{{ toast.title }}</div>
            @if(toast.description) {
              <div class="text-sm opacity-90">{{ toast.description }}</div>
            }
          </div>
          <button (click)="toastService.remove(toast.id)" class="absolute right-2 top-2 rounded-md p-1 opacity-50 hover:opacity-100">
            x
          </button>
        </div>
      }
    </div>
  `
})
export class ToastContainerComponent {
  toastService = inject(ToastService);
}
