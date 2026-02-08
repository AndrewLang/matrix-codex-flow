import { Injectable } from '@angular/core';
import { invoke } from '@tauri-apps/api/core';

@Injectable({ providedIn: 'root' })
export class CommandService {
    async runCommand(
        command: string,
        args: string[] = [],
        stdin?: string,
        cwd?: string
    ): Promise<string> {
        const trimmedCommand = command.trim();
        if (!trimmedCommand) {
            throw new Error('Command name is required.');
        }

        return invoke<string>('run_command', {
            command: trimmedCommand,
            args,
            stdin: stdin ?? null,
            cwd: cwd ?? null,
        });
    }
}
