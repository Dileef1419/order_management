import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { InputComponent } from '../../../shared/components/input/input.component';
import { CardComponent } from '../../../shared/components/card/card.component';
import { AuthService } from '../../../core/services/auth.service';
import { ApiService } from '../../../core/services/api.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, ButtonComponent, InputComponent, CardComponent],
  template: `
    <div class="flex items-center justify-center min-h-[calc(100vh-4rem)] p-4">
      <app-card title="Login" description="Enter your email below to login to your account" class="w-full max-w-sm" [footer]="true">
        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="flex flex-col space-y-4">
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
          
          @if(errorMessage) {
            <div class="text-sm font-medium text-destructive mt-2">{{ errorMessage }}</div>
          }

          <div class="pt-2">
            <app-button type="submit" [fullWidth]="true" [disabled]="isLoading">
              {{ isLoading ? 'Logging in...' : 'Login' }}
            </app-button>
          </div>
        </form>
        
        <div card-footer class="flex flex-col w-full text-center mt-4">
          <div class="text-sm text-muted-foreground w-full">
            Don't have an account? 
            <a routerLink="/register" class="underline underline-offset-4 hover:text-primary">Sign up</a>
          </div>
        </div>
      </app-card>
    </div>
  `
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private apiService = inject(ApiService);
  private router = inject(Router);

  isLoading = false;
  errorMessage = '';

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  });

  get f() { return this.loginForm.controls; }

  onSubmit() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    
    const { email } = this.loginForm.value;
    
    setTimeout(() => {
      const { email, password } = this.loginForm.value;
      const isAdminEmail = email === environment.adminEmail;

      if (isAdminEmail) {
        if (password !== environment.adminPassword) {
          this.isLoading = false;
          this.errorMessage = 'Invalid admin credentials.';
          return;
        }
      } else if (!this.authService.isUserRegistered(email as string)) {
        this.isLoading = false;
        this.errorMessage = 'Account not found. Please register your account first.';
        return;
      }

      this.isLoading = false;
      const mockUser = {
        id: isAdminEmail ? 'admin-1' : 'user-1',
        email: email as string,
        role: isAdminEmail ? 'Admin' as const : 'Customer' as const
      };
      const mockToken = 'mock-jwt-token-12345';
      
      this.authService.login(mockToken, mockUser);
      this.router.navigate([isAdminEmail ? '/admin' : '/catalog']);
    }, 1000);
  }
}
