import { Component, inject, signal, computed, OnInit } from '@angular/core';
import {
  FormBuilder, Validators, ReactiveFormsModule,
  AbstractControl, ValidatorFn,
} from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { ConfiguracionService } from '../../../core/services/configuracion.service';
import { AuthService } from '../../../core/services/auth.service';

function urlValidator(): ValidatorFn {
  return (ctrl: AbstractControl) => {
    if (!ctrl.value) return null;
    try { new URL(ctrl.value); return null; }
    catch { return { url: true }; }
  };
}

function timezoneValidator(): ValidatorFn {
  const valid = new Set(Intl.supportedValuesOf('timeZone'));
  return (ctrl: AbstractControl) => {
    if (!ctrl.value) return null;
    return valid.has(ctrl.value) ? null : { timezone: true };
  };
}

@Component({
  selector: 'app-configuracion-sede',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatCardModule, MatButtonModule, MatIconModule,
    MatFormFieldModule, MatInputModule, MatAutocompleteModule,
    MatDatepickerModule, MatNativeDateModule,
    MatProgressSpinnerModule, MatDividerModule,
  ],
  templateUrl: './configuracion-sede.component.html',
  styleUrl:    './configuracion-sede.component.scss',
})
export class ConfiguracionSedeComponent implements OnInit {
  private readonly service  = inject(ConfiguracionService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly fb       = inject(FormBuilder);
  readonly auth             = inject(AuthService);

  readonly loading = signal(false);
  readonly saving  = signal(false);

  readonly timezones = Intl.supportedValuesOf('timeZone');

  readonly form = this.fb.group({
    nombre:        ['', Validators.required],
    descripcion:   [''],
    ciudad:        [''],
    departamento:  [''],
    pais:          [''],
    direccion:     [''],
    telefono:      [''],
    email:         ['', Validators.email],
    sitioWeb:      ['', urlValidator()],
    zonaHoraria:   ['', timezoneValidator()],
    fechaFundacion: [null as Date | null],
    redesSociales: this.fb.group({
      instagram: ['', urlValidator()],
      facebook:  ['', urlValidator()],
      youtube:   ['', urlValidator()],
    }),
  });

  private readonly tzRaw = toSignal(
    this.form.controls.zonaHoraria.valueChanges,
    { initialValue: '' },
  );

  readonly filteredTimezones = computed(() => {
    const q = (this.tzRaw() ?? '').toLowerCase();
    if (q.length < 2) return this.timezones.slice(0, 80);
    return this.timezones.filter(tz => tz.toLowerCase().includes(q));
  });

  get canEdit() {
    return this.auth.hasAnyRole(['ADMIN_GLOBAL', 'ADMIN_SEDE']);
  }

  ngOnInit() { this.cargar(); }

  cargar() {
    this.loading.set(true);
    this.service.getSede().subscribe({
      next: cfg => {
        this.form.patchValue({
          nombre:        cfg.nombre,
          descripcion:   cfg.descripcion  ?? '',
          ciudad:        cfg.ciudad       ?? '',
          departamento:  cfg.departamento ?? '',
          pais:          cfg.pais         ?? '',
          direccion:     cfg.direccion    ?? '',
          telefono:      cfg.telefono     ?? '',
          email:         cfg.email        ?? '',
          sitioWeb:      cfg.sitioWeb     ?? '',
          zonaHoraria:   cfg.zonaHoraria  ?? '',
          fechaFundacion: cfg.fechaFundacion
            ? new Date(cfg.fechaFundacion + 'T12:00:00')
            : null,
          redesSociales: {
            instagram: cfg.redesSociales?.instagram ?? '',
            facebook:  cfg.redesSociales?.facebook  ?? '',
            youtube:   cfg.redesSociales?.youtube   ?? '',
          },
        });
        if (!this.canEdit) this.form.disable();
        this.form.markAsPristine();
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.snackBar.open('Error al cargar la configuración', 'Cerrar', { duration: 3000 });
      },
    });
  }

  guardar() {
    if (this.form.invalid || this.form.pristine || this.saving()) return;
    const v = this.form.getRawValue();

    const fechaFundacion = v.fechaFundacion instanceof Date
      ? this.localDateStr(v.fechaFundacion)
      : null;

    const payload = {
      nombre:         v.nombre!,
      descripcion:    v.descripcion    || null,
      ciudad:         v.ciudad        || null,
      departamento:   v.departamento  || null,
      pais:           v.pais          || null,
      direccion:      v.direccion     || null,
      telefono:       v.telefono      || null,
      email:          v.email         || null,
      sitioWeb:       v.sitioWeb      || null,
      zonaHoraria:    v.zonaHoraria   || null,
      fechaFundacion,
      redesSociales: {
        instagram: v.redesSociales?.instagram || null,
        facebook:  v.redesSociales?.facebook  || null,
        youtube:   v.redesSociales?.youtube   || null,
      },
    };

    this.saving.set(true);
    this.service.updateSede(payload).subscribe({
      next: () => {
        this.saving.set(false);
        this.form.markAsPristine();
        this.snackBar.open('Configuración guardada correctamente', '', { duration: 2500 });
      },
      error: (err) => {
        this.saving.set(false);
        const msg = err?.error?.mensaje ?? 'Error al guardar la configuración';
        this.snackBar.open(msg, 'Cerrar', { duration: 4000 });
      },
    });
  }

  private localDateStr(d: Date): string {
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${d.getFullYear()}-${mm}-${dd}`;
  }
}
