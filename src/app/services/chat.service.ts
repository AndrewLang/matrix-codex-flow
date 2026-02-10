import { inject, Injectable, signal } from '@angular/core';
import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';

import { ChatMessage, ChatRole } from '../models/chat.message';
import { CommandService } from './command.service';
import { OpenaiService } from './openai.service';
import { ProjectService } from './project.service';

const USER_ROLE: ChatRole = 'user';
const AGENT_ROLE: ChatRole = 'agent';
const IDENTIFIER_RANDOM_RADIX = 36;
const IDENTIFIER_START_INDEX = 2;
const IDENTIFIER_END_INDEX = 10;

type ChatResponsePayload =
    | { type: 'token'; data: { text: string } }
    | { type: 'message'; data: { role: string; content: string } }
    | { type: 'done'; data: { totalTokens: number } }
    | { type: 'error'; data: { message: string } };

@Injectable({
    providedIn: 'root'
})
export class ChatService {
    private readonly openaiService = inject(OpenaiService);
    private readonly commandService = inject(CommandService);
    private readonly projectService = inject(ProjectService);

    private readonly chatMessagesState = signal<ChatMessage[]>([]);

    readonly messages = this.chatMessagesState.asReadonly();
    readonly isReceiving = signal(false);

    async sendMessage(text: string): Promise<void> {
        const prompt = text.trim();

        if (!prompt) {
            return;
        }
        const message = this.createMessage(USER_ROLE, prompt);
        this.chatMessagesState.update((messages) => [...messages, message]);

        await this.sendToLocalAgent(prompt);
    }

    private sendToLocalAgent(prompt: string): Promise<void> {
        return new Promise(async (resolve, reject) => {
            const unlistenItem = await listen('codex:message', (e) => {
                const payload = e.payload as ChatResponsePayload;
                console.log('Received codex:message event with payload:', payload);
                if (payload.type !== 'token') {
                    this.handleChatResponse(payload);
                }
            });

            const unlistenDone = await listen('codex:done', (e) => {
                const payload = e.payload as ChatResponsePayload;
                console.log('Received codex:done event with payload:', payload);
                this.handleChatResponse(payload);
                unlistenItem();
                unlistenDone();
                resolve();
            });

            try {
                this.isReceiving.set(true);
                let workingDirectory = this.projectService.currentProject()?.path || undefined;
                let payload = {
                    payload: {
                        prompt,
                        workingDirectory: workingDirectory,
                    }
                };
                console.log('Invoking chat command with payload:', payload);
                await invoke('chat', payload);
            } catch (err) {
                unlistenItem();
                unlistenDone();
                reject(err);
            } finally {
                this.isReceiving.set(false);
            }
        });
    }

    private async sendToCloud(prompt: string): Promise<void> {
        const userMessage = this.createMessage(USER_ROLE, prompt);
        const agentMessage = this.createMessage(AGENT_ROLE, '');
        this.chatMessagesState.update((messages) => [...messages, userMessage]);
        this.chatMessagesState.update((messages) => [...messages, agentMessage]);

        this.openaiService.runStreaming(prompt, (chunk) => {
            this.appendToMessage(agentMessage.id, chunk);
        }).catch((error) => {
            const errorMessage = error instanceof Error ? error.message : 'Failed to get response from agent.';
            this.appendToMessage(agentMessage.id, `\n${errorMessage}`);
        });
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

    private appendToMessage(messageId: string, chunk: string): void {
        console.log(`Appending chunk to message ${messageId}:`, chunk);
        this.chatMessagesState.update((messages) =>
            messages.map((message) =>
                message.id === messageId
                    ? { ...message, content: `${message.content}${chunk}` }
                    : message
            )
        );
    }

    private handleChatResponse(payload: ChatResponsePayload): void {
        if (payload.type === 'message') {
            this.chatMessagesState.update((messages) => [
                ...messages,
                this.createMessage(AGENT_ROLE, payload.data.content)
            ]);
            return;
        }

        if (payload.type === 'token') {
            this.chatMessagesState.update((messages) => {
                const lastMessage = messages[messages.length - 1];
                if (!lastMessage || lastMessage.role === USER_ROLE) {
                    return [...messages, this.createMessage(AGENT_ROLE, payload.data.text)];
                }

                return [
                    ...messages.slice(0, messages.length - 1),
                    { ...lastMessage, content: `${lastMessage.content}${payload.data.text}` }
                ];
            });
            return;
        }

        if (payload.type === 'error') {
            this.chatMessagesState.update((messages) => [
                ...messages,
                this.createMessage(AGENT_ROLE, `Error: ${payload.data.message}`)
            ]);
        }
    }
}
