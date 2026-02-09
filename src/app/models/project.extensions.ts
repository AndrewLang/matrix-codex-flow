import { WritableSignal } from '@angular/core';
import { AgentRule } from './agent.rule';
import { Project } from './project';

export class ProjectExtensions {
    static addRule(project: WritableSignal<Project>, rule: AgentRule): WritableSignal<Project> {
        project.update(p => ({
            ...p,
            rules: [...p.rules, rule],
            updatedAt: Date.now()
        }));
        return project;
    }

    static updateRule(project: WritableSignal<Project>, updatedRule: AgentRule): WritableSignal<Project> {
        project.update(p => ({
            ...p,
            rules: p.rules.map((rule) => rule.id === updatedRule.id ? updatedRule : rule),
            updatedAt: Date.now()
        }));
        return project;
    }

    static deleteRule(project: WritableSignal<Project>, ruleId: string): WritableSignal<Project> {
        project.update(p => ({
            ...p,
            rules: p.rules.filter((rule) => rule.id !== ruleId),
            updatedAt: Date.now()
        }));
        return project;
    }
}