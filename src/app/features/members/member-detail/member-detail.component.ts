import { Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Location, DatePipe, NgClass } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MemberService } from '../../../core/services/member.service';
import { AuthService } from '../../../core/services/auth.service';
import { PerfilMiembro, ESTADO_LABELS, ESTADO_COLORS } from '../../../core/models/member.model';
import { MemberFormComponent } from '../member-form/member-form.component';
import { MemberStatusDialogComponent } from '../member-status-dialog/member-status-dialog.component';
import { MemberConsolidadorDialogComponent } from '../member-consolidador-dialog/member-consolidador-dialog.component';

@Component({
  selector: 'app-member-detail',
  standalone: true,
  imports: [
    DatePipe, NgClass, RouterLink,
    MatCardModule, MatButtonModule, MatIconModule,
    MatProgressSpinnerModule, MatDividerModule, MatTableModule, MatTooltipModule,
  ],
  templateUrl: './member-detail.component.html',
  styleUrl: './member-detail.component.scss',
})
export class MemberDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly memberService = inject(MemberService);
  readonly auth = inject(AuthService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);
  readonly location = inject(Location);

  readonly loading = signal(true);
  readonly perfil = signal<PerfilMiembro | null>(null);

  readonly estadoLabels = ESTADO_LABELS;
  readonly estadoColors = ESTADO_COLORS;

  readonly historialColumns = ['fecha', 'anterior', 'nuevo', 'motivo'];

  canEdit             = this.auth.hasAnyRole(['ADMIN_GLOBAL', 'ADMIN_SEDE', 'SECRETARIA', 'REGISTRO_SEDE']);
  canVerAsistencia    = this.auth.hasAnyRole(['ADMIN_GLOBAL', 'ADMIN_SEDE', 'PASTOR_SEDE']);
  canChangeStatus   = this.auth.hasAnyRole(['ADMIN_GLOBAL', 'ADMIN_SEDE', 'PASTOR_PRINCIPAL', 'PASTOR_SEDE']);
  canAsignarConsolidador = this.auth.hasAnyRole(['ADMIN_GLOBAL', 'ADMIN_SEDE', 'CONSOLIDACION_SEDE']);
  esPastorPrincipal = this.auth.hasRole('PASTOR_PRINCIPAL');

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.load(id);
  }

  load(id: string) {
    this.loading.set(true);
    this.memberService.getPerfil(id).subscribe({
      next: p => { this.perfil.set(p); this.loading.set(false); },
      error: () => {
        this.loading.set(false);
        this.snackBar.open('Error al cargar perfil', 'Cerrar', { duration: 3000 });
      },
    });
  }

  openEdit() {
    const miembro = this.perfil()?.datos;
    if (!miembro) return;
    this.dialog
      .open(MemberFormComponent, { width: '720px', disableClose: true, data: miembro })
      .afterClosed()
      .subscribe(ok => ok && this.load(miembro.id));
  }

  openCambioEstado() {
    const miembro = this.perfil()?.datos;
    if (!miembro) return;
    this.dialog
      .open(MemberStatusDialogComponent, { width: '420px', data: miembro })
      .afterClosed()
      .subscribe(ok => ok && this.load(miembro.id));
  }

  openConsolidador() {
    const miembro = this.perfil()?.datos;
    if (!miembro) return;
    this.dialog.open(MemberConsolidadorDialogComponent, {
      width: '460px',
      data: {
        miembroId: miembro.id,
        consolidadorActual: miembro.consolidadorNombre ?? null,
      },
    }).afterClosed().subscribe(ok => ok && this.load(miembro.id));
  }

  estadoLabel(e: string) { return ESTADO_LABELS[e as keyof typeof ESTADO_LABELS] ?? e; }
  estadoClass(e: string) { return ESTADO_COLORS[e as keyof typeof ESTADO_COLORS] ?? ''; }
}
