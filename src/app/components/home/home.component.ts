import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'mtx-home',
    imports: [RouterLink],
    templateUrl: 'home.component.html'
})
export class HomeComponent {
    protected readonly title = signal('Agent Workflow');
}
