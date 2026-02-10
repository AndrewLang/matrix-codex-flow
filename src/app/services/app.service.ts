import { Injectable } from '@angular/core';
import { invoke } from '@tauri-apps/api/core';
import { CommandDescriptor } from '../models/command';

@Injectable({ providedIn: 'root' })
export class AppService {
    appName = 'Matrix VibeFlow';
    splashName = 'Agent VibeFlow';

    constructor() { }

    appCommands: CommandDescriptor[] = [
        {
            id: 'pin-top',
            title: '',
            description: 'Pin to top',
            icon: 'pin-angle',
            action: async (command) => {
                const pin = await invoke<boolean>('toggle_main_window_always_on_top');
                if (pin === true) {
                    command.icon = 'pin-angle';
                } else {
                    command.icon = 'pin';
                }
            }
        }
    ];
}
