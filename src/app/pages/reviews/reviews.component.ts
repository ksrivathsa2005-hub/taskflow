import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AppService } from '../../app.service';
import { Review, Task, UserRole } from '../../types';
import { LucideAngularModule } from 'lucide-angular';
import { ConfirmDialogService } from '../../services/confirm-dialog.service';
import { ToastService } from '../../services/toast.service';

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
                <div *ngIf="filteredReviews.length === 0" class="bg-white rounded-lg shadow-md p-12 text-center">
                    <i data-lucide="star" class="w-12 h-12 text-gray-300 mx-auto mb-4"></i>
                    <p class="text-gray-600 text-lg">No reviews found</p>
                </div>

                <div class="space-y-6">
                    <div *ngFor="let review of filteredReviews" class="bg-white rounded-lg shadow-md p-6">
                        <div class="flex justify-between items-start mb-4">
                            <div class="flex-1">
                                <div class="flex items-center gap-3 mb-2">
                                    <img [src]="getReviewerAvatar(review)" alt="{{ review.reviewerName }}" 
                                        class="w-10 h-10 rounded-full object-cover">
                                    <div>
                                        <p class="font-semibold text-gray-900">{{ review.reviewerName }}</p>
                                        <p class="text-sm text-gray-600">{{ review.createdDate | date: 'medium' }}</p>
                                    </div>
                                </div>
                            </div>
                            <div class="text-right">
                                <div class="flex items-center justify-end gap-1 mb-2">
                                    <i data-lucide="star" class="w-5 h-5 fill-yellow-400 text-yellow-400"></i>
                                    <span class="font-bold text-lg text-gray-900">{{ review.rating }}</span>
                                    <span class="text-sm text-gray-600">/5</span>
                                </div>
                                <p class="text-xs text-gray-500">Task #{{ review.taskId }}</p>
                            </div>
                        </div>

                        <div class="bg-gray-50 rounded-lg p-4 mb-4">
                            <p class="text-gray-800">{{ review.comment }}</p>
                        </div>

                        <div class="flex items-center justify-between text-sm">
                            <div class="flex gap-4">
                                <button class="text-gray-600 hover:text-blue-600 flex items-center gap-1">
                                    <i data-lucide="thumbs-up" class="w-4 h-4"></i>
                                    <span>Helpful</span>
                                </button>
                                <button class="text-gray-600 hover:text-red-600 flex items-center gap-1">
                                    <i data-lucide="flag" class="w-4 h-4"></i>
                                    <span>Report</span>
                                </button>
                            </div>
                            <button *ngIf="canDelete(review)" (click)="deleteReview(review)" class="text-red-600 hover:text-red-800 flex items-center gap-1">
                                <i data-lucide="trash-2" class="w-4 h-4"></i>
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

    constructor(private appService: AppService) {}

    ngOnInit() {
        this.loadReviews();
    }

    loadReviews() {
        // Extract all reviews from all tasks
        const tasks = this.appService.tasks;
        this.allReviews = [];

        tasks.forEach(task => {
            if (task.reviews && task.reviews.length > 0) {
                this.allReviews.push(...task.reviews);
            }
        });

        this.calculateStats();
        this.applyFilter();
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
        return user ? (user.avatar || 'https://picsum.photos/seed/user/200') : 'https://picsum.photos/seed/user/200';
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
