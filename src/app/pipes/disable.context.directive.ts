import { Directive, HostListener } from '@angular/core';

@Directive({
    selector: '[disableContextMenu]'
})
export class DisableContextMenuDirective {
    @HostListener('contextmenu', ['$event'])
    onRightClick(event: MouseEvent) {
        event.preventDefault();
    }
}
