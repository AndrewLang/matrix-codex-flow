import { signal } from '@angular/core';
import { IdGenerator } from './id';

export interface AgentRule {
    id: string;
    name: string;
    description?: string;
    createdAt: number;
    updatedAt: number;
}

export class AgentRuleViewModel implements AgentRule {
    id: string = IdGenerator.generateId();
    name: string = '';
    description?: string;
    createdAt: number = Date.now();
    updatedAt: number = Date.now();

    isExpanded = signal<boolean>(false);
    isEditing = signal<boolean>(false);

    constructor(init?: Partial<AgentRule>) {
        Object.assign(this, init);
    }

    toAgentRule(): AgentRule {
        return {
            id: this.id,
            name: this.name,
            description: this.description,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        };
    }
}
