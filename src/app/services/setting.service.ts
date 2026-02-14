import { Injectable, signal } from '@angular/core';
import { invoke } from '@tauri-apps/api/core';
import { AgentConfig } from '../models/agent.provider';
import { AppSetting, SettingKeys, SettingModel } from '../models/setting.model';

@Injectable({ providedIn: 'root' })
export class SettingService {
  private _appSetting = signal<AppSetting>(new AppSetting([]));
  isLoaded = signal(false);

  get appSetting() {
    return this._appSetting.asReadonly();
  }

  constructor() {
    this.load();
  }

  async save() {
    try {
      await invoke('save_settings', { settings: this._appSetting().settings });
    } catch (e) {
      console.error('Failed to save settings', e);
    }
  }

  async load(): Promise<AppSetting> {
    try {
      const settings = await invoke<SettingModel[]>('load_settings');

      this._appSetting.set(new AppSetting(settings));

      return this._appSetting();
    } catch {
      return new AppSetting([]);
    }
    finally {
      this.isLoaded.set(true);
    }
  }

  async getActiveAgentConfig() {
    if (!this.isLoaded()) {
      await this.load();
    }

    const agentConfigs = this._appSetting().getSettingValue<AgentConfig[]>(SettingKeys.AGENT_CONFIGS_SETTING) ?? [];
    return agentConfigs.find(agent => agent.isDefault) ?? agentConfigs[0] ?? null;
  }
}
