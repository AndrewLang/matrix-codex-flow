import { Injectable, signal } from '@angular/core';

import { DialogContentOptions, DialogPromptOptions, DialogState } from '../models/dialog.model';

const DEFAULT_CANCEL_BUTTON_CLASS =
    'rounded bg-slate-700 px-3 py-1.5 text-xs text-slate-200 transition hover:bg-slate-600';
const DEFAULT_CONFIRM_BUTTON_CLASS =
    'rounded bg-emerald-600 px-3 py-1.5 text-xs text-white transition hover:bg-emerald-500';

@Injectable({ providedIn: 'root' })
export class DialogService {
    private readonly state = signal<DialogState | null>(null);

    readonly dialog = this.state.asReadonly();

    openPrompt(options: DialogPromptOptions): Promise<boolean> {
        return new Promise<boolean>((resolve) => {
            this.state.set({
                mode: 'prompt',
                title: options.title,
                message: options.message,
                confirmLabel: options.confirmLabel ?? 'OK',
                cancelLabel: options.cancelLabel ?? 'Cancel',
                confirmButtonClass: options.confirmButtonClass ?? DEFAULT_CONFIRM_BUTTON_CLASS,
                cancelButtonClass: options.cancelButtonClass ?? DEFAULT_CANCEL_BUTTON_CLASS,
                size: options.size ?? 'md',
                closeOnBackdrop: options.closeOnBackdrop ?? false,
                showCloseButton: options.showCloseButton ?? true,
                resolve
            });
        });
    }

    openContent(options: DialogContentOptions): void {
        this.state.set({
            mode: 'content',
            title: options.title,
            component: options.component,
            componentInputs: options.componentInputs ?? {},
            size: options.size ?? 'md',
            closeOnBackdrop: options.closeOnBackdrop ?? false,
            showCloseButton: options.showCloseButton ?? true
        });
    }

    confirmPrompt(): void {
        const currentDialog = this.state();
        if (!currentDialog || currentDialog.mode !== 'prompt') {
            return;
        }

        currentDialog.resolve?.(true);
        this.state.set(null);
    }

    cancelPrompt(): void {
        const currentDialog = this.state();
        if (!currentDialog || currentDialog.mode !== 'prompt') {
            return;
        }

        currentDialog.resolve?.(false);
        this.state.set(null);
    }

    close(): void {
        const currentDialog = this.state();
        if (!currentDialog) {
            return;
        }

        if (currentDialog.mode === 'prompt') {
            currentDialog.resolve?.(false);
        }

        this.state.set(null);
    }
}
