import { Component, computed, effect, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import {
  DEFAULT_PROJECT_SETTINGS,
  ProjectSettingsStore,
} from '../../state/project-settings.store';
import { ProjectSessionStore } from '../../state/project-session.store';
import { UiButton } from '../../ui/ui.button';
import { UiPanel } from '../../ui/ui.panel';

@Component({
  selector: 'app-project-settings-view',
  standalone: true,
  imports: [UiButton, UiPanel],
  templateUrl: './project-settings.view.html',
})
export class ProjectSettingsView {
  private readonly router = inject(Router);
  private readonly sessionStore = inject(ProjectSessionStore);
  protected readonly settingsStore = inject(ProjectSettingsStore);
  protected readonly projectPath = computed(() => this.sessionStore.activeProjectPath());
  protected readonly projectName = computed(() => {
    const path = this.projectPath();
    if (!path) {
      return '';
    }
    const parts = path.split(/[\\/]/).filter((part) => part.length > 0);
    return parts.at(-1) ?? path;
  });
  protected readonly settings = this.settingsStore.currentSettings;
  protected readonly newGateCommand = signal<string>('');

  constructor() {
    effect(() => {
      const activeProjectPath = this.projectPath();
      if (!activeProjectPath) {
        return;
      }
      this.settingsStore.loadForProject(activeProjectPath);
    });
  }

  protected async goToLanding(): Promise<void> {
    await this.router.navigate(['/']);
  }

  protected onRequireUnitTestsChange(event: Event): void {
    const input = event.target as HTMLInputElement | null;
    this.settingsStore.update({
      requireUnitTests: input?.checked ?? DEFAULT_PROJECT_SETTINGS.requireUnitTests,
    });
  }

  protected onRequireGatesPassChange(event: Event): void {
    const input = event.target as HTMLInputElement | null;
    this.settingsStore.update({
      requireGatesPass: input?.checked ?? DEFAULT_PROJECT_SETTINGS.requireGatesPass,
    });
  }

  protected onGlobalRequirementsInput(event: Event): void {
    const textarea = event.target as HTMLTextAreaElement | null;
    this.settingsStore.update({
      globalRequirements: textarea?.value ?? '',
    });
  }

  protected onNewGateCommandInput(event: Event): void {
    const input = event.target as HTMLInputElement | null;
    this.newGateCommand.set(input?.value ?? '');
  }

  protected onNewGateCommandKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.addGateCommand();
    }
  }

  protected addGateCommand(): void {
    const nextCommand = this.newGateCommand().trim();
    if (!nextCommand) {
      return;
    }

    const currentCommands = this.settings().gateCommands;
    if (currentCommands.includes(nextCommand)) {
      this.newGateCommand.set('');
      return;
    }

    this.settingsStore.update({
      gateCommands: [...currentCommands, nextCommand],
    });
    this.newGateCommand.set('');
  }

  protected removeGateCommand(commandToRemove: string): void {
    this.settingsStore.update({
      gateCommands: this.settings().gateCommands.filter((command) => command !== commandToRemove),
    });
  }

  protected resetToDefaults(): void {
    this.settingsStore.resetToDefaults();
  }
}
