import { CommonModule } from '@angular/common';
import { Component, Input, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NavItem } from '../../models/nav.model';
import { IconComponent } from '../icon/icon.component';

@Component({
    selector: 'mtx-sidebar',
    templateUrl: './sidebar.component.html',
    imports: [RouterLink, RouterLinkActive, IconComponent, CommonModule],
})
export class SidebarComponent {
    @Input({ required: true })
    items: NavItem[] = [];

    protected readonly isCollapsed = signal(true);

    protected toggleCollapse(): void {
        this.isCollapsed.update((value) => !value);
    }

    protected isLeaf(item: NavItem): boolean {
        return !item.children || item.children.length === 0;
    }

    protected iconLabel(icon?: string): string {
        return (icon ?? '?').slice(0, 1).toUpperCase();
    }
}
