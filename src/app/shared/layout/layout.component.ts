import { Component, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { AuthService } from '../../core/services/auth.service';

interface NavItem {
  path: string;
  label: string;
  icon: string;
  roles: string[];
}

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    RouterOutlet, RouterLink, RouterLinkActive,
    MatSidenavModule, MatToolbarModule, MatListModule,
    MatIconModule, MatButtonModule, MatMenuModule, MatDividerModule,
  ],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss',
})
export class LayoutComponent {
  readonly auth = inject(AuthService);

  private readonly navItems: NavItem[] = [
    { path: '/miembros', label: 'Miembros', icon: 'people', roles: [] },
    {
      path: '/usuarios',
      label: 'Usuarios',
      icon: 'manage_accounts',
      roles: ['ADMIN_GLOBAL', 'SUPER_ADMIN', 'ADMIN_SEDE'],
    },
  ];

  get visibleNavItems() {
    return this.navItems.filter(
      item => item.roles.length === 0 || this.auth.hasAnyRole(item.roles),
    );
  }
}
