import { Injectable, inject, signal } from '@angular/core';
import { ApiService } from './api.service';
import { Observable, of, delay, tap, map } from 'rxjs';
import { CartItem } from './cart.service';
import { AuthService } from './auth.service';
import { HttpHeaders } from '@angular/common/http';

export interface OrderPayload {
  contact: { email: string; phone: string };
  shipping: { fullName: string; addressLine1: string; city: string; postalCode: string; country: string };
  items: CartItem[];
  totalAmount: number;
}

export interface OrderResponse {
  orderId: string;
  status: string;
  clientSecret?: string;
}

export interface Order {
  id: string;
  date: string;
  totalAmount: number;
  status: string;
  contact: any;
  shipping: any;
  items: CartItem[];
  payment?: any;
}

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private api = inject(ApiService);

  orders = signal<Order[]>([]);

  private auth = inject(AuthService);

  refreshOrders(): Observable<Order[]> {
    const customerId = this.auth.currentUserValue?.id;
    if (!customerId) return of([]);

    return this.api.get<any[]>(`/api/v1/orders/by-customer/${customerId}`).pipe(
      tap((backendOrders: any[]) => {
        const mappedOrders = (backendOrders || [])
          .filter(o => o.orderId || o.OrderId || o.Id || o.id) // Only keep orders with an ID
          .map(o => ({
            id: o.orderId || o.OrderId || o.Id || o.id,
            date: o.placedAt || o.PlacedAt || o.date,
            totalAmount: o.totalAmount || o.TotalAmount,
            status: o.status || o.Status,
            itemsCount: o.itemCount || o.ItemCount
          } as any));
        this.orders.set(mappedOrders);
      })
    );
  }

  createOrder(payload: OrderPayload, idempotencyKey: string): Observable<OrderResponse> {
    const headers = new HttpHeaders().set('Idempotency-Key', idempotencyKey);
    const placeOrderRequest = {
      customerId: this.auth.currentUserValue?.id || '00000000-0000-0000-0000-000000000000',
      customerName: payload.shipping.fullName || this.auth.currentUserValue?.email || 'Guest',
      lines: payload.items.map(i => ({
        sku: i.product.id,
        quantity: i.quantity,
        unitPrice: i.product.price
      }))
    };
    
    return this.api.post<OrderResponse>('/api/v1/orders', placeOrderRequest, headers);
  }

  confirmOrder(orderId: string): Observable<OrderResponse> {
    return this.api.put<OrderResponse>(`/api/v1/orders/${orderId}/confirm`, {});
  }

  failOrder(orderId: string, reason: string): Observable<OrderResponse> {
    return this.api.put<OrderResponse>(`/api/v1/orders/${orderId}/fail`, { reason });
  }

  getOrder(id: string): Observable<any> {
    return this.api.get<any>(`/api/v1/orders/${id}`);
  }

  updateOrderPayment(id: string, payment: any): Observable<any> {
    // In a real app, this might be a PATCH to /api/v1/orders/{id}/payment
    return this.api.put<any>(`/api/v1/orders/${id}/payment`, { payment });
  }

  updateOrderStatus(id: string, status: string): Observable<any> {
    if (status === 'Cancelled') {
      return this.api.put<any>(`/api/v1/orders/${id}/cancel`, { reason: 'Admin override' });
    }
    // For other statuses (Shipped, Delivered), we'll assume a PATCH exists or add it
    return this.api.patch<any>(`/api/v1/orders/${id}/status`, { status });
  }

  getAllOrders(): Observable<any[]> {
    return this.api.get<any[]>('/api/v1/orders').pipe(
      map((backendOrders: any[]) => (backendOrders || [])
        .map(o => ({
          id: o.orderId || o.OrderId || o.Id || o.id,
          customerName: o.customerName || o.CustomerName,
          date: o.placedAt || o.PlacedAt || o.date || o.createdAt || o.CreatedAt,
          totalAmount: o.totalAmount || o.TotalAmount || o.total || o.Total,
          status: o.status || o.Status,
          itemsCount: o.itemCount || o.ItemCount
        } as any))
      )
    );
  }

  getDashboard(): Observable<any> {
    return this.api.get<any>('/api/v1/orders/dashboard');
  }
}
