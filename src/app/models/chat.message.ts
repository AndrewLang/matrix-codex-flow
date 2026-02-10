export interface ChatMessage {
    id: string;
    role: ChatRole;
    content: string;
    model: string;
    createdAt: number;
}


export type ChatRole = 'user' | 'agent';