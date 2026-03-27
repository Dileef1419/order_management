import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';
import { Observable, switchMap, tap, of } from 'rxjs';
import { OrderService } from './order.service';
import { AuthService } from './auth.service';
import { HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private api = inject(ApiService);
  private orderService = inject(OrderService);
  private auth = inject(AuthService);

  authorise(orderId: string, cardDetails: any): Observable<{ paymentId: string, status: string }> {
    return this.orderService.getOrder(orderId).pipe(
      switchMap((order: any) => {
        const idempotencyKey = crypto.randomUUID();
        const headers = new HttpHeaders().set('Idempotency-Key', idempotencyKey);
        return this.api.post<any>('/api/v1/payments/authorise', {
          orderId: orderId,
          customerId: this.auth.currentUserValue?.id,
          amount: order?.totalAmount || 0,
          currency: 'INR'
        }, headers);
      })
    );
  }

  capture(orderId: string, paymentId: string): Observable<{ status: string }> {
    return this.api.post<any>(`/api/v1/payments/${paymentId}/capture`, null);
  }

  getRevenueReport(from: string, to: string, currency: string = 'INR'): Observable<any[]> {
    return this.api.get<any[]>(`/api/v1/payments/revenue?from=${from}&to=${to}&currency=${currency}`);
  }

  getPaymentsByCustomer(): Observable<any[]> {
    const customerId = this.auth.currentUserValue?.id;
    if (!customerId) return of([]);
    return this.api.get<any[]>(`/api/v1/payments/by-customer/${customerId}`);
  }

  getAllPayments(): Observable<any[]> {
    return this.api.get<any[]>('/api/v1/payments');
  }

  refund(paymentId: string, amount: number, reason: string = 'Admin request'): Observable<any> {
    return this.api.post<any>(`/api/v1/payments/${paymentId}/refund`, { amount, reason });
  }
}
