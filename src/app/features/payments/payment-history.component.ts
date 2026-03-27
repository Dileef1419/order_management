import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PaymentService } from '../../core/services/payment.service';
import { CardComponent } from '../../shared/components/card/card.component';
import { TableComponent } from '../../shared/components/table/table.component';
import { BadgeComponent } from '../../shared/components/badge/badge.component';
import { ButtonComponent } from '../../shared/components/button/button.component';

@Component({
  selector: 'app-payment-history',
  standalone: true,
  imports: [CommonModule, RouterLink, BadgeComponent, ButtonComponent],
  template: `
    <div class="container mx-auto p-6 max-w-5xl">
      <app-button variant="ghost" class="mb-4 px-0 hover:bg-transparent hover:underline" routerLink="/catalog">← Back to Catalog</app-button>
      
      <div class="flex items-center justify-between mb-8">
        <div>
          <h1 class="text-3xl font-bold tracking-tight">Payment History</h1>
          <p class="text-muted-foreground mt-1">View all your past transactions and payment statuses.</p>
        </div>
      </div>

      <div class="grid grid-cols-1 gap-4">
        @for(payment of payments(); track (payment.id || $index)) {
          <div 
            class="group flex flex-col md:flex-row items-start md:items-center justify-between p-6 rounded-xl border bg-card hover:border-primary/50 transition-all duration-300 shadow-sm"
          >
            <div class="flex items-center gap-6 w-full md:w-auto">
              <div class="h-12 w-12 rounded-full bg-green-100 text-green-700 flex items-center justify-center shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
              </div>
              <div class="space-y-1">
                <div class="flex items-center gap-2">
                  <span class="font-mono text-sm text-muted-foreground">{{ payment.id }}</span>
                  <app-badge [variant]="payment.status === 'Captured' ? 'success' : (payment.status === 'Refunded' ? 'secondary' : (payment.status === 'Failed' ? 'danger' : 'outline'))">
                    {{ payment.status }}
                  </app-badge>
                </div>
                <div class="font-medium">
                  Payment for <a [routerLink]="['/orders', payment.orderId]" class="text-primary hover:underline">{{ payment.orderId }}</a>
                </div>
                <div class="text-sm text-muted-foreground">
                  {{ payment.date | date:'medium' }}
                </div>
              </div>
            </div>

            <div class="flex items-center justify-between w-full md:w-auto mt-4 md:mt-0 gap-8">
              <div class="text-right">
                <div class="text-xs text-muted-foreground font-medium uppercase tracking-wider">Amount Paid</div>
                <div class="text-2xl font-black text-foreground">₹{{ payment.amount | number:'1.2-2' }}</div>
              </div>
              
              <app-button variant="outline" size="sm" [routerLink]="['/orders', payment.orderId]">View Order</app-button>
            </div>
          </div>
        }

        @if(payments().length === 0) {
          <div class="text-center py-20 border-2 border-dashed rounded-xl text-muted-foreground bg-muted/20">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="mx-auto mb-4 opacity-20"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
            <p class="font-medium text-lg">No payments yet</p>
            <p class="text-sm">When you complete a purchase, it will appear here.</p>
          </div>
        }
      </div>
    </div>
  `
})
export class PaymentHistoryComponent implements OnInit {
  private paymentService = inject(PaymentService);
  
  payments = signal<any[]>([]);
  
  columns = [
    { header: 'Payment ID', field: 'id' },
    { header: 'Order ID', field: 'orderId' },
    { header: 'Date', field: 'date' },
    { header: 'Amount', field: 'amount' },
    { header: 'Status', field: 'status' }
  ];

  ngOnInit() {
    this.paymentService.getPaymentsByCustomer().subscribe(backendPayments => {
      const mappedPayments = (backendPayments || []).map(p => ({
        id: p.paymentId || p.PaymentId || p.id,
        orderId: p.orderId || p.OrderId,
        date: p.createdAt || p.CreatedAt || p.date,
        amount: p.amount || p.Amount,
        status: p.status || p.Status
      }));
      this.payments.set(mappedPayments);
    });
  }
}
