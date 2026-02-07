import { Injectable, signal } from '@angular/core';

import { Task, TaskStep } from '../models/task';

const INITIAL_TASKS: Task[] = [
    {
        id: 'task-1',
        title: 'Prepare project brief',
        description: 'Compile a comprehensive project brief outlining objectives, scope, and deliverables.',
        steps: [
            {
                id: 'task-1-step-1',
                title: 'Collect requirements',
                content: '- Gather core requirements\n- Validate stakeholder expectations',
                status: 'pending',
                type: 'normal',
                createdAt: Date.now(),
                updatedAt: Date.now()
            },
            {
                id: 'task-1-step-2',
                title: 'Draft brief',
                content: 'Write the initial project brief with scope, timeline, and risks.',
                status: 'pending',
                type: 'normal',
                createdAt: Date.now(),
                updatedAt: Date.now()
            }
        ],
        status: 'pending',
        createdAt: Date.now(),
        updatedAt: Date.now()
    },
    {
        id: 'task-2',
        title: 'Build context timeline',
        description: 'Create a chronological timeline of key events and interactions to provide context for the project.',
        steps: [
            {
                id: 'task-2-step-1',
                title: 'Import events',
                content: 'Load milestones and normalize timestamps.',
                status: 'completed',
                type: 'normal',
                createdAt: Date.now(),
                updatedAt: Date.now()
            }
        ],
        status: 'completed',
        createdAt: Date.now(),
        updatedAt: Date.now()
    },
    {
        id: 'task-3',
        title: 'Validate workflow sync',
        description: 'Ensure that the workflow synchronization mechanism is functioning correctly across all components.',
        steps: [
            {
                id: 'task-3-step-1',
                title: 'Run integration check',
                content: 'Execute sync checks across chat, context, and tasks.',
                status: 'failed',
                type: 'normal',
                createdAt: Date.now(),
                updatedAt: Date.now()
            }
        ],
        status: 'failed',
        createdAt: Date.now(),
        updatedAt: Date.now()
    }
];

@Injectable({ providedIn: 'root' })
export class TaskService {
    private readonly tasksState = signal<Task[]>(INITIAL_TASKS);

    readonly tasks = this.tasksState.asReadonly();

    addTask(): void {
        const nextTaskIndex = this.tasksState().length + 1;
        const currentTimestamp = Date.now();

        const nextTask: Task = {
            id: `task-${currentTimestamp}`,
            title: `New Task ${nextTaskIndex}`,
            description: 'Task description goes here.',
            steps: [],
            status: 'pending',
            createdAt: currentTimestamp,
            updatedAt: currentTimestamp
        };

        this.tasksState.update((tasks) => [nextTask, ...tasks]);
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
    }

    deleteTask(taskId: string): void {
        this.tasksState.update((tasks) => tasks.filter((task) => task.id !== taskId));
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
    }

    findTask(taskId: string): Task | undefined {
        return this.tasksState().find((task) => task.id === taskId);
    }

    addStep(taskId: string): void {
        const currentTimestamp = Date.now();

        this.tasksState.update((tasks) =>
            tasks.map((task) => {
                if (task.id !== taskId) {
                    return task;
                }

                const nextStepIndex = task.steps.length + 1;
                const nextStep: TaskStep = {
                    id: `${taskId}-step-${currentTimestamp}`,
                    title: `Step ${nextStepIndex}`,
                    content: 'Describe the step details in markdown.',
                    status: 'pending',
                    type: 'normal',
                    createdAt: currentTimestamp,
                    updatedAt: currentTimestamp
                };

                return {
                    ...task,
                    steps: [...task.steps, nextStep],
                    updatedAt: currentTimestamp
                };
            })
        );
    }

    updateStep(taskId: string, stepId: string, title: string, content: string): void {
        const currentTimestamp = Date.now();

        this.tasksState.update((tasks) =>
            tasks.map((task) => {
                if (task.id !== taskId) {
                    return task;
                }

                return {
                    ...task,
                    steps: task.steps.map((step) =>
                        step.id === stepId
                            ? {
                                ...step,
                                title,
                                content,
                                updatedAt: currentTimestamp
                            }
                            : step
                    ),
                    updatedAt: currentTimestamp
                };
            })
        );
    }

    deleteStep(taskId: string, stepId: string): void {
        const currentTimestamp = Date.now();

        this.tasksState.update((tasks) =>
            tasks.map((task) => {
                if (task.id !== taskId) {
                    return task;
                }

                return {
                    ...task,
                    steps: task.steps.filter((step) => step.id !== stepId),
                    updatedAt: currentTimestamp
                };
            })
        );
    }
}
