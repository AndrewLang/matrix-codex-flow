import { DatePipe } from '@angular/common';
import { Component, inject, input, OnDestroy, output } from '@angular/core';

import { CommandDescriptor } from '../../models/command';
import { Task } from '../../models/task';
import { ProjectService } from '../../services/project.service';
import { IconComponent } from '../icon/icon.component';

@Component({
    selector: 'mtx-task-list',
    templateUrl: 'task.list.component.html',
    imports: [DatePipe, IconComponent]
})
export class TaskListComponent implements OnDestroy {
    private readonly projectService = inject(ProjectService);
    private readonly savingSubscription = this.projectService.onSaving.subscribe(() => {
        console.log('Project is saving, refreshing task list...');
    });

    readonly tasks = input<Task[]>([]);
    readonly emptyMessage = input<string>('No tasks found.');
    readonly viewTask = output<string>();
    readonly editTask = output<string>();
    readonly runTask = output<string>();
    readonly deleteTask = output<string>();

    readonly taskActions: CommandDescriptor[] = [
        {
            id: 'run-task',
            title: 'Run',
            icon: 'play',
            tag: 'text-green-500 transition hover:bg-emerald-600/30 hover:text-emerald-300',
            action: (taskId: string) => this.runTask.emit(taskId)
        },
        {
            id: 'view-task',
            title: 'View',
            icon: 'eye',
            tag: 'text-indigo-400 transition hover:bg-indigo-600/30 hover:text-indigo-200',
            action: (taskId: string) => this.viewTask.emit(taskId)
        },
        {
            id: 'edit-task',
            title: 'Edit',
            icon: 'pencil',
            tag: 'text-sky-400 transition hover:bg-sky-600/30 hover:text-sky-200',
            action: (taskId: string) => this.editTask.emit(taskId)
        },
        {
            id: 'delete-task',
            title: 'Delete',
            icon: 'trash',
            tag: 'text-rose-400 transition hover:bg-rose-600/30 hover:text-rose-200',
            action: (taskId: string) => this.deleteTask.emit(taskId)
        },
    ];

    ngOnDestroy(): void {
        this.savingSubscription.unsubscribe();
    }

    statusIcon(status: Task['status']): string {
        if (status === 'completed') {
            return 'check-circle text-emerald-400';
        }

        if (status === 'failed') {
            return 'x-circle text-rose-400';
        }

        if (status === 'in_progress') {
            return 'arrow-repeat text-amber-300';
        }

        return 'clock text-slate-300';
    }

    onRunTask(taskId: string): void {
        this.runTask.emit(taskId);
    }

    onEditTask(taskId: string): void {
        this.editTask.emit(taskId);
    }

    onViewTask(taskId: string): void {
        this.viewTask.emit(taskId);
    }

    onDeleteTask(taskId: string): void {
        this.deleteTask.emit(taskId);
    }
}
