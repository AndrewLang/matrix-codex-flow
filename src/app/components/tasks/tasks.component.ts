import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';

import { CommandDescriptor } from '../../models/command';
import { Task, TaskFilterTab, TaskTabItem } from '../../models/task';
import { TaskService } from '../../services/task.service';
import { WorkspaceHeaderComponent } from '../workspace/workspace.header.component';
import { TaskListComponent } from './task.list.component';

const TASK_TABS: TaskTabItem[] = [
    { key: 'pending', label: 'Pending' },
    { key: 'finished', label: 'Finished' },
    { key: 'failed', label: 'Failed' }
];

@Component({
    selector: 'mtx-tasks',
    templateUrl: 'tasks.component.html',
    imports: [TaskListComponent, WorkspaceHeaderComponent]
})
export class TasksComponent {
    readonly tabs = TASK_TABS;
    readonly selectedTab = signal<TaskFilterTab>('pending');

    private readonly taskService = inject(TaskService);
    private readonly router = inject(Router);

    readonly tasks = this.taskService.tasks;
    readonly filteredTasks = computed<Task[]>(() => {
        const selectedTab = this.selectedTab();

        if (selectedTab === 'pending') {
            return this.tasks().filter((task) => task.status === 'pending' || task.status === 'in_progress');
        }

        if (selectedTab === 'finished') {
            return this.tasks().filter((task) => task.status === 'completed');
        }

        return this.tasks().filter((task) => task.status === 'failed');
    });

    readonly emptyMessage = computed(() => `No tasks in ${this.selectedTab()}.`);
    readonly headerLeftCommands = computed<CommandDescriptor[]>(() => {
        const selected = this.selectedTab();
        return this.tabs.map((tab) => ({
            id: `filter-${tab.key}`,
            title: tab.label,
            icon: selected === tab.key ? 'check text-xs' : 'text-xs',
            action: () => this.selectedTab.set(tab.key)
        }));
    });
    readonly headerRightCommands = computed<CommandDescriptor[]>(() => {
        return [{ id: 'add-task', title: 'Add Task', icon: 'plus-lg', action: () => this.addTask() }];
    });

    addTask(): void {
        this.taskService.addTask();
        this.selectedTab.set('pending');
    }

    runTask(taskId: string): void {
        this.taskService.runTask(taskId);
        this.selectedTab.set('pending');
    }

    editTask(taskId: string): void {
        void this.router.navigate(['/workspace/tasks/edit', taskId]);
    }

    viewTask(taskId: string): void {
        void this.router.navigate(['/workspace/tasks/view', taskId]);
    }

    deleteTask(taskId: string): void {
        this.taskService.deleteTask(taskId);
    }
}
