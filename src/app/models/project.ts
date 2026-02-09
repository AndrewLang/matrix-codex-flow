import { AgentRule } from "./agent.rule";
import { Task } from "./task";

export interface Project {
    id: string;
    name: string;
    path: string;
    rules: AgentRule[];
    tasks: Task[];
    createdAt: number;
    updatedAt: number;
}

export class ProjectOperations {
    static addRule(project: Project, rule: AgentRule): Project {
        return {
            ...project,
            rules: [...project.rules, rule],
            updatedAt: Date.now()
        };
    }

    static updateRule(project: Project, updatedRule: AgentRule): Project {
        return {
            ...project,
            rules: project.rules.map((rule) => rule.id === updatedRule.id ? updatedRule : rule),
            updatedAt: Date.now()
        };
    }

    static deleteRule(project: Project, ruleId: string): Project {
        return {
            ...project,
            rules: project.rules.filter((rule) => rule.id !== ruleId),
            updatedAt: Date.now()
        };
    }
}