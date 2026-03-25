import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';
import { Observable, of, delay, tap } from 'rxjs';
import { OrderService } from './order.service';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private api = inject(ApiService);
  private orderService = inject(OrderService);

  authorise(orderId: string, cardDetails: any): Observable<{ paymentId: string, status: string }> {
    return of({ paymentId: `PAY-${Math.floor(Math.random() * 100000)}`, status: 'AUTHORISED' }).pipe(delay(1000));
  }

  capture(orderId: string, paymentId: string): Observable<{ status: string }> {
    return of({ status: 'CAPTURED' }).pipe(
      delay(500),
      tap(() => {
        const order = this.orderService.getOrder(orderId);
        this.orderService.updateOrderPayment(orderId, {
          id: paymentId,
          amount: order?.totalAmount || 0,
          status: 'Captured',
          date: new Date().toISOString()
        });
      })
    );
  }
}
