import { Component, computed, signal } from '@angular/core';

import { Task } from '../../models/task';
import { IconComponent } from '../icon/icon.component';
import { TaskListComponent } from './task.list.component';

type TaskFilterTab = 'pending' | 'finished' | 'failed';

interface TaskTabItem {
    key: TaskFilterTab;
    label: string;
}

const INITIAL_TASKS: Task[] = [
    {
        id: 'task-1',
        title: 'Prepare project brief',
        description: 'Compile a comprehensive project brief outlining objectives, scope, and deliverables.',
        steps: [],
        status: 'pending',
        createdAt: Date.now(),
        updatedAt: Date.now()
    },
    {
        id: 'task-2',
        title: 'Build context timeline',
        description: 'Create a chronological timeline of key events and interactions to provide context for the project.',
        steps: [],
        status: 'completed',
        createdAt: Date.now(),
        updatedAt: Date.now()
    },
    {
        id: 'task-3',
        title: 'Validate workflow sync',
        description: 'Ensure that the workflow synchronization mechanism is functioning correctly across all components.',
        steps: [],
        status: 'failed',
        createdAt: Date.now(),
        updatedAt: Date.now()
    }
];

const TASK_TABS: TaskTabItem[] = [
    { key: 'pending', label: 'Pending' },
    { key: 'finished', label: 'Finished' },
    { key: 'failed', label: 'Failed' }
];

@Component({
    selector: 'mtx-tasks',
    templateUrl: 'tasks.component.html',
    imports: [IconComponent, TaskListComponent]
})
export class TasksComponent {
    protected readonly tabs = TASK_TABS;
    protected readonly selectedTab = signal<TaskFilterTab>('pending');
    protected readonly tasks = signal<Task[]>(INITIAL_TASKS);

    protected readonly filteredTasks = computed(() => {
        const selectedTab = this.selectedTab();

        if (selectedTab === 'pending') {
            return this.tasks().filter((task) => task.status === 'pending' || task.status === 'in_progress');
        }

        if (selectedTab === 'finished') {
            return this.tasks().filter((task) => task.status === 'completed');
        }

        return this.tasks().filter((task) => task.status === 'failed');
    });

    protected readonly emptyMessage = computed(() => `No tasks in ${this.selectedTab()}.`);

    protected selectTab(tab: TaskFilterTab): void {
        this.selectedTab.set(tab);
    }

    protected addTask(): void {
        const nextTaskIndex = this.tasks().length + 1;
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

        this.tasks.update((tasks) => [nextTask, ...tasks]);
        this.selectedTab.set('pending');
    }

    protected runTask(taskId: string): void {
        const currentTimestamp = Date.now();

        this.tasks.update((tasks) =>
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
        this.selectedTab.set('pending');
    }

    protected editTask(taskId: string): void {
        const currentTimestamp = Date.now();

        this.tasks.update((tasks) =>
            tasks.map((task) =>
                task.id === taskId
                    ? {
                        ...task,
                        updatedAt: currentTimestamp
                    }
                    : task
            )
        );
    }

    protected deleteTask(taskId: string): void {
        this.tasks.update((tasks) => tasks.filter((task) => task.id !== taskId));
    }
}
