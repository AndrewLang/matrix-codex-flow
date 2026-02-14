import { inject, Injectable, signal } from '@angular/core';
import { invoke } from '@tauri-apps/api/core';
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

    async add(message: ChatMessage) {
        console.log('[MessageStore] Adding message:', message);
        this._messages.update(list => [...list, message]);

        await invoke('save_chat_message', { message });
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
        await invoke('save_chat_thread', { thread });
    }

    async switchToThread(thread: ChatThread) {
        this.currentThread.set(thread);
        let messages = await this.loadThreadMessages(thread.id);
        this.setThreadMessages(thread.id, messages);
    }

    async loadThreads(): Promise<ChatThread[]> {
        let projectId = this.projectService.currentProject()?.id;
        return await invoke<ChatThread[]>('load_chat_threads', { projectId });
    }

    private async loadThreadMessages(threadId: string): Promise<ChatMessage[]> {
        return await invoke<ChatMessage[]>('load_chat_messages', { threadId });
    }
}