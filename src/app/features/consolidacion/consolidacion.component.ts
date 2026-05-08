import { Component, inject, signal, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { ConsolidacionService } from '../../core/services/consolidacion.service';
import { AuthService } from '../../core/services/auth.service';
import {
  ConsolidadorResponse,
  TareaConsolidacionResponse,
  TareaEstado,
} from '../../core/models/consolidacion.model';
import {
  ConfirmDialogComponent,
  ConfirmDialogData,
} from '../../shared/confirm-dialog/confirm-dialog.component';
import {
  ContactoFormDialogComponent,
  ContactoFormDialogData,
} from './contacto-form-dialog/contacto-form-dialog.component';
import {
  ContactoHistorialDialogComponent,
  ContactoHistorialDialogData,
} from './contacto-historial-dialog/contacto-historial-dialog.component';

type Vista = 'consolidadores' | 'tareas';

@Component({
  selector: 'app-consolidacion',
  standalone: true,
  imports: [
    DatePipe, ReactiveFormsModule,
    MatCardModule, MatButtonModule, MatIconModule,
    MatProgressSpinnerModule, MatPaginatorModule,
    MatFormFieldModule, MatInputModule, MatSelectModule,
    MatTooltipModule, MatDividerModule,
  ],
  templateUrl: './consolidacion.component.html',
  styleUrl: './consolidacion.component.scss',
})
export class ConsolidacionComponent implements OnInit {
  private readonly service  = inject(ConsolidacionService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly dialog   = inject(MatDialog);
  readonly auth = inject(AuthService);

  readonly vista         = signal<Vista>('consolidadores');
  readonly loadingConsolidadores = signal(false);
  readonly loadingTareas = signal(false);
  readonly consolidadores = signal<ConsolidadorResponse[]>([]);
  readonly tareas        = signal<TareaConsolidacionResponse[]>([]);
  readonly total         = signal(0);
  readonly pageIndex     = signal(0);
  readonly pageSize      = signal(20);
  readonly maxAsignados  = signal<number | null>(null);
  readonly editandoConfig = signal(false);

  readonly estadoCtrl       = new FormControl<TareaEstado | ''>('');
  readonly consolidadorCtrl = new FormControl<string>('');
  readonly maxCtrl          = new FormControl<number>(10, [
    Validators.required, Validators.min(1), Validators.max(100),
  ]);

  ngOnInit() {
    this.cargarConfiguracion();
    this.cargarConsolidadores();
  }

  cargarConfiguracion() {
    this.service.getConfiguracion().subscribe({
      next: cfg => { this.maxAsignados.set(cfg.maxAsignadosConsolidador); this.maxCtrl.setValue(cfg.maxAsignadosConsolidador); },
    });
  }

  cargarConsolidadores() {
    this.loadingConsolidadores.set(true);
    this.service.getConsolidadores().subscribe({
      next: lista => { this.consolidadores.set(lista); this.loadingConsolidadores.set(false); },
      error: () => { this.loadingConsolidadores.set(false); this.snackBar.open('Error al cargar consolidadores', 'Cerrar', { duration: 3000 }); },
    });
  }

  cambiarVista(v: Vista) {
    this.vista.set(v);
    if (v === 'tareas' && this.tareas().length === 0) this.cargarTareas();
  }

  cargarTareas() {
    this.loadingTareas.set(true);
    const estado = this.estadoCtrl.value || undefined;
    const consolidadorId = this.consolidadorCtrl.value || undefined;
    this.service.getTareas({ estado: estado as TareaEstado | undefined, consolidadorId, page: this.pageIndex(), size: this.pageSize() }).subscribe({
      next: res => { this.tareas.set(res.content); this.total.set(res.totalElements); this.loadingTareas.set(false); },
      error: () => { this.loadingTareas.set(false); this.snackBar.open('Error al cargar tareas', 'Cerrar', { duration: 3000 }); },
    });
  }

  aplicarFiltros() {
    this.pageIndex.set(0);
    this.cargarTareas();
  }

  onPage(e: PageEvent) {
    this.pageIndex.set(e.pageIndex);
    this.pageSize.set(e.pageSize);
    this.cargarTareas();
  }

  completar(tarea: TareaConsolidacionResponse) {
    this.dialog
      .open(ConfirmDialogComponent, {
        width: '440px',
        data: {
          title: 'Completar tarea',
          message: `¿Confirmas que contactaste a ${tarea.miembroNombres} ${tarea.miembroApellidos}?`,
          confirmLabel: 'Marcar completada',
          inputLabel: 'Notas (opcional)',
        } satisfies ConfirmDialogData,
      })
      .afterClosed()
      .subscribe(result => {
        if (!result?.confirmed) return;
        this.service.completarTarea(tarea.id, result.inputValue || undefined).subscribe({
          next: () => {
            this.snackBar.open('Tarea completada', '', { duration: 2500 });
            this.cargarTareas();
            this.cargarConsolidadores();
          },
          error: () => this.snackBar.open('Error al completar la tarea', 'Cerrar', { duration: 3000 }),
        });
      });
  }

  guardarConfig() {
    if (this.maxCtrl.invalid) return;
    this.service.updateConfiguracion(this.maxCtrl.value!).subscribe({
      next: cfg => {
        this.maxAsignados.set(cfg.maxAsignadosConsolidador);
        this.editandoConfig.set(false);
        this.snackBar.open('Configuración actualizada', '', { duration: 2500 });
        this.cargarConsolidadores();
      },
      error: () => this.snackBar.open('Error al actualizar configuración', 'Cerrar', { duration: 3000 }),
    });
  }

  cargaPercent(c: ConsolidadorResponse): number {
    return c.maxAsignados > 0 ? Math.round((c.asignadosActivos / c.maxAsignados) * 100) : 0;
  }

  estaLleno(c: ConsolidadorResponse): boolean {
    return c.asignadosActivos >= c.maxAsignados;
  }

  registrarContacto(tarea: TareaConsolidacionResponse) {
    this.dialog
      .open(ContactoFormDialogComponent, {
        width: '500px',
        data: {
          miembroId: tarea.miembroId,
          miembroNombres: tarea.miembroNombres,
          miembroApellidos: tarea.miembroApellidos,
        } satisfies ContactoFormDialogData,
      })
      .afterClosed()
      .subscribe(ok => {
        if (ok) this.snackBar.open('Contacto registrado', '', { duration: 2500 });
      });
  }

  verHistorial(tarea: TareaConsolidacionResponse) {
    this.dialog.open(ContactoHistorialDialogComponent, {
      width: '560px',
      data: {
        miembroId: tarea.miembroId,
        miembroNombres: tarea.miembroNombres,
        miembroApellidos: tarea.miembroApellidos,
      } satisfies ContactoHistorialDialogData,
    });
  }

  get isAdminSede(): boolean {
    return this.auth.hasAnyRole(['ADMIN_GLOBAL', 'ADMIN_SEDE']);
  }
}
