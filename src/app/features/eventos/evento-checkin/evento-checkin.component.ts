import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { AuthService } from '../../../core/services/auth.service';
import { AsistenciaService } from '../../../core/services/asistencia.service';
import { EventoService } from '../../../core/services/evento.service';
import { ConfirmDialogComponent } from '../../../shared/confirm-dialog/confirm-dialog.component';
import {
  AsistenciaResponse, BusquedaMiembroResult, CheckInResumen,
} from '../../../core/models/asistencia.model';

@Component({
  selector: 'app-evento-checkin',
  standalone: true,
  imports: [
    DatePipe, ReactiveFormsModule,
    MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule,
    MatProgressSpinnerModule, MatTooltipModule, MatDividerModule,
  ],
  templateUrl: './evento-checkin.component.html',
  styleUrl: './evento-checkin.component.scss',
})
export class EventoCheckinComponent implements OnInit {
  private readonly route             = inject(ActivatedRoute);
  private readonly router            = inject(Router);
  private readonly asistenciaService = inject(AsistenciaService);
  private readonly eventoService     = inject(EventoService);
  private readonly auth              = inject(AuthService);
  private readonly dialog            = inject(MatDialog);
  private readonly snackBar          = inject(MatSnackBar);

  readonly eventoId = this.route.snapshot.paramMap.get('id')!;

  readonly loadingResumen = signal(false);
  readonly resumen        = signal<CheckInResumen | null>(null);

  readonly searchCtrl = new FormControl('');
  readonly buscando   = signal(false);
  readonly resultados = signal<BusquedaMiembroResult[]>([]);
  readonly registrandoMiembroId = signal<string | null>(null);

  readonly visitanteNombreCtrl   = new FormControl('', Validators.required);
  readonly visitanteTelefonoCtrl = new FormControl('');
  readonly registrandoVisitante  = signal(false);

  readonly cerrandoEvento = signal(false);

  get canDelete() {
    return this.auth.hasAnyRole(['ADMIN_SEDE', 'PASTOR_SEDE']);
  }

  get canCerrar() {
    return this.auth.hasAnyRole(['ADMIN_SEDE', 'PASTOR_SEDE']);
  }

  get eventoAbierto() {
    return this.resumen()?.eventoEstado === 'ABIERTO';
  }

  get contadorTexto(): string {
    const r = this.resumen();
    if (!r) return '';
    return r.capacidad
      ? `${r.totalPresentes} de ${r.capacidad} presentes`
      : `${r.totalPresentes} presentes`;
  }

  ngOnInit() {
    this.cargarResumen();

    this.searchCtrl.valueChanges
      .pipe(debounceTime(400), distinctUntilChanged())
      .subscribe(q => {
        if (!q || q.length < 2) { this.resultados.set([]); return; }
        this.buscar(q);
      });
  }

  cargarResumen() {
    this.loadingResumen.set(true);
    this.asistenciaService.getResumen(this.eventoId).subscribe({
      next: res => { this.resumen.set(res); this.loadingResumen.set(false); },
      error: () => {
        this.loadingResumen.set(false);
        this.snackBar.open('Error al cargar el evento', 'Cerrar', { duration: 3000 });
      },
    });
  }

  buscar(q: string) {
    this.buscando.set(true);
    this.asistenciaService.buscar(this.eventoId, q).subscribe({
      next: res => { this.resultados.set(res); this.buscando.set(false); },
      error: () => { this.buscando.set(false); },
    });
  }

  registrarMiembro(miembro: BusquedaMiembroResult) {
    if (miembro.yaRegistrado) return;
    this.registrandoMiembroId.set(miembro.id);
    this.asistenciaService.registrarMiembro(this.eventoId, { miembroId: miembro.id }).subscribe({
      next: () => {
        this.registrandoMiembroId.set(null);
        this.searchCtrl.setValue('');
        this.resultados.set([]);
        this.snackBar.open(`${miembro.nombres} ${miembro.apellidos} registrado`, '', { duration: 2500 });
        this.cargarResumen();
      },
      error: err => {
        this.registrandoMiembroId.set(null);
        this.snackBar.open(err.error?.mensaje ?? 'Error al registrar', 'Cerrar', { duration: 3000 });
      },
    });
  }

  registrarVisitante() {
    if (!this.visitanteNombreCtrl.value?.trim()) {
      this.visitanteNombreCtrl.markAsTouched();
      return;
    }
    this.registrandoVisitante.set(true);
    this.asistenciaService.registrarVisitante(this.eventoId, {
      visitanteNombre:   this.visitanteNombreCtrl.value.trim(),
      visitanteTelefono: this.visitanteTelefonoCtrl.value?.trim() || undefined,
    }).subscribe({
      next: () => {
        this.registrandoVisitante.set(false);
        this.visitanteNombreCtrl.reset();
        this.visitanteTelefonoCtrl.reset();
        this.snackBar.open('Visitante registrado', '', { duration: 2500 });
        this.cargarResumen();
      },
      error: err => {
        this.registrandoVisitante.set(false);
        this.snackBar.open(err.error?.mensaje ?? 'Error al registrar', 'Cerrar', { duration: 3000 });
      },
    });
  }

  eliminarAsistencia(a: AsistenciaResponse) {
    const nombre = a.miembroNombres
      ? `${a.miembroNombres} ${a.miembroApellidos ?? ''}`.trim()
      : (a.visitanteNombre ?? 'este registro');

    this.dialog
      .open(ConfirmDialogComponent, {
        data: {
          title:        'Eliminar registro',
          message:      `¿Deseas eliminar el registro de "${nombre}"?`,
          confirmLabel: 'Eliminar',
        },
      })
      .afterClosed()
      .subscribe(result => {
        if (!result?.confirmed) return;
        this.asistenciaService.eliminar(this.eventoId, a.id).subscribe({
          next: () => {
            this.snackBar.open('Registro eliminado', '', { duration: 2500 });
            this.cargarResumen();
          },
          error: err => this.snackBar.open(err.error?.mensaje ?? 'Error', 'Cerrar', { duration: 3000 }),
        });
      });
  }

  cerrarRegistro() {
    this.dialog
      .open(ConfirmDialogComponent, {
        data: {
          title:        'Cerrar registro de asistencia',
          message:      'Se cerrará el evento. No se podrán agregar más asistencias. ¿Confirmas?',
          confirmLabel: 'Cerrar evento',
        },
      })
      .afterClosed()
      .subscribe(result => {
        if (!result?.confirmed) return;
        this.cerrandoEvento.set(true);
        this.eventoService.cambiarEstado(this.eventoId, 'CERRADO').subscribe({
          next: () => {
            this.cerrandoEvento.set(false);
            this.snackBar.open('Evento cerrado', '', { duration: 2500 });
            this.cargarResumen();
          },
          error: err => {
            this.cerrandoEvento.set(false);
            this.snackBar.open(err.error?.mensaje ?? 'Error', 'Cerrar', { duration: 3000 });
          },
        });
      });
  }

  getNombre(a: AsistenciaResponse): string {
    if (a.miembroNombres) return `${a.miembroNombres} ${a.miembroApellidos ?? ''}`.trim();
    return a.visitanteNombre ?? '—';
  }

  esMiembro(a: AsistenciaResponse): boolean {
    return !!a.miembroId;
  }

  volver() { this.router.navigate(['/eventos']); }
}
