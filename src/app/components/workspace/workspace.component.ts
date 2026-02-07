import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavItem } from '../../models/nav.model';
import { HeaderComponent } from '../header/header.component';
import { SidebarComponent } from '../sidebar/sidebar.component';

@Component({
    selector: 'mtx-workspace',
    templateUrl: 'workspace.component.html',
    imports: [SidebarComponent, RouterOutlet, HeaderComponent]
})
export class WorkspaceComponent implements OnInit {

    protected readonly navItems: NavItem[] = [
        { label: 'Home', icon: 'house text-2xl', route: '/' },
        { label: 'Chat', icon: 'chat text-2xl', route: '/workspace' },
        { label: 'Context', icon: 'briefcase text-2xl', route: '/workspace/context' },
        { label: 'Tasks', icon: 'list-task text-2xl', route: '/workspace/tasks' },
    ];
    constructor() { }

    ngOnInit() { }
}
