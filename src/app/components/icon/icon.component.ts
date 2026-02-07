import { Component, input, OnInit } from '@angular/core';

@Component({
    selector: 'mtx-icon',
    templateUrl: 'icon.component.html'
})
export class IconComponent implements OnInit {
    icon = input<string>('');
    iconPrefix = input<string>('bi');

    constructor() { }

    ngOnInit() { }
}