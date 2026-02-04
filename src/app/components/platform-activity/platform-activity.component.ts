import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppService } from '../../app.service';
import { LucideAngularModule, Activity, AlertCircle, CheckCircle2, Heart, DollarSign, Plus } from 'lucide-angular';
import { interval, Subscription } from 'rxjs';

export interface PlatformActivity {
    id: string;
    type: 'task-posted' | 'task-assigned' | 'task-completed' | 'review-given' | 'payment-made';
    message: string;
    timestamp: string;
    icon: string;
    color: string;
}

@Component({
    selector: 'app-platform-activity',
    standalone: true,
    imports: [CommonModule, LucideAngularModule],
    template: `
        <div class="bg-white border border-slate-100 rounded-2xl overflow-hidden">
            <div class="px-8 py-6 border-b border-slate-100">
                <h2 class="text-2xl font-black text-slate-900 flex items-center gap-2">
                    <lucide-icon [img]="Activity" class="w-6 h-6 text-indigo-600"></lucide-icon>
                    Recent Platform Activity
                </h2>
                <p class="text-slate-500 text-sm mt-1 font-medium">Latest activity from the community</p>
            </div>

            <div class="divide-y divide-slate-100">
                <div *ngIf="activities.length === 0" class="px-8 py-12 text-center">
                    <div class="bg-slate-50 p-8 rounded-xl">
                        <lucide-icon [img]="Activity" class="w-12 h-12 text-slate-300 mx-auto mb-4"></lucide-icon>
                        <p class="text-slate-500 font-medium">No activities yet. Be the first to take action!</p>
                    </div>
                </div>

                <div *ngFor="let activity of activities" class="px-8 py-6 hover:bg-slate-50 transition-colors flex gap-4">
                    <!-- Activity Icon -->
                    <div [ngClass]="activity.color" class="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center">
                        <lucide-icon *ngIf="activity.type === 'task-posted'" [img]="Plus" class="w-6 h-6 text-white"></lucide-icon>
                        <lucide-icon *ngIf="activity.type === 'task-assigned'" [img]="AlertCircle" class="w-6 h-6 text-white"></lucide-icon>
                        <lucide-icon *ngIf="activity.type === 'task-completed'" [img]="CheckCircle2" class="w-6 h-6 text-white"></lucide-icon>
                        <lucide-icon *ngIf="activity.type === 'review-given'" [img]="Heart" class="w-6 h-6 text-white"></lucide-icon>
                        <lucide-icon *ngIf="activity.type === 'payment-made'" [img]="DollarSign" class="w-6 h-6 text-white"></lucide-icon>
                    </div>

                    <!-- Activity Details -->
                    <div class="flex-1 min-w-0">
                        <p class="text-slate-900 font-bold text-sm">{{activity.message}}</p>
                        <p class="text-slate-500 text-xs mt-1 font-medium">{{getTimeAgo(activity.timestamp)}}</p>
                    </div>
                </div>
            </div>
        </div>
    `,
    styles: [`
        :host ::ng-deep {
            lucide-icon {
                display: inline-block;
            }
        }
    `]
})
export class PlatformActivityComponent implements OnInit, OnDestroy {
    activities: PlatformActivity[] = [];
    private refreshSubscription?: Subscription;

    readonly Activity = Activity;
    readonly AlertCircle = AlertCircle;
    readonly CheckCircle2 = CheckCircle2;
    readonly Heart = Heart;
    readonly DollarSign = DollarSign;
    readonly Plus = Plus;

    constructor(public appService: AppService) {}

    ngOnInit() {
        this.loadActivities();
        
        // Auto-refresh every 30 seconds
        this.refreshSubscription = interval(30000).subscribe(() => {
            this.loadActivities();
        });
    }

    ngOnDestroy() {
        if (this.refreshSubscription) {
            this.refreshSubscription.unsubscribe();
        }
    }

    loadActivities() {
        const stored = localStorage.getItem('platformActivity');
        const allActivities: PlatformActivity[] = stored ? JSON.parse(stored) : [];
        
        // Get last 10 activities sorted by timestamp descending
        this.activities = allActivities
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
            .slice(0, 10);
    }

    getTimeAgo(timestamp: string): string {
        const now = new Date();
        const then = new Date(timestamp);
        const diffMs = now.getTime() - then.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'just now';
        if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
        if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
        if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
        
        return then.toLocaleDateString();
    }

    // Helper method to add activity (called from other components)
    static addActivity(type: PlatformActivity['type'], message: string) {
        const stored = localStorage.getItem('platformActivity');
        const activities: PlatformActivity[] = stored ? JSON.parse(stored) : [];
        
        const colorMap = {
            'task-posted': 'bg-blue-500',
            'task-assigned': 'bg-purple-500',
            'task-completed': 'bg-green-500',
            'review-given': 'bg-rose-500',
            'payment-made': 'bg-amber-500'
        };

        const newActivity: PlatformActivity = {
            id: 'activity_' + Date.now(),
            type,
            message,
            timestamp: new Date().toISOString(),
            icon: type,
            color: colorMap[type]
        };

        activities.push(newActivity);
        localStorage.setItem('platformActivity', JSON.stringify(activities));
    }
}
