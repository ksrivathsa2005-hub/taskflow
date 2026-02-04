import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppService } from '../../app.service';
import { LucideAngularModule } from 'lucide-angular';

@Component({
    selector: 'app-notification-badge',
    standalone: true,
    imports: [CommonModule, LucideAngularModule],
    template: `
        <div class="relative">
            <button class="relative p-2 text-gray-600 hover:text-gray-900 transition-colors">
                <i data-lucide="bell" class="w-6 h-6"></i>
                <span *ngIf="unreadCount > 0" 
                    class="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {{unreadCount}}
                </span>
            </button>
        </div>
    `,
    styles: [`
        :host ::ng-deep {
            i[data-lucide] {
                display: inline-block;
            }
        }
    `]
})
export class NotificationBadgeComponent implements OnInit {
    unreadCount = 0;

    constructor(private appService: AppService) {}

    ngOnInit() {
        this.appService.disputes$.subscribe(disputes => {
            this.unreadCount = disputes.filter(d => d.status !== 'RESOLVED').length;
        });
    }
}
