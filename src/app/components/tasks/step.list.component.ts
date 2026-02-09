import { DatePipe } from '@angular/common';
import { Component, computed, effect, input, signal } from '@angular/core';

import { EMPTY_TASK, StepViewModel, TaskExtensions, TaskStepExtensions, TaskStepType, TaskViewModel } from '../../models/task';
import { IconComponent } from '../icon/icon.component';
import { MarkdownRendererComponent } from '../md-renderer/md.renderer.component';
import { StepEditorComponent } from './step.edit.component';

@Component({
    selector: 'mtx-step-list',
    templateUrl: 'step.list.component.html',
    imports: [DatePipe, IconComponent, MarkdownRendererComponent, StepEditorComponent]
})
export class StepListComponent {
    readonly task = input.required<TaskViewModel>();
    readonly editableTask = signal<TaskViewModel>(EMPTY_TASK);
    readonly stepType = input<TaskStepType>('normal');
    readonly steps = computed(() => {
        let steps = [];
        if (this.stepType() === 'pre') {
            steps = this.editableTask().presteps;
        } else if (this.stepType() === 'post') {
            steps = this.editableTask().poststeps;
        } else {
            steps = this.editableTask().steps;
        }

        return TaskStepExtensions.toViewModels(steps);
    });

    readonly title = input<string>('Steps');
    readonly subtitle = input<string>('');
    readonly titleIcon = input<string>('arrow-right');
    readonly isCollapsed = signal(false);

    constructor() {
        effect(() => {
            const task = this.task();
            if (task) {
                this.editableTask.set(task);
            }
        });
    }

    toggleStepExpanded(step: StepViewModel): void {
        step.isExpanded.set(!step.isExpanded());
    }

    toggleStepEditing(step: StepViewModel): void {
        step.isEditing.set(!step.isEditing());
    }

    isListCollapsed(): boolean {
        return this.steps().length === 0 || this.isCollapsed();
    }

    toggleListCollapse(): void {
        if (this.steps().length === 0) {
            return;
        }

        this.isCollapsed.update((value) => !value);
    }

    onCancelEditStep(step: StepViewModel): void {
        step.isEditing.set(false);
    }

    onSaveStep(updatedStep: StepViewModel): void {
        TaskExtensions.updateStep(this.editableTask, updatedStep);

        updatedStep.isEditing.set(false);
    }

    deleteStep(step: StepViewModel): void {
        TaskExtensions.deleteStep(this.editableTask, step);
    }
}
