import { Directive, HostListener } from '@angular/core';

@Directive({
    selector: '[appDisableContextMenu]',
    standalone: true,
})
export class DisableContextMenuDirective {
    @HostListener('document:contextmenu', ['$event'])
    onRightClick(event: MouseEvent) {
        event.preventDefault();
    }
}
