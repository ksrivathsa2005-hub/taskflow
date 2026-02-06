import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AppService } from '../../app.service';
import { Review, Task, UserRole } from '../../types';
import { LucideAngularModule } from 'lucide-angular';
import { ConfirmDialogService } from '../../services/confirm-dialog.service';
import { ToastService } from '../../services/toast.service';
import { TaskFlowApiService } from '../../services/taskflow-api.service';
import { ApiMapper } from '../../services/api-mapper';
import { firstValueFrom } from 'rxjs';

@Component({
    selector: 'app-reviews',
    standalone: true,
    imports: [CommonModule, FormsModule, LucideAngularModule],
    template: `
        <div class="p-6 bg-gray-50 min-h-screen">
            <div class="max-w-6xl mx-auto">
                <!-- Header -->
                <div class="mb-8">
                    <h1 class="text-3xl font-bold text-gray-900 mb-2">Reviews & Ratings</h1>
                    <p class="text-gray-600">View and manage task reviews</p>
                </div>

                <!-- Stats -->
                <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <div class="bg-white rounded-lg shadow-md p-6">
                        <div class="text-sm text-gray-600 mb-1">Total Reviews</div>
                        <div class="text-3xl font-bold text-gray-900">{{ totalReviews }}</div>
                    </div>
                    <div class="bg-white rounded-lg shadow-md p-6">
                        <div class="text-sm text-gray-600 mb-1">Average Rating</div>
                        <div class="text-3xl font-bold text-yellow-500">★ {{ averageRating }}</div>
                    </div>
                    <div class="bg-white rounded-lg shadow-md p-6">
                        <div class="text-sm text-gray-600 mb-1">5 Star</div>
                        <div class="text-3xl font-bold text-green-600">{{ fiveStarCount }}</div>
                    </div>
                    <div class="bg-white rounded-lg shadow-md p-6">
                        <div class="text-sm text-gray-600 mb-1">1-4 Star</div>
                        <div class="text-3xl font-bold text-orange-600">{{ lowStarCount }}</div>
                    </div>
                </div>

                <!-- Filter Section -->
                <div class="bg-white rounded-lg shadow-md p-4 mb-6">
                    <div class="flex gap-4 flex-wrap">
                        <div class="flex-1 min-w-48">
                            <label class="block text-sm font-medium text-gray-700 mb-2">Filter by Rating</label>
                            <select [(ngModel)]="selectedRating" (change)="applyFilter()" class="w-full border rounded-lg px-3 py-2">
                                <option value="">All Ratings</option>
                                <option value="5">5 Stars</option>
                                <option value="4">4 Stars</option>
                                <option value="3">3 Stars</option>
                                <option value="2">2 Stars</option>
                                <option value="1">1 Star</option>
                            </select>
                        </div>
                        <div class="flex-1 min-w-48">
                            <label class="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                            <select [(ngModel)]="sortBy" (change)="applyFilter()" class="w-full border rounded-lg px-3 py-2">
                                <option value="newest">Newest First</option>
                                <option value="highest">Highest Rating</option>
                                <option value="lowest">Lowest Rating</option>
                            </select>
                        </div>
                        <div class="flex-1 min-w-48">
                            <label class="block text-sm font-medium text-gray-700 mb-2">Search Reviews</label>
                            <input [(ngModel)]="searchQuery" (keyup)="applyFilter()" placeholder="Search by task or reviewer..." class="w-full border rounded-lg px-3 py-2">
                        </div>
                    </div>
                </div>

                <!-- Reviews List -->
                <div *ngIf="isLoading" class="bg-white rounded-[2.5rem] shadow-xl p-16 text-center border border-slate-100">
                    <div class="animate-spin rounded-full h-16 w-16 border-4 border-indigo-600 border-t-transparent mx-auto mb-6"></div>
                    <p class="text-slate-600 text-xl font-bold">Loading reviews...</p>
                </div>

                <div *ngIf="!isLoading && filteredReviews.length === 0" class="bg-white rounded-[2.5rem] shadow-xl p-16 text-center border border-slate-100">
                    <div class="text-slate-200 text-8xl mb-6">★</div>
                    <p class="text-slate-900 text-2xl font-black mb-3">No reviews found</p>
                    <p class="text-slate-500 font-medium">Reviews will appear here when customers complete and rate tasks.</p>
                </div>

                <div *ngIf="!isLoading" class="space-y-8">
                    <div *ngFor="let review of filteredReviews" class="bg-white rounded-[2.5rem] shadow-xl p-8 hover:shadow-2xl transition-all border border-slate-100">
                        <!-- Task Info Header -->
                        <div class="mb-6 pb-6 border-b border-slate-100">
                            <div class="flex items-center justify-between flex-wrap gap-4">
                                <div>
                                    <h3 class="font-black text-xl text-slate-900 mb-1">{{ getTaskTitle(review.taskId) }}</h3>
                                    <p class="text-xs font-black text-slate-400 uppercase tracking-widest">Task ID: #{{ review.taskId.substring(0, 8) }}</p>
                                </div>
                                <div class="flex items-center gap-1 bg-amber-50 px-4 py-2 rounded-2xl">
                                    <span *ngFor="let i of [1,2,3,4,5]" class="text-2xl" 
                                        [class.text-amber-400]="i <= review.rating"
                                        [class.text-slate-200]="i > review.rating">★</span>
                                    <span class="ml-2 font-black text-amber-700 text-lg">{{ review.rating }}</span>
                                </div>
                            </div>
                        </div>

                        <!-- Reviewer Info -->
                        <div class="flex flex-col md:flex-row items-start gap-6 mb-6">
                            <img [src]="getReviewerAvatar(review)" alt="{{ review.reviewerName }}" 
                                class="w-16 h-16 rounded-[1.5rem] object-cover border-4 border-slate-50 shadow-lg">
                            <div class="flex-1 w-full">
                                <div class="flex items-center justify-between mb-4">
                                    <div>
                                        <p class="font-black text-slate-900 text-lg">{{ review.reviewerName }}</p>
                                        <p class="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">{{ review.createdDate | date: 'MMM d, y • h:mm a' }}</p>
                                    </div>
                                </div>
                                
                                <!-- Review Comment -->
                                <div class="bg-slate-50 rounded-[2rem] p-6 border border-slate-100 relative">
                                    <span class="absolute -top-4 -left-2 text-6xl text-indigo-200 opacity-50 font-serif">"</span>
                                    <p class="text-slate-700 font-medium leading-relaxed relative z-10">{{ review.comment || 'No comment provided' }}</p>
                                    <span class="absolute -bottom-10 -right-2 text-6xl text-indigo-200 opacity-50 font-serif rotate-180">"</span>
                                </div>

                                <!-- Worker Info -->
                                <div class="mt-6 flex items-center gap-2">
                                    <span class="text-xs font-black text-slate-400 uppercase tracking-widest">Expert:</span>
                                    <span class="text-sm font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-lg">{{ getWorkerName(review.revieweeId) }}</span>
                                </div>
                            </div>
                        </div>

                        <!-- Action Buttons -->
                        <div class="flex items-center justify-between text-sm pt-6 border-t border-slate-100">
                            <div class="flex gap-4">
                                <button class="bg-slate-50 hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 px-4 py-2 rounded-xl flex items-center gap-2 transition-all font-bold">
                                    <span>👍</span>
                                    <span>Helpful</span>
                                </button>
                                <button class="bg-slate-50 hover:bg-red-50 text-slate-600 hover:text-red-600 px-4 py-2 rounded-xl flex items-center gap-2 transition-all font-bold">
                                    <span>🚩</span>
                                    <span>Report</span>
                                </button>
                            </div>
                            <button *ngIf="canDelete(review)" (click)="deleteReview(review)" 
                                class="text-red-600 hover:bg-red-50 px-4 py-2 rounded-xl flex items-center gap-2 font-bold transition-all">
                                <span>🗑️</span>
                                <span>Delete</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `
})
export class ReviewsComponent implements OnInit {
    filteredReviews: Review[] = [];
    allReviews: Review[] = [];
    selectedRating: string = '';
    sortBy: string = 'newest';
    searchQuery: string = '';

