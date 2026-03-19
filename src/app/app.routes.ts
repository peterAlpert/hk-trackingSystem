import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { ScanComponent } from './components/scan/scan.component';
import { DashbaordComponent } from './components/dashbaord/dashbaord.component';

export const routes: Routes = [
    { path: '', component: LoginComponent }, // Login يفضل eager
    {
        path: 'scan',
        loadComponent: () =>
            import('./components/scan/scan.component').then(m => m.ScanComponent)
    },
    {
        path: 'checks',
        loadComponent: () =>
            import('./components/check-history/check-history.component').then(m => m.CheckHistoryComponent)
    },
    {
        path: 'dashboard',
        loadComponent: () =>
            import('./components/dashbaord/dashbaord.component').then(m => m.DashbaordComponent)
    }
];
