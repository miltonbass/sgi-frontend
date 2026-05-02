import { Component, inject } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatRadioModule } from '@angular/material/radio';
import {
  Evento, EstadoEvento, ESTADO_EVENTO_LABELS, TRANSICIONES_EVENTO,
} from '../../../core/models/evento.model';

@Component({
  selector: 'app-evento-estado-dialog',
  standalone: true,
  imports: [ReactiveFormsModule, MatDialogModule, MatButtonModule, MatRadioModule],
  template: `
    <h2 mat-dialog-title>Cambiar estado</h2>

    <mat-dialog-content>
      <p><strong>{{ data.evento.titulo }}</strong></p>
      <p class="current-estado">
        Estado actual: <span [class]="'chip chip-' + data.evento.estado.toLowerCase()">
          {{ estadoLabels[data.evento.estado] }}
        </span>
      </p>

      <p class="select-label">Selecciona el nuevo estado:</p>
      <mat-radio-group [formControl]="estadoCtrl" class="radio-group">
        @for (e of estadosDisponibles; track e) {
          <mat-radio-button [value]="e">{{ estadoLabels[e] }}</mat-radio-button>
        }
      </mat-radio-group>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button (click)="cancel()">Cancelar</button>
      <button mat-raised-button color="primary"
        [disabled]="!estadoCtrl.value"
        (click)="confirm()">
        Confirmar
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .current-estado { margin: 8px 0; }
    .select-label   { margin: 12px 0 4px; }
    .radio-group    { display: flex; flex-direction: column; gap: 8px; }
    .chip {
      display: inline-block;
      padding: 2px 10px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 500;
    }
    .chip-programado { background: #e3f2fd; color: #1565c0; }
    .chip-abierto    { background: #e8f5e9; color: #2e7d32; }
    .chip-cerrado    { background: #f5f5f5; color: #616161; }
    .chip-cancelado  { background: #ffebee; color: #c62828; }
  `],
})
export class EventoEstadoDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<EventoEstadoDialogComponent>);
  readonly data: { evento: Evento } = inject(MAT_DIALOG_DATA);

  readonly estadosDisponibles: EstadoEvento[] = TRANSICIONES_EVENTO[this.data.evento.estado];
  readonly estadoCtrl = new FormControl<EstadoEvento | null>(null);
  readonly estadoLabels = ESTADO_EVENTO_LABELS;

  confirm() {
    if (!this.estadoCtrl.value) return;
    this.dialogRef.close(this.estadoCtrl.value);
  }

  cancel() { this.dialogRef.close(null); }
}
