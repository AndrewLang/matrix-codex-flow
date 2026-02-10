import { DatePipe } from '@angular/common';
import { Component, computed, inject, OnDestroy } from '@angular/core';
import { invoke } from '@tauri-apps/api/core';

import { AgentRule, AgentRuleViewModel } from '../../models/agent.rule';
import { CommandDescriptor } from '../../models/command';
import { IdGenerator } from '../../models/id';
import { ProjectExtensions } from "../../models/project.extensions";
import { ProjectService } from '../../services/project.service';
import { IconComponent } from "../icon/icon.component";
import { MarkdownRendererComponent } from '../md-renderer/md.renderer.component';
import { WorkspaceHeaderComponent } from '../workspace/workspace.header.component';
import { RuleEditorComponent } from './rule.editor.component';

@Component({
    selector: 'mtx-context-manage',
    templateUrl: 'context.component.html',
    imports: [DatePipe, IconComponent, MarkdownRendererComponent,
        WorkspaceHeaderComponent, RuleEditorComponent]
})
export class ContextComponent implements OnDestroy {
    private readonly projectService = inject(ProjectService);
    private readonly savingSubscription = this.projectService.onSaving.subscribe(() => {
        console.log('Project is saving, refreshing context rules...');
    });
    readonly ruleViewModels = computed(() => {
        let project = this.projectService.currentProject();
        return project?.rules.map(rule => {
            let viewModel = new AgentRuleViewModel(rule);
            return viewModel;
        }) ?? [];
    });
    readonly headerRightCommands = computed<CommandDescriptor[]>(() => [
        {
            id: 'add-agents',
            title: 'Add AGENTS',
            description: 'AGENTS.md helps codex understand the context of your project.',
            icon: 'plus',
            isHidden: async () => await this.projectService.hasAgentsMd(),
            action: () => this.addAgentRule()
        },
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
    readonly hasRules = computed(() => this.ruleViewModels().length > 0);

    ngOnDestroy(): void {
        this.savingSubscription.unsubscribe();
    }

    addAgentRule(): void {
        let now = Date.now();
        let nextIndex = this.ruleViewModels().length + 1;

        const newRule: AgentRule = {
            id: IdGenerator.generateId(),
            name: `rule-${nextIndex}`,
            description: `Project rule ${nextIndex}. Update this with specific context guidance.`,
            createdAt: now,
            updatedAt: now
        };

        ProjectExtensions.addRule(this.projectService.currentProject, newRule);
    }

    async downloadAgentRules(): Promise<void> {
        let project = this.projectService.currentProject();
        if (!project) {
            return;
        }

        let normalizedProjectPath = project.path.replace(/[\\/]+$/, '');

        try {
            for (const rule of project.rules) {
                const safeFileName = this.toSafeFileName(rule.name || rule.id);
                const targetFilePath = `${normalizedProjectPath}/.codex/${safeFileName}.md`;
                await invoke('write_text_file', {
                    path: targetFilePath,
                    content: rule.description?.trim() ?? ''
                });
            }
        } catch (error) {
            console.error('Failed to export agent rules:', error);
        }
    }

    toggleRuleExpand(rule: AgentRuleViewModel): void {
        rule.isExpanded.set(!rule.isExpanded());
    }

    startEdit(rule: AgentRuleViewModel): void {
        rule.isEditing.set(true);
    }

    cancelEdit(rule: AgentRuleViewModel): void {
        rule.isEditing.set(false);
    }

    saveEdit(rule: AgentRule): void {
        let existingRuleViewModel = this.ruleViewModels().find((r) => r.id === rule.id);
        if (!existingRuleViewModel) {
            return;
        }
        let existingRule = existingRuleViewModel?.toAgentRule();
        let now = Date.now();

        existingRule = rule ? {
            ...rule,
            updatedAt: now
        } : existingRule;

        ProjectExtensions.updateRule(this.projectService.currentProject, existingRule!);

        existingRuleViewModel?.isEditing.set(false);
    }

    deleteRule(ruleId: string): void {
        ProjectExtensions.deleteRule(this.projectService.currentProject, ruleId);
    }

    private toSafeFileName(value: string): string {
        const sanitized = value
            .trim()
            .toLowerCase()
            .replace(/[<>:"/\\|?*\x00-\x1F]/g, ' ')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '');

        return sanitized || 'rule';
    }
}
