import { Routes } from '@angular/router';
import { LandingPageComponent } from './pages/landing-page/landing-page.component';
import { LoginComponent } from './pages/login/login.component';
import { AdminLoginComponent } from './pages/admin-login/admin-login.component';
import { CustomerDashboardComponent } from './pages/customer-dashboard/customer-dashboard.component';
import { WorkerDashboardComponent } from './pages/worker-dashboard/worker-dashboard.component';
import { AdminDashboardComponent } from './pages/admin-dashboard/admin-dashboard.component';
import { DisputesComponent } from './pages/disputes/disputes.component';
import { ReviewsComponent } from './pages/reviews/reviews.component';
import { UserManagementComponent } from './pages/admin-dashboard/user-management.component';
import { TaskReviewComponent } from './pages/admin-dashboard/task-review.component';
import { AdminDisputesComponent } from './pages/admin-dashboard/disputes.component';
import { WorkerEarningsComponent } from './pages/worker-earnings/worker-earnings.component';
import { PostTaskComponent } from './pages/customer-dashboard/post-task/post-task.component';
import { MyBookingsComponent } from './pages/customer-dashboard/my-bookings/my-bookings.component';
import { adminGuard } from './guards/admin.guard';
import { customerGuard, workerGuard, authGuard } from './guards/auth.guard';

export const routes: Routes = [
    { path: '', component: LandingPageComponent },
    { path: 'login', component: LoginComponent },
    { path: 'admin-login', component: AdminLoginComponent },
    { path: 'customer', component: CustomerDashboardComponent, canActivate: [customerGuard] },
    { path: 'customer/post-task', component: PostTaskComponent, canActivate: [customerGuard] },
    { path: 'customer/bookings', component: MyBookingsComponent, canActivate: [customerGuard] },
    { path: 'worker', component: WorkerDashboardComponent, canActivate: [workerGuard] },
    { path: 'worker/earnings', component: WorkerEarningsComponent, canActivate: [workerGuard] },
    { path: 'admin', component: AdminDashboardComponent, canActivate: [adminGuard] },
    { path: 'admin/users', component: UserManagementComponent, canActivate: [adminGuard] },
    { path: 'admin/reviews', component: TaskReviewComponent, canActivate: [adminGuard] },
    { path: 'admin/disputes', component: AdminDisputesComponent, canActivate: [adminGuard] },
    { path: 'reviews', component: ReviewsComponent, canActivate: [authGuard] },
    { path: 'disputes', component: DisputesComponent, canActivate: [authGuard] },
    { path: '**', redirectTo: '' }
];
