
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Task, TaskStatus, UserRole } from '../../types';
import { STATUS_COLORS, CURRENCY } from '../../constants';
import {
    LucideAngularModule,
    MapPin,
    Calendar,
    CreditCard,
    MessageSquare,
    ArrowRight
} from 'lucide-angular';

@Component({
    selector: 'app-task-card',
    standalone: true,
    imports: [CommonModule, LucideAngularModule],
    templateUrl: './task-card.component.html',
    styleUrls: ['./task-card.component.css']
})
export class TaskCardComponent {
    @Input() task!: Task;
    @Input() role!: UserRole;
    @Output() select = new EventEmitter<void>();
    @Output() bid = new EventEmitter<void>();

    readonly STATUS_COLORS = STATUS_COLORS;
    readonly CURRENCY = CURRENCY;
    readonly UserRole = UserRole;
    readonly TaskStatus = TaskStatus;

    readonly MapPin = MapPin;
    readonly Calendar = Calendar;
    readonly CreditCard = CreditCard;
    readonly MessageSquare = MessageSquare;
    readonly ArrowRight = ArrowRight;

    formatStatus(status: unknown) {
        const value = typeof status === 'string' ? status : String(status ?? '');
        return value.replace(/_/g, ' ');
    }

    formatLocation(location: Task['location']): string {
        if (!location) return '';
        if (typeof location === 'string') return location;
        const parts = [location.area, location.city, location.state].filter(Boolean);
        return parts.join(', ');
    }

    formatDate(date: string) {
        return new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    }

    onSelectClick() {
        this.select.emit();
    }

    onBidClick() {
        this.bid.emit();
    }
}
