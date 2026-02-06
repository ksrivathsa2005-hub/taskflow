import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AppService } from '../../app.service';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { ToastService } from '../../services/toast.service';
import { TaskFlowApiService } from '../../services/taskflow-api.service';
import { LocationApiService, City, Area } from '../../services/location-api.service';
import { ApiUserAddress, UpdateUserRequest, CreateAddressRequest } from '../../services/api-types';
import { SERVICE_CATEGORIES, getCategoryName, getCategoryColor } from '../../service-categories';
import {
    LucideAngularModule,
    User as UserIcon,
    Mail,
    Phone,
    MapPin,
    Camera,
    Save,
    X,
    Plus,
    Trash2,
    Star,
    Briefcase,
    ArrowLeft,
    Edit2,
    Check,
    Award,
    Clock,
    Wrench,
    Tag,
    ToggleLeft,
    ToggleRight
} from 'lucide-angular';

@Component({
    selector: 'app-worker-profile',
    standalone: true,
    imports: [CommonModule, FormsModule, LucideAngularModule, NavbarComponent],
    template: `
        <div class="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 py-8 px-4">
            <div class="max-w-4xl mx-auto">
                <!-- Back Button -->
                <button (click)="goBack()" 
                    class="flex items-center gap-2 text-slate-600 hover:text-indigo-600 mb-6 transition-colors">
                    <lucide-icon [img]="ArrowLeft" class="w-5 h-5"></lucide-icon>
                    <span class="font-medium">Back to Dashboard</span>
                </button>

                <!-- Profile Header Card -->
                <div class="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden mb-6">
                    <div class="bg-gradient-to-r from-green-600 to-emerald-600 h-32"></div>
                    <div class="px-8 pb-8 -mt-16">
                        <div class="flex flex-col sm:flex-row sm:items-end gap-6">
                            <!-- Avatar -->
                            <div class="relative">
                                <img [src]="profileData.avatar || 'https://ui-avatars.com/api/?name=' + profileData.name" 
                                    class="w-32 h-32 rounded-2xl border-4 border-white shadow-lg object-cover bg-white"
                                    alt="Profile" />
                                <button (click)="toggleAvatarEdit()" 
                                    class="absolute bottom-2 right-2 p-2 bg-white rounded-full shadow-lg hover:bg-green-50 transition-colors">
                                    <lucide-icon [img]="Camera" class="w-4 h-4 text-green-600"></lucide-icon>
                                </button>
                            </div>

                            <!-- Basic Info -->
                            <div class="flex-1 pt-4">
                                <div class="flex items-center gap-3 mb-2">
                                    <h1 class="text-2xl font-bold text-slate-900">{{profileData.name}}</h1>
                                    <span class="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full uppercase">
                                        Worker
                                    </span>
                                    <!-- Busy Status Toggle -->
                                    <button (click)="toggleBusyStatus()" 
                                        [class]="profileData.isBusy ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'"
                                        class="flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-full transition-all">
                                        <lucide-icon [img]="profileData.isBusy ? ToggleRight : ToggleLeft" class="w-4 h-4"></lucide-icon>
                                        {{profileData.isBusy ? 'Busy' : 'Available'}}
                                    </button>
                                </div>
                                <p class="text-slate-500 flex items-center gap-2">
                                    <lucide-icon [img]="Mail" class="w-4 h-4"></lucide-icon>
                                    {{profileData.email}}
                                </p>
                                <div class="flex items-center gap-6 mt-3 text-sm">
                                    <div class="flex items-center gap-1 text-amber-500">
                                        <lucide-icon [img]="Star" class="w-4 h-4 fill-current"></lucide-icon>
                                        <span class="font-bold">{{profileData.rating || 0}}</span>
                                    </div>
                                    <div class="flex items-center gap-1 text-slate-600">
                                        <lucide-icon [img]="Briefcase" class="w-4 h-4"></lucide-icon>
                                        <span>{{profileData.completedJobs || 0}} jobs completed</span>
                                    </div>
                                    <div class="flex items-center gap-1 text-slate-600">
                                        <lucide-icon [img]="Clock" class="w-4 h-4"></lucide-icon>
                                        <span>{{profileData.experience || 0}} years exp</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Avatar URL Edit Modal -->
                <div *ngIf="showAvatarEdit" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div class="bg-white rounded-2xl p-6 w-full max-w-md">
                        <h3 class="text-lg font-bold text-slate-900 mb-4">Update Profile Picture</h3>
                        <input type="url" [(ngModel)]="newAvatarUrl" 
                            placeholder="Enter image URL..."
                            class="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 mb-4" />
                        <div class="flex justify-end gap-3">
                            <button (click)="showAvatarEdit = false" 
                                class="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                                Cancel
                            </button>
                            <button (click)="updateAvatar()" 
                                class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                                Update
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Profile Details Form -->
                <div class="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 p-8 mb-6">
                    <h2 class="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                        <lucide-icon [img]="UserIcon" class="w-5 h-5 text-green-600"></lucide-icon>
                        Personal Information
                    </h2>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <!-- Name -->
                        <div>
                            <label class="block text-sm font-medium text-slate-700 mb-2">Full Name</label>
                            <input type="text" [(ngModel)]="profileData.name" 
                                class="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500" />
                        </div>

                        <!-- Phone -->
                        <div>
                            <label class="block text-sm font-medium text-slate-700 mb-2">Phone Number</label>
                            <input type="tel" [(ngModel)]="profileData.phone" 
                                placeholder="+91 XXXXX XXXXX"
                                class="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500" />
                        </div>

                        <!-- Experience -->
                        <div>
                            <label class="block text-sm font-medium text-slate-700 mb-2">Years of Experience</label>
                            <input type="number" [(ngModel)]="profileData.experience" min="0" max="50"
                                class="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500" />
                        </div>
                    </div>
                </div>

                <!-- Categories Section -->
                <div class="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 p-8 mb-6">
                    <h2 class="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                        <lucide-icon [img]="Tag" class="w-5 h-5 text-green-600"></lucide-icon>
                        Service Categories
                    </h2>
                    <p class="text-sm text-slate-500 mb-4">Select the categories of services you provide</p>

                    <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                        <button *ngFor="let category of allCategories"
                            (click)="toggleCategory(category.id)"
                            [class]="isSelectedCategory(category.id) 
                                ? 'border-green-500 bg-green-50 ring-2 ring-green-200' 
                                : 'border-slate-200 hover:border-green-300 hover:bg-green-50/50'"
                            class="p-4 border-2 rounded-xl text-center transition-all cursor-pointer">
                            <div [class]="category.color" class="w-10 h-10 rounded-xl mx-auto mb-2 flex items-center justify-center">
                                <lucide-icon [img]="Wrench" class="w-5 h-5"></lucide-icon>
                            </div>
                            <p class="font-medium text-slate-900 text-sm">{{category.name}}</p>
                            <div *ngIf="isSelectedCategory(category.id)" class="mt-2">
                                <lucide-icon [img]="Check" class="w-5 h-5 text-green-600 mx-auto"></lucide-icon>
                            </div>
                        </button>
                    </div>
                </div>

                <!-- Skills Section -->
                <div class="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 p-8 mb-6">
                    <h2 class="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                        <lucide-icon [img]="Award" class="w-5 h-5 text-green-600"></lucide-icon>
                        Skills & Expertise
                    </h2>

                    <!-- Current Skills -->
                    <div class="flex flex-wrap gap-2 mb-4">
                        <span *ngFor="let skill of profileData.skills; let i = index"
                            class="flex items-center gap-2 px-3 py-1.5 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                            {{skill}}
                            <button (click)="removeSkill(i)" class="hover:text-green-900">
                                <lucide-icon [img]="X" class="w-3 h-3"></lucide-icon>
                            </button>
                        </span>
                        <span *ngIf="profileData.skills?.length === 0" class="text-slate-400 text-sm">
                            No skills added yet
                        </span>
                    </div>

                    <!-- Add New Skill -->
                    <div class="flex gap-2">
                        <input type="text" [(ngModel)]="newSkill" 
                            (keyup.enter)="addSkill()"
                            placeholder="Add a skill (e.g., Pipe Fitting, Wiring)"
                            class="flex-1 px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500" />
                        <button (click)="addSkill()" 
                            class="px-4 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors">
                            <lucide-icon [img]="Plus" class="w-5 h-5"></lucide-icon>
                        </button>
                    </div>

                    <!-- Skill Suggestions -->
                    <div *ngIf="suggestedSkills.length > 0" class="mt-4">
                        <p class="text-sm text-slate-500 mb-2">Suggested skills:</p>
                        <div class="flex flex-wrap gap-2">
                            <button *ngFor="let skill of suggestedSkills"
                                (click)="addSuggestedSkill(skill)"
                                class="px-3 py-1.5 border border-slate-200 text-slate-600 rounded-full text-sm hover:border-green-400 hover:bg-green-50 transition-all">
                                + {{skill}}
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Save Profile Button -->
                <div class="flex justify-end mb-6">
                    <button (click)="saveProfile()" [disabled]="isSaving"
                        class="flex items-center gap-2 px-8 py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-colors shadow-lg shadow-green-200 disabled:opacity-50">
                        <lucide-icon [img]="Save" class="w-5 h-5"></lucide-icon>
                        {{isSaving ? 'Saving...' : 'Save Profile'}}
                    </button>
                </div>

                <!-- Addresses Section -->
                <div class="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 p-8">
                    <div class="flex items-center justify-between mb-6">
                        <h2 class="text-lg font-bold text-slate-900 flex items-center gap-2">
                            <lucide-icon [img]="MapPin" class="w-5 h-5 text-green-600"></lucide-icon>
                            Service Locations
                        </h2>
                        <button (click)="showAddAddress = true" 
                            class="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 font-semibold rounded-xl hover:bg-green-200 transition-colors">
                            <lucide-icon [img]="Plus" class="w-4 h-4"></lucide-icon>
                            Add Location
                        </button>
                    </div>
                    <p class="text-sm text-slate-500 mb-4">Specify the areas where you provide services</p>

                    <!-- Address List -->
                    <div class="space-y-4">
                        <div *ngFor="let address of addresses; let i = index" 
                            class="p-4 border border-slate-200 rounded-xl hover:border-green-200 transition-colors"
                            [class.border-green-400]="address.isDefault"
                            [class.bg-green-50/50]="address.isDefault">
                            <div class="flex items-start justify-between">
                                <div class="flex-1">
                                    <div class="flex items-center gap-2 mb-1">
                                        <p class="font-semibold text-slate-900">{{address.area || address.city}}</p>
                                        <span *ngIf="address.isDefault" class="px-2 py-0.5 bg-green-600 text-white text-xs font-bold rounded-full">
                                            Primary
                                        </span>
                                    </div>
                                    <p class="text-sm text-slate-600">{{address.fullAddress}}</p>
                                    <p class="text-sm text-slate-500 mt-1">{{address.city}}, {{address.state}}</p>
                                </div>
                                <div class="flex items-center gap-2">
                                    <button *ngIf="!address.isDefault" (click)="setAsDefault(address)"
                                        class="p-2 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                        title="Set as primary">
                                        <lucide-icon [img]="Check" class="w-4 h-4"></lucide-icon>
                                    </button>
                                    <button (click)="deleteAddress(address)"
                                        class="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        title="Delete">
                                        <lucide-icon [img]="Trash2" class="w-4 h-4"></lucide-icon>
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div *ngIf="addresses.length === 0" class="text-center py-8 text-slate-500">
                            <lucide-icon [img]="MapPin" class="w-12 h-12 mx-auto mb-3 opacity-30"></lucide-icon>
                            <p>No service locations added yet</p>
                            <p class="text-sm">Add locations where you're available to work</p>
                        </div>
                    </div>
                </div>

                <!-- Add Address Modal -->
                <div *ngIf="showAddAddress" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div class="bg-white rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        <div class="flex items-center justify-between mb-6">
                            <h3 class="text-lg font-bold text-slate-900">Add Service Location</h3>
                            <button (click)="closeAddressModal()" class="p-2 hover:bg-slate-100 rounded-lg">
                                <lucide-icon [img]="X" class="w-5 h-5 text-slate-400"></lucide-icon>
                            </button>
                        </div>

                        <div class="space-y-4">
                            <!-- State -->
                            <div>
                                <label class="block text-sm font-medium text-slate-700 mb-2">State</label>
                                <select [(ngModel)]="newAddress.state" (change)="onStateChange()"
                                    class="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500">
                                    <option value="">Select State</option>
                                    <option *ngFor="let state of states" [value]="state">{{state}}</option>
                                </select>
                            </div>

                            <!-- City -->
                            <div>
                                <label class="block text-sm font-medium text-slate-700 mb-2">City</label>
                                <select [(ngModel)]="newAddress.city" (change)="onCityChange()"
                                    class="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500">
                                    <option value="">Select City</option>
                                    <option *ngFor="let city of availableCities" [value]="city.name">{{city.name}}</option>
                                </select>
                            </div>

                            <!-- Area -->
                            <div>
                                <label class="block text-sm font-medium text-slate-700 mb-2">Area</label>
                                <select [(ngModel)]="newAddress.area"
                                    class="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500">
                                    <option value="">Select Area</option>
                                    <option *ngFor="let area of availableAreas" [value]="area.name">{{area.name}}</option>
                                </select>
                            </div>

                            <!-- Full Address -->
                            <div>
                                <label class="block text-sm font-medium text-slate-700 mb-2">Full Address / Service Area Description</label>
                                <textarea [(ngModel)]="newAddress.fullAddress" rows="3"
                                    placeholder="Describe your service area or enter a specific address..."
                                    class="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"></textarea>
                            </div>

                            <!-- Set as Primary -->
                            <label class="flex items-center gap-3 cursor-pointer">
                                <input type="checkbox" [(ngModel)]="newAddress.isDefault" 
                                    class="w-5 h-5 rounded border-slate-300 text-green-600 focus:ring-green-500" />
                                <span class="text-sm text-slate-700">Set as primary service location</span>
                            </label>
                        </div>

                        <div class="flex justify-end gap-3 mt-6">
                            <button (click)="closeAddressModal()" 
                                class="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                                Cancel
                            </button>
                            <button (click)="addAddress()" [disabled]="!isAddressValid()"
                                class="px-6 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50">
                                Add Location
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `
})
export class WorkerProfileComponent implements OnInit {
    // Icons
    readonly UserIcon = UserIcon;
    readonly Mail = Mail;
    readonly Phone = Phone;
    readonly MapPin = MapPin;
    readonly Camera = Camera;
    readonly Save = Save;
    readonly X = X;
    readonly Plus = Plus;
    readonly Trash2 = Trash2;
    readonly Star = Star;
    readonly Briefcase = Briefcase;
    readonly ArrowLeft = ArrowLeft;
    readonly Edit2 = Edit2;
    readonly Check = Check;
    readonly Award = Award;
    readonly Clock = Clock;
    readonly Wrench = Wrench;
    readonly Tag = Tag;
    readonly ToggleLeft = ToggleLeft;
    readonly ToggleRight = ToggleRight;

