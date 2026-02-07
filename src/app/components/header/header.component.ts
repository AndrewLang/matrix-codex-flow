import { Component, OnInit } from '@angular/core';
import { IconComponent } from '../icon/icon.component';

@Component({
    selector: 'mtx-header',
    templateUrl: 'header.component.html',
    imports: [IconComponent]
})
export class HeaderComponent implements OnInit {
    constructor() { }

    ngOnInit() { }
}