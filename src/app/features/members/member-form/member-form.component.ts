import { Component, inject, signal } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MemberService } from '../../../core/services/member.service';
import { Miembro } from '../../../core/models/member.model';

@Component({
  selector: 'app-member-form',
  standalone: true,
  imports: [
    ReactiveFormsModule, MatDialogModule, MatFormFieldModule,
    MatInputModule, MatButtonModule, MatSelectModule,
    MatProgressSpinnerModule, MatIconModule,
  ],
  templateUrl: './member-form.component.html',
})
export class MemberFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly memberService = inject(MemberService);
  private readonly dialogRef = inject(MatDialogRef<MemberFormComponent>);
  readonly data: Miembro | null = inject(MAT_DIALOG_DATA);

  readonly loading = signal(false);
  readonly error = signal('');
  readonly isEdit = !!this.data;

  form = this.fb.group({
    nombres:        [this.data?.nombres        ?? '', Validators.required],
    apellidos:      [this.data?.apellidos      ?? '', Validators.required],
    cedula:         [this.data?.cedula         ?? ''],
    genero:         [this.data?.genero         ?? ''],
    fechaNacimiento:[this.data?.fechaNacimiento ?? ''],
    estadoCivil:    [this.data?.estadoCivil    ?? ''],
    telefono:       [this.data?.telefono       ?? ''],
    email:          [this.data?.email          ?? '', Validators.email],
    ciudad:         [this.data?.ciudad         ?? ''],
    direccion:      [this.data?.direccion      ?? ''],
    numeroMiembro:  [this.data?.numeroMiembro  ?? ''],
    fechaIngreso:   [this.data?.fechaIngreso   ?? ''],
    fechaBautismo:  [this.data?.fechaBautismo  ?? ''],
  });

  get title() { return this.isEdit ? 'Editar Miembro' : 'Nuevo Miembro'; }

  submit() {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.error.set('');

    const raw = this.form.getRawValue();
    // Limpiar strings vacíos a undefined
    const payload = Object.fromEntries(
      Object.entries(raw).filter(([, v]) => v !== ''),
    ) as any;

    const op$ = this.isEdit
      ? this.memberService.update(this.data!.id, payload)
      : this.memberService.create(payload);

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
