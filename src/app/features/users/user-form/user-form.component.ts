import { Component, inject, signal } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { UserService } from '../../../core/services/user.service';
import { Usuario, ROLES_DISPONIBLES } from '../../../core/models/user.model';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [
    ReactiveFormsModule, MatDialogModule, MatFormFieldModule,
    MatInputModule, MatButtonModule, MatSelectModule,
    MatSlideToggleModule, MatProgressSpinnerModule, MatIconModule,
  ],
  templateUrl: './user-form.component.html',
})
export class UserFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly userService = inject(UserService);
  private readonly dialogRef = inject(MatDialogRef<UserFormComponent>);
  readonly data: Usuario | null = inject(MAT_DIALOG_DATA);

  readonly loading = signal(false);
  readonly error = signal('');
  readonly isEdit = !!this.data;
  readonly roles = ROLES_DISPONIBLES;

  form = this.fb.group({
    email:    [this.data?.email    ?? '', [Validators.required, Validators.email]],
    nombre:   [this.data?.nombre   ?? '', Validators.required],
    apellido: [this.data?.apellido ?? '', Validators.required],
    username: [this.data?.username ?? '', Validators.required],
    telefono: [this.data?.telefono ?? ''],
    activo:   [this.data?.activo   ?? true],
  });

  get title() { return this.isEdit ? 'Editar Usuario' : 'Nuevo Usuario'; }

  submit() {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.error.set('');

    const value = this.form.getRawValue();
    const op$ = this.isEdit
      ? this.userService.update(this.data!.id, value as any)
      : this.userService.create(value as any);

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
