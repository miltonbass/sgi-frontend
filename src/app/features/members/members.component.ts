import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgClass } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MemberService } from '../../core/services/member.service';
import { AuthService } from '../../core/services/auth.service';
import { Miembro, EstadoMiembro, ESTADO_LABELS, ESTADO_COLORS, TRANSICIONES_ESTADO } from '../../core/models/member.model';
import { MemberFormComponent } from './member-form/member-form.component';
import { MemberStatusDialogComponent } from './member-status-dialog/member-status-dialog.component';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-members',
  standalone: true,
  imports: [
    RouterLink, ReactiveFormsModule, NgClass,
    MatTableModule, MatPaginatorModule, MatButtonModule,
    MatIconModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatProgressSpinnerModule, MatTooltipModule, MatMenuModule,
  ],
  templateUrl: './members.component.html',
  styleUrl: './members.component.scss',
})
export class MembersComponent implements OnInit, OnDestroy {
  private readonly memberService = inject(MemberService);
  readonly auth = inject(AuthService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);
  private readonly destroy$ = new Subject<void>();

  readonly loading = signal(false);
  readonly miembros = signal<Miembro[]>([]);
  readonly total = signal(0);
  readonly pageIndex = signal(0);
  readonly pageSize = signal(20);

  readonly searchCtrl = new FormControl('');
  readonly estadoCtrl = new FormControl<EstadoMiembro | ''>('');

  readonly estadoLabels = ESTADO_LABELS;
  readonly estadoColors = ESTADO_COLORS;
  readonly estados: (EstadoMiembro | '')[] = ['', 'VISITOR', 'MIEMBRO', 'INACTIVO', 'RESTAURADO'];

  readonly displayedColumns = ['numeroMiembro', 'nombre', 'cedula', 'telefono', 'estado', 'acciones'];

  canCreate = this.auth.hasAnyRole(['ADMIN_GLOBAL', 'ADMIN_SEDE', 'SECRETARIA', 'REGISTRO_SEDE']);
  canChangeStatus = this.auth.hasAnyRole(['ADMIN_GLOBAL', 'ADMIN_SEDE', 'PASTOR_PRINCIPAL', 'PASTOR_SEDE']);
  canDelete = this.auth.hasAnyRole(['ADMIN_GLOBAL', 'ADMIN_SEDE', 'PASTOR_PRINCIPAL', 'PASTOR_SEDE']);

  ngOnInit() {
    this.load();

    this.searchCtrl.valueChanges.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      takeUntil(this.destroy$),
    ).subscribe(() => { this.pageIndex.set(0); this.load(); });

    this.estadoCtrl.valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe(() => { this.pageIndex.set(0); this.load(); });
  }

  ngOnDestroy() { this.destroy$.next(); this.destroy$.complete(); }

  load() {
    this.loading.set(true);
    const q = this.searchCtrl.value?.trim();
    const estado = (this.estadoCtrl.value as EstadoMiembro) || undefined;
    const page = this.pageIndex();
    const size = this.pageSize();

    const req$ = q
      ? this.memberService.buscar({ q, estado, page, size })
      : this.memberService.getAll({ estado, page, size });

    req$.subscribe({
      next: res => {
        this.miembros.set(res.content);
        this.total.set(res.totalElements);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.snackBar.open('Error al cargar miembros', 'Cerrar', { duration: 3000 });
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
      .open(MemberFormComponent, { width: '720px', disableClose: true })
      .afterClosed().subscribe(ok => ok && this.load());
  }

  openEdit(miembro: Miembro) {
    this.dialog
      .open(MemberFormComponent, { width: '720px', disableClose: true, data: miembro })
      .afterClosed().subscribe(ok => ok && this.load());
  }

  openCambioEstado(miembro: Miembro) {
    const transiciones = TRANSICIONES_ESTADO[miembro.estado];
    if (!transiciones.length) {
      this.snackBar.open('No hay transiciones disponibles', 'Cerrar', { duration: 3000 });
      return;
    }
    this.dialog
      .open(MemberStatusDialogComponent, { width: '420px', data: miembro })
      .afterClosed().subscribe(ok => ok && this.load());
  }

  openInactivar(miembro: Miembro) {
    this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Inactivar miembro',
        message: `¿Seguro que desea inactivar a ${miembro.nombres} ${miembro.apellidos}?`,
        inputLabel: 'Motivo',
        inputRequired: true,
        confirmLabel: 'Inactivar',
      },
    }).afterClosed().subscribe(result => {
      if (!result?.confirmed || !result.inputValue) return;
      this.memberService.inactivar(miembro.id, result.inputValue).subscribe({
        next: () => { this.snackBar.open('Miembro inactivado', '', { duration: 2500 }); this.load(); },
        error: err => this.snackBar.open(err.error?.mensaje ?? 'Error', 'Cerrar', { duration: 3000 }),
      });
    });
  }

  estadoLabel(e: EstadoMiembro) { return ESTADO_LABELS[e] ?? e; }
  estadoClass(e: EstadoMiembro) { return ESTADO_COLORS[e] ?? ''; }
}
