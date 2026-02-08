import { Component, HostListener, inject, OnDestroy, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavItem } from '../../models/nav.model';
import { ContextService } from '../../services/context.service';
import { ProjectService } from '../../services/project.service';
import { TaskService } from '../../services/task.service';
import { HeaderComponent } from '../header/header.component';
import { SidebarComponent } from '../sidebar/sidebar.component';

@Component({
    selector: 'mtx-workspace',
    templateUrl: 'workspace.component.html',
    imports: [SidebarComponent, RouterOutlet, HeaderComponent]
})
export class WorkspaceComponent implements OnDestroy {
    private readonly projectService = inject(ProjectService);
    private readonly contextService = inject(ContextService);
    private readonly taskService = inject(TaskService);
    private isSaving = false;
    private saveIndicatorTimer: ReturnType<typeof setTimeout> | null = null;
    protected readonly saveMessage = signal('');
    protected readonly saveMessageType = signal<'success' | 'error'>('success');

    protected readonly navItems: NavItem[] = [
        { label: 'Home', icon: 'house text-xl', route: '/' },
        { label: 'Chat', icon: 'chat text-xl', route: '/workspace/chat' },
        { label: 'Context', icon: 'briefcase text-xl', route: '/workspace/context' },
        { label: 'Tasks', icon: 'list-task text-xl', route: '/workspace/tasks' },
    ];

    @HostListener('window:keydown', ['$event'])
    protected onWindowKeyDown(event: KeyboardEvent): void {
        if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') {
            event.preventDefault();
            void this.saveProjectFromShortcut();
        }
    }

    private async saveProjectFromShortcut(): Promise<void> {
        if (this.isSaving) {
            return;
        }

        const project = this.projectService.currentProject();
        if (!project) {
            return;
        }

        this.isSaving = true;

        const projectToSave = {
            ...project,
            rules: this.contextService.agentRules().map((rule) => ({ ...rule })),
            tasks: this.taskService.tasks().map((task) => ({ ...task })),
            updatedAt: Date.now()
        };

        this.projectService.currentProject.set(projectToSave);

        try {
            await this.projectService.saveProject(projectToSave);
            this.showSaveIndicator('Project saved', 'success');
        } catch {
            this.showSaveIndicator('Failed to save project', 'error');
        } finally {
            this.isSaving = false;
        }
    }

    private showSaveIndicator(message: string, type: 'success' | 'error'): void {
        this.saveMessage.set(message);
        this.saveMessageType.set(type);

        if (this.saveIndicatorTimer) {
            clearTimeout(this.saveIndicatorTimer);
        }

        this.saveIndicatorTimer = setTimeout(() => {
            this.saveMessage.set('');
            this.saveIndicatorTimer = null;
        }, 2500);
    }

    ngOnDestroy(): void {
        if (this.saveIndicatorTimer) {
            clearTimeout(this.saveIndicatorTimer);
            this.saveIndicatorTimer = null;
        }
    }
}