    private toastService = inject(ToastService);
    private apiService = inject(TaskFlowApiService);
    private locationService = inject(LocationApiService);

    profileData: any = {
        name: '',
        email: '',
        phone: '',
        avatar: '',
        rating: 0,
        completedJobs: 0,
        experience: 0,
        skills: [],
        categories: [],
        isBusy: false
    };

    allCategories = SERVICE_CATEGORIES;
    addresses: ApiUserAddress[] = [];
    showAddAddress = false;
    showAvatarEdit = false;
    newAvatarUrl = '';
    isSaving = false;
    newSkill = '';

    newAddress: CreateAddressRequest = {
        state: '',
        city: '',
        area: '',
        fullAddress: '',
        isDefault: false
    };

    states = ['Maharashtra', 'Delhi', 'Karnataka', 'Tamil Nadu', 'Telangana', 'West Bengal', 'Gujarat'];
    availableCities: City[] = [];
    availableAreas: Area[] = [];

    // Skill suggestions based on categories
    skillSuggestions: { [key: string]: string[] } = {
        'plumber': ['Pipe Fitting', 'Leak Repair', 'Water Heater Installation', 'Drainage Cleaning', 'Bathroom Fitting'],
        'electrician': ['Wiring', 'Circuit Repair', 'Fan Installation', 'Switchboard Repair', 'MCB Replacement'],
        'carpenter': ['Furniture Making', 'Wood Polishing', 'Door Fitting', 'Cabinet Installation', 'Modular Kitchen'],
        'painter': ['Interior Painting', 'Exterior Painting', 'Texture Painting', 'Wood Painting', 'Waterproofing'],
        'cleaner': ['Deep Cleaning', 'Bathroom Cleaning', 'Kitchen Cleaning', 'Sofa Cleaning', 'Carpet Shampooing'],
        'ac-repair': ['AC Installation', 'AC Servicing', 'Gas Refilling', 'Compressor Repair', 'Duct Cleaning'],
        'pest-control': ['Cockroach Control', 'Termite Treatment', 'Mosquito Control', 'Bed Bug Treatment', 'Rodent Control'],
        'gardener': ['Lawn Maintenance', 'Plant Care', 'Tree Trimming', 'Garden Design', 'Irrigation Setup'],
        'locksmith': ['Lock Installation', 'Key Duplication', 'Safe Opening', 'Door Lock Repair', 'Smart Lock Setup'],
        'appliance-repair': ['Washing Machine Repair', 'Refrigerator Repair', 'Microwave Repair', 'TV Repair', 'Geyser Repair']
    };

