import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from './auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const authService = inject(AuthService);

    // Skip auth header for auth endpoints
    if (req.url.includes('/auth/login') || req.url.includes('/auth/register')) {
        return next(req);
    }

    // Add access token to request if available
    const token = authService.accessToken;
    if (token) {
        req = req.clone({
            setHeaders: {
                Authorization: `Bearer ${token}`
            }
        });
    }

    // Handle response and errors
    return next(req).pipe(
        catchError((error: HttpErrorResponse) => {
            // If 401 Unauthorized, try to refresh token
            if (error.status === 401 && !req.url.includes('/auth/refresh-token')) {
                return authService.refreshToken().pipe(
                    switchMap(() => {
                        // Retry the original request with new token
                        const newToken = authService.accessToken;
                        if (newToken) {
                            const clonedReq = req.clone({
                                setHeaders: {
                                    Authorization: `Bearer ${newToken}`
                                }
                            });
                            return next(clonedReq);
                        }
                        return throwError(() => error);
                    }),
                    catchError(refreshError => {
                        // Refresh failed, logout user
                        authService.logout().subscribe();
                        return throwError(() => refreshError);
                    })
                );
            }

            return throwError(() => error);
        })
    );
};
