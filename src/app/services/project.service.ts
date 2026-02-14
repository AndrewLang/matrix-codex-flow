import { computed, inject, Injectable, signal, WritableSignal } from '@angular/core';
import { invoke } from '@tauri-apps/api/core';
import { join } from '@tauri-apps/api/path';
import { open } from '@tauri-apps/plugin-dialog';
import { Subject } from 'rxjs';
import { AgentRule } from '../models/agent.rule';
import { IdGenerator } from '../models/id';
import { EMPTY_PROJECT, Project } from '../models/project';
import { ProjectExtensions } from '../models/project.extensions';
import { CommandService } from './command.service';
import { LocalService } from './local.service';
import { NotificationService } from './notification.service';

@Injectable({ providedIn: 'root' })
export class ProjectService {
    static readonly MAX_RECENT_PROJECT_PATHS = 8;
    static readonly AGENT_FOLDER = '.codex';
    static readonly LOCAL_PROJECT = 'local_project';

    private readonly notificationService = inject(NotificationService);
    private readonly commandService = inject(CommandService);
    private readonly localService = inject(LocalService);

    recentProjects = signal<Project[]>([]);
    currentProject: WritableSignal<Project> = signal<Project>(EMPTY_PROJECT);
    projectPath = computed(() => this.currentProject()?.path ?? '');

    private readonly savingSubject = new Subject<void>();
    readonly onSaving = this.savingSubject.asObservable();

    constructor() { }

    async initialize(): Promise<void> {
        const savedProjectPath = this.projectPath().trim();

        if (savedProjectPath) {
            await this.loadOrCreateProjectByPath(savedProjectPath);
        }
        await this.loadRecentProjects();

        const localProject = this.localService.getItem<Project>(ProjectService.LOCAL_PROJECT);
        if (localProject) {
            this.currentProject.set(localProject);
        }
    }

    async openProject(path?: string): Promise<boolean> {
        const selectedProjectPath = path ?? await this.chooseFolder();
        if (!selectedProjectPath) {
            return false;
        }

        await this.loadOrCreateProjectByPath(selectedProjectPath);
        return true;
    }

    async newProject(): Promise<boolean> {
        const selectedProjectPath = await this.chooseFolder();
        if (!selectedProjectPath) {
            return false;
        }
        await this.initProject(selectedProjectPath);
        await this.loadOrCreateProjectByPath(selectedProjectPath);
        return true;
    }

    getPathName(path: string): string {
        const normalizedPath = path.replaceAll('\\', '/');
        const segments = normalizedPath.split('/').filter((segment) => segment.length > 0);
        return segments[segments.length - 1] ?? path;
    }

    async saveProject(): Promise<void> {
        this.savingSubject.next();
        try {
            let project: Project = this.currentProject();
            let title = project.name.trim();
            await invoke('save_project', { project });
            this.notificationService.success(`Project "${title}" is updated.`);
        } catch (error) {
            this.notificationService.error('Failed to save project');
            throw error;
        }
    }

    async deleteProject(projectId: string): Promise<void> {
        await invoke('delete_project', { projectId });
        const nextProjects = this.recentProjects().filter((project) => project.id !== projectId);
        this.recentProjects.set(nextProjects);
    }

    async revealProjectInFolder(): Promise<void> {
        let projectPath = this.currentProject()?.path?.trim();
        if (projectPath) {
            await this.openFolder(projectPath);
        }
    }

    async syncAgentsMd(): Promise<void> {
        const project = this.currentProject();
        const projectPath = project?.path?.trim();

        if (!projectPath) {
            return;
        }

        const agentsMdPath = await join(projectPath, ProjectService.AGENT_FOLDER, 'AGENTS.md');
        const exists = await this.fileExists(agentsMdPath);
        if (!exists) {
            return;
        }

        const alreadyInDb = (project.rules ?? []).some(
            (rule) => (rule.name ?? '').trim().toLowerCase() === 'agents.md'
        );
        if (alreadyInDb) {
            return;
        }

        const content = await this.readFile(agentsMdPath);
        const now = Date.now();
        const rule: AgentRule = {
            id: IdGenerator.generateId(),
            name: 'AGENTS.md',
            description: content,
            createdAt: now,
            updatedAt: now
        };

        ProjectExtensions.addRule(this.currentProject, rule);
        await this.saveProject();
    }

    async saveRuleToProjectFolder(rule: AgentRule): Promise<void> {
        const project = this.currentProject();
        if (!project?.path?.trim()) {
            return;
        }

        const normalizedProjectPath = project.path.replace(/[\\/]+$/, '');
        const fileName = this.toSafeFileName(rule.name || rule.id);
        const targetFilePath = `${normalizedProjectPath}/.codex/${fileName}.md`;

        await this.writeFile(targetFilePath, rule.description?.trim() ?? '');
    }

    async openInCode(project: Project): Promise<void> {
        await this.commandService.runCommand('code', [project.path]);
    }

    private async loadOrCreateProjectByPath(projectPath: string): Promise<Project | null> {
        try {
            const project = await this.loadProjectFromPath(projectPath);
            this.currentProject.set(project);
            this.addRecentProjectPath(project.path);
            await this.syncAgentsMd();

            this.recentProjects.update((projects) => {
                const deduplicatedProjects = projects.filter((existingProject) => existingProject.id !== project.id);
                return [project, ...deduplicatedProjects].slice(0, ProjectService.MAX_RECENT_PROJECT_PATHS);
            });

            this.localService.setItem(ProjectService.LOCAL_PROJECT, project);

            return project;
        } catch {
            return null;
        }
    }

    private async openFolder(path: string): Promise<void> {
        await invoke('open_folder', { path });
    }

    private async fileExists(path: string): Promise<boolean> {
        return await invoke<boolean>('path_exists', { path });
    }

    private async readFile(path: string): Promise<string> {
        return await invoke<string>('read_text_file', { path });
    }

    private async writeFile(path: string, content: string): Promise<void> {
        await invoke('write_text_file', { path, content });
    }

    private async loadRecentProjects(count: number = ProjectService.MAX_RECENT_PROJECT_PATHS): Promise<Project[]> {
        try {
            const projects = await invoke<Project[]>('load_recent_projects', { count });
            this.recentProjects.set(projects);

            return projects;
        } catch {
            return [];
        }
    }

    private async initProject(path: string): Promise<void> {
        await invoke('init_git_repository', { path });
    }

    private async chooseFolder(): Promise<string> {
        try {
            const selected = await open({
                directory: true,
                multiple: false
            });

            if (selected && typeof selected === 'string') {
                return selected;
            }

            return '';
        } catch (err) {
            console.error('Failed to open folder dialog:', err);
            return '';
        }
    }

    private async loadProjectFromPath(projectPath: string): Promise<Project> {
        return await invoke<Project>('load_or_create_project_by_path', { projectPath })
    }

    private addRecentProjectPath(path: string): void {
        const normalizedPath = path.trim();

        if (!normalizedPath) {
            return;
        }

        const existingPaths = this.recentProjects();
        const deduplicatedPaths = existingPaths.filter((proj) => proj.path !== normalizedPath);
        const nextPaths = [normalizedPath, ...deduplicatedPaths].slice(0, ProjectService.MAX_RECENT_PROJECT_PATHS);

    }



    private toSafeFileName(value: string): string {
        const sanitized = (value ?? '')
            .trim()
            .toLowerCase()
            .replace(/[<>:"/\\|?*\x00-\x1F]/g, ' ')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '');

        return sanitized || 'rule';
    }
}
