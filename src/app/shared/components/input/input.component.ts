import { Component, forwardRef, Input, signal, OnInit } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-input',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputComponent),
      multi: true
    }
  ],
  template: `
    <div class="flex flex-col space-y-1.5 w-full">
      @if(label) {
        <label [for]="id" class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          {{ label }}
        </label>
      }
      <div class="relative w-full">
        <input
          [id]="id"
          [type]="currentType()"
          [placeholder]="placeholder"
          [disabled]="disabled"
          (input)="onInputChange($event)"
          (blur)="onTouched()"
          [value]="value"
          class="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          [class.pr-10]="type === 'password'"
        />
        
        @if(type === 'password') {
          <button 
            type="button"
            (click)="togglePassword()"
            class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors focus:outline-none"
            aria-label="Toggle password visibility"
          >
            @if(showPassword()) {
              <!-- Eye Off Icon -->
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.88 9.88 3 3m6.12 6.12a3 3 0 1 0 4.24 4.24L9.88 9.88zM4.69 4.69l1.42-1.42 16.48 16.48-1.42 1.42-3.17-3.17a12.94 12.94 0 0 1-5 1 12.8 12.8 0 0 1-11-7 11.5 11.5 0 0 1 2.51-3.13L4.69 4.69z"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.12 13.12 0 0 1-1.55 2.35m-4.31-.88A3 3 0 0 0 15 10"/></svg>
            } @else {
              <!-- Eye Icon -->
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
            }
          </button>
        }
      </div>
      @if(error) {
        <span class="text-[0.8rem] font-medium text-destructive">{{ error }}</span>
      }
    </div>
  `
})
export class InputComponent implements ControlValueAccessor {
  @Input() id: string = Math.random().toString(36).substring(2, 9);
  @Input() label?: string;
  @Input() type: string = 'text';
  @Input() placeholder: string = '';
  @Input() error?: string;
  
  value: string = '';
  disabled: boolean = false;
  showPassword = signal(false);
  currentType = signal('text');

  ngOnInit() {
    this.currentType.set(this.type);
  }

  togglePassword() {
    this.showPassword.update(v => !v);
    this.currentType.set(this.showPassword() ? 'text' : 'password');
  }

  onChange: any = () => {};
  onTouched: any = () => {};

  writeValue(value: any): void {
    this.value = value || '';
  }
  
  registerOnChange(fn: any): void {
    this.onChange = fn;
  }
  
  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }
  
  setDisabledState?(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  onInputChange(event: Event) {
    const val = (event.target as HTMLInputElement).value;
    this.value = val;
    this.onChange(val);
  }
}
