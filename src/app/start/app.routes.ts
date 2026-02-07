import { Routes } from '@angular/router';
import { HomeComponent } from '../components/home/home.component';
import { WorkspaceComponent } from '../components/workspace/workspace.component';

export const routes: Routes = [
    { path: '', component: HomeComponent },
    { path: 'workspace', component: WorkspaceComponent }
];