    totalReviews: number = 0;
    averageRating: number = 0;
    fiveStarCount: number = 0;
    lowStarCount: number = 0;
    isLoading: boolean = false;

    private apiService = inject(TaskFlowApiService);

    constructor(private appService: AppService) {}

    ngOnInit() {
        console.log('Reviews component initialized');
        console.log('Current user:', this.appService.currentUser);
        this.loadReviews();
        
        // Re-load reviews whenever tasks change (in case new reviews are added)
        this.appService.tasks$.subscribe(() => {
            console.log('Tasks changed, reloading reviews');
            this.loadReviews();
        });
    }

    async loadReviews() {
        this.isLoading = true;
        const USE_REAL_API = true; // Match app.service setting
        
        try {
            if (USE_REAL_API && this.apiService.isLoggedIn) {
                // Load reviews from API
                console.log('Loading reviews from API...');
                const currentUser = this.appService.currentUser;
                const filters: any = {};
                
                // For workers, show their reviews
                if (currentUser?.role === UserRole.WORKER) {
                    filters.workerId = currentUser.id;
                }
                // For admins and customers, show all reviews
                
                const response = await firstValueFrom(this.apiService.getReviews(filters));
                console.log('Reviews API response:', response);
                
                // Map API reviews to local format
                this.allReviews = response.data.map(apiReview => ApiMapper.toLocalReview(apiReview));
                console.log('Mapped reviews:', this.allReviews);
            } else {
                // Load reviews from tasks (mock mode)
                const tasks = this.appService.tasks;
                this.allReviews = [];

                tasks.forEach(task => {
                    if (task.reviews && task.reviews.length > 0) {
                        this.allReviews.push(...task.reviews);
                    }
                });
            }

            this.calculateStats();
            this.applyFilter();
        } catch (error) {
            console.error('Error loading reviews:', error);
            this.toastService.error('Failed to load reviews');
        } finally {
            this.isLoading = false;
        }
    }

