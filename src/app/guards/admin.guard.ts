import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AppService } from '../app.service';
import { UserRole } from '../types';
import { firstValueFrom } from 'rxjs';
import { filter } from 'rxjs/operators';

export const adminGuard: CanActivateFn = async (route, state) => {
    const appService = inject(AppService);
    const router = inject(Router);
    
    // Wait for app initialization to complete
    await firstValueFrom(
        appService.initializationComplete$.pipe(filter(complete => complete === true))
    );
    
    const currentUser = appService.currentUser;
    
    // Check if user is logged in and has admin role
    if (currentUser && currentUser.role === UserRole.ADMIN) {
        return true;
    }
    
    // Redirect to admin login if not authenticated as admin
    router.navigate(['/admin-login']);
    return false;
};
