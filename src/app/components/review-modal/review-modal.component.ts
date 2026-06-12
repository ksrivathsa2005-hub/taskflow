import { Component, Input, Output, EventEmitter, inject, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Star, X } from 'lucide-angular';
import { ToastService } from '../../services/toast.service';
import { AppService } from '../../app.service';
import { TaskFlowApiService } from '../../services/taskflow-api.service';
import { firstValueFrom } from 'rxjs';

@Component({
    selector: 'app-review-modal',
    standalone: true,
    imports: [CommonModule, FormsModule, LucideAngularModule],
    template: `
        <div *ngIf="showModal"
            class="fixed inset-0 z-[70] flex items-center justify-center px-4 bg-slate-900/60 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
            aria-labelledby="review-modal-title">
            <div class="bg-white rounded-[2rem] w-full max-w-md overflow-hidden shadow-2xl">
                <div class="px-8 py-6 border-b border-slate-100 flex justify-between items-center">
                    <h2 id="review-modal-title" class="text-2xl font-black text-slate-900">Review Work</h2>
                    <button (click)="closeModal()"
                        type="button"
                        class="bg-slate-50 p-2 rounded-xl text-slate-400 hover:text-slate-600 transition-all focus-visible:ring-2 focus-visible:ring-indigo-500 outline-none"
                        aria-label="Close modal">
                        <lucide-icon [img]="X" class="w-5 h-5"></lucide-icon>
                    </button>
                </div>
                <form (ngSubmit)="submitReview()" class="p-8 space-y-6">
                    <!-- Star Rating -->
                    <div>
                        <label id="rating-label" class="block text-sm font-bold text-slate-700 mb-3">Rating <span class="text-red-500">*</span></label>
                        <div class="flex gap-2" role="radiogroup" aria-labelledby="rating-label">
                            <button *ngFor="let star of [1,2,3,4,5]"
                                type="button"
                                (click)="setRating(star)"
                                (mouseenter)="setHoveredRating(star)"
                                (mouseleave)="resetHoveredRating()"
                                class="transition-all hover:scale-125 active:scale-95 focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-lg outline-none"
                                role="radio"
                                [attr.aria-checked]="star <= rating"
                                [attr.aria-label]="star + (star === 1 ? ' star' : ' stars')">
                                <lucide-icon [img]="Star" 
                                    [class.fill-amber-400]="star <= (hoveredRating || rating)"
                                    [class.text-amber-400]="star <= (hoveredRating || rating)"
                                    [class.text-slate-300]="star > (hoveredRating || rating)"
                                    class="w-8 h-8 transition-colors"></lucide-icon>
                            </button>
                        </div>
                        <p *ngIf="rating > 0" class="text-xs text-indigo-600 mt-2 font-medium">Rating: {{rating}} out of 5</p>
                        <p *ngIf="showRatingError" class="text-xs text-red-500 mt-2 font-medium">Please select a rating</p>
                    </div>

                    <!-- Review Text -->
                    <div>
                        <label for="review-comment" class="block text-sm font-bold text-slate-700 mb-2">Your Review <span class="text-red-500">*</span></label>
                        <textarea [(ngModel)]="comment"
                            id="review-comment"
                            name="comment"
                            rows="4"
                            placeholder="Share your experience..."
                            class="w-full px-4 py-3 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none transition-all"
                            [class.border-red-300]="showCommentError"></textarea>
                        <p *ngIf="showCommentError" class="text-xs text-red-500 mt-2 font-medium">Please write a review</p>
                    </div>

                    <!-- Success Message -->
                    <div *ngIf="successMessage" class="bg-green-50 border border-green-200 rounded-xl p-4">
                        <p class="text-sm font-bold text-green-700">{{successMessage}}</p>
                    </div>

                    <!-- Submit Button -->
                    <button type="submit" [disabled]="isSubmitting"
                        class="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors focus-visible:ring-2 focus-visible:ring-indigo-500 outline-none">
                        {{isSubmitting ? 'Submitting...' : 'Submit Review'}}
                    </button>
                </form>
            </div>
        </div>
    `,
    styles: [`
        :host ::ng-deep {
            lucide-icon {
                display: inline-block;
            }
        }
    `]
})
export class ReviewModalComponent {
    @Input() showModal = false;
    @Input() workerId: string = '';
    @Input() taskId: string = '';
    @Input() customerId: string = '';
    @Output() close = new EventEmitter<void>();
    @Output() submitted = new EventEmitter<{ rating: number; comment: string }>();

