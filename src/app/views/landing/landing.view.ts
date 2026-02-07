import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ProjectSessionStore } from '../../state/project-session.store';
import { TaskChainStore } from '../../state/task-chain.store';

@Component({
  selector: 'app-landing-view',
  standalone: true,
  templateUrl: './landing.view.html',
})
export class LandingView {
  private readonly router = inject(Router);
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
}
