import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { AuthGuard } from './guards/auth.guard';
import { DashbaordComponent } from './components/dashbaord/dashbaord.component';

export const routes: Routes = [
    { path: '', component: DashbaordComponent, canActivate: [AuthGuard] },
    { path: 'login', component: LoginComponent },
    {
        path: 'scan',
        loadComponent: () =>
            import('./components/scan/scan.component').then(m => m.ScanComponent),
        canActivate: [AuthGuard]
    },
    {
        path: 'checks',
        loadComponent: () =>
            import('./components/check-history/check-history.component').then(m => m.CheckHistoryComponent),
        canActivate: [AuthGuard]
    },
    {
        path: 'dashboard',
        loadComponent: () =>
            import('./components/dashbaord/dashbaord.component').then(m => m.DashbaordComponent),
        canActivate: [AuthGuard]
    },
    {
        path: 'buildings',
        loadComponent: () =>
            import('./components/buildings/buildings.component').then(m => m.BuildingsComponent),
        canActivate: [AuthGuard]
    },
    {
        path: 'stock',
        loadComponent: () =>
            import('./components/stock/stock.component').then(m => m.StockComponent),
        canActivate: [AuthGuard]
    },
    {
        path: 'map',
        loadComponent: () =>
            import('./components/locker-map-review/locker-map-review.component').then(m => m.LockerMapReviewComponent),
        canActivate: [AuthGuard]
    },

    { path: '**', redirectTo: '' } // أي مسار غير معروف يرجع للداشبورد أو login حسب الـ guard
];