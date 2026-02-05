import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { User, UserRole } from '../types';

export interface RegisterRequest {
    name: string;
    email: string;
    password: string;
    role: 'CUSTOMER' | 'WORKER' | 'ADMIN';
    phone?: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface AuthResponse {
    accessToken: string;
    refreshToken: string;
    user: User;
}

export interface TokenRefreshRequest {
    refreshToken: string;
}

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private http = inject(HttpClient);
    private router = inject(Router);

    // API Base URL - Change this to your backend URL
    private readonly API_BASE_URL = 'https://unsplendorous-scarcely-ashley.ngrok-free.dev/api';

    // State management
    private currentUserSubject = new BehaviorSubject<User | null>(this.getUserFromStorage());
    private accessTokenSubject = new BehaviorSubject<string | null>(this.getAccessToken());

    public currentUser$ = this.currentUserSubject.asObservable();
    public isAuthenticated$ = new BehaviorSubject<boolean>(this.hasValidToken());

    constructor() {
        // Check if token is expired on service initialization
        if (this.hasValidToken() && !this.isTokenValid()) {
            this.logout();
        }
    }

    get currentUser(): User | null {
        return this.currentUserSubject.value;
    }

    get accessToken(): string | null {
        return this.accessTokenSubject.value;
    }

    /**
     * Register a new user
     */
    register(data: RegisterRequest): Observable<AuthResponse> {
        const headers = new HttpHeaders({
            'Content-Type': 'application/json',
            'ngrok-skip-browser-warning': 'true'
        });

        // Backend expects PascalCase field names directly (no request wrapper)
        const requestPayload = {
            Name: data.name,
            Email: data.email,
            Password: data.password,
            Role: data.role,  // Send as string: 'CUSTOMER', 'WORKER', or 'ADMIN'
            Phone: data.phone || ''
        };

        return this.http.post<AuthResponse>(`${this.API_BASE_URL}/auth/register`, requestPayload, { headers }).pipe(
            tap(response => this.handleAuthSuccess(response)),
            catchError(error => this.handleAuthError(error))
        );
    }

    /**
     * Login user
     */
    login(data: LoginRequest): Observable<AuthResponse> {
        const headers = new HttpHeaders({
            'Content-Type': 'application/json',
            'ngrok-skip-browser-warning': 'true'
        });
        
        // Backend expects PascalCase field names directly (no request wrapper)
        const requestPayload = {
            Email: data.email,
            Password: data.password
        };
        
        return this.http.post<AuthResponse>(`${this.API_BASE_URL}/auth/login`, requestPayload, { headers }).pipe(
            tap(response => this.handleAuthSuccess(response)),
            catchError(error => this.handleAuthError(error))
        );
    }

    /**
     * Logout user
     */
    logout(): Observable<any> {
        const refreshToken = this.getRefreshToken();
        const headers = new HttpHeaders({
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.accessToken}`,
            'ngrok-skip-browser-warning': 'true'
        });

        if (refreshToken && this.accessToken) {
            return this.http.post(
                `${this.API_BASE_URL}/auth/logout`,
                { refreshToken },
                { headers }
            ).pipe(
                tap(() => this.clearAuthData()),
                catchError(error => {
                    this.clearAuthData();
                    return throwError(() => error);
                })
            );
        } else {
            this.clearAuthData();
            return new Observable(observer => {
                observer.next({ message: 'Logged out locally' });
                observer.complete();
            });
        }
    }

    /**
     * Refresh access token
     */
    refreshToken(): Observable<AuthResponse> {
        const refreshToken = this.getRefreshToken();
        
        if (!refreshToken) {
            return throwError(() => new Error('No refresh token available'));
        }

        const headers = new HttpHeaders({
            'Content-Type': 'application/json',
            'ngrok-skip-browser-warning': 'true'
        });

        return this.http.post<AuthResponse>(
            `${this.API_BASE_URL}/auth/refresh-token`,
            { refreshToken },
            { headers }
        ).pipe(
            tap(response => this.handleAuthSuccess(response)),
            catchError(error => {
                this.logout();
                return throwError(() => error);
            })
        );
    }

    /**
     * Get current user from server
     */
    getCurrentUser(): Observable<User> {
        if (!this.accessToken) {
            return throwError(() => new Error('Not authenticated'));
        }

        const headers = new HttpHeaders({
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.accessToken}`,
            'ngrok-skip-browser-warning': 'true'
        });

