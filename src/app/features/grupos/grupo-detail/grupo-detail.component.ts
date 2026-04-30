import { Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Location, DatePipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { GrupoService } from '../../../core/services/grupo.service';
import { Grupo, MiembroGrupo, TIPO_GRUPO_LABELS } from '../../../core/models/grupo.model';
import { GrupoFormComponent } from '../grupo-form/grupo-form.component';
import { GrupoMiembroDialogComponent } from '../grupo-miembro-dialog/grupo-miembro-dialog.component';
import { ConfirmDialogComponent } from '../../../shared/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-grupo-detail',
  standalone: true,
  imports: [
    DatePipe,
    MatCardModule, MatButtonModule, MatIconModule, MatTableModule,
    MatProgressSpinnerModule, MatTooltipModule, MatDividerModule,
  ],
  templateUrl: './grupo-detail.component.html',
  styleUrl: './grupo-detail.component.scss',
})
export class GrupoDetailComponent implements OnInit {
  private readonly route        = inject(ActivatedRoute);
  private readonly grupoService = inject(GrupoService);
  private readonly dialog       = inject(MatDialog);
  private readonly snackBar     = inject(MatSnackBar);
  readonly location             = inject(Location);

  readonly loading  = signal(true);
  readonly grupo    = signal<Grupo | null>(null);
  readonly miembros = signal<MiembroGrupo[]>([]);

  readonly tipoLabels = TIPO_GRUPO_LABELS;
  readonly columns    = ['nombre', 'email', 'rol', 'fechaIngreso', 'acciones'];

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.load(id);
  }

  load(id: string) {
    this.loading.set(true);
    this.grupoService.getById(id).subscribe({
      next: g => {
        this.grupo.set(g);
        this.grupoService.getMiembros(id).subscribe({
          next: m => { this.miembros.set(m); this.loading.set(false); },
          error: () => this.loading.set(false),
        });
      },
      error: () => {
        this.loading.set(false);
        this.snackBar.open('Error al cargar el grupo', 'Cerrar', { duration: 3000 });
      },
    });
  }

  openEdit() {
    if (!this.grupo()) return;
    this.dialog.open(GrupoFormComponent, { width: '560px', disableClose: true, data: this.grupo() })
      .afterClosed().subscribe(ok => ok && this.load(this.grupo()!.id));
  }

  openAgregarMiembro() {
    this.dialog.open(GrupoMiembroDialogComponent, { width: '460px', data: this.grupo()!.id })
      .afterClosed().subscribe(ok => ok && this.load(this.grupo()!.id));
  }

  quitarMiembro(m: MiembroGrupo) {
    this.dialog.open(ConfirmDialogComponent, {
      data: {
        title:   'Quitar miembro',
        message: `¿Quitar a ${m.nombres} ${m.apellidos} del grupo?`,
        confirmLabel: 'Quitar',
      },
    }).afterClosed().subscribe(result => {
      if (!result?.confirmed) return;
      this.grupoService.quitarMiembro(this.grupo()!.id, m.miembroId).subscribe({
        next: () => {
          this.snackBar.open('Miembro removido', '', { duration: 2500 });
          this.miembros.update(list => list.filter(x => x.miembroId !== m.miembroId));
        },
        error: err => this.snackBar.open(err.error?.mensaje ?? 'Error', 'Cerrar', { duration: 3000 }),
      });
    });
  }

  tipoLabel(tipo: string) { return this.tipoLabels[tipo as keyof typeof this.tipoLabels] ?? tipo; }
}