    get suggestedSkills(): string[] {
        const suggestions: string[] = [];
        const currentSkills = this.profileData.skills || [];
        
        (this.profileData.categories || []).forEach((cat: string) => {
            const catSkills = this.skillSuggestions[cat] || [];
            catSkills.forEach(skill => {
                if (!currentSkills.includes(skill) && !suggestions.includes(skill)) {
                    suggestions.push(skill);
                }
            });
        });

        return suggestions.slice(0, 8); // Limit to 8 suggestions
    }

    constructor(
        public appService: AppService,
        private router: Router
    ) {}

    ngOnInit() {
        this.loadProfile();
        this.loadCities();
    }

    loadProfile() {
        const user = this.appService.currentUser;
        if (user) {
            this.profileData = {
                name: user.name,
                email: user.email,
                phone: user.phone || '',
                avatar: user.avatar || '',
                rating: user.rating || 0,
                completedJobs: user.completedJobs || 0,
                experience: user.experience || 0,
                skills: [...(user.skills || [])],
                categories: [...(user.categories || [])],
                isBusy: user.isBusy || false
            };

            // Load full user data from API
            this.apiService.getUserById(user.id).subscribe({
                next: (apiUser) => {
                    // Update other fields if available
                    if (apiUser.experience !== undefined) {
                        this.profileData.experience = apiUser.experience;
                    }
                    if (apiUser.skills) {
                        this.profileData.skills = [...apiUser.skills];
                    }
                    if (apiUser.categories) {
                        this.profileData.categories = [...apiUser.categories];
                    }
                },
                error: (err) => {
                    console.error('Error loading user:', err);
                }
            });

            // Load addresses using dedicated address API
            this.loadAddresses();
        }
    }

