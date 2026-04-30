import { Component, inject, signal, OnInit } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, switchMap, of } from 'rxjs';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { GrupoService } from '../../../core/services/grupo.service';
import { MemberService } from '../../../core/services/member.service';
import { Miembro } from '../../../core/models/member.model';
import { ROLES_GRUPO } from '../../../core/models/grupo.model';

@Component({
  selector: 'app-grupo-miembro-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule, MatDialogModule, MatFormFieldModule,
    MatInputModule, MatSelectModule, MatAutocompleteModule,
    MatButtonModule, MatProgressSpinnerModule,
  ],
  template: `
    <h2 mat-dialog-title>Agregar miembro al grupo</h2>
    <mat-dialog-content class="dialog-content">
      <form [formGroup]="form" novalidate>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Buscar miembro</mat-label>
          <input matInput formControlName="busqueda"
            [matAutocomplete]="autoMiembro"
            placeholder="Nombre, cédula o email..." />
          <mat-autocomplete #autoMiembro (optionSelected)="seleccionar($event.option.value)">
            @for (m of opciones(); track m.id) {
              <mat-option [value]="m">
                {{ m.nombres }} {{ m.apellidos }}
                <small style="color:#a0aec0"> — {{ m.email }}</small>
              </mat-option>
            }
            @if (opciones().length === 0 && (form.get('busqueda')?.value?.length ?? 0) >= 2) {
              <mat-option disabled>Sin resultados</mat-option>
            }
          </mat-autocomplete>
          @if (form.get('miembroId')?.touched && form.get('miembroId')?.hasError('required')) {
            <mat-error>Selecciona un miembro</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Rol en el grupo</mat-label>
          <mat-select formControlName="rol">
            @for (r of roles; track r) {
              <mat-option [value]="r">{{ r }}</mat-option>
            }
          </mat-select>
          @if (form.get('rol')?.touched && form.get('rol')?.hasError('required')) {
            <mat-error>Requerido</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Fecha de ingreso al grupo</mat-label>
          <input matInput formControlName="fechaIngreso" type="date" />
        </mat-form-field>

        @if (error()) {
          <div class="form-error">{{ error() }}</div>
        }
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button [disabled]="loading()" (click)="cancel()">Cancelar</button>
      <button mat-raised-button color="primary"
        [disabled]="loading() || form.invalid || !miembroSeleccionado()"
        (click)="submit()">
        @if (loading()) { <mat-spinner diameter="18" /> } @else { Agregar }
      </button>
    </mat-dialog-actions>
  `,
})
export class GrupoMiembroDialogComponent implements OnInit {
  readonly grupoId: string       = inject(MAT_DIALOG_DATA);
  private readonly grupoService  = inject(GrupoService);
  private readonly memberService = inject(MemberService);
  private readonly dialogRef     = inject(MatDialogRef<GrupoMiembroDialogComponent>);
  private readonly fb            = inject(FormBuilder);

  readonly loading            = signal(false);
  readonly error              = signal('');
  readonly opciones           = signal<Miembro[]>([]);
  readonly miembroSeleccionado = signal(false);
  readonly roles              = ROLES_GRUPO;

  form = this.fb.group({
    busqueda:    [''],
    miembroId:   ['', Validators.required],
    rol:         ['MIEMBRO', Validators.required],
    fechaIngreso: [new Date().toISOString().split('T')[0]],
  });

  ngOnInit() {
    this.form.get('busqueda')!.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(q => q && q.length >= 2
        ? this.memberService.buscar({ q, size: 10 })
        : of({ content: [] } as any)
      ),
    ).subscribe(res => this.opciones.set(res.content ?? []));
  }

  seleccionar(miembro: Miembro) {
    this.form.patchValue({
      busqueda: `${miembro.nombres} ${miembro.apellidos}`,
      miembroId: miembro.id,
    });
    this.miembroSeleccionado.set(true);
  }

  submit() {
    if (this.form.invalid || !this.miembroSeleccionado()) return;
    this.loading.set(true);
    this.error.set('');
    const { miembroId, rol, fechaIngreso } = this.form.getRawValue();
    this.grupoService.asignarMiembro(this.grupoId, {
      miembroId: miembroId!,
      rol: rol!,
      fechaIngreso: fechaIngreso || undefined,
    }).subscribe({
      next: () => { this.loading.set(false); this.dialogRef.close(true); },
      error: err => {
        this.loading.set(false);
        this.error.set(err.error?.mensaje ?? 'Error al agregar miembro');
      },
    });
  }

  cancel() { this.dialogRef.close(false); }
}
