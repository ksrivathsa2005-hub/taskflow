import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AppService } from '../../../app.service';
import { ToastService } from '../../../services/toast.service';
import { LocationApiService, City, Area } from '../../../services/location-api.service';
import { SERVICE_CATEGORIES } from '../../../service-categories';
import {
    LucideAngularModule,
    MapPin,
    Calendar,
    DollarSign,
    FileText,
    ArrowRight,
    ArrowLeft,
    CheckCircle2,
    Circle,
    Upload,
    X,
    Droplet,
    Zap,
    Hammer,
    Paintbrush,
    Trash2,
    Wind,
    Bug,
    Leaf,
    Lock,
    Wrench
} from 'lucide-angular';

@Component({
    selector: 'app-post-task',
    standalone: true,
    imports: [CommonModule, FormsModule, LucideAngularModule],
    template: `
        <div class="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 py-12 px-4">
            <div class="max-w-4xl mx-auto">
                <!-- Header -->
                <div class="mb-8">
                    <h1 class="text-4xl md:text-5xl font-black text-white mb-3 tracking-tight">Post a New Task</h1>
                    <p class="text-slate-300 text-lg font-medium">Find the perfect professional for your needs</p>
                </div>

                <!-- Stepper -->
                <div class="mb-12">
                    <div class="flex items-center justify-between mb-8">
                        <div *ngFor="let step of [1, 2, 3]; let i = index"
                            class="flex items-center flex-1"
                            [class.mb-0]="i === 2">
                            <!-- Step Circle -->
                            <div [class.bg-indigo-600]="currentStep >= step"
                                [class.bg-slate-300]="currentStep < step"
                                [class.text-white]="currentStep >= step"
                                [class.text-slate-600]="currentStep < step"
                                class="w-12 h-12 rounded-full flex items-center justify-center font-black text-lg transition-all shadow-lg">
                                <span *ngIf="currentStep > step" class="flex items-center">
                                    <lucide-icon [img]="CheckCircle2" class="w-6 h-6"></lucide-icon>
                                </span>
                                <span *ngIf="currentStep <= step">{{ step }}</span>
                            </div>

                            <!-- Step Label -->
                            <div class="ml-4">
                                <p class="font-bold text-white text-sm uppercase tracking-widest">
                                    {{ getStepTitle(step) }}
                                </p>
                                <p class="text-slate-400 text-xs font-medium">
                                    {{ getStepDescription(step) }}
                                </p>
                            </div>

                            <!-- Connector Line -->
                            <div *ngIf="i < 2" class="flex-1 h-1 bg-slate-300 mx-4"
                                [class.bg-indigo-600]="currentStep > step"></div>
                        </div>
                    </div>
                </div>

                <!-- Form Container -->
                <div class="bg-white rounded-3xl shadow-2xl overflow-hidden">
                    <!-- Step 1: Basic Details -->
                    <div *ngIf="currentStep === 1" class="p-8 md:p-12">
                        <h2 class="text-2xl font-black text-slate-900 mb-8">Task Details</h2>
                        
                        <form class="space-y-6">
                            <!-- Category Selection -->
                            <div>
                                <p class="block text-sm font-bold text-slate-700 mb-3" id="category-label">Service Category *</p>
                                <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4" role="radiogroup" aria-labelledby="category-label">
                                    <button *ngFor="let category of SERVICE_CATEGORIES"
                                        type="button"
                                        (click)="selectCategory(category.id)"
                                        role="radio"
                                        [attr.aria-checked]="formData.category === category.id"
                                        [attr.aria-label]="'Select ' + category.name"
                                        [class.ring-2]="formData.category === category.id"
                                        [class.ring-indigo-500]="formData.category === category.id"
                                        [class.bg-indigo-50]="formData.category === category.id"
                                        class="p-4 rounded-2xl border-2 border-slate-200 hover:border-indigo-300 transition-all text-center focus-visible:ring-2 focus-visible:ring-indigo-500 outline-none">
                                        <div [class]="category.color" class="w-10 h-10 rounded-lg flex items-center justify-center mb-2 mx-auto">
                                            <lucide-icon [img]="getCategoryIcon(category.id)" class="w-5 h-5"></lucide-icon>
                                        </div>
                                        <p class="font-bold text-slate-900 text-sm">{{ category.name }}</p>
                                    </button>
                                </div>
                            </div>

                            <!-- Task Title -->
                            <div>
                                <label for="task-title" class="block text-sm font-bold text-slate-700 mb-2">Task Title *</label>
                                <input id="task-title" [(ngModel)]="formData.title"
                                    name="title" 
                                    placeholder="e.g., Fix leaky bathroom tap"
                                    minlength="5"
                                    maxlength="100"
                                    #titleField="ngModel"
                                    class="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium"
                                    [class.border-red-500]="titleField.invalid && titleField.touched"
                                    required>
                                <p *ngIf="titleField.invalid && titleField.touched" class="mt-1 text-xs text-red-600">
                                    <span *ngIf="titleField.errors?.['required']">Title is required</span>
                                    <span *ngIf="titleField.errors?.['minlength']">Title must be at least 5 characters</span>
                                </p>
                            </div>

                            <!-- Description -->
                            <div>
                                <label for="task-description" class="block text-sm font-bold text-slate-700 mb-2">Description *</label>
                                <textarea id="task-description" [(ngModel)]="formData.description"
                                    name="description" 
                                    placeholder="Provide detailed information about your task..."
                                    rows="4"
                                    minlength="20"
                                    maxlength="1000"
                                    #descField="ngModel"
                                    class="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium resize-none"
                                    [class.border-red-500]="descField.invalid && descField.touched"
                                    required></textarea>
                                <div class="flex justify-between items-center mt-1">
                                    <p *ngIf="descField.invalid && descField.touched" class="text-xs text-red-600">
                                        <span *ngIf="descField.errors?.['required']">Description is required</span>
                                        <span *ngIf="descField.errors?.['minlength']">Description must be at least 20 characters</span>
                                    </p>
                                    <p class="text-xs text-slate-500 ml-auto">{{formData.description.length}}/1000</p>
                                </div>
                            </div>
                        </form>
                    </div>

                    <!-- Step 2: Location & Date -->
                    <div *ngIf="currentStep === 2" class="p-8 md:p-12">
                        <h2 class="text-2xl font-black text-slate-900 mb-8">When & Where</h2>
                        
                        <form class="space-y-6">
                            <!-- Location -->
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label for="location-state" class="block text-sm font-bold text-slate-700 mb-2">State *</label>
                                    <select id="location-state" [(ngModel)]="selectedState"
                                        name="state"
                                        (change)="onStateChange()"
                                        class="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium"
                                        required>
                                        <option value="">-- Select State --</option>
                                        <option *ngFor="let state of STATES_LIST" [value]="state.name">{{ state.name }}</option>
                                    </select>
                                </div>
                                <div>
                                    <label for="location-city" class="block text-sm font-bold text-slate-700 mb-2">City *</label>
                                    <select id="location-city" [(ngModel)]="selectedCity"
                                        name="city"
                                        (change)="onCityChange()"
                                        [disabled]="!selectedState"
                                        class="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium disabled:bg-slate-100"
                                        required>
                                        <option value="">-- Select City --</option>
                                        <option *ngFor="let city of availableCities" [value]="city.name">{{ city.name }}</option>
                                    </select>
                                </div>
                            </div>

                            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label for="location-area" class="block text-sm font-bold text-slate-700 mb-2">Area/Locality *</label>
                                    <select id="location-area" [(ngModel)]="selectedArea"
                                        name="area"
                                        [disabled]="!selectedCity"
                                        class="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium disabled:bg-slate-100"
                                        required>
                                        <option value="">-- Select Area --</option>
                                        <option *ngFor="let area of availableAreas" [value]="area.name">{{ area.name }}</option>
                                    </select>
                                </div>
                                <div>
                                    <label for="preferred-date" class="block text-sm font-bold text-slate-700 mb-2">Preferred Date *</label>
                                    <input id="preferred-date" [(ngModel)]="formData.preferredDate" name="date" type="date"
                                        [min]="getTodayDate()"
                                        class="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium"
                                        required>
                                </div>
                            </div>

                            <!-- Full Address -->
                            <div>
                                <label for="full-address" class="block text-sm font-bold text-slate-700 mb-2">Full Address</label>
                                <textarea id="full-address" [(ngModel)]="fullAddress" name="fullAddress"
                                    placeholder="Apartment/Building, Street, Landmark (optional)"
                                    rows="3"
                                    class="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium resize-none"></textarea>
                            </div>
                        </form>
                    </div>

                    <!-- Step 3: Budget & Photos -->
                    <div *ngIf="currentStep === 3" class="p-8 md:p-12">
                        <h2 class="text-2xl font-black text-slate-900 mb-8">Budget & Details</h2>
                        
                        <form class="space-y-6">
                            <!-- Budget -->
                            <div>
                                <p class="block text-sm font-bold text-slate-700 mb-4">Budget Range (₹) *</p>
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label for="budget-min" class="sr-only">Minimum budget</label>
                                        <input id="budget-min" [(ngModel)]="formData.budgetMin"
                                            name="budgetMin" 
                                            type="number" 
                                            placeholder="Minimum budget"
                                            min="100"
                                            max="100000"
                                            #budgetMinField="ngModel"
                                            class="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium"
                                            [class.border-red-500]="budgetMinField.invalid && budgetMinField.touched"
                                            required>
                                        <p *ngIf="budgetMinField.invalid && budgetMinField.touched" class="mt-1 text-xs text-red-600">
                                            Minimum budget required (₹100 - ₹100,000)
                                        </p>
                                    </div>
                                    <div>
                                        <label for="budget-max" class="sr-only">Maximum budget</label>
                                        <input id="budget-max" [(ngModel)]="formData.budgetMax"
                                            name="budgetMax" 
                                            type="number" 
                                            placeholder="Maximum budget"
                                            min="100"
                                            max="100000"
                                            #budgetMaxField="ngModel"
                                            class="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium"
                                            [class.border-red-500]="budgetMaxField.invalid && budgetMaxField.touched || formData.budgetMax < formData.budgetMin"
                                            required>
                                        <p *ngIf="(budgetMaxField.invalid && budgetMaxField.touched) || (formData.budgetMax < formData.budgetMin && budgetMaxField.touched)" class="mt-1 text-xs text-red-600">
                                            <span *ngIf="budgetMaxField.errors?.['required']">Maximum budget required</span>
                                            <span *ngIf="formData.budgetMax < formData.budgetMin && !budgetMaxField.errors?.['required']">Max must be greater than min</span>
                                        </p>
                                    </div>
                                </div>
                                <p class="text-xs text-slate-500 mt-2 font-medium">
                                    Budget range: ₹{{ formData.budgetMin | number:'1.0-0' }} - ₹{{ formData.budgetMax | number:'1.0-0' }}
                                </p>
                            </div>

                            <!-- Photos -->
                            <div>
                                <label for="file-upload" class="block text-sm font-bold text-slate-700 mb-3">Add Photos (Optional)</label>
                                <div (click)="fileInput.click()" class="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:border-indigo-400 transition-colors cursor-pointer focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-100 outline-none">
                                    <lucide-icon [img]="Upload" class="w-10 h-10 text-slate-400 mx-auto mb-3"></lucide-icon>
                                    <p class="text-sm font-bold text-slate-700">Click to browse or drag photos here</p>
                                    <p class="text-xs text-slate-500 mt-1">PNG, JPG up to 5MB each</p>
                                    <input id="file-upload" type="file" multiple accept="image/*" class="hidden" #fileInput (change)="handleFileSelect($event)">
                                </div>
                                <div *ngIf="formData.photos.length > 0" class="mt-4 grid grid-cols-3 gap-3">
                                    <div *ngFor="let photo of formData.photos" class="relative group">
                                        <img [src]="photo" alt="Task photo" class="w-full h-24 object-cover rounded-lg border border-slate-200">
                                        <button (click)="removePhoto(photo)" type="button"
                                            class="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                            <lucide-icon [img]="X" class="w-4 h-4"></lucide-icon>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <!-- Summary -->
                            <div class="bg-indigo-50 border border-indigo-200 rounded-xl p-6 mt-8">
                                <h3 class="font-black text-indigo-900 mb-4">Summary</h3>
                                <div class="space-y-2 text-sm">
                                    <div class="flex justify-between">
                                        <span class="text-indigo-700 font-semibold">Category:</span>
                                        <span class="text-indigo-900 font-bold">{{ getCategoryName(formData.category) }}</span>
                                    </div>
                                    <div class="flex justify-between">
                                        <span class="text-indigo-700 font-semibold">Location:</span>
                                        <span class="text-indigo-900 font-bold">{{ selectedArea || 'Not selected' }}, {{ selectedCity || 'Not selected' }}</span>
                                    </div>
                                    <div class="flex justify-between">
                                        <span class="text-indigo-700 font-semibold">Budget:</span>
                                        <span class="text-indigo-900 font-bold">₹{{ formData.budgetMin }} - ₹{{ formData.budgetMax }}</span>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>

                    <!-- Navigation Buttons -->
                    <div class="bg-slate-50 px-8 md:px-12 py-6 border-t border-slate-100 flex items-center justify-between">
                        <button *ngIf="currentStep > 1" (click)="previousStep()"
                            class="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-bold transition-colors">
                            <lucide-icon [img]="ArrowLeft" class="w-5 h-5"></lucide-icon>
                            Back
                        </button>
                        <div *ngIf="currentStep === 1"></div>

                        <button *ngIf="currentStep < 3" (click)="nextStep()"
                            class="flex items-center gap-2 bg-indigo-600 text-white px-8 py-3 rounded-xl hover:bg-indigo-700 font-bold transition-colors shadow-lg">
                            Next
                            <lucide-icon [img]="ArrowRight" class="w-5 h-5"></lucide-icon>
                        </button>

                        <button *ngIf="currentStep === 3" (click)="submitTask()"
                            class="bg-emerald-600 text-white px-8 py-3 rounded-xl hover:bg-emerald-700 font-bold transition-colors shadow-lg">
                            Post Task
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `,
    styles: []
})
export class PostTaskComponent implements OnInit {
    currentStep = 1;
    formData = {
        category: '',
        title: '',
        description: '',
        preferredDate: '',
        budgetMin: 500,
        budgetMax: 2000,
        photos: [] as string[]
    };

