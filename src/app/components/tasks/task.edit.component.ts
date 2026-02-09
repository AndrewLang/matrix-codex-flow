import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { map } from 'rxjs';

import { CommandDescriptor } from '../../models/command';
import { StepViewModel, TaskStep, TaskStepType } from '../../models/task';
import { TaskService } from '../../services/task.service';
import { InputEditableComponent } from '../input-editable/input.editable.component';
import { WorkspaceHeaderComponent } from '../workspace/workspace.header.component';
import { StepListComponent } from './step.list.component';

@Component({
    selector: 'mtx-task-editor',
    templateUrl: 'task.edit.component.html',
    imports: [StepListComponent, InputEditableComponent, WorkspaceHeaderComponent]
})
export class TaskEditComponent {
    private readonly taskService = inject(TaskService);
    private readonly route = inject(ActivatedRoute);
    private readonly router = inject(Router);

    private readonly taskId = toSignal(
        this.route.paramMap.pipe(map((params) => params.get('taskId') ?? '')),
        { initialValue: '' }
    );
    readonly collapsedStepIds = signal<Record<string, boolean>>({});
    readonly editingStepIds = signal<Record<string, boolean>>({});
    readonly stepDrafts = signal<Record<string, StepViewModel>>({});

    readonly task = computed(() => this.taskService.findTask(this.taskId()));
    readonly preSteps = computed(() => {
        const selectedTask = this.task();

        if (!selectedTask) {
            return [];
        }

        return selectedTask.presteps;
    });
    readonly mainSteps = computed(() => {
        const selectedTask = this.task();

        if (!selectedTask) {
            return [];
        }

        return selectedTask.steps;
    });
    readonly postSteps = computed(() => {
        const selectedTask = this.task();

        if (!selectedTask) {
            return [];
        }

        return selectedTask.poststeps;
    });
    readonly headerRightCommands = computed<CommandDescriptor[]>(() => {
        if (!this.task()) {
            return [];
        }

        return [
            {
                id: 'add-step',
                title: 'Add Step',
                icon: 'plus-lg',
                subCommands: [
                    { id: 'add-pre-step', title: 'Add PreStep', action: () => this.addPreStep() },
                    { id: 'add-post-step', title: 'Add PostStep', action: () => this.addPostStep() },
                ],
                action: () => this.addStep()
            }
        ];
    });
    readonly headerLeftCommands = computed<CommandDescriptor[]>(() => {
        return [{
            id: 'go-back',
            title: '',
            icon: 'arrow-left',
            action: () => this.goBack()
        }];
    });

    constructor() {

    }

    goBack(): void {
        void this.router.navigate(['/workspace/tasks']);
    }

    addPreStep(): void {
        this.addStepByType('pre');
    }

    addPostStep(): void {
        this.addStepByType('post');
    }

    addStep(): void {
        this.addStepByType('normal');
    }

    saveTaskEditor(): void {
        const editingStepIds = Object.entries(this.editingStepIds())
            .filter(([, isEditing]) => isEditing)
            .map(([stepId]) => stepId);

        for (const stepId of editingStepIds) {
            this.saveStep(stepId);
        }
    }

    private addStepByType(stepType: TaskStepType): void {
        const taskId = this.taskId();

        if (!taskId) {
            return;
        }

        const createdStepId = this.taskService.addStep(taskId, stepType);

        if (!createdStepId) {
            return;
        }

        this.collapsedStepIds.update((state) => ({ ...state, [createdStepId]: false }));
    }

    submitTaskTitle(value: string): void {
        const taskId = this.taskId();
        const trimmedTitle = value.trim();
        const currentTask = this.task();

        if (!taskId || !trimmedTitle || !currentTask) {
            return;
        }

        this.taskService.updateTask(taskId, trimmedTitle, currentTask.description);
    }

    submitTaskDescription(value: string): void {
        const taskId = this.taskId();
        const currentTask = this.task();

        if (!taskId || !currentTask) {
            return;
        }

        this.taskService.updateTask(taskId, currentTask.title, value.trim());
    }

    toggleStepCollapse(stepId: string): void {
        this.collapsedStepIds.update((state) => ({
            ...state,
            [stepId]: !(state[stepId] ?? true)
        }));
    }

    startEditStep(step: TaskStep): void {
        this.editingStepIds.update((state) => ({ ...state, [step.id]: true }));
        // this.stepDrafts.update((state) => ({
        //     ...state,
        //     [step.id]: {
        //         title: step.title,
        //         content: step.content
        //     }
        // }));
    }

    cancelEditStep(stepId: string): void {
        this.editingStepIds.update((state) => ({ ...state, [stepId]: false }));
    }

    updateStepDraftTitle(stepId: string, value: string): void {
        // this.stepDrafts.update((state) => ({
        //     ...state,
        //     [stepId]: {
        //         title: value,
        //         content: state[stepId]?.content ?? ''
        //     }
        // }));
    }

    updateStepDraftContent(stepId: string, value: string): void {
        // this.stepDrafts.update((state) => ({
        //     ...state,
        //     [stepId]: {
        //         title: state[stepId]?.title ?? '',
        //         content: value
        //     }
        // }));
    }

    saveStep(stepId: string): void {
        const draft = this.stepDrafts()[stepId];
        const taskId = this.taskId();

        if (!draft || !taskId) {
            return;
        }

        const trimmedTitle = draft.title.trim();

        if (!trimmedTitle) {
            return;
        }

        this.taskService.updateStep(taskId, stepId, trimmedTitle, draft.content);
        this.editingStepIds.update((state) => ({ ...state, [stepId]: false }));
    }

    deleteStep(stepId: string): void {
        const taskId = this.taskId();

        if (!taskId) {
            return;
        }

        this.taskService.deleteStep(taskId, stepId);

        this.collapsedStepIds.update((state) => {
            const nextState = { ...state };
            delete nextState[stepId];
            return nextState;
        });

        this.editingStepIds.update((state) => {
            const nextState = { ...state };
            delete nextState[stepId];
            return nextState;
        });

        this.stepDrafts.update((state) => {
            const nextState = { ...state };
            delete nextState[stepId];
            return nextState;
        });
    }
}
