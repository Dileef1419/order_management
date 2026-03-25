import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardComponent } from '../../../shared/components/card/card.component';
import { TableComponent } from '../../../shared/components/table/table.component';
import { BadgeComponent } from '../../../shared/components/badge/badge.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { InputComponent } from '../../../shared/components/input/input.component';
import { AuthService } from '../../../core/services/auth.service';
import { CatalogService } from '../../../core/services/catalog.service';
import { OrderService } from '../../../core/services/order.service';
import { ToastService } from '../../../shared/components/toast/toast.service';
import { AdminPaymentsComponent } from '../payments/admin-payments.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, CardComponent, TableComponent, BadgeComponent, ButtonComponent, InputComponent, AdminPaymentsComponent],
  template: `
    <div class="container mx-auto p-6 space-y-8">
      <div>
        <h1 class="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p class="text-muted-foreground mt-1">Overview of your store's performance.</p>
      </div>

      <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div class="flex flex-col p-6 rounded-xl border bg-card shadow-sm space-y-2">
          <div class="flex items-center justify-between">
            <h3 class="text-xs font-bold uppercase tracking-wider text-muted-foreground">Registered Customers</h3>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-primary"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          </div>
          <div class="text-3xl font-black">{{ registeredCount() }}</div>
          <div class="flex items-center gap-1 text-[10px] font-bold text-green-600 bg-green-50 w-fit px-1.5 py-0.5 rounded uppercase">Live</div>
        </div>
        
        <div class="flex flex-col p-6 rounded-xl border bg-card shadow-sm space-y-2">
          <div class="flex items-center justify-between">
            <h3 class="text-xs font-bold uppercase tracking-wider text-muted-foreground">Store Orders</h3>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-primary"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
          </div>
          <div class="text-3xl font-black">{{ orders().length }}</div>
          <div class="flex items-center gap-1 text-[10px] font-bold text-primary/60 bg-primary/5 w-fit px-1.5 py-0.5 rounded uppercase">Total</div>
        </div>

        <div class="flex flex-col p-6 rounded-xl border bg-card shadow-sm space-y-2">
          <div class="flex items-center justify-between">
            <h3 class="text-xs font-bold uppercase tracking-wider text-muted-foreground">Inventory Alerts</h3>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-destructive"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
          </div>
          <div class="text-3xl font-black text-destructive">12</div>
          <div class="flex items-center gap-1 text-[10px] font-bold text-destructive bg-destructive/5 w-fit px-1.5 py-0.5 rounded uppercase font-black">Urgent</div>
        </div>

        <div class="flex flex-col p-6 rounded-xl border bg-card shadow-sm space-y-2">
          <div class="flex items-center justify-between">
            <h3 class="text-xs font-bold uppercase tracking-wider text-muted-foreground">Revenue (Est)</h3>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-primary"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
          </div>
          <div class="text-3xl font-black">₹48.2k</div>
          <div class="flex items-center gap-1 text-[10px] font-bold text-primary/60 bg-primary/5 w-fit px-1.5 py-0.5 rounded uppercase">Month</div>
        </div>
      </div>
      
      <!-- Admin Add Product Section -->
      <div class="grid lg:grid-cols-3 gap-8 mt-12">
        <div class="lg:col-span-1 space-y-2">
          <h2 class="text-2xl font-black tracking-tight uppercase">Quick Inventory</h2>
          <p class="text-sm text-muted-foreground leading-relaxed">Add new products to your digital storefront instantly with localized pricing and stock management.</p>
        </div>

        <div class="lg:col-span-2">
          <div class="rounded-2xl border bg-card p-8 shadow-md">
            <form (ngSubmit)="addProduct()" class="space-y-6">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <app-input label="PRODUCT NAME" placeholder="e.g. Ultra Gaming Mouse" [(ngModel)]="newProduct.name" name="name" required></app-input>
                <app-input type="number" label="PRICE (₹)" placeholder="0.00" [(ngModel)]="newProduct.price" name="price" required></app-input>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <app-input label="CATEGORY" placeholder="Electronics, Furniture..." [(ngModel)]="newProduct.category" name="category" required></app-input>
                
                <div class="flex flex-col space-y-2">
                  <label class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">IMAGE UPLOAD</label>
                  <div 
                    class="group relative flex flex-col items-center justify-center w-full h-[40px] border-2 border-dashed border-muted-foreground/20 rounded-lg cursor-pointer transition-all hover:bg-muted/50 hover:border-primary/50"
                    [class.ring-2]="isDragging"
                    [class.ring-primary]="isDragging"
                    (dragover)="onDragOver($event)"
                    (dragleave)="onDragLeave($event)"
                    (drop)="onDrop($event)"
                    (click)="fileInput.click()"
                  >
                    @if(newProduct.imageUrl) {
                      <div class="flex items-center gap-2 text-xs font-bold text-primary">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                        READY TO UPLOAD
                      </div>
                    } @else {
                      <div class="flex items-center gap-2 text-xs text-muted-foreground font-medium">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                        DROP IMAGE OR CLICK
                      </div>
                    }
                    <input #fileInput type="file" accept="image/*" class="hidden" (change)="onFileSelected($event)" />
                  </div>
                </div>
              </div>

              <app-input label="DESCRIPTION" placeholder="Enter product details..." [(ngModel)]="newProduct.description" name="description" required></app-input>
              
              <div class="flex justify-end pt-2 border-t mt-6">
                <app-button type="submit" size="lg" class="w-full md:w-auto px-12">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="mr-2"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
                  PUBLISH PRODUCT
                </app-button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <!-- Admin Products Table -->
      <h2 class="text-2xl font-bold mt-8 mb-4">Catalog Inventory</h2>
      <app-card>
        <app-table [data]="products()" [columns]="productCols" [searchable]="true">
          <ng-template #cellTemplate let-row let-col="column">
            @if(col.field === 'image') {
              <div class="h-10 w-10 rounded-md overflow-hidden border bg-muted flex-shrink-0">
                @if(row.imageUrl) {
                  <img [src]="row.imageUrl" [alt]="row.name" class="h-full w-full object-cover">
                } @else {
                  <span class="flex items-center justify-center h-full w-full text-[10px] text-muted-foreground">No img</span>
                }
              </div>
            }
            @if(col.field === 'id') { <span class="font-mono text-xs">{{ row.id }}</span> }
            @if(col.field === 'name') { <span class="font-medium">{{ row.name }}</span> }
            @if(col.field === 'description') { <span class="text-xs text-muted-foreground line-clamp-1 max-w-[150px]" [title]="row.description">{{ row.description }}</span> }
            @if(col.field === 'price') { ₹{{ row.price }} }
            @if(col.field === 'category') { {{ row.category }} }
            @if(col.field === 'availability') { 
              <app-badge [variant]="row.availability ? 'success' : 'danger'">
                {{ row.availability ? 'In Stock' : 'Out of Stock' }}
              </app-badge> 
            }
            @if(col.field === 'actions') {
              <div class="flex flex-col gap-2 sm:flex-row">
                <app-button variant="outline" size="sm" (onClick)="toggleStock(row.id)">
                  {{ row.availability ? 'Mark Out of Stock' : 'Mark In Stock' }}
                </app-button>
                <app-button variant="destructive" size="sm" (onClick)="deleteProduct(row.id)">Delete</app-button>
              </div>
            }
          </ng-template>
        </app-table>
      </app-card>

      <!-- Admin Customers Section -->
      <h2 class="text-2xl font-bold mt-8 mb-4">Registered Customers</h2>
      <app-card>
        <div class="p-4 space-y-4">
          @for(user of customers(); track user) {
            <div class="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0">
              <div class="font-medium">{{ user }}</div>
              <app-button variant="outline" size="sm" (onClick)="removeCustomer(user)">Revoke Access</app-button>
            </div>
          }
          @if(customers().length === 0) {
            <p class="text-muted-foreground text-sm">No customers registered yet.</p>
          }
        </div>
      </app-card>

      <!-- Admin Orders Section -->
      <h2 class="text-2xl font-bold mt-8 mb-4">Recent Orders (Admin View)</h2>
      <app-card>
        <app-table [data]="orders()" [columns]="orderCols" [searchable]="true">
          <ng-template #cellTemplate let-row let-col="column">
            @if(col.field === 'id') { <span class="font-medium font-mono text-sm">{{ row.id }}</span> }
            @if(col.field === 'date') { {{ row.date | date:'short' }} }
            @if(col.field === 'totalAmount') { ₹{{ row.totalAmount | number:'1.2-2' }} }
            @if(col.field === 'status') {
              <app-badge [variant]="row.status === 'Cancelled' ? 'destructive' : 'default'">{{ row.status }}</app-badge>
            }
            @if(col.field === 'actions') {
              <div class="flex gap-2">
                @if(row.status === 'Processing') {
                  <app-button variant="secondary" size="sm" (onClick)="updateOrderStatus(row.id, 'Shipped')">Ship</app-button>
                  <app-button variant="destructive" size="sm" (onClick)="updateOrderStatus(row.id, 'Cancelled')">Cancel</app-button>
                }
                @if(row.status === 'Shipped') {
                  <app-button variant="default" size="sm" (onClick)="updateOrderStatus(row.id, 'Delivered')">Deliver</app-button>
                }
              </div>
            }
          </ng-template>
        </app-table>
      </app-card>

      <!-- embedded Payments Component -->
      <app-admin-payments></app-admin-payments>
    </div>
  `
})
export class DashboardComponent {
  private authService = inject(AuthService);
  private catalogService = inject(CatalogService);
  private orderService = inject(OrderService);
  private toastService = inject(ToastService);

