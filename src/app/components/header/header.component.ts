import { Component, computed, inject, OnInit } from '@angular/core';
import { ProjectService } from '../../services/project.service';

@Component({
    selector: 'mtx-header',
    templateUrl: 'header.component.html',
    imports: []
})
export class HeaderComponent implements OnInit {
    projectService = inject(ProjectService);
    currentProjectPath = computed(() => this.projectService.projectPath());

    constructor() { }

    ngOnInit() { }
}