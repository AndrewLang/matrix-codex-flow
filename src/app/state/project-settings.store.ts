import { Injectable, signal } from '@angular/core';

export type ProjectSettings = {
  requireUnitTests: boolean;
  requireGatesPass: boolean;
  globalRequirements: string;
  gateCommands: string[];
};

export const PROJECT_SETTINGS_STORAGE_PREFIX = 'codexflow:project-settings:';
export const DEFAULT_PROJECT_SETTINGS: ProjectSettings = {
  requireUnitTests: true,
  requireGatesPass: true,
  globalRequirements: '',
  gateCommands: ['npm test'],
};

@Injectable({
  providedIn: 'root',
})
export class ProjectSettingsStore {
  readonly currentSettings = signal<ProjectSettings>({ ...DEFAULT_PROJECT_SETTINGS });
  private readonly currentProjectPath = signal<string | null>(null);

  loadForProject(path: string): void {
    this.currentProjectPath.set(path);
    const storageValue = this.readStorage(path);
    if (!storageValue) {
      this.currentSettings.set({ ...DEFAULT_PROJECT_SETTINGS });
      return;
    }
    try {
      const parsed = JSON.parse(storageValue) as Partial<ProjectSettings>;
      this.currentSettings.set(this.sanitizeSettings(parsed));
    } catch {
      this.currentSettings.set({ ...DEFAULT_PROJECT_SETTINGS });
    }
  }

  update(partial: Partial<ProjectSettings>): void {
    const next = this.sanitizeSettings({
      ...this.currentSettings(),
      ...partial,
    });
    this.currentSettings.set(next);
    this.persistCurrentProject(next);
  }

  resetToDefaults(): void {
    const defaults = { ...DEFAULT_PROJECT_SETTINGS };
    this.currentSettings.set(defaults);
    this.persistCurrentProject(defaults);
  }

  private persistCurrentProject(settings: ProjectSettings): void {
    const path = this.currentProjectPath();
    if (!path || typeof localStorage === 'undefined') {
      return;
    }
    localStorage.setItem(this.storageKey(path), JSON.stringify(settings));
  }

  private readStorage(path: string): string | null {
    if (typeof localStorage === 'undefined') {
      return null;
    }
    return localStorage.getItem(this.storageKey(path));
  }

  private storageKey(path: string): string {
    return `${PROJECT_SETTINGS_STORAGE_PREFIX}${encodeURIComponent(path)}`;
  }

  private sanitizeSettings(value: Partial<ProjectSettings>): ProjectSettings {
    const gateCommands = Array.isArray(value.gateCommands)
      ? value.gateCommands.map((command) => command.trim()).filter((command) => command.length > 0)
      : DEFAULT_PROJECT_SETTINGS.gateCommands;

    return {
      requireUnitTests:
        typeof value.requireUnitTests === 'boolean'
          ? value.requireUnitTests
          : DEFAULT_PROJECT_SETTINGS.requireUnitTests,
      requireGatesPass:
        typeof value.requireGatesPass === 'boolean'
          ? value.requireGatesPass
          : DEFAULT_PROJECT_SETTINGS.requireGatesPass,
      globalRequirements:
        typeof value.globalRequirements === 'string'
          ? value.globalRequirements
          : DEFAULT_PROJECT_SETTINGS.globalRequirements,
      gateCommands,
    };
  }
}