    loadAddresses() {
        const user = this.appService.currentUser;
        if (!user) return;

        this.apiService.getUserAddresses(user.id).subscribe({
            next: (response) => {
                this.addresses = response.data || [];
                
                // Update AppService user address based on primary address
                const primaryAddress = this.addresses.find(a => a.isDefault) || this.addresses[0];
                if (primaryAddress) {
                    const updatedAddress = {
                        state: primaryAddress.state,
                        city: primaryAddress.city,
                        area: primaryAddress.area || '',
                        fullAddress: primaryAddress.fullAddress
                    };
                    
                    // Only update if changed
                    if (user.address?.city !== updatedAddress.city || 
                        user.address?.area !== updatedAddress.area) {
                        this.appService.setCurrentUser({
                            ...user,
                            address: updatedAddress
                        });
                    }
                }
            },
            error: (err) => {
                console.error('Error loading addresses:', err);
                // If endpoint doesn't exist yet, try loading from user object
                this.apiService.getUserById(user.id).subscribe({
                    next: (apiUser) => {
                        this.addresses = apiUser.addresses || [];
                    },
                    error: () => {
                        this.addresses = [];
                    }
                });
            }
        });
    }

    loadCities() {
        this.locationService.getPopularCities().subscribe(response => {
            this.availableCities = response.data;
        });
    }

