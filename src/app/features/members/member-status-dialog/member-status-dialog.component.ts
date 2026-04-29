import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MemberService } from '../../../core/services/member.service';
import {
  Miembro,
  EstadoMiembro,
  TRANSICIONES_ESTADO,
  ESTADO_LABELS,
} from '../../../core/models/member.model';

@Component({
  selector: 'app-member-status-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule, MatDialogModule, MatFormFieldModule,
    MatInputModule, MatSelectModule, MatButtonModule, MatProgressSpinnerModule,
  ],
  template: `
    <h2 mat-dialog-title>Cambiar estado del miembro</h2>
    <mat-dialog-content>
      <p>Estado actual: <strong>{{ estadoLabels[miembro.estado] }}</strong></p>
      <form [formGroup]="form" novalidate>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Nuevo estado</mat-label>
          <mat-select formControlName="estado">
            @for (t of transiciones; track t) {
              <mat-option [value]="t">{{ estadoLabels[t] }}</mat-option>
            }
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Motivo</mat-label>
          <textarea matInput formControlName="motivo" rows="3"></textarea>
          @if (form.get('motivo')?.invalid && form.get('motivo')?.touched) {
            <mat-error>El motivo es requerido</mat-error>
          }
        </mat-form-field>

        @if (error()) {
          <div class="form-error">{{ error() }}</div>
        }
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button [disabled]="loading()" (click)="cancel()">Cancelar</button>
      <button
        mat-raised-button
        color="primary"
        [disabled]="loading() || form.invalid"
        (click)="submit()"
      >
        @if (loading()) { <mat-spinner diameter="18" /> } @else { Guardar }
      </button>
    </mat-dialog-actions>
  `,
})
export class MemberStatusDialogComponent {
  readonly miembro: Miembro = inject(MAT_DIALOG_DATA);
  private readonly memberService = inject(MemberService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly dialogRef = inject(MatDialogRef<MemberStatusDialogComponent>);
  private readonly fb = inject(FormBuilder);

  readonly loading = signal(false);
  readonly error = signal('');
  readonly estadoLabels = ESTADO_LABELS;
  readonly transiciones: EstadoMiembro[] = TRANSICIONES_ESTADO[this.miembro.estado];

  form = this.fb.group({
    estado: [this.transiciones[0] ?? null, Validators.required],
    motivo: ['', Validators.required],
  });

  submit() {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.error.set('');

    const { estado, motivo } = this.form.getRawValue();
    this.memberService.cambiarEstado(this.miembro.id, { estado: estado!, motivo: motivo! }).subscribe({
      next: () => {
        this.loading.set(false);
        this.snackBar.open('Estado actualizado', '', { duration: 2500 });
        this.dialogRef.close(true);
      },
      error: err => {
        this.loading.set(false);
        this.error.set(err.error?.mensaje ?? 'Error al cambiar estado');
      },
    });
  }

  cancel() { this.dialogRef.close(false); }
}
