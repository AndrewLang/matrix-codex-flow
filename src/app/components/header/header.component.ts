import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit } from '@angular/core';
import { ProjectService } from '../../services/project.service';
import { TaskService } from '../../services/task.service';
import { IconComponent } from '../icon/icon.component';

@Component({
    selector: 'mtx-header',
    templateUrl: 'header.component.html',
    imports: [CommonModule, IconComponent]
})
export class HeaderComponent implements OnInit {
    projectService = inject(ProjectService);
    taskService = inject(TaskService);
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
}
