
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AppService } from '../../app.service';
import { AuthService } from '../../services/auth.service';
import { UserRole } from '../../types';
import {
    LucideAngularModule,
    LayoutGrid,
    Bell,
    ChevronDown,
    LogOut,
    Home,
    FileText,
    AlertCircle,
    Users,
    TrendingUp
} from 'lucide-angular';

@Component({
    selector: 'app-navbar',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule, LucideAngularModule],
    templateUrl: './navbar.component.html',
    styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
    readonly LayoutGrid = LayoutGrid;
    readonly Bell = Bell;
    readonly ChevronDown = ChevronDown;
    readonly LogOut = LogOut;
    readonly Home = Home;
    readonly FileText = FileText;
    readonly AlertCircle = AlertCircle;
    readonly Users = Users;
    readonly TrendingUp = TrendingUp;
    readonly UserRole = UserRole;

    unreadDisputes = 0;
    showDropdown = false;

    private authService = inject(AuthService);

    constructor(public appService: AppService, private router: Router) {
        this.appService.disputes$.subscribe(disputes => {
            this.unreadDisputes = disputes.filter(d => d.status !== 'RESOLVED').length;
        });
    }

    logout() {
        // Use AuthService for logout
        this.authService.logout().subscribe({
            next: () => {
                // Toast is shown by AuthService
            },
            error: (error) => {
                console.error('Logout error:', error);
            }
        });
    }

    navigateToDisputes() {
        this.router.navigate(['/disputes']);
        this.showDropdown = false;
    }

    navigateToReviews() {
        this.router.navigate(['/reviews']);
        this.showDropdown = false;
    }

    toggleDropdown() {
        this.showDropdown = !this.showDropdown;
    }
}
