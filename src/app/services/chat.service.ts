import { inject, Injectable, signal } from '@angular/core';
import { ChatMessage, ChatRole } from '../models/chat.message';
import { CommandService } from './command.service';
import { OpenaiService } from './openai.service';
import { ProjectService } from './project.service';


const USER_ROLE: ChatRole = 'user';
const AGENT_ROLE: ChatRole = 'agent';
const IDENTIFIER_RANDOM_RADIX = 36;
const IDENTIFIER_START_INDEX = 2;
const IDENTIFIER_END_INDEX = 10;

@Injectable({
    providedIn: 'root'
})
export class ChatService {
    private readonly openaiService = inject(OpenaiService);
    private readonly commandService = inject(CommandService);
    private readonly projectService = inject(ProjectService);

    private readonly chatMessagesState = signal<ChatMessage[]>([]);

    readonly messages = this.chatMessagesState.asReadonly();

    sendMessage(text: string): void {
        const prompt = text.trim();

        if (!prompt) {
            return;
        }

        this.sendToCloud(prompt);
        // this.sendToLocalAgent(prompt);
    }

    private sendToLocalAgent(prompt: string): void {
        let projectPath = this.projectService.currentProject()?.path;
        let result = this.commandService.runCommand(
            'codex',
            ['edit', '--mode', 'suggest', '--model', 'gpt-5-codex'],
            prompt,
            projectPath
        );

        console.log('Command result:', result);
    }

    private sendToCloud(prompt: string) {
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
}
