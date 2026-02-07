import { Injectable, signal } from '@angular/core';
import { ChatMessage, ChatRole } from '../models/chat.message';


const MOCK_ASSISTANT_DELAY_MILLISECONDS = 500;
const ASSISTANT_ROLE: ChatRole = 'agent';
const USER_ROLE: ChatRole = 'user';
const IDENTIFIER_RANDOM_RADIX = 36;
const IDENTIFIER_START_INDEX = 2;
const IDENTIFIER_END_INDEX = 10;
const INITIAL_ASSISTANT_MESSAGE = 'Welcome to VibeFlow. Ask me about your project, tasks, or context.';

@Injectable({
    providedIn: 'root'
})
export class ChatService {
    private readonly chatMessagesState = signal<ChatMessage[]>([
        this.createMessage(ASSISTANT_ROLE, INITIAL_ASSISTANT_MESSAGE)
    ]);

    readonly messages = this.chatMessagesState.asReadonly();

    sendMessage(text: string): void {
        const trimmedText = text.trim();

        if (!trimmedText) {
            return;
        }

        const userMessage = this.createMessage(USER_ROLE, trimmedText);
        this.chatMessagesState.update((messages) => [...messages, userMessage]);

        const assistantResponseText = this.createAssistantResponse(trimmedText);

        window.setTimeout(() => {
            const assistantMessage = this.createMessage(ASSISTANT_ROLE, assistantResponseText);
            this.chatMessagesState.update((messages) => [...messages, assistantMessage]);
        }, MOCK_ASSISTANT_DELAY_MILLISECONDS);
    }

    private createAssistantResponse(userText: string): string {
        return `I understand. I will help you move this forward: "${userText}".`;
    }

    private createMessage(role: ChatRole, content: string): ChatMessage {
        return {
            id: this.createIdentifier(),
            role,
            content,
            createdAt: Date.now()
        };
    }

    private createIdentifier(): string {
        if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
            return crypto.randomUUID();
        }

        return `${Date.now()}-${Math.random().toString(IDENTIFIER_RANDOM_RADIX).slice(IDENTIFIER_START_INDEX, IDENTIFIER_END_INDEX)}`;
    }
}
