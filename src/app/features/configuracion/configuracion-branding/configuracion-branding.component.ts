import { Component, inject, signal, OnInit, DestroyRef } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { ConfiguracionService } from '../../../core/services/configuracion.service';
import {
  ConfirmDialogComponent,
  ConfirmDialogData,
} from '../../../shared/confirm-dialog/confirm-dialog.component';

const HEX_RE = /^#[0-9A-Fa-f]{6}$/;
const DEFAULT_PRIMARY = '#1976D2';
const DEFAULT_ACCENT  = '#FF4081';
const MAX_SIZE_BYTES  = 2 * 1024 * 1024;
const MIME_ACEPTADOS  = ['image/png', 'image/svg+xml'];

@Component({
  selector: 'app-configuracion-branding',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatCardModule, MatButtonModule, MatIconModule,
    MatFormFieldModule, MatInputModule,
    MatProgressSpinnerModule, MatDividerModule,
  ],
  templateUrl: './configuracion-branding.component.html',
  styleUrl:    './configuracion-branding.component.scss',
})
export class ConfiguracionBrandingComponent implements OnInit {
  private readonly service  = inject(ConfiguracionService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly dialog   = inject(MatDialog);
  private readonly fb       = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  readonly loading      = signal(false);
  readonly savingLogo   = signal(false);
  readonly savingColors = signal(false);

  readonly logoPreviewUrl         = signal<string | null>(null);
  readonly logoCompactoPreviewUrl = signal<string | null>(null);
  readonly logoFile               = signal<File | null>(null);
  readonly logoCompactoFile       = signal<File | null>(null);
  readonly logoError              = signal('');
  readonly logoCompactoError      = signal('');
  readonly tieneLogoPersonalizado = signal(false);
  readonly tieneLogoCompacto      = signal(false);

  private _logoBlobUrl:         string | null = null;
  private _logoCompactoBlobUrl: string | null = null;

  readonly form = this.fb.group({
    colorPrimario: [DEFAULT_PRIMARY, [Validators.required, Validators.pattern(HEX_RE)]],
    colorAcento:   [DEFAULT_ACCENT,  [Validators.required, Validators.pattern(HEX_RE)]],
  });

  constructor() {
    this.form.valueChanges.pipe(takeUntilDestroyed()).subscribe(v => {
      if (v.colorPrimario && HEX_RE.test(v.colorPrimario)) {
        document.documentElement.style.setProperty('--sgi-primary', v.colorPrimario);
      }
      if (v.colorAcento && HEX_RE.test(v.colorAcento)) {
        document.documentElement.style.setProperty('--sgi-accent', v.colorAcento);
      }
    });

    this.destroyRef.onDestroy(() => {
      if (this._logoBlobUrl)         URL.revokeObjectURL(this._logoBlobUrl);
      if (this._logoCompactoBlobUrl) URL.revokeObjectURL(this._logoCompactoBlobUrl);
    });
  }

  ngOnInit() { this.cargar(); }

  cargar() {
    this.loading.set(true);
    this.service.getBranding().subscribe({
      next: cfg => {
        this.form.patchValue({
          colorPrimario: cfg.colorPrimario ?? DEFAULT_PRIMARY,
          colorAcento:   cfg.colorAcento   ?? DEFAULT_ACCENT,
        });
        this.form.markAsPristine();
        this.tieneLogoPersonalizado.set(cfg.tieneLogoPersonalizado);
        this.tieneLogoCompacto.set(cfg.tieneLogoCompacto);

        if (cfg.tieneLogoPersonalizado) { this.fetchLogo('principal'); }
        if (cfg.tieneLogoCompacto)       { this.fetchLogo('compacto'); }

        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.snackBar.open('Error al cargar la configuración de apariencia', 'Cerrar', { duration: 3000 });
      },
    });
  }

  private fetchLogo(tipo: 'principal' | 'compacto') {
    const req$ = tipo === 'principal'
      ? this.service.getLogo()
      : this.service.getLogoCompacto();

    req$.subscribe({
      next: blob => {
        if (tipo === 'principal') {
          if (this._logoBlobUrl) URL.revokeObjectURL(this._logoBlobUrl);
          this._logoBlobUrl = URL.createObjectURL(blob);
          this.logoPreviewUrl.set(this._logoBlobUrl);
        } else {
          if (this._logoCompactoBlobUrl) URL.revokeObjectURL(this._logoCompactoBlobUrl);
          this._logoCompactoBlobUrl = URL.createObjectURL(blob);
          this.logoCompactoPreviewUrl.set(this._logoCompactoBlobUrl);
        }
      },
      error: () => {},
    });
  }

  onLogoChange(event: Event, tipo: 'principal' | 'compacto') {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;

    const errorSignal = tipo === 'principal' ? this.logoError : this.logoCompactoError;

    if (!MIME_ACEPTADOS.includes(file.type)) {
      errorSignal.set('Solo se aceptan PNG y SVG');
      return;
    }
    if (file.size > MAX_SIZE_BYTES) {
      errorSignal.set('El archivo supera los 2 MB');
      return;
    }

    errorSignal.set('');
    if (tipo === 'principal') this.logoFile.set(file);
    else                      this.logoCompactoFile.set(file);

    const reader = new FileReader();
    reader.onload = () => {
      if (tipo === 'principal') this.logoPreviewUrl.set(reader.result as string);
      else                      this.logoCompactoPreviewUrl.set(reader.result as string);
    };
    reader.readAsDataURL(file);
  }

  subirLogo() {
    const logo     = this.logoFile();
    const compacto = this.logoCompactoFile();
    if (!logo && !compacto) return;

    const fd = new FormData();
    if (logo)     fd.append('logo',         logo);
    if (compacto) fd.append('logoCompacto', compacto);

    this.savingLogo.set(true);
    this.service.uploadLogo(fd).subscribe({
      next: () => {
        this.savingLogo.set(false);
        if (logo)     this.tieneLogoPersonalizado.set(true);
        if (compacto) this.tieneLogoCompacto.set(true);
        this.logoFile.set(null);
        this.logoCompactoFile.set(null);
        this.snackBar.open('Logo actualizado correctamente', '', { duration: 2500 });
        this.service.loadBranding();
      },
      error: (err) => {
        this.savingLogo.set(false);
        this.snackBar.open(err?.error?.mensaje ?? 'Error al subir el logo', 'Cerrar', { duration: 4000 });
      },
    });
  }

  guardarColores() {
    if (this.form.invalid || this.form.pristine || this.savingColors()) return;
    const v = this.form.getRawValue();

    this.savingColors.set(true);
    this.service.updateBranding({
      colorPrimario: v.colorPrimario!,
      colorAcento:   v.colorAcento!,
    }).subscribe({
      next: () => {
        this.savingColors.set(false);
        this.form.markAsPristine();
        this.snackBar.open('Colores guardados correctamente', '', { duration: 2500 });
        this.service.loadBranding();
      },
      error: (err) => {
        this.savingColors.set(false);
        this.snackBar.open(err?.error?.mensaje ?? 'Error al guardar los colores', 'Cerrar', { duration: 4000 });
      },
    });
  }

  restaurarDefaults() {
    this.dialog.open(ConfirmDialogComponent, {
      width: '420px',
      data: {
        title:        'Restaurar colores por defecto',
        message:      '¿Restaurar los colores predeterminados del sistema? Se perderán los colores personalizados.',
        confirmLabel: 'Restaurar',
      } satisfies ConfirmDialogData,
    }).afterClosed().subscribe(result => {
      if (!result?.confirmed) return;
      this.savingColors.set(true);
      this.service.updateBranding({ colorPrimario: DEFAULT_PRIMARY, colorAcento: DEFAULT_ACCENT })
        .subscribe({
          next: () => {
            this.savingColors.set(false);
            this.form.patchValue({ colorPrimario: DEFAULT_PRIMARY, colorAcento: DEFAULT_ACCENT });
            this.form.markAsPristine();
            document.documentElement.style.setProperty('--sgi-primary', DEFAULT_PRIMARY);
            document.documentElement.style.setProperty('--sgi-accent',  DEFAULT_ACCENT);
            this.snackBar.open('Colores restaurados al valor por defecto', '', { duration: 2500 });
            this.service.loadBranding();
          },
          error: () => {
            this.savingColors.set(false);
            this.snackBar.open('Error al restaurar los colores', 'Cerrar', { duration: 3000 });
          },
        });
    });
  }
}
