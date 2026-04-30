import { Component, inject, signal, OnInit } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { UserService } from '../../../core/services/user.service';
import { SedeService } from '../../../core/services/sede.service';
import { Sede } from '../../../core/models/sede.model';
import { Usuario, ROLES_DISPONIBLES } from '../../../core/models/user.model';

@Component({
  selector: 'app-user-sede-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule, MatDialogModule, MatFormFieldModule,
    MatSelectModule, MatButtonModule, MatProgressSpinnerModule,
  ],
  template: `
    <h2 mat-dialog-title>Asignar sede al usuario</h2>
    <mat-dialog-content class="dialog-content">
      <p style="font-size:13px;color:#718096;margin:0 0 16px">
        Usuario: <strong>{{ usuario.email }}</strong>
      </p>

      <form [formGroup]="form" novalidate>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Sede</mat-label>
          <mat-select formControlName="sedeId">
            @for (s of sedes(); track s.id) {
              <mat-option [value]="s.id">{{ s.nombreCorto }} — {{ s.codigo }}</mat-option>
            }
          </mat-select>
          @if (form.get('sedeId')?.touched && form.get('sedeId')?.hasError('required')) {
            <mat-error>Selecciona una sede</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Roles</mat-label>
          <mat-select formControlName="roles" multiple>
            @for (rol of roles; track rol) {
              <mat-option [value]="rol">{{ rol }}</mat-option>
            }
          </mat-select>
          @if (form.get('roles')?.touched && form.get('roles')?.hasError('required')) {
            <mat-error>Selecciona al menos un rol</mat-error>
          }
        </mat-form-field>

        @if (error()) {
          <div class="form-error">{{ error() }}</div>
        }
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button [disabled]="loading()" (click)="cancel()">Cancelar</button>
      <button mat-raised-button color="primary"
        [disabled]="loading() || form.invalid"
        (click)="submit()">
        @if (loading()) { <mat-spinner diameter="18" /> } @else { Asignar }
      </button>
    </mat-dialog-actions>
  `,
})
export class UserSedeDialogComponent implements OnInit {
  readonly usuario: Usuario     = inject(MAT_DIALOG_DATA);
  private readonly userService  = inject(UserService);
  private readonly sedeService  = inject(SedeService);
  private readonly dialogRef    = inject(MatDialogRef<UserSedeDialogComponent>);
  private readonly fb           = inject(FormBuilder);

  readonly sedes   = signal<Sede[]>([]);
  readonly loading = signal(false);
  readonly error   = signal('');
  readonly roles   = ROLES_DISPONIBLES;

  form = this.fb.group({
    sedeId: ['', Validators.required],
    roles:  [[] as string[], Validators.required],
  });

  ngOnInit() {
    this.sedeService.getAll({ size: 100 }).subscribe({
      next: res => this.sedes.set(res.content),
    });
  }

  submit() {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.error.set('');
    const { sedeId, roles } = this.form.getRawValue();
    this.userService.asignarSede(this.usuario.id, { sedeId: sedeId!, roles: roles! }).subscribe({
      next: () => { this.loading.set(false); this.dialogRef.close(true); },
      error: err => {
        this.loading.set(false);
        this.error.set(err.error?.mensaje ?? 'Error al asignar sede');
      },
    });
  }

  cancel() { this.dialogRef.close(false); }
}
