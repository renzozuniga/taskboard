import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: AuthUser;
}

/**
 * Handles authentication: login, register, logout, and session persistence.
 * Stores the JWT token and user data in localStorage.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'auth_user';
  private readonly apiUrl = `${environment.apiUrl}/auth`;

  constructor(private http: HttpClient) {}

  /**
   * Authenticates a user with email and password.
   * Saves the session (token + user) to localStorage on success.
   * @param email - User's email address
   * @param password - User's password
   */
  login(email: string, password: string): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/login`, { email, password })
      .pipe(tap(response => this.saveSession(response)));
  }

  /**
   * Registers a new user account.
   * Saves the session (token + user) to localStorage on success.
   * @param name - User's full name
   * @param email - User's email address
   * @param password - User's password
   */
  register(name: string, email: string, password: string): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/register`, { name, email, password })
      .pipe(tap(response => this.saveSession(response)));
  }

  /** Clears the session from localStorage. */
  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
  }

  /** Returns true if a token exists in localStorage. */
  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  /** Returns the stored JWT token, or null if not authenticated. */
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  /** Returns the stored user object, or null if not authenticated. */
  getCurrentUser(): AuthUser | null {
    const raw = localStorage.getItem(this.USER_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  }

  private saveSession(response: AuthResponse): void {
    localStorage.setItem(this.TOKEN_KEY, response.token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(response.user));
  }
}
