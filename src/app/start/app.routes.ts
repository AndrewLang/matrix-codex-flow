import { Routes } from '@angular/router';
import { ChatComponent } from '../components/chat/chat.component';
import { ContextComponent } from '../components/context/context.component';
import { HomeComponent } from '../components/home/home.component';
import { SettingsComponent } from '../components/settings/settings.component';
import { TasksComponent } from '../components/tasks/tasks.component';
import { WorkspaceComponent } from '../components/workspace/workspace.component';

export const routes: Routes = [
    { path: '', component: HomeComponent },
    {
        path: 'workspace', component: WorkspaceComponent,
        children: [
            { path: '', redirectTo: 'chat', pathMatch: 'full' },
            { path: 'chat', component: ChatComponent },
            { path: 'context', component: ContextComponent },
            { path: 'tasks', component: TasksComponent },
            { path: 'settings', component: SettingsComponent },
            { path: '**', redirectTo: 'chat' }
        ]
    }
];
