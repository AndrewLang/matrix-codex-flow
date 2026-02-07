export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'failed';
export type TaskStepType = 'normal' | 'post' | 'pre';

export interface Task {
    id: string;
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