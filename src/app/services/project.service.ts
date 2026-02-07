import { Injectable, signal } from '@angular/core';
import { open } from '@tauri-apps/plugin-dialog';

@Injectable({ providedIn: 'root' })
export class ProjectService {
    static readonly PROJECT_PATH_KEY = 'projectPath';
    projectPath = signal<string>(localStorage.getItem(ProjectService.PROJECT_PATH_KEY) || '');

    constructor() { }

    async chooseFolder(): Promise<string> {
        try {
            console.log('Opening folder dialog...');
            const selected = await open({
                directory: true,
                multiple: false
            });

            if (selected && typeof selected === 'string') {
                this.projectPath.set(selected);
                localStorage.setItem(ProjectService.PROJECT_PATH_KEY, selected);
                return selected;
            }

            return '';
        } catch (err) {
            console.error('Failed to open folder dialog:', err);
            return '';
        }
    }
}