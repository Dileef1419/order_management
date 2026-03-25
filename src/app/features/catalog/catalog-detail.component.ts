import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { CatalogService, Product } from '../../core/services/catalog.service';
import { CartService } from '../../core/services/cart.service';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { BadgeComponent } from '../../shared/components/badge/badge.component';
import { ToastService } from '../../shared/components/toast/toast.service';

@Component({
  selector: 'app-catalog-detail',
  standalone: true,
  imports: [CommonModule, ButtonComponent, BadgeComponent],
  template: `
    <div class="container mx-auto p-6">
      <app-button variant="ghost" class="mb-6" (onClick)="goBack()">← Back to Catalog</app-button>
      
      @if(product(); as p) {
        <div class="grid md:grid-cols-2 gap-12">
          <div class="rounded-xl overflow-hidden border bg-muted/20 flex items-center justify-center">
            <img [src]="p.imageUrl" [alt]="p.name" class="w-full h-auto object-cover max-h-[500px]" />
          </div>
          
          <div class="flex flex-col space-y-6">
            <div>
              <app-badge class="mb-2">{{ p.category }}</app-badge>
              <h1 class="text-4xl font-bold tracking-tight mb-2">{{ p.name }}</h1>
              <div class="text-3xl font-semibold text-primary border-b pb-6">₹{{ p.price }}</div>
            </div>
            
            <p class="text-muted-foreground leading-relaxed text-lg">{{ p.description }}</p>
            
            <div class="pt-6 space-y-4">
              <div class="flex items-center gap-4 text-sm font-medium">
                Availability:
                <span [class.text-green-600]="p.availability" [class.text-destructive]="!p.availability">
                  {{ p.availability ? 'In Stock' : 'Out of Stock' }}
                </span>
              </div>
              <div class="flex gap-4">
                <app-button variant="outline" size="lg" [fullWidth]="true" [disabled]="!p.availability" (onClick)="addToCart(p)">
                  {{ p.availability ? 'Add to Cart' : 'Out of Stock' }}
                </app-button>
                <app-button size="lg" [fullWidth]="true" [disabled]="!p.availability" (onClick)="buyNow(p)">
                  Buy Now
                </app-button>
              </div>
            </div>
          </div>
        </div>
      } @else {
        <div class="py-12 text-center text-muted-foreground">Loading product details...</div>
      }
    </div>
  `
})
export class CatalogDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private catalogService = inject(CatalogService);
  private cartService = inject(CartService); 
  private toastService = inject(ToastService);

  product = signal<Product | null>(null);

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('productId');
    if (id) {
      this.catalogService.getProduct(id).subscribe({
        next: (p: Product) => this.product.set(p),
        error: () => {
          this.toastService.show({ title: 'Error', description: 'Product not found', variant: 'destructive' });
          this.goBack();
        }
      });
    }
  }

  goBack() {
    this.router.navigate(['/catalog']);
  }

  addToCart(product: Product) {
    this.cartService.addItem(product);
    this.toastService.show({ title: 'Added to cart', description: `${product.name} was added to your cart.` });
  }

  buyNow(product: Product) {
    this.cartService.addItem(product);
    this.router.navigate(['/checkout']);
  }
}
