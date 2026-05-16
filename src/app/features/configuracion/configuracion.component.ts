import { Component, inject, signal } from '@angular/core';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { AuthService } from '../../core/services/auth.service';
import { ConfiguracionSedeComponent } from './configuracion-sede/configuracion-sede.component';
import { ConfiguracionSmtpComponent } from './configuracion-smtp/configuracion-smtp.component';
import { ConfiguracionBrandingComponent } from './configuracion-branding/configuracion-branding.component';

interface CfgSection {
  id:    string;
  label: string;
  icon:  string;
  roles: string[];
}

const SECTIONS: CfgSection[] = [
  { id: 'sede',     label: 'General',       icon: 'business',     roles: ['ADMIN_GLOBAL', 'ADMIN_SEDE'] },
  { id: 'smtp',     label: 'SMTP / Correo', icon: 'mail_outline', roles: ['ADMIN_GLOBAL'] },
  { id: 'branding', label: 'Apariencia',    icon: 'palette',      roles: ['ADMIN_GLOBAL', 'ADMIN_SEDE'] },
];

@Component({
  selector: 'app-configuracion',
  standalone: true,
  imports: [
    MatListModule, MatIconModule, MatDividerModule,
    ConfiguracionSedeComponent,
    ConfiguracionSmtpComponent,
    ConfiguracionBrandingComponent,
  ],
  templateUrl: './configuracion.component.html',
  styleUrl:    './configuracion.component.scss',
})
export class ConfiguracionComponent {
  private readonly auth = inject(AuthService);

  readonly activeSection = signal('sede');

  get visibleSections(): CfgSection[] {
    return SECTIONS.filter(s => this.auth.hasAnyRole(s.roles));
  }
}
