import { CommonModule } from '@angular/common';
import { Component, ContentChild, ElementRef, input, output } from '@angular/core';
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
    readonly leftCommand = input<CommandDescriptor | null>(null);
    readonly leftCommands = input<CommandDescriptor[]>([]);
    readonly commands = input<CommandDescriptor[]>([]);
    readonly commandSelected = output<CommandDescriptor>();

    @ContentChild('[headerContent]', { read: ElementRef })
    protected customHeaderContent?: ElementRef<HTMLElement>;

    protected onCommandSelected(command: CommandDescriptor): void {
        this.commandSelected.emit(command);
    }
}