  registeredCount = signal(this.authService.getRegisteredUsers().length);

  newProduct = {
    name: '',
    description: '',
    price: 0,
    category: '',
    availability: true,
    imageUrl: ''
  };

  addProduct() {
    if(!this.newProduct.name || !this.newProduct.price) return;
    this.catalogService.addProduct({...this.newProduct});
    this.catalogService.search('').subscribe(res => this.products.set(res.items));
    this.toastService.show({ title: 'Product Added', description: `${this.newProduct.name} is now live.` });
    this.newProduct = { name: '', description: '', price: 0, category: '', availability: true, imageUrl: '' };
  }

  isDragging = false;
  onDragOver(event: DragEvent) { event.preventDefault(); this.isDragging = true; }
  onDragLeave(event: DragEvent) { event.preventDefault(); this.isDragging = false; }
  onDrop(event: DragEvent) {
    event.preventDefault(); this.isDragging = false;
    const file = event.dataTransfer?.files[0];
    if (file && file.type.startsWith('image/')) this.handleFile(file);
  }
  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) this.handleFile(input.files[0]);
  }
  handleFile(file: File) {
    const reader = new FileReader();
    reader.onload = () => this.newProduct.imageUrl = reader.result as string;
    reader.readAsDataURL(file);
  }

  orders = this.orderService.orders;
  
  orderCols = [
    { header: 'Order ID', field: 'id' },
    { header: 'Date', field: 'date' },
    { header: 'Total', field: 'totalAmount' },
    { header: 'Status', field: 'status' },
    { header: 'Actions', field: 'actions' }
  ];

  products = signal<any[]>([]);
  customers = signal<string[]>([]);
  productCols = [
    { header: 'Image', field: 'image' },
    { header: 'ID', field: 'id' },
    { header: 'Name', field: 'name' },
    { header: 'Description', field: 'description' },
    { header: 'Price', field: 'price' },
    { header: 'Category', field: 'category' },
    { header: 'Status', field: 'availability' },
    { header: 'Actions', field: 'actions' }
  ];

  constructor() {
    this.catalogService.search('').subscribe(res => this.products.set(res.items));
    this.customers.set(this.authService.getRegisteredUsers());
  }

  deleteProduct(id: string) {
    if(confirm('Delete product?')) {
      this.catalogService.deleteProduct(id);
      this.catalogService.search('').subscribe(res => this.products.set(res.items));
      this.toastService.show({ title: 'Product Deleted', description: 'Product removed from catalog.' });
    }
  }

  toggleStock(id: string) {
    this.catalogService.toggleStock(id);
    this.catalogService.search('').subscribe(res => this.products.set(res.items));
    this.toastService.show({ title: 'Stock Updated', description: 'Product availability changed.' });
  }

  removeCustomer(email: string) {
    if(confirm('Revoke access for ' + email + '?')) {
      const users = this.authService.getRegisteredUsers().filter(u => u !== email);
      localStorage.setItem('registered_users', JSON.stringify(users));
      this.customers.set(users);
      this.registeredCount.set(users.length);
      this.toastService.show({ title: 'User Removed', description: email + ' has been revoked.' });
    }
  }

  updateOrderStatus(id: string, status: string) {
    this.orderService.updateOrderStatus(id, status);
    this.toastService.show({ title: 'Order Updated', description: 'Order ' + id + ' marked as ' + status });
  }
}
