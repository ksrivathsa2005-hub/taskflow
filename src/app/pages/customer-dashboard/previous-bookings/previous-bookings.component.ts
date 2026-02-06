import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AppService } from '../../../app.service';
import { Task, TaskStatus, Review } from '../../../types';
import { CURRENCY } from '../../../constants';
import { LucideAngularModule, Star, ArrowLeft, MessageSquare } from 'lucide-angular';
import { ReviewModalComponent } from '../../../components/review-modal/review-modal.component';

@Component({
    selector: 'app-previous-bookings',
    standalone: true,
    imports: [CommonModule, LucideAngularModule, ReviewModalComponent],
    templateUrl: './previous-bookings.component.html',
    styleUrls: ['./previous-bookings.component.css']
})
export class PreviousBookingsComponent implements OnInit {
    currentUser: any = null;
    completedTasks: Task[] = [];

    showReviewModal = false;
    selectedTask: Task | null = null;
    readonly CURRENCY = CURRENCY;
    readonly Star = Star;
    readonly ArrowLeft = ArrowLeft;
    readonly MessageSquare = MessageSquare;

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
        const reviews = task.reviews || [];
        if (reviews.length === 0) return 0;
        const sum = reviews.reduce((acc: number, r: any) => acc + r.rating, 0);
        return +(sum / reviews.length).toFixed(1);
    }

    getMyReview(task: Task): Review | undefined {
        const currentUserId = this.appService.currentUser?.id;
        return (task.reviews || []).find(r => r.reviewerId === currentUserId);
    }

    hasReviewed(task: Task): boolean {
        return !!this.getMyReview(task);
    }

    openReviewModal(task: Task) {
        this.selectedTask = task;
        this.showReviewModal = true;
    }

    closeReviewModal() {
        this.showReviewModal = false;
        this.selectedTask = null;
    }

    onReviewSubmitted() {
        this.showReviewModal = false;
        this.selectedTask = null;
        this.appService.loadTasksFromApi();
    }
}
