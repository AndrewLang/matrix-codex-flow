import { inject, Injectable, signal } from '@angular/core';
import { ChatMessage, ChatThread, EMPYT_THREAD } from '../models/chat.message';
import { IdGenerator } from '../models/id';
import { ProjectService } from './project.service';

@Injectable({ providedIn: 'root' })
export class MessageStoreService {
    private readonly projectService = inject(ProjectService);
    private readonly _messages = signal<ChatMessage[]>([]);
    private readonly _threads = signal<Record<string, ChatMessage[]>>({});

    readonly messages = this._messages.asReadonly();
    readonly threads = this._threads.asReadonly();
    isStreaming = signal(false);

    currentThread = signal<ChatThread>(EMPYT_THREAD);

    constructor() { }

    add(message: ChatMessage) {
        console.log('[MessageStore] Adding message:', message);
        this._messages.update(list => [...list, message]);
    }

    setThreadMessages(threadId: string, messages: ChatMessage[]) {
        this._threads.update(threads => ({
            ...threads,
            [threadId]: messages
        }));
    }

    isEmptyThread(): boolean {
        return this.currentThread().id === EMPYT_THREAD.id;
    }

    async startThreadIfEmpty() {
        if (this.isEmptyThread()) {
            await this.startThread();
        }
    }

    async startThread() {
        let thread: ChatThread = {
            id: IdGenerator.generateId(),
            projectId: this.projectService.currentProject()?.id || '',
            title: ''
        };
        this.currentThread.set(thread);
    }

    async switchThread(thread: ChatThread) {
        this.currentThread.set(thread);
        let messages = await this.loadThreadMessages(thread.id);
        this.setThreadMessages(thread.id, messages);
    }

    private async loadThreadMessages(threadId: string): Promise<ChatMessage[]> {
        return [];
    }
}