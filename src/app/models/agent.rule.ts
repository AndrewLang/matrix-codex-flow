export interface AgentRule {
    id: string;
    name: string;
    description?: string;
    createdAt: number;
    updatedAt: number;
}

export interface AgentRuleViewModel {
    name: string;
    description: string;
}
