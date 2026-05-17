import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { Validators, ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ConfiguracionService } from '../../../core/services/configuracion.service';

@Component({
  selector: 'app-configuracion-seguridad',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatCardModule, MatButtonModule, MatIconModule,
    MatFormFieldModule, MatInputModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './configuracion-seguridad.component.html',
  styleUrl:    './configuracion-seguridad.component.scss',
})
export class ConfiguracionSeguridadComponent implements OnInit {
  private readonly service  = inject(ConfiguracionService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly fb       = inject(FormBuilder);

  readonly loading = signal(false);
  readonly saving  = signal(false);

  readonly form = this.fb.nonNullable.group({
    longitudMinimaPassword: [8, [Validators.required, Validators.min(6),  Validators.max(32)]],
    expiracionPasswordDias: [0, [Validators.required, Validators.min(0)]],
    maxIntentosFallidos:    [5, [Validators.required, Validators.min(1),  Validators.max(20)]],
    duracionSesionHoras:    [1, [Validators.required, Validators.min(1),  Validators.max(168)]],
  });

  private readonly _duracionOriginal = signal(0);

  private readonly _duracionActual = toSignal(
    this.form.controls.duracionSesionHoras.valueChanges,
    { initialValue: this.form.controls.duracionSesionHoras.value },
  );

  readonly showSessionWarning = computed(() => {
    const orig = this._duracionOriginal();
    const curr = this._duracionActual();
    return orig > 0 && curr < orig;
  });

  ngOnInit() { this.cargar(); }

  cargar() {
    this.loading.set(true);
    this.service.getSeguridad().subscribe({
      next: cfg => {
        this.form.patchValue(cfg);
        this.form.markAsPristine();
        this._duracionOriginal.set(cfg.duracionSesionHoras);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.snackBar.open('Error al cargar las políticas de seguridad', 'Cerrar', { duration: 3000 });
      },
    });
  }

  guardar() {
    if (this.form.invalid || this.form.pristine || this.saving()) return;
    const v = this.form.getRawValue();

    this.saving.set(true);
    this.service.updateSeguridad(v).subscribe({
      next: cfg => {
        this.saving.set(false);
        this.form.markAsPristine();
        this._duracionOriginal.set(cfg.duracionSesionHoras);
        this.snackBar.open('Políticas de seguridad guardadas correctamente', '', { duration: 2500 });
      },
      error: err => {
        this.saving.set(false);
        this.snackBar.open(err?.error?.mensaje ?? 'Error al guardar las políticas', 'Cerrar', { duration: 4000 });
      },
    });
  }
}
