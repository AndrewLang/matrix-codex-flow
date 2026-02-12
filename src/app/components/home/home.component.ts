import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AppService } from '../../services/app.service';
import { ProjectService } from '../../services/project.service';
import { IconComponent } from "../icon/icon.component";
import { WarnComponent } from '../warn/warn.component';

@Component({
    selector: 'mtx-home',
    imports: [RouterModule, CommonModule, IconComponent, WarnComponent],
    templateUrl: 'home.component.html'
})
export class HomeComponent {
    private readonly appService = inject(AppService);
    private readonly projectService = inject(ProjectService);
    readonly router = inject(Router);

    readonly title = computed(() => this.appService.splashName);
    readonly recentProjectPaths = computed(() => this.projectService.recentProjectPaths());
    readonly gitInstalled = computed(() => this.appService.isGitInstalled());
    readonly codexInstalled = computed(() => this.appService.isCodexInstalled());
    readonly gitVersion = computed(() => this.appService.gitInfo());
    readonly codexVersion = computed(() => this.appService.codexVersion());

    constructor() {

    }

    async newProject(): Promise<void> {
        const selectedProjectPath = await this.projectService.chooseFolder();
        if (!selectedProjectPath) {
            return;
        }
        await this.projectService.initProject(selectedProjectPath);
        await this.router.navigate(['/workspace']);
    }

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

    async removeProject(path: string, event: Event): Promise<void> {
        event.stopPropagation();
        let project = this.projectService.recentProjects().find(p => p.path === path);
        if (project) {
            await this.projectService.deleteProject(project.id);
        }
    }

    displayProjectName(path: string): string {
        return this.projectService.getPathName(path);
    }
}
