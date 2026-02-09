import { Injectable, signal } from '@angular/core';

import { Notification } from '../models/notification';

@Injectable({ providedIn: 'root' })
export class NotificationService {
    private readonly state = signal<Notification | null>(null);
    private clearTimer: ReturnType<typeof setTimeout> | null = null;

    readonly notification = this.state.asReadonly();

    show(notification: Notification, durationMs: number = 5000): void {
        this.state.set(notification);

        if (this.clearTimer) {
            clearTimeout(this.clearTimer);
            this.clearTimer = null;
        }

        if (durationMs <= 0) {
            return;
        }

        this.clearTimer = setTimeout(() => {
            this.clear();
        }, durationMs);
    }

    success(message: string, durationMs: number = 5000): void {
        this.show({ message, type: 'success' }, durationMs);
    }

    error(message: string, durationMs: number = 5000): void {
        this.show({ message, type: 'error' }, durationMs);
    }

    info(message: string, durationMs: number = 5000): void {
        this.show({ message, type: 'info' }, durationMs);
    }

    clear(): void {
        if (this.clearTimer) {
            clearTimeout(this.clearTimer);
            this.clearTimer = null;
        }

        this.state.set(null);
    }
}
