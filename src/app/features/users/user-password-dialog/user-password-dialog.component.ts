import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormControl, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { UserService } from '../../../core/services/user.service';
import { Usuario } from '../../../core/models/user.model';

@Component({
  selector: 'app-user-password-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule, MatDialogModule, MatButtonModule,
    MatFormFieldModule, MatInputModule, MatIconModule,
    MatProgressSpinnerModule, MatTooltipModule,
  ],
  template: `
    <h2 mat-dialog-title>Cambiar contraseña</h2>

    <mat-dialog-content style="min-width:320px; padding-top:8px">
      <p style="margin:0 0 16px; font-size:13px; color:#4a5568">
        Usuario: <strong>{{ usuario.nombre }} {{ usuario.apellido }}</strong>
        ({{ usuario.username }})
      </p>

      <div style="display:flex; align-items:center; gap:4px">
        <mat-form-field appearance="outline" style="flex:1">
          <mat-label>Nueva contraseña</mat-label>
          <input matInput [formControl]="passwordCtrl"
            [type]="show() ? 'text' : 'password'" />
          <button mat-icon-button matSuffix type="button"
            [matTooltip]="show() ? 'Ocultar' : 'Mostrar'"
            (click)="show.set(!show())">
            <mat-icon>{{ show() ? 'visibility_off' : 'visibility' }}</mat-icon>
          </button>
          @if (passwordCtrl.hasError('required') && passwordCtrl.touched) {
            <mat-error>Requerido</mat-error>
          }
          @if (passwordCtrl.hasError('minlength') && passwordCtrl.touched) {
            <mat-error>Mínimo 8 caracteres</mat-error>
          }
        </mat-form-field>

        <button mat-icon-button type="button" matTooltip="Generar contraseña"
          (click)="generar()">
          <mat-icon>refresh</mat-icon>
        </button>

        <button mat-icon-button type="button"
          [matTooltip]="copiado() ? 'Copiado' : 'Copiar'"
          (click)="copiar()">
          <mat-icon>{{ copiado() ? 'check' : 'content_copy' }}</mat-icon>
        </button>
      </div>

      @if (error()) {
        <p style="color:#e53e3e; font-size:13px; margin:4px 0 0">{{ error() }}</p>
      }
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button [disabled]="loading()" (click)="ref.close(false)">Cancelar</button>
      <button mat-raised-button color="primary"
        [disabled]="loading() || passwordCtrl.invalid"
        (click)="guardar()">
        @if (loading()) { <mat-spinner diameter="18" /> } @else { Guardar }
      </button>
    </mat-dialog-actions>
  `,
})
export class UserPasswordDialogComponent {
  readonly usuario: Usuario = inject(MAT_DIALOG_DATA);
  readonly ref     = inject(MatDialogRef<UserPasswordDialogComponent>);
  private readonly userService = inject(UserService);

  readonly show    = signal(false);
  readonly copiado = signal(false);
  readonly loading = signal(false);
  readonly error   = signal('');

  readonly passwordCtrl = new FormControl(this.generar(), [Validators.required, Validators.minLength(8)]);

  generar(): string {
    const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789@#$!';
    const pwd = Array.from({ length: 10 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    this.passwordCtrl?.setValue(pwd);
    this.copiado.set(false);
    return pwd;
  }

  copiar() {
    navigator.clipboard.writeText(this.passwordCtrl.value ?? '').then(() => {
      this.copiado.set(true);
      setTimeout(() => this.copiado.set(false), 2000);
    });
  }

  guardar() {
    if (this.passwordCtrl.invalid) return;
    this.loading.set(true);
    this.error.set('');
    this.userService.resetPassword(this.usuario.id, this.passwordCtrl.value!).subscribe({
      next: () => { this.loading.set(false); this.ref.close(true); },
      error: err => {
        this.loading.set(false);
        this.error.set(err.error?.mensaje ?? 'Error al cambiar la contraseña');
      },
    });
  }
}
