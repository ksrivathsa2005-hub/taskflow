
import { Component, HostListener, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { AppService } from '../../app.service';
import { UserRole } from '../../types';
import { filter, Subscription } from 'rxjs';
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
    TrendingUp,
    User,
    Menu,
    X
} from 'lucide-angular';

@Component({
    selector: 'app-navbar',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule, LucideAngularModule],
    templateUrl: './navbar.component.html',
    styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit, OnDestroy {
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
    readonly User = User;
    readonly Menu = Menu;
    readonly X = X;

    unreadDisputes = 0;
    showDropdown = false;
    showMobileMenu = false;
    scrolled = false;

    private routerSub?: Subscription;

    constructor(public appService: AppService, private router: Router) {
        this.appService.disputes$.subscribe(disputes => {
            this.unreadDisputes = disputes.filter(d => d.status !== 'RESOLVED').length;
        });
    }

    ngOnInit(): void {
        // Scroll to top on route change
        this.routerSub = this.router.events
            .pipe(filter(event => event instanceof NavigationEnd))
            .subscribe(() => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
                this.closeMobileMenu();
            });
    }

    ngOnDestroy(): void {
        this.routerSub?.unsubscribe();
    }

    @HostListener('window:scroll')
    onScroll(): void {
        this.scrolled = window.scrollY > 20;
    }

    @HostListener('document:click', ['$event'])
    onDocumentClick(event: Event): void {
        const target = event.target as HTMLElement;
        // Close dropdown if clicked outside
        if (this.showDropdown && !target.closest('.relative')) {
            this.showDropdown = false;
        }
    }

    toggleMobileMenu(): void {
        this.showMobileMenu = !this.showMobileMenu;
        // Prevent body scroll when mobile menu is open
        document.body.style.overflow = this.showMobileMenu ? 'hidden' : '';
    }

    closeMobileMenu(): void {
        this.showMobileMenu = false;
        document.body.style.overflow = '';
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

    navigateToProfile() {
        const currentUser = this.appService.currentUser;
        if (currentUser) {
            switch (currentUser.role) {
                case UserRole.CUSTOMER:
                    this.router.navigate(['/customer/profile']);
                    break;
                case UserRole.WORKER:
                    this.router.navigate(['/worker/profile']);
                    break;
                default:
                    break;
            }
        }
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


