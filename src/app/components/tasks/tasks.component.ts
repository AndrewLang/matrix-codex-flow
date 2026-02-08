import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';

import { Task, TaskFilterTab, TaskTabItem } from '../../models/task';
import { TaskService } from '../../services/task.service';
import { IconComponent } from '../icon/icon.component';
import { TaskListComponent } from './task.list.component';

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

    private readonly taskService = inject(TaskService);
    private readonly router = inject(Router);

    protected readonly tasks = this.taskService.tasks;

    protected readonly filteredTasks = computed<Task[]>(() => {
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
        this.taskService.addTask();
        this.selectedTab.set('pending');
    }

    protected runTask(taskId: string): void {
        this.taskService.runTask(taskId);
        this.selectedTab.set('pending');
    }

    protected editTask(taskId: string): void {
        void this.router.navigate(['/workspace/tasks/edit', taskId]);
    }

    protected viewTask(taskId: string): void {
        void this.router.navigate(['/workspace/tasks/view', taskId]);
    }

    protected deleteTask(taskId: string): void {
        this.taskService.deleteTask(taskId);
    }
}
