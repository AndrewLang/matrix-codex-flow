import { DatePipe } from '@angular/common';
import { Component, input, output } from '@angular/core';

import { Task } from '../../models/task';
import { IconComponent } from '../icon/icon.component';

@Component({
    selector: 'mtx-task-list',
    templateUrl: 'task.list.component.html',
    imports: [DatePipe, IconComponent]
})
export class TaskListComponent {
    readonly tasks = input<Task[]>([]);
    readonly emptyMessage = input<string>('No tasks found.');
    readonly editTask = output<string>();
    readonly runTask = output<string>();
    readonly deleteTask = output<string>();

    protected statusIcon(status: Task['status']): string {
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

    protected onRunTask(taskId: string): void {
        this.runTask.emit(taskId);
    }

    protected onEditTask(taskId: string): void {
        this.editTask.emit(taskId);
    }

    protected onDeleteTask(taskId: string): void {
        this.deleteTask.emit(taskId);
    }
}
