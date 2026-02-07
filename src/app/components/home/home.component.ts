import { Component, OnInit, signal } from '@angular/core';

@Component({
    selector: 'mtx-home',
    templateUrl: 'home.component.html'
})
export class HomeComponent implements OnInit {
    protected readonly title = signal('Agent Workflow');

    constructor() { }

    ngOnInit() { }
}