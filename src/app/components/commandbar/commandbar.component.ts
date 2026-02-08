import { CommonModule } from '@angular/common';
import { Component, computed, HostListener, input, output, signal } from '@angular/core';
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
    readonly commandSelected = output<CommandDescriptor>();

    leftCommands = input<CommandDescriptor[]>([]);
    rightCommands = input<CommandDescriptor[]>([]);
    protected readonly openSubCommandMenuId = signal<string | null>(null);

    protected readonly resolvedLeftCommands = computed(() => {
        const directList = this.leftCommands();
        if (directList.length > 0) {
            return directList;
        }

        const direct = this.leftCommand();
        if (direct) {
            return [direct];
        }

        return [];
    });

    protected readonly resolvedRightCommands = computed(() => {
        const direct = this.commands();
        if (direct.length > 0) {
            return direct;
        }

        return this.rightCommands();
    });

    protected hasSubCommands(command: CommandDescriptor): boolean {
        return (command.subCommands?.length ?? 0) > 0;
    }

    protected isSubCommandMenuOpen(commandId: string): boolean {
        return this.openSubCommandMenuId() === commandId;
    }

    protected toggleSubCommandMenu(commandId: string): void {
        this.openSubCommandMenuId.update((openId) => (openId === commandId ? null : commandId));
    }

    protected onSelectCommand(command: CommandDescriptor): void {
        this.commandSelected.emit(command);
        this.openSubCommandMenuId.set(null);
    }

    @HostListener('document:pointerdown', ['$event'])
    protected handleDocumentPointerDown(event: PointerEvent): void {
        const openId = this.openSubCommandMenuId();
        if (!openId) {
            return;
        }

        const target = event.target as HTMLElement | null;
        if (!target) {
            this.openSubCommandMenuId.set(null);
            return;
        }

        const menuHost = target.closest(`[data-command-menu="${openId}"]`);
        if (!menuHost) {
            this.openSubCommandMenuId.set(null);
        }
    }
}
