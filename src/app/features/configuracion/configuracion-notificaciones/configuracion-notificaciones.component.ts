import { Component, inject, signal, OnInit } from '@angular/core';
import { ValidatorFn, ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { ConfiguracionService } from '../../../core/services/configuracion.service';
import { NotificacionesResponse } from '../../../core/models/configuracion.model';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function ccValidator(): ValidatorFn {
  return control => {
    const val = (control.value as string ?? '').trim();
    if (!val) return null;
    const emails = val.split(',').map((e: string) => e.trim()).filter((e: string) => e.length > 0);
    const invalid = emails.find((e: string) => !EMAIL_RE.test(e));
    return invalid ? { invalidEmail: { value: invalid } } : null;
  };
}

interface EventoMeta {
  key:   keyof NotificacionesResponse;
  label: string;
  desc:  string;
}

const EVENTOS: EventoMeta[] = [
  { key: 'nuevoMiembro',      label: 'Nuevo Miembro',         desc: 'Al registrar un nuevo miembro en la sede' },
  { key: 'cambioEstado',      label: 'Cambio de Estado',      desc: 'Al cambiar el estado de un miembro (activo / inactivo)' },
  { key: 'alertaSeguimiento', label: 'Alerta de Seguimiento', desc: 'Al generar una alerta de seguimiento pastoral' },
  { key: 'nuevoUsuario',      label: 'Nuevo Usuario',         desc: 'Al crear un acceso de usuario al sistema' },
];

@Component({
  selector: 'app-configuracion-notificaciones',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatCardModule, MatButtonModule, MatIconModule,
    MatFormFieldModule, MatInputModule,
    MatSlideToggleModule, MatProgressSpinnerModule, MatDividerModule,
  ],
  templateUrl: './configuracion-notificaciones.component.html',
  styleUrl:    './configuracion-notificaciones.component.scss',
})
export class ConfiguracionNotificacionesComponent implements OnInit {
  private readonly service  = inject(ConfiguracionService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly fb       = inject(FormBuilder);

  readonly loading = signal(false);
  readonly saving  = signal(false);

  readonly eventos = EVENTOS;

  private eventoGroup(activoDefault: boolean) {
    return this.fb.nonNullable.group({
      activo: activoDefault,
      cc:     ['', ccValidator()],
    });
  }

  readonly form = this.fb.nonNullable.group({
    nuevoMiembro:      this.eventoGroup(true),
    cambioEstado:      this.eventoGroup(false),
    alertaSeguimiento: this.eventoGroup(false),
    nuevoUsuario:      this.eventoGroup(false),
  });

  ngOnInit() { this.cargar(); }

  cargar() {
    this.loading.set(true);
    this.service.getNotificaciones().subscribe({
      next: cfg => {
        this.form.patchValue(cfg);
        this.form.markAsPristine();
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.snackBar.open('Error al cargar la configuración de notificaciones', 'Cerrar', { duration: 3000 });
      },
    });
  }

  isActivo(key: string): boolean {
    return !!this.form.get(`${key}.activo`)?.value;
  }

  ccError(key: string): string | null {
    const ctrl = this.form.get(`${key}.cc`);
    if (ctrl?.hasError('invalidEmail') && this.isActivo(key)) {
      return ctrl.getError('invalidEmail').value as string;
    }
    return null;
  }

  guardar() {
    if (this.saving()) return;
    if (this.form.pristine) return;

    const hasActiveError = EVENTOS.some(e => this.isActivo(e.key) && this.form.get(`${e.key}.cc`)?.invalid);
    if (hasActiveError) return;

    const v = this.form.getRawValue();

    const toPayload = (key: keyof typeof v) => ({
      activo: v[key].activo,
      cc:     v[key].activo ? v[key].cc.trim() : '',
    });

    this.saving.set(true);
    this.service.updateNotificaciones({
      nuevoMiembro:      toPayload('nuevoMiembro'),
      cambioEstado:      toPayload('cambioEstado'),
      alertaSeguimiento: toPayload('alertaSeguimiento'),
      nuevoUsuario:      toPayload('nuevoUsuario'),
    }).subscribe({
      next: () => {
        this.saving.set(false);
        this.form.markAsPristine();
        this.snackBar.open('Configuración guardada correctamente', '', { duration: 2500 });
      },
      error: err => {
        this.saving.set(false);
        this.snackBar.open(err?.error?.mensaje ?? 'Error al guardar la configuración', 'Cerrar', { duration: 4000 });
      },
    });
  }
}
