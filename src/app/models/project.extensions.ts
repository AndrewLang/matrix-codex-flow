import { WritableSignal } from '@angular/core';
import { AgentRule } from './agent.rule';
import { Project, ProjectOperations as ProjectOps } from './project';

export type ProjectSignal = WritableSignal<Project> & {
    addRule(rule: AgentRule): void;
    updateRule(rule: AgentRule): void;
    deleteRule(ruleId: string): void;
};

export function enhanceProject(projectSignal: WritableSignal<Project>): ProjectSignal {
    return Object.assign(projectSignal, {
        addRule(rule: AgentRule) {
            console.log('Adding rule:', rule);
            projectSignal.update(p => ProjectOps.addRule(p, rule));
            console.log('Project after adding rule:', projectSignal());
        },
        updateRule(rule: AgentRule) {
            projectSignal.update(p => ProjectOps.updateRule(p, rule));
        },
        deleteRule(ruleId: string) {
            projectSignal.update(p => ProjectOps.deleteRule(p, ruleId));
        },
    });
}
