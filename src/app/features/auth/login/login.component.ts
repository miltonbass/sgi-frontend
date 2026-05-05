import { Component, inject, signal } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { AuthService } from '../../../core/services/auth.service';
import { SedeInfo } from '../../../core/models/auth.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule, MatInputModule, MatButtonModule,
    MatCardModule, MatIconModule, MatProgressSpinnerModule, MatSelectModule,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  private readonly fb     = inject(FormBuilder);
  private readonly auth   = inject(AuthService);
  private readonly router = inject(Router);

  readonly step     = signal<'email' | 'login'>('email');
  readonly loading  = signal(false);
  readonly error    = signal('');
  readonly hidePass = signal(true);
  readonly sedes    = signal<SedeInfo[]>([]);

  readonly emailForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
  });

  readonly loginForm = this.fb.group({
    password: ['', Validators.required],
    tenantId: ['', Validators.required],
  });

  get email() { return this.emailForm.value.email ?? ''; }

  continuar() {
    if (this.emailForm.invalid) return;
    this.loading.set(true);
    this.error.set('');

    this.auth.getSedes(this.email).subscribe({
      next: sedes => {
        if (sedes.length === 0) {
          this.loading.set(false);
          this.error.set('No se encontraron sedes para este correo.');
          return;
        }
        this.sedes.set(sedes);
        if (sedes.length === 1) {
          this.loginForm.patchValue({ tenantId: sedes[0].codigo });
        }
        this.step.set('login');
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.error.set('No se encontraron sedes para este correo.');
      },
    });
  }

  submit() {
    if (this.loginForm.invalid) return;
    this.loading.set(true);
    this.error.set('');

    const { password, tenantId } = this.loginForm.getRawValue();
    this.auth.login({ email: this.email, password: password!, tenantId: tenantId! }).subscribe({
      next: () => { this.loading.set(false); this.router.navigate(['/']); },
      error: err => {
        this.loading.set(false);
        this.error.set(err.error?.mensaje ?? 'Credenciales incorrectas');
      },
    });
  }

  back() {
    this.step.set('email');
    this.error.set('');
    this.loginForm.reset();
    this.sedes.set([]);
  }

  sedeLabel(sede: SedeInfo): string {
    return sede.nombre ?? sede.nombreCorto ?? sede.codigo;
  }
}
