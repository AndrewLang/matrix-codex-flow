import { Injectable } from '@angular/core';
import { NavItem } from '../models/nav.model';

@Injectable({ providedIn: 'root' })
export class NavService {
    constructor() { }

    readonly navItems: NavItem[] = [
        { label: 'Home', icon: 'house text-xl', route: '/home' },
        { label: 'Chat', icon: 'chat-dots text-xl', route: '/app/workspace/chat' },
        { label: 'Context', icon: 'briefcase text-xl', route: '/app/workspace/context' },
        { label: 'Tasks', icon: 'list-task text-xl', route: '/app/workspace/tasks' },
    ];

    readonly bottomNavItems: NavItem[] = [
        { label: 'Settings', icon: 'gear text-xl', route: '/app/settings' }
    ];
}