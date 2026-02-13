export interface ChatMessage {
    id: string;
    role: ChatRole;
    content: string;
    model: string;
    createdAt: number;
}


export type ChatRole = 'user' | 'agent';

export type ChatResponsePayload =
    | { type: 'token'; data: { text: string } }
    | { type: 'message'; data: { role: string; content: string } }
    | { type: 'done'; data: { totalTokens: number, content: string } }
    | { type: 'error'; data: { message: string } };
