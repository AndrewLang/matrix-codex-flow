import { Component, computed, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavService } from '../../services/nav.service';
import { NotificationService } from '../../services/notification.service';
import { ProjectService } from '../../services/project.service';
import { ShortcutService } from '../../services/shortcut.service';
import { HeaderComponent } from '../header/header.component';

@Component({
    selector: 'mtx-workspace',
    templateUrl: 'workspace.component.html',
    imports: [RouterOutlet, HeaderComponent,]
})
export class WorkspaceComponent implements OnInit, OnDestroy {
    private readonly projectService = inject(ProjectService);
    private readonly notificationService = inject(NotificationService);
    private readonly navService = inject(NavService);
    private readonly shortcutService = inject(ShortcutService);

    private isSaving = signal(false);
    readonly notification = this.notificationService.notification;

    readonly navItems = computed(() => this.navService.navItems);
    readonly bottomNavItems = computed(() => this.navService.bottomNavItems);

    async ngOnInit() {
        this.shortcutService.register('ctrl+s', () => this.saveProject());
    }

    ngOnDestroy() {
        this.shortcutService.unregister('ctrl+s');
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
