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
        },
        {
            id: 'sponsor-github',
            title: '',
            description: 'Sponsor on GitHub',
            icon: 'github',
            action: async () => {
                await invoke<boolean>('open_url', { url: 'https://github.com/sponsors/AndrewLang' });
            }
        }
    ];

    async isGitInstalled(): Promise<boolean> {
        return invoke<boolean>('is_git_installed');
    }

    async gitInfo(): Promise<string> {
        return invoke<string>('git_info');
    }

    async isCodexInstalled(): Promise<boolean> {
        return invoke<boolean>('is_codex_installed');
    }

    async codexVersion(): Promise<string> {
        return invoke<string>('codex_version');
    }
}
