import { Injectable, signal } from '@angular/core';
import { ChatMessage, ChatRole } from '../models/chat.message';


const USER_ROLE: ChatRole = 'user';
const IDENTIFIER_RANDOM_RADIX = 36;
const IDENTIFIER_START_INDEX = 2;
const IDENTIFIER_END_INDEX = 10;

@Injectable({
    providedIn: 'root'
})
export class ChatService {
    private readonly chatMessagesState = signal<ChatMessage[]>([]);

    readonly messages = this.chatMessagesState.asReadonly();

    sendMessage(text: string): void {
        const trimmedText = text.trim();

        if (!trimmedText) {
            return;
        }

        const userMessage = this.createMessage(USER_ROLE, trimmedText);
        this.chatMessagesState.update((messages) => [...messages, userMessage]);
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
