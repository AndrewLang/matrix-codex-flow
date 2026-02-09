import { signal, WritableSignal } from "@angular/core";
import { IdGenerator } from "./id";
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'failed';
export type TaskStepType = 'normal' | 'post' | 'pre';
export type TaskFilterTab = 'pending' | 'finished' | 'failed';

export interface Task {
    id: string;
    projectId: string;
    title: string;
    description: string;
    steps: TaskStep[];
    presteps: TaskStep[];
    poststeps: TaskStep[];
    status: TaskStatus;
    createdAt: number;
    updatedAt: number;
}

export interface TaskStep {
    id: string;
    title: string;
    content: string;
    status: TaskStatus;
    createdAt: number;
    updatedAt: number;
    type: TaskStepType;
}

export class StepViewModel implements TaskStep {
    id: string = IdGenerator.generateId();
    title: string = '';
    content: string = '';
    status: TaskStatus = 'pending';
    createdAt: number = Date.now();
    updatedAt: number = Date.now();
    type: TaskStepType = 'normal';
    isExpanded = signal<boolean>(false);
    isEditing = signal<boolean>(false);
}

export const EMPTY_STEP: StepViewModel = {
    id: '',
    title: '',
    content: '',
    status: 'pending',
    createdAt: 0,
    updatedAt: 0,
    type: 'normal',
    isExpanded: signal<boolean>(false),
    isEditing: signal<boolean>(false)
};

export class TaskStepExtensions {
    static fromTaskStep(step: TaskStep): StepViewModel {
        return {
            ...step,
            isExpanded: signal<boolean>(false),
            isEditing: signal<boolean>(false)
        };
    }

    static toTaskStep(stepViewModel: StepViewModel): TaskStep {
        return {
            id: stepViewModel.id,
            title: stepViewModel.title,
            content: stepViewModel.content,
            status: stepViewModel.status,
            createdAt: stepViewModel.createdAt,
            updatedAt: stepViewModel.updatedAt,
            type: stepViewModel.type
        };
    }

    static toViewModels(steps: TaskStep[]): StepViewModel[] {
        if (!steps) {
            return [];
        }

        return steps.map(TaskStepExtensions.fromTaskStep);
    }

    static toSteps(stepViewModels: StepViewModel[]): TaskStep[] {
        return stepViewModels.map(TaskStepExtensions.toTaskStep);
    }
}

export class TaskViewModel implements Task {
    id: string = IdGenerator.generateId();
    projectId: string = '';
    title: string = '';
    description: string = '';
    steps: TaskStep[] = [];
    presteps: TaskStep[] = [];
    poststeps: TaskStep[] = [];
    status: TaskStatus = 'pending';
    createdAt: number = Date.now();
    updatedAt: number = Date.now();
}

export const EMPTY_TASK: Task = {
    id: '',
    projectId: '',
    title: '',
    description: '',
    steps: [],
    presteps: [],
    poststeps: [],
    status: 'pending',
    createdAt: 0,
    updatedAt: 0,
};

export class TaskExtensions {
    static fromTask(task: Task): TaskViewModel {
        return {
            ...task,
            steps: task.steps.map(TaskStepExtensions.fromTaskStep),
            presteps: task.presteps.map(TaskStepExtensions.fromTaskStep),
            poststeps: task.poststeps.map(TaskStepExtensions.fromTaskStep)
        };
    }

    static toTask(taskViewModel: TaskViewModel): Task {
        return {
            ...taskViewModel,
            steps: taskViewModel.steps.map(x => x),
            presteps: taskViewModel.presteps.map(x => x),
            poststeps: taskViewModel.poststeps.map(x => x)
        };
    }

    static newTask(projectId: string, index: number): Task {
        const currentTimestamp = Date.now();
        return {
            id: `task-${currentTimestamp}`,
            projectId: projectId,
            title: `New Task ${index}`,
            description: 'Task description goes here.',
            steps: [],
            presteps: [],
            poststeps: [],
            status: 'pending',
            createdAt: currentTimestamp,
            updatedAt: currentTimestamp
        };
    }



    static addStep(task: WritableSignal<TaskViewModel>, index: number, template: string, stepType: TaskStepType) {
        const now = Date.now();
        const title = `${stepType === 'pre' ? 'Pre-Step' : stepType === 'post' ? 'Post-Step' : 'Step'} ${index}`;
        const newStep: TaskStep = {
            id: IdGenerator.generateId(),
            title: title,
            content: template,
            status: 'pending',
            createdAt: now,
            updatedAt: now,
            type: stepType
        };

        switch (stepType) {
            case 'pre':
                task().presteps.push(newStep);
                break;
            case 'post':
                task().poststeps.push(newStep);
                break;
            default:
                task().steps.push(newStep);
                break;
        }
        task.update(t => ({
            ...t,
            updatedAt: now
        }));
    }

    static updateStep(task: WritableSignal<TaskViewModel>, updatedStep: TaskStep): void {
        const now = Date.now();
        if (updatedStep.type === 'pre') {
            task().presteps = task().presteps.map((step) =>
                step.id === updatedStep.id
                    ? { ...step, ...updatedStep, updatedAt: now }
                    : step
            );
        } else if (updatedStep.type === 'post') {
            task().poststeps = task().poststeps.map((step) =>
                step.id === updatedStep.id
                    ? { ...step, ...updatedStep, updatedAt: now }
                    : step
            );
        } else {
            task().steps = task().steps.map((step) =>
                step.id === updatedStep.id
                    ? { ...step, ...updatedStep, updatedAt: now }
                    : step
            );
        }
        task.update(t => ({
            ...t,
            updatedAt: now
        }));
    }

    static deleteStep(task: WritableSignal<TaskViewModel>, step: TaskStep): void {
        if (step.type === 'pre') {
            task().presteps = task().presteps.filter((s) => s.id !== step.id);
        } else if (step.type === 'post') {
            task().poststeps = task().poststeps.filter((s) => s.id !== step.id);
        } else {
            task().steps = task().steps.filter((s) => s.id !== step.id);
        }

        task.update(t => ({
            ...t,
            updatedAt: Date.now()
        }));
    }
}

export interface TaskTabItem {
    key: TaskFilterTab;
    label: string;
}