    selectedState = '';
    selectedCity = '';
    selectedArea = '';
    fullAddress = '';
    availableCities: City[] = [];
    availableAreas: Area[] = [];
    
    readonly STATES_LIST = [
        { id: 'MH', name: 'Maharashtra' },
        { id: 'DL', name: 'Delhi' },
        { id: 'KA', name: 'Karnataka' },
        { id: 'TN', name: 'Tamil Nadu' },
        { id: 'TG', name: 'Telangana' },
        { id: 'WB', name: 'West Bengal' },
        { id: 'GJ', name: 'Gujarat' }
    ];

    SERVICE_CATEGORIES = SERVICE_CATEGORIES;

    readonly ArrowRight = ArrowRight;
    readonly ArrowLeft = ArrowLeft;
    readonly CheckCircle2 = CheckCircle2;
    readonly Circle = Circle;
    readonly Upload = Upload;
    readonly X = X;

    constructor(
        private appService: AppService, 
        private router: Router,
        private locationService: LocationApiService
    ) {}

    ngOnInit() {}

    selectCategory(categoryId: string) {
        this.formData.category = categoryId;
    }

    getCategoryIcon(categoryId: string): any {
        const category = SERVICE_CATEGORIES.find((c: any) => c.id === categoryId);
        if (!category) return Circle;
        // Map icon names to actual lucide icon imports
        const iconMap: any = {
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
        return iconMap[category.icon] || Circle;
    }

    getCategoryName(categoryId: string): string {
        const category = SERVICE_CATEGORIES.find((c: any) => c.id === categoryId);
        return category ? category.name : 'Not selected';
    }

    getStepTitle(step: number): string {
        const titles = ['Task Details', 'When & Where', 'Budget & Photos'];
        return titles[step - 1] || '';
    }

    getStepDescription(step: number): string {
        const descriptions = ['Tell us what you need', 'Choose date & location', 'Set budget & add photos'];
        return descriptions[step - 1] || '';
    }

    nextStep() {
        if (this.validateStep(this.currentStep)) {
            this.currentStep++;
        }
    }

    previousStep() {
        this.currentStep--;
    }

    validateStep(step: number): boolean {
        switch (step) {
            case 1:
                return !!this.formData.category && !!this.formData.title && !!this.formData.description;
            case 2:
                return !!this.selectedState && !!this.selectedCity && 
                       !!this.selectedArea && !!this.formData.preferredDate;
            case 3:
                return this.formData.budgetMin > 0 && this.formData.budgetMax >= this.formData.budgetMin;
            default:
                return true;
        }
    }

    onStateChange() {
        this.selectedCity = '';
        this.selectedArea = '';
        this.availableAreas = [];
        
        if (this.selectedState) {
            this.locationService.getPopularCities().subscribe(response => {
                this.availableCities = response.data.filter(city => {
                    const selectedStateObj = this.STATES_LIST.find(s => s.name === this.selectedState);
                    return city.state === this.selectedState || 
                           (selectedStateObj && city.state === selectedStateObj.name);
                });
            });
        } else {
            this.availableCities = [];
        }
    }

    onCityChange() {
        this.selectedArea = '';
        if (this.selectedCity) {
            const selectedCityObj = this.availableCities.find(c => c.name === this.selectedCity);
            if (selectedCityObj) {
                this.locationService.getAreas(selectedCityObj.id).subscribe(response => {
                    this.availableAreas = response.data;
                });
            }
        } else {
            this.availableAreas = [];
        }
    }

    getTodayDate(): string {
        return new Date().toISOString().split('T')[0];
    }

    removePhoto(photo: string) {
        this.formData.photos = this.formData.photos.filter(p => p !== photo);
    }

    handleFileSelect(event: any) {
        const files = event.target.files;
        if (files) {
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                const reader = new FileReader();
                reader.onload = (e: any) => {
                    this.formData.photos.push(e.target.result);
                };
                reader.readAsDataURL(file);
            }
        }
    }

