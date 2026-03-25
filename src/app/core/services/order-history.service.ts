import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';
import { Observable, of, delay } from 'rxjs';

export interface OrderHistoryItem {
  id: string;
  date: string;
  total: number;
  status: 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  items: number;
}

@Injectable({
  providedIn: 'root'
})
export class OrderHistoryService {
  private api = inject(ApiService);

  getOrders(customerId: string): Observable<OrderHistoryItem[]> {
    return of<OrderHistoryItem[]>([
      { id: 'ORD-123456', date: new Date().toISOString(), total: 314.00, status: 'Processing', items: 2 },
      { id: 'ORD-987654', date: new Date(Date.now() - 86400000 * 5).toISOString(), total: 89.00, status: 'Delivered', items: 1 }
    ]).pipe(delay(500));
  }
}
