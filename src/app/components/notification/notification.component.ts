import { CommonModule } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { Notification as AppNotification } from '../../models/notification';

@Component({
    selector: 'mtx-notification',
    templateUrl: 'notification.component.html',
    styles: [`
        @keyframes notification-slide-down {
            from {
                opacity: 0;
                margin-top: -18px;
            }
            to {
                opacity: 1;
                margin-top: 0;
            }
        }

        .notification-enter {
            animation: notification-slide-down 360ms cubic-bezier(0.22, 1, 0.36, 1);
        }
    `],
    imports: [CommonModule]
})
export class NotificationComponent {
    readonly notification = input.required<AppNotification>();

    readonly containerClass = computed(() => {
        const currentType = this.notification().type;

        if (currentType === 'success') {
            return 'bg-emerald-500/20 text-emerald-200';
        }

        if (currentType === 'error') {
            return 'bg-rose-500/20 text-rose-200';
        }

        return 'bg-sky-500/20 text-sky-200';
    });
}
