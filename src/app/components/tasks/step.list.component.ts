import { CdkDrag, CdkDragDrop, CdkDragHandle, CdkDropList, moveItemInArray } from '@angular/cdk/drag-drop';
import { DatePipe } from '@angular/common';
import { Component, computed, effect, inject, input, signal } from '@angular/core';

import { Router } from '@angular/router';
import { EMPTY_TASK, StepViewModel, TaskExtensions, TaskStepExtensions, TaskStepType, TaskViewModel } from '../../models/task';
import { ChatService } from '../../services/chat.service';
import { ProjectService } from '../../services/project.service';
import { IconComponent } from '../icon/icon.component';
import { StepCardComponent } from './step.card.component';
import { StepEditorComponent } from './step.edit.component';

@Component({
    selector: 'mtx-step-list',
    templateUrl: 'step.list.component.html',
    imports: [DatePipe, IconComponent,
        StepEditorComponent, StepCardComponent,
        CdkDropList, CdkDrag, CdkDragHandle
    ]
})
export class StepListComponent {
    readonly chatService = inject(ChatService);
    readonly projectService = inject(ProjectService);
    readonly router = inject(Router);

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
    readonly allowReorder = input<boolean>(false);

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

    editStep(step: StepViewModel): void {
        step.isEditing.set(true);
    }

    deleteStep(step: StepViewModel): void {
        TaskExtensions.deleteStep(this.editableTask, step);
        this.projectService.saveProject();
    }

    isListCollapsed(): boolean {
        return this.steps().length === 0 || this.isCollapsed();
    }

    toggleCollapse(): void {
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
        this.projectService.saveProject();

        updatedStep.isEditing.set(false);
    }

    dropStep(event: CdkDragDrop<StepViewModel[]>): void {
        if (!this.allowReorder()) {
            return;
        }

        moveItemInArray(this.steps(), event.previousIndex, event.currentIndex);

        let stepType = this.steps()[0].type;
        TaskExtensions.reorderSteps(this.editableTask, this.steps(), stepType);
    }
}
