import { CommonModule } from '@angular/common';
import { Component, input, signal } from '@angular/core';
import { CommandDescriptor } from '../../models/command';
import { CommandStripComponent } from './command.strip.component';

@Component({
    selector: 'mtx-commandbar',
    templateUrl: 'commandbar.component.html',
    imports: [CommonModule, CommandStripComponent]
})
export class CommandBarComponent {
    leftLabel = input<string>('');
    leftCommands = input<CommandDescriptor[]>([]);
    rightCommands = input<CommandDescriptor[]>([]);

    readonly openSubCommandMenuId = signal<string | null>(null);

    hasLeftCommands(): boolean {
        return this.leftCommands().length > 0;
    }
}
