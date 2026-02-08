import { DatePipe } from '@angular/common';
import { Component, input, output, signal } from '@angular/core';

import { StepViewModel, TaskStep } from '../../models/task';
import { IconComponent } from '../icon/icon.component';
import { MarkdownRendererComponent } from '../md-renderer/md.renderer.component';
import { StepEditorComponent } from './step.edit.component';

@Component({
    selector: 'mtx-step-list',
    templateUrl: 'step.list.component.html',
    imports: [DatePipe, IconComponent, MarkdownRendererComponent, StepEditorComponent]
})
export class StepListComponent {
    readonly steps = input<TaskStep[]>([]);
    readonly collapsedStepIds = input<Record<string, boolean>>({});
    readonly editingStepIds = input<Record<string, boolean>>({});
    readonly stepDrafts = input<Record<string, StepViewModel>>({});
    readonly title = input<string>('Steps');
    readonly subtitle = input<string>('');
    readonly titleIcon = input<string>('arrow-right');

    readonly toggleStepCollapse = output<string>();
    readonly startEditStep = output<TaskStep>();
    readonly cancelEditStep = output<string>();
    readonly updateStepDraftTitle = output<{ stepId: string; value: string }>();
    readonly updateStepDraftContent = output<{ stepId: string; value: string }>();
    readonly saveStep = output<string>();
    readonly deleteStep = output<string>();
    protected readonly isListCollapsed = signal(false);

    protected isStepListCollapsed(): boolean {
        return this.steps().length === 0 || this.isListCollapsed();
    }

    protected isStepCollapsed(stepId: string): boolean {
        return this.collapsedStepIds()[stepId] ?? true;
    }

    protected isStepEditing(stepId: string): boolean {
        return this.editingStepIds()[stepId] ?? false;
    }

    protected getStepDraftTitle(step: TaskStep): string {
        return this.stepDrafts()[step.id]?.title ?? step.title;
    }

    protected getStepDraftContent(step: TaskStep): string {
        return this.stepDrafts()[step.id]?.content ?? step.content;
    }

    protected onToggleStepCollapse(stepId: string): void {
        this.toggleStepCollapse.emit(stepId);
    }

    protected onStartEditStep(step: TaskStep): void {
        this.startEditStep.emit(step);
    }

    protected onCancelEditStep(stepId: string): void {
        this.cancelEditStep.emit(stepId);
    }

    protected onUpdateStepDraftTitle(stepId: string, value: string): void {
        this.updateStepDraftTitle.emit({ stepId, value });
    }

    protected onUpdateStepDraftContent(stepId: string, value: string): void {
        this.updateStepDraftContent.emit({ stepId, value });
    }

    protected onSaveStep(stepId: string): void {
        this.saveStep.emit(stepId);
    }

    protected onDeleteStep(stepId: string): void {
        this.deleteStep.emit(stepId);
    }

    protected toggleListCollapse(): void {
        if (this.steps().length === 0) {
            return;
        }

        this.isListCollapsed.update((value) => !value);
    }
}
