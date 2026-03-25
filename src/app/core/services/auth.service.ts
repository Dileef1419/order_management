import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export interface User {
  id: string;
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

  login(token: string, user: User) {
    this.setToken(token);
    localStorage.setItem('currentUser', JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  getRegisteredUsers(): string[] {
    const users = localStorage.getItem('registered_users');
    return users ? JSON.parse(users) : [];
  }

  registerUser(email: string) {
    const users = this.getRegisteredUsers();
    if (!users.includes(email)) {
      users.push(email);
      localStorage.setItem('registered_users', JSON.stringify(users));
    }
  }

  isUserRegistered(email: string): boolean {
    return this.getRegisteredUsers().includes(email);
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  loadSession(): Observable<User> {
    return this.http.get<User>(`${environment.apiUrl}/me`).pipe(
      tap(user => this.currentUserSubject.next(user))
    );
  }
}
