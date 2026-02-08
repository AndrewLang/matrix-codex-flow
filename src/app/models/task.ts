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

export interface StepViewModel {
    title: string;
    content: string;
}

export interface TaskViewModel {
    title: string;
    description: string;
}

export interface TaskTabItem {
    key: TaskFilterTab;
    label: string;
}
