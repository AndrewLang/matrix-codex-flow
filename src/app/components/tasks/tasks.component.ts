import { Component, computed, inject, signal } from '@angular/core';

import { CommandDescriptor } from '../../models/command';
import { ProjectExtensions } from '../../models/project.extensions';
import { Task, TaskExtensions, TaskFilterTab, TaskStatus, TaskTabItem, TaskViewModel } from '../../models/task';
import { DialogService } from '../../services/dialog.service';
import { ProjectService } from '../../services/project.service';
import { TaskService } from '../../services/task.service';
import { WorkspaceHeaderComponent } from '../workspace/workspace.header.component';
import { TaskListComponent } from './task.list.component';

const TASK_TABS: TaskTabItem[] = [
    { key: 'pending', label: 'Pending', tag: '' },
    { key: 'finished', label: 'Finished', tag: '' },
    { key: 'failed', label: 'Failed', tag: '' }
];

@Component({
    selector: 'mtx-tasks',
    templateUrl: 'tasks.component.html',
    imports: [TaskListComponent, WorkspaceHeaderComponent]
})
export class TasksComponent {
    readonly tabs = TASK_TABS;
    readonly selectedTab = signal<TaskFilterTab>('pending');

    private readonly projectService = inject(ProjectService);
    private readonly dialogService = inject(DialogService);
    private readonly taskService = inject(TaskService);

    readonly taskViewModels = computed(() => {
        const project = this.projectService.currentProject();
        return project?.tasks.map(task => {
            let viewModel = TaskExtensions.fromTask(task);
            return viewModel;
        }) ?? [];
    });
    readonly filteredTasks = computed<TaskViewModel[]>(() => {
        const selectedTab = this.selectedTab();

        if (selectedTab === TaskFilterTab.Pending) {
            return this.taskViewModels().filter((task) => task.status === TaskStatus.Pending || task.status === TaskStatus.InProgress);
        }

        if (selectedTab === TaskFilterTab.Finished) {
            return this.taskViewModels().filter((task) => task.status === TaskStatus.Completed);
        }

        return this.taskViewModels().filter((task) => task.status === TaskStatus.Failed);
    });
    readonly emptyMessage = computed(() => `No tasks in ${this.selectedTab()}.`);
    readonly headerLeftCommands = computed<CommandDescriptor[]>(() => {
        const selected = this.selectedTab();
        return this.tabs.map((tab) => ({
            id: `filter-${tab.key}`,
            title: tab.label,
            icon: 'text-xs',
            tag: selected === tab.key ? tab.tag + '  border border-amber-700 shadow-amber-600 shadow-xs' : tab.tag,
            action: () => this.selectedTab.set(tab.key)
        }));
    });
    readonly headerRightCommands = computed<CommandDescriptor[]>(() => {
        return [
            { id: 'add-task', title: 'Add Task', icon: 'plus-lg', action: () => this.addTask() },
            { id: 'export-tasks', title: 'Export', icon: 'box-arrow-down', description: 'Export each task to a markdown file', action: () => { this.exportTasks(); } }
        ];
    });

    addTask(): void {
        const nextTaskIndex = this.taskViewModels().length + 1;
        const nextTask: Task = TaskExtensions.newTask(this.projectService.currentProject()?.id ?? '', nextTaskIndex);

        ProjectExtensions.addTask(this.projectService.currentProject, nextTask);
        this.selectedTab.set('pending');
    }

    async exportTasks(): Promise<void> {
        const tasks = this.taskViewModels();
        await this.taskService.exportTasks(tasks);
    }

    async deleteTask(taskId: string): Promise<void> {
        const task = this.taskViewModels().find((task) => task.id === taskId);
        const taskTitle = task?.title ?? 'this task';
        const isConfirmed = await this.dialogService.openPrompt({
            title: 'Delete Task',
            message: `Delete "${taskTitle}"? This action cannot be undone.`,
            confirmLabel: 'Delete',
            cancelLabel: 'Cancel',
            confirmButtonClass: 'rounded bg-rose-600 px-3 py-1.5 text-xs text-white transition hover:bg-rose-500',
            size: 'sm',
        });

        if (!isConfirmed) {
            return;
        }
        ProjectExtensions.deleteTask(this.projectService.currentProject, taskId);
    }
}
