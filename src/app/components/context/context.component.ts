import { DatePipe } from '@angular/common';
import { Component, computed, inject, SecurityContext, signal } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { marked } from 'marked';

import { AgentRule, AgentRuleViewModel } from '../../models/agent.rule';
import { CommandDescriptor } from '../../models/command';
import { ContextService } from '../../services/context.service';
import { IconComponent } from "../icon/icon.component";
import { MarkdownEditorComponent } from '../md-editor/md.editor.component';
import { MarkdownRendererComponent } from '../md-renderer/md.renderer.component';
import { WorkspaceHeaderComponent } from '../workspace/workspace.header.component';

const INITIAL_AGENT_RULES: AgentRule[] = [];

@Component({
    selector: 'mtx-context-manage',
    templateUrl: 'context.component.html',
    imports: [DatePipe, IconComponent, MarkdownEditorComponent, MarkdownRendererComponent, WorkspaceHeaderComponent]
})
export class ContextComponent {
    private readonly contextService = inject(ContextService);
    readonly agentRules = this.contextService.agentRules;

    readonly headerRightCommands = computed<CommandDescriptor[]>(() => [
        {
            id: 'add-rule',
            title: 'Add Rule',
            icon: 'plus',
            action: () => this.addAgentRule()
        },
        {
            id: 'download-rules',
            title: 'Download',
            icon: 'box-arrow-down',
            action: () => this.downloadAgentRules()
        }
    ]);
    readonly collapsedRuleIds = signal<Record<string, boolean>>(
        INITIAL_AGENT_RULES.reduce<Record<string, boolean>>((state, rule) => {
            state[rule.id] = true;
            return state;
        }, {})
    );
    readonly editingRuleIds = signal<Record<string, boolean>>({});
    readonly editDrafts = signal<Record<string, AgentRuleViewModel>>({});
    private readonly sanitizer = inject(DomSanitizer);

    addAgentRule(): void {
        const currentTimestamp = Date.now();
        const nextIndex = this.agentRules().length + 1;

        const nextAgentRule: AgentRule = {
            id: `rule-${currentTimestamp}`,
            name: `rule-${nextIndex}`,
            description: `New project rule ${nextIndex}. Update this with specific context guidance.`,
            createdAt: currentTimestamp,
            updatedAt: currentTimestamp
        };

        this.contextService.addRule(nextAgentRule);
        this.collapsedRuleIds.update((state) => ({ ...state, [nextAgentRule.id]: true }));
    }

    downloadAgentRules(): void {
    }

    toggleRuleCollapse(ruleId: string): void {
        this.collapsedRuleIds.update((state) => ({
            ...state,
            [ruleId]: !state[ruleId]
        }));
    }

    isRuleCollapsed(ruleId: string): boolean {
        return this.collapsedRuleIds()[ruleId] ?? true;
    }

    startEdit(rule: AgentRule): void {
        this.editingRuleIds.update((state) => ({ ...state, [rule.id]: true }));
        this.editDrafts.update((state) => ({
            ...state,
            [rule.id]: {
                name: rule.name,
                description: rule.description ?? ''
            }
        }));
    }

    cancelEdit(ruleId: string): void {
        this.editingRuleIds.update((state) => ({ ...state, [ruleId]: false }));
    }

    isRuleEditing(ruleId: string): boolean {
        return this.editingRuleIds()[ruleId] ?? false;
    }

    updateDraftName(ruleId: string, value: string): void {
        this.editDrafts.update((state) => ({
            ...state,
            [ruleId]: {
                name: value,
                description: state[ruleId]?.description ?? ''
            }
        }));
    }

    updateDraftDescription(ruleId: string, value: string): void {
        this.editDrafts.update((state) => ({
            ...state,
            [ruleId]: {
                name: state[ruleId]?.name ?? '',
                description: value
            }
        }));
    }

    getDraftName(rule: AgentRule): string {
        return this.editDrafts()[rule.id]?.name ?? rule.name;
    }

    getDraftDescription(rule: AgentRule): string {
        return this.editDrafts()[rule.id]?.description ?? (rule.description ?? '');
    }

    renderMarkdownPreview(content: string): string {
        const rawHtml = marked.parse(content, { async: false, breaks: true, gfm: true });
        return this.sanitizer.sanitize(SecurityContext.HTML, rawHtml) ?? '';
    }

    saveEdit(ruleId: string): void {
        const draft = this.editDrafts()[ruleId];

        if (!draft) {
            return;
        }

        const trimmedName = draft.name.trim();
        const trimmedDescription = draft.description.trim();

        if (!trimmedName) {
            return;
        }

        const currentTimestamp = Date.now();

        this.contextService.updateRule(
            ruleId,
            trimmedName,
            trimmedDescription || undefined,
            currentTimestamp
        );

        this.editingRuleIds.update((state) => ({ ...state, [ruleId]: false }));
    }

    deleteRule(ruleId: string): void {
        this.contextService.deleteRule(ruleId);

        this.collapsedRuleIds.update((state) => {
            const nextState = { ...state };
            delete nextState[ruleId];
            return nextState;
        });

        this.editingRuleIds.update((state) => {
            const nextState = { ...state };
            delete nextState[ruleId];
            return nextState;
        });

        this.editDrafts.update((state) => {
            const nextState = { ...state };
            delete nextState[ruleId];
            return nextState;
        });
    }
}
