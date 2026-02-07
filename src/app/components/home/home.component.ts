import { Component, inject, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { ProjectService } from '../../services/project.service';

@Component({
    selector: 'mtx-home',
    imports: [RouterModule],
    templateUrl: 'home.component.html'
})
export class HomeComponent {
    readonly title = signal('Agent Workflow');

    readonly projectService = inject(ProjectService);
    readonly router = inject(Router);

    async openProject() {
        await this.projectService.chooseFolder();

        this.router.navigate(['/workspace']);
    }
}
