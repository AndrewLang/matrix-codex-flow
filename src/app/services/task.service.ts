import { effect, Injectable, inject, signal } from '@angular/core';

import { Task, TaskStep, TaskStepType } from '../models/task';
import { ProjectService } from './project.service';

@Injectable({ providedIn: 'root' })
export class TaskService {
    private readonly projectService = inject(ProjectService);
    private readonly tasksState = signal<Task[]>([]);

    readonly tasks = this.tasksState.asReadonly();

    constructor() {
        effect(() => {
            const project = this.projectService.currentProject();
            this.tasksState.set(project?.tasks.map((task) => ({ ...task })) ?? []);
        });
    }

    addTask(): void {
        const nextTaskIndex = this.tasksState().length + 1;
        const currentTimestamp = Date.now();

        const nextTask: Task = {
            id: `task-${currentTimestamp}`,
            projectId: this.projectService.currentProject()?.id ?? '',
            title: `New Task ${nextTaskIndex}`,
            description: 'Task description goes here.',
            steps: [],
            presteps: [],
            poststeps: [],
            status: 'pending',
            createdAt: currentTimestamp,
            updatedAt: currentTimestamp
        };

        this.tasksState.update((tasks) => [nextTask, ...tasks]);
        this.syncCurrentProjectTasks();
    }

    runTask(taskId: string): void {
        const currentTimestamp = Date.now();

        this.tasksState.update((tasks) =>
            tasks.map((task) =>
                task.id === taskId
                    ? {
                        ...task,
                        status: 'in_progress',
                        updatedAt: currentTimestamp
                    }
                    : task
            )
        );
        this.syncCurrentProjectTasks();
    }

    deleteTask(taskId: string): void {
        this.tasksState.update((tasks) => tasks.filter((task) => task.id !== taskId));
        this.syncCurrentProjectTasks();
    }

    updateTask(taskId: string, title: string, description: string): void {
        const currentTimestamp = Date.now();

        this.tasksState.update((tasks) =>
            tasks.map((task) =>
                task.id === taskId
                    ? {
                        ...task,
                        title,
                        description,
                        updatedAt: currentTimestamp
                    }
                    : task
            )
        );
        this.syncCurrentProjectTasks();
    }

    findTask(taskId: string): Task | undefined {
        return this.tasksState().find((task) => task.id === taskId);
    }

    addStep(taskId: string, stepType: TaskStepType = 'normal'): string | undefined {
        const currentTimestamp = Date.now();
        let createdStepId: string | undefined;

        this.tasksState.update((tasks) =>
            tasks.map((task) => {
                if (task.id !== taskId) {
                    return task;
                }

                const targetSteps =
                    stepType === 'pre'
                        ? task.presteps
                        : stepType === 'post'
                            ? task.poststeps
                            : task.steps;
                const nextStepIndex = targetSteps.length + 1;
                const nextStep: TaskStep = {
                    id: `${taskId}-step-${currentTimestamp}`,
                    title: `${stepType === 'pre' ? 'Pre-Step' : stepType === 'post' ? 'Post-Step' : 'Step'} ${nextStepIndex}`,
                    content: 'Describe the step details in markdown.',
                    status: 'pending',
                    type: stepType,
                    createdAt: currentTimestamp,
                    updatedAt: currentTimestamp
                };
                createdStepId = nextStep.id;

                return {
                    ...task,
                    presteps: stepType === 'pre' ? [...task.presteps, nextStep] : task.presteps,
                    poststeps: stepType === 'post' ? [...task.poststeps, nextStep] : task.poststeps,
                    steps: stepType === 'normal' ? [...task.steps, nextStep] : task.steps,
                    updatedAt: currentTimestamp
                };
            })
        );
        this.syncCurrentProjectTasks();

        return createdStepId;
    }

    updateStep(taskId: string, stepId: string, title: string, content: string): void {
        const currentTimestamp = Date.now();
        const updateStepCollection = (steps: TaskStep[]): TaskStep[] =>
            steps.map((step) =>
                step.id === stepId
                    ? {
                        ...step,
                        title,
                        content,
                        updatedAt: currentTimestamp
                    }
                    : step
            );

        this.tasksState.update((tasks) =>
            tasks.map((task) => {
                if (task.id !== taskId) {
                    return task;
                }

                return {
                    ...task,
                    presteps: updateStepCollection(task.presteps),
                    poststeps: updateStepCollection(task.poststeps),
                    steps: updateStepCollection(task.steps),
                    updatedAt: currentTimestamp
                };
            })
        );
        this.syncCurrentProjectTasks();
    }

    deleteStep(taskId: string, stepId: string): void {
        const currentTimestamp = Date.now();
        const filterStepCollection = (steps: TaskStep[]): TaskStep[] => steps.filter((step) => step.id !== stepId);

        this.tasksState.update((tasks) =>
            tasks.map((task) => {
                if (task.id !== taskId) {
                    return task;
                }

                return {
                    ...task,
                    presteps: filterStepCollection(task.presteps),
                    poststeps: filterStepCollection(task.poststeps),
                    steps: filterStepCollection(task.steps),
                    updatedAt: currentTimestamp
                };
            })
        );
        this.syncCurrentProjectTasks();
    }

    private syncCurrentProjectTasks(): void {
        this.projectService.currentProject.update((project) =>
            project
                ? {
                    ...project,
                    tasks: this.tasksState().map((task) => ({ ...task })),
                    updatedAt: Date.now()
                }
                : project
        );
    }
}
