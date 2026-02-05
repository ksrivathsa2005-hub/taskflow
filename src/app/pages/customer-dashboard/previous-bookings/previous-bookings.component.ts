import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AppService } from '../../../app.service';
import { Task, TaskStatus } from '../../../types';
import { CURRENCY } from '../../../constants';
import { LucideAngularModule, Star, ArrowLeft } from 'lucide-angular';

@Component({
    selector: 'app-previous-bookings',
    standalone: true,
    imports: [CommonModule, LucideAngularModule],
    templateUrl: './previous-bookings.component.html',
    styleUrls: ['./previous-bookings.component.css']
})
export class PreviousBookingsComponent implements OnInit {
    currentUser: any = null;
    completedTasks: Task[] = [];
    readonly CURRENCY = CURRENCY;
    readonly Star = Star;
    readonly ArrowLeft = ArrowLeft;

    constructor(
        public appService: AppService,
        private router: Router
    ) {}

    ngOnInit() {
        this.appService.currentUser$.subscribe(user => {
            this.currentUser = user;
        });

        this.appService.tasks$.subscribe(tasks => {
            this.completedTasks = tasks.filter(t => 
                t.customerId === this.appService.currentUser?.id &&
                (t.status === TaskStatus.VERIFIED || 
                 t.status === TaskStatus.PAID || 
                 t.status === TaskStatus.COMPLETED)
            );
        });

        // Load tasks from API
        this.appService.loadTasksFromApi();
    }

    goBack() {
        this.router.navigate(['/customer']);
    }

    getStarArray(count: number): number[] {
        return Array(Math.floor(count)).fill(0);
    }

    getAverageRating(task: Task): number {
        const reviews = (task as any).reviews || [];
        if (reviews.length === 0) return 0;
        const sum = reviews.reduce((acc: number, r: any) => acc + r.rating, 0);
        return +(sum / reviews.length).toFixed(1);
    }
}
