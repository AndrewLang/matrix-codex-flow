import { CommonModule } from '@angular/common';
import { Component, computed, effect, ElementRef, inject, OnDestroy, OnInit, signal, viewChild } from '@angular/core';
import { ChatMessage } from '../../models/chat.message';
import { TaskStatus } from '../../models/task';
import { FormatTimestampPipe } from '../../pipes/format.timestamp.pipe';
import { ChatService } from '../../services/chat.service';
import { TaskExecuteService } from '../../services/task.execuer.service';
import { IconComponent } from "../icon/icon.component";
import { LoaderComponent } from '../loader/loader.component';
import { MarkdownEditorComponent } from '../md-editor/md.editor.component';
import { MarkdownRendererComponent } from '../md-renderer/md.renderer.component';
import { TaskRuntimeComponent } from '../tasks/task.runtime.component';

const MAX_COMPOSER_HEIGHT_PIXELS = 220;
const MIN_COMPOSER_HEIGHT_PIXELS = 56;
const SCROLL_BOTTOM_THRESHOLD_PIXELS = 24;

@Component({
    selector: 'mtx-chat',
    templateUrl: 'chat.component.html',
    imports: [CommonModule, FormatTimestampPipe, IconComponent,
        MarkdownRendererComponent, MarkdownEditorComponent,
        TaskRuntimeComponent, LoaderComponent
    ]
})
export class ChatComponent implements OnInit, OnDestroy {
    readonly minComposerHeightPixels = MIN_COMPOSER_HEIGHT_PIXELS;
    readonly maxComposerHeightPixels = MAX_COMPOSER_HEIGHT_PIXELS;
    readonly composerText = signal('');
    readonly copiedMessageId = signal<string | null>(null);
    readonly messages = computed(() => this.chatService.messages());
    readonly hasMessages = computed(() => this.messages().length > 0);
    readonly isReceiving = computed(() => this.chatService.isReceiving());
    readonly showScrollToBottom = signal(false);
    readonly isRunningTask = signal(false);
    private readonly autoScrollEnabled = signal(true);

    private readonly chatService = inject(ChatService);
    private readonly taskRuntimeService = inject(TaskExecuteService);
    private readonly runningTaskSubscription = this.taskRuntimeService.onRunTask.subscribe(data => {
        console.log('[Chat] Task started:', data);
        let isRunning = data.status === TaskStatus.InProgress;
        this.isRunningTask.set(isRunning);
    });

    private readonly transcriptContainer = viewChild<ElementRef<HTMLDivElement>>('transcriptContainer');
    private readonly composerTextarea = viewChild<ElementRef<HTMLTextAreaElement>>('composerTextarea');

    constructor() {
        effect(() => {
            this.messages().length;
            queueMicrotask(() => this.onMessagesUpdated());
        });
    }

    ngOnInit() { }

    ngOnDestroy() {
        this.runningTaskSubscription.unsubscribe();
    }

    isUserMessage(message: ChatMessage): boolean {
        return message.role === 'user';
    }

    bubbleLayout(message: ChatMessage) {
        return this.isUserMessage(message) ? 'justify-end' : 'justify-start w-full';
    }

    bubbleAlign(message: ChatMessage) {
        return this.isUserMessage(message)
            ? 'items-end max-w-[75%]'
            : 'items-start w-full max-w-full min-w-0';
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
        this.chatService.chat(messageContent);

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

    onTranscriptScroll(): void {
        const transcriptElement = this.transcriptContainer()?.nativeElement;

        if (!transcriptElement) {
            return;
        }

        const isAtBottom = this.isAtBottom(transcriptElement);
        this.autoScrollEnabled.set(isAtBottom);
        this.showScrollToBottom.set(!isAtBottom);
    }

    scrollToBottomFromButton(): void {
        const transcriptElement = this.transcriptContainer()?.nativeElement;

        if (!transcriptElement) {
            return;
        }

        transcriptElement.scrollTo({
            top: transcriptElement.scrollHeight,
            behavior: 'smooth'
        });
        this.showScrollToBottom.set(false);
    }

    private onMessagesUpdated(): void {
        const shouldAutoScroll = this.autoScrollEnabled();

        requestAnimationFrame(() => {
            const transcriptElement = this.transcriptContainer()?.nativeElement;
            if (!transcriptElement) {
                return;
            }

            if (shouldAutoScroll) {
                this.scrollTranscriptToBottom();
                this.showScrollToBottom.set(false);
                return;
            }

            this.showScrollToBottom.set(!this.isAtBottom(transcriptElement));
        });
    }

    private scrollTranscriptToBottom(): void {
        const transcriptElement = this.transcriptContainer()?.nativeElement;

        if (!transcriptElement) {
            return;
        }

        transcriptElement.scrollTop = transcriptElement.scrollHeight;
    }

    private isAtBottom(element: HTMLDivElement): boolean {
        const distanceToBottom =
            element.scrollHeight - element.scrollTop - element.clientHeight;
        return distanceToBottom <= SCROLL_BOTTOM_THRESHOLD_PIXELS;
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
