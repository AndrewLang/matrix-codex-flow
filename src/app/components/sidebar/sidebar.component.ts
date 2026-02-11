import { CommonModule } from '@angular/common';
import { Component, input, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NavItem } from '../../models/nav.model';
import { IconComponent } from '../icon/icon.component';

@Component({
    selector: 'mtx-sidebar',
    templateUrl: './sidebar.component.html',
    imports: [RouterLink, RouterLinkActive, IconComponent, CommonModule],
})
export class SidebarComponent {
    items = input<NavItem[]>();
    settingRoute = input<string>('/workspace/settings');

    readonly isCollapsed = signal(true);

    toggleCollapse(): void {
        this.isCollapsed.update((value) => !value);
    }

    isLeaf(item: NavItem): boolean {
        return !item.children || item.children.length === 0;
    }

    iconLabel(icon?: string): string {
        return (icon ?? '?').slice(0, 1).toUpperCase();
    }
}
