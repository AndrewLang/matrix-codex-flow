import { CommonModule } from '@angular/common';
import { Component, computed, effect, ElementRef, inject, OnDestroy, OnInit, signal, viewChild } from '@angular/core';
import { AgentConfig } from '../../models/agent.provider';
import { ChatMessage, ChatThread } from '../../models/chat.message';
import { TaskStatus } from '../../models/task';
import { FormatTimestampPipe } from '../../pipes/format.timestamp.pipe';
import { ChatService } from '../../services/chat.service';
import { MessageStoreService } from '../../services/message.store.service';
import { ProjectService } from '../../services/project.service';
import { TaskExecuteService } from '../../services/task.execuer.service';
import { AgentSelectorComponent } from '../agent-selector/agent.selector.component.';
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
        TaskRuntimeComponent, LoaderComponent, AgentSelectorComponent
    ]
})
export class ChatComponent implements OnInit, OnDestroy {
    readonly minComposerHeightPixels = MIN_COMPOSER_HEIGHT_PIXELS;
    readonly maxComposerHeightPixels = MAX_COMPOSER_HEIGHT_PIXELS;
    readonly composerText = signal('');
    readonly copiedMessageId = signal<string | null>(null);

    readonly showScrollToBottom = signal(false);
    readonly isRunningTask = signal(false);
    readonly selectedAgent = signal<AgentConfig | null>(null);
    private readonly autoScrollEnabled = signal(true);

    private readonly chatService = inject(ChatService);
    private readonly taskRuntimeService = inject(TaskExecuteService);
    private readonly messageService = inject(MessageStoreService);
    private readonly projectService = inject(ProjectService);

    readonly messages = computed(() => this.messageService.messages());
    readonly hasMessages = computed(() => this.messages().length > 0);
    readonly isStreaming = computed(() => this.messageService.isStreaming());
    readonly threads = signal<ChatThread[]>([]);
    readonly currentThread = computed(() => this.messageService.currentThread());
    readonly hasThreads = computed(() => this.threads().length > 0);
    readonly showThreads = signal(false);

    private readonly runningTaskSubscription = this.taskRuntimeService.onRunTask.subscribe(data => {
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

    async ngOnInit() {
        await this.projectService.initialize();
        await this.messageService.startThreadIfEmpty();

        let threads = await this.messageService.loadThreads();
        this.threads.set(threads);
        console.log('Loaded threads:', this.threads());
    }

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

    async sendMessage(): Promise<void> {
        const prompt = this.composerText();

        await this.chatService.chat(prompt,
            this.selectedAgent()!, (message) => {
                this.composerText.set('');
                this.resetComposerHeight();
            });
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

    switchThread(thread: ChatThread): void {
        this.messageService.switchToThread(thread);
    }

    toggleThreads() {
        this.showThreads.update(value => !value);
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
