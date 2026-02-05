import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AppService } from '../app.service';
import { UserRole } from '../types';

export const adminGuard: CanActivateFn = (route, state) => {
    const appService = inject(AppService);
    const router = inject(Router);
    
    const currentUser = appService.currentUser;
    
    // Check if user is logged in and has admin role
    if (currentUser && currentUser.role === UserRole.ADMIN) {
        return true;
    }
    
    // Redirect to admin login if not authenticated as admin
    router.navigate(['/admin-login']);
    return false;
};
