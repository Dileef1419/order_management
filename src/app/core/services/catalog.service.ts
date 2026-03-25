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

  private getInitialProducts(): Product[] {
    const saved = localStorage.getItem('mock_products');
    if (saved) return JSON.parse(saved);
    
    const defaults = [
      { id: '1', name: 'Wireless Headphones', description: 'Noise cancelling overhead headphones', price: 299, category: 'Electronics', availability: true, imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80' },
      { id: '2', name: 'Ergonomic Chair', description: 'Office chair with lumbar support', price: 199, category: 'Furniture', availability: true, imageUrl: 'https://images.unsplash.com/photo-1592078615290-033ee584e267?w=500&q=80' },
      { id: '3', name: 'Smartwatch', description: 'Fitness tracker and watch', price: 149, category: 'Electronics', availability: false, imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80' },
      { id: '4', name: 'Coffee Maker', description: 'Programmable drip coffee maker', price: 89, category: 'Home', availability: true, imageUrl: 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=500&q=80' },
    ];
    localStorage.setItem('mock_products', JSON.stringify(defaults));
    return defaults;
  }

  private mockProducts = signal<Product[]>(this.getInitialProducts());

  private save() {
    localStorage.setItem('mock_products', JSON.stringify(this.mockProducts()));
  }

  search(term: string, category?: string, inStockOnly?: boolean): Observable<{ items: Product[], total: number }> {
    let filtered = this.mockProducts();
    if (term) filtered = filtered.filter((p: Product) => p.name.toLowerCase().includes(term.toLowerCase()));
    if (category) filtered = filtered.filter((p: Product) => p.category === category);
    if (inStockOnly) filtered = filtered.filter((p: Product) => p.availability);

    return of({ items: filtered, total: filtered.length }).pipe(delay(300));
  }

  getProduct(id: string): Observable<Product> {
    const product = this.mockProducts().find((p: Product) => p.id === id);
    if (!product) throw new Error('Not found');
    return of(product).pipe(delay(200));
  }

  addProduct(product: Omit<Product, 'id'>) {
    const newProduct = { ...product, id: Math.random().toString(36).substring(2, 9) };
    this.mockProducts.update((v: Product[]) => [...v, newProduct as Product]);
    this.save();
  }

  deleteProduct(id: string) {
    this.mockProducts.update((v: Product[]) => v.filter((p: Product) => p.id !== id));
    this.save();
  }

  toggleStock(id: string) {
    this.mockProducts.update((v: Product[]) => v.map((p: Product) => p.id === id ? { ...p, availability: !p.availability } : p));
    this.save();
  }
}
