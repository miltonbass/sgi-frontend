import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { LoginRequest, LoginResponse, UsuarioAuth, JwtClaims } from '../models/auth.model';
import { environment } from '../../../environments/environment';

const TOKEN_KEY = 'sgi_access_token';
const REFRESH_KEY = 'sgi_refresh_token';
const USER_KEY = 'sgi_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly baseUrl = `${environment.apiUrl}/auth`;

  readonly currentUser = signal<UsuarioAuth | null>(this.restoreUser());
  readonly isAuthenticated = signal<boolean>(this.checkValidToken());

  login(request: LoginRequest) {
    return this.http.post<LoginResponse>(`${this.baseUrl}/login`, request).pipe(
      tap(res => {
        localStorage.setItem(TOKEN_KEY, res.accessToken);
        localStorage.setItem(REFRESH_KEY, res.refreshToken);
        localStorage.setItem(USER_KEY, JSON.stringify(res.usuario));
        this.currentUser.set(res.usuario);
        this.isAuthenticated.set(true);
      }),
    );
  }

  refresh() {
    const refreshToken = localStorage.getItem(REFRESH_KEY);
    if (!refreshToken) return throwError(() => new Error('Sin refresh token'));

    return this.http
      .post<LoginResponse>(`${this.baseUrl}/refresh`, { refreshToken })
      .pipe(
        tap(res => {
          localStorage.setItem(TOKEN_KEY, res.accessToken);
          localStorage.setItem(REFRESH_KEY, res.refreshToken);
          localStorage.setItem(USER_KEY, JSON.stringify(res.usuario));
          this.currentUser.set(res.usuario);
          this.isAuthenticated.set(true);
        }),
        catchError(err => {
          this.clearSession();
          return throwError(() => err);
        }),
      );
  }

  logout() {
    const refreshToken = localStorage.getItem(REFRESH_KEY);
    if (refreshToken) {
      this.http.post(`${this.baseUrl}/logout`, { refreshToken }).subscribe();
    }
    this.clearSession();
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  hasRole(role: string): boolean {
    return this.currentUser()?.roles?.includes(role) ?? false;
  }

  hasAnyRole(roles: string[]): boolean {
    return roles.some(r => this.hasRole(r));
  }

  private clearSession() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_KEY);
    localStorage.removeItem(USER_KEY);
    this.currentUser.set(null);
    this.isAuthenticated.set(false);
  }

  private checkValidToken(): boolean {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return false;
    const claims = this.decodeToken(token);
    return !!claims && claims.exp * 1000 > Date.now();
  }

  private restoreUser(): UsuarioAuth | null {
    if (!this.checkValidToken()) return null;
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as UsuarioAuth;
    } catch {
      return null;
    }
  }

  private decodeToken(token: string): JwtClaims | null {
    try {
      return JSON.parse(atob(token.split('.')[1])) as JwtClaims;
    } catch {
      return null;
    }
  }
}
