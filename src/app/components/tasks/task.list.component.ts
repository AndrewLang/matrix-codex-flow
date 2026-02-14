import { DatePipe } from '@angular/common';
import { Component, inject, input, OnDestroy, output } from '@angular/core';

import { Router } from '@angular/router';
import { CommandDescriptor } from '../../models/command';
import { Task, TaskStatus } from '../../models/task';
import { ProjectService } from '../../services/project.service';
import { TaskExecuteService } from '../../services/task.execuer.service';
import { IconComponent } from '../icon/icon.component';

@Component({
    selector: 'mtx-task-list',
    templateUrl: 'task.list.component.html',
    imports: [DatePipe, IconComponent]
})
export class TaskListComponent implements OnDestroy {
    private readonly projectService = inject(ProjectService);
    private readonly router = inject(Router);
    private readonly taskExecuteService = inject(TaskExecuteService);

    private readonly savingSubscription = this.projectService.onSaving.subscribe(() => {
        console.log('Project is saving, refreshing task list...');
    });

    readonly tasks = input<Task[]>([]);
    readonly emptyMessage = input<string>('No tasks found.');
    readonly deleteTask = output<string>();

    readonly taskActions: CommandDescriptor[] = [
        {
            id: 'run-task',
            title: 'Run',
            icon: 'play',
            tag: 'text-green-500 transition hover:bg-emerald-600/30 hover:text-emerald-300',
            action: (taskId: string) => this.onRunTask(taskId)
        },
        {
            id: 'view-task',
            title: 'View',
            icon: 'eye',
            tag: 'text-indigo-400 transition hover:bg-indigo-600/30 hover:text-indigo-200',
            action: (taskId: string) => this.onViewTask(taskId)
        },
        {
            id: 'edit-task',
            title: 'Edit',
            icon: 'pencil',
            tag: 'text-sky-400 transition hover:bg-sky-600/30 hover:text-sky-200',
            action: (taskId: string) => this.onEditTask(taskId)
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
        if (status === TaskStatus.Completed) {
            return 'check-circle text-emerald-400';
        }

        if (status === TaskStatus.Failed) {
            return 'x-circle text-rose-400';
        }

        if (status === TaskStatus.InProgress) {
            return 'arrow-repeat text-amber-300';
        }

        return 'clock text-slate-300';
    }

    onRunTask(taskId: string): void {
        const task = this.tasks().find((t) => t.id === taskId);
        if (task) {
            this.taskExecuteService.execute(task);
        }
    }

    onEditTask(taskId: string): void {
        this.router.navigate(['/app/workspace/tasks/edit', taskId]);
    }

    onViewTask(taskId: string): void {
        this.router.navigate(['/app/workspace/tasks/view', taskId]);
    }

    onDeleteTask(taskId: string): void {
        this.deleteTask.emit(taskId);
    }
}
