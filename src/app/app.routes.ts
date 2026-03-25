import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { 
    path: 'login', 
    loadComponent: () => import('./features/auth/login/login.component').then(c => c.LoginComponent)
  },
  { 
    path: 'register', 
    loadComponent: () => import('./features/auth/register/register.component').then(c => c.RegisterComponent)
  },
  { 
    path: 'catalog', 
    canActivate: [authGuard, roleGuard],
    data: { role: 'Customer' },
    loadComponent: () => import('./features/catalog/catalog.component').then(c => c.CatalogComponent)
  },
  { 
    path: 'catalog/:productId', 
    canActivate: [authGuard, roleGuard],
    data: { role: 'Customer' },
    loadComponent: () => import('./features/catalog/catalog-detail.component').then(c => c.CatalogDetailComponent)
  },
  { 
    path: 'cart', 
    canActivate: [authGuard, roleGuard],
    data: { role: 'Customer' },
    loadComponent: () => import('./features/cart/cart.component').then(c => c.CartComponent)
  },
  { 
    path: 'checkout', 
    canActivate: [authGuard, roleGuard],
    data: { role: 'Customer' },
    loadComponent: () => import('./features/checkout/checkout.component').then(c => c.CheckoutComponent)
  },
  { 
    path: 'pay/:orderId', 
    canActivate: [authGuard, roleGuard],
    data: { role: 'Customer' },
    loadComponent: () => import('./features/payments/payment.component').then(c => c.PaymentComponent)
  },
  { 
    path: 'orders', 
    canActivate: [authGuard, roleGuard],
    data: { role: 'Customer' },
    loadComponent: () => import('./features/orders/order-list.component').then(c => c.OrderListComponent)
  },
  { 
    path: 'orders/:orderId', 
    canActivate: [authGuard, roleGuard],
    data: { role: 'Customer' },
    loadComponent: () => import('./features/orders/order-detail.component').then(c => c.OrderDetailComponent)
  },
  { 
    path: 'orders/:orderId/track', 
    canActivate: [authGuard, roleGuard],
    data: { role: 'Customer' },
    loadComponent: () => import('./features/orders/order-track.component').then(c => c.OrderTrackComponent)
  },
  { 
    path: 'payments', 
    canActivate: [authGuard, roleGuard],
    data: { role: 'Customer' },
    loadComponent: () => import('./features/payments/payment-history.component').then(c => c.PaymentHistoryComponent)
  },
  { 
    path: 'admin', 
    canActivate: [authGuard, roleGuard],
    data: { role: 'Admin' },
    loadComponent: () => import('./features/admin/dashboard/dashboard.component').then(c => c.DashboardComponent)
  },
  { 
    path: 'admin/payments', 
    canActivate: [authGuard, roleGuard],
    data: { role: 'Admin' },
    loadComponent: () => import('./features/admin/payments/admin-payments.component').then(c => c.AdminPaymentsComponent)
  },
  { path: '**', redirectTo: 'login' }
];
