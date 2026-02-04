import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';

@Component({
    selector: 'app-dispute-modal',
    standalone: true,
    imports: [CommonModule, FormsModule, LucideAngularModule],
    template: `
        <div *ngIf="showModal" class="fixed inset-0 z-[70] flex items-center justify-center px-4 bg-slate-900/60 backdrop-blur-sm">
            <div class="bg-white rounded-[2rem] w-full max-w-md shadow-2xl">
                <div class="px-8 py-6 border-b border-slate-100 flex justify-between items-center">
                    <h2 class="text-2xl font-black text-slate-900">Report Issue</h2>
                    <button (click)="closeModal()" class="bg-slate-50 p-2 rounded-xl text-slate-400 hover:text-slate-600">
                        <i data-lucide="x" class="w-5 h-5"></i>
                    </button>
                </div>
                <form (ngSubmit)="submitDispute()" class="p-8 space-y-6">
                    <div>
                        <label class="block text-sm font-bold text-slate-700 mb-2">Reason for Dispute</label>
                        <textarea [(ngModel)]="reason" name="reason" rows="4" placeholder="Describe the issue..."
                            class="w-full px-4 py-3 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-red-500"></textarea>
                    </div>

                    <button type="submit" [disabled]="!reason.trim()"
                        class="w-full bg-red-600 text-white font-bold py-3 rounded-xl hover:bg-red-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors">
                        Raise Dispute
                    </button>
                </form>
            </div>
        </div>
    `,
    styles: [`
        :host ::ng-deep {
            i[data-lucide] {
                display: inline-block;
            }
        }
    `]
})
export class DisputeModalComponent {
    @Input() showModal = false;
    @Input() taskId: string = '';
    @Input() respondentId: string = '';
    @Output() close = new EventEmitter<void>();
    @Output() submitted = new EventEmitter<{ reason: string }>();

    reason = '';

    closeModal() {
        this.showModal = false;
        this.reason = '';
        this.close.emit();
    }

    submitDispute() {
        if (this.reason.trim()) {
            this.submitted.emit({ reason: this.reason });
            this.closeModal();
        }
    }
}
