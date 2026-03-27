import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardComponent } from '../../../shared/components/card/card.component';
import { TableComponent } from '../../../shared/components/table/table.component';
import { BadgeComponent } from '../../../shared/components/badge/badge.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { ToastService } from '../../../shared/components/toast/toast.service';
import { OrderService } from '../../../core/services/order.service';
import { PaymentService } from '../../../core/services/payment.service';

@Component({
  selector: 'app-admin-payments',
  standalone: true,
  imports: [CommonModule, TableComponent, BadgeComponent, ButtonComponent],
  template: `
    <section class="space-y-6">
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 class="text-2xl font-black tracking-tight uppercase">Payment Insights</h2>
          <p class="text-sm text-muted-foreground mt-1">Review captured transactions and manage refunds.</p>
        </div>
      </div>

      <div class="rounded-xl border bg-card shadow-sm overflow-hidden">
        <app-table [data]="payments()" [columns]="cols" [searchable]="true">
          <ng-template #cellTemplate let-row let-col="column">
            @if(col.field === 'id') { <span class="font-bold font-mono text-xs text-muted-foreground">{{ row.id }}</span> }
            @if(col.field === 'orderId') { <span class="font-semibold">{{ row.orderId }}</span> }
            @if(col.field === 'amount') { 
              <span class="text-lg font-black tracking-tighter">₹{{ row.amount | number:'1.2-2' }}</span> 
            }
            @if(col.field === 'status') {
              <app-badge [variant]="row.status === 'Refunded' ? 'secondary' : (row.status === 'Captured' ? 'default' : 'destructive')">
                {{ row.status }}
              </app-badge>
            }
            @if(col.field === 'actions') {
              <app-button variant="outline" size="sm" [disabled]="row.status === 'Refunded'" (onClick)="refund(row.id)">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-2"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
                Process Refund
              </app-button>
            }
          </ng-template>
        </app-table>
      </div>
    </section>
  `
})
export class AdminPaymentsComponent {
  private toast = inject(ToastService);
  private orderService = inject(OrderService);
  private paymentService = inject(PaymentService);

  payments = signal<any[]>([]);

  constructor() {
    this.loadPayments();
  }

  loadPayments() {
    this.paymentService.getAllPayments().subscribe({
      next: (backendPayments: any[]) => {
        const mapped = (backendPayments || []).map(p => ({
          id: p.paymentId || p.PaymentId || p.id,
          orderId: p.orderId || p.OrderId,
          amount: p.amount || p.Amount,
          status: p.status || p.Status
        }));
        this.payments.set(mapped);
      },
      error: err => console.error('Admin payments load error:', err)
    });
  }
  
  cols = [
    { header: 'Payment ID', field: 'id' },
    { header: 'Order ID', field: 'orderId' },
    { header: 'Amount', field: 'amount' },
    { header: 'Status', field: 'status' },
    { header: 'Actions', field: 'actions' }
  ];

  refund(id: string) {
    if(confirm('Issue full refund for ' + id + '?')) {
      const p = this.payments().find(x => x.id === id);
      if (p) {
        this.paymentService.refund(id, p.amount).subscribe({
          next: () => {
            this.loadPayments();
            this.toast.show({ title: 'Refund Processed', description: 'Refund successful for ' + id });
          },
          error: () => this.toast.show({ title: 'Refund Failed', description: 'Check console for details.' })
        });
      }
    }
  }
}
