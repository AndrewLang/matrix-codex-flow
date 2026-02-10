import { Component, HostListener, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavItem } from '../../models/nav.model';
import { NotificationService } from '../../services/notification.service';
import { ProjectService } from '../../services/project.service';
import { TaskService } from '../../services/task.service';
import { HeaderComponent } from '../header/header.component';
import { NotificationComponent } from '../notification/notification.component';
import { SidebarComponent } from '../sidebar/sidebar.component';

@Component({
    selector: 'mtx-workspace',
    templateUrl: 'workspace.component.html',
    imports: [SidebarComponent, RouterOutlet, HeaderComponent, NotificationComponent]
})
export class WorkspaceComponent {
    private readonly projectService = inject(ProjectService);
    private readonly taskService = inject(TaskService);
    private readonly notificationService = inject(NotificationService);
    private isSaving = signal(false);
    protected readonly notification = this.notificationService.notification;

    protected readonly navItems: NavItem[] = [
        { label: 'Home', icon: 'house text-xl', route: '/' },
        { label: 'Chat', icon: 'chat text-xl', route: '/workspace/chat' },
        { label: 'Context', icon: 'briefcase text-xl', route: '/workspace/context' },
        { label: 'Tasks', icon: 'list-task text-xl', route: '/workspace/tasks' },
    ];

    @HostListener('window:keydown', ['$event'])
    protected onWindowKeyDown(event: KeyboardEvent): void {
        const key = (event.key ?? '').toLowerCase();
        if ((event.ctrlKey || event.metaKey) && key === 's') {
            event.preventDefault();
            void this.saveProject();
        }
    }

    private async saveProject(): Promise<void> {
        if (this.isSaving()) {
            return;
        }

        const project = this.projectService.currentProject();
        if (!project) {
            return;
        }

        this.isSaving.set(true);

        try {
            await this.projectService.saveProject();
        } finally {
            this.isSaving.set(false);
            this.notificationService.show({
                message: 'Project saved successfully',
                type: 'success'
            });
        }
    }
}
