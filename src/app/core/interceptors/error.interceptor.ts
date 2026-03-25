import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const authService = inject(AuthService);

  return next(req).pipe(
    catchError(err => {
      if ([401].includes(err.status)) {
        authService.logout();
      } else if ([403].includes(err.status)) {
        router.navigate(['/access-denied']);
      }
      
      const error = err.error?.message || err.statusText;
      console.error(err);
      return throwError(() => error);
    })
  );
};
