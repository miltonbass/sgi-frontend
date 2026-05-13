import { Component, inject, signal, OnInit } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, switchMap, of } from 'rxjs';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MemberService } from '../../../core/services/member.service';
import { Miembro } from '../../../core/models/member.model';

interface DialogData { miembroId: string; consolidadorActual: string | null; }

@Component({
  selector: 'app-member-consolidador-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule, MatDialogModule, MatFormFieldModule,
    MatInputModule, MatAutocompleteModule, MatButtonModule,
    MatProgressSpinnerModule, MatIconModule,
  ],
  template: `
    <h2 mat-dialog-title>Asignar consolidador</h2>
    <mat-dialog-content class="dialog-content">

      @if (data.consolidadorActual) {
        <div class="actual-info">
          <mat-icon>person</mat-icon>
          <div>
            <span class="actual-label">Consolidador actual</span>
            <span class="actual-nombre">{{ data.consolidadorActual }}</span>
          </div>
        </div>
      }

      <mat-form-field appearance="outline" class="full-width" style="margin-top:8px">
        <mat-label>Buscar nuevo consolidador</mat-label>
        <input matInput [formControl]="busquedaCtrl"
          [matAutocomplete]="auto"
          placeholder="Nombre, cédula o email..." />
        <mat-icon matSuffix>person_search</mat-icon>
        <mat-autocomplete #auto (optionSelected)="seleccionar($event.option.value)">
          @for (m of opciones(); track m.id) {
            <mat-option [value]="m">
              {{ m.nombres }} {{ m.apellidos }}
              <small style="color:#a0aec0"> — {{ m.email }}</small>
            </mat-option>
          }
          @if (opciones().length === 0 && (busquedaCtrl.value?.length ?? 0) >= 2) {
            <mat-option disabled>Sin resultados</mat-option>
          }
        </mat-autocomplete>
      </mat-form-field>

      @if (seleccionado()) {
        <div class="seleccionado-info">
          <mat-icon style="color:#38a169">check_circle</mat-icon>
          <span>{{ seleccionado()!.nombres }} {{ seleccionado()!.apellidos }}</span>
          <button mat-icon-button type="button" (click)="limpiar()">
            <mat-icon style="font-size:16px">close</mat-icon>
          </button>
        </div>
      }

      @if (error()) {
        <div class="form-error" style="margin-top:8px">{{ error() }}</div>
      }
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      @if (data.consolidadorActual) {
        <button mat-button color="warn" [disabled]="loading()" (click)="quitar()">
          Quitar consolidador
        </button>
      }
      <button mat-button [disabled]="loading()" (click)="cancel()">Cancelar</button>
      <button mat-raised-button color="primary"
        [disabled]="loading() || !seleccionado()" (click)="submit()">
        @if (loading()) { <mat-spinner diameter="18" /> } @else { Asignar }
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .actual-info {
      display: flex; align-items: center; gap: 10px;
      background: #f8f9fc; border-radius: 8px; padding: 10px 14px;
      margin-bottom: 4px;
      mat-icon { color: #a0aec0; }
    }
    .actual-label { display: block; font-size: 11px; font-weight: 700; text-transform: uppercase; color: #a0aec0; }
    .actual-nombre { font-size: 14px; font-weight: 600; color: #2d3748; }
    .seleccionado-info {
      display: flex; align-items: center; gap: 8px;
      background: #f0fff4; border-radius: 8px; padding: 8px 12px;
      font-size: 14px; font-weight: 600; color: #276749;
    }
  `],
})
export class MemberConsolidadorDialogComponent implements OnInit {
  readonly data: DialogData      = inject(MAT_DIALOG_DATA);
  private readonly memberService = inject(MemberService);
  private readonly dialogRef     = inject(MatDialogRef<MemberConsolidadorDialogComponent>);

  readonly busquedaCtrl = new FormControl('');
  readonly opciones     = signal<Miembro[]>([]);
  readonly seleccionado = signal<Miembro | null>(null);
  readonly loading      = signal(false);
  readonly error        = signal('');

  ngOnInit() {
    this.busquedaCtrl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(q => q && q.length >= 2
        ? this.memberService.buscar({ q, size: 10 })
        : of({ content: [] } as any)
      ),
    ).subscribe(res => this.opciones.set(res.content ?? []));
  }

  seleccionar(m: Miembro) {
    this.seleccionado.set(m);
    this.busquedaCtrl.setValue(`${m.nombres} ${m.apellidos}`, { emitEvent: false });
    this.opciones.set([]);
  }

  limpiar() {
    this.seleccionado.set(null);
    this.busquedaCtrl.setValue('');
  }

  submit() {
    const m = this.seleccionado();
    if (!m) return;
    this.guardar(m.id);
  }

  quitar() { this.guardar(null); }

  private guardar(consolidadorId: string | null) {
    this.loading.set(true);
    this.error.set('');
    this.memberService.asignarConsolidador(this.data.miembroId, consolidadorId).subscribe({
      next: () => { this.loading.set(false); this.dialogRef.close(true); },
      error: err => {
        this.loading.set(false);
        this.error.set(err.error?.mensaje ?? 'Error al actualizar');
      },
    });
  }

  cancel() { this.dialogRef.close(false); }
}
