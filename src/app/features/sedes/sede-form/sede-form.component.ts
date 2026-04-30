import { Component, inject, signal } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { SedeService } from '../../../core/services/sede.service';
import { Sede } from '../../../core/models/sede.model';

@Component({
  selector: 'app-sede-form',
  standalone: true,
  imports: [
    ReactiveFormsModule, MatDialogModule, MatFormFieldModule,
    MatInputModule, MatButtonModule, MatProgressSpinnerModule, MatIconModule,
  ],
  templateUrl: './sede-form.component.html',
})
export class SedeFormComponent {
  private readonly fb         = inject(FormBuilder);
  private readonly sedeService = inject(SedeService);
  private readonly dialogRef  = inject(MatDialogRef<SedeFormComponent>);
  readonly data: Sede | null  = inject(MAT_DIALOG_DATA);

  readonly loading = signal(false);
  readonly error   = signal('');
  readonly isEdit  = !!this.data;

  form = this.fb.group({
    codigo:      [{ value: this.data?.codigo ?? '', disabled: this.isEdit }, Validators.required],
    nombreCorto: [this.data?.nombreCorto ?? '', Validators.required],
    nombre:      [this.data?.nombre      ?? '', Validators.required],
    ciudad:      [this.data?.ciudad      ?? '', Validators.required],
    pais:        [this.data?.pais        ?? 'Colombia'],
  });

  get title() { return this.isEdit ? 'Editar Sede' : 'Nueva Sede'; }

  submit() {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.error.set('');

    const raw = this.form.getRawValue();

    const op$ = this.isEdit
      ? this.sedeService.update(this.data!.id, {
          nombreCorto: raw.nombreCorto!,
          nombre:      raw.nombre!,
          ciudad:      raw.ciudad!,
          pais:        raw.pais ?? undefined,
        })
      : this.sedeService.create({
          codigo:      raw.codigo!,
          nombreCorto: raw.nombreCorto!,
          nombre:      raw.nombre!,
          ciudad:      raw.ciudad!,
          pais:        raw.pais ?? undefined,
        });

    op$.subscribe({
      next: () => { this.loading.set(false); this.dialogRef.close(true); },
      error: err => {
        this.loading.set(false);
        this.error.set(err.error?.mensaje ?? 'Error al guardar la sede');
      },
    });
  }

  cancel() { this.dialogRef.close(false); }
}
