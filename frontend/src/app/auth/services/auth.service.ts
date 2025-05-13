import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { User } from '../../core/models/user.model';
import { Router } from '@angular/router';
import { AppConfig, getApiUrl } from '../../core/config/app-config';

interface AuthResponse {
  user: User;
  token: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly apiUrl = getApiUrl('auth');
  private readonly currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  
  constructor(private readonly http: HttpClient, private readonly router: Router) {
    this.loadUserFromStorage();
  }

  private loadUserFromStorage(): void {
    const token = localStorage.getItem(AppConfig.auth.tokenKey);
    const user = localStorage.getItem(AppConfig.auth.userKey);
    
    if (token && user) {
      this.currentUserSubject.next(JSON.parse(user));
    }
  }

  register(email: string, password: string, firstName: string, lastName: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, {
      email,
      password,
      firstName,
      lastName
    }).pipe(
      tap(response => this.handleAuthentication(response))
    );
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, {
      email,
      password
    }).pipe(
      tap(response => this.handleAuthentication(response))
    );
  }

  logout(): void {
    localStorage.removeItem(AppConfig.auth.tokenKey);
    localStorage.removeItem(AppConfig.auth.userKey);
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem(AppConfig.auth.tokenKey);
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  private handleAuthentication(response: AuthResponse): void {
    const { user, token } = response;
    localStorage.setItem(AppConfig.auth.tokenKey, token);
    localStorage.setItem(AppConfig.auth.userKey, JSON.stringify(user));
    this.currentUserSubject.next(user);
  }
}
