import { Component, input, OnInit } from '@angular/core';
import { CommandDescriptor } from '../../models/command';
import { IconComponent } from '../icon/icon.component';
import { SplitButtonComponent } from '../split-button/split.button.component';

@Component({
    selector: 'mtx-command-strip',
    templateUrl: 'command.strip.component.html',
    imports: [SplitButtonComponent, IconComponent]
})
export class CommandStripComponent implements OnInit {
    commands = input<CommandDescriptor[]>([]);
    space = input<number>(1);

    constructor() { }

    ngOnInit() { }

    invokeCommand(command: CommandDescriptor): void {
        command.action?.();
    }

    hasSubCommands(command: CommandDescriptor): boolean {
        return (command.subCommands?.length ?? 0) > 0;
    }

    isVisible(command: CommandDescriptor): boolean {
        return !(command.isHidden?.() ?? false);
    }
}