        return this.http.get<User>(`${this.API_BASE_URL}/auth/me`, { headers }).pipe(
            tap(user => {
                this.currentUserSubject.next(user);
                localStorage.setItem('taskflow_user', JSON.stringify(user));
            }),
            catchError(error => this.handleAuthError(error))
        );
    }

    /**
     * Handle successful authentication
     */
    private handleAuthSuccess(response: AuthResponse): void {
        // Convert numeric role from backend to string enum
        const numericRole = typeof response.user.role === 'number' ? response.user.role : 
                           (response.user.role === 'CUSTOMER' ? 0 : response.user.role === 'WORKER' ? 1 : 2);
        
        const roleMap: { [key: number]: string } = {
            0: 'CUSTOMER',
            1: 'WORKER',
            2: 'ADMIN'
        };

        // Normalize role to string
        response.user.role = roleMap[numericRole] || 'CUSTOMER';

        // Store tokens
        localStorage.setItem('taskflow_access_token', response.accessToken);
        localStorage.setItem('taskflow_refresh_token', response.refreshToken);
        localStorage.setItem('taskflow_user', JSON.stringify(response.user));

        // Update subjects
        this.accessTokenSubject.next(response.accessToken);
        this.currentUserSubject.next(response.user);
        this.isAuthenticated$.next(true);

        // Navigate to appropriate dashboard based on role
        this.navigateToRoleDashboard(response.user.role);
    }

    /**
     * Handle authentication errors
     */
    private handleAuthError(error: any): Observable<never> {
        let errorMessage = 'An error occurred during authentication';

        if (error.error?.message) {
            errorMessage = error.error.message;
        } else if (error.message) {
            errorMessage = error.message;
        }

        return throwError(() => new Error(errorMessage));
    }

    /**
     * Clear authentication data
     */
    private clearAuthData(): void {
        localStorage.removeItem('taskflow_access_token');
        localStorage.removeItem('taskflow_refresh_token');
        localStorage.removeItem('taskflow_user');
        localStorage.removeItem('taskflow_appstate');

        this.accessTokenSubject.next(null);
        this.currentUserSubject.next(null);
        this.isAuthenticated$.next(false);

        this.router.navigate(['/']);
    }

    /**
     * Get access token from localStorage
     */
    private getAccessToken(): string | null {
        return localStorage.getItem('taskflow_access_token');
    }

    /**
     * Get refresh token from localStorage
     */
    getRefreshToken(): string | null {
        return localStorage.getItem('taskflow_refresh_token');
    }

    /**
     * Get user from localStorage
     */
    private getUserFromStorage(): User | null {
        const userJson = localStorage.getItem('taskflow_user');
        if (userJson) {
            try {
                const user = JSON.parse(userJson);
                
                // Normalize role from backend numeric format to string enum
                const roleMap: { [key: number | string]: string } = {
                    0: 'CUSTOMER',
                    1: 'WORKER',
                    2: 'ADMIN',
                    'CUSTOMER': 'CUSTOMER',
                    'WORKER': 'WORKER',
                    'ADMIN': 'ADMIN'
                };
                
                if (user.role !== undefined) {
                    user.role = roleMap[user.role] || 'CUSTOMER';
                }
                
                return user;
            } catch (error) {
                return null;
            }
        }
        return null;
    }

    /**
     * Get auth headers
     */
    getAuthHeaders(): HttpHeaders | null {
        const token = this.getAccessToken();
        if (token) {
            return new HttpHeaders({
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            });
        }
        return null;
    }

    /**
     * Check if user has valid token
     */
    private hasValidToken(): boolean {
        return !!this.getAccessToken();
    }

    /**
     * Check if token is expired (basic check - decodes JWT)
     */
    private isTokenValid(): boolean {
        const token = this.getAccessToken();
        if (!token) return false;

        try {
            const payload = this.decodeToken(token);
            const expiry = payload.exp;
            const now = Math.floor(Date.now() / 1000);
            
            // Token is valid if it hasn't expired
            return expiry > now;
        } catch (error) {
            return false;
        }
    }

    /**
     * Decode JWT token
     */
    private decodeToken(token: string): any {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(
                atob(base64)
                    .split('')
                    .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                    .join('')
            );
            return JSON.parse(jsonPayload);
        } catch (error) {
            throw new Error('Invalid token');
        }
    }

    /**
     * Navigate to role-specific dashboard
     */
    private navigateToRoleDashboard(role: string): void {
        const roleMap: { [key: string]: string } = {
            'CUSTOMER': '/customer',
            'WORKER': '/worker',
            'ADMIN': '/admin'
        };

        const route = roleMap[role] || '/';
        this.router.navigate([route]);
    }

    /**
     * Check if user has specific role
     */
    hasRole(role: UserRole): boolean {
        return this.currentUser?.role === role;
    }

    /**
     * Check if user is admin
     */
    isAdmin(): boolean {
        return this.hasRole(UserRole.ADMIN);
    }

    /**
     * Check if user is customer
     */
    isCustomer(): boolean {
        return this.hasRole(UserRole.CUSTOMER);
    }

    /**
     * Check if user is worker
     */
    isWorker(): boolean {
        return this.hasRole(UserRole.WORKER);
    }
}
