import { CommonModule } from '@angular/common';
import { Component, effect, inject, input, OnInit, output, signal } from '@angular/core';
import { Router } from '@angular/router';
import { timer } from 'rxjs';
import { CommandDescriptor } from '../../models/command';
import { EMPTY_TASK, StepViewModel, TaskExtensions, TaskViewModel } from '../../models/task';
import { ChatService } from '../../services/chat.service';
import { DialogService } from '../../services/dialog.service';
import { IconComponent } from '../icon/icon.component';
import { MarkdownRendererComponent } from '../md-renderer/md.renderer.component';

@Component({
    selector: 'mtx-step-card',
    templateUrl: 'step.card.component.html',
    imports: [CommonModule, MarkdownRendererComponent, IconComponent]
})
export class StepCardComponent implements OnInit {
    readonly router = inject(Router);
    readonly chatService = inject(ChatService);
    readonly dialogService = inject(DialogService);

    readonly step = input.required<StepViewModel>();
    readonly task = input.required<TaskViewModel>();
    readonly onEdit = output<StepViewModel>();
    readonly onDelete = output<StepViewModel>();
    readonly editableTask = signal<TaskViewModel>(EMPTY_TASK);

    readonly commands: CommandDescriptor[] = [
        {
            id: 'edit-step',
            title: '',
            icon: 'pencil text-xs',
            description: 'Edit step',
            tag: 'text-slate-200 bg-slate-700 hover:bg-slate-600',
            action: () => { this.onEdit.emit(this.step()); }
        },
        {
            id: 'run-step',
            title: '',
            icon: 'play',
            description: 'Run this step',
            tag: 'text-green-200 bg-slate-700 hover:bg-slate-600',
            action: () => { this.runStep(); }
        },
        {
            id: 'copy-step',
            title: '',
            icon: 'copy text-xs',
            description: 'Copy step content',
            tag: 'text-slate-200 bg-slate-700 hover:bg-slate-600',
            action: () => { this.copyStepContent(); }
        },
        {
            id: 'delete-step',
            title: '',
            icon: 'trash text-xs',
            description: 'Delete step',
            tag: 'bg-rose-700 hover:bg-rose-600',
            action: async () => {
                await this.deleteStep();
            }
        },
    ];

    constructor() {
        effect(() => {
            const task = this.task();
            if (task) {
                this.editableTask.set(task);
            }
        });
    }

    ngOnInit() { }

    copyStepContent(): void {
        const content = this.step().content.trim();
        if (!content) {
            return;
        }

        navigator.clipboard.writeText(this.step().content);
        this.step().tag.set('Step content copied to clipboard');
        setTimeout(() => this.step().tag.set(''), 3000);
    }

    runStep(): void {
        this.router.navigate(['/workspace/chat']);
        timer(100).subscribe(() => {
            this.chatService.chat(this.step().content);
        });
    }

    async deleteStep(): Promise<void> {
        let title = this.step().title.trim();
        const isConfirmed = await this.dialogService.openPrompt({
            title: 'Delete Step',
            message: `Delete "${title}"? This action cannot be undone.`,
            confirmLabel: 'Delete',
            cancelLabel: 'Cancel',
            confirmButtonClass: 'rounded bg-rose-600 px-3 py-1.5 text-xs text-white transition hover:bg-rose-500',
            size: 'sm',
        });

        if (!isConfirmed) {
            return;
        }

        TaskExtensions.deleteStep(this.editableTask, this.step());
        this.onDelete.emit(this.step());
    }
}