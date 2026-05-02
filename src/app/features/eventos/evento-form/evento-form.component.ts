import { Component, inject, signal } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { EventoService } from '../../../core/services/evento.service';
import {
  CreateEventoRequest, DiaSemana, Evento, FrecuenciaRecurrencia,
  TipoEvento,
  DIAS_SEMANA, DIA_SEMANA_LABELS, FRECUENCIAS, FRECUENCIA_LABELS,
  TIPOS_EVENTO, TIPO_EVENTO_LABELS,
} from '../../../core/models/evento.model';

function fechaFinValidator(group: AbstractControl) {
  const inicio = group.get('fechaInicio')?.value as string;
  const fin    = group.get('fechaFin')?.value as string;
  if (inicio && fin && fin < inicio) return { fechaFinAnterior: true };
  return null;
}

function isoToDatetimeLocal(iso: string): string {
  return iso.substring(0, 16);
}

function datetimeLocalToIso(local: string): string {
  return `${local}:00Z`;
}

@Component({
  selector: 'app-evento-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatProgressSpinnerModule, MatIconModule,
    MatSelectModule, MatCheckboxModule,
  ],
  templateUrl: './evento-form.component.html',
  styles: [`
    .full-width  { width: 100%; }
    .form-row    { display: flex; gap: 16px; }
    .flex-1      { flex: 1; min-width: 0; }
    .flex-2      { flex: 2; min-width: 0; }
    .recurrente-row { margin: 8px 0 16px; }
    .patron-section {
      border-left: 3px solid #1976d2;
      padding-left: 16px;
      margin-bottom: 8px;
    }
    .error-msg {
      color: #f44336;
      font-size: 13px;
      margin: 4px 0 0;
    }
    mat-dialog-content { display: flex; flex-direction: column; gap: 0; min-width: 560px; }
  `],
})
export class EventoFormComponent {
  private readonly fb            = inject(FormBuilder);
  private readonly eventoService = inject(EventoService);
  private readonly dialogRef     = inject(MatDialogRef<EventoFormComponent>);
  readonly data: Evento | null   = inject(MAT_DIALOG_DATA);

  readonly loading    = signal(false);
  readonly error      = signal('');
  readonly showPatron = signal(this.data?.recurrente ?? false);
  readonly isEdit     = !!this.data;

  readonly tiposEvento      = TIPOS_EVENTO;
  readonly tipoLabels       = TIPO_EVENTO_LABELS;
  readonly frecuencias      = FRECUENCIAS;
  readonly frecuenciaLabels = FRECUENCIA_LABELS;
  readonly diasSemana       = DIAS_SEMANA;
  readonly diaSemanaLabels  = DIA_SEMANA_LABELS;

  form = this.fb.group({
    titulo:          [this.data?.titulo ?? '', [Validators.required, Validators.maxLength(200)]],
    tipo:            [this.data?.tipo ?? '' as TipoEvento | '', Validators.required],
    descripcion:     [this.data?.descripcion ?? ''],
    fechaInicio:     [this.data ? isoToDatetimeLocal(this.data.fechaInicio) : '', Validators.required],
    fechaFin:        [this.data?.fechaFin ? isoToDatetimeLocal(this.data.fechaFin) : ''],
    lugar:           [this.data?.lugar ?? ''],
    capacidad:       [this.data?.capacidad ?? null as number | null, Validators.min(1)],
    recurrente:      [this.data?.recurrente ?? false],
    patronFrecuencia:[this.data?.patronRecurrencia?.frecuencia ?? '' as FrecuenciaRecurrencia | ''],
    patronDiaSemana: [this.data?.patronRecurrencia?.diaSemana ?? '' as DiaSemana | ''],
    patronHasta:     [this.data?.patronRecurrencia?.hasta ?? ''],
  }, { validators: fechaFinValidator });

  get title() { return this.isEdit ? 'Editar Evento' : 'Nuevo Evento'; }

  onRecurrenteChange(checked: boolean) {
    this.showPatron.set(checked);
    const frecCtrl = this.form.get('patronFrecuencia');
    if (checked) {
      frecCtrl?.setValidators(Validators.required);
    } else {
      frecCtrl?.clearValidators();
      frecCtrl?.setValue('');
      this.form.get('patronDiaSemana')?.setValue('');
      this.form.get('patronHasta')?.setValue('');
    }
    frecCtrl?.updateValueAndValidity();
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const raw = this.form.getRawValue();
    if (raw.recurrente && !raw.patronFrecuencia) {
      this.error.set('La frecuencia de recurrencia es obligatoria');
      return;
    }

    this.loading.set(true);
    this.error.set('');

    const patronRecurrencia = raw.recurrente && raw.patronFrecuencia
      ? {
          frecuencia:  raw.patronFrecuencia as FrecuenciaRecurrencia,
          diaSemana:   (raw.patronDiaSemana as DiaSemana) || undefined,
          hasta:       raw.patronHasta || undefined,
        }
      : null;

    const request: CreateEventoRequest = {
      titulo:            raw.titulo!,
      tipo:              raw.tipo as TipoEvento,
      descripcion:       raw.descripcion || undefined,
      fechaInicio:       datetimeLocalToIso(raw.fechaInicio!),
      fechaFin:          raw.fechaFin ? datetimeLocalToIso(raw.fechaFin) : undefined,
      lugar:             raw.lugar || undefined,
      capacidad:         raw.capacidad != null ? Number(raw.capacidad) : undefined,
      recurrente:        raw.recurrente ?? false,
      patronRecurrencia,
    };

    const op$ = this.isEdit
      ? this.eventoService.update(this.data!.id, request)
      : this.eventoService.create(request);

    op$.subscribe({
      next: () => { this.loading.set(false); this.dialogRef.close(true); },
      error: err => {
        this.loading.set(false);
        this.error.set(err.error?.mensaje ?? 'Error al guardar el evento');
      },
    });
  }

  cancel() { this.dialogRef.close(false); }
}
