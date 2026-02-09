import { DatePipe } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { invoke } from '@tauri-apps/api/core';

import { AgentRule, AgentRuleViewModel } from '../../models/agent.rule';
import { CommandDescriptor } from '../../models/command';
import { IdGenerator } from '../../models/id';
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
export class ContextComponent {
    private readonly projectService = inject(ProjectService);

    readonly ruleViewModels = computed(() => {
        let project = this.projectService.currentProject();
        return project?.rules.map(rule => {
            let viewModel = new AgentRuleViewModel(rule);
            return viewModel;
        }) ?? [];
    });

    readonly project = computed(() => this.projectService.currentProject());

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

        this.projectService.currentProject.update((project) =>
            project
                ? {
                    ...project,
                    rules: [...project.rules, newRule],
                    updatedAt: Date.now()
                }
                : project
        );
    }

    async downloadAgentRules(): Promise<void> {
        let project = this.project();
        if (!project) {
            return;
        }

        let normalizedProjectPath = project.path.replace(/[\\/]+$/, '');

        try {
            for (const rule of project.rules) {
                const safeFileName = this.toSafeFileName(rule.name || rule.id);
                const targetFilePath = `${normalizedProjectPath}/.vibeflow/${safeFileName}.md`;
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

        this.syncToProjectRules(existingRule);

        existingRuleViewModel?.isEditing.set(false);
    }

    deleteRule(ruleId: string): void {
        this.projectService.currentProject.update((project) =>
            project
                ? {
                    ...project,
                    rules: project.rules.filter((rule) => rule.id !== ruleId),
                    updatedAt: Date.now()
                }
                : project
        );
    }

    private syncToProjectRules(updated: AgentRule): void {
        this.projectService.currentProject.update((project) =>
            project
                ? {
                    ...project,
                    rules: project.rules.map((rule) => rule.id === updated.id ? updated : rule),
                    updatedAt: Date.now()
                }
                : project
        );
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
