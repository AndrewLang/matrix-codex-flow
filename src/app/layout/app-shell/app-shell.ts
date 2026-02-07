import { Component, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { UiButton } from '../../ui/ui.button';

type NavItem = {
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
  protected readonly isSidebarCollapsed = signal<boolean>(false);
  protected readonly navItems: readonly NavItem[] = [
    { label: 'Landing', path: '/' },
    { label: 'Chat', path: '/chat' },
    { label: 'Settings', path: '/settings' },
    { label: 'Chains', path: '/chains' },
  ];

  protected toggleSidebar(): void {
    this.isSidebarCollapsed.update((isCollapsed) => !isCollapsed);
  }
}
