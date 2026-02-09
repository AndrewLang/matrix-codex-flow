import { Type } from '@angular/core';

export type DialogMode = 'content' | 'prompt';
export type DialogSize = 'sm' | 'md' | 'lg';

export interface DialogPromptOptions {
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    confirmButtonClass?: string;
    cancelButtonClass?: string;
    size?: DialogSize;
    closeOnBackdrop?: boolean;
    showCloseButton?: boolean;
}

export interface DialogContentOptions {
    title: string;
    component: Type<unknown>;
    componentInputs?: Record<string, unknown>;
    size?: DialogSize;
    closeOnBackdrop?: boolean;
    showCloseButton?: boolean;
}

export interface DialogBaseState {
    mode: DialogMode;
    title: string;
    size: DialogSize;
    closeOnBackdrop: boolean;
    showCloseButton: boolean;
}

export interface PromptDialogState extends DialogBaseState {
    mode: 'prompt';
    message: string;
    confirmLabel: string;
    cancelLabel: string;
    confirmButtonClass: string;
    cancelButtonClass: string;
    resolve?: (confirmed: boolean) => void;
}

export interface ContentDialogState extends DialogBaseState {
    mode: 'content';
    component: Type<unknown>;
    componentInputs: Record<string, unknown>;
}

export type DialogState = PromptDialogState | ContentDialogState;
