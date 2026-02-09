import { CommonModule } from '@angular/common';
import { Component, HostListener, input, output, signal } from '@angular/core';
import { CommandDescriptor } from '../../models/command';
import { IconComponent } from '../icon/icon.component';

@Component({
    selector: 'mtx-split-button',
    templateUrl: 'split.button.component.html',
    imports: [CommonModule, IconComponent]
})
export class SplitButtonComponent {
    readonly command = input<CommandDescriptor | null>(null);
    readonly commandInvoked = output<CommandDescriptor>();
    readonly isMenuOpen = signal(false);
    readonly isRunning = signal(false);

    hasSubCommands(): boolean {
        return (this.command()?.subCommands?.length ?? 0) > 0;
    }

    toggleMenu(): void {
        this.isMenuOpen.update((open) => !open);
    }

    async onClickMain(): Promise<void> {
        const command = this.command();
        if (!command || this.isRunning()) {
            return;
        }

        await this.invokeCommand(command);
    }

    async onClickSub(command: CommandDescriptor): Promise<void> {
        if (this.isRunning()) {
            return;
        }

        this.isMenuOpen.set(false);
        await this.invokeCommand(command);
    }

    private async invokeCommand(command: CommandDescriptor): Promise<void> {
        this.isRunning.set(true);
        try {
            if (command.action) {
                await command.action();
            }
            this.commandInvoked.emit(command);
        } finally {
            this.isRunning.set(false);
        }
    }

    @HostListener('document:pointerdown', ['$event'])
    onDocumentPointerDown(event: PointerEvent): void {
        if (!this.isMenuOpen()) {
            return;
        }

        const target = event.target as HTMLElement | null;
        if (!target) {
            this.isMenuOpen.set(false);
            return;
        }

        const host = target.closest('[data-split-button-root="true"]');
        if (!host) {
            this.isMenuOpen.set(false);
        }
    }
}
