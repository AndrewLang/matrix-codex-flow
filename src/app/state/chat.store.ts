import { Injectable, signal } from '@angular/core';

export const CHAT_ROLE_USER = 'user' as const;
export const CHAT_ROLE_ASSISTANT = 'assistant' as const;
export const CHAT_ROLE_SYSTEM = 'system' as const;

export type ChatRole = typeof CHAT_ROLE_USER | typeof CHAT_ROLE_ASSISTANT | typeof CHAT_ROLE_SYSTEM;

export type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
  createdAt: number;
};

@Injectable({
  providedIn: 'root',
})
export class ChatStore {
  readonly messages = signal<ChatMessage[]>([]);
  private messageCounter = 0;

  sendUserMessage(text: string): void {
    const normalizedText = text.trim();
    if (!normalizedText) {
      return;
    }

    this.pushMessage(CHAT_ROLE_USER, normalizedText);
    setTimeout(() => {
      this.pushMessage(CHAT_ROLE_ASSISTANT, 'CodexFlow (stub): received your task.');
    }, 250);
  }

  private pushMessage(role: ChatRole, content: string): void {
    const message: ChatMessage = {
      id: `msg-${this.messageCounter}`,
      role,
      content,
      createdAt: Date.now(),
    };
    this.messageCounter += 1;
    this.messages.update((messages) => [...messages, message]);
  }
}
