import { Injectable, signal, computed } from '@angular/core';
import { Product } from './catalog.service';

export interface CartItem {
  product: Product;
  quantity: number;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  items = signal<CartItem[]>([]);

  addItem(product: Product, quantity = 1) {
    this.items.update((currentItems: CartItem[]) => {
      const existing = currentItems.find((i: CartItem) => i.product.id === product.id);
      if (existing) {
        return currentItems.map((i: CartItem) => i.product.id === product.id ? { ...i, quantity: i.quantity + quantity } : i);
      }
      return [...currentItems, { product, quantity }];
    });
  }

  removeItem(productId: string) {
    this.items.update((current: CartItem[]) => current.filter((i: CartItem) => i.product.id !== productId));
  }

  updateQuantity(productId: string, quantity: number) {
    if (quantity <= 0) {
      this.removeItem(productId);
      return;
    }
    this.items.update((current: CartItem[]) => current.map((i: CartItem) => i.product.id === productId ? { ...i, quantity } : i));
  }
  
  clear() {
    this.items.set([]);
  }

  get total() {
    return this.items().reduce((sum: number, item: CartItem) => sum + (item.product.price * item.quantity), 0);
  }

  totalItems = computed(() => this.items().reduce((sum: number, item: CartItem) => sum + item.quantity, 0));
}
