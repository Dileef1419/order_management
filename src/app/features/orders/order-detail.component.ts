import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CardComponent } from '../../shared/components/card/card.component';
import { BadgeComponent } from '../../shared/components/badge/badge.component';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { OrderService, Order } from '../../core/services/order.service';

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, CardComponent, ButtonComponent, BadgeComponent],
  template: `
    <div class="container mx-auto p-6 max-w-4xl">
      <div class="flex items-center justify-between mb-8">
        <div>
          <h1 class="text-3xl font-bold tracking-tight">Order {{ orderId() }}</h1>
          <p class="text-muted-foreground mt-1">Placed on {{ date | date:'longDate' }}</p>
        </div>
        <div class="flex gap-4">
          <app-button variant="outline" routerLink="/orders">Back</app-button>
          <app-button [routerLink]="['/orders', orderId(), 'track']">Track Shipment</app-button>
        </div>
      </div>

      <div class="grid md:grid-cols-3 gap-8">
        <div class="md:col-span-2 space-y-6">
          <app-card title="Items Ordered">
            <div class="space-y-4 pt-4">
              @for(item of order()?.items; track item.product.id) {
                <div class="flex justify-between items-center pb-4 border-b last:border-0 last:pb-0">
                  <div class="flex items-center gap-4">
                    <img [src]="item.product.imageUrl" class="h-16 w-16 bg-muted rounded object-cover">
                    <div>
                      <div class="font-semibold">{{ item.product.name }}</div>
                      <div class="text-sm text-muted-foreground">Qty: {{ item.quantity }}</div>
                    </div>
                  </div>
                  <div class="font-medium">₹{{ item.product.price * item.quantity | number:'1.2-2' }}</div>
                </div>
              }
            </div>
          </app-card>

          @if(order()?.payment) {
            <app-card title="Payment History">
              <div class="pt-4 space-y-3 text-sm">
                <div class="flex justify-between">
                  <span class="text-muted-foreground">Transaction ID</span>
                  <span class="font-mono text-muted-foreground">{{ order()?.payment?.id }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-muted-foreground">Date</span>
                  <span>{{ order()?.payment?.date | date:'medium' }}</span>
                </div>
                <div class="flex justify-between border-t pt-3 mt-3">
                  <span class="text-muted-foreground">Amount Paid</span>
                  <span class="font-bold">₹{{ order()?.payment?.amount | number:'1.2-2' }}</span>
                </div>
                <div class="flex justify-between pt-1">
                  <span class="text-muted-foreground">Status</span>
                  <app-badge variant="default">{{ order()?.payment?.status }}</app-badge>
                </div>
              </div>
            </app-card>
          }

          @if(order()?.shipment) {
            <app-card title="Shipment Details">
              <div class="pt-4 space-y-3 text-sm">
                <div class="flex justify-between">
                  <span class="text-muted-foreground">Shipment Status</span>
                  <app-badge [variant]="order()?.shipment?.status === 'Dispatched' ? 'default' : 'outline'">
                    {{ order()?.shipment?.status }}
                  </app-badge>
                </div>
                @if(order()?.shipment?.carrierRef) {
                  <div class="flex justify-between">
                    <span class="text-muted-foreground">Carrier</span>
                    <span>{{ order()?.shipment?.carrierRef }}</span>
                  </div>
                }
                @if(order()?.shipment?.trackingNumber) {
                  <div class="flex justify-between">
                    <span class="text-muted-foreground">Tracking #</span>
                    <span class="font-mono">{{ order()?.shipment?.trackingNumber }}</span>
                  </div>
                }
                @if(order()?.shipment?.dispatchedAt) {
                  <div class="flex justify-between">
                    <span class="text-muted-foreground">Dispatched On</span>
                    <span>{{ order()?.shipment?.dispatchedAt | date:'medium' }}</span>
                  </div>
                }
              </div>
            </app-card>
          }
        </div>

        <div class="space-y-6">
          <app-card title="Order Summary">
            <div class="space-y-3 pt-4">
              <div class="flex justify-between text-sm">
                <span class="text-muted-foreground">Subtotal</span>
                <span>₹{{ order()?.totalAmount | number:'1.2-2' }}</span>
              </div>
              <div class="flex justify-between text-sm">
                <span class="text-muted-foreground">Shipping</span>
                <span>₹0.00</span>
              </div>
              <div class="flex justify-between font-bold pt-3 border-t">
                <span>Total</span>
                <span>₹{{ order()?.totalAmount | number:'1.2-2' }}</span>
              </div>
            </div>
          </app-card>

          <app-card title="Shipping Address">
            <div class="pt-4 text-sm text-muted-foreground">
              {{ order()?.shipping?.fullName }}<br/>
              {{ order()?.shipping?.addressLine1 }}<br/>
              {{ order()?.shipping?.city }}<br/>
              {{ order()?.shipping?.postalCode }}<br/>
              {{ order()?.shipping?.country }}
            </div>
          </app-card>
        </div>
      </div>
    </div>
  `
})
export class OrderDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private orderService = inject(OrderService);
  
  orderId = signal('');
  order = signal<Order | null>(null);
  date = new Date().toISOString();

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('orderId') || '';
    this.orderId.set(id);
    this.orderService.getFullOrder(id).subscribe({
      next: (full: any) => {
        const o = full.order || full;
        // Merge payment and shipment into the order signal if they exist
        const mergedOrder = {
          ...o,
          id: o.orderId || o.OrderId || id,
          items: (o.lines || o.Lines || []).map((l: any) => ({
            product: {
              id: l.sku || l.Sku,
              name: l.sku || l.Sku,
              price: l.unitPrice || l.UnitPrice,
              imageUrl: 'https://placehold.co/100x100?text=' + (l.sku || l.Sku)
            },
            quantity: l.quantity || l.Quantity
          })),
          shipping: o.shippingAddress || o.ShippingAddress || {
            fullName: o.customerName || o.CustomerName || 'Guest',
            addressLine1: 'Not provided',
            city: '',
            postalCode: '',
            country: ''
          },
          payment: full.payment,
          shipment: full.shipment
        };
        this.order.set(mergedOrder as any);
        this.date = o.date || o.placedAt || o.PlacedAt || new Date().toISOString();
      },
      error: () => console.error('Failed to load order')
    });
  }
}
