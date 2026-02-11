import { Component, input, OnInit } from '@angular/core';

@Component({
    selector: 'mtx-warn',
    templateUrl: 'warn.component.html'
})
export class WarnComponent implements OnInit {
    message = input<string>('');
    on = input<boolean>(true);

    constructor() { }

    ngOnInit() { }
}