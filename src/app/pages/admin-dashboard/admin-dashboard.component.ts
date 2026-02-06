
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AppService } from '../../app.service';
import { Task, User } from '../../types';
import {
    LucideAngularModule,
    Users,
    Briefcase,
    DollarSign,
    AlertCircle,
    TrendingUp,
    CheckCircle,
    ShieldAlert
} from 'lucide-angular';
import { Observable, map } from 'rxjs';

@Component({
    selector: 'app-admin-dashboard',
    standalone: true,
    imports: [CommonModule, LucideAngularModule],
    templateUrl: './admin-dashboard.component.html',
    styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {
    tasks$: Observable<Task[]>;
    users$: Observable<User[]>;

    stats$: Observable<any[]>;
    categoryData$: Observable<any[]>;

    readonly Users = Users;
    readonly Briefcase = Briefcase;
    readonly DollarSign = DollarSign;
    readonly AlertCircle = AlertCircle;
    readonly TrendingUp = TrendingUp;
    readonly CheckCircle = CheckCircle;
    readonly ShieldAlert = ShieldAlert;

    constructor(public appService: AppService, private router: Router) {
        this.tasks$ = this.appService.tasks$;
        this.users$ = this.appService.users$;

        this.stats$ = this.appService.tasks$.pipe(
            map(tasks => {
                const usersCount = this.appService.users.length;
                const recurringRevenue = tasks.filter(t => t.status === 'COMPLETED').length * 45;

                return [
                    { label: 'Active Users', value: usersCount, icon: this.Users, color: 'text-blue-600', bg: 'bg-blue-50' },
                    { label: 'Total Tasks', value: tasks.length, icon: this.Briefcase, color: 'text-indigo-600', bg: 'bg-indigo-50' },
                    { label: 'Platform Revenue', value: `₹${recurringRevenue.toLocaleString()}`, icon: this.DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                    { label: 'Open Disputes', value: 0, icon: this.AlertCircle, color: 'text-rose-600', bg: 'bg-rose-50' },
                ];
            })
        );

        this.categoryData$ = this.appService.tasks$.pipe(
            map(tasks => {
                return [
                    { name: 'Plumbing', value: tasks.filter(t => t.category === 'plumbing').length },
                    { name: 'Electrical', value: tasks.filter(t => t.category === 'electrical').length },
                    { name: 'Cleaning', value: tasks.filter(t => t.category === 'cleaning').length },
                    { name: 'Other', value: tasks.filter(t => t.category === 'other').length },
                ].filter(d => d.value > 0);
            })
        );
    }

    ngOnInit() { }

    getRevenue() {
        return (this.appService.tasks.filter(t => t.status === 'COMPLETED').length * 45).toLocaleString();
    }

    navigateToUserManagement() {
        this.router.navigate(['/admin/users']);
    }

    navigateToTaskReview() {
        this.router.navigate(['/admin/reviews']);
    }

    navigateToDisputes() {
        this.router.navigate(['/admin/disputes']);
    }
}
