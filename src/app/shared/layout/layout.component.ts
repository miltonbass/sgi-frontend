import { Component, inject, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AuthService } from '../../core/services/auth.service';

interface NavItem {
  path: string;
  label: string;
  icon: string;
  roles: string[];
}

const ROUTE_TITLES: { pattern: RegExp; title: string }[] = [
  { pattern: /\/miembros\/.+/, title: 'Perfil de Miembro' },
  { pattern: /\/miembros/,     title: 'Miembros' },
  { pattern: /\/usuarios/,     title: 'Usuarios' },
  { pattern: /\/grupos\/.+/,   title: 'Detalle del Grupo' },
  { pattern: /\/grupos/,       title: 'Grupos' },
  { pattern: /\/sedes/,        title: 'Sedes' },
  { pattern: /\/eventos\/.+\/checkin/, title: 'Check-in de Asistencia' },
  { pattern: /\/eventos\/.+\/resumen/, title: 'Resumen de Asistencia' },
  { pattern: /\/eventos/,              title: 'Eventos' },
  { pattern: /\/alertas/,             title: 'Alertas de Ausencia' },
  { pattern: /\/consolidacion/,       title: 'Consolidación' },
];

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    RouterOutlet, RouterLink, RouterLinkActive,
    MatSidenavModule, MatToolbarModule, MatListModule,
    MatIconModule, MatButtonModule, MatMenuModule,
    MatDividerModule, MatTooltipModule,
  ],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss',
})
export class LayoutComponent {
  readonly auth  = inject(AuthService);
  private readonly router = inject(Router);
  private readonly bp     = inject(BreakpointObserver);

  readonly isMobile      = signal(false);
  readonly sidenavOpened = signal(true);
  readonly pageTitle     = signal('Miembros');

  private readonly navItems: NavItem[] = [
    { path: '/miembros', label: 'Miembros',  icon: 'people',          roles: [] },
    { path: '/grupos',   label: 'Grupos',    icon: 'groups',          roles: [] },
    { path: '/eventos',  label: 'Eventos',   icon: 'event',           roles: ['ADMIN_GLOBAL','ADMIN_SEDE','PASTOR_SEDE','LIDER_GRUPO','SECRETARIO_SEDE'] },
    { path: '/alertas',        label: 'Alertas',        icon: 'notifications_active', roles: ['ADMIN_GLOBAL','ADMIN_SEDE','PASTOR_SEDE'] },
    { path: '/consolidacion',  label: 'Consolidación',  icon: 'handshake',            roles: ['ADMIN_GLOBAL','ADMIN_SEDE','PASTOR_SEDE','CONSOLIDACION_SEDE'] },
    { path: '/usuarios',       label: 'Usuarios',       icon: 'manage_accounts',      roles: ['ADMIN_GLOBAL','SUPER_ADMIN','ADMIN_SEDE'] },
    { path: '/sedes',    label: 'Sedes',     icon: 'location_city',   roles: ['ADMIN_GLOBAL'] },
  ];

  constructor() {
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd),
      takeUntilDestroyed(),
    ).subscribe(e => {
      const url = (e as NavigationEnd).urlAfterRedirects;
      const match = ROUTE_TITLES.find(r => r.pattern.test(url));
      this.pageTitle.set(match?.title ?? 'SGI');
    });

    this.bp.observe([Breakpoints.Handset, Breakpoints.TabletPortrait]).pipe(
      takeUntilDestroyed(),
    ).subscribe(r => {
      this.isMobile.set(r.matches);
      this.sidenavOpened.set(!r.matches);
    });
  }

  get visibleNavItems() {
    return this.navItems.filter(
      i => i.roles.length === 0 || this.auth.hasAnyRole(i.roles),
    );
  }

  toggleSidenav() { this.sidenavOpened.set(!this.sidenavOpened()); }

  get userInitials(): string {
    const u = this.auth.currentUser();
    if (!u?.email) return 'U';
    return u.email[0].toUpperCase();
  }
}