    private toastService = inject(ToastService);

    submitTask() {
        if (!this.validateStep(3)) {
            this.toastService.error('Please complete all required fields');
            return;
        }

        // Find the selected area object to get pincode and coordinates
        const selectedAreaObj = this.availableAreas.find(a => a.name === this.selectedArea);
        
        // Construct full address with all components
        const addressParts = [];
        if (this.fullAddress) addressParts.push(this.fullAddress);
        if (this.selectedArea) addressParts.push(this.selectedArea);
        if (this.selectedCity) addressParts.push(this.selectedCity);
        if (this.selectedState) addressParts.push(this.selectedState);
        if (selectedAreaObj?.pincode) addressParts.push(selectedAreaObj.pincode);

        const taskData = {
            title: this.formData.title,
            description: this.formData.description,
            category: this.formData.category,
            budgetMin: this.formData.budgetMin,
            budgetMax: this.formData.budgetMax,
            preferredDate: this.formData.preferredDate ? new Date(this.formData.preferredDate).toISOString() : new Date().toISOString(),
            location: {
                state: this.selectedState,
                city: this.selectedCity,
                area: this.selectedArea,
                fullAddress: addressParts.join(', '),
                pincode: selectedAreaObj?.pincode
            },
            customerId: this.appService.currentUser?.id || 'u1',
            photos: this.formData.photos
        };

        this.appService.postTask(taskData);
        this.toastService.success('Task posted successfully!');
        this.router.navigate(['/customer']);
    }
}
