import { Component, computed, inject, signal } from '@angular/core';

import { SettingService } from '../../services/setting.service';
import { MarkdownEditorComponent } from '../md-editor/md.editor.component';

@Component({
    selector: 'mtx-settings',
    templateUrl: 'settings.component.html',
    imports: [MarkdownEditorComponent]
})
export class SettingsComponent {
    private readonly settingService = inject(SettingService);

    protected readonly agentProvider = signal(this.settingService.agentProvider());
    protected readonly promptTemplate = signal(this.settingService.promptTemplate());
    protected readonly generateVibeflowFolder = signal(this.settingService.generateVibeflowFolder());
    protected readonly hasUnsavedChanges = computed(() => {
        return (
            this.agentProvider() !== this.settingService.agentProvider() ||
            this.promptTemplate() !== this.settingService.promptTemplate() ||
            this.generateVibeflowFolder() !== this.settingService.generateVibeflowFolder()
        );
    });

    protected setAgentProvider(value: string): void {
        this.agentProvider.set(value);
    }

    protected setPromptTemplate(value: string): void {
        this.promptTemplate.set(value);
    }

    protected setGenerateVibeflowFolder(value: boolean): void {
        this.generateVibeflowFolder.set(value);
    }

    protected saveSettings(): void {
        this.settingService.updateSettingValue('agent.provider', this.agentProvider());
        this.settingService.updateSettingValue('prompt.template', this.promptTemplate().trim());
        this.settingService.updateSettingValue('project.generateVibeflowFolder', this.generateVibeflowFolder());
    }

    protected resetToDefault(): void {
        this.settingService.resetSettings();
        this.agentProvider.set(this.settingService.agentProvider());
        this.promptTemplate.set(this.settingService.promptTemplate());
        this.generateVibeflowFolder.set(this.settingService.generateVibeflowFolder());
    }
}