    onStateChange() {
        const stateMapping: { [key: string]: string[] } = {
            'Maharashtra': ['MUM', 'PUN'],
            'Delhi': ['DEL'],
            'Karnataka': ['BLR'],
            'Tamil Nadu': ['CHN'],
            'Telangana': ['HYD'],
            'West Bengal': ['KOL'],
            'Gujarat': ['AMD']
        };

        this.locationService.getPopularCities().subscribe(response => {
            const stateIds = stateMapping[this.newAddress.state] || [];
            this.availableCities = response.data.filter(city => stateIds.includes(city.id));
        });
        this.newAddress.city = '';
        this.newAddress.area = '';
        this.availableAreas = [];
    }

    onCityChange() {
        const selectedCity = this.availableCities.find(c => c.name === this.newAddress.city);
        if (selectedCity) {
            this.locationService.getAreas(selectedCity.id).subscribe(response => {
                this.availableAreas = response.data;
            });
        }
        this.newAddress.area = '';
    }

    toggleAvatarEdit() {
        this.newAvatarUrl = this.profileData.avatar;
        this.showAvatarEdit = true;
    }

    updateAvatar() {
        this.profileData.avatar = this.newAvatarUrl;
        this.showAvatarEdit = false;
        this.saveProfile();
    }

    toggleBusyStatus() {
        const user = this.appService.currentUser;
        if (!user) return;

        const newStatus = !this.profileData.isBusy;
        
        this.apiService.updateBusyStatus(user.id, { isBusy: newStatus }).subscribe({
            next: () => {
                this.profileData.isBusy = newStatus;
                this.appService.setCurrentUser({
                    ...user,
                    isBusy: newStatus
                });
                this.toastService.success(newStatus ? 'Status set to busy' : 'Status set to available');
            },
            error: (err) => {
                console.error('Error updating busy status:', err);
                this.toastService.error('Failed to update status');
            }
        });
    }

