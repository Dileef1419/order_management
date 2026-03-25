import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PaymentService } from '../../core/services/payment.service';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { CardComponent } from '../../shared/components/card/card.component';
import { InputComponent } from '../../shared/components/input/input.component';
import { ToastService } from '../../shared/components/toast/toast.service';

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ButtonComponent, CardComponent, InputComponent],
  template: `
    <div class="container mx-auto p-6 max-w-lg">
      <app-card title="Complete Payment" [description]="'Paying for order ' + orderId()">
        
        @if(paymentStatus() === 'pending') {
          <form [formGroup]="paymentForm" (ngSubmit)="processPayment()" class="space-y-4">
            <app-input formControlName="cardNumber" label="Card Number" placeholder="0000 0000 0000 0000" [error]="f['cardNumber'].touched && f['cardNumber'].invalid ? 'Valid card required' : ''"></app-input>
            
            <div class="grid grid-cols-2 gap-4">
              <app-input formControlName="expiry" label="Expiry (MM/YY)" placeholder="12/25" [error]="f['expiry'].touched && f['expiry'].invalid ? 'Required' : ''"></app-input>
              <app-input formControlName="cvc" label="CVC" type="password" placeholder="123" [error]="f['cvc'].touched && f['cvc'].invalid ? 'Required' : ''"></app-input>
            </div>
            
            <app-input formControlName="nameOnCard" label="Name on Card" placeholder="John Doe" [error]="f['nameOnCard'].touched && f['nameOnCard'].invalid ? 'Required' : ''"></app-input>

            <div class="pt-4 hidden">
              <!-- Simulated idempotency key field -->
            </div>

            <app-button type="submit" [fullWidth]="true" size="lg" [disabled]="isProcessing()">
              {{ isProcessing() ? 'Processing Payment...' : 'Pay Now' }}
            </app-button>
          </form>
        } @else if(paymentStatus() === 'success') {
          <div class="text-center py-8">
            <div class="h-16 w-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">✓</div>
            <h2 class="text-2xl font-bold mb-2">Payment Successful!</h2>
            <p class="text-muted-foreground mb-6">Your order {{ orderId() }} has been confirmed and is being processed.</p>
            <app-button (click)="goToOrders()" [fullWidth]="true">View My Orders</app-button>
          </div>
        } @else {
          <div class="text-center py-8">
            <div class="h-16 w-16 bg-red-100 text-destructive rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">✕</div>
            <h2 class="text-2xl font-bold mb-2">Payment Failed</h2>
            <p class="text-muted-foreground mb-6">We couldn't process your payment. Please try again.</p>
            <app-button (click)="retryPayment()" [fullWidth]="true" variant="outline">Try Again</app-button>
          </div>
        }

      </app-card>
    </div>
  `
})
export class PaymentComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private paymentService = inject(PaymentService);
  private toast = inject(ToastService);

  orderId = signal<string>('');
  paymentStatus = signal<'pending' | 'success' | 'failed'>('pending');
  isProcessing = signal(false);

  paymentForm: FormGroup = this.fb.group({
    cardNumber: ['', [Validators.required, Validators.minLength(16)]],
    expiry: ['', [Validators.required]],
    cvc: ['', [Validators.required, Validators.minLength(3)]],
    nameOnCard: ['', Validators.required]
  });

  get f() { return this.paymentForm.controls; }

  ngOnInit() {
    this.orderId.set(this.route.snapshot.paramMap.get('orderId') || '');
    if (!this.orderId()) {
      this.toast.show({ title: 'Error', description: 'Invalid order reference', variant: 'destructive' });
      this.router.navigate(['/catalog']);
    }
  }

  processPayment() {
    if (this.paymentForm.invalid) {
      this.paymentForm.markAllAsTouched();
      return;
    }

    this.isProcessing.set(true);
    
    this.paymentService.authorise(this.orderId(), this.paymentForm.value).subscribe({
      next: (authRes: { paymentId: string, status: string }) => {
        this.paymentService.capture(this.orderId(), authRes.paymentId).subscribe({
          next: () => {
            this.isProcessing.set(false);
            this.paymentStatus.set('success');
            this.toast.show({ title: 'Success', description: 'Payment completed successfully', variant: 'default' });
          },
          error: () => {
            this.isProcessing.set(false);
            this.paymentStatus.set('failed');
          }
        });
      },
      error: () => {
        this.isProcessing.set(false);
        this.paymentStatus.set('failed');
      }
    });
  }

  retryPayment() {
    this.paymentStatus.set('pending');
    this.paymentForm.reset();
  }

  goToOrders() {
    this.router.navigate(['/orders']);
  }
}
