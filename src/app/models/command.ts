export interface CommandDescriptor {
    id: string;
    title: string;
    description?: string;
    icon?: string;
    tag?: string;
    subCommands?: CommandDescriptor[];
    isHidden?: (context?: any) => boolean | Promise<boolean>;
    action?: (context?: any) => void | Promise<void>;
}