    calculateStats() {
        this.totalReviews = this.allReviews.length;

        if (this.allReviews.length > 0) {
            const total = this.allReviews.reduce((sum, r) => sum + r.rating, 0);
            this.averageRating = parseFloat((total / this.allReviews.length).toFixed(1));
        } else {
            this.averageRating = 0;
        }

        this.fiveStarCount = this.allReviews.filter(r => r.rating === 5).length;
        this.lowStarCount = this.allReviews.filter(r => r.rating < 5).length;
    }

    applyFilter() {
        let filtered = [...this.allReviews];

        // Filter by rating
        if (this.selectedRating) {
            filtered = filtered.filter(r => r.rating === parseInt(this.selectedRating));
        }

        // Search query
        if (this.searchQuery) {
            const query = this.searchQuery.toLowerCase();
            filtered = filtered.filter(r =>
                r.reviewerName.toLowerCase().includes(query) ||
                r.comment.toLowerCase().includes(query) ||
                r.taskId.toLowerCase().includes(query)
            );
        }

        // Sort
        if (this.sortBy === 'highest') {
            filtered.sort((a, b) => b.rating - a.rating);
        } else if (this.sortBy === 'lowest') {
            filtered.sort((a, b) => a.rating - b.rating);
        } else {
            // newest - sort by date descending
            filtered.sort((a, b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime());
        }

        this.filteredReviews = filtered;
    }

    getReviewerAvatar(review: Review): string {
        const user = this.appService.users.find(u => u.id === review.reviewerId);
        return user ? user.avatar : 'https://picsum.photos/seed/user/200';
    }

    getTaskTitle(taskId: string): string {
        const task = this.appService.tasks.find(t => t.id === taskId);
        return task ? task.title : 'Unknown Task';
    }

    getWorkerName(workerId: string): string {
        const worker = this.appService.users.find(u => u.id === workerId);
        return worker ? worker.name : 'Unknown Worker';
    }

    private confirmService = inject(ConfirmDialogService);
    private toastService = inject(ToastService);

    canDelete(review: Review): boolean {
        const currentUser = this.appService.currentUser;
        return currentUser?.id === review.reviewerId || currentUser?.role === 'ADMIN';
    }

    async deleteReview(review: Review) {
        const confirmed = await this.confirmService.show(
            'Are you sure you want to delete this review? This action cannot be undone.',
            { title: 'Delete Review', type: 'danger', confirmText: 'Delete' }
        );
        if (confirmed) {
            // TODO: Implement delete functionality
            console.log('Deleting review:', review.id);
            this.toastService.success('Review deleted successfully');
        }
    }
}
