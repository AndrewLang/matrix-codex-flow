import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./layout/app-shell/app-shell').then((module) => module.AppShell),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./views/landing/landing.view').then((module) => module.LandingView),
      },
      {
        path: 'chat',
        loadComponent: () =>
          import('./views/chat/chat.view').then((module) => module.ChatView),
      },
      {
        path: 'settings',
        loadComponent: () =>
          import('./views/project-settings/project-settings.view').then(
            (module) => module.ProjectSettingsView
          ),
      },
      {
        path: 'chains',
        loadComponent: () =>
          import('./views/task-chain-editor/task-chain-editor.view').then(
            (module) => module.TaskChainEditorView
          ),
      },
    ],
  },
];
