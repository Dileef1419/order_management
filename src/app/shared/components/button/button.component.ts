import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-button',
  standalone: true,
  template: `
    <button 
      [type]="type"
      [disabled]="disabled"
      (click)="onClick.emit($event)"
      class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
      [class.bg-primary]="variant === 'default'"
      [class.text-primary-foreground]="variant === 'default'"
      [class.hover:bg-primary/90]="variant === 'default'"
      [class.bg-destructive]="variant === 'destructive'"
      [class.text-destructive-foreground]="variant === 'destructive'"
      [class.hover:bg-destructive/90]="variant === 'destructive'"
      [class.border]="variant === 'outline'"
      [class.border-input]="variant === 'outline'"
      [class.bg-background]="variant === 'outline'"
      [class.hover:bg-accent]="variant === 'outline'"
      [class.hover:text-accent-foreground]="variant === 'outline'"
      [class.h-9]="size === 'default'"
      [class.px-4]="size === 'default'"
      [class.py-2]="size === 'default'"
      [class.h-8]="size === 'sm'"
      [class.rounded-md]="size === 'sm'"
      [class.px-3]="size === 'sm'"
      [class.text-xs]="size === 'sm'"
      [class.h-10]="size === 'lg'"
      [class.rounded-md]="size === 'lg'"
      [class.px-8]="size === 'lg'"
      [class.w-full]="fullWidth"
    >
      <ng-content></ng-content>
    </button>
  `
})
export class ButtonComponent {
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Input() variant: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link' = 'default';
  @Input() size: 'default' | 'sm' | 'lg' | 'icon' = 'default';
  @Input() disabled: boolean = false;
  @Input() fullWidth: boolean = false;
  @Output() onClick = new EventEmitter<MouseEvent>();
}
