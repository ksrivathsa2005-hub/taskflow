import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
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
        <div *ngIf="showModal" class="fixed inset-0 z-[70] flex items-center justify-center px-4 bg-slate-900/60 backdrop-blur-sm">
            <div class="bg-white rounded-[2rem] w-full max-w-md overflow-hidden shadow-2xl">
                <div class="px-8 py-6 border-b border-slate-100 flex justify-between items-center">
                    <h2 class="text-2xl font-black text-slate-900">Review Work</h2>
                    <button (click)="closeModal()" type="button" class="bg-slate-50 p-2 rounded-xl text-slate-400 hover:text-slate-600">
                        <lucide-icon [img]="X" class="w-5 h-5"></lucide-icon>
                    </button>
                </div>
                <form (ngSubmit)="submitReview()" class="p-8 space-y-6">
                    <!-- Star Rating -->
                    <div>
                        <label class="block text-sm font-bold text-slate-700 mb-3">Rating <span class="text-red-500">*</span></label>
                        <div class="flex gap-2">
                            <button *ngFor="let star of [1,2,3,4,5]" type="button" (click)="setRating(star)"
                                class="transition-all hover:scale-125 active:scale-95">
                                <lucide-icon [img]="Star" 
                                    [class.fill-amber-400]="star <= rating" 
                                    [class.text-amber-400]="star <= rating" 
                                    [class.text-slate-300]="star > rating" 
                                    class="w-8 h-8"></lucide-icon>
                            </button>
                        </div>
                        <p *ngIf="rating > 0" class="text-xs text-indigo-600 mt-2 font-medium">Rating: {{rating}} out of 5</p>
                        <p *ngIf="showRatingError" class="text-xs text-red-500 mt-2 font-medium">Please select a rating</p>
                    </div>

                    <!-- Review Text -->
                    <div>
                        <label class="block text-sm font-bold text-slate-700 mb-2">Your Review <span class="text-red-500">*</span></label>
                        <textarea [(ngModel)]="comment" name="comment" rows="4" placeholder="Share your experience..."
                            class="w-full px-4 py-3 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                            [class.border-red-300]="showCommentError"></textarea>
                        <p *ngIf="showCommentError" class="text-xs text-red-500 mt-2 font-medium">Please write a review</p>
                    </div>

                    <!-- Success Message -->
                    <div *ngIf="successMessage" class="bg-green-50 border border-green-200 rounded-xl p-4">
                        <p class="text-sm font-bold text-green-700">{{successMessage}}</p>
                    </div>

                    <!-- Submit Button -->
                    <button type="submit" [disabled]="isSubmitting"
                        class="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors">
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

    setRating(value: number) {
        this.rating = value;
        this.showRatingError = false;
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
            await this.appService.submitReview(this.taskId, {
                revieweeId: this.workerId,
                rating: this.rating,
                comment: this.comment
            });

            // Show success message
            this.successMessage = '✓ Review submitted successfully!';
            this.submitted.emit({ rating: this.rating, comment: this.comment });
            
            // Close modal after delay
            setTimeout(() => {
                this.closeModal();
            }, 1500);

        } catch (error: any) {
            console.error('Error submitting review:', error);
            // Error handling is now partly in appService, but we keep isSubmitting reset here
            this.isSubmitting = false;
        }
    }
}
