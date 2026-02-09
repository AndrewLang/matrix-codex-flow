import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';

import { DialogService } from '../../services/dialog.service';
import { DialogComponent } from './dialog.component';

@Component({
    selector: 'mtx-dialog-outlet',
    templateUrl: 'dialog.outlet.component.html',
    imports: [CommonModule, DialogComponent]
})
export class DialogOutletComponent {
    private readonly dialogService = inject(DialogService);

    protected readonly dialog = this.dialogService.dialog;
    protected readonly isOpen = computed(() => !!this.dialog());

    protected onClose(): void {
        this.dialogService.close();
    }

    protected onCancel(): void {
        this.dialogService.cancelPrompt();
    }

    protected onConfirm(): void {
        this.dialogService.confirmPrompt();
    }
}
