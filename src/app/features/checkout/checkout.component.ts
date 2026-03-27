import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CartService } from '../../core/services/cart.service';
import { OrderService, OrderPayload, OrderResponse } from '../../core/services/order.service';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { InputComponent } from '../../shared/components/input/input.component';
import { CardComponent } from '../../shared/components/card/card.component';
import { ToastService } from '../../shared/components/toast/toast.service';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ButtonComponent, InputComponent, CardComponent],
  template: `
    <div class="container mx-auto p-6 max-w-2xl">
      <h1 class="text-3xl font-bold tracking-tight mb-8">Checkout</h1>
      
      <div class="mb-8 hidden sm:flex items-center justify-between relative">
        <div class="absolute left-0 top-1/2 -translate-y-1/2 w-full h-0.5 bg-muted -z-10"></div>
        @for(stepName of ['Contact', 'Shipping', 'Review']; track stepName; let i = $index) {
          <div class="flex flex-col items-center bg-background px-4">
            <div 
              class="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-colors bg-background"
              [class.border-primary]="i <= step()"
              [class.text-primary]="i <= step()"
              [class.bg-primary]="i < step()"
              [class.text-primary-foreground]="i < step()"
              [class.border-muted]="i > step()"
              [class.text-muted-foreground]="i > step()"
            >
              {{ i < step() ? '✓' : i + 1 }}
            </div>
            <span class="text-xs font-medium mt-2" [class.text-muted-foreground]="i > step()">{{ stepName }}</span>
          </div>
        }
      </div>

      <app-card>
        <form [formGroup]="form" class="space-y-6">
          
          <div [class.hidden]="step() !== 0">
            <h2 class="text-xl font-semibold mb-4">Contact Information</h2>
            <div formGroupName="contact" class="space-y-4">
              <app-input formControlName="email" label="Email Address" type="email"></app-input>
              <app-input formControlName="phone" label="Phone Number"></app-input>
            </div>
          </div>

          <div [class.hidden]="step() !== 1">
            <h2 class="text-xl font-semibold mb-4">Shipping Address</h2>
            <div formGroupName="shipping" class="space-y-4">
              <app-input formControlName="fullName" label="Full Name"></app-input>
              <app-input formControlName="addressLine1" label="Address Line 1"></app-input>
              <div class="grid grid-cols-2 gap-4">
                <app-input formControlName="city" label="City"></app-input>
                <app-input formControlName="postalCode" label="Postal Code"></app-input>
              </div>
              <app-input formControlName="country" label="Country"></app-input>
            </div>
          </div>

          <div [class.hidden]="step() !== 2">
            <h2 class="text-xl font-semibold mb-4">Review Your Order</h2>
            <div class="space-y-4">
              <div class="border rounded-md p-4 bg-muted/20">
                <h3 class="font-medium mb-2">Order Items</h3>
                @for(item of cart.items(); track item.product.id) {
                  <div class="flex justify-between py-1 text-sm">
                    <span>{{ item.quantity }}x {{ item.product.name }}</span>
                    <span>₹{{ item.product.price * item.quantity }}</span>
                  </div>
                }
              </div>
              
              <div class="border rounded-md p-4 bg-muted/20">
                <div class="flex justify-between font-bold text-lg">
                  <span>Total to Pay</span>
                  <span>₹{{ totalAmount }}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div class="flex justify-between pt-6 border-t mt-8">
            <app-button variant="outline" type="button" (onClick)="prevStep()" [disabled]="step() === 0 || isSubmitting()">
              Back
            </app-button>
            <app-button type="button" (onClick)="nextStep()" [disabled]="isSubmitting()">
              {{ isSubmitting() ? 'Processing...' : (step() === 2 ? 'Place Order & Pay' : 'Continue') }}
            </app-button>
          </div>
        </form>
      </app-card>
    </div>
  `
})
export class CheckoutComponent {
  private fb = inject(FormBuilder);
  cart = inject(CartService);
  private orderService = inject(OrderService);
  private router = inject(Router);
  private toast = inject(ToastService);

  step = signal(0);
  isSubmitting = signal(false);

  form: FormGroup = this.fb.group({
    contact: this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required]
    }),
    shipping: this.fb.group({
      fullName: ['', Validators.required],
      addressLine1: ['', Validators.required],
      city: ['', Validators.required],
      postalCode: ['', Validators.required],
      country: ['', Validators.required]
    })
  });

  get totalAmount() {
    return this.cart.total;
  }

  nextStep() {
    const currentGroup = this.step() === 0 ? 'contact' : 
                         this.step() === 1 ? 'shipping' : null;
    
    if (currentGroup) {
      const control = this.form.get(currentGroup);
      if (control?.invalid) {
        control.markAllAsTouched();
        this.toast.show({ title: 'Validation Error', description: 'Please fill all required fields correctly', variant: 'destructive' });
        return;
      }
    }

    if (this.step() < 2) {
      this.step.update((v: number) => v + 1);
    } else {
      this.submitOrder();
    }
  }

  prevStep() {
    if (this.step() > 0) {
      this.step.update((v: number) => v - 1);
    }
  }

  submitOrder() {
    if (this.cart.items().length === 0) {
      this.toast.show({ title: 'Error', description: 'Your cart is empty', variant: 'destructive' });
      return;
    }

    this.isSubmitting.set(true);
    const idempotencyKey = crypto.randomUUID();
    
    const payload: OrderPayload = {
      contact: this.form.get('contact')?.value,
      shipping: this.form.get('shipping')?.value,
      items: this.cart.items(),
      totalAmount: this.totalAmount
    };

    this.orderService.createOrder(payload, idempotencyKey).subscribe({
      next: (res: OrderResponse) => {
        this.toast.show({ title: 'Order Drafted', description: `Proceeding to payment...` });
        this.router.navigate(['/pay', res.orderId]);
      },
      error: () => {
        this.isSubmitting.set(false);
        this.toast.show({ title: 'Error', description: 'Failed to create order', variant: 'destructive' });
      }
    });
  }
}
