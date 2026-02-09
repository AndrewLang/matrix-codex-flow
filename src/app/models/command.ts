export interface CommandDescriptor {
    id: string;
    title: string;
    description?: string;
    icon?: string;
    subCommands?: CommandDescriptor[];
    action?: () => void | Promise<void>;
}