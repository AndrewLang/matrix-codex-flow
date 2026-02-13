import { inject, Injectable } from '@angular/core';

import { AgentConfig, AgentProvider, AgentResponse } from '../models/agent.provider';
import { AgentProviderRegistry } from '../models/agents';
import { ChatMessage, ChatRole } from '../models/chat.message';
import { MessageStoreService } from './message.store.service';
import { ProjectService } from './project.service';
import { SettingService } from './setting.service';

const USER_ROLE: ChatRole = 'user';
const AGENT_ROLE: ChatRole = 'agent';
const IDENTIFIER_RANDOM_RADIX = 36;
const IDENTIFIER_START_INDEX = 2;
const IDENTIFIER_END_INDEX = 10;
const TIMEOUT_MS = 60000;


@Injectable({
    providedIn: 'root'
})
export class ChatService {
    private readonly settingService = inject(SettingService);
    private readonly projectService = inject(ProjectService);
    private readonly messageStoreService = inject(MessageStoreService);

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

        await this.agentStreaming(prompt, agentConfig, messageSentHandler);
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

    private async agentWait(text: string, agentConfig: AgentConfig): Promise<void> {
        const provider = this.resolveAgent(agentConfig);

        const request = {
            prompt: text,
            model: agentConfig.model,
            timeoutMs: TIMEOUT_MS,
        }
        let response = await provider.run(request);

        this.messageStoreService.add(this.toMessage(response.text, AGENT_ROLE));
    }

    private async agentStreaming(text: string, agentConfig: AgentConfig,
        messageSentHandler?: (message: ChatMessage) => void): Promise<void> {
        const message = this.toMessage(text);
        this.messageStoreService.add(message);
        if (messageSentHandler) {
            messageSentHandler(message);
        }

        const provider = this.resolveAgent(agentConfig);
        const request = {
            prompt: text,
            model: agentConfig.model,
            timeoutMs: TIMEOUT_MS,
            stream: true,
            workingDirectory: this.projectService.currentProject()?.path || undefined,
        }

        const onChunk = (chunk: AgentResponse) => {
            console.log('Received chunk from agent:', chunk);
            if (chunk.text !== undefined && chunk.text !== '') {
                let agentMessage = this.toMessage(chunk.text, AGENT_ROLE);
                this.messageStoreService.add(agentMessage);
            }
        };

        this.messageStoreService.isStreaming.set(true);
        await provider.runStream?.(request, onChunk);
        this.messageStoreService.isStreaming.set(false);
    }

    private resolveAgent(agentConfig: AgentConfig): AgentProvider {
        return AgentProviderRegistry.create(agentConfig);
    }

    private toMessage(content: string, role: ChatRole = USER_ROLE): ChatMessage {
        return {
            id: this.createIdentifier(),
            threadId: '',
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
}
