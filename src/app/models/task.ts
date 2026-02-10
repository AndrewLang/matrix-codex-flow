import { signal, WritableSignal } from "@angular/core";
import { IdGenerator } from "./id";


export const TaskStatus = {
    Pending: 'pending',
    InProgress: 'in_progress',
    Completed: 'completed',
    Failed: 'failed',
} as const;
export type TaskStatus = typeof TaskStatus[keyof typeof TaskStatus];

export const TaskStepType = {
    Normal: 'normal',
    Post: 'post',
    Pre: 'pre',
} as const;

export type TaskStepType =
    typeof TaskStepType[keyof typeof TaskStepType];

export const TaskFilterTab = {
    Pending: 'pending',
    Finished: 'finished',
    Failed: 'failed',
} as const;

export type TaskFilterTab =
    typeof TaskFilterTab[keyof typeof TaskFilterTab];

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
    runtimeId: string = IdGenerator.generateId();
    runtimeStatus = signal<TaskStatus>('pending');
    title: string = '';
    content: string = '';
    status: TaskStatus = 'pending';
    createdAt: number = Date.now();
    updatedAt: number = Date.now();
    type: TaskStepType = 'normal';
    isExpanded = signal<boolean>(false);
    isEditing = signal<boolean>(false);
    tag = signal<string>('');
}

export class StepViewModelGroup {
    name: string = '';
    steps: StepViewModel[] = [];
}

export class RuntimeTaskViewModel {
    id: string;
    title: string = '';
    description: string = '';
    task: TaskViewModel;
    steps: StepViewModelGroup[];

    constructor(task: TaskViewModel) {
        this.id = task.id;
        this.title = task.title;
        this.description = task.description;
        this.task = task;

        this.steps = [];
        for (const step of task.steps) {
            let group = new StepViewModelGroup();
            group.name = step.title;
            group.steps.push(...task.presteps.map(TaskStepExtensions.fromTaskStep));
            group.steps.push(TaskStepExtensions.fromTaskStep(step));
            group.steps.push(...task.poststeps.map(TaskStepExtensions.fromTaskStep));
            this.steps.push(group);
        }
    }
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

export const EMPTY_TASK_VIEW_MODEL: TaskViewModel = {
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

export const EMPTY_STEP: StepViewModel = {
    id: '',
    runtimeId: '',
    title: '',
    content: '',
    status: 'pending',
    createdAt: 0,
    updatedAt: 0,
    type: 'normal',
    runtimeStatus: signal<TaskStatus>('pending'),
    isExpanded: signal<boolean>(false),
    isEditing: signal<boolean>(false),
    tag: signal<string>('')
};

export const EMPTY_RUNTIME_TASK = new RuntimeTaskViewModel(EMPTY_TASK_VIEW_MODEL);

export class TaskStepExtensions {
    static fromTaskStep(step: TaskStep): StepViewModel {
        return {
            ...step,
            runtimeId: IdGenerator.generateId(),
            runtimeStatus: signal<TaskStatus>('pending'),
            isExpanded: signal<boolean>(false),
            isEditing: signal<boolean>(false),
            tag: signal<string>('')
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

    static cloneStep(step: TaskStep): StepViewModel {
        return {
            ...step,
            runtimeId: IdGenerator.generateId(),
            createdAt: Date.now(),
            updatedAt: Date.now(),
            runtimeStatus: signal<TaskStatus>('pending'),
            isExpanded: signal<boolean>(false),
            isEditing: signal<boolean>(false),
            tag: signal<string>('')
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

export interface TaskRuntimeData {
    runtimeTask: RuntimeTaskViewModel;
    status: TaskStatus;
}
