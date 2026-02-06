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
import { User } from '../../types';
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
    Check
} from 'lucide-angular';

@Component({
    selector: 'app-customer-profile',
    standalone: true,
    imports: [CommonModule, FormsModule, LucideAngularModule, NavbarComponent],
    template: `
        <app-navbar></app-navbar>
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
                    <div class="bg-gradient-to-r from-indigo-600 to-purple-600 h-32"></div>
                    <div class="px-8 pb-8 -mt-16">
                        <div class="flex flex-col sm:flex-row sm:items-end gap-6">
                            <!-- Avatar -->
                            <div class="relative">
                                <img [src]="profileData.avatar || 'https://ui-avatars.com/api/?name=' + profileData.name" 
                                    class="w-32 h-32 rounded-2xl border-4 border-white shadow-lg object-cover bg-white"
                                    alt="Profile" />
                                <button (click)="toggleAvatarEdit()" 
                                    class="absolute bottom-2 right-2 p-2 bg-white rounded-full shadow-lg hover:bg-indigo-50 transition-colors">
                                    <lucide-icon [img]="Camera" class="w-4 h-4 text-indigo-600"></lucide-icon>
                                </button>
                            </div>

                            <!-- Basic Info -->
                            <div class="flex-1 pt-4">
                                <div class="flex items-center gap-3 mb-2">
                                    <h1 class="text-2xl font-bold text-slate-900">{{profileData.name}}</h1>
                                    <span class="px-3 py-1 bg-indigo-100 text-indigo-700 text-xs font-bold rounded-full uppercase">
                                        Customer
                                    </span>
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
                                        <span>{{profileData.completedJobs || 0}} tasks completed</span>
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
                            class="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-4" />
                        <div class="flex justify-end gap-3">
                            <button (click)="showAvatarEdit = false" 
                                class="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                                Cancel
                            </button>
                            <button (click)="updateAvatar()" 
                                class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                                Update
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Profile Details Form -->
                <div class="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 p-8 mb-6">
                    <h2 class="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                        <lucide-icon [img]="UserIcon" class="w-5 h-5 text-indigo-600"></lucide-icon>
                        Personal Information
                    </h2>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <!-- Name -->
                        <div>
                            <label class="block text-sm font-medium text-slate-700 mb-2">Full Name</label>
                            <input type="text" [(ngModel)]="profileData.name" 
                                class="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                        </div>

                        <!-- Phone -->
                        <div>
                            <label class="block text-sm font-medium text-slate-700 mb-2">Phone Number</label>
                            <input type="tel" [(ngModel)]="profileData.phone" 
                                placeholder="+91 XXXXX XXXXX"
                                class="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                        </div>
                    </div>

                    <div class="flex justify-end mt-6">
                        <button (click)="saveProfile()" [disabled]="isSaving"
                            class="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50">
                            <lucide-icon [img]="Save" class="w-5 h-5"></lucide-icon>
                            {{isSaving ? 'Saving...' : 'Save Changes'}}
                        </button>
                    </div>
                </div>

                <!-- Addresses Section -->
                <div class="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 p-8">
                    <div class="flex items-center justify-between mb-6">
                        <h2 class="text-lg font-bold text-slate-900 flex items-center gap-2">
                            <lucide-icon [img]="MapPin" class="w-5 h-5 text-indigo-600"></lucide-icon>
                            My Addresses
                        </h2>
                        <button (click)="showAddAddress = true" 
                            class="flex items-center gap-2 px-4 py-2 bg-indigo-100 text-indigo-700 font-semibold rounded-xl hover:bg-indigo-200 transition-colors">
                            <lucide-icon [img]="Plus" class="w-4 h-4"></lucide-icon>
                            Add Address
                        </button>
                    </div>

                    <!-- Address List -->
                    <div class="space-y-4">
                        <div *ngFor="let address of addresses; let i = index" 
                            class="p-4 border border-slate-200 rounded-xl hover:border-indigo-200 transition-colors"
                            [class.border-indigo-400]="address.isDefault"
                            [class.bg-indigo-50/50]="address.isDefault">
                            <div class="flex items-start justify-between">
                                <div class="flex-1">
                                    <div class="flex items-center gap-2 mb-1">
                                        <p class="font-semibold text-slate-900">{{address.area || address.city}}</p>
                                        <span *ngIf="address.isDefault" class="px-2 py-0.5 bg-indigo-600 text-white text-xs font-bold rounded-full">
                                            Default
                                        </span>
                                    </div>
                                    <p class="text-sm text-slate-600">{{address.fullAddress}}</p>
                                    <p class="text-sm text-slate-500 mt-1">{{address.city}}, {{address.state}}</p>
                                </div>
                                <div class="flex items-center gap-2">
                                    <button *ngIf="!address.isDefault" (click)="setAsDefault(address)"
                                        class="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                        title="Set as default">
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
                            <p>No addresses added yet</p>
                        </div>
                    </div>
                </div>

                <!-- Add Address Modal -->
                <div *ngIf="showAddAddress" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div class="bg-white rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        <div class="flex items-center justify-between mb-6">
                            <h3 class="text-lg font-bold text-slate-900">Add New Address</h3>
                            <button (click)="closeAddressModal()" class="p-2 hover:bg-slate-100 rounded-lg">
                                <lucide-icon [img]="X" class="w-5 h-5 text-slate-400"></lucide-icon>
                            </button>
                        </div>

                        <div class="space-y-4">
                            <!-- State -->
                            <div>
                                <label class="block text-sm font-medium text-slate-700 mb-2">State</label>
                                <select [(ngModel)]="newAddress.state" (change)="onStateChange()"
                                    class="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500">
                                    <option value="">Select State</option>
                                    <option *ngFor="let state of states" [value]="state">{{state}}</option>
                                </select>
                            </div>

                            <!-- City -->
                            <div>
                                <label class="block text-sm font-medium text-slate-700 mb-2">City</label>
                                <select [(ngModel)]="newAddress.city" (change)="onCityChange()"
                                    class="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500">
                                    <option value="">Select City</option>
                                    <option *ngFor="let city of availableCities" [value]="city.name">{{city.name}}</option>
                                </select>
                            </div>

                            <!-- Area -->
                            <div>
                                <label class="block text-sm font-medium text-slate-700 mb-2">Area</label>
                                <select [(ngModel)]="newAddress.area"
                                    class="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500">
                                    <option value="">Select Area</option>
                                    <option *ngFor="let area of availableAreas" [value]="area.name">{{area.name}}</option>
                                </select>
                            </div>

                            <!-- Full Address -->
                            <div>
                                <label class="block text-sm font-medium text-slate-700 mb-2">Full Address</label>
                                <textarea [(ngModel)]="newAddress.fullAddress" rows="3"
                                    placeholder="Enter complete address with landmarks..."
                                    class="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"></textarea>
                            </div>

                            <!-- Set as Default -->
                            <label class="flex items-center gap-3 cursor-pointer">
                                <input type="checkbox" [(ngModel)]="newAddress.isDefault" 
                                    class="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
                                <span class="text-sm text-slate-700">Set as default address</span>
                            </label>
                        </div>

                        <div class="flex justify-end gap-3 mt-6">
                            <button (click)="closeAddressModal()" 
                                class="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                                Cancel
                            </button>
                            <button (click)="addAddress()" [disabled]="!isAddressValid()"
                                class="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50">
                                Add Address
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `
})
export class CustomerProfileComponent implements OnInit {
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