    isSelectedCategory(categoryId: string): boolean {
        return (this.profileData.categories || []).includes(categoryId);
    }

    toggleCategory(categoryId: string) {
        if (!this.profileData.categories) {
            this.profileData.categories = [];
        }

        const index = this.profileData.categories.indexOf(categoryId);
        if (index > -1) {
            this.profileData.categories.splice(index, 1);
        } else {
            this.profileData.categories.push(categoryId);
        }
    }

    addSkill() {
        const skill = this.newSkill.trim();
        if (skill && !this.profileData.skills.includes(skill)) {
            this.profileData.skills.push(skill);
            this.newSkill = '';
        }
    }

    addSuggestedSkill(skill: string) {
        if (!this.profileData.skills.includes(skill)) {
            this.profileData.skills.push(skill);
        }
    }

    removeSkill(index: number) {
        this.profileData.skills.splice(index, 1);
    }

    async saveProfile() {
        const user = this.appService.currentUser;
        if (!user) return;

        this.isSaving = true;

        const updateData: UpdateUserRequest = {
            name: this.profileData.name,
            phone: this.profileData.phone,
            avatar: this.profileData.avatar,
            experience: this.profileData.experience,
            skills: this.profileData.skills,
            categories: this.profileData.categories
        };

        this.apiService.updateUser(user.id, updateData).subscribe({
            next: (updatedUser) => {
                // Update local user
                this.appService.setCurrentUser({
                    ...user,
                    name: updatedUser.name,
                    phone: updatedUser.phone || user.phone,
                    avatar: updatedUser.avatar || user.avatar,
                    experience: updatedUser.experience || user.experience,
                    skills: updatedUser.skills || user.skills,
                    categories: updatedUser.categories || user.categories
                });
                this.toastService.success('Profile updated successfully');
                this.isSaving = false;
            },
            error: (err) => {
                console.error('Error updating profile:', err);
                this.toastService.error('Failed to update profile');
                this.isSaving = false;
            }
        });
    }

    isAddressValid(): boolean {
        return !!(this.newAddress.state && this.newAddress.city && this.newAddress.fullAddress);
    }

    addAddress() {
        const user = this.appService.currentUser;
        if (!user || !this.isAddressValid()) return;

        this.apiService.addUserAddress(user.id, this.newAddress).subscribe({
            next: () => {
                this.loadAddresses(); // Reload addresses from API
                this.toastService.success('Location added successfully');
                this.closeAddressModal();
            },
            error: (err) => {
                console.error('Error adding address:', err);
                this.toastService.error('Failed to add location');
            }
        });
    }

    setAsDefault(address: ApiUserAddress) {
        const user = this.appService.currentUser;
        if (!user || !address.id) return;

        this.apiService.setDefaultAddress(user.id, address.id).subscribe({
            next: () => {
                this.loadAddresses(); // Reload addresses from API
                this.toastService.success('Primary location updated');
            },
            error: (err) => {
                console.error('Error setting default:', err);
                this.toastService.error('Failed to update primary location');
            }
        });
    }

    deleteAddress(address: ApiUserAddress) {
        const user = this.appService.currentUser;
        if (!user || !address.id) return;

        if (confirm('Are you sure you want to remove this service location?')) {
            this.apiService.deleteUserAddress(user.id, address.id).subscribe({
                next: () => {
                    this.loadAddresses(); // Reload addresses from API
                    this.toastService.success('Location removed');
                },
                error: (err) => {
                    console.error('Error deleting address:', err);
                    this.toastService.error('Failed to remove location');
                }
            });
        }
    }

    closeAddressModal() {
        this.showAddAddress = false;
        this.newAddress = {
            state: '',
            city: '',
            area: '',
            fullAddress: '',
            isDefault: false
        };
    }

    goBack() {
        this.router.navigate(['/worker']);
    }
}
