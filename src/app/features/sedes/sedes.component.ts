import { Component, inject, signal, OnInit } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SedeService } from '../../core/services/sede.service';
import { Sede } from '../../core/models/sede.model';
import { SedeFormComponent } from './sede-form/sede-form.component';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-sedes',
  standalone: true,
  imports: [
    MatTableModule, MatPaginatorModule, MatButtonModule,
    MatIconModule, MatProgressSpinnerModule, MatTooltipModule,
  ],
  templateUrl: './sedes.component.html',
  styleUrl: './sedes.component.scss',
})
export class SedesComponent implements OnInit {
  private readonly sedeService = inject(SedeService);
  private readonly dialog      = inject(MatDialog);
  private readonly snackBar    = inject(MatSnackBar);

  readonly loading   = signal(false);
  readonly sedes     = signal<Sede[]>([]);
  readonly total     = signal(0);
  readonly pageIndex = signal(0);
  readonly pageSize  = signal(20);

  readonly displayedColumns = ['codigo', 'nombreCorto', 'nombre', 'ciudad', 'status', 'acciones'];

  ngOnInit() { this.load(); }

  load() {
    this.loading.set(true);
    this.sedeService.getAll({ page: this.pageIndex(), size: this.pageSize() }).subscribe({
      next: res => {
        this.sedes.set(res.content);
        this.total.set(res.totalElements);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.snackBar.open('Error al cargar sedes', 'Cerrar', { duration: 3000 });
      },
    });
  }

  onPage(e: PageEvent) {
    this.pageIndex.set(e.pageIndex);
    this.pageSize.set(e.pageSize);
    this.load();
  }

  openCreate() {
    this.dialog
      .open(SedeFormComponent, { width: '560px', disableClose: true })
      .afterClosed().subscribe(ok => ok && this.load());
  }

  openEdit(sede: Sede) {
    this.dialog
      .open(SedeFormComponent, { width: '560px', disableClose: true, data: sede })
      .afterClosed().subscribe(ok => ok && this.load());
  }

  toggleStatus(sede: Sede) {
    const activar = !sede.activa;
    const titulo  = activar ? 'Activar sede' : 'Desactivar sede';
    const mensaje = activar
      ? `¿Deseas activar la sede "${sede.nombreCorto}"?`
      : `¿Deseas desactivar la sede "${sede.nombreCorto}"? Los usuarios de esta sede no podrán iniciar sesión.`;

    this.dialog.open(ConfirmDialogComponent, {
      data: { title: titulo, message: mensaje, confirmLabel: activar ? 'Activar' : 'Desactivar' },
    }).afterClosed().subscribe(result => {
      if (!result?.confirmed) return;
      const op$ = activar
        ? this.sedeService.activar(sede.id)
        : this.sedeService.desactivar(sede.id);
      op$.subscribe({
        next: () => {
          this.snackBar.open(`Sede ${activar ? 'activada' : 'desactivada'}`, '', { duration: 2500 });
          this.load();
        },
        error: err => this.snackBar.open(err.error?.mensaje ?? 'Error', 'Cerrar', { duration: 3000 }),
      });
    });
  }
}
