import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'Customer' | 'Admin';
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  
  private currentUserSubject = new BehaviorSubject<User | null>(
    localStorage.getItem('currentUser') ? JSON.parse(localStorage.getItem('currentUser')!) : null
  );
  public currentUser$ = this.currentUserSubject.asObservable();

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  setToken(token: string) {
    localStorage.setItem('token', token);
  }

  // Parse JWT token manually to avoid external dependencies
  private parseJwt(token: string): any {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(jsonPayload);
    } catch (e) {
      return null;
    }
  }

  login(credentials: { email: string, password: string }): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/api/v1/auth/login`, {
      email: credentials.email,
      password: credentials.password
    }).pipe(
      tap(res => {
        if (res && res.token) {
          this.setToken(res.token);
          const decoded = this.parseJwt(res.token);
          if (decoded) {
            const role = decoded.role || 
                         decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || 
                         'Customer';
                         
            const user: User = {
              id: decoded.sub || decoded.nameid || 'unknown',
              name: decoded.name || decoded.unique_name || decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] || credentials.email.split('@')[0],
              email: decoded.email || credentials.email,
              role: role === 'Admin' ? 'Admin' : 'Customer'
            };
            localStorage.setItem('currentUser', JSON.stringify(user));
            this.currentUserSubject.next(user);
          }
        }
      })
    );
  }

  registerUser(user: any): Observable<any> {
    const idempotencyKey = crypto.randomUUID();
    const headers = new HttpHeaders().set('Idempotency-Key', idempotencyKey);
    return this.http.post<any>(`${environment.apiUrl}/api/v1/auth/register`, {
      name: user.name || user.email.split('@')[0],
      email: user.email,
      password: user.password,
      role: 'Customer'
    }, { headers });
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  loadSession(): Observable<User | null> {
    const token = this.getToken();
    if (token) {
      const decoded = this.parseJwt(token);
      if (decoded && (decoded.exp * 1000) > Date.now()) {
        const role = decoded.role || 
                     decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || 
                     'Customer';

        const user: User = {
          id: decoded.sub || decoded.nameid || 'unknown',
          name: decoded.name || decoded.unique_name || decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] || this.currentUserValue?.email?.split('@')[0] || 'unknown',
          email: decoded.email || this.currentUserValue?.email || 'unknown',
          role: role === 'Admin' ? 'Admin' : 'Customer'
        };
        this.currentUserSubject.next(user);
        return new Observable(obs => obs.next(user));
      } else {
        this.logout();
      }
    }
    return new Observable(obs => obs.next(null));
  }

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${environment.apiUrl}/api/v1/auth/users`);
  }

  deleteUser(email: string): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/api/v1/auth/users/${email}`);
  }

  getProfile(id: string): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/api/v1/auth/${id}`);
  }
}
