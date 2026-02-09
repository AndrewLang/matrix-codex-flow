import { Component, effect, input, output, signal } from '@angular/core';

import { AgentRule, AgentRuleViewModel } from '../../models/agent.rule';
import { MarkdownEditorComponent } from '../md-editor/md.editor.component';

@Component({
    selector: 'mtx-rule-editor',
    templateUrl: 'rule.editor.component.html',
    imports: [MarkdownEditorComponent]
})
export class RuleEditorComponent {
    readonly rule = input.required<AgentRuleViewModel>();
    readonly saved = output<AgentRule>();
    readonly cancelled = output<AgentRuleViewModel>();

    readonly name = signal('');
    readonly description = signal('');

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
}
