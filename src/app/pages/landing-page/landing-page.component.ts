import { Component, AfterViewInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FEATURES, CATEGORIES } from '../../constants';
import { AnimationService } from '../../services/animation.service';
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
    Users,
    Play,
    Quote,
    ChevronLeft,
    ChevronRight,
    Clock,
    Award,
    TrendingUp,
    Send,
    FileText,
    Handshake,
    CircleCheckBig,
    Sparkles,
    Heart,
    Globe,
    Phone,
    Mail
} from 'lucide-angular';

@Component({
    selector: 'app-landing-page',
    standalone: true,
    imports: [CommonModule, LucideAngularModule],
    templateUrl: './landing-page.component.html',
    styleUrls: ['./landing-page.component.css']
})
export class LandingPageComponent implements AfterViewInit, OnDestroy {
    readonly FEATURES = FEATURES;
    readonly CATEGORIES = CATEGORIES;

    // Icons
    readonly ArrowRight = ArrowRight;
    readonly CheckCircle = CheckCircle;
    readonly Star = Star;
    readonly ShieldCheck = ShieldCheck;
    readonly MapPin = MapPin;
    readonly Play = Play;
    readonly Quote = Quote;
    readonly ChevronLeft = ChevronLeft;
    readonly ChevronRight = ChevronRight;
    readonly Clock = Clock;
    readonly Award = Award;
    readonly TrendingUp = TrendingUp;
    readonly Send = Send;
    readonly FileText = FileText;
    readonly Handshake = Handshake;
    readonly CircleCheckBig = CircleCheckBig;
    readonly Sparkles = Sparkles;
    readonly Heart = Heart;
    readonly Globe = Globe;
    readonly Phone = Phone;
    readonly Mail = Mail;

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

    // Stats with numeric targets for counter animation
    stats = [
        { label: 'Active Partners', value: '5,000', target: 5000, suffix: '+' },
        { label: 'Completed Jobs', value: '25,000', target: 25000, suffix: '+' },
        { label: 'Average Rating', value: '4.8', target: 4.8, suffix: '/5', decimals: true },
        { label: 'Cities Covered', value: '12', target: 12, suffix: '+' },
    ];

    // How it works steps
    steps = [
        {
            number: '01',
            title: 'Post Your Task',
            desc: 'Describe what you need done, set your budget, and choose your preferred schedule.',
            icon: FileText
        },
        {
            number: '02',
            title: 'Get Expert Bids',
            desc: 'Receive competitive quotes from verified professionals in your area within minutes.',
            icon: Handshake
        },
        {
            number: '03',
            title: 'Get It Done',
            desc: 'Choose your expert, track progress in real-time, and pay securely on completion.',
            icon: CircleCheckBig
        }
    ];

    // Testimonials
    testimonials = [
        {
            name: 'Priya Sharma',
            role: 'Homeowner, Delhi',
            avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face',
            rating: 5,
            text: 'TaskFlow transformed how I handle home repairs. Found an amazing electrician within 30 minutes who fixed everything perfectly. The transparent pricing gave me complete peace of mind.',
        },
        {
            name: 'Rahul Patel',
            role: 'Business Owner, Mumbai',
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
            rating: 5,
            text: 'As a restaurant owner, I need reliable maintenance partners. TaskFlow\'s verified experts have saved me thousands in emergency repairs. The bidding system ensures competitive pricing every time.',
        },
        {
            name: 'Ananya Reddy',
            role: 'IT Professional, Bangalore',
            avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
            rating: 5,
            text: 'Moving to a new city was stressful, but TaskFlow made settling in so easy. From plumbing to painting, every professional was punctual, skilled and courteous. Highly recommend!',
        },
        {
            name: 'Vikram Singh',
            role: 'Property Manager, Hyderabad',
            avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
            rating: 5,
            text: 'Managing 50+ properties requires dependable service partners. TaskFlow\'s partner network and real-time tracking have streamlined our maintenance workflow significantly.',
        },
        {
            name: 'Meera Joshi',
            role: 'Interior Designer, Pune',
            avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face',
            rating: 5,
            text: 'I recommend TaskFlow to all my clients for execution work. The quality of carpenters and painters on the platform is exceptional. It\'s become an essential part of my business.',
        },
    ];

    currentTestimonial = 0;
    testimonialInterval: any;
    isTransitioning = false;

    // Trust badges
    trustBadges = [
        { icon: ShieldCheck, label: '100% Verified Experts' },
        { icon: Clock, label: 'Same-Day Service' },
        { icon: Award, label: 'Quality Guaranteed' },
        { icon: TrendingUp, label: '98% Satisfaction Rate' },
    ];

    @ViewChild('statsSection') statsSection!: ElementRef;
    @ViewChild('categoriesSection') categoriesSection!: ElementRef;
    @ViewChild('stepsSection') stepsSection!: ElementRef;

    constructor(
        private router: Router,
        private animationService: AnimationService,
        private el: ElementRef
    ) {}

