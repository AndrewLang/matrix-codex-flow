import { Injectable, effect, inject, signal } from '@angular/core';

import { AgentRule } from '../models/agent.rule';
import { ProjectService } from './project.service';

@Injectable({ providedIn: 'root' })
export class ContextService {
    private readonly projectService = inject(ProjectService);
    private readonly agentRulesState = signal<AgentRule[]>([]);

    readonly agentRules = this.agentRulesState.asReadonly();

    constructor() {
        effect(() => {
            const project = this.projectService.currentProject();
            this.agentRulesState.set(project?.rules.map((rule) => ({ ...rule })) ?? []);
        });
    }

    addRule(rule: AgentRule): void {
        this.agentRulesState.update((rules) => [...rules, rule]);
        this.syncCurrentProjectRules();
    }

    updateRule(ruleId: string, name: string, description: string | undefined, updatedAt: number): void {
        this.agentRulesState.update((rules) =>
            rules.map((rule) =>
                rule.id === ruleId
                    ? {
                        ...rule,
                        name,
                        description,
                        updatedAt
                    }
                    : rule
            )
        );
        this.syncCurrentProjectRules();
    }

    deleteRule(ruleId: string): void {
        this.agentRulesState.update((rules) => rules.filter((rule) => rule.id !== ruleId));
        this.syncCurrentProjectRules();
    }

    private syncCurrentProjectRules(): void {
        this.projectService.currentProject.update((project) =>
            project
                ? {
                    ...project,
                    rules: this.agentRulesState().map((rule) => ({ ...rule })),
                    updatedAt: Date.now()
                }
                : project
        );
    }
}
