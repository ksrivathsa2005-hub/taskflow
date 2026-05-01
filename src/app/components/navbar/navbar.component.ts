
import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AppService } from '../../app.service';
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

    constructor(public appService: AppService, private router: Router) {
        this.appService.disputes$.subscribe(disputes => {
            this.unreadDisputes = disputes.filter(d => d.status !== 'RESOLVED').length;
        });
    }

    @HostListener('window:keydown.escape')
    onEscapePressed() {
        this.showDropdown = false;
    }

    logout() {
        // Clear localStorage
        localStorage.removeItem('taskflow_appstate');
        localStorage.removeItem('currentUser');
        
        // Clear app state
        this.appService.setCurrentUser(null);
        
        // Navigate to login
        this.router.navigate(['/']);
    }

    navigateToDisputes() {
        this.router.navigate(['/disputes']);
        this.showDropdown = false;
    }

    navigateToReviews() {
        this.router.navigate(['/reviews']);
        this.showDropdown = false;
    }

    navigateToEarnings() {
        this.router.navigate(['/worker/earnings']);
        this.showDropdown = false;
    }

    navigateToAdminUsers() {
        this.router.navigate(['/admin/users']);
        this.showDropdown = false;
    }

    navigateToAdminReviews() {
        this.router.navigate(['/admin/reviews']);
        this.showDropdown = false;
    }

    navigateToAdminDisputes() {
        this.router.navigate(['/admin/disputes']);
        this.showDropdown = false;
    }

    toggleDropdown() {
        this.showDropdown = !this.showDropdown;
    }

    navigateToDashboard() {
        const currentUser = this.appService.currentUser;
        if (currentUser) {
            switch (currentUser.role) {
                case UserRole.CUSTOMER:
                    this.router.navigate(['/customer']);
                    break;
                case UserRole.WORKER:
                    this.router.navigate(['/worker']);
                    break;
                case UserRole.ADMIN:
                    this.router.navigate(['/admin']);
                    break;
                default:
                    this.router.navigate(['/']);
            }
        } else {
            this.router.navigate(['/']);
        }
    }
}


