import { Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TimelineComponent, TimelineEvent } from '../../shared/components/timeline/timeline.component';
import { CardComponent } from '../../shared/components/card/card.component';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { Router } from '@angular/router';
import { OrderService } from '../../core/services/order.service';

@Component({
  selector: 'app-order-track',
  standalone: true,
  imports: [CommonModule, TimelineComponent, CardComponent, ButtonComponent],
  template: `
    <div class="container mx-auto p-6 max-w-3xl">
      <div class="flex items-center justify-between mb-8">
        <h1 class="text-3xl font-bold tracking-tight">Track Order {{ orderId() }}</h1>
        <app-button variant="outline" (onClick)="goBack()">Back to Orders</app-button>
      </div>

      <app-card>
        <div class="p-8">
          <app-timeline [events]="events()"></app-timeline>
        </div>
      </app-card>
    </div>
  `
})
export class OrderTrackComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private orderService = inject(OrderService);

  orderId = signal<string>(this.route.snapshot.paramMap.get('orderId') || '');
  events = signal<TimelineEvent[]>([]);

  ngOnInit() {
    this.orderService.getFullOrder(this.orderId()).subscribe({
      next: (full: any) => {
        const o = full.order || full;
        const s = full.shipment;
        const status = o.status || o.Status || 'Placed';
        const date = o.placedAt || o.PlacedAt || o.date || new Date().toISOString();
        const lastUpdate = o.lastUpdatedAt || o.LastUpdatedAt || date;

        const milestones = [
          { 
            status: 'Order Placed', 
            date: date, 
            description: 'We have received your order and it is being processed.', 
            completed: true 
          },
          { 
            status: 'Confirmed', 
            date: this.isCompleted(status, ['Confirmed', 'Shipped', 'Delivered']) ? lastUpdate : '', 
            description: 'Order has been confirmed and is ready for fulfillment.', 
            completed: this.isCompleted(status, ['Confirmed', 'Shipped', 'Delivered']) 
          },
          { 
            status: 'Shipped', 
            date: s?.dispatchedAt || (this.isCompleted(status, ['Shipped', 'Delivered']) ? lastUpdate : ''), 
            description: s?.trackingNumber ? `Shipment tracking number: ${s.trackingNumber}` : 'Your package is on its way.', 
            completed: this.isCompleted(status, ['Shipped', 'Delivered']) 
          },
          { 
            status: 'Delivered', 
            date: this.isCompleted(status, ['Delivered']) ? lastUpdate : '', 
            description: 'Package has been delivered successfully.', 
            completed: this.isCompleted(status, ['Delivered']) 
          }
        ];

        this.events.set(milestones);
      }
    });
  }

  private isCompleted(currentStatus: string, expectedStatuses: string[]): boolean {
    return expectedStatuses.includes(currentStatus);
  }

  goBack() {
    this.router.navigate(['/orders']);
  }
}
