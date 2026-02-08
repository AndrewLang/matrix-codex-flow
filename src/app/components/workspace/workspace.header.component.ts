import { CommonModule } from '@angular/common';
import { Component, computed, input, output } from '@angular/core';
import { CommandDescriptor } from '../../models/command';
import { CommandBarComponent } from '../commandbar/commandbar.component';
import { IconComponent } from '../icon/icon.component';


@Component({
    selector: 'mtx-workspace-header',
    templateUrl: 'workspace.header.component.html',
    imports: [CommonModule, IconComponent, CommandBarComponent]
})
export class WorkspaceHeaderComponent {
    readonly title = input<string>('');
    readonly description = input<string>('');
    readonly icon = input<string>('');

    readonly leftCommands = input<CommandDescriptor[]>([]);
    readonly rightCommands = input<CommandDescriptor[]>([]);
    readonly leftLabel = input<string>('');
    readonly commandSelected = output<CommandDescriptor>();


    hasCommands = computed(() => {
        return this.leftCommands().length > 0 || this.rightCommands().length > 0;
    });

    protected onCommandSelected(command: CommandDescriptor): void {
        this.commandSelected.emit(command);
    }
}
