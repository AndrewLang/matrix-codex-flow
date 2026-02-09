export interface CommandDescriptor {
    id: string;
    title: string;
    description?: string;
    icon?: string;
    tag?: string;
    subCommands?: CommandDescriptor[];
    action?: (context?: any) => void | Promise<void>;
}