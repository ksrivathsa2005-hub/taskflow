import { Routes } from '@angular/router';
import { LandingPageComponent } from './pages/landing-page/landing-page.component';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { CustomerDashboardComponent } from './pages/customer-dashboard/customer-dashboard.component';
import { DisputesComponent } from './pages/disputes/disputes.component';
import { ReviewsComponent } from './pages/reviews/reviews.component';
import { PostTaskComponent } from './pages/customer-dashboard/post-task/post-task.component';
import { MyBookingsComponent } from './pages/customer-dashboard/my-bookings/my-bookings.component';
import { WorkerDashboardComponent } from './pages/worker-dashboard/worker-dashboard.component';
import { AdminDashboardComponent } from './pages/admin-dashboard/admin-dashboard.component';
import { TaskReviewComponent } from './pages/admin-dashboard/task-review.component';
import { UserManagementComponent } from './pages/admin-dashboard/user-management.component';
import { AdminDisputesComponent } from './pages/admin-dashboard/disputes.component';
import { WorkerLoginComponent } from './pages/worker-login/worker-login.component';
import { WorkerRegisterComponent } from './pages/worker-register/worker-register.component';
import { AdminLoginComponent } from './pages/admin-login/admin-login.component';
import { authGuard, guestGuard } from './services/auth.guard';
import { UserRole } from './types';

export const routes: Routes = [
    { path: '', component: LandingPageComponent },
    { path: 'login', component: LoginComponent, canActivate: [guestGuard] },
    { path: 'register', component: RegisterComponent, canActivate: [guestGuard] },
    { path: 'worker/login', component: WorkerLoginComponent, canActivate: [guestGuard] },
    { path: 'worker/register', component: WorkerRegisterComponent, canActivate: [guestGuard] },
    { path: 'admin/login', component: AdminLoginComponent, canActivate: [guestGuard] },
    
    // Customer Routes (Protected)
    { 
        path: 'customer', 
        component: CustomerDashboardComponent, 
        canActivate: [authGuard],
        data: { roles: [UserRole.CUSTOMER] }
    },
    { 
        path: 'customer/post-task', 
        component: PostTaskComponent, 
        canActivate: [authGuard],
        data: { roles: [UserRole.CUSTOMER] }
    },
    { 
        path: 'customer/bookings', 
        component: MyBookingsComponent, 
        canActivate: [authGuard],
        data: { roles: [UserRole.CUSTOMER] }
    },

    // Worker Routes (Protected)
    {
        path: 'worker',
        component: WorkerDashboardComponent,
        canActivate: [authGuard],
        data: { roles: [UserRole.WORKER] }
    },

    // Admin Routes (Protected)
    {
        path: 'admin',
        component: AdminDashboardComponent,
        canActivate: [authGuard],
        data: { roles: [UserRole.ADMIN] }
    },
    {
        path: 'admin/reviews',
        component: TaskReviewComponent,
        canActivate: [authGuard],
        data: { roles: [UserRole.ADMIN] }
    },
    {
        path: 'admin/users',
        component: UserManagementComponent,
        canActivate: [authGuard],
        data: { roles: [UserRole.ADMIN] }
    },
    {
        path: 'admin/disputes',
        component: AdminDisputesComponent,
        canActivate: [authGuard],
        data: { roles: [UserRole.ADMIN] }
    },
    
    // Shared Routes (Protected - any authenticated user)
    { 
        path: 'reviews', 
        component: ReviewsComponent, 
        canActivate: [authGuard]
    },
    { 
        path: 'disputes', 
        component: DisputesComponent, 
        canActivate: [authGuard]
    },
    
    { path: '**', redirectTo: '' }
];
