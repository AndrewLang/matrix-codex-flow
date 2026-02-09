import { computed, inject, Injectable, signal, WritableSignal } from '@angular/core';
import { invoke } from '@tauri-apps/api/core';
import { open } from '@tauri-apps/plugin-dialog';
import { Subject } from 'rxjs';
import { EMPTY_PROJECT, Project } from '../models/project';
import { NotificationService } from './notification.service';

@Injectable({ providedIn: 'root' })
export class ProjectService {
    static readonly PROJECT_PATH_KEY = 'projectPath';
    static readonly RECENT_PROJECT_PATHS_KEY = 'recentProjectPaths';
    static readonly LOADED_PROJECT_ID_KEY = 'loadedProjectId';
    static readonly MAX_RECENT_PROJECT_PATHS = 8;

    private readonly notificationService = inject(NotificationService);
    projectPath = signal<string>(localStorage.getItem(ProjectService.PROJECT_PATH_KEY) || '');
    recentProjectPaths = signal<string[]>(ProjectService.loadRecentProjectPaths());
    recentProjects = signal<Project[]>([]);
    currentProject: WritableSignal<Project> = signal<Project>(EMPTY_PROJECT);

    project = computed(() => {
        const project = this.currentProject();
        if (!project)
            throw new Error('Project not loaded');
        return project;
    });

    private readonly savingSubject = new Subject<void>();
    readonly onSaving = this.savingSubject.asObservable();

    constructor() {
        void this.initializeProjectState();
    }

    async chooseFolder(): Promise<string> {
        try {
            console.log('Opening folder dialog...');
            const selected = await open({
                directory: true,
                multiple: false
            });

            if (selected && typeof selected === 'string') {
                await this.loadOrCreateProjectByPath(selected);
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

    async loadOrCreateProjectByPath(projectPath: string): Promise<Project | null> {
        try {
            const project = await invoke<Project>('load_or_create_project_by_path', { projectPath });
            this.currentProject.set(project);
            this.setProjectPath(project.path);
            this.recentProjects.update((projects) => {
                const deduplicatedProjects = projects.filter((existingProject) => existingProject.id !== project.id);
                return [project, ...deduplicatedProjects].slice(0, ProjectService.MAX_RECENT_PROJECT_PATHS);
            });
            this.recentProjectPaths.set(this.recentProjects().map((projectItem) => projectItem.path));
            localStorage.setItem(ProjectService.LOADED_PROJECT_ID_KEY, project.id);
            localStorage.setItem(
                ProjectService.RECENT_PROJECT_PATHS_KEY,
                JSON.stringify(this.recentProjectPaths())
            );
            return project;
        } catch {
            return null;
        }
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

    async loadLastProject(): Promise<Project | null> {
        const lastProjectId = localStorage.getItem(ProjectService.LOADED_PROJECT_ID_KEY);
        if (lastProjectId) {
            return await this.loadProject(lastProjectId);
        }
        return null;
    }

    async loadProject(projectId: string): Promise<Project> {
        try {
            const project = await invoke<Project | null>('load_project', { projectId }) || EMPTY_PROJECT;

            this.currentProject.set(project);
            if (project) {
                this.setProjectPath(project.path);
                localStorage.setItem(ProjectService.LOADED_PROJECT_ID_KEY, project.id);
            }
            return project;
        } catch {
            return EMPTY_PROJECT;
        }
    }

    async saveProject(): Promise<void> {
        this.savingSubject.next();
        try {
            let project: Project = this.currentProject();
            console.log('Saving project:', project);
            await invoke('save_project', { project });
            this.notificationService.success('Project saved');
        } catch (error) {
            this.notificationService.error('Failed to save project');
            throw error;
        }
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

    async revealProjectInFolder(): Promise<void> {
        let projectPath = this.projectPath();
        if (projectPath) {
            await this.openFolder(projectPath);
        }
    }

    async openFolder(path: string): Promise<void> {
        await invoke('open_folder', { path });
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

    private async initializeProjectState(): Promise<void> {
        const savedProjectPath = this.projectPath().trim();

        if (savedProjectPath) {
            await this.loadOrCreateProjectByPath(savedProjectPath);
        } else {
            await this.loadLastProject();
        }

        await this.loadRecentProjects();
    }
}
