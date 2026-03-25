import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { InputComponent } from '../../../shared/components/input/input.component';
import { CardComponent } from '../../../shared/components/card/card.component';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, ButtonComponent, InputComponent, CardComponent],
  template: `
    <div class="flex items-center justify-center min-h-[calc(100vh-4rem)] p-4">
      <app-card title="Create an account" description="Enter your details below to create your account" class="w-full max-w-sm" [footer]="true">
        <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="flex flex-col space-y-4">
          
          <app-input
            id="name"
            type="text"
            label="Full Name"
            placeholder="John Doe"
            formControlName="name"
            [error]="f['name'].touched && f['name'].invalid ? 'Name required' : ''"
          ></app-input>

          <app-input
            id="email"
            type="email"
            label="Email"
            placeholder="m@example.com"
            formControlName="email"
            [error]="f['email'].touched && f['email'].invalid ? 'Valid email required' : ''"
          ></app-input>
          
          <app-input
            id="password"
            type="password"
            label="Password"
            formControlName="password"
            [error]="f['password'].touched && f['password'].invalid ? 'Password required' : ''"
          ></app-input>

          <div class="pt-2">
            <app-button type="submit" [fullWidth]="true" [disabled]="isLoading">
              {{ isLoading ? 'Creating account...' : 'Create account' }}
            </app-button>
          </div>
        </form>
        
        <div card-footer class="text-center w-full mt-4">
          <div class="text-sm text-muted-foreground w-full">
            Already have an account? 
            <a routerLink="/login" class="underline underline-offset-4 hover:text-primary">Login</a>
          </div>
        </div>
      </app-card>
    </div>
  `
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private authService = inject(AuthService);

  isLoading = false;

  registerForm = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]]
  });

  get f() { return this.registerForm.controls; }

  onSubmit() {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    
    setTimeout(() => {
      this.isLoading = false;
      this.authService.registerUser(this.registerForm.value.email as string);
      this.router.navigate(['/login']);
    }, 1000);
  }
}
