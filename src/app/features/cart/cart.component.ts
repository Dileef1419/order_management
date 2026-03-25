import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartService } from '../../core/services/cart.service';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { CardComponent } from '../../shared/components/card/card.component';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, ButtonComponent, CardComponent, RouterLink],
  template: `
    <div class="container mx-auto p-6">
      <app-button variant="ghost" class="mb-4 px-0 hover:bg-transparent hover:underline" routerLink="/catalog">← Back to Catalog</app-button>
      <h1 class="text-3xl font-bold tracking-tight mb-6">Shopping Cart</h1>
      
      @if(cart.items().length > 0) {
        <div class="grid lg:grid-cols-3 gap-8">
          <div class="lg:col-span-2 space-y-4">
            @for(item of cart.items(); track item.product.id) {
              <app-card class="bg-card p-4">
                <div class="flex sm:items-center flex-col sm:flex-row gap-4">
                  <div class="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border">
                    <img [src]="item.product.imageUrl" [alt]="item.product.name" class="h-full w-full object-cover object-center" />
                  </div>
                  <div class="flex flex-1 flex-col">
                    <div class="flex justify-between text-base font-semibold">
                      <h3>{{ item.product.name }}</h3>
                      <p class="ml-4">₹{{ item.product.price * item.quantity }}</p>
                    </div>
                    <p class="mt-1 text-sm text-muted-foreground">{{ item.product.category }}</p>
                    <div class="flex flex-1 items-end justify-between text-sm mt-4">
                      <div class="flex items-center gap-2 bg-muted/50 p-1 rounded-md">
                        <app-button variant="ghost" size="sm" class="h-8 w-8 p-0" (onClick)="updateQty(item.product.id, item.quantity - 1)">-</app-button>
                        <span class="w-8 text-center font-medium">{{ item.quantity }}</span>
                        <app-button variant="ghost" size="sm" class="h-8 w-8 p-0" (onClick)="updateQty(item.product.id, item.quantity + 1)">+</app-button>
                      </div>
                      <app-button variant="ghost" size="sm" class="text-destructive font-semibold hover:bg-destructive/10" (onClick)="remove(item.product.id)">Remove</app-button>
                    </div>
                  </div>
                </div>
              </app-card>
            }
          </div>
          
          <div class="lg:col-span-1">
            <app-card class="sticky top-6">
              <h2 class="text-xl font-bold mb-4">Order Summary</h2>
              <div class="space-y-4">
                <div class="flex justify-between border-b pb-4 text-sm">
                  <p class="text-muted-foreground">Subtotal</p>
                  <p class="font-medium">₹{{ cart.total }}</p>
                </div>
                <div class="flex justify-between border-b pb-4 text-sm">
                  <p class="text-muted-foreground">Shipping estimate</p>
                  <p class="font-medium text-muted-foreground">Calculated next step</p>
                </div>
                <div class="flex justify-between py-2 font-bold text-xl">
                  <p>Total</p>
                  <p>₹{{ cart.total }}</p>
                </div>
                <app-button [fullWidth]="true" size="lg" class="mt-4" (onClick)="checkout()">Proceed to Checkout</app-button>
              </div>
            </app-card>
          </div>
        </div>
      } @else {
        <div class="text-center py-16 flex flex-col items-center">
          <div class="h-24 w-24 rounded-full bg-muted flex items-center justify-center mb-6">
             <span class="text-4xl">🛒</span>
          </div>
          <h2 class="text-3xl font-bold mb-2 tracking-tight">Your cart is empty</h2>
          <p class="text-muted-foreground mb-8 text-lg">Looks like you haven't added anything yet.</p>
          <app-button routerLink="/catalog" size="lg">Continue Shopping</app-button>
        </div>
      }
    </div>
  `
})
export class CartComponent {
  cart = inject(CartService);
  private router = inject(Router);

  updateQty(productId: string, qty: number) {
    this.cart.updateQuantity(productId, qty);
  }

  remove(productId: string) {
    this.cart.removeItem(productId);
  }

  checkout() {
    this.router.navigate(['/checkout']);
  }
}
