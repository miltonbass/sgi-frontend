import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Location, DatePipe } from '@angular/common';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AuthService } from '../../../core/services/auth.service';
import { GrupoService } from '../../../core/services/grupo.service';
import { MiembroGrupo } from '../../../core/models/grupo.model';
import { AsistenciaSesion, SesionAsistenciaResumen, SesionGrupo } from '../../../core/models/sesion.model';

interface MiembroConEstado extends MiembroGrupo {
  yaRegistrado: boolean;
  asistenciaId?: string;
  registrando: boolean;
}

@Component({
  selector: 'app-sesion-asistencia',
  standalone: true,
  imports: [
    DatePipe, ReactiveFormsModule, RouterLink,
    MatCardModule, MatButtonModule, MatIconModule,
    MatFormFieldModule, MatInputModule, MatProgressSpinnerModule,
    MatTooltipModule, MatDividerModule,
  ],
  templateUrl: './sesion-asistencia.component.html',
  styleUrl: './sesion-asistencia.component.scss',
})
export class SesionAsistenciaComponent implements OnInit {
  private readonly route        = inject(ActivatedRoute);
  private readonly grupoService = inject(GrupoService);
  private readonly auth         = inject(AuthService);
  private readonly snackBar     = inject(MatSnackBar);
  readonly location             = inject(Location);

  readonly grupoId    = this.route.snapshot.paramMap.get('grupoId')!;
  readonly sesionId   = this.route.snapshot.paramMap.get('sesionId')!;
  readonly soloLectura = this.route.snapshot.queryParamMap.get('soloLectura') === '1';

  readonly loading      = signal(true);
  readonly sesion       = signal<SesionGrupo | null>(null);
  readonly resumen      = signal<SesionAsistenciaResumen | null>(null);
  readonly miembros     = signal<MiembroConEstado[]>([]);

  readonly visitanteNombreCtrl   = new FormControl('', Validators.required);
  readonly visitanteTelefonoCtrl = new FormControl('');
  readonly registrandoVisitante  = signal(false);

  get canDelete() {
    if (this.soloLectura) return false;
    return this.auth.hasAnyRole(['ADMIN_SEDE', 'PASTOR_SEDE', 'LIDER_CELULA']);
  }

  get canWrite() {
    return !this.soloLectura;
  }

  get contadorTexto() {
    const r = this.resumen();
    if (!r) return '';
    return `${r.totalPresentes} de ${r.totalMiembros} miembros presentes`;
  }

  ngOnInit() {
    this.cargar();
  }

  cargar() {
    this.loading.set(true);
    this.grupoService.getSesion(this.grupoId, this.sesionId).subscribe({
      next: s => {
        this.sesion.set(s);
        const miembros$ = this.soloLectura
          ? Promise.resolve()
          : new Promise<void>(res => {
              this.grupoService.getMiembros(this.grupoId).subscribe({
                next: miembros => { this._rawMiembros = miembros; res(); },
                error: () => res(),
              });
            });

        Promise.all([
          miembros$,
          new Promise<void>(res => {
            this.grupoService.getSesionAsistencias(this.grupoId, this.sesionId).subscribe({
              next: r => { this.resumen.set(r); res(); },
              error: () => res(),
            });
          }),
        ]).then(() => {
          this.combinarMiembros();
          this.loading.set(false);
        });
      },
      error: () => {
        this.loading.set(false);
        this.snackBar.open('Error al cargar la sesión', 'Cerrar', { duration: 3000 });
      },
    });
  }

  private _rawMiembros: MiembroGrupo[] = [];

  private combinarMiembros() {
    const asistencias = this.resumen()?.asistencias ?? [];
    const registrados = new Map(
      asistencias.filter(a => a.miembroId).map(a => [a.miembroId!, a.id]),
    );
    this.miembros.set(
      this._rawMiembros.map(m => ({
        ...m,
        yaRegistrado: registrados.has(m.miembroId),
        asistenciaId: registrados.get(m.miembroId),
        registrando: false,
      })),
    );
  }

  registrarMiembro(miembro: MiembroConEstado) {
    if (miembro.yaRegistrado) return;
    this.miembros.update(list =>
      list.map(m => m.miembroId === miembro.miembroId ? { ...m, registrando: true } : m),
    );
    this.grupoService.registrarAsistenciaSesion(this.grupoId, this.sesionId, { miembroId: miembro.miembroId }).subscribe({
      next: () => {
        this.snackBar.open(`${miembro.nombres} ${miembro.apellidos} registrado`, '', { duration: 2000 });
        this.recargarAsistencias();
      },
      error: err => {
        this.miembros.update(list =>
          list.map(m => m.miembroId === miembro.miembroId ? { ...m, registrando: false } : m),
        );
        this.snackBar.open(err.error?.mensaje ?? 'Error al registrar', 'Cerrar', { duration: 3000 });
      },
    });
  }

  registrarVisitante() {
    if (!this.visitanteNombreCtrl.value?.trim()) { this.visitanteNombreCtrl.markAsTouched(); return; }
    this.registrandoVisitante.set(true);
    this.grupoService.registrarAsistenciaSesion(this.grupoId, this.sesionId, {
      visitanteNombre:   this.visitanteNombreCtrl.value.trim(),
      visitanteTelefono: this.visitanteTelefonoCtrl.value?.trim() || undefined,
    }).subscribe({
      next: () => {
        this.registrandoVisitante.set(false);
        this.visitanteNombreCtrl.reset();
        this.visitanteTelefonoCtrl.reset();
        this.snackBar.open('Visitante registrado', '', { duration: 2000 });
        this.recargarAsistencias();
      },
      error: err => {
        this.registrandoVisitante.set(false);
        this.snackBar.open(err.error?.mensaje ?? 'Error al registrar', 'Cerrar', { duration: 3000 });
      },
    });
  }

  eliminarAsistencia(asistencia: AsistenciaSesion) {
    this.grupoService.eliminarAsistenciaSesion(this.grupoId, this.sesionId, asistencia.id).subscribe({
      next: () => {
        this.snackBar.open('Registro eliminado', '', { duration: 2000 });
        this.recargarAsistencias();
      },
      error: err => this.snackBar.open(err.error?.mensaje ?? 'Error', 'Cerrar', { duration: 3000 }),
    });
  }

  private recargarAsistencias() {
    this.grupoService.getSesionAsistencias(this.grupoId, this.sesionId).subscribe({
      next: r => { this.resumen.set(r); this.combinarMiembros(); },
    });
  }

  getNombre(a: AsistenciaSesion): string {
    if (a.miembroNombres) return `${a.miembroNombres} ${a.miembroApellidos ?? ''}`.trim();
    return a.visitanteNombre ?? '—';
  }
}
