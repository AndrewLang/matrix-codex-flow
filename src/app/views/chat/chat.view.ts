import { Component, ElementRef, ViewChild, computed, effect, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import {
  CHAT_ROLE_ASSISTANT,
  CHAT_ROLE_SYSTEM,
  CHAT_ROLE_USER,
  ChatMessage,
  ChatStore,
} from '../../state/chat.store';
import { ProjectSessionStore } from '../../state/project-session.store';

@Component({
  selector: 'app-chat-view',
  standalone: true,
  templateUrl: './chat.view.html',
})
export class ChatView {
  @ViewChild('transcriptScroll')
  private transcriptScroll?: ElementRef<HTMLDivElement>;

  protected readonly chatStore = inject(ChatStore);
  protected readonly sessionStore = inject(ProjectSessionStore);
  private readonly router = inject(Router);
  protected readonly draft = signal<string>('');
  protected readonly messages = this.chatStore.messages;
  protected readonly chatRoleUser = CHAT_ROLE_USER;
  protected readonly chatRoleAssistant = CHAT_ROLE_ASSISTANT;
  protected readonly chatRoleSystem = CHAT_ROLE_SYSTEM;
  protected readonly projectPath = computed(() => this.sessionStore.activeProjectPath());
  protected readonly projectName = computed(() => {
    const path = this.projectPath();
    if (!path) {
      return '';
    }
    const parts = path.split(/[\\/]/).filter((part) => part.length > 0);
    return parts.at(-1) ?? path;
  });

  constructor() {
    effect(() => {
      this.messages().length;
      setTimeout(() => {
        this.scrollToBottom();
      }, 0);
    });
  }

  protected onDraftInput(event: Event): void {
    const textarea = event.target as HTMLTextAreaElement | null;
    this.draft.set(textarea?.value ?? '');
  }

  protected onDraftKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  protected sendMessage(): void {
    const text = this.draft().trim();
    if (!text) {
      return;
    }
    this.chatStore.sendUserMessage(text);
    this.draft.set('');
  }

  protected async goToSettings(): Promise<void> {
    await this.router.navigate(['/settings']);
  }

  protected async goToChains(): Promise<void> {
    await this.router.navigate(['/chains']);
  }

  protected async goToLanding(): Promise<void> {
    await this.router.navigate(['/']);
  }

  protected formatTime(createdAt: number): string {
    return new Date(createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  private scrollToBottom(): void {
    const container = this.transcriptScroll?.nativeElement;
    if (!container) {
      return;
    }
    container.scrollTop = container.scrollHeight;
  }
}
