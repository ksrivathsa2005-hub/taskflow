
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AppService } from '../../app.service';
import { TaskCardComponent } from '../../components/task-card/task-card.component';
import { PlatformActivityComponent } from '../../components/platform-activity/platform-activity.component';
import { ToastService } from '../../services/toast.service';
import { Task, TaskStatus, UserRole, User } from '../../types';
import { CURRENCY } from '../../constants';
import {
    LucideAngularModule,
    Search,
    Star,
    Clock,
    Briefcase,
    Navigation,
    CheckCircle2,
    TrendingUp,
    DollarSign,
    X,
    AlertCircle
} from 'lucide-angular';
import { Observable, map } from 'rxjs';

@Component({
    selector: 'app-worker-dashboard',
    standalone: true,
    imports: [CommonModule, FormsModule, LucideAngularModule, TaskCardComponent, PlatformActivityComponent],
    templateUrl: './worker-dashboard.component.html',
    styleUrls: ['./worker-dashboard.component.css']
})
export class WorkerDashboardComponent implements OnInit {
    availableTasks$: Observable<Task[]>;
    myActiveTask$: Observable<Task | undefined>;
    myCompletedTasks$: Observable<Task[]>;
    currentUser: User | null = null;

    biddingOn: any = null;
    showDisputeModal = false;
    disputeTaskId: string = '';
    disputeReason: string = '';
    showEarningsTab = false;

    readonly CURRENCY = CURRENCY;
    readonly TaskStatus = TaskStatus;
    readonly UserRole = UserRole;

    readonly Search = Search;
    readonly Star = Star;
    readonly Clock = Clock;
    readonly Briefcase = Briefcase;
    readonly Navigation = Navigation;
    readonly CheckCircle2 = CheckCircle2;
    readonly TrendingUp = TrendingUp;
    readonly DollarSign = DollarSign;
    readonly X = X;
    readonly AlertCircle = AlertCircle;

    private toastService = inject(ToastService);

    constructor(public appService: AppService, private router: Router) {
        this.availableTasks$ = this.appService.tasks$.pipe(
            map(tasks => {
                // Filter by status
                let filtered = tasks.filter(t => t.status === TaskStatus.POSTED || t.status === TaskStatus.BIDDING);
                
                // Filter by worker categories if worker has categories defined
                const currentWorker = this.appService.currentUser;
                if (currentWorker?.categories && currentWorker.categories.length > 0) {
                    // Only show tasks that match worker's categories
                    filtered = filtered.filter(t => {
                        // If task has a category, check if it matches worker's categories
                        if (t.category) {
                            return currentWorker.categories!.some(cat => 
                                cat.toLowerCase() === t.category!.toLowerCase()
                            );
                        }
                        return true; // Show tasks without category
                    });
                }
                
                return filtered;
            })
        );
        this.myActiveTask$ = this.appService.tasks$.pipe(
            map(tasks => tasks.find(t => t.workerId === this.appService.currentUser?.id && (t.status === TaskStatus.ASSIGNED || t.status === TaskStatus.IN_PROGRESS)))
        );
        this.myCompletedTasks$ = this.appService.tasks$.pipe(
            map(tasks => tasks.filter(t => t.workerId === this.appService.currentUser?.id && t.status === TaskStatus.COMPLETED))
        );
    }

    ngOnInit() {
        this.appService.currentUser$.subscribe(user => {
            this.currentUser = user;
        });
    }

    handleBidSubmit(event: Event) {
        event.preventDefault();
        const form = event.target as HTMLFormElement;
        const formData = new FormData(form);

        const data = {
            taskId: this.biddingOn.id,
            workerId: this.currentUser?.id,
            workerName: this.currentUser?.name,
            workerAvatar: this.currentUser?.avatar,
            workerRating: this.currentUser?.rating,
            amount: Number(formData.get('amount')),
            estimatedDays: Number(formData.get('estimatedDays')),
            message: formData.get('message') as string,
        };

        this.appService.placeBid(data);
        this.biddingOn = null;
    }

    markArrival(taskId: string) {
        this.appService.markWorkerArrival(taskId);
    }

    markAsArrived(taskId: string) {
        this.appService.updateTaskStatus(taskId, TaskStatus.ARRIVED);
    }

    startWork(taskId: string) {
        this.appService.updateTaskStatus(taskId, TaskStatus.IN_PROGRESS);
    }

    completeWork(taskId: string) {
        this.appService.updateTaskStatus(taskId, TaskStatus.WORK_COMPLETED);
    }

    confirmBooking(taskId: string) {
        this.appService.updateTaskStatus(taskId, TaskStatus.CONFIRMED);
    }

    startTraveling(taskId: string) {
        this.appService.updateTaskStatus(taskId, TaskStatus.TRAVELING);
    }

    setBiddingOn(task: Task | null) {
        this.biddingOn = task;
    }

    formatDate(date: string) {
        return new Date(date).toLocaleDateString();
    }

    canRaiseDispute(task: Task): boolean {
        if (!task.completionDate) return false;
        const completionDate = new Date(task.completionDate).getTime();
        const now = new Date().getTime();
        const hoursDiff = (now - completionDate) / (1000 * 60 * 60);
        return hoursDiff <= 72;
    }

    openDisputeModal(taskId: string) {
        this.disputeTaskId = taskId;
        this.showDisputeModal = true;
        this.disputeReason = '';
    }

    submitDispute() {
        if (this.disputeReason.trim() && this.currentUser) {
            this.appService.createDispute({
                taskId: this.disputeTaskId,
                initiatorId: this.currentUser.id,
                initiatorRole: UserRole.WORKER,
                respondentId: '',
                reason: this.disputeReason
            });
            this.showDisputeModal = false;
            this.disputeReason = '';
            this.router.navigate(['/disputes']);
        }
    }

    getEarnings(): number {
        const completedTasks = this.appService.tasks.filter(
            t => t.workerId === this.currentUser?.id && t.status === TaskStatus.COMPLETED
        );
        return completedTasks.reduce((sum, task) => sum + (task.budgetMax || 0), 0);
    }

    getCompletedJobsCount(): number {
        return this.appService.tasks.filter(
            t => t.workerId === this.currentUser?.id && t.status === TaskStatus.COMPLETED
        ).length;
    }

    getAverageRating(): number {
        return this.currentUser?.rating || 0;
    }}