    private toastService = inject(ToastService);
    private apiService = inject(TaskFlowApiService);
    private locationService = inject(LocationApiService);

    profileData: any = {
        name: '',
        email: '',
        phone: '',
        avatar: '',
        rating: 0,
        completedJobs: 0
    };

    addresses: ApiUserAddress[] = [];
    showAddAddress = false;
    showAvatarEdit = false;
    newAvatarUrl = '';
    isSaving = false;

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
                completedJobs: user.completedJobs || 0
            };

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
            },
            error: (err) => {
                console.error('Error loading addresses:', err);
                // Fallback: try loading from user object
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
        // Filter cities by state
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

    async saveProfile() {
        const user = this.appService.currentUser;
        if (!user) return;

        this.isSaving = true;

        const updateData: UpdateUserRequest = {
            name: this.profileData.name,
            phone: this.profileData.phone,
            avatar: this.profileData.avatar
        };

        this.apiService.updateUser(user.id, updateData).subscribe({
            next: (updatedUser) => {
                // Update local user
                this.appService.setCurrentUser({
                    ...user,
                    name: updatedUser.name,
                    phone: updatedUser.phone || user.phone,
                    avatar: updatedUser.avatar || user.avatar
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
                this.toastService.success('Address added successfully');
                this.closeAddressModal();
            },
            error: (err) => {
                console.error('Error adding address:', err);
                this.toastService.error('Failed to add address');
            }
        });
    }

    setAsDefault(address: ApiUserAddress) {
        const user = this.appService.currentUser;
        if (!user || !address.id) return;

        this.apiService.setDefaultAddress(user.id, address.id).subscribe({
            next: () => {
                this.loadAddresses(); // Reload addresses from API
                this.toastService.success('Default address updated');
            },
            error: (err) => {
                console.error('Error setting default:', err);
                this.toastService.error('Failed to update default address');
            }
        });
    }

    deleteAddress(address: ApiUserAddress) {
        const user = this.appService.currentUser;
        if (!user || !address.id) return;

        if (confirm('Are you sure you want to delete this address?')) {
            this.apiService.deleteUserAddress(user.id, address.id).subscribe({
                next: () => {
                    this.loadAddresses(); // Reload addresses from API
                    this.toastService.success('Address deleted');
                },
                error: (err) => {
                    console.error('Error deleting address:', err);
                    this.toastService.error('Failed to delete address');
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
        this.router.navigate(['/customer']);
    }
}
