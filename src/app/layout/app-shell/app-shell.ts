import { Component, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { UiButton } from '../../ui/ui.button';

type NavItem = {
  readonly icon: string;
  readonly label: string;
  readonly path: string;
};

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterOutlet, UiButton],
  templateUrl: './app-shell.html',
})
export class AppShell {
  protected readonly isSidebarCollapsed = signal<boolean>(true);
  protected readonly navItems: readonly NavItem[] = [
    { icon: 'bi-house-door', label: 'Home', path: '/' },
    { icon: 'bi-chat-dots', label: 'Chat', path: '/chat' },
    { icon: 'bi-gear', label: 'Settings', path: '/settings' },
    { icon: 'bi-bezier2', label: 'Chains', path: '/chains' },
  ];

  protected toggleSidebar(): void {
    this.isSidebarCollapsed.update((isCollapsed) => !isCollapsed);
  }
}
