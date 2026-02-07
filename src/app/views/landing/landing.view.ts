import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FolderPickerService } from '../../services/folder-picker.service';
import { ProjectSessionStore } from '../../state/project-session.store';
import { TaskChainStore } from '../../state/task-chain.store';
import { UiButton } from '../../ui/ui.button';
import { UiPanel } from '../../ui/ui.panel';

@Component({
  selector: 'app-landing-view',
  standalone: true,
  imports: [UiButton, UiPanel],
  templateUrl: './landing.view.html',
})
export class LandingView {
  private readonly router = inject(Router);
  private readonly folderPickerService = inject(FolderPickerService);
  protected readonly sessionStore = inject(ProjectSessionStore);
  protected readonly taskChainStore = inject(TaskChainStore);
  protected readonly projectPath = signal<string>('');

  protected onProjectPathInput(event: Event): void {
    const input = event.target as HTMLInputElement | null;
    this.projectPath.set(input?.value ?? '');
  }

  protected async openProject(): Promise<void> {
    const normalizedPath = this.projectPath().trim();
    if (!normalizedPath) {
      return;
    }
    this.sessionStore.openProject(normalizedPath);
    await this.router.navigate(['/chat']);
  }

  protected async goToChains(): Promise<void> {
    await this.router.navigate(['/chains']);
  }

  protected async goToSettings(): Promise<void> {
    if (!this.sessionStore.activeProjectPath()) {
      return;
    }
    await this.router.navigate(['/settings']);
  }

  protected async pickFolder(): Promise<void> {
    const path = await this.folderPickerService.pickFolder();
    if (!path) {
      return;
    }
    this.projectPath.set(path);
  }
}
