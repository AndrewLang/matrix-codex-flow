import { Component, computed, effect, inject, OnDestroy, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { map } from 'rxjs';

import { CommandDescriptor } from '../../models/command';
import { ProjectExtensions } from '../../models/project.extensions';
import { EMPTY_TASK, TaskExtensions, TaskStepExtensions, TaskStepType, TaskViewModel } from '../../models/task';
import { ProjectService } from '../../services/project.service';
import { SettingService } from '../../services/setting.service';
import { TaskService } from '../../services/task.service';
import { InputEditableComponent } from '../input-editable/input.editable.component';
import { WorkspaceHeaderComponent } from '../workspace/workspace.header.component';
import { StepListComponent } from './step.list.component';

@Component({
    selector: 'mtx-task-editor',
    templateUrl: 'task.edit.component.html',
    imports: [StepListComponent, InputEditableComponent, WorkspaceHeaderComponent]
})
export class TaskEditComponent implements OnDestroy {
    private readonly projectService = inject(ProjectService);
    private readonly settingService = inject(SettingService);
    private readonly tasksService = inject(TaskService);
    private readonly route = inject(ActivatedRoute);
    private readonly router = inject(Router);

    private savingSubscription = this.projectService.onSaving.subscribe(() => {
        console.log('Project is saving, saving current task...');
        let project = this.projectService.currentProject;

        ProjectExtensions.updateTask(project, this.editableTask());
        console.log('Update project with task', project());
    });
    private readonly taskId = toSignal(
        this.route.paramMap.pipe(map((params) => params.get('taskId') ?? '')),
        { initialValue: '' }
    );

    readonly enableReorder = signal(false);
    readonly task = computed(() => {
        let tasks = this.projectService.currentProject()?.tasks ?? [];
        return tasks.find((task) => task.id === this.taskId()) || EMPTY_TASK;
    });
    readonly editableTask = signal<TaskViewModel>(EMPTY_TASK);
    readonly preSteps = computed(() => {
        return TaskStepExtensions.toViewModels(this.editableTask().presteps);
    });
    readonly mainSteps = computed(() => {
        return TaskStepExtensions.toViewModels(this.editableTask().steps);
    });
    readonly postSteps = computed(() => {
        return TaskStepExtensions.toViewModels(this.editableTask().poststeps);
    });
    readonly headerRightCommands = computed<CommandDescriptor[]>(() => {
        return [
            {
                id: 'add-step',
                title: 'Add Step',
                description: 'Add a new main step to this task',
                icon: 'plus-lg',
                subCommands: [
                    { id: 'add-pre-step', title: 'Add PreStep', action: () => { this.addStepByType('pre') } },
                    { id: 'add-post-step', title: 'Add PostStep', action: () => { this.addStepByType('post') } },
                ],
                action: () => { this.addStepByType('normal') }
            },
            {
                id: 'run-task',
                title: '',
                icon: 'play',
                tag: 'text-green-500',
                description: 'Run this task',
                action: () => this.export()
            },
            {
                id: 'export-task',
                title: '',
                description: 'Export this task to a markdown file',
                icon: 'box-arrow-down',
                action: () => this.export()
            },
            {
                id: 'enable-reorder',
                title: '',
                icon: 'arrow-down-up',
                tag: this.enableReorder() ? 'text-emerald-500' : 'text-slate-400',
                description: 'Enable reorder steps by drag and drop',
                action: () => { this.enableReorder.update((value) => !value); }
            }
        ];
    });
    readonly headerLeftCommands = computed<CommandDescriptor[]>(() => {
        return [{
            id: 'go-back',
            title: '',
            icon: 'arrow-left',
            action: () => { this.router.navigate(['/workspace/tasks']); }
        }];
    });

    constructor() {
        effect(() => {
            const task = this.task();
            if (task) {
                this.editableTask.set(TaskExtensions.fromTask(task));
            }
        });
    }

    ngOnDestroy(): void {
        this.savingSubscription.unsubscribe();
    }

    async export(): Promise<void> {
        const task = this.editableTask();

        await this.tasksService.exportTask(task);
    }

    submitTaskTitle(value: string): void {
        const trimmedTitle = value.trim();
        if (!trimmedTitle) {
            return;
        }

        this.editableTask.update(t => ({
            ...t,
            title: trimmedTitle
        }));
    }

    submitTaskDescription(value: string): void {
        const trimmedDescription = value.trim();
        if (!trimmedDescription) {
            return;
        }

        this.editableTask.update(t => ({
            ...t,
            description: trimmedDescription
        }));
    }

    private addStepByType(stepType: TaskStepType): void {
        const taskId = this.taskId();
        if (!taskId) {
            return;
        }
        const template = this.settingService.promptTemplate();

        TaskExtensions.addStep(this.editableTask, this.editableTask().steps.length + 1, template, stepType);
    }
}
