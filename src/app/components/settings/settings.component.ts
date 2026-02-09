import { Component, computed, inject, signal } from '@angular/core';

import { CommandDescriptor } from '../../models/command';
import { SettingService } from '../../services/setting.service';
import { MarkdownEditorComponent } from '../md-editor/md.editor.component';
import { WorkspaceHeaderComponent } from '../workspace/workspace.header.component';

@Component({
    selector: 'mtx-settings',
    templateUrl: 'settings.component.html',
    imports: [MarkdownEditorComponent, WorkspaceHeaderComponent]
})
export class SettingsComponent {
    private readonly settingService = inject(SettingService);

    protected readonly agentProvider = signal(this.settingService.agentProvider());
    protected readonly codexApiKey = signal(this.settingService.codexApiKey());
    protected readonly agentModel = signal(this.settingService.agentModel());
    protected readonly promptTemplate = signal(this.settingService.promptTemplate());
    protected readonly generateVibeflowFolder = signal(this.settingService.generateVibeflowFolder());
    protected readonly hasUnsavedChanges = computed(() => {
        return (
            this.agentProvider() !== this.settingService.agentProvider() ||
            this.codexApiKey() !== this.settingService.codexApiKey() ||
            this.agentModel() !== this.settingService.agentModel() ||
            this.promptTemplate() !== this.settingService.promptTemplate() ||
            this.generateVibeflowFolder() !== this.settingService.generateVibeflowFolder()
        );
    });
    protected readonly headerRightCommands = computed<CommandDescriptor[]>(() => [
        { id: 'reset-settings', title: 'Reset', action: () => this.resetToDefault() },
        { id: 'save-settings', title: 'Save Settings', action: () => this.saveSettings() }
    ]);

    protected setAgentProvider(value: string): void {
        this.agentProvider.set(value);
    }

    protected setCodexApiKey(value: string): void {
        this.codexApiKey.set(value);
    }

    protected setAgentModel(value: string): void {
        this.agentModel.set(value);
    }

    protected setPromptTemplate(value: string): void {
        this.promptTemplate.set(value);
    }

    protected setGenerateVibeflowFolder(value: boolean): void {
        this.generateVibeflowFolder.set(value);
    }

    protected saveSettings(): void {
        if (!this.hasUnsavedChanges()) {
            return;
        }

        this.settingService.updateSettingValue('agent.provider', this.agentProvider());
        this.settingService.updateSettingValue('agent.codex.apiKey', this.codexApiKey().trim());
        this.settingService.updateSettingValue('agent.model', this.agentModel().trim());
        this.settingService.updateSettingValue('prompt.template', this.promptTemplate().trim());
        this.settingService.updateSettingValue('project.generateVibeflowFolder', this.generateVibeflowFolder());
    }

    protected resetToDefault(): void {
        this.settingService.resetSettings();
        this.agentProvider.set(this.settingService.agentProvider());
        this.codexApiKey.set(this.settingService.codexApiKey());
        this.agentModel.set(this.settingService.agentModel());
        this.promptTemplate.set(this.settingService.promptTemplate());
        this.generateVibeflowFolder.set(this.settingService.generateVibeflowFolder());
    }
}
