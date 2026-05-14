import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { AuthService } from '../../core/services/auth.service';
import { EventoService } from '../../core/services/evento.service';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog.component';
import { EventoEstadoDialogComponent } from './evento-estado-dialog/evento-estado-dialog.component';
import { EventoFormComponent } from './evento-form/evento-form.component';
import {
  Evento, EstadoEvento, TipoEvento,
  TIPOS_EVENTO, ESTADOS_EVENTO,
  TIPO_EVENTO_LABELS, ESTADO_EVENTO_LABELS, TRANSICIONES_EVENTO,
} from '../../core/models/evento.model';

@Component({
  selector: 'app-eventos',
  standalone: true,
  imports: [
    DatePipe, ReactiveFormsModule,
    MatTableModule, MatPaginatorModule, MatButtonModule,
    MatIconModule, MatProgressSpinnerModule, MatTooltipModule,
    MatFormFieldModule, MatInputModule, MatSelectModule,
  ],
  templateUrl: './eventos.component.html',
  styleUrl: './eventos.component.scss',
})
export class EventosComponent implements OnInit {
  private readonly eventoService = inject(EventoService);
  private readonly auth          = inject(AuthService);
  private readonly dialog        = inject(MatDialog);
  private readonly snackBar      = inject(MatSnackBar);
  private readonly router        = inject(Router);

  readonly loading   = signal(false);
  readonly eventos   = signal<Evento[]>([]);
  readonly total     = signal(0);
  readonly pageIndex = signal(0);
  readonly pageSize  = signal(20);

  readonly tipoCtrl   = new FormControl<TipoEvento | ''>('');
  readonly estadoCtrl = new FormControl<EstadoEvento | ''>('');
  readonly desdeCtrl  = new FormControl('');
  readonly hastaCtrl  = new FormControl('');

  readonly tiposEvento   = TIPOS_EVENTO;
  readonly estadosEvento = ESTADOS_EVENTO;
  readonly tipoLabels:   Record<string, string> = TIPO_EVENTO_LABELS;
  readonly estadoLabels: Record<string, string> = ESTADO_EVENTO_LABELS;

  readonly displayedColumns = ['titulo', 'tipo', 'estado', 'fechaInicio', 'lugar', 'recurrente', 'acciones'];

  get canWrite() {
    return this.auth.hasAnyRole(['ADMIN_SEDE', 'PASTOR_SEDE']);
  }

  get canCheckinRole() {
    return this.auth.hasAnyRole(['ADMIN_SEDE', 'PASTOR_SEDE', 'SECRETARIO_SEDE', 'REGISTRO_SEDE', 'LIDER_CELULA']);
  }

  ngOnInit() {
    this.load();

    const opts = { debounceTime: 300 };
    this.tipoCtrl.valueChanges.pipe(debounceTime(opts.debounceTime), distinctUntilChanged())
      .subscribe(() => { this.pageIndex.set(0); this.load(); });
    this.estadoCtrl.valueChanges.pipe(debounceTime(opts.debounceTime), distinctUntilChanged())
      .subscribe(() => { this.pageIndex.set(0); this.load(); });
    this.desdeCtrl.valueChanges.pipe(debounceTime(500), distinctUntilChanged())
      .subscribe(() => { this.pageIndex.set(0); this.load(); });
    this.hastaCtrl.valueChanges.pipe(debounceTime(500), distinctUntilChanged())
      .subscribe(() => { this.pageIndex.set(0); this.load(); });
  }

  load() {
    this.loading.set(true);
    const desde = this.desdeCtrl.value ? `${this.desdeCtrl.value}T00:00:00Z` : undefined;
    const hasta = this.hastaCtrl.value ? `${this.hastaCtrl.value}T23:59:59Z` : undefined;

    this.eventoService.getAll({
      tipo:   this.tipoCtrl.value   || undefined,
      estado: this.estadoCtrl.value || undefined,
      desde,
      hasta,
      page: this.pageIndex(),
      size: this.pageSize(),
    }).subscribe({
      next: res => {
        this.eventos.set(res.content);
        this.total.set(res.totalElements);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.snackBar.open('Error al cargar eventos', 'Cerrar', { duration: 3000 });
      },
    });
  }

  onPage(e: PageEvent) {
    this.pageIndex.set(e.pageIndex);
    this.pageSize.set(e.pageSize);
    this.load();
  }

  clearFilters() {
    this.tipoCtrl.setValue('');
    this.estadoCtrl.setValue('');
    this.desdeCtrl.setValue('');
    this.hastaCtrl.setValue('');
  }

  openCreate() {
    this.dialog
      .open(EventoFormComponent, { width: '640px', disableClose: true })
      .afterClosed().subscribe(ok => ok && this.load());
  }

  openEdit(evento: Evento) {
    this.dialog
      .open(EventoFormComponent, { width: '640px', disableClose: true, data: evento })
      .afterClosed().subscribe(ok => ok && this.load());
  }

  openCambiarEstado(evento: Evento) {
    this.dialog
      .open(EventoEstadoDialogComponent, { width: '400px', data: { evento } })
      .afterClosed()
      .subscribe((nuevoEstado: EstadoEvento | null) => {
        if (!nuevoEstado) return;
        this.eventoService.cambiarEstado(evento.id, nuevoEstado).subscribe({
          next: () => {
            this.snackBar.open('Estado actualizado', '', { duration: 2500 });
            this.load();
          },
          error: err => this.snackBar.open(err.error?.mensaje ?? 'Error', 'Cerrar', { duration: 3000 }),
        });
      });
  }

  openCancelar(evento: Evento) {
    this.dialog
      .open(ConfirmDialogComponent, {
        data: {
          title:        'Cancelar evento',
          message:      `¿Deseas cancelar el evento "${evento.titulo}"?`,
          confirmLabel: 'Cancelar evento',
        },
      })
      .afterClosed()
      .subscribe(result => {
        if (!result?.confirmed) return;
        this.eventoService.cancelar(evento.id).subscribe({
          next: () => {
            this.snackBar.open('Evento cancelado', '', { duration: 2500 });
            this.load();
          },
          error: err => this.snackBar.open(err.error?.mensaje ?? 'Error', 'Cerrar', { duration: 3000 }),
        });
      });
  }

  canCambiarEstado(evento: Evento): boolean {
    return TRANSICIONES_EVENTO[evento.estado].length > 0;
  }

  canEdit(evento: Evento): boolean {
    return evento.estado !== 'CERRADO' && evento.estado !== 'CANCELADO';
  }

  canCancelar(evento: Evento): boolean {
    return evento.estado !== 'CERRADO' && evento.estado !== 'CANCELADO';
  }

  goToCheckin(evento: Evento) {
    this.router.navigate(['/eventos', evento.id, 'checkin']);
  }

  goToResumen(evento: Evento) {
    this.router.navigate(['/eventos', evento.id, 'resumen']);
  }

  estadoClass(estado: EstadoEvento): string {
    return `chip chip-${estado.toLowerCase()}`;
  }

  tipoClass(tipo: TipoEvento): string {
    return `tipo-badge tipo-${tipo.toLowerCase()}`;
  }
}
