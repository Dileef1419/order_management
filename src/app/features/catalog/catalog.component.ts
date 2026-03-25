import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { CatalogService, Product } from '../../core/services/catalog.service';
import { CardComponent } from '../../shared/components/card/card.component';
import { BadgeComponent } from '../../shared/components/badge/badge.component';
import { InputComponent } from '../../shared/components/input/input.component';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { Router } from '@angular/router';
import { CartService } from '../../core/services/cart.service';
import { ToastService } from '../../shared/components/toast/toast.service';

@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, BadgeComponent, InputComponent, ButtonComponent],
  template: `
    <div class="container mx-auto p-6 space-y-6">
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 class="text-3xl font-bold tracking-tight">Catalog</h1>
          <p class="text-muted-foreground">Find the best products tailored for you.</p>
        </div>
        
        <div class="w-full md:w-1/3">
          <app-input [formControl]="searchControl" placeholder="Search products..." type="search"></app-input>
        </div>
      </div>

      <div class="flex gap-2 pb-4 border-b">
        <app-button variant="outline" size="sm" (onClick)="setCategory('')" [class.bg-accent]="currentCategory() === ''">All</app-button>
        <app-button variant="outline" size="sm" (onClick)="setCategory('Electronics')" [class.bg-accent]="currentCategory() === 'Electronics'">Electronics</app-button>
        <app-button variant="outline" size="sm" (onClick)="setCategory('Furniture')" [class.bg-accent]="currentCategory() === 'Furniture'">Furniture</app-button>
        <app-button variant="outline" size="sm" (onClick)="setCategory('Home')" [class.bg-accent]="currentCategory() === 'Home'">Home</app-button>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        @for(product of products(); track product.id) {
          <div 
            class="group relative flex flex-col overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-primary/50"
          >
            <!-- Image Section -->
            <div class="relative aspect-[4/3] w-full overflow-hidden bg-muted cursor-pointer" (click)="goToDetail(product.id)">
              <img 
                [src]="product.imageUrl" 
                [alt]="product.name" 
                class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div class="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              <div class="absolute top-3 right-3 z-10">
                <app-badge [variant]="product.availability ? 'success' : 'danger'">
                  {{ product.availability ? 'In Stock' : 'Out of Stock' }}
                </app-badge>
              </div>
            </div>

            <!-- Content Section -->
            <div class="flex flex-1 flex-col p-5 space-y-3">
              <div class="space-y-1">
                <div class="flex items-center justify-between gap-2">
                  <h3 class="font-bold text-lg tracking-tight line-clamp-1 group-hover:text-primary transition-colors">{{ product.name }}</h3>
                  <span class="text-xs font-semibold px-2 py-1 rounded bg-muted text-muted-foreground">{{ product.category }}</span>
                </div>
                <p class="text-sm text-muted-foreground line-clamp-2 min-h-[40px] leading-relaxed">{{ product.description }}</p>
              </div>

              <div class="pt-2 flex items-center justify-between mt-auto">
                <div class="flex flex-col">
                  <span class="text-xs text-muted-foreground font-medium uppercase tracking-wider">Price</span>
                  <span class="text-2xl font-black text-foreground tracking-tighter">₹{{ product.price | number:'1.0-0' }}</span>
                </div>
                
                <app-button 
                  size="sm" 
                  [disabled]="!product.availability" 
                  (onClick)="$event.stopPropagation(); addToCart(product)"
                  class="shadow-sm hover:shadow-md transition-all active:scale-95"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="mr-2"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
                  Add
                </app-button>
              </div>
            </div>
          </div>
        }
        
        @if(products().length === 0) {
          <div class="col-span-full text-center py-12 text-muted-foreground">
            No products found matching your criteria.
          </div>
        }
      </div>
    </div>
  `
})
export class CatalogComponent implements OnInit {
  private catalogService = inject(CatalogService);
  private router = inject(Router);
  private cartService = inject(CartService);
  private toastService = inject(ToastService);

  searchControl = new FormControl('');
  products = signal<Product[]>([]);
  currentCategory = signal<string>('');

  ngOnInit() {
    this.loadProducts();

    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(() => this.loadProducts());
  }

  setCategory(cat: string) {
    this.currentCategory.set(cat);
    this.loadProducts();
  }

  loadProducts() {
    this.catalogService.search(this.searchControl.value || '', this.currentCategory()).subscribe((res: { items: Product[], total: number }) => {
      this.products.set(res.items);
    });
  }

  goToDetail(id: string) {
    this.router.navigate(['/catalog', id]);
  }

  addToCart(product: Product) {
    this.cartService.addItem(product);
    this.toastService.show({
      title: 'Added to Cart',
      description: `${product.name} has been added to your cart.`
    });
  }
}
