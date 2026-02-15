import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'users',
    pathMatch: 'full',
  },
  {
    path: 'users',
    loadChildren: () => import('./features/users/users.routes').then((m) => m.USERS_ROUTES),
  },
  {
    path: '500',
    loadChildren: () => import('./shared/pages/page-500/page-500.routes').then((m) => m.PAGE_500),
  },

  {
    path: '**',
    loadChildren: () => import('./shared/pages/page-404/page-404.routes').then((m) => m.PAGE_404),
  },
];
