import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';

export interface ShipmentItem {
  sku: string;
  quantity: number;
}

export interface Shipment {
  shipmentId: string;
  orderId: string;
  warehouseId: number;
  status: 'Pending' | 'Packed' | 'Dispatched' | 'Delivered' | 'Cancelled';
  carrierRef?: string;
  trackingNumber?: string;
  items: ShipmentItem[];
  createdAt: string;
  dispatchedAt?: string;
}

@Injectable({
  providedIn: 'root'
})
export class FulfilmentService {
  private api = inject(ApiService);

  getShipmentByOrder(orderId: string): Observable<Shipment> {
    return this.api.get<Shipment>(`/api/v1/fulfilment/by-order/${orderId}`);
  }

  getWarehouseQueue(warehouseId: number, status?: string): Observable<Shipment[]> {
    let url = `/api/v1/fulfilment/warehouse/${warehouseId}/queue`;
    if (status) url += `?status=${status}`;
    return this.api.get<Shipment[]>(url);
  }
}
