import { Injectable, signal } from '@angular/core';
import { ChatMessage, ChatThread, EMPYT_THREAD } from '../models/chat.message';

@Injectable({ providedIn: 'root' })
export class MessageStoreService {
    private readonly _messages = signal<ChatMessage[]>([]);
    private readonly _threads = signal<Record<string, ChatMessage[]>>({});

    readonly messages = this._messages.asReadonly();
    readonly threads = this._threads.asReadonly();
    isStreaming = signal(false);

    currentThread = signal<ChatThread>(EMPYT_THREAD);


    constructor() { }

    add(message: ChatMessage) {
        this._messages.update(list => [...list, message]);
    }

    updateLastMessage(content: string) {
        this._messages.update(list => {
            const lastMessage = list[list.length - 1];
            if (!lastMessage) {
                return list;
            }

            return [
                ...list.slice(0, list.length - 1),
                { ...lastMessage, content }
            ];
        });
    }

    updateContent(id: string, content: string) {
        this._messages.update(list =>
            list.map(m =>
                m.id === id
                    ? { ...m, content }
                    : m
            )
        );
    }

    setThreadMessages(threadId: string, messages: ChatMessage[]) {
        this._threads.update(threads => ({
            ...threads,
            [threadId]: messages
        }));
    }
}