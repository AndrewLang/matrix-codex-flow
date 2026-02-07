import { DatePipe } from '@angular/common';
import { Component, computed, ElementRef, inject, OnDestroy, OnInit, Renderer2, signal, ViewChild } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { map } from 'rxjs';

import { TaskStep } from '../../models/task';
import { TaskService } from '../../services/task.service';
import { IconComponent } from '../icon/icon.component';
import { MarkdownEditorComponent } from '../md-editor/md.editor.component';
import { MarkdownRendererComponent } from '../md-renderer/md.renderer.component';

interface StepDraft {
    title: string;
    content: string;
}

interface TaskDraft {
    title: string;
    description: string;
}

@Component({
    selector: 'mtx-task-editor',
    templateUrl: 'task.edit.component.html',
    imports: [DatePipe, IconComponent, MarkdownEditorComponent, MarkdownRendererComponent]
})
export class TaskEditComponent implements OnDestroy, OnInit {
    private readonly taskService = inject(TaskService);
    private readonly route = inject(ActivatedRoute);
    private readonly router = inject(Router);

    private readonly taskId = toSignal(
        this.route.paramMap.pipe(map((params) => params.get('taskId') ?? '')),
        { initialValue: '' }
    );

    protected readonly task = computed(() => this.taskService.findTask(this.taskId()));

    protected readonly collapsedStepIds = signal<Record<string, boolean>>({});
    protected readonly editingStepIds = signal<Record<string, boolean>>({});
    protected readonly stepDrafts = signal<Record<string, StepDraft>>({});
    protected readonly isEditingTaskTitle = signal(false);
    protected readonly isEditingTaskDescription = signal(false);
    protected readonly taskDraft = signal<TaskDraft>({ title: '', description: '' });
    private readonly renderer = inject(Renderer2);
    private readonly removeDocumentPointerListener: () => void;

    @ViewChild('taskTitleEditor')
    private taskTitleEditor?: ElementRef<HTMLElement>;

    @ViewChild('taskDescriptionEditor')
    private taskDescriptionEditor?: ElementRef<HTMLElement>;

    constructor() {
        this.removeDocumentPointerListener = this.renderer.listen('document', 'pointerdown', (event: PointerEvent) => {
            const targetNode = event.target as Node | null;

            if (!targetNode) {
                return;
            }

            if (this.isEditingTaskTitle()) {
                const titleEditorElement = this.taskTitleEditor?.nativeElement;
                if (titleEditorElement && !titleEditorElement.contains(targetNode)) {
                    this.onTaskTitleFocusOut();
                }
            }

            if (this.isEditingTaskDescription()) {
                const descriptionEditorElement = this.taskDescriptionEditor?.nativeElement;
                if (descriptionEditorElement && !descriptionEditorElement.contains(targetNode)) {
                    this.onTaskDescriptionFocusOut();
                }
            }
        });
    }

    protected goBack(): void {
        void this.router.navigate(['/workspace/tasks']);
    }

    protected addStep(): void {
        const taskId = this.taskId();

        if (!taskId) {
            return;
        }

        this.taskService.addStep(taskId);

        const latestTask = this.task();
        const latestStep = latestTask?.steps[latestTask.steps.length - 1];

        if (!latestStep) {
            return;
        }

        this.collapsedStepIds.update((state) => ({ ...state, [latestStep.id]: false }));
    }

    protected startEditTaskTitle(): void {
        const currentTask = this.task();

        if (!currentTask) {
            return;
        }

        this.taskDraft.set({
            title: currentTask.title,
            description: currentTask.description
        });
        this.isEditingTaskTitle.set(true);
    }

    protected startEditTaskDescription(): void {
        const currentTask = this.task();

        if (!currentTask) {
            return;
        }

        this.taskDraft.set({
            title: currentTask.title,
            description: currentTask.description
        });
        this.isEditingTaskDescription.set(true);
    }

    protected updateTaskDraftTitle(value: string): void {
        this.taskDraft.update((draft) => ({
            ...draft,
            title: value
        }));
    }

    protected updateTaskDraftDescription(value: string): void {
        this.taskDraft.update((draft) => ({
            ...draft,
            description: value
        }));
    }

    protected saveTaskTitle(): void {
        const taskId = this.taskId();
        const draft = this.taskDraft();
        const trimmedTitle = draft.title.trim();
        const currentTask = this.task();

        if (!taskId || !trimmedTitle || !currentTask) {
            return;
        }

        this.taskService.updateTask(taskId, trimmedTitle, currentTask.description);
        this.isEditingTaskTitle.set(false);
    }

    protected saveTaskDescription(): void {
        const taskId = this.taskId();
        const draft = this.taskDraft();
        const currentTask = this.task();

        if (!taskId || !currentTask) {
            return;
        }

        this.taskService.updateTask(taskId, currentTask.title, draft.description.trim());
        this.isEditingTaskDescription.set(false);
    }

    protected onTaskTitleFocusOut(): void {
        this.saveTaskTitle();
    }

    protected onTaskDescriptionFocusOut(): void {
        this.saveTaskDescription();
    }

    protected toggleStepCollapse(stepId: string): void {
        this.collapsedStepIds.update((state) => ({
            ...state,
            [stepId]: !state[stepId]
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

    ngOnInit(): void {
    }
}
