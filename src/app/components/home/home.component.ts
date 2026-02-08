import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { ProjectService } from '../../services/project.service';
import { IconComponent } from "../icon/icon.component";

@Component({
    selector: 'mtx-home',
    imports: [RouterModule, IconComponent],
    templateUrl: 'home.component.html'
})
export class HomeComponent {
    readonly title = signal('Agent Workflow');
    readonly recentProjectPaths = computed(() => this.projectService.recentProjectPaths());

    readonly projectService = inject(ProjectService);
    readonly router = inject(Router);

    async openProject(): Promise<void> {
        const selectedProjectPath = await this.projectService.chooseFolder();

        if (!selectedProjectPath) {
            return;
        }

        await this.router.navigate(['/workspace']);
    }

    async openRecentProject(path: string): Promise<void> {
        this.projectService.setProjectPath(path);
        await this.router.navigate(['/workspace']);
    }

    displayProjectName(path: string): string {
        const normalizedPath = path.replaceAll('\\', '/');
        const segments = normalizedPath.split('/').filter((segment) => segment.length > 0);
        return segments[segments.length - 1] ?? path;
    }
}
