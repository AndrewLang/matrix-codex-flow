import { signal } from "@angular/core";
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
}



export interface TaskTabItem {
    key: TaskFilterTab;
    label: string;
}
