import { Component, effect, inject, input, output, signal } from '@angular/core';

import { AgentRule, AgentRuleViewModel } from '../../models/agent.rule';
import { ChatService } from '../../services/chat.service';
import { IconComponent } from '../icon/icon.component';
import { MarkdownEditorComponent } from '../md-editor/md.editor.component';

@Component({
    selector: 'mtx-rule-editor',
    templateUrl: 'rule.editor.component.html',
    imports: [MarkdownEditorComponent, IconComponent]
})
export class RuleEditorComponent {
    private readonly chatService = inject(ChatService);
    readonly rule = input.required<AgentRuleViewModel>();
    readonly saved = output<AgentRule>();
    readonly cancelled = output<AgentRuleViewModel>();

    readonly name = signal('');
    readonly description = signal('');
    readonly isGenerating = signal(false);

    constructor() {
        effect(() => {
            const rule = this.rule();
            this.name.set(rule.name);
            this.description.set(rule.description ?? '');
        });
    }

    cancel(): void {
        this.cancelled.emit(this.rule());
    }

    save(): void {
        const trimmedName = this.name().trim();
        if (!trimmedName) {
            return;
        }

        this.saved.emit({
            ...this.rule(),
            name: trimmedName,
            description: this.description().trim() || undefined,
            updatedAt: Date.now()
        });
    }

    async optimizePrompt(): Promise<void> {
        this.isGenerating.set(true);
        let content = this.description().trim();
        if (!content) {
            this.isGenerating.set(false);
            return;
        }

        let optimizedContent = await this.chatService.optimizePrompt(content);
        this.description.set(optimizedContent);
        this.isGenerating.set(false);
    }
}
