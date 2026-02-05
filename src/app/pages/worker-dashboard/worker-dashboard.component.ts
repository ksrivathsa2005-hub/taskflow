
import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
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
import { BehaviorSubject, Observable, map } from 'rxjs';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'app-worker-dashboard',
    standalone: true,
    imports: [CommonModule, FormsModule, LucideAngularModule, TaskCardComponent, PlatformActivityComponent],
    templateUrl: './worker-dashboard.component.html',
    styleUrls: ['./worker-dashboard.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class WorkerDashboardComponent implements OnInit {
    private apiService = inject(ApiService);
    private authService = inject(AuthService);
    private toastService = inject(ToastService);

    private tasksSubject = new BehaviorSubject<Task[]>([]);
    private tasks$ = this.tasksSubject.asObservable();

    availableTasks$: Observable<Task[]>;
    myActiveTask$: Observable<Task | undefined>;
    myCompletedTasks$: Observable<Task[]>;
    currentUser: User | null = null;

    biddingOn: Task | null = null;
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

    constructor(private router: Router) {
        this.availableTasks$ = this.tasks$.pipe(
            map(tasks => {
                let filtered = tasks.filter(t => t.status === TaskStatus.POSTED || t.status === TaskStatus.BIDDING);

                const currentWorker = this.currentUser;
                if (currentWorker?.categories && currentWorker.categories.length > 0) {
                    filtered = filtered.filter(t => {
                        if (t.category) {
                            return currentWorker.categories!.some(cat =>
                                cat.toLowerCase() === t.category!.toLowerCase()
                            );
                        }
                        return true;
                    });
                }

                return filtered;
            })
        );

        this.myActiveTask$ = this.tasks$.pipe(
            map(tasks => tasks.find(t => t.workerId === this.currentUser?.id && [TaskStatus.ASSIGNED, TaskStatus.IN_PROGRESS, TaskStatus.CONFIRMED, TaskStatus.TRAVELING, TaskStatus.ARRIVED, TaskStatus.WORK_COMPLETED].includes(t.status as TaskStatus)))
        );

        this.myCompletedTasks$ = this.tasks$.pipe(
            map(tasks => tasks.filter(t => t.workerId === this.currentUser?.id && t.status === TaskStatus.COMPLETED))
        );
    }

    ngOnInit() {
        this.authService.currentUser$.subscribe(user => {
            this.currentUser = user;
            if (user) {
                this.loadTasks();
            }
        });
    }

    private loadTasks() {
        const workerId = this.currentUser?.id;
        this.apiService.getTasks({}).subscribe({
            next: (response) => {
                const tasks = response.data.map(apiTask => ({
                    ...apiTask,
                    photos: Array.isArray(apiTask.photos)
                        ? apiTask.photos.map(photo => typeof photo === 'string' ? photo : photo.photoUrl)
                        : [],
                    location: apiTask.location
                })) as Task[];

                this.tasksSubject.next(tasks);

                if (!workerId) {
                    return;
                }
            },
            error: (error) => {
                console.error('Error loading tasks:', error);
                this.tasksSubject.next([]);
            }
        });
    }

    handleBidSubmit(event: Event) {
        event.preventDefault();
        if (!this.biddingOn || !this.currentUser) return;

        const form = event.target as HTMLFormElement;
        const formData = new FormData(form);

        const data = {
            taskId: this.biddingOn.id,
            amount: Number(formData.get('amount')),
            estimatedDays: Number(formData.get('estimatedDays')),
            message: formData.get('message') as string,
        };

        this.apiService.createBid(data).subscribe({
            next: () => {
                this.toastService.success('Bid submitted successfully');
                this.biddingOn = null;
                this.loadTasks();
            },
            error: (error) => {
                console.error('Error submitting bid:', error);
                this.toastService.error(error.message || 'Failed to submit bid');
            }
        });
    }

    markArrival(taskId: string) {
        this.updateStatus(taskId, TaskStatus.ARRIVED);
    }

    markAsArrived(taskId: string) {
        this.updateStatus(taskId, TaskStatus.ARRIVED);
    }

    startWork(taskId: string) {
        this.updateStatus(taskId, TaskStatus.IN_PROGRESS);
    }

    completeWork(taskId: string) {
        this.updateStatus(taskId, TaskStatus.WORK_COMPLETED);
    }

    confirmBooking(taskId: string) {
        this.updateStatus(taskId, TaskStatus.CONFIRMED);
    }

    startTraveling(taskId: string) {
        this.updateStatus(taskId, TaskStatus.TRAVELING);
    }

    private updateStatus(taskId: string, status: TaskStatus) {
        this.apiService.updateTaskStatus(taskId, status).subscribe({
            next: () => this.loadTasks(),
            error: (error) => {
                console.error('Error updating task status:', error);
                this.toastService.error(error.message || 'Failed to update status');
            }
        });
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
            this.apiService.createDispute({
                taskId: this.disputeTaskId,
                respondentId: '',
                reason: this.disputeReason,
                issueType: 'Worker dispute'
            }).subscribe({
                next: () => {
                    this.showDisputeModal = false;
                    this.disputeReason = '';
                    this.router.navigate(['/disputes']);
                },
                error: (error) => {
                    console.error('Error creating dispute:', error);
                    this.toastService.error(error.message || 'Failed to create dispute');
                }
            });
        }
    }

    getEarnings(): number {
        const completedTasks = this.tasksSubject.value.filter(
            t => t.workerId === this.currentUser?.id && t.status === TaskStatus.COMPLETED
        );
        return completedTasks.reduce((sum, task) => sum + (task.budgetMax || 0), 0);
    }

    getCompletedJobsCount(): number {
        return this.tasksSubject.value.filter(
            t => t.workerId === this.currentUser?.id && t.status === TaskStatus.COMPLETED
        ).length;
    }

    getAverageRating(): number {
        return this.currentUser?.rating || 0;
    }

    formatLocation(location: Task['location']): string {
        if (!location) return '';
        if (typeof location === 'string') return location;
        const parts = [location.area, location.city, location.state].filter(Boolean);
        return parts.join(', ');
    }
}