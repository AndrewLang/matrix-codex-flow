import { inject, Injectable, signal } from '@angular/core';

import { AgentConfig, AgentProvider, AgentResponse } from '../models/agent.provider';
import { AgentProviderRegistry } from '../models/agents';
import { ChatMessage, ChatResponsePayload, ChatRole } from '../models/chat.message';
import { ProjectService } from './project.service';
import { SettingService } from './setting.service';

const USER_ROLE: ChatRole = 'user';
const AGENT_ROLE: ChatRole = 'agent';
const IDENTIFIER_RANDOM_RADIX = 36;
const IDENTIFIER_START_INDEX = 2;
const IDENTIFIER_END_INDEX = 10;


@Injectable({
    providedIn: 'root'
})
export class ChatService {
    private readonly settingService = inject(SettingService);
    private readonly projectService = inject(ProjectService);
    private readonly chatMessagesStore = signal<ChatMessage[]>([]);
    readonly messages = this.chatMessagesStore.asReadonly();
    readonly isReceiving = signal(false);

    async chat(content: string, agentConfig?: AgentConfig,
        messageSentHandler?: (message: ChatMessage) => void
    ): Promise<void> {
        const prompt = content.trim();
        if (!prompt) {
            return;
        }

        if (agentConfig === undefined) {
            agentConfig = await this.settingService.getActiveAgentConfig();
        }

        const message = this.toMessage(prompt);
        this.chatMessagesStore.update((messages) => [...messages, message]);
        if (messageSentHandler) {
            messageSentHandler(message);
        }

        await this.agentStreaming(prompt, agentConfig, (message) => {
            this.chatMessagesStore.update((messages) => [...messages, message]);
        });
    }

    async ask(question: string, agentConfig?: AgentConfig): Promise<string> {
        const prompt = question.trim();
        if (!prompt) {
            return '';
        }

        if (agentConfig === undefined) {
            agentConfig = await this.settingService.getActiveAgentConfig();
        }

        let answer: string[] = [];
        await this.agentStreaming(prompt, agentConfig, (message) => {
            answer.push(message.content);
        });

        return answer.join('');
    }

    async optimizePrompt(rawPrompt: string): Promise<string> {
        // const prompt = `
        // Improve and rewrite the following prompt to make it more accurate, effective, clearer, and more structured for an AI model:
        // """${rawPrompt}"""
        // Only provide the improved prompt text, short and clear, without any additional explanations or commentary.
        // Be more specific about intent, include constraints, desired format, and clarify any ambiguous wording.
        // Make it optimized for clarity and maximum performance.
        // `;
        const prompt = `
        Rewrite the following prompt to be clearer, more precise, and better structured for an AI model:

        """${rawPrompt}"""

        Return only the improved prompt.
        Keep it concise.
        Clarify intent, constraints, and expected output.
        `;

        let optimized = await this.ask(prompt);
        return optimized;
    }

    async agent(text: string, agentConfig: AgentConfig): Promise<void> {
        const provider = this.resolveAgent(agentConfig);

        const request = {
            prompt: text,
            model: agentConfig.model,
            timeoutMs: 60000,
        }
        let response = await provider.run(request);

        this.chatMessagesStore.update((messages) => [
            ...messages,
            this.toMessage(response.text, AGENT_ROLE)
        ]);
    }

    async agentStreaming(text: string, agentConfig: AgentConfig, messageSentHandler?: (message: ChatMessage) => void): Promise<void> {
        const message = this.toMessage(text);
        this.chatMessagesStore.update((messages) => [...messages, message]);
        if (messageSentHandler) {
            messageSentHandler(message);
        }

        const provider = this.resolveAgent(agentConfig);
        const request = {
            prompt: text,
            model: agentConfig.model,
            timeoutMs: 60000,
            stream: true,
            workingDirectory: this.projectService.currentProject()?.path || undefined,
        }
        const onChunk = (chunk: AgentResponse) => {
            console.log('Received chunk from agent:', chunk);
            this.chatMessagesStore.update((messages) => {
                const lastMessage = messages[messages.length - 1];
                if (!lastMessage || lastMessage.role === USER_ROLE) {
                    return [...messages, this.toMessage(chunk.text, AGENT_ROLE)];
                }

                return [
                    ...messages.slice(0, messages.length - 1),
                    { ...lastMessage, content: `${lastMessage.content}${chunk.text}` }
                ];
            });
        };
        this.isReceiving.set(true);
        await provider.runStream?.(request, onChunk);
        this.isReceiving.set(false);
    }

    private resolveAgent(agentConfig: AgentConfig): AgentProvider {
        return AgentProviderRegistry.create(agentConfig);
    }

    private toMessage(content: string, role: ChatRole = USER_ROLE): ChatMessage {
        return {
            id: this.createIdentifier(),
            role,
            content,
            model: 'gpt-5.3-codex',
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
        this.chatMessagesStore.update((messages) =>
            messages.map((message) =>
                message.id === messageId
                    ? { ...message, content: `${message.content}${chunk}` }
                    : message
            )
        );
    }

    private handleChatResponse(payload: ChatResponsePayload): void {
        if (payload.type === 'message') {
            this.chatMessagesStore.update((messages) => [
                ...messages,
                this.toMessage(payload.data.content, AGENT_ROLE)
            ]);
            return;
        }

        if (payload.type === 'token') {
            this.chatMessagesStore.update((messages) => {
                const lastMessage = messages[messages.length - 1];
                if (!lastMessage || lastMessage.role === USER_ROLE) {
                    return [...messages, this.toMessage(payload.data.text, AGENT_ROLE)];
                }

                return [
                    ...messages.slice(0, messages.length - 1),
                    { ...lastMessage, content: `${lastMessage.content}${payload.data.text}` }
                ];
            });
            return;
        }

        if (payload.type === 'error') {
            this.chatMessagesStore.update((messages) => [
                ...messages,
                this.toMessage(`Error: ${payload.data.message}`, AGENT_ROLE)
            ]);
        }
    }
}
