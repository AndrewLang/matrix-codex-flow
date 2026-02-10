import { Component, computed, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AppService } from '../../services/app.service';
import { ProjectService } from '../../services/project.service';
import { IconComponent } from "../icon/icon.component";

@Component({
    selector: 'mtx-home',
    imports: [RouterModule, IconComponent],
    templateUrl: 'home.component.html'
})
export class HomeComponent {
    private readonly appService = inject(AppService);
    readonly projectService = inject(ProjectService);
    readonly router = inject(Router);

    readonly title = computed(() => this.appService.splashName);
    readonly recentProjectPaths = computed(() => this.projectService.recentProjectPaths());

    async openProject(): Promise<void> {
        const selectedProjectPath = await this.projectService.chooseFolder();

        if (!selectedProjectPath) {
            return;
        }

        await this.router.navigate(['/workspace']);
    }

    async openRecentProject(path: string): Promise<void> {
        const project = await this.projectService.loadOrCreateProjectByPath(path);

        if (!project) {
            return;
        }

        await this.router.navigate(['/workspace']);
    }

    displayProjectName(path: string): string {
        const normalizedPath = path.replaceAll('\\', '/');
        const segments = normalizedPath.split('/').filter((segment) => segment.length > 0);
        return segments[segments.length - 1] ?? path;
    }
}
