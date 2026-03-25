import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { OrderService, Order } from '../../core/services/order.service';
import { CardComponent } from '../../shared/components/card/card.component';
import { BadgeComponent } from '../../shared/components/badge/badge.component';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { TableComponent } from '../../shared/components/table/table.component';

@Component({
  selector: 'app-order-list',
  standalone: true,
  imports: [CommonModule, RouterLink, BadgeComponent, ButtonComponent],
  template: `
    <div class="container mx-auto p-6 max-w-5xl">
      <app-button variant="ghost" class="mb-4 px-0 hover:bg-transparent hover:underline" routerLink="/catalog">← Back to Catalog</app-button>
      <h1 class="text-3xl font-bold tracking-tight mb-8">My Orders</h1>
      
      <div class="grid grid-cols-1 gap-6">
        @for(order of orders(); track order.id) {
          <div 
            [routerLink]="['/orders', order.id]"
            class="group relative flex flex-col md:flex-row items-start md:items-center justify-between p-6 rounded-xl border bg-card hover:border-primary/50 transition-all duration-300 cursor-pointer shadow-sm hover:shadow-md"
          >
            <div class="flex items-center gap-6 w-full md:w-auto">
              <div class="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21 16-4 4-4-4"/><path d="M17 20V4"/><path d="m3 8 4-4 4 4"/><path d="M7 4v16"/></svg>
              </div>
              <div class="space-y-1">
                <div class="flex items-center gap-2">
                  <span class="font-bold text-lg tracking-tight">{{ order.id }}</span>
                  <app-badge [variant]="getStatusVariant(order.status)">
                    {{ order.status }}
                  </app-badge>
                </div>
                <div class="text-sm text-muted-foreground flex items-center gap-3">
                  <span>{{ order.date | date:'medium' }}</span>
                  <span>•</span>
                  <span>{{ order.items }} product(s)</span>
                </div>
              </div>
            </div>

            <div class="flex items-center justify-between w-full md:w-auto mt-4 md:mt-0 gap-8">
              <div class="text-right">
                <div class="text-xs text-muted-foreground font-medium uppercase tracking-wider">Total Amount</div>
                <div class="text-xl font-black text-foreground">₹{{ order.total | number:'1.2-2' }}</div>
              </div>
              
              <div class="flex gap-2">
                <app-button variant="outline" size="sm" [routerLink]="['/orders', order.id]">Details</app-button>
                <app-button variant="secondary" size="sm" [routerLink]="['/orders', order.id, 'track']" (onClick)="$event.stopPropagation()">Track</app-button>
              </div>
            </div>
          </div>
        }

        @if(orders().length === 0) {
          <div class="text-center py-20 border-2 border-dashed rounded-xl text-muted-foreground bg-muted/20">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="mx-auto mb-4 opacity-20"><rect width="20" height="20" x="2" y="2" rx="2"/><path d="M12 8v8"/><path d="M8 12h8"/></svg>
            <p class="font-medium text-lg">No orders yet</p>
            <p class="text-sm">When you place an order, it will appear here.</p>
          </div>
        }
      </div>
    </div>
  `
})
export class OrderListComponent implements OnInit {
  private orderService = inject(OrderService);
  
  orders = signal<any[]>([]);
  
  columns = [
    { header: 'Order ID', field: 'id' },
    { header: 'Date', field: 'date' },
    { header: 'Status', field: 'status' },
    { header: 'Items', field: 'items' },
    { header: 'Total', field: 'total' },
    { header: '', field: 'actions' }
  ];

  ngOnInit() {
    this.orders.set(this.orderService.orders().map(o => ({
      id: o.id,
      date: o.date,
      status: o.status,
      items: o.items.reduce((acc, item) => acc + item.quantity, 0),
      total: o.totalAmount
    })));
  }

  getStatusVariant(status: string) {
    switch (status) {
      case 'Delivered': return 'default';
      case 'Processing': return 'secondary';
      case 'Shipped': return 'outline';
      case 'Cancelled': return 'destructive';
      default: return 'outline';
    }
  }
}
