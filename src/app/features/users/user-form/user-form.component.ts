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
import { Usuario, ROLES_DISPONIBLES } from '../../../core/models/user.model';
import { Sede } from '../../../core/models/sede.model';
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
  private readonly dialog      = inject(MatDialog);
  private readonly dialogRef   = inject(MatDialogRef<UserFormComponent>);
  readonly data: Usuario | null = inject(MAT_DIALOG_DATA);

  readonly loading  = signal(false);
  readonly error    = signal('');
  readonly isEdit   = !!this.data;
  readonly roles    = ROLES_DISPONIBLES;
  readonly sedes    = signal<Sede[]>([]);
  readonly sedesUsuario = signal<SedeUsuario[]>(this.data?.sedes ?? []);
  readonly changed  = signal(false);

  form = this.fb.group({
    email:    [{ value: this.data?.email ?? '', disabled: this.isEdit }, [Validators.required, Validators.email]],
    nombre:   [this.data?.nombre   ?? '', Validators.required],
    apellido: [this.data?.apellido ?? '', Validators.required],
    username: [{ value: this.data?.username ?? '', disabled: this.isEdit }, Validators.required],
    telefono: [this.data?.telefono ?? ''],
    activo:   [this.data?.activo   ?? true],
    // solo creación
    sedeId:   [''],
    sedesRoles: [[] as string[]],
  });

  get title() { return this.isEdit ? 'Editar Usuario' : 'Nuevo Usuario'; }

  ngOnInit() {
    if (!this.isEdit) {
      this.sedeService.getAll({ size: 100 }).subscribe({
        next: res => this.sedes.set(res.content),
      });
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
          sedeId:   raw.sedeId   || undefined,
          roles:    raw.sedesRoles?.length ? raw.sedesRoles : undefined,
        });

    op$.subscribe({
      next: () => {
        this.loading.set(false);
        this.dialogRef.close(true);
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
