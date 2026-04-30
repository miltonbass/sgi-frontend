import { Routes } from '@angular/router';
import { authGuard, roleGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent),
  },
  {
    path: '',
    loadComponent: () => import('./shared/layout/layout.component').then(m => m.LayoutComponent),
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'miembros', pathMatch: 'full' },
      {
        path: 'grupos',
        loadComponent: () => import('./features/grupos/grupos.component').then(m => m.GruposComponent),
      },
      {
        path: 'grupos/:id',
        loadComponent: () => import('./features/grupos/grupo-detail/grupo-detail.component').then(m => m.GrupoDetailComponent),
      },
      {
        path: 'sedes',
        loadComponent: () => import('./features/sedes/sedes.component').then(m => m.SedesComponent),
        canActivate: [roleGuard(['ADMIN_GLOBAL'])],
      },
      {
        path: 'usuarios',
        loadComponent: () => import('./features/users/users.component').then(m => m.UsersComponent),
        canActivate: [roleGuard(['ADMIN_GLOBAL', 'SUPER_ADMIN', 'ADMIN_SEDE'])],
      },
      {
        path: 'miembros',
        loadComponent: () => import('./features/members/members.component').then(m => m.MembersComponent),
      },
      {
        path: 'miembros/:id',
        loadComponent: () =>
          import('./features/members/member-detail/member-detail.component').then(
            m => m.MemberDetailComponent,
          ),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
