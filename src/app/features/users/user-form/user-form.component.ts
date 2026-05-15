import { Component, inject, signal, OnInit } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { UserService } from '../../../core/services/user.service';
import { SedeService } from '../../../core/services/sede.service';
import { AuthService } from '../../../core/services/auth.service';
import { Usuario, ROLES_DISPONIBLES } from '../../../core/models/user.model';
import { SedeInfo } from '../../../core/models/auth.model';
import { SedeUsuario } from '../../../core/models/user.model';
import { UserSedeDialogComponent } from '../user-sede-dialog/user-sede-dialog.component';
import { ConfirmDialogComponent } from '../../../shared/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [
    ReactiveFormsModule, MatDialogModule, MatFormFieldModule,
    MatInputModule, MatButtonModule, MatSelectModule,
    MatSlideToggleModule, MatProgressSpinnerModule, MatIconModule,
    MatDividerModule, MatTooltipModule,
  ],
  templateUrl: './user-form.component.html',
  styleUrl: './user-form.component.scss',
})
export class UserFormComponent implements OnInit {
  private readonly fb          = inject(FormBuilder);
  private readonly userService = inject(UserService);
  private readonly sedeService = inject(SedeService);
  private readonly auth        = inject(AuthService);
  private readonly dialog      = inject(MatDialog);
  private readonly dialogRef   = inject(MatDialogRef<UserFormComponent>);
  readonly data: (Usuario & { _prefill?: { nombre: string; apellido: string; email: string; telefono: string; roles: string[] } }) | null = inject(MAT_DIALOG_DATA);

  readonly prefill    = (this.data as any)?._prefill as { nombre: string; apellido: string; email: string; telefono: string; roles: string[]; sedeId?: string } | null ?? null;

  readonly loading    = signal(false);
  readonly error      = signal('');
  readonly isEdit     = !!this.data && !(this.data as any)?._prefill;
  readonly roles         = ROLES_DISPONIBLES;
  readonly sedes         = signal<SedeInfo[]>([]);
  readonly sedesUsuario  = signal<SedeUsuario[]>(this.data?.sedes ?? []);
  readonly changed       = signal(false);
  readonly usuarioCreado = signal<Usuario | null>(null);
  readonly showPassword  = signal(false);
  readonly copiado       = signal(false);

  form = this.fb.group({
    email:    [{ value: this.prefill?.email    ?? this.data?.email    ?? '', disabled: this.isEdit }, [Validators.required, Validators.email]],
    nombre:   [this.prefill?.nombre   ?? this.data?.nombre   ?? '', Validators.required],
    apellido: [this.prefill?.apellido ?? this.data?.apellido ?? '', Validators.required],
    username: [{ value: this.data?.username ?? '', disabled: this.isEdit }, Validators.required],
    telefono: [this.prefill?.telefono ?? this.data?.telefono ?? ''],
    activo:   [this.data?.activo ?? true],
    // solo creación
    password:   [this.generarPassword(), [Validators.required, Validators.minLength(8)]],
    sedeId:     [this.prefill?.sedeId ?? ''],
    sedesRoles: [this.prefill?.roles ?? [] as string[]],
  });

  get title() { return this.isEdit ? 'Editar Usuario' : 'Nuevo Usuario'; }

  generarPassword(): string {
    const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789@#$!';
    return Array.from({ length: 10 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  }

  regenerarPassword() {
    this.form.get('password')!.setValue(this.generarPassword());
    this.copiado.set(false);
  }

  copiarPassword() {
    const pwd = this.form.get('password')!.value ?? '';
    navigator.clipboard.writeText(pwd).then(() => {
      this.copiado.set(true);
      setTimeout(() => this.copiado.set(false), 2000);
    });
  }

  ngOnInit() {
    if (!this.isEdit) {
      this.sedeService.getAll({ size: 100 }).subscribe({
        next: res => { this.sedes.set(res.content); this.autoSeleccionarSede(); },
        error: () => this.cargarSedesDeAuth(),
      });
    }
  }

  sedeLabel(s: SedeInfo): string {
    return s.nombre ?? s.nombreCorto ?? s.codigo;
  }

  private cargarSedesDeAuth() {
    const email = this.auth.currentUser()?.email;
    if (!email) return;
    this.auth.getSedes(email).subscribe({
      next: sedes => { this.sedes.set(sedes); this.autoSeleccionarSede(); },
    });
  }

  private autoSeleccionarSede() {
    if (this.prefill?.sedeId) return;
    const lista = this.sedes();
    if (lista.length === 1 && !this.form.get('sedeId')?.value) {
      this.form.get('sedeId')!.setValue(lista[0].id);
    }
  }

  submit() {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.error.set('');

    const raw = this.form.getRawValue();

    const op$ = this.isEdit
      ? this.userService.update(this.data!.id, {
          nombre:   raw.nombre ?? undefined,
          apellido: raw.apellido ?? undefined,
          telefono: raw.telefono ?? undefined,
          activo:   raw.activo ?? undefined,
        })
      : this.userService.create({
          email:    raw.email!,
          nombre:   raw.nombre!,
          apellido: raw.apellido!,
          username: raw.username!,
          telefono: raw.telefono ?? undefined,
          password: raw.password ?? undefined,
          activo:   true,
          sedeId:   raw.sedeId   || undefined,
          roles:    raw.sedesRoles?.length ? raw.sedesRoles : undefined,
        });

    op$.subscribe({
      next: res => {
        this.loading.set(false);
        if (!this.isEdit) {
          this.usuarioCreado.set({ ...(res as Usuario), passwordTemporal: raw.password ?? undefined });
        } else {
          this.dialogRef.close(true);
        }
      },
      error: err => {
        this.loading.set(false);
        this.error.set(err.error?.mensaje ?? 'Error al guardar');
      },
    });
  }

  openAsignarSede() {
    if (!this.data) return;
    this.dialog.open(UserSedeDialogComponent, { width: '440px', data: this.data })
      .afterClosed().subscribe(ok => {
        if (ok) {
          this.changed.set(true);
          this.userService.getAll().subscribe(res => {
            const updated = res.usuarios.find(u => u.id === this.data!.id);
            if (updated) this.sedesUsuario.set(updated.sedes);
          });
        }
      });
  }

  quitarSede(sede: SedeUsuario) {
    this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Quitar sede',
        message: `¿Quitar al usuario de la sede "${sede.sedeNombre}"?`,
        confirmLabel: 'Quitar',
      },
    }).afterClosed().subscribe(result => {
      if (!result?.confirmed) return;
      this.userService.quitarSede(this.data!.id, sede.sedeId).subscribe({
        next: () => {
          this.changed.set(true);
          this.sedesUsuario.update(list => list.filter(s => s.sedeId !== sede.sedeId));
        },
        error: err => this.error.set(err.error?.mensaje ?? 'Error al quitar sede'),
      });
    });
  }

  cancel() { this.dialogRef.close(this.changed()); }
}
