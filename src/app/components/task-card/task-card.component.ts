
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

    formatStatus(status: string | TaskStatus) {
        const statusStr = String(status);
        return statusStr.replace(/_/g, ' ');
    }

    formatDate(date: string) {
        return new Date(date).toLocaleDateString(undefined, {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    }

    onSelectClick() {
        this.select.emit();
    }

    onBidClick() {
        this.bid.emit();
    }
}
