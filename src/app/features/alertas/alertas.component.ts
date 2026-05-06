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
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { AlertaService } from '../../core/services/alerta.service';
import { AlertaResponse, AlertaEstado } from '../../core/models/alerta.model';
import { AuthService } from '../../core/services/auth.service';
import {
  ConfirmDialogComponent,
  ConfirmDialogData,
} from '../../shared/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-alertas',
  standalone: true,
  imports: [
    DatePipe, ReactiveFormsModule,
    MatCardModule, MatButtonModule, MatIconModule,
    MatProgressSpinnerModule, MatPaginatorModule,
    MatFormFieldModule, MatInputModule, MatTooltipModule, MatDividerModule,
  ],
  templateUrl: './alertas.component.html',
  styleUrl: './alertas.component.scss',
})
export class AlertasComponent implements OnInit {
  private readonly alertaService = inject(AlertaService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly dialog = inject(MatDialog);
  readonly auth = inject(AuthService);

  readonly loading = signal(false);
  readonly detectando = signal(false);
  readonly alertas = signal<AlertaResponse[]>([]);
  readonly total = signal(0);
  readonly pageIndex = signal(0);
  readonly pageSize = signal(20);
  readonly estadoActivo = signal<AlertaEstado>('PENDIENTE');
  readonly umbral = signal<number | null>(null);
  readonly editandoUmbral = signal(false);
  readonly umbralCtrl = new FormControl<number>(3, [
    Validators.required,
    Validators.min(1),
    Validators.max(52),
  ]);

  ngOnInit() {
    this.cargarConfiguracion();
    this.detectarYCargar();
  }

  cargarConfiguracion() {
    this.alertaService.getConfiguracion().subscribe({
      next: cfg => {
        this.umbral.set(cfg.umbralSemanas);
        this.umbralCtrl.setValue(cfg.umbralSemanas);
      },
    });
  }

  detectarYCargar() {
    this.detectando.set(true);
    this.alertaService.detectar().subscribe({
      next: () => { this.detectando.set(false); this.cargar(); },
      error: () => { this.detectando.set(false); this.cargar(); },
    });
  }

  cargar() {
    this.loading.set(true);
    this.alertaService.getAll({
      estado: this.estadoActivo(),
      page: this.pageIndex(),
      size: this.pageSize(),
    }).subscribe({
      next: res => {
        this.alertas.set(res.content);
        this.total.set(res.totalElements);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.snackBar.open('Error al cargar alertas', 'Cerrar', { duration: 3000 });
      },
    });
  }

  filtrar(estado: AlertaEstado) {
    this.estadoActivo.set(estado);
    this.pageIndex.set(0);
    this.cargar();
  }

  onPage(e: PageEvent) {
    this.pageIndex.set(e.pageIndex);
    this.pageSize.set(e.pageSize);
    this.cargar();
  }

  gestionar(alerta: AlertaResponse) {
    this.dialog
      .open(ConfirmDialogComponent, {
        width: '440px',
        data: {
          title: 'Marcar como atendida',
          message: `¿Confirmas que atendiste a ${alerta.miembroNombres} ${alerta.miembroApellidos}?`,
          confirmLabel: 'Marcar atendida',
          inputLabel: 'Notas (opcional)',
        } satisfies ConfirmDialogData,
      })
      .afterClosed()
      .subscribe(result => {
        if (!result?.confirmed) return;
        this.alertaService.gestionar(alerta.id, result.inputValue || undefined).subscribe({
          next: () => {
            this.snackBar.open('Alerta marcada como atendida', '', { duration: 2500 });
            this.cargar();
          },
          error: () => this.snackBar.open('Error al gestionar la alerta', 'Cerrar', { duration: 3000 }),
        });
      });
  }

  descartar(alerta: AlertaResponse) {
    this.dialog
      .open(ConfirmDialogComponent, {
        width: '440px',
        data: {
          title: 'Descartar alerta',
          message: `¿Descartarás la alerta de ${alerta.miembroNombres} ${alerta.miembroApellidos}?`,
          confirmLabel: 'Descartar',
          inputLabel: 'Motivo (opcional)',
        } satisfies ConfirmDialogData,
      })
      .afterClosed()
      .subscribe(result => {
        if (!result?.confirmed) return;
        this.alertaService.descartar(alerta.id, result.inputValue || undefined).subscribe({
          next: () => {
            this.snackBar.open('Alerta descartada', '', { duration: 2500 });
            this.cargar();
          },
          error: () => this.snackBar.open('Error al descartar la alerta', 'Cerrar', { duration: 3000 }),
        });
      });
  }

  guardarUmbral() {
    if (this.umbralCtrl.invalid) return;
    this.alertaService.updateConfiguracion(this.umbralCtrl.value!).subscribe({
      next: cfg => {
        this.umbral.set(cfg.umbralSemanas);
        this.editandoUmbral.set(false);
        this.snackBar.open('Umbral actualizado', '', { duration: 2500 });
      },
      error: () => this.snackBar.open('Error al actualizar el umbral', 'Cerrar', { duration: 3000 }),
    });
  }

  get isAdminSede(): boolean {
    return this.auth.hasAnyRole(['ADMIN_GLOBAL', 'ADMIN_SEDE']);
  }

  getNombreConsolidador(alerta: AlertaResponse): string {
    if (!alerta.consolidadorId) return 'Sin consolidador asignado';
    return `${alerta.consolidadorNombres} ${alerta.consolidadorApellidos}`;
  }
}
