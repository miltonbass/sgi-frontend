import { Component, inject, signal, OnInit } from '@angular/core';
import { Validators, ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ConfiguracionService } from '../../../core/services/configuracion.service';
import { EstadoInicialMiembro, Moneda } from '../../../core/models/configuracion.model';

@Component({
  selector: 'app-configuracion-parametros',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatCardModule, MatButtonModule, MatIconModule,
    MatFormFieldModule, MatInputModule, MatSelectModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './configuracion-parametros.component.html',
  styleUrl:    './configuracion-parametros.component.scss',
})
export class ConfiguracionParametrosComponent implements OnInit {
  private readonly service  = inject(ConfiguracionService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly fb       = inject(FormBuilder);

  readonly loading = signal(false);
  readonly saving  = signal(false);

  readonly estadosIniciales: { value: EstadoInicialMiembro; label: string }[] = [
    { value: 'VISITOR', label: 'Visitante (VISITOR)' },
    { value: 'MIEMBRO', label: 'Miembro (MIEMBRO)' },
  ];

  readonly monedas: { value: Moneda; label: string }[] = [
    { value: 'COP', label: 'COP — Peso Colombiano' },
    { value: 'USD', label: 'USD — Dólar Estadounidense' },
    { value: 'EUR', label: 'EUR — Euro' },
  ];

  readonly periodos = [30, 60, 90] as const;

  readonly form = this.fb.nonNullable.group({
    estadoInicialMiembro:  ['VISITOR' as EstadoInicialMiembro, Validators.required],
    diasSinContactoAlerta: [30,  [Validators.required, Validators.min(1)]],
    moneda:                ['COP' as Moneda, Validators.required],
    periodoReportesDias:   [30,  Validators.required],
    limiteMiembrosCelula:  [0,   [Validators.required, Validators.min(0)]],
  });

  ngOnInit() { this.cargar(); }

  cargar() {
    this.loading.set(true);
    this.service.getParametros().subscribe({
      next: cfg => {
        this.form.patchValue(cfg);
        this.form.markAsPristine();
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.snackBar.open('Error al cargar los parámetros del sistema', 'Cerrar', { duration: 3000 });
      },
    });
  }

  guardar() {
    if (this.form.invalid || this.form.pristine || this.saving()) return;
    const v = this.form.getRawValue();

    this.saving.set(true);
    this.service.updateParametros({
      estadoInicialMiembro:  v.estadoInicialMiembro,
      diasSinContactoAlerta: v.diasSinContactoAlerta,
      moneda:                v.moneda,
      periodoReportesDias:   v.periodoReportesDias,
      limiteMiembrosCelula:  v.limiteMiembrosCelula,
    }).subscribe({
      next: () => {
        this.saving.set(false);
        this.form.markAsPristine();
        this.service.loadParametros();
        this.snackBar.open('Parámetros guardados correctamente', '', { duration: 2500 });
      },
      error: err => {
        this.saving.set(false);
        this.snackBar.open(err?.error?.mensaje ?? 'Error al guardar los parámetros', 'Cerrar', { duration: 4000 });
      },
    });
  }
}
