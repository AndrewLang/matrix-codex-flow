import { Component, computed, ElementRef, inject, OnDestroy, Renderer2, signal, ViewChild } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { map } from 'rxjs';

import { CommandDescriptor } from '../../models/command';
import { StepViewModel, TaskStep, TaskStepType } from '../../models/task';
import { TaskService } from '../../services/task.service';
import { IconComponent } from '../icon/icon.component';
import { InputEditableComponent } from '../input-editable/input.editable.component';
import { WorkspaceHeaderComponent } from '../workspace/workspace.header.component';
import { StepListComponent } from './step.list.component';

@Component({
    selector: 'mtx-task-editor',
    templateUrl: 'task.edit.component.html',
    imports: [IconComponent, StepListComponent, InputEditableComponent, WorkspaceHeaderComponent]
})
export class TaskEditComponent implements OnDestroy {
    private readonly taskService = inject(TaskService);
    private readonly route = inject(ActivatedRoute);
    private readonly router = inject(Router);

    private readonly taskId = toSignal(
        this.route.paramMap.pipe(map((params) => params.get('taskId') ?? '')),
        { initialValue: '' }
    );

    protected readonly task = computed(() => this.taskService.findTask(this.taskId()));
    protected readonly preSteps = computed(() => {
        const selectedTask = this.task();

        if (!selectedTask) {
            return [];
        }

        return selectedTask.presteps;
    });

    protected readonly mainSteps = computed(() => {
        const selectedTask = this.task();

        if (!selectedTask) {
            return [];
        }

        return selectedTask.steps;
    });

    protected readonly postSteps = computed(() => {
        const selectedTask = this.task();

        if (!selectedTask) {
            return [];
        }

        return selectedTask.poststeps;
    });

    protected readonly headerCommands = computed<CommandDescriptor[]>(() => {
        if (!this.task()) {
            return [];
        }

        return [
            {
                id: 'add-step',
                title: 'Add Step',
                icon: 'plus-lg',
                subCommands: [
                    { id: 'add-pre-step', title: 'Add PreStep' },
                    { id: 'add-post-step', title: 'Add PostStep' },
                ],
            }
        ];
    });

    protected readonly collapsedStepIds = signal<Record<string, boolean>>({});
    protected readonly editingStepIds = signal<Record<string, boolean>>({});
    protected readonly stepDrafts = signal<Record<string, StepViewModel>>({});
    protected readonly isAddStepMenuOpen = signal(false);
    private readonly renderer = inject(Renderer2);
    private readonly removeDocumentPointerListener: () => void;

    @ViewChild('addStepMenu')
    private addStepMenu?: ElementRef<HTMLElement>;

    constructor() {
        this.removeDocumentPointerListener = this.renderer.listen('document', 'pointerdown', (event: PointerEvent) => {
            const targetNode = event.target as Node | null;

            if (!targetNode) {
                return;
            }

            if (this.isAddStepMenuOpen()) {
                const addStepMenuElement = this.addStepMenu?.nativeElement;
                if (addStepMenuElement && !addStepMenuElement.contains(targetNode)) {
                    this.isAddStepMenuOpen.set(false);
                }
            }
        });
    }

    protected goBack(): void {
        void this.router.navigate(['/workspace/tasks']);
    }

    protected toggleAddStepMenu(): void {
        this.isAddStepMenuOpen.update((value) => !value);
    }

    protected addPreStep(): void {
        this.addStepByType('pre');
    }

    protected addPostStep(): void {
        this.addStepByType('post');
    }

    protected addStep(): void {
        this.addStepByType('normal');
    }

    protected onHeaderCommand(command: CommandDescriptor): void {
        if (command.id === 'add-step') {
            this.addStep();
            return;
        }

        if (command.id === 'add-pre-step') {
            this.addPreStep();
            return;
        }

        if (command.id === 'add-post-step') {
            this.addPostStep();
        }
    }

    protected saveTaskEditor(): void {
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
        this.isAddStepMenuOpen.set(false);

        if (!createdStepId) {
            return;
        }

        this.collapsedStepIds.update((state) => ({ ...state, [createdStepId]: false }));
    }

    protected submitTaskTitle(value: string): void {
        const taskId = this.taskId();
        const trimmedTitle = value.trim();
        const currentTask = this.task();

        if (!taskId || !trimmedTitle || !currentTask) {
            return;
        }

        this.taskService.updateTask(taskId, trimmedTitle, currentTask.description);
    }

    protected submitTaskDescription(value: string): void {
        const taskId = this.taskId();
        const currentTask = this.task();

        if (!taskId || !currentTask) {
            return;
        }

        this.taskService.updateTask(taskId, currentTask.title, value.trim());
    }

    protected toggleStepCollapse(stepId: string): void {
        this.collapsedStepIds.update((state) => ({
            ...state,
            [stepId]: !(state[stepId] ?? true)
        }));
    }

    protected isStepCollapsed(stepId: string): boolean {
        return this.collapsedStepIds()[stepId] ?? true;
    }

    protected startEditStep(step: TaskStep): void {
        this.editingStepIds.update((state) => ({ ...state, [step.id]: true }));
        this.stepDrafts.update((state) => ({
            ...state,
            [step.id]: {
                title: step.title,
                content: step.content
            }
        }));
    }

    protected cancelEditStep(stepId: string): void {
        this.editingStepIds.update((state) => ({ ...state, [stepId]: false }));
    }

    protected isStepEditing(stepId: string): boolean {
        return this.editingStepIds()[stepId] ?? false;
    }

    protected updateStepDraftTitle(stepId: string, value: string): void {
        this.stepDrafts.update((state) => ({
            ...state,
            [stepId]: {
                title: value,
                content: state[stepId]?.content ?? ''
            }
        }));
    }

    protected updateStepDraftContent(stepId: string, value: string): void {
        this.stepDrafts.update((state) => ({
            ...state,
            [stepId]: {
                title: state[stepId]?.title ?? '',
                content: value
            }
        }));
    }

    protected getStepDraftTitle(step: TaskStep): string {
        return this.stepDrafts()[step.id]?.title ?? step.title;
    }

    protected getStepDraftContent(step: TaskStep): string {
        return this.stepDrafts()[step.id]?.content ?? step.content;
    }

    protected saveStep(stepId: string): void {
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

    protected deleteStep(stepId: string): void {
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

    ngOnDestroy(): void {
        this.removeDocumentPointerListener();
    }
}
