import { Component, inject } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './core/services/auth.service';
import { CartService } from './core/services/cart.service';
import { ToastContainerComponent } from './shared/components/toast/toast-container.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, RouterLink, ToastContainerComponent],
  template: `
    <div class="min-h-screen bg-background text-foreground flex flex-col transition-colors duration-300">
      @if (auth.currentUser$ | async; as user) {
        <header class="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div class="container mx-auto px-6 h-14 flex items-center justify-between">
            <div class="flex items-center gap-4">
              <a [href]="user.role === 'Admin' ? '/admin' : '/catalog'" class="font-bold tracking-tight text-lg">Order Management</a>
              <span class="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary uppercase font-bold">{{ user.role }} PANEL</span>
            </div>
            
            <div class="flex items-center gap-6 pr-2">
              @if(user.role === 'Customer') {
                <a routerLink="/cart" class="text-sm font-medium hover:text-primary transition-colors flex items-center gap-2 relative">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
                  Cart
                  @if (cart.totalItems() > 0) {
                    <span class="absolute -top-2 -right-4 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
                      {{ cart.totalItems() }}
                    </span>
                  }
                </a>
                <a routerLink="/orders" class="text-sm font-medium hover:text-primary transition-colors flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 16V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v9m16 0H4m16 0 1.28 2.55a1 1 0 0 1-.9 1.45H3.62a1 1 0 0 1-.9-1.45L4 16"/></svg>
                  Orders
                </a>
                <a routerLink="/payments" class="text-sm font-medium hover:text-primary transition-colors flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
                  Payments
                </a>
              }
              <button (click)="auth.logout()" class="text-sm font-medium hover:underline text-destructive">
                Logout
              </button>
            </div>
          </div>
        </header>
      }

      <main class="flex-1 w-full">
        <router-outlet></router-outlet>
      </main>
      <app-toast-container></app-toast-container>
    </div>
  `
})
export class AppComponent {
  auth = inject(AuthService);
  cart = inject(CartService);
}
