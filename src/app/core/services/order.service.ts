import { Injectable, inject, signal } from '@angular/core';
import { ApiService } from './api.service';
import { Observable, of, delay } from 'rxjs';
import { CartItem } from './cart.service';

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

  private getInitialOrders(): Order[] {
    const saved = localStorage.getItem('mock_orders');
    return saved ? JSON.parse(saved) : [];
  }

  orders = signal<Order[]>(this.getInitialOrders());

  private save() {
    localStorage.setItem('mock_orders', JSON.stringify(this.orders()));
  }

  createOrder(payload: OrderPayload, idempotencyKey: string): Observable<OrderResponse> {
    const newOrder: Order = {
      id: `ORD-${Math.floor(Math.random() * 1000000)}`,
      date: new Date().toISOString(),
      ...payload,
      status: 'Pending Payment',
      payment: null
    };
    this.orders.update((v: Order[]) => [newOrder, ...v]);
    this.save();
    return of({
      orderId: newOrder.id,
      status: 'CREATED',
      clientSecret: 'pi_mock_secret_123'
    }).pipe(delay(800));
  }

  getOrder(id: string): Order | undefined {
    return this.orders().find(o => o.id === id);
  }

  updateOrderPayment(id: string, payment: any) {
    this.orders.update((v: Order[]) => v.map((o: Order) => o.id === id ? { ...o, status: 'Processing', payment } : o));
    this.save();
  }

  updateOrderStatus(id: string, status: string) {
    this.orders.update((v: Order[]) => v.map((o: Order) => o.id === id ? { ...o, status } : o));
    this.save();
  }
}
