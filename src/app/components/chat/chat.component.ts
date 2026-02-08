import { CommonModule } from '@angular/common';
import { Component, effect, ElementRef, inject, OnInit, signal, viewChild } from '@angular/core';
import { ChatMessage } from '../../models/chat.message';
import { FormatTimestampPipe } from '../../pipes/format.timestamp.pipe';
import { ChatService } from '../../services/chat.service';
import { IconComponent } from "../icon/icon.component";
import { MarkdownRendererComponent } from '../md-renderer/md.renderer.component';

const MAX_COMPOSER_HEIGHT_PIXELS = 220;
const MIN_COMPOSER_HEIGHT_PIXELS = 56;

@Component({
    selector: 'mtx-chat',
    templateUrl: 'chat.component.html',
    imports: [CommonModule, FormatTimestampPipe, IconComponent, MarkdownRendererComponent]
})
export class ChatComponent implements OnInit {
    readonly minComposerHeightPixels = MIN_COMPOSER_HEIGHT_PIXELS;
    readonly maxComposerHeightPixels = MAX_COMPOSER_HEIGHT_PIXELS;
    readonly composerText = signal('');
    readonly copiedMessageId = signal<string | null>(null);
    readonly messages;

    private readonly chatService = inject(ChatService);
    private readonly transcriptContainer = viewChild<ElementRef<HTMLDivElement>>('transcriptContainer');
    private readonly composerTextarea = viewChild<ElementRef<HTMLTextAreaElement>>('composerTextarea');

    constructor() {
        this.messages = this.chatService.messages;

        effect(() => {
            this.messages().length;
            queueMicrotask(() => this.scrollTranscriptToBottom());
        });
    }

    ngOnInit() { }

    isUserMessage(message: ChatMessage): boolean {
        return message.role === 'user';
    }

    bubbleLayout(message: ChatMessage) {
        return this.isUserMessage(message) ? 'justify-end' : 'justify-start';
    }

    bubbleAlign(message: ChatMessage) {
        return this.isUserMessage(message) ? 'items-end max-w-[75%] ' : 'items-start w-full';
    }

    bubbleColor(message: ChatMessage) {
        return this.isUserMessage(message)
            ? 'bg-slate-800/72'
            : 'bg-slate-700/34';
    }

    onComposerInput(event: Event): void {
        const target = event.target as HTMLTextAreaElement;
        this.composerText.set(target.value);
        this.resizeComposerToContent();
    }

    onComposerKeydown(event: KeyboardEvent): void {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            this.sendMessage();
        }
    }

    sendMessage(): void {
        const messageContent = this.composerText();
        this.chatService.sendMessage(messageContent);

        if (!messageContent.trim()) {
            return;
        }

        this.composerText.set('');
        this.resetComposerHeight();
    }

    async copyMessage(message: ChatMessage): Promise<void> {
        const content = message.content.trim();
        if (!content) {
            return;
        }

        try {
            await navigator.clipboard.writeText(content);
            this.copiedMessageId.set(message.id);
            setTimeout(() => {
                if (this.copiedMessageId() === message.id) {
                    this.copiedMessageId.set(null);
                }
            }, 1500);
        } catch {
            return;
        }
    }

    openFolder(): void {
    }

    private scrollTranscriptToBottom(): void {
        const transcriptElement = this.transcriptContainer()?.nativeElement;

        if (!transcriptElement) {
            return;
        }

        transcriptElement.scrollTop = transcriptElement.scrollHeight;
    }

    private resetComposerHeight(): void {
        const textareaElement = this.composerTextarea()?.nativeElement;

        if (!textareaElement) {
            return;
        }

        textareaElement.style.height = `${MIN_COMPOSER_HEIGHT_PIXELS}px`;
        textareaElement.style.overflowY = 'hidden';
    }

    private resizeComposerToContent(): void {
        const textareaElement = this.composerTextarea()?.nativeElement;

        if (!textareaElement) {
            return;
        }

        textareaElement.style.height = '0px';

        const nextHeight = Math.min(textareaElement.scrollHeight, MAX_COMPOSER_HEIGHT_PIXELS);
        textareaElement.style.height = `${nextHeight}px`;
        textareaElement.style.overflowY = textareaElement.scrollHeight > MAX_COMPOSER_HEIGHT_PIXELS ? 'auto' : 'hidden';
    }

}
