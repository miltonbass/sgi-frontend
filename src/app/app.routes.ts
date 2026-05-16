import { Routes } from '@angular/router';
import { inject } from '@angular/core';
import { authGuard, roleGuard } from './core/guards/auth.guard';
import { AuthService } from './core/services/auth.service';

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
      {
        path: '', pathMatch: 'full',
        redirectTo: () => {
          const auth = inject(AuthService);
          if (auth.hasAnyRole(['ADMIN_GLOBAL', 'PASTOR_PRINCIPAL'])) return '/dashboard-global';
          if (auth.hasAnyRole(['ADMIN_SEDE', 'PASTOR_SEDE'])) return '/dashboard';
          if (auth.hasRole('LIDER_CELULA')) return '/grupos/mi-arbol';
          return '/miembros';
        },
      },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
        canActivate: [roleGuard(['ADMIN_GLOBAL', 'ADMIN_SEDE', 'PASTOR_SEDE'])],
      },
      {
        path: 'dashboard-global',
        loadComponent: () =>
          import('./features/dashboard-global/dashboard-global.component').then(m => m.DashboardGlobalComponent),
        canActivate: [roleGuard(['ADMIN_GLOBAL', 'PASTOR_PRINCIPAL'])],
      },
      {
        path: 'grupos',
        loadComponent: () => import('./features/grupos/grupos.component').then(m => m.GruposComponent),
      },
      {
        path: 'grupos/mi-arbol',
        loadComponent: () => import('./features/grupos/mi-arbol/mi-arbol.component').then(m => m.MiArbolComponent),
        canActivate: [roleGuard(['LIDER_CELULA'])],
      },
      {
        path: 'grupos/:id',
        loadComponent: () => import('./features/grupos/grupo-detail/grupo-detail.component').then(m => m.GrupoDetailComponent),
      },
      {
        path: 'grupos/:grupoId/sesiones',
        loadComponent: () => import('./features/grupos/grupo-sesiones/grupo-sesiones.component').then(m => m.GrupoSesionesComponent),
        canActivate: [roleGuard(['LIDER_CELULA'])],
      },
      {
        path: 'grupos/:grupoId/sesiones/:sesionId/asistencia',
        loadComponent: () => import('./features/grupos/sesion-asistencia/sesion-asistencia.component').then(m => m.SesionAsistenciaComponent),
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
        canActivate: [roleGuard(['ADMIN_GLOBAL','SUPER_ADMIN','ADMIN_SEDE','PASTOR_SEDE','PASTOR_PRINCIPAL','LIDER_GRUPO','SECRETARIO_SEDE','REGISTRO_SEDE','CONSOLIDACION_SEDE'])],
      },
      {
        path: 'miembros/:id',
        loadComponent: () =>
          import('./features/members/member-detail/member-detail.component').then(
            m => m.MemberDetailComponent,
          ),
        canActivate: [roleGuard(['ADMIN_GLOBAL','SUPER_ADMIN','ADMIN_SEDE','PASTOR_SEDE','PASTOR_PRINCIPAL','LIDER_GRUPO','SECRETARIO_SEDE','REGISTRO_SEDE','CONSOLIDACION_SEDE','LIDER_CELULA'])],
      },
      {
        path: 'miembros/:id/asistencia',
        loadComponent: () =>
          import('./features/members/member-asistencia/member-asistencia.component').then(
            m => m.MemberAsistenciaComponent,
          ),
        canActivate: [roleGuard(['ADMIN_GLOBAL', 'ADMIN_SEDE', 'PASTOR_SEDE'])],
      },
      {
        path: 'eventos',
        loadComponent: () =>
          import('./features/eventos/eventos.component').then(m => m.EventosComponent),
        canActivate: [roleGuard(['ADMIN_GLOBAL', 'ADMIN_SEDE', 'PASTOR_SEDE', 'LIDER_GRUPO', 'SECRETARIO_SEDE', 'REGISTRO_SEDE', 'LIDER_CELULA'])],
      },
      {
        path: 'eventos/:id/checkin',
        loadComponent: () =>
          import('./features/eventos/evento-checkin/evento-checkin.component').then(m => m.EventoCheckinComponent),
        canActivate: [roleGuard(['ADMIN_GLOBAL', 'ADMIN_SEDE', 'PASTOR_SEDE', 'SECRETARIO_SEDE', 'REGISTRO_SEDE', 'LIDER_CELULA'])],
      },
      {
        path: 'eventos/:id/resumen',
        loadComponent: () =>
          import('./features/eventos/evento-resumen/evento-resumen.component').then(m => m.EventoResumenComponent),
        canActivate: [roleGuard(['ADMIN_GLOBAL', 'ADMIN_SEDE', 'PASTOR_SEDE'])],
      },
      {
        path: 'alertas',
        loadComponent: () =>
          import('./features/alertas/alertas.component').then(m => m.AlertasComponent),
        canActivate: [roleGuard(['ADMIN_GLOBAL', 'ADMIN_SEDE', 'PASTOR_SEDE'])],
      },
      {
        path: 'reporte-celulas',
        loadComponent: () =>
          import('./features/reporte-celulas/reporte-celulas.component').then(m => m.ReporteCelulasComponent),
        canActivate: [roleGuard(['ADMIN_GLOBAL', 'ADMIN_SEDE', 'PASTOR_SEDE', 'PASTOR_PRINCIPAL'])],
      },
      {
        path: 'reporte-crecimiento',
        loadComponent: () =>
          import('./features/reporte-crecimiento/reporte-crecimiento.component').then(m => m.ReporteCrecimientoComponent),
        canActivate: [roleGuard(['ADMIN_GLOBAL', 'ADMIN_SEDE', 'PASTOR_SEDE'])],
      },
      {
        path: 'consolidacion',
        loadComponent: () =>
          import('./features/consolidacion/consolidacion.component').then(m => m.ConsolidacionComponent),
        canActivate: [roleGuard(['ADMIN_GLOBAL', 'ADMIN_SEDE', 'PASTOR_SEDE', 'CONSOLIDACION_SEDE'])],
      },
      {
        path: 'configuracion',
        loadComponent: () =>
          import('./features/configuracion/configuracion.component').then(m => m.ConfiguracionComponent),
        canActivate: [roleGuard(['ADMIN_GLOBAL', 'ADMIN_SEDE'])],
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
