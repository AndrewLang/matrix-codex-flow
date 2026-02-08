import { Injectable, signal } from '@angular/core';
import { invoke } from '@tauri-apps/api/core';
import { open } from '@tauri-apps/plugin-dialog';
import { Project } from '../models/project';

@Injectable({ providedIn: 'root' })
export class ProjectService {
    static readonly PROJECT_PATH_KEY = 'projectPath';
    static readonly RECENT_PROJECT_PATHS_KEY = 'recentProjectPaths';
    static readonly MAX_RECENT_PROJECT_PATHS = 8;
    projectPath = signal<string>(localStorage.getItem(ProjectService.PROJECT_PATH_KEY) || '');
    recentProjectPaths = signal<string[]>(ProjectService.loadRecentProjectPaths());
    recentProjects = signal<Project[]>([]);

    constructor() {
        void this.loadRecentProjects();
    }

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

    async loadRecentProjects(count: number = ProjectService.MAX_RECENT_PROJECT_PATHS): Promise<Project[]> {
        try {
            const projects = await invoke<Project[]>('load_recent_projects', { count });
            this.recentProjects.set(projects);
            this.recentProjectPaths.set(projects.map((project) => project.path));
            localStorage.setItem(
                ProjectService.RECENT_PROJECT_PATHS_KEY,
                JSON.stringify(this.recentProjectPaths())
            );
            return projects;
        } catch {
            return [];
        }
    }

    async loadProject(projectId: string): Promise<Project | null> {
        try {
            const project = await invoke<Project | null>('load_project', { projectId });
            return project;
        } catch {
            return null;
        }
    }

    async saveProject(project: Project): Promise<void> {
        await invoke('save_project', { project });
    }

    async deleteProject(projectId: string): Promise<void> {
        await invoke('delete_project', { projectId });
        const nextProjects = this.recentProjects().filter((project) => project.id !== projectId);
        this.recentProjects.set(nextProjects);
        this.recentProjectPaths.set(nextProjects.map((project) => project.path));
        localStorage.setItem(
            ProjectService.RECENT_PROJECT_PATHS_KEY,
            JSON.stringify(this.recentProjectPaths())
        );
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
            return [];
        }

        try {
            const parsedValue: unknown = JSON.parse(serializedPaths);

            if (!Array.isArray(parsedValue)) {
                return [];
            }

            const parsedPaths = parsedValue.filter((value): value is string => typeof value === 'string');
            return parsedPaths;
        } catch {
            return [];
        }
    }
}
