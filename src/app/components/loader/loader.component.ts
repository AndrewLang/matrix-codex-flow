import { Component, input, OnInit } from '@angular/core';

@Component({
    selector: 'mtx-loader',
    templateUrl: 'loader.component.html'
})
export class LoaderComponent implements OnInit {
    label = input<string>('Loading...');

    constructor() { }

    ngOnInit() { }
}