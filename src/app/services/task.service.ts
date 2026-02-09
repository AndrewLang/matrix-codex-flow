import { effect, inject, Injectable, signal } from '@angular/core';
import { invoke } from '@tauri-apps/api/core';

import { Task, TaskStep } from '../models/task';
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

    runTask(taskId: string): void {

    }

    async exportTasks(tasks: Task[]): Promise<void> {
        for (const task of tasks) {
            await this.exportTask(task);
        }
    }

    async exportTask(task: Task): Promise<void> {
        const project = this.projectService.currentProject();
        if (!project) {
            return;
        }

        const normalizedProjectPath = project.path.replace(/[\\/]+$/, '');
        const safeTaskName = this.toSafeFileName(task.title || task.id);
        const targetFilePath = `${normalizedProjectPath}/.vibeflow/${safeTaskName}.md`;
        const content = this.toTaskMarkdown(task);

        try {
            await invoke('write_text_file', {
                path: targetFilePath,
                content
            });
        } catch (error) {
            console.error('Failed to export task markdown:', error);
        }
    }

    findTask(taskId: string): Task | undefined {
        return this.tasksState().find((task) => task.id === taskId);
    }

    private toTaskMarkdown(task: Task): string {
        const lines: string[] = [`# ${task.title || 'Task'}`, ''];

        if (task.description?.trim()) {
            lines.push(task.description.trim(), '');
        }

        this.appendStepSection(lines, 'Pre Steps', task.presteps);
        this.appendStepSection(lines, 'Main Steps', task.steps);
        this.appendStepSection(lines, 'Post Steps', task.poststeps);

        return lines.join('\n').trimEnd() + '\n';
    }

    private appendStepSection(lines: string[], title: string, steps: TaskStep[]): void {
        lines.push(`## ${title}`, '');

        if (!steps.length) {
            lines.push('_None_', '');
            return;
        }

        steps.forEach((step, index) => {
            lines.push(`### ${index + 1}. ${step.title || 'Untitled step'}`, '');
            lines.push(step.content?.trim() || '_No content_', '');
        });
    }

    private toSafeFileName(value: string): string {
        const sanitized = value
            .trim()
            .toLowerCase()
            .replace(/[<>:\"/\\|?*\x00-\x1F]/g, ' ')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '');

        return sanitized || 'task';
    }
}
