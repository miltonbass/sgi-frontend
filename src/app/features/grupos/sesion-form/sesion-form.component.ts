import { Component, inject, signal } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { GrupoService } from '../../../core/services/grupo.service';
import { SesionGrupo } from '../../../core/models/sesion.model';

interface DialogData { grupoId: string; sesion?: SesionGrupo; }

@Component({
  selector: 'app-sesion-form',
  standalone: true,
  imports: [
    ReactiveFormsModule, MatDialogModule, MatFormFieldModule,
    MatInputModule, MatButtonModule, MatProgressSpinnerModule,
  ],
  template: `
    <h2 mat-dialog-title>{{ data.sesion ? 'Editar sesión' : 'Nueva sesión' }}</h2>
    <mat-dialog-content style="min-width:420px">
      <form [formGroup]="form" novalidate style="display:flex;flex-direction:column;gap:4px">

        <div style="display:flex;gap:12px">
          <mat-form-field appearance="outline" style="flex:1">
            <mat-label>Fecha *</mat-label>
            <input matInput type="date" formControlName="fecha" />
            @if (form.get('fecha')?.touched && form.get('fecha')?.hasError('required')) {
              <mat-error>Requerido</mat-error>
            }
          </mat-form-field>
          <mat-form-field appearance="outline" style="flex:1">
            <mat-label>Ofrenda (opcional)</mat-label>
            <input matInput type="number" formControlName="ofrendaMonto" min="0" />
          </mat-form-field>
        </div>

        <mat-form-field appearance="outline">
          <mat-label>Lugar</mat-label>
          <input matInput formControlName="lugar" placeholder="Casa de Juan..." />
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Tema</mat-label>
          <input matInput formControlName="tema" placeholder="El amor de Dios..." />
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Comentarios</mat-label>
          <textarea matInput formControlName="comentarios" rows="3"
            placeholder="¿Qué ocurrió en la reunión?"></textarea>
        </mat-form-field>

        @if (error()) {
          <div class="form-error">{{ error() }}</div>
        }
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button [disabled]="loading()" (click)="cancel()">Cancelar</button>
      <button mat-raised-button color="primary"
        [disabled]="loading() || form.invalid" (click)="submit()">
        @if (loading()) { <mat-spinner diameter="18" /> } @else { Guardar }
      </button>
    </mat-dialog-actions>
  `,
})
export class SesionFormComponent {
  readonly data: DialogData       = inject(MAT_DIALOG_DATA);
  private readonly grupoService   = inject(GrupoService);
  private readonly dialogRef      = inject(MatDialogRef<SesionFormComponent>);
  private readonly fb             = inject(FormBuilder);

  readonly loading = signal(false);
  readonly error   = signal('');

  form = this.fb.group({
    fecha:        [this.data.sesion?.fecha        ?? '', Validators.required],
    lugar:        [this.data.sesion?.lugar        ?? ''],
    tema:         [this.data.sesion?.tema         ?? ''],
    comentarios:  [this.data.sesion?.comentarios  ?? ''],
    ofrendaMonto: [this.data.sesion?.ofrendaMonto ?? null as number | null],
  });

  submit() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading.set(true);
    this.error.set('');

    const raw = this.form.getRawValue();
    const payload = {
      fecha:        raw.fecha!,
      lugar:        raw.lugar        || undefined,
      tema:         raw.tema         || undefined,
      comentarios:  raw.comentarios  || undefined,
      ofrendaMonto: raw.ofrendaMonto != null ? Number(raw.ofrendaMonto) : undefined,
    };

    const op$ = this.data.sesion
      ? this.grupoService.updateSesion(this.data.grupoId, this.data.sesion.id, payload)
      : this.grupoService.createSesion(this.data.grupoId, payload);

    op$.subscribe({
      next: () => { this.loading.set(false); this.dialogRef.close(true); },
      error: err => {
        this.loading.set(false);
        this.error.set(err.error?.mensaje ?? 'Error al guardar');
      },
    });
  }

  cancel() { this.dialogRef.close(false); }
}
