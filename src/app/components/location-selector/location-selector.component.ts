import { Component, Output, EventEmitter, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, MapPin, ChevronDown } from 'lucide-angular';

export interface Location {
  state: string;
  city: string;
  area: string;
  fullAddress: string;
}

@Component({
  selector: 'app-location-selector',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  template: `
    <div class="space-y-4">
      <!-- State -->
      <div>
        <label class="block text-sm font-semibold text-slate-700 mb-2">
          <lucide-icon [img]="MapPin" class="w-4 h-4 inline mr-1"></lucide-icon>
          State
        </label>
        <select
          [(ngModel)]="selectedState"
          (ngModelChange)="onStateChange()"
          class="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none transition-all"
        >
          <option value="">Select State</option>
          <option *ngFor="let state of states" [value]="state">{{ state }}</option>
        </select>
      </div>

      <!-- City -->
      <div *ngIf="selectedState">
        <label class="block text-sm font-semibold text-slate-700 mb-2">City</label>
        <select
          [(ngModel)]="selectedCity"
          (ngModelChange)="onCityChange()"
          class="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none transition-all"
        >
          <option value="">Select City</option>
          <option *ngFor="let city of cities" [value]="city">{{ city }}</option>
        </select>
      </div>

      <!-- Area -->
      <div *ngIf="selectedCity">
        <label class="block text-sm font-semibold text-slate-700 mb-2">Area</label>
        <input
          type="text"
          [(ngModel)]="selectedArea"
          (ngModelChange)="onAreaChange()"
          placeholder="Enter area/locality"
          class="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none transition-all"
        />
      </div>

      <!-- Full Address -->
      <div *ngIf="selectedArea">
        <label class="block text-sm font-semibold text-slate-700 mb-2">Full Address</label>
        <textarea
          [(ngModel)]="fullAddress"
          (ngModelChange)="emitLocation()"
          placeholder="Enter complete address with landmarks"
          rows="3"
          class="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none transition-all resize-none"
        ></textarea>
      </div>
    </div>
  `,
  styles: []
})
export class LocationSelectorComponent {
  @Output() locationChange = new EventEmitter<Location>();
  @Input() initialLocation?: Location;

  readonly MapPin = MapPin;
  readonly ChevronDown = ChevronDown;

  states = ['Maharashtra', 'Delhi', 'Karnataka', 'Tamil Nadu', 'Telangana', 'Gujarat', 'Rajasthan', 'West Bengal'];
  cities: string[] = [];
  
  selectedState = '';
  selectedCity = '';
  selectedArea = '';
  fullAddress = '';

  private cityMap: { [key: string]: string[] } = {
    'Maharashtra': ['Mumbai', 'Pune', 'Nagpur', 'Nashik', 'Thane'],
    'Delhi': ['New Delhi', 'Dwarka', 'Rohini'],
    'Karnataka': ['Bangalore', 'Mysore', 'Mangalore'],
    'Tamil Nadu': ['Chennai', 'Coimbatore', 'Madurai'],
    'Telangana': ['Hyderabad', 'Secunderabad'],
    'Gujarat': ['Ahmedabad', 'Surat', 'Vadodara'],
    'Rajasthan': ['Jaipur', 'Udaipur', 'Jodhpur'],
    'West Bengal': ['Kolkata', 'Siliguri']
  };

  ngOnInit() {
    if (this.initialLocation) {
      this.selectedState = this.initialLocation.state;
      this.onStateChange();
      this.selectedCity = this.initialLocation.city;
      this.selectedArea = this.initialLocation.area;
      this.fullAddress = this.initialLocation.fullAddress;
    }
  }

  onStateChange() {
    this.cities = this.cityMap[this.selectedState] || [];
    this.selectedCity = '';
    this.selectedArea = '';
    this.fullAddress = '';
  }

  onCityChange() {
    this.selectedArea = '';
    this.fullAddress = '';
  }

  onAreaChange() {
    this.emitLocation();
  }

  emitLocation() {
    if (this.selectedState && this.selectedCity && this.selectedArea && this.fullAddress) {
      this.locationChange.emit({
        state: this.selectedState,
        city: this.selectedCity,
        area: this.selectedArea,
        fullAddress: this.fullAddress
      });
    }
  }
}