    rating = 0;
    hoveredRating = 0;
    comment = '';
    showRatingError = false;
    showCommentError = false;
    isSubmitting = false;
    successMessage = '';
    
    readonly Star = Star;
    readonly X = X;
    
    private toastService = inject(ToastService);
    private appService = inject(AppService);
    private apiService = inject(TaskFlowApiService);

    @HostListener('window:keydown.escape')
    onEscape() {
        if (this.showModal) {
            this.closeModal();
        }
    }

    setRating(value: number) {
        this.rating = value;
        this.showRatingError = false;
    }

    setHoveredRating(value: number) {
        this.hoveredRating = value;
    }

    resetHoveredRating() {
        this.hoveredRating = 0;
    }

    closeModal() {
        this.showModal = false;
        this.rating = 0;
        this.comment = '';
        this.showRatingError = false;
        this.showCommentError = false;
        this.successMessage = '';
        this.isSubmitting = false;
        this.close.emit();
    }

    async submitReview() {
        this.showRatingError = this.rating === 0;
        this.showCommentError = !this.comment || this.comment.trim().length === 0;

        if (this.showRatingError || this.showCommentError) {
            return;
        }

        this.isSubmitting = true;

        try {
            const USE_REAL_API = true; // Match app.service setting
            
            if (USE_REAL_API && this.apiService.isLoggedIn) {
                // Submit review via API
                console.log('Submitting review via API:', {
                    taskId: this.taskId,
                    revieweeId: this.workerId,
                    rating: this.rating,
                    comment: this.comment
                });
                
                const reviewRequest = {
                    taskId: this.taskId,
                    revieweeId: this.workerId,
                    rating: this.rating,
                    comment: this.comment
                };
                
                await firstValueFrom(this.apiService.createReview(reviewRequest));
                console.log('Review submitted successfully via API');
                
                // Refresh tasks to get updated reviews
                await this.appService.loadTasksFromApi();
                
                this.toastService.success('Review submitted successfully!');
            } else {
                // Mock mode - use localStorage
                const existingReviews = JSON.parse(localStorage.getItem('reviews') || '[]');
                
                const newReview = {
                    reviewId: 'review_' + Date.now(),
                    taskId: this.taskId,
                    workerId: this.workerId,
                    customerId: this.customerId,
                    rating: this.rating,
                    reviewText: this.comment,
                    timestamp: new Date().toISOString()
                };

                existingReviews.push(newReview);
                localStorage.setItem('reviews', JSON.stringify(existingReviews));

                // Update worker's average rating
                const existingUsers = JSON.parse(localStorage.getItem('users') || '[]');
                const workerIndex = existingUsers.findIndex((u: any) => u.id === this.workerId);
                
                if (workerIndex >= 0) {
                    const worker = existingUsers[workerIndex];
                    const allReviewsForWorker = existingReviews.filter((r: any) => r.workerId === this.workerId);
                    const avgRating = allReviewsForWorker.reduce((sum: number, r: any) => sum + r.rating, 0) / allReviewsForWorker.length;
                    
                    worker.rating = Math.round(avgRating * 10) / 10;
                    worker.isBusy = false;
                    existingUsers[workerIndex] = worker;
                    localStorage.setItem('users', JSON.stringify(existingUsers));
                }

                this.toastService.success('Review submitted successfully!');
            }

            // Show success message
            this.successMessage = '✓ Review submitted successfully!';
            this.submitted.emit({ rating: this.rating, comment: this.comment });
            
            // Close modal after delay
            setTimeout(() => {
                this.closeModal();
            }, 1500);

        } catch (error: any) {
            console.error('Error submitting review:', error);
            this.toastService.error(error?.error?.message || 'Error submitting review. Please try again.');
            this.isSubmitting = false;
        }
    }
}
