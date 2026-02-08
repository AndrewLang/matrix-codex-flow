import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { StatusMessage } from '../../models/status.message';
import { ProjectService } from '../../services/project.service';
import { IconComponent } from '../icon/icon.component';

@Component({
    selector: 'mtx-header',
    templateUrl: 'header.component.html',
    imports: [CommonModule, IconComponent]
})
export class HeaderComponent implements OnInit {
    projectService = inject(ProjectService);
    currentProjectPath = computed(() => this.projectService.projectPath());
    message = signal<StatusMessage | null>(null);

    constructor() { }

    ngOnInit() { }

    openFolder(): void {
        void this.projectService.revealProjectInFolder();
    }

    async saveProject(): Promise<void> {
        const project = this.projectService.currentProject();
        if (!project) {
            console.warn('No project to save');
            return;
        }
        try {
            this.projectService.saveProject(project);
            this.setMessage({ content: 'Project saved', type: 'success', timestamp: new Date() });
        } catch {
            this.setMessage({ content: 'Failed to save project', type: 'error', timestamp: new Date() });
        }
    }

    setMessage(msg: StatusMessage): void {
        this.message.set(msg);
        setTimeout(() => this.message.set(null), 5000);
    }
}