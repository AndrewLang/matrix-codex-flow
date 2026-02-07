import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ProjectSessionStore {
  readonly activeProjectPath = signal<string | null>(null);

  openProject(path: string): void {
    this.activeProjectPath.set(path);
  }

  closeProject(): void {
    this.activeProjectPath.set(null);
  }
}
