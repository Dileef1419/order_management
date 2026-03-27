import { Injectable, inject, signal } from '@angular/core';
import { ApiService } from './api.service';
import { HttpParams } from '@angular/common/http';
import { Observable, of, delay } from 'rxjs';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  availability: boolean;
  imageUrl: string;
}

@Injectable({
  providedIn: 'root'
})
export class CatalogService {
  private api = inject(ApiService);

  search(term: string, category?: string, inStockOnly?: boolean): Observable<{ items: Product[], total: number }> {
    let params = new HttpParams();
    if (term) params = params.set('term', term);
    if (category) params = params.set('category', category);
    if (inStockOnly) params = params.set('inStockOnly', 'true');

    return this.api.get<{ items: Product[], total: number }>('/api/v1/catalog', params);
  }

  getProduct(id: string): Observable<Product> {
    return this.api.get<Product>(`/api/v1/catalog/${id}`);
  }

  addProduct(product: Omit<Product, 'id'>): Observable<Product> {
    return this.api.post<Product>('/api/v1/catalog', product);
  }

  deleteProduct(id: string): Observable<void> {
    return this.api.delete<void>(`/api/v1/catalog/${id}`);
  }

  toggleStock(id: string): Observable<Product> {
    return this.api.put<Product>(`/api/v1/catalog/${id}/stock`, {});
  }
}
