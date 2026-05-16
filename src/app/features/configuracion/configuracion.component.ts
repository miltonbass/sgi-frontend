import { Component, inject, signal } from '@angular/core';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { AuthService } from '../../core/services/auth.service';
import { ConfiguracionSedeComponent } from './configuracion-sede/configuracion-sede.component';

interface CfgSection {
  id:    string;
  label: string;
  icon:  string;
  roles: string[];
}

const SECTIONS: CfgSection[] = [
  { id: 'sede',            label: 'General',        icon: 'business',       roles: ['ADMIN_GLOBAL', 'ADMIN_SEDE'] },
  // H7.2 – H7.7 se agregarán aquí
];

@Component({
  selector: 'app-configuracion',
  standalone: true,
  imports: [
    MatListModule, MatIconModule, MatDividerModule,
    ConfiguracionSedeComponent,
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
