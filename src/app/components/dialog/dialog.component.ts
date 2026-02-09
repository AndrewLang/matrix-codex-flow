import { CommonModule } from '@angular/common';
import { Component, computed, input, output } from '@angular/core';
import { DialogMode, DialogSize } from '../../models/dialog.model';

@Component({
    selector: 'mtx-dialog',
    templateUrl: 'dialog.component.html',
    imports: [CommonModule]
})
export class DialogComponent {
    readonly open = input<boolean>(false);
    readonly mode = input<DialogMode>('content');
    readonly title = input<string>('');
    readonly message = input<string>('');
    readonly closeOnBackdrop = input<boolean>(true);
    readonly showCloseButton = input<boolean>(true);
    readonly confirmLabel = input<string>('OK');
    readonly cancelLabel = input<string>('Cancel');
    readonly confirmButtonClass = input<string>(
        'rounded bg-emerald-600 px-3 py-1.5 text-xs text-white transition hover:bg-emerald-500'
    );
    readonly cancelButtonClass = input<string>(
        'rounded bg-slate-700 px-3 py-1.5 text-xs text-slate-200 transition hover:bg-slate-600'
    );
    readonly size = input<DialogSize>('md');

    readonly closed = output<void>();
    readonly confirmed = output<void>();
    readonly cancelled = output<void>();

    protected readonly containerClass = computed(() => {
        const size = this.size();

        if (size === 'sm') {
            return 'w-full max-w-md';
        }

        if (size === 'lg') {
            return 'w-full max-w-4xl';
        }

        return 'w-full max-w-2xl';
    });

    protected onBackdropClick(): void {
        if (!this.closeOnBackdrop()) {
            return;
        }

        this.closed.emit();
    }

    protected onCloseClick(): void {
        this.closed.emit();
    }

    protected onCancelClick(): void {
        this.cancelled.emit();
    }

    protected onConfirmClick(): void {
        this.confirmed.emit();
    }
}
