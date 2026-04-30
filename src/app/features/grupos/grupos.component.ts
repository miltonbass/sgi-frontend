import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { GrupoService } from '../../core/services/grupo.service';
import { Grupo, TipoGrupo, TIPO_GRUPO_LABELS } from '../../core/models/grupo.model';
import { GrupoFormComponent } from './grupo-form/grupo-form.component';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-grupos',
  standalone: true,
  imports: [
    RouterLink, ReactiveFormsModule,
    MatTableModule, MatPaginatorModule, MatButtonModule,
    MatIconModule, MatFormFieldModule, MatSelectModule,
    MatProgressSpinnerModule, MatTooltipModule,
  ],
  templateUrl: './grupos.component.html',
  styleUrl: './grupos.component.scss',
})
export class GruposComponent implements OnInit, OnDestroy {
  private readonly grupoService = inject(GrupoService);
  private readonly dialog       = inject(MatDialog);
  private readonly snackBar     = inject(MatSnackBar);
  private readonly destroy$     = new Subject<void>();

  readonly loading   = signal(false);
  readonly grupos    = signal<Grupo[]>([]);
  readonly total     = signal(0);
  readonly pageIndex = signal(0);
  readonly pageSize  = signal(20);

  readonly tipoCtrl  = new FormControl<TipoGrupo | ''>('');
  readonly tipoLabels = TIPO_GRUPO_LABELS;
  readonly tipos: (TipoGrupo | '')[] = ['', 'CELULA', 'MINISTERIO', 'CLASE'];

  readonly displayedColumns = ['nombre', 'tipo', 'lider', 'miembros', 'activo', 'acciones'];

  ngOnInit() {
    this.load();
    this.tipoCtrl.valueChanges.pipe(
      debounceTime(200), distinctUntilChanged(), takeUntil(this.destroy$),
    ).subscribe(() => { this.pageIndex.set(0); this.load(); });
  }

  ngOnDestroy() { this.destroy$.next(); this.destroy$.complete(); }

  load() {
    this.loading.set(true);
    const tipo = this.tipoCtrl.value || undefined;
    this.grupoService.getAll({ tipo, page: this.pageIndex(), size: this.pageSize() }).subscribe({
      next: res => {
        this.grupos.set(res.content);
        this.total.set(res.totalElements);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.snackBar.open('Error al cargar grupos', 'Cerrar', { duration: 3000 });
      },
    });
  }

  onPage(e: PageEvent) {
    this.pageIndex.set(e.pageIndex);
    this.pageSize.set(e.pageSize);
    this.load();
  }

  openCreate() {
    this.dialog.open(GrupoFormComponent, { width: '560px', disableClose: true })
      .afterClosed().subscribe(ok => ok && this.load());
  }

  openEdit(grupo: Grupo) {
    this.dialog.open(GrupoFormComponent, { width: '560px', disableClose: true, data: grupo })
      .afterClosed().subscribe(ok => ok && this.load());
  }

  toggleStatus(grupo: Grupo) {
    const activar = !grupo.activo;
    this.dialog.open(ConfirmDialogComponent, {
      data: {
        title:        activar ? 'Activar grupo' : 'Desactivar grupo',
        message:      `¿Deseas ${activar ? 'activar' : 'desactivar'} el grupo "${grupo.nombre}"?`,
        confirmLabel: activar ? 'Activar' : 'Desactivar',
      },
    }).afterClosed().subscribe(result => {
      if (!result?.confirmed) return;
      const op$ = activar ? this.grupoService.activar(grupo.id) : this.grupoService.desactivar(grupo.id);
      op$.subscribe({
        next: () => {
          this.snackBar.open(`Grupo ${activar ? 'activado' : 'desactivado'}`, '', { duration: 2500 });
          this.load();
        },
        error: err => this.snackBar.open(err.error?.mensaje ?? 'Error', 'Cerrar', { duration: 3000 }),
      });
    });
  }

  tipoLabel(tipo: TipoGrupo) { return TIPO_GRUPO_LABELS[tipo] ?? tipo; }
}
