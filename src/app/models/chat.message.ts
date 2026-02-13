export interface ChatMessage {
    id: string;
    threadId: string;
    role: ChatRole;
    content: string;
    model: string;
    createdAt: number;
}

export interface ChatThread {
    id: string;
    title: string;
}

export const EMPYT_THREAD: ChatThread = {
    id: '',
    title: ''
};


export type ChatRole = 'user' | 'agent';

export type ChatResponsePayload =
    | { type: 'token'; data: { text: string } }
    | { type: 'message'; data: { role: string; content: string } }
    | { type: 'done'; data: { totalTokens: number, content: string } }
    | { type: 'error'; data: { message: string } };
