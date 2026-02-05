import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  
  // Get token from localStorage
  const token = localStorage.getItem('accessToken');
  
  // Clone request and add headers
  let authReq = req;
  const headers: any = {
    'ngrok-skip-browser-warning': 'true' // Skip ngrok warning page
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  authReq = req.clone({ setHeaders: headers });
  
  // Handle the request and catch errors
  return next(authReq).pipe(
    catchError((error) => {
      if (error.status === 401) {
        // Token expired or invalid - clear storage and redirect to login
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('currentUser');
        router.navigate(['/']);
      }
      return throwError(() => error);
    })
  );
};
