import { inject } from '@angular/core';
import { Router, CanActivateFn, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from './auth.service';
import { UserRole } from '../types';

export const authGuard: CanActivateFn = (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    const currentUser = authService.currentUser;

    if (!currentUser) {
        // Not logged in, redirect to landing page
        router.navigate(['/'], { queryParams: { returnUrl: state.url } });
        return false;
    }

    // Check if route has role requirements
    const requiredRoles = route.data['roles'] as UserRole[] | undefined;

    if (requiredRoles && requiredRoles.length > 0) {
        const hasRole = requiredRoles.includes(currentUser.role as UserRole);
        
        if (!hasRole) {
            // User doesn't have required role, redirect to their dashboard
            const roleMap: { [key: string]: string } = {
                [UserRole.CUSTOMER]: '/customer',
                [UserRole.WORKER]: '/worker',
                [UserRole.ADMIN]: '/admin'
            };
            
            router.navigate([roleMap[currentUser.role] || '/']);
            return false;
        }
    }

    return true;
};

export const guestGuard: CanActivateFn = (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    const currentUser = authService.currentUser;

    if (currentUser) {
        // Already logged in, redirect to dashboard
        const roleMap: { [key: string]: string } = {
            [UserRole.CUSTOMER]: '/customer',
            [UserRole.WORKER]: '/worker',
            [UserRole.ADMIN]: '/admin'
        };
        
        router.navigate([roleMap[currentUser.role] || '/']);
        return false;
    }

    return true;
};
