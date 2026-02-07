import { DatePipe } from '@angular/common';
import { Component, signal } from '@angular/core';

import { AgentRule } from '../../models/agent.rule';
import { IconComponent } from "../icon/icon.component";

interface AgentRuleDraft {
    name: string;
    description: string;
}

const INITIAL_AGENT_RULES: AgentRule[] = [
    {
        id: 'rule-context',
        name: 'context',
        description: 'Capture and maintain essential project context for agent execution.',
        createdAt: Date.now(),
        updatedAt: Date.now()
    },
    {
        id: 'rule-rules',
        name: 'rules',
        description: 'Define behavioral rules and constraints the agents must always follow.',
        createdAt: Date.now(),
        updatedAt: Date.now()
    }
];

@Component({
    selector: 'mtx-context-manage',
    templateUrl: 'context.component.html',
    imports: [DatePipe, IconComponent]
})
export class ContextComponent {
    protected readonly agentRules = signal<AgentRule[]>(INITIAL_AGENT_RULES);
    protected readonly collapsedRuleIds = signal<Record<string, boolean>>(
        INITIAL_AGENT_RULES.reduce<Record<string, boolean>>((state, rule) => {
            state[rule.id] = true;
            return state;
        }, {})
    );
    protected readonly editingRuleIds = signal<Record<string, boolean>>({});
    protected readonly editDrafts = signal<Record<string, AgentRuleDraft>>({});

    protected addAgentRule(): void {
        const currentTimestamp = Date.now();
        const nextIndex = this.agentRules().length + 1;

        const nextAgentRule: AgentRule = {
            id: `rule-${currentTimestamp}`,
            name: `rule-${nextIndex}`,
            description: `New project rule ${nextIndex}. Update this with specific context guidance.`,
            createdAt: currentTimestamp,
            updatedAt: currentTimestamp
        };

        this.agentRules.update((rules) => [...rules, nextAgentRule]);
        this.collapsedRuleIds.update((state) => ({ ...state, [nextAgentRule.id]: true }));
    }

    protected toggleRuleCollapse(ruleId: string): void {
        this.collapsedRuleIds.update((state) => ({
            ...state,
            [ruleId]: !state[ruleId]
        }));
    }

    protected isRuleCollapsed(ruleId: string): boolean {
        return this.collapsedRuleIds()[ruleId] ?? true;
    }

    protected startEdit(rule: AgentRule): void {
        this.editingRuleIds.update((state) => ({ ...state, [rule.id]: true }));
        this.editDrafts.update((state) => ({
            ...state,
            [rule.id]: {
                name: rule.name,
                description: rule.description ?? ''
            }
        }));
    }

    protected cancelEdit(ruleId: string): void {
        this.editingRuleIds.update((state) => ({ ...state, [ruleId]: false }));
    }

    protected isRuleEditing(ruleId: string): boolean {
        return this.editingRuleIds()[ruleId] ?? false;
    }

    protected updateDraftName(ruleId: string, value: string): void {
        this.editDrafts.update((state) => ({
            ...state,
            [ruleId]: {
                name: value,
                description: state[ruleId]?.description ?? ''
            }
        }));
    }

    protected updateDraftDescription(ruleId: string, value: string): void {
        this.editDrafts.update((state) => ({
            ...state,
            [ruleId]: {
                name: state[ruleId]?.name ?? '',
                description: value
            }
        }));
    }

    protected getDraftName(rule: AgentRule): string {
        return this.editDrafts()[rule.id]?.name ?? rule.name;
    }

    protected getDraftDescription(rule: AgentRule): string {
        return this.editDrafts()[rule.id]?.description ?? (rule.description ?? '');
    }

    protected saveEdit(ruleId: string): void {
        const draft = this.editDrafts()[ruleId];

        if (!draft) {
            return;
        }

        const trimmedName = draft.name.trim();
        const trimmedDescription = draft.description.trim();

        if (!trimmedName) {
            return;
        }

        const currentTimestamp = Date.now();

        this.agentRules.update((rules) =>
            rules.map((rule) =>
                rule.id === ruleId
                    ? {
                        ...rule,
                        name: trimmedName,
                        description: trimmedDescription || undefined,
                        updatedAt: currentTimestamp
                    }
                    : rule
            )
        );

        this.editingRuleIds.update((state) => ({ ...state, [ruleId]: false }));
    }
}
