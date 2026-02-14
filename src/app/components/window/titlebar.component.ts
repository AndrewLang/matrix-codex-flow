import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { CommandDescriptor } from '../../models/command';
import { AppService } from '../../services/app.service';
import { IconComponent } from "../icon/icon.component";

@Component({
    selector: 'app-title-bar',
    imports: [CommonModule, IconComponent],
    templateUrl: './titlebar.component.html',
})
export class TitleBarComponent implements OnInit {
    private readonly appService = inject(AppService);
    appName = computed(() => this.appService.appName);
    appCommands = computed(() => this.appService.appCommands);
    isMac = navigator.userAgent.includes('Mac OS X');
    isMaximized = signal(false);

    private appWindow = getCurrentWindow();

    async ngOnInit() {
        this.isMaximized.set(await this.appWindow.isMaximized());
        window.addEventListener('resize', this.checkMaximizedState.bind(this));
    }

    async checkMaximizedState() {
        try {
            this.isMaximized.set(await this.appWindow.isMaximized());
        } catch (e) {
            console.error(e);
        }
    }

    minimize() {
        this.appWindow.minimize();
    }

    toggleMaximize() {
        this.appWindow.toggleMaximize().then(() => this.checkMaximizedState());
    }

    close() {
        this.appWindow.close();
    }

    invokeCommand(command: CommandDescriptor) {
        command.action?.(command);
    }
}
