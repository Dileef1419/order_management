import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TimelineComponent, TimelineEvent } from '../../shared/components/timeline/timeline.component';
import { CardComponent } from '../../shared/components/card/card.component';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { Router } from '@angular/router';

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
export class OrderTrackComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  orderId = signal<string>(this.route.snapshot.paramMap.get('orderId') || '');

  events = signal<TimelineEvent[]>([
    { status: 'Order Placed', date: new Date(Date.now() - 172800000).toISOString(), description: 'We have received your order', completed: true },
    { status: 'Packed', date: new Date(Date.now() - 86400000).toISOString(), description: 'Your items have been packed safely', completed: true },
    { status: 'Shipped', date: new Date().toISOString(), description: 'Handed over to carrier', completed: true },
    { status: 'Out for Delivery', date: '', description: 'Package is out for delivery', completed: false },
    { status: 'Delivered', date: '', description: 'Package dropped at front porch', completed: false }
  ]);

  goBack() {
    this.router.navigate(['/orders']);
  }
}
