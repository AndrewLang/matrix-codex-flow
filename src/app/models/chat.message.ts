export interface ChatMessage {
    id: string;
    threadId: string;
    role: ChatRole;
    content: string;
    agent: string;
    model: string;
    createdAt: number;
}

export interface ChatThread {
    id: string;
    projectId: string;
    title: string;
    createdAt: number;
    updatedAt: number;
}

export const EMPYT_THREAD: ChatThread = {
    id: '',
    projectId: '',
    title: '',
    createdAt: 0,
    updatedAt: 0
};

export type ChatRole = 'user' | 'agent';

export type ChatResponsePayload =
    | { type: 'token'; data: { text: string } }
    | { type: 'message'; data: { role: string; content: string } }
    | { type: 'done'; data: { totalTokens: number, content: string } }
    | { type: 'error'; data: { message: string } };
