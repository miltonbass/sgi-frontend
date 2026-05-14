import { Component, inject, signal, OnInit } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { debounceTime, distinctUntilChanged, switchMap, of } from 'rxjs';
import { GrupoService } from '../../../core/services/grupo.service';
import { Grupo } from '../../../core/models/grupo.model';

export interface GrupoTrasladoDialogData {
  grupoId: string;
  grupoNombre: string;
  padreActualNombre: string | null;
}

@Component({
  selector: 'app-grupo-traslado-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule, MatDialogModule, MatFormFieldModule,
    MatInputModule, MatAutocompleteModule,
    MatButtonModule, MatProgressSpinnerModule, MatIconModule,
  ],
  template: `
    <h2 mat-dialog-title>Trasladar grupo</h2>
    <mat-dialog-content>
      <p class="info-line">
        <strong>{{ data.grupoNombre }}</strong> pasará a ser hijo del grupo que selecciones.
      </p>
      @if (data.padreActualNombre) {
        <p class="padre-actual">
          <mat-icon>account_tree</mat-icon>
          Padre actual: <strong>{{ data.padreActualNombre }}</strong>
        </p>
      }

      <mat-form-field appearance="outline" class="full-width" style="margin-top:12px">
        <mat-label>Nuevo grupo padre</mat-label>
        <input matInput [formControl]="searchCtrl" [matAutocomplete]="auto"
               placeholder="Buscar por nombre..." autocomplete="off" />
        <mat-icon matSuffix>search</mat-icon>
        <mat-autocomplete #auto (optionSelected)="seleccionar($event.option.value)">
          @for (g of opciones(); track g.id) {
            <mat-option [value]="g">{{ g.nombre }}</mat-option>
          }
        </mat-autocomplete>
      </mat-form-field>

      @if (seleccionado()) {
        <p class="nuevo-padre">
          <mat-icon>check_circle</mat-icon>
          Nuevo padre: <strong>{{ seleccionado()!.nombre }}</strong>
        </p>
      }

      @if (error()) {
        <p class="error-msg">{{ error() }}</p>
      }
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button (click)="cancel()" [disabled]="saving()">Cancelar</button>
      <button mat-raised-button color="warn"
        [disabled]="!seleccionado() || saving()"
        (click)="confirmar()">
        @if (saving()) { <mat-spinner diameter="18" /> } @else { Trasladar }
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .full-width { width: 100%; }
    .info-line   { margin: 0 0 8px; font-size: 14px; }
    .padre-actual, .nuevo-padre {
      display: flex; align-items: center; gap: 6px;
      font-size: 13px; margin: 4px 0;
    }
    .padre-actual { color: #718096; }
    .padre-actual mat-icon, .nuevo-padre mat-icon { font-size: 18px; width: 18px; height: 18px; }
    .nuevo-padre { color: #276749; }
    .error-msg { color: #e53e3e; font-size: 13px; }
  `],
})
export class GrupoTrasladoDialogComponent implements OnInit {
  private readonly grupoService = inject(GrupoService);
  private readonly dialogRef    = inject(MatDialogRef<GrupoTrasladoDialogComponent>);
  readonly data: GrupoTrasladoDialogData = inject(MAT_DIALOG_DATA);

  readonly searchCtrl  = new FormControl('');
  readonly opciones    = signal<Grupo[]>([]);
  readonly seleccionado = signal<Grupo | null>(null);
  readonly saving      = signal(false);
  readonly error       = signal('');

  ngOnInit() {
    this.searchCtrl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(q => typeof q === 'string' && q.length >= 2
        ? this.grupoService.getAll({ size: 10 })
        : of(null),
      ),
    ).subscribe(res => {
      if (!res) { this.opciones.set([]); return; }
      const q = (this.searchCtrl.value ?? '').toLowerCase();
      this.opciones.set(
        res.content.filter(g =>
          g.id !== this.data.grupoId &&
          g.nombre.toLowerCase().includes(q),
        ),
      );
    });
  }

  seleccionar(grupo: Grupo) {
    this.seleccionado.set(grupo);
    this.searchCtrl.setValue(grupo.nombre, { emitEvent: false });
    this.opciones.set([]);
  }

  confirmar() {
    const nuevo = this.seleccionado();
    if (!nuevo) return;
    this.saving.set(true);
    this.error.set('');
    this.grupoService.update(this.data.grupoId, { grupoPadreId: nuevo.id }).subscribe({
      next: () => { this.saving.set(false); this.dialogRef.close(true); },
      error: err => {
        this.saving.set(false);
        this.error.set(err.error?.mensaje ?? 'Error al trasladar');
      },
    });
  }

  cancel() { this.dialogRef.close(false); }
}
