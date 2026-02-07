import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ProjectSessionStore } from '../../state/project-session.store';

@Component({
  selector: 'app-chat-view',
  standalone: true,
  templateUrl: './chat.view.html',
})
export class ChatView {
  protected readonly sessionStore = inject(ProjectSessionStore);
  private readonly router = inject(Router);

  protected async goToLanding(): Promise<void> {
    await this.router.navigate(['/']);
  }
}
