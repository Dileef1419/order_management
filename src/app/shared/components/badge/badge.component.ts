import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-badge',
  standalone: true,
  styles: [`
    :host {
      display: inline-flex;
      border-radius: 9999px;
    }
  `],
  template: `
    <div 
      class="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
      [class.bg-primary]="variant === 'default'"
      [class.text-primary-foreground]="variant === 'default'"
      [class.bg-secondary]="variant === 'secondary'"
      [class.text-secondary-foreground]="variant === 'secondary'"
      [class.bg-destructive]="variant === 'destructive'"
      [class.text-destructive-foreground]="variant === 'destructive'"
      [class.bg-green-500]="variant === 'success'"
      [class.text-white]="variant === 'success'"
      [class.bg-red-500]="variant === 'danger'"
      [class.text-white]="variant === 'danger'"
      [class.bg-transparent]="variant === 'outline'"
      [class.text-foreground]="variant === 'outline'"
    >
      <ng-content></ng-content>
    </div>
  `
})
export class BadgeComponent {
  @Input() variant: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'danger' = 'default';
}
