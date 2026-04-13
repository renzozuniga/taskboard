import { Routes } from '@angular/router';

/**
 * Application route definitions.
 * Uses lazy loading for feature modules to optimize bundle size.
 */
export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./features/auth/register/register.component').then(m => m.RegisterComponent)
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
  },
  {
    path: 'board/:id',
    loadComponent: () =>
      import('./features/board/board.component').then(m => m.BoardComponent)
  },
  {
    path: '**',
    redirectTo: 'login'
  }
];
