import { Injectable, signal } from '@angular/core';
import { open } from '@tauri-apps/plugin-dialog';

const MOCK_RECENT_PROJECT_PATHS: string[] = [
    'D:\\Code\\Github\\matrix-codex-flow',
    'D:\\Code\\Github\\vibeflow-desktop',
    'D:\\Work\\clients\\acme-agent-suite'
];

@Injectable({ providedIn: 'root' })
export class ProjectService {
    static readonly PROJECT_PATH_KEY = 'projectPath';
    static readonly RECENT_PROJECT_PATHS_KEY = 'recentProjectPaths';
    static readonly MAX_RECENT_PROJECT_PATHS = 8;
    projectPath = signal<string>(localStorage.getItem(ProjectService.PROJECT_PATH_KEY) || '');
    recentProjectPaths = signal<string[]>(ProjectService.loadRecentProjectPaths());

    constructor() { }

    async chooseFolder(): Promise<string> {
        try {
            console.log('Opening folder dialog...');
            const selected = await open({
                directory: true,
                multiple: false
            });

            if (selected && typeof selected === 'string') {
                this.setProjectPath(selected);
                return selected;
            }

            return '';
        } catch (err) {
            console.error('Failed to open folder dialog:', err);
            return '';
        }
    }

    setProjectPath(path: string): void {
        this.projectPath.set(path);
        localStorage.setItem(ProjectService.PROJECT_PATH_KEY, path);
        this.addRecentProjectPath(path);
    }

    private addRecentProjectPath(path: string): void {
        const normalizedPath = path.trim();

        if (!normalizedPath) {
            return;
        }

        const existingPaths = this.recentProjectPaths();
        const deduplicatedPaths = existingPaths.filter((existingPath) => existingPath !== normalizedPath);
        const nextPaths = [normalizedPath, ...deduplicatedPaths].slice(0, ProjectService.MAX_RECENT_PROJECT_PATHS);

        this.recentProjectPaths.set(nextPaths);
        localStorage.setItem(ProjectService.RECENT_PROJECT_PATHS_KEY, JSON.stringify(nextPaths));
    }

    private static loadRecentProjectPaths(): string[] {
        const serializedPaths = localStorage.getItem(ProjectService.RECENT_PROJECT_PATHS_KEY);

        if (!serializedPaths) {
            return MOCK_RECENT_PROJECT_PATHS;
        }

        try {
            const parsedValue: unknown = JSON.parse(serializedPaths);

            if (!Array.isArray(parsedValue)) {
                return MOCK_RECENT_PROJECT_PATHS;
            }

            const parsedPaths = parsedValue.filter((value): value is string => typeof value === 'string');
            return parsedPaths.length > 0 ? parsedPaths : MOCK_RECENT_PROJECT_PATHS;
        } catch {
            return MOCK_RECENT_PROJECT_PATHS;
        }
    }
}