    ngAfterViewInit(): void {
        // Initialize scroll-triggered animations
        setTimeout(() => {
            this.initAnimations();
            this.startTestimonialAutoplay();
        }, 100);
    }

    ngOnDestroy(): void {
        if (this.testimonialInterval) {
            clearInterval(this.testimonialInterval);
        }
        this.animationService.destroyAll();
    }

    private initAnimations(): void {
        // Hero elements
        const heroTitle = this.el.nativeElement.querySelector('.hero-title');
        const heroSubtitle = this.el.nativeElement.querySelector('.hero-subtitle');
        const heroCta = this.el.nativeElement.querySelector('.hero-cta');
        const heroBadge = this.el.nativeElement.querySelector('.hero-badge');

        if (heroBadge) this.animationService.heroTextReveal(heroBadge);
        if (heroTitle) {
            setTimeout(() => this.animationService.heroTextReveal(heroTitle), 200);
        }
        if (heroSubtitle) {
            setTimeout(() => this.animationService.heroTextReveal(heroSubtitle), 400);
        }
        if (heroCta) {
            setTimeout(() => this.animationService.scaleIn(heroCta, 0), 600);
        }

        // Stats counter animation
        const statEls = this.el.nativeElement.querySelectorAll('.stat-value');
        statEls.forEach((el: HTMLElement, i: number) => {
            const stat = this.stats[i];
            if (stat) {
                if (stat.decimals) {
                    // For decimal values like 4.8
                    this.animateDecimalCounter(el, stat.target, stat.suffix);
                } else {
                    this.animationService.animateCounter(el, stat.target, 2, stat.suffix);
                }
            }
        });

        // Categories stagger
        const catGrid = this.el.nativeElement.querySelector('.categories-grid');
        if (catGrid) {
            this.animationService.staggerFadeUp(catGrid, '.category-card', 0.08);
        }

        // Steps stagger
        const stepsContainer = this.el.nativeElement.querySelector('.steps-container');
        if (stepsContainer) {
            this.animationService.staggerFadeUp(stepsContainer, '.step-card', 0.15);
        }

        // Features stagger
        const featuresGrid = this.el.nativeElement.querySelector('.features-grid');
        if (featuresGrid) {
            this.animationService.staggerFadeUp(featuresGrid, '.feature-card', 0.12);
        }

        // Draw the connector line in steps
        const stepLine = this.el.nativeElement.querySelector('.step-connector-line');
        if (stepLine) {
            this.animationService.drawLine(stepLine);
        }

        // 3D tilt on category cards
        const catCards = this.el.nativeElement.querySelectorAll('.category-card');
        catCards.forEach((card: HTMLElement) => {
            this.animationService.add3DTilt(card, 8);
        });

        // CTA section
        const ctaSection = this.el.nativeElement.querySelector('.cta-card');
        if (ctaSection) {
            this.animationService.scaleIn(ctaSection);
        }
    }

    private animateDecimalCounter(element: HTMLElement, target: number, suffix: string): void {
        import('gsap').then(({ gsap }) => {
            import('gsap/ScrollTrigger').then(({ ScrollTrigger }) => {
                gsap.registerPlugin(ScrollTrigger);
                const obj = { value: 0 };
                gsap.to(obj, {
                    value: target,
                    duration: 2,
                    ease: 'power2.out',
                    scrollTrigger: {
                        trigger: element,
                        start: 'top 85%',
                        once: true,
                    },
                    onUpdate: () => {
                        element.textContent = obj.value.toFixed(1) + suffix;
                    }
                });
            });
        });
    }

    goToLogin(): void {
        this.router.navigate(['/login']);
    }

    // Testimonial controls
    nextTestimonial(): void {
        if (this.isTransitioning) return;
        this.isTransitioning = true;
        this.currentTestimonial = (this.currentTestimonial + 1) % this.testimonials.length;
        setTimeout(() => this.isTransitioning = false, 500);
        this.resetAutoplay();
    }

    prevTestimonial(): void {
        if (this.isTransitioning) return;
        this.isTransitioning = true;
        this.currentTestimonial = this.currentTestimonial === 0
            ? this.testimonials.length - 1
            : this.currentTestimonial - 1;
        setTimeout(() => this.isTransitioning = false, 500);
        this.resetAutoplay();
    }

    goToTestimonial(index: number): void {
        if (this.isTransitioning || index === this.currentTestimonial) return;
        this.isTransitioning = true;
        this.currentTestimonial = index;
        setTimeout(() => this.isTransitioning = false, 500);
        this.resetAutoplay();
    }

    private startTestimonialAutoplay(): void {
        this.testimonialInterval = setInterval(() => {
            this.nextTestimonial();
        }, 5000);
    }

    private resetAutoplay(): void {
        if (this.testimonialInterval) {
            clearInterval(this.testimonialInterval);
        }
        this.startTestimonialAutoplay();
    }

    getStarArray(rating: number): number[] {
        return Array.from({ length: rating }, (_, i) => i);
    }
}
