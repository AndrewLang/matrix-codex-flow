import { Component, computed, inject, OnDestroy, OnInit, signal } from '@angular/core';

import { CommandDescriptor } from '../../models/command';
import { AppSetting } from '../../models/setting.model';
import { SettingService } from '../../services/setting.service';
import { ShortcutService } from '../../services/shortcut.service';
import { WorkspaceHeaderComponent } from '../workspace/workspace.header.component';
import { AgentSettingsComponent } from './agent.settings.component';
import { ContextSettingsComponent } from './context.settings.component';
import { TemplateSettingsComponent } from './template.settings.component';

@Component({
  selector: 'mtx-settings',
  templateUrl: 'settings.component.html',
  imports: [AgentSettingsComponent, TemplateSettingsComponent,
    WorkspaceHeaderComponent, ContextSettingsComponent],
})
export class SettingsComponent implements OnInit, OnDestroy {
  private readonly settingService = inject(SettingService);
  private readonly shortcutService = inject(ShortcutService);

  protected readonly headerRightCommands = computed<CommandDescriptor[]>(() => [
    {
      id: 'save-settings', title: '',
      description: 'Save Settings', icon: 'floppy', action: () => this.saveSettings()
    },
  ]);
  appSetting = signal<AppSetting>(new AppSetting([]));
  isLoading = signal(false);

  async ngOnInit() {
    this.isLoading.set(true);

    let settings = await this.settingService.load();
    this.appSetting.set(settings);

    this.shortcutService.register('ctrl+s', () => this.saveSettings());
    this.isLoading.set(false);
  }

  ngOnDestroy() {
    this.shortcutService.unregister('ctrl+s');
  }

  protected saveSettings(): void {
    this.settingService.save();
  }

  protected resetToDefault(): void {
  }
}
