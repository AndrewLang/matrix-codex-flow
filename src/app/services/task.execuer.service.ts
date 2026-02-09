import { inject, Injectable } from '@angular/core';
import { TaskStatus, TaskStep, TaskViewModel } from '../models/task';
import { ProjectService } from './project.service';

@Injectable({ providedIn: 'root' })
export class TaskExecuteService {
    private readonly projectService = inject(ProjectService);

    async execute(task: TaskViewModel): Promise<void> {
        if (!task?.id) {
            return;
        }

        this.setTaskStatus(task, 'in_progress');
        this.resetStepStatuses(task);
        this.syncTaskToProject(task);

        try {
            let preSteps = task.presteps.map(step => ({ ...step }));
            let mainSteps = task.steps.map(step => ({ ...step }));
            let postSteps = task.poststeps.map(step => ({ ...step }));

            for (let step of task.steps) {
                this.executeSteps(preSteps, 'pre', task);
                this.executeStep(step, 'main', task);
                this.executeSteps(postSteps, 'post', task);
            }


            this.setTaskStatus(task, 'completed');
        } catch (error) {
            this.setTaskStatus(task, 'failed');
            throw error;
        } finally {
            this.syncTaskToProject(task);
            await this.saveCurrentProject();
        }
    }

    private async executeSteps(
        steps: TaskStep[],
        phase: 'pre' | 'post',
        task: TaskViewModel
    ): Promise<void> {
        for (const step of steps) {
            await this.executeStep(step, phase, task);
        }
    }

    private async executeStep(
        step: TaskStep,
        phase: 'pre' | 'main' | 'post',
        task: TaskViewModel
    ): Promise<void> {
        this.setStepStatus(step, 'in_progress');


        console.log(`[TaskExecutor] ${phase}: ${step.title}`);

        this.setStepStatus(step, 'completed');
    }

    private resetStepStatuses(task: TaskViewModel): void {
        const allSteps = [...task.presteps, ...task.steps, ...task.poststeps];

        for (const step of allSteps) {
            this.setStepStatus(step, 'pending');
        }
    }

    private setTaskStatus(task: TaskViewModel, status: TaskStatus): void {
        task.status = status;
        this.touchTask(task);
    }

    private setStepStatus(step: TaskStep, status: TaskStatus): void {
        step.status = status;
        step.updatedAt = Date.now();
    }

    private touchTask(task: TaskViewModel): void {
        task.updatedAt = Date.now();
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
        const project = this.projectService.currentProject();

        if (!project) {
            return;
        }

        await this.projectService.saveProject();
    }
}
