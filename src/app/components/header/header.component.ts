import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit } from '@angular/core';
import { ProjectService } from '../../services/project.service';
import { TaskService } from '../../services/task.service';
import { IconComponent } from '../icon/icon.component';
import { SvgComponent } from '../icon/svg.component';

@Component({
    selector: 'mtx-header',
    templateUrl: 'header.component.html',
    imports: [CommonModule, IconComponent, SvgComponent]
})
export class HeaderComponent implements OnInit {
    private readonly projectService = inject(ProjectService);
    private readonly taskService = inject(TaskService);
    currentProjectPath = computed(() => this.projectService.projectPath());

    constructor() { }

    ngOnInit() { }

    openFolder(): void {
        void this.projectService.revealProjectInFolder();
    }

    async saveProject(): Promise<void> {
        try {
            await this.projectService.saveProject();
        } catch {
            console.error('Failed to save project');
        }
    }

    async openInCode() {
        const project = this.projectService.currentProject();
        this.projectService.openInCode(project);
    }
}
