import { Component, computed, inject, OnInit } from '@angular/core';
import { ProjectService } from '../../services/project.service';
import { IconComponent } from '../icon/icon.component';

@Component({
    selector: 'mtx-header',
    templateUrl: 'header.component.html',
    imports: [IconComponent]
})
export class HeaderComponent implements OnInit {
    projectService = inject(ProjectService);
    currentProjectPath = computed(() => this.projectService.projectPath());

    constructor() { }

    ngOnInit() { }
}