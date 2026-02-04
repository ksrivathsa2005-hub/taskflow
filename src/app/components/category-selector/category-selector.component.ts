import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SERVICE_CATEGORIES } from '../../service-categories';
import { ToastService } from '../../services/toast.service';
import {
    LucideAngularModule,
    Droplet,
    Zap,
    Hammer,
    Paintbrush,
    Trash2,
    Wind,
    Bug,
    Leaf,
    Lock,
    Wrench,
    ChevronRight
} from 'lucide-angular';

@Component({
    selector: 'app-category-selector',
    standalone: true,
    imports: [CommonModule, FormsModule, LucideAngularModule],
    template: `
        <div>
            <div class="mb-4">
                <label class="block text-sm font-bold text-slate-700 mb-3">
                    {{ label }}
                    <span *ngIf="maxSelections" class="text-xs text-slate-500 font-normal">(Select up to {{ maxSelections }})</span>
                </label>
            </div>

            <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                <div *ngFor="let category of SERVICE_CATEGORIES"
                    (click)="toggleCategory(category.id)"
                    [class.ring-2]="isSelected(category.id)"
                    [class.ring-indigo-500]="isSelected(category.id)"
                    [class.bg-indigo-50]="isSelected(category.id)"
                    class="p-4 rounded-2xl border-2 border-slate-200 hover:border-indigo-300 cursor-pointer transition-all text-center">
                    
                    <div [class]="category.color" class="w-12 h-12 rounded-xl flex items-center justify-center mb-2 mx-auto">
                        <lucide-icon [img]="iconMap[category.icon]" class="w-6 h-6"></lucide-icon>
                    </div>
                    <p class="font-bold text-slate-900 text-sm">{{ category.name }}</p>
                    <p class="text-xs text-slate-500 mt-1">{{ category.description }}</p>
                </div>
            </div>

            <div *ngIf="selectedCategories.length > 0" class="mt-6 p-4 bg-indigo-50 rounded-xl border border-indigo-200">
                <p class="text-sm font-bold text-indigo-900 mb-3">Selected Categories ({{ selectedCategories.length }}{{ maxSelections ? '/' + maxSelections : '' }}):</p>
                <div class="flex flex-wrap gap-2">
                    <div *ngFor="let catId of selectedCategories" 
                        class="inline-flex items-center gap-2 bg-indigo-600 text-white px-3 py-1 rounded-full text-xs font-bold">
                        {{ getCategoryName(catId) }}
                        <button (click)="removeCategory(catId)" type="button" class="ml-1 hover:bg-indigo-700 rounded-full p-1">×</button>
                    </div>
                </div>
            </div>
        </div>
    `,
    styles: []
})
export class CategorySelectorComponent {
    private toastService = inject(ToastService);

    @Input() selectedCategories: string[] = [];
    @Input() maxSelections: number | null = null;
    @Input() label: string = 'Select Categories';
    @Output() selectionChanged = new EventEmitter<string[]>();
    @Output() selectedCategoriesChange = new EventEmitter<string[]>();

    SERVICE_CATEGORIES = SERVICE_CATEGORIES;
    readonly ChevronRight = ChevronRight;

    iconMap: { [key: string]: any } = {
        'Droplet': Droplet,
        'Zap': Zap,
        'Hammer': Hammer,
        'Paintbrush': Paintbrush,
        'Trash2': Trash2,
        'Wind': Wind,
        'Bug': Bug,
        'Leaf': Leaf,
        'Lock': Lock,
        'Wrench': Wrench
    };

    isSelected(categoryId: string): boolean {
        return this.selectedCategories.includes(categoryId);
    }

    toggleCategory(categoryId: string) {
        if (this.isSelected(categoryId)) {
            this.removeCategory(categoryId);
        } else {
            if (this.maxSelections && this.selectedCategories.length >= this.maxSelections) {
                this.toastService.warning(`Maximum ${this.maxSelections} categories can be selected`);
                return;
            }
            this.selectedCategories = [...this.selectedCategories, categoryId];
            this.selectionChanged.emit(this.selectedCategories);
            this.selectedCategoriesChange.emit(this.selectedCategories);
        }
    }

    removeCategory(categoryId: string) {
        this.selectedCategories = this.selectedCategories.filter(id => id !== categoryId);
        this.selectionChanged.emit(this.selectedCategories);
        this.selectedCategoriesChange.emit(this.selectedCategories);
    }

    getCategoryName(categoryId: string): string {
        const category = SERVICE_CATEGORIES.find(c => c.id === categoryId);
        return category ? category.name : categoryId;
    }
}
