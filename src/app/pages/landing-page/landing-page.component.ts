
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
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
    imports: [CommonModule, RouterLink, LucideAngularModule],
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

    constructor(private appService: AppService) { }
}
