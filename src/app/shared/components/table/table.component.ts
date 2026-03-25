import { Component, Input, Output, EventEmitter, ContentChild, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '../button/button.component';
import { InputComponent } from '../input/input.component';
import { FormsModule } from '@angular/forms';

export interface ColumnDef {
  header: string;
  field: string;
}

@Component({
  selector: 'app-table',
  standalone: true,
  imports: [CommonModule, InputComponent, FormsModule],
  template: `
    <div class="space-y-4">
      <div class="flex items-center justify-between">
        @if(searchable) {
          <app-input [(ngModel)]="searchTerm" (ngModelChange)="onSearchChange($event)" placeholder="Search..." class="max-w-sm"></app-input>
        }
        <ng-content select="[toolbar]"></ng-content>
      </div>
      <div class="rounded-md border bg-card">
        <div class="w-full overflow-auto">
          <table class="w-full caption-bottom text-sm">
            <thead class="[&_tr]:border-b">
              <tr class="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                @for(col of columns; track col.field) {
                  <th class="h-12 px-4 text-left align-middle font-medium text-muted-foreground">{{ col.header }}</th>
                }
              </tr>
            </thead>
            <tbody class="[&_tr:last-child]:border-0">
              @for(row of filteredData; track row.id) {
                <tr class="border-b transition-colors hover:bg-muted/50">
                  @for(col of columns; track col.field) {
                    <td class="p-4 align-middle">
                      <ng-container *ngTemplateOutlet="cellTemplate || defaultCell; context: { $implicit: row, column: col }"></ng-container>
                      <ng-template #defaultCell>
                        {{ row[col.field] }}
                      </ng-template>
                    </td>
                  }
                </tr>
              }
              @if(filteredData.length === 0) {
                <tr><td [attr.colspan]="columns.length" class="p-4 text-center text-muted-foreground">No data found.</td></tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class TableComponent {
  @Input() columns: ColumnDef[] = [];
  @Input() data: any[] = [];
  @Input() searchable: boolean = false;
  
  @ContentChild('cellTemplate') cellTemplate?: TemplateRef<any>;

  searchTerm = '';

  get filteredData() {
    if (!this.searchTerm) return this.data;
    const term = this.searchTerm.toLowerCase();
    return this.data.filter(row => 
      Object.values(row).some(val => String(val).toLowerCase().includes(term))
    );
  }

  onSearchChange(term: string) {
    this.searchTerm = term;
  }
}
