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