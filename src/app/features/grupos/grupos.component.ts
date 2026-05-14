import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../core/services/auth.service';
import { GrupoService } from '../../core/services/grupo.service';
import { Grupo, TipoGrupo, TIPO_GRUPO_LABELS } from '../../core/models/grupo.model';
import { GrupoFormComponent } from './grupo-form/grupo-form.component';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog.component';

const ALL_TABS: { tipo: TipoGrupo; label: string; icon: string }[] = [
  { tipo: 'CELULA',     label: 'Células',      icon: 'groups'      },
  { tipo: 'MINISTERIO', label: 'Ministerios',   icon: 'music_note'  },
  { tipo: 'CLASE',      label: 'Clases',        icon: 'school'      },
];

@Component({
  selector: 'app-grupos',
  standalone: true,
  imports: [
    RouterLink,
    MatTableModule, MatPaginatorModule, MatButtonModule,
    MatIconModule, MatProgressSpinnerModule, MatTooltipModule,
    MatTabsModule,
  ],
  templateUrl: './grupos.component.html',
  styleUrl: './grupos.component.scss',
})
export class GruposComponent implements OnInit, OnDestroy {
  private readonly grupoService = inject(GrupoService);
  private readonly auth         = inject(AuthService);
  private readonly dialog       = inject(MatDialog);
  private readonly snackBar     = inject(MatSnackBar);
  private readonly destroy$     = new Subject<void>();

  readonly loading      = signal(false);
  readonly grupos       = signal<Grupo[]>([]);
  readonly total        = signal(0);
  readonly pageIndex    = signal(0);
  readonly pageSize     = signal(20);
  readonly selectedTab  = signal(0);

  readonly displayedColumns = ['nombre', 'lider', 'miembros', 'activo', 'acciones'];

  get isLiderCelula() {
    return this.auth.hasRole('LIDER_CELULA') && !this.auth.hasAnyRole(['ADMIN_SEDE', 'PASTOR_SEDE', 'ADMIN_GLOBAL']);
  }

  get tabs() {
    return this.isLiderCelula ? [ALL_TABS[0]] : ALL_TABS;
  }

  get activeTipo(): TipoGrupo {
    return this.tabs[this.selectedTab()].tipo;
  }

  get canCreate() {
    return this.auth.hasAnyRole(['ADMIN_GLOBAL', 'ADMIN_SEDE', 'PASTOR_SEDE']);
  }

  ngOnInit() { this.load(); }
  ngOnDestroy() { this.destroy$.next(); this.destroy$.complete(); }

  load() {
    this.loading.set(true);
    this.grupoService.getAll({ tipo: this.activeTipo, page: this.pageIndex(), size: this.pageSize() }).subscribe({
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

  onTabChange(index: number) {
    if (this.selectedTab() === index) return;
    this.selectedTab.set(index);
    this.pageIndex.set(0);
    this.load();
  }

  onPage(e: PageEvent) {
    this.pageIndex.set(e.pageIndex);
    this.pageSize.set(e.pageSize);
    this.load();
  }

  openCreate() {
    this.dialog.open(GrupoFormComponent, {
      width: '560px', disableClose: true,
      data: { tipo: this.activeTipo },
    }).afterClosed().subscribe(ok => ok && this.load());
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
