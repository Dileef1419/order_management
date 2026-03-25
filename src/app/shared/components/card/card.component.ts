import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-card',
  standalone: true,
  template: `
    <div class="rounded-xl border bg-card text-card-foreground shadow">
      @if(title || description) {
        <div class="flex flex-col space-y-1.5 p-6">
          @if(title) { <h3 class="font-semibold leading-none tracking-tight">{{ title }}</h3> }
          @if(description) { <p class="text-sm text-muted-foreground">{{ description }}</p> }
        </div>
      }
      <div class="p-6 pt-0">
        <ng-content></ng-content>
      </div>
      @if(footer) {
        <div class="flex items-center p-6 pt-0">
          <ng-content select="[card-footer]"></ng-content>
        </div>
      }
    </div>
  `
})
export class CardComponent {
  @Input() title?: string;
  @Input() description?: string;
  @Input() footer: boolean = false;
}
