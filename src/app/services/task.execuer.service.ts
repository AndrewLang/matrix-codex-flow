import { inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { RuntimeTaskViewModel, StepViewModel, StepViewModelGroup, TaskRuntimeData, TaskStatus, TaskViewModel } from '../models/task';
import { ChatService } from './chat.service';
import { ProjectService } from './project.service';

@Injectable({ providedIn: 'root' })
export class TaskExecuteService {
    private readonly projectService = inject(ProjectService);
    private readonly router = inject(Router);
    private readonly chatService = inject(ChatService);

    private readonly runTaskSubject = new Subject<TaskRuntimeData>();
    readonly onRunTask = this.runTaskSubject.asObservable();
    readonly currentTask = signal<TaskViewModel | null>(null);
    readonly runtimeTask = signal<RuntimeTaskViewModel | null>(null);

    async execute(task: TaskViewModel): Promise<void> {
        if (!task?.id) {
            return;
        }

        let runtimeTask = await this.prepareExecute(task);

        try {
            for (const stepGroup of runtimeTask.steps) {
                await this.executeStepGroup(stepGroup, task);
            }

            this.updateTaskStatus(task, TaskStatus.Completed);
        } catch (error) {
            this.updateTaskStatus(task, TaskStatus.Failed);
            throw error;
        } finally {
            this.syncTaskToProject(task);
            this.runTaskSubject.next({
                runtimeTask: runtimeTask,
                status: runtimeTask.task.status || TaskStatus.Pending
            });

            await this.saveCurrentProject();
        }
    }

    private async prepareExecute(task: TaskViewModel) {
        this.router.navigate(['/workspace/chat']);
        await this.delay(1000);

        let runtimeTask = new RuntimeTaskViewModel(task);
        this.runtimeTask.set(runtimeTask);

        this.updateTaskStatus(task, TaskStatus.InProgress);
        this.resetStepStatuses(runtimeTask);

        this.runTaskSubject.next({
            runtimeTask,
            status: TaskStatus.InProgress
        });
        return runtimeTask;
    }

    private async executeStepGroup(stepGroup: StepViewModelGroup, task: TaskViewModel): Promise<void> {
        for (const step of stepGroup.steps) {
            await this.executeStep(step);
        }
    }

    private async executeStep(
        step: StepViewModel
    ): Promise<void> {
        this.updateStepStatus(step, TaskStatus.InProgress);

        let prompt = step.content;
        await this.chatService.chat(prompt);

        this.updateStepStatus(step, TaskStatus.Completed);
    }

    private resetStepStatuses(task: RuntimeTaskViewModel): void {
        for (const stepGroup of task.steps) {
            for (const step of stepGroup.steps) {
                this.updateStepStatus(step, TaskStatus.Pending);
            }
        }
    }

    private updateTaskStatus(task: TaskViewModel, status: TaskStatus): void {
        task.status = status;
        task.updatedAt = Date.now();
    }

    private updateStepStatus(step: StepViewModel, status: TaskStatus): void {
        step.status = status;
        step.runtimeStatus.set(status);
        step.updatedAt = Date.now();
    }

    private syncTaskToProject(task: TaskViewModel): void {
        this.projectService.currentProject.update((project) => {
            if (!project) {
                return project;
            }

            return {
                ...project,
                tasks: project.tasks.map((existingTask) =>
                    existingTask.id === task.id
                        ? {
                            ...task,
                            presteps: task.presteps.map((step) => ({ ...step })),
                            steps: task.steps.map((step) => ({ ...step })),
                            poststeps: task.poststeps.map((step) => ({ ...step }))
                        }
                        : existingTask
                ),
                updatedAt: Date.now()
            };
        });
    }

    private async saveCurrentProject(): Promise<void> {
        await this.projectService.saveProject();
    }

    private async delay(ms: number = 1000): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
}
