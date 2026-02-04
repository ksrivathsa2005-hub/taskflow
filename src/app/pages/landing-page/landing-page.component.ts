
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppService } from '../../app.service';
import { UserRole } from '../../types';
import { FEATURES, CATEGORIES } from '../../constants';
import {
    LucideAngularModule,
    ArrowRight,
    CheckCircle,
    Star,
    ShieldCheck,
    MapPin,
    Droplets,
    Zap,
    Brush,
    Hammer,
    Truck,
    Search,
    Users
} from 'lucide-angular';

@Component({
    selector: 'app-landing-page',
    standalone: true,
    imports: [CommonModule, LucideAngularModule],
    templateUrl: './landing-page.component.html',
    styleUrls: ['./landing-page.component.css']
})
export class LandingPageComponent {
    readonly FEATURES = FEATURES;
    readonly CATEGORIES = CATEGORIES;
    readonly UserRole = UserRole;

    readonly ArrowRight = ArrowRight;
    readonly CheckCircle = CheckCircle;
    readonly Star = Star;
    readonly ShieldCheck = ShieldCheck;
    readonly MapPin = MapPin;

    // Icon mapping for constants
    iconMap: Record<string, any> = {
        'shield-check': ShieldCheck,
        'search': Search,
        'users': Users,
        'droplets': Droplets,
        'zap': Zap,
        'brush': Brush,
        'hammer': Hammer,
        'truck': Truck
    };

    stats = [
        { label: 'Active Partners', value: '5k+' },
        { label: 'Completed Jobs', value: '25k+' },
        { label: 'Average Rating', value: '4.8/5' },
        { label: 'Cities Covered', value: '12+' },
    ];

    demoAccounts = [
        { name: 'Rahul Kumar', role: UserRole.CUSTOMER, email: 'rahul@taskflow.com', badge: 'Customer' },
        { name: 'Priya Singh', role: UserRole.WORKER, email: 'priya@taskflow.com', badge: 'Expert' },
        { name: 'Admin User', role: UserRole.ADMIN, email: 'admin@taskflow.com', badge: 'Administrator' }
    ];

    constructor(private appService: AppService) { }

    loginAsDemo(role: UserRole) {
        this.appService.loginAs(role);
    }
}
