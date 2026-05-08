import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ContactoService } from '../../../core/services/contacto.service';
import { ContactoTipo } from '../../../core/models/contacto.model';

export interface ContactoFormDialogData {
  miembroId: string;
  miembroNombres: string;
  miembroApellidos: string;
}

@Component({
  selector: 'app-contacto-form-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule, MatDialogModule, MatButtonModule,
    MatFormFieldModule, MatInputModule, MatSelectModule,
    MatDatepickerModule, MatNativeDateModule,
    MatSlideToggleModule, MatProgressSpinnerModule,
  ],
  templateUrl: './contacto-form-dialog.component.html',
})
export class ContactoFormDialogComponent {
  readonly data: ContactoFormDialogData = inject(MAT_DIALOG_DATA);
  readonly ref = inject(MatDialogRef<ContactoFormDialogComponent>);
  private readonly service = inject(ContactoService);

  readonly loading = signal(false);
  readonly error   = signal('');
  readonly today   = new Date();

  readonly tipos: ContactoTipo[] = ['LLAMADA', 'VISITA', 'MENSAJE', 'REUNION'];
  readonly tipoLabels: Record<ContactoTipo, string> = {
    LLAMADA: 'Llamada', VISITA: 'Visita', MENSAJE: 'Mensaje', REUNION: 'Reunión',
  };

  readonly form = new FormGroup({
    fecha:               new FormControl<Date>(new Date(), { nonNullable: true, validators: [Validators.required] }),
    tipo:                new FormControl<ContactoTipo>('LLAMADA', { nonNullable: true, validators: [Validators.required] }),
    resumen:             new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(5)] }),
    proximaAccion:       new FormControl(''),
    fechaProximaAccion:  new FormControl<Date | null>(null),
    recordatorioActivo:  new FormControl(false, { nonNullable: true }),
  });

  guardar() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading.set(true);
    this.error.set('');

    const v = this.form.getRawValue();
    const fmt = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

    this.service.registrar(this.data.miembroId, {
      fecha:              fmt(v.fecha),
      tipo:               v.tipo,
      resumen:            v.resumen,
      proximaAccion:      v.proximaAccion || undefined,
      fechaProximaAccion: v.fechaProximaAccion ? fmt(v.fechaProximaAccion) : undefined,
      recordatorioActivo: v.recordatorioActivo,
    }).subscribe({
      next: () => { this.loading.set(false); this.ref.close(true); },
      error: err => {
        this.loading.set(false);
        this.error.set(err.error?.mensaje ?? 'Error al registrar el contacto');
      },
    });
  }
}
