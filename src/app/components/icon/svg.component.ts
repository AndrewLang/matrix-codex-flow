import { Component, computed, inject, input, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Svgs } from '../../models/svg';

@Component({
    selector: 'mtx-svg',
    templateUrl: 'svg.component.html'
})
export class SvgComponent implements OnInit {
    private readonly sanitizer = inject(DomSanitizer);
    icon = input.required<string>();

    svgIcon = computed(() => {
        let icon = Svgs.empty();

        if (Svgs.has(this.icon())) {
            icon = Svgs.get(this.icon())!;
        }

        let normalizedSvg = this.normalize(icon.svg);
        return this.sanitizer.bypassSecurityTrustHtml(normalizedSvg);
    });

    size = input<string>('w-5 h-5');
    ariaLabel = input<string>('');
    fillColor = input<string>('currentColor');
    strokeColor = input<string>('currentColor');
    svgClass = input<string>('');
    strokeThickness = input<string>('1');

    constructor() { }

    ngOnInit() { }

    private normalize(svg: string): string {
        return svg;
    }
}