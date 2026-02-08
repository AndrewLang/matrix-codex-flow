import { CommonModule } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { CommandDescriptor } from '../../models/command';
import { IconComponent } from '../icon/icon.component';

@Component({
    selector: 'mtx-commandbar',
    templateUrl: 'commandbar.component.html',
    imports: [CommonModule, IconComponent]
})
export class CommandBarComponent {
    leftCommand = input<CommandDescriptor | null>(null);
    commands = input<CommandDescriptor[]>([]);

    // Backward compatibility for previous API names.
    leftCommands = input<CommandDescriptor[]>([]);
    rightCommands = input<CommandDescriptor[]>([]);

    protected readonly resolvedLeftCommand = computed(() => {
        const direct = this.leftCommand();
        if (direct) {
            return direct;
        }

        const legacy = this.leftCommands();
        return legacy.length > 0 ? legacy[0] : null;
    });

    protected readonly resolvedRightCommands = computed(() => {
        const direct = this.commands();
        if (direct.length > 0) {
            return direct;
        }

        return this.rightCommands();
    });
}
