import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AppService } from '../app.service';
import { firstValueFrom } from 'rxjs';
import { filter } from 'rxjs/operators';

export const authGuard: CanActivateFn = async (route, state) => {
    const appService = inject(AppService);
    const router = inject(Router);
    
    // Wait for app initialization to complete
    await firstValueFrom(
        appService.initializationComplete$.pipe(filter(complete => complete === true))
    );
    
    const currentUser = appService.currentUser;
    
    // Check if user is logged in
    if (currentUser) {
        return true;
    }
    
    // Redirect to login if not authenticated
    router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
    return false;
};

export const customerGuard: CanActivateFn = async (route, state) => {
    const appService = inject(AppService);
    const router = inject(Router);
    
    // Wait for app initialization to complete
    await firstValueFrom(
        appService.initializationComplete$.pipe(filter(complete => complete === true))
    );
    
    const currentUser = appService.currentUser;
    
    // Check if user is logged in
    if (!currentUser) {
        router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
        return false;
    }
    
    // Customer guard allows both CUSTOMER role
    if (currentUser.role === 'CUSTOMER') {
        return true;
    }
    
    // Redirect based on role
    if (currentUser.role === 'WORKER') {
        router.navigate(['/worker']);
    } else if (currentUser.role === 'ADMIN') {
        router.navigate(['/admin']);
    }
    
    return false;
};

export const workerGuard: CanActivateFn = async (route, state) => {
    const appService = inject(AppService);
    const router = inject(Router);
    
    // Wait for app initialization to complete
    await firstValueFrom(
        appService.initializationComplete$.pipe(filter(complete => complete === true))
    );
    
    const currentUser = appService.currentUser;
    
    // Check if user is logged in
    if (!currentUser) {
        router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
        return false;
    }
    
    // Worker guard allows WORKER role
    if (currentUser.role === 'WORKER') {
        return true;
    }
    
    // Redirect based on role
    if (currentUser.role === 'CUSTOMER') {
        router.navigate(['/customer']);
    } else if (currentUser.role === 'ADMIN') {
        router.navigate(['/admin']);
    }
    
    return false;
};
