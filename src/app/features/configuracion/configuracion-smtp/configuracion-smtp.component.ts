import { Component, inject, signal, OnInit } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ConfiguracionService } from '../../../core/services/configuracion.service';
import { SmtpProbarResponse } from '../../../core/models/configuracion.model';

const PORT_SUGERIDO: Record<string, number> = {
  TLS: 465, STARTTLS: 587, NONE: 25,
};

@Component({
  selector: 'app-configuracion-smtp',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatCardModule, MatButtonModule, MatIconModule,
    MatFormFieldModule, MatInputModule, MatSelectModule,
    MatSlideToggleModule, MatProgressSpinnerModule,
    MatDividerModule, MatTooltipModule,
  ],
  templateUrl: './configuracion-smtp.component.html',
  styleUrl:    './configuracion-smtp.component.scss',
})
export class ConfiguracionSmtpComponent implements OnInit {
  private readonly service  = inject(ConfiguracionService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly fb       = inject(FormBuilder);

  readonly loading          = signal(false);
  readonly saving           = signal(false);
  readonly testando         = signal(false);
  readonly configurado      = signal(false);
  readonly mostrarPassword  = signal(false);
  readonly testResult       = signal<SmtpProbarResponse | null>(null);

  readonly form = this.fb.group({
    host:      ['', Validators.required],
    puerto:    [587, [Validators.required, Validators.min(1), Validators.max(65535)]],
    usuario:   ['', [Validators.required, Validators.email]],
    password:  [''],
    cifrado:   ['STARTTLS', Validators.required],
    remitente: ['', Validators.required],
    activo:    [true],
  });

  constructor() {
    this.form.controls.cifrado.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(v => {
        if (v && PORT_SUGERIDO[v] !== undefined) {
          this.form.controls.puerto.setValue(PORT_SUGERIDO[v], { emitEvent: false });
        }
      });
  }

  ngOnInit() { this.cargar(); }

  cargar() {
    this.loading.set(true);
    this.testResult.set(null);
    this.service.getSmtp().subscribe({
      next: cfg => {
        this.configurado.set(cfg.configurado);
        this.form.patchValue({
          host:      cfg.host      ?? '',
          puerto:    cfg.puerto    ?? 587,
          usuario:   cfg.usuario   ?? '',
          cifrado:   cfg.cifrado   ?? 'STARTTLS',
          remitente: cfg.remitente ?? '',
          activo:    cfg.activo,
          password:  '',
        });
        this.form.markAsPristine();
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.snackBar.open('Error al cargar la configuración SMTP', 'Cerrar', { duration: 3000 });
      },
    });
  }

  guardar() {
    if (this.form.invalid || this.saving()) return;
    const v = this.form.getRawValue();
    const pwd = v.password?.trim();

    const payload = {
      host:      v.host!,
      puerto:    v.puerto!,
      usuario:   v.usuario!,
      cifrado:   v.cifrado! as 'TLS' | 'STARTTLS' | 'NONE',
      remitente: v.remitente!,
      activo:    v.activo!,
      ...(pwd ? { password: pwd } : {}),
    };

    this.saving.set(true);
    this.service.updateSmtp(payload).subscribe({
      next: () => {
        this.saving.set(false);
        this.configurado.set(true);
        this.form.controls.password.setValue('');
        this.form.markAsPristine();
        this.snackBar.open('Configuración SMTP guardada', '', { duration: 2500 });
      },
      error: (err) => {
        this.saving.set(false);
        const msg = err?.error?.mensaje ?? 'Error al guardar la configuración SMTP';
        this.snackBar.open(msg, 'Cerrar', { duration: 4000 });
      },
    });
  }

  probar() {
    if (this.testando()) return;
    this.testando.set(true);
    this.testResult.set(null);
    this.service.probarSmtp().subscribe({
      next: r => { this.testResult.set(r); this.testando.set(false); },
      error: () => {
        this.testResult.set({ exitoso: false, mensaje: 'Error inesperado al enviar el correo de prueba' });
        this.testando.set(false);
      },
    });
  }

  get puertoSugerido(): string {
    const v = this.form.controls.cifrado.value ?? '';
    const p = PORT_SUGERIDO[v];
    return p ? `Puerto estándar para ${v}: ${p}` : '';
  }
}
