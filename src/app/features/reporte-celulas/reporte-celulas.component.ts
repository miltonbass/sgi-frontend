import { Component, inject, signal, OnInit } from '@angular/core';
import { DecimalPipe, DatePipe } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatTableModule } from '@angular/material/table';
import { ReporteService } from '../../core/services/reporte.service';
import {
  ReporteCelulaItem, ReporteCelulasResponse,
  ReporteCelulaDetalleResponse,
} from '../../core/models/reporte.model';

@Component({
  selector: 'app-reporte-celulas',
  standalone: true,
  imports: [
    DecimalPipe, DatePipe, ReactiveFormsModule,
    MatCardModule, MatButtonModule, MatIconModule,
    MatFormFieldModule, MatInputModule, MatSelectModule,
    MatSlideToggleModule, MatProgressSpinnerModule, MatTooltipModule,
    MatDividerModule, MatDatepickerModule, MatNativeDateModule, MatTableModule,
  ],
  templateUrl: './reporte-celulas.component.html',
  styleUrl:    './reporte-celulas.component.scss',
})
export class ReporteCelulasComponent implements OnInit {
  private readonly service = inject(ReporteService);

  private readonly _hoy    = new Date();
  private readonly _hace30 = new Date(new Date().setDate(new Date().getDate() - 30));

  readonly fechaDesdeCtrl  = new FormControl<Date>(this._hace30, { nonNullable: true });
  readonly fechaHastaCtrl  = new FormControl<Date>(this._hoy,    { nonNullable: true });
  readonly nivelCtrl       = new FormControl<number | ''>('',    { nonNullable: true });
  readonly soloActivasCtrl = new FormControl<boolean>(true,      { nonNullable: true });

  readonly loading        = signal(false);
  readonly loadingDetalle = signal(false);
  readonly errorDetalle   = signal('');
  readonly reporte        = signal<ReporteCelulasResponse | null>(null);
  readonly detalle        = signal<ReporteCelulaDetalleResponse | null>(null);
  readonly seleccionada   = signal<ReporteCelulaItem | null>(null);

  readonly sesionCols  = ['fecha', 'tema', 'presentes', 'visitantes', 'ofrenda'];
  readonly miembroCols = ['nombre', 'asistidas', 'pct'];

  ngOnInit() { this.buscar(); }

  buscar() {
    this.loading.set(true);
    this.detalle.set(null);
    this.seleccionada.set(null);
    const nivel = this.nivelCtrl.value;
    this.service.getReporteCelulas({
      fechaDesde:  this.fmtDate(this.fechaDesdeCtrl.value),
      fechaHasta:  this.fmtDate(this.fechaHastaCtrl.value),
      nivel:       nivel !== '' ? nivel : undefined,
      soloActivas: this.soloActivasCtrl.value,
    }).subscribe({
      next:  r  => { this.reporte.set(r); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  seleccionar(celula: ReporteCelulaItem) {
    if (this.seleccionada()?.id === celula.id) return;
    this.seleccionada.set(celula);
    this.detalle.set(null);
    this.errorDetalle.set('');
    this.loadingDetalle.set(true);
    this.service.getReporteCelulaDetalle(celula.id, {
      fechaDesde: this.fmtDate(this.fechaDesdeCtrl.value),
      fechaHasta: this.fmtDate(this.fechaHastaCtrl.value),
    }).subscribe({
      next:  d  => { this.detalle.set(d); this.loadingDetalle.set(false); },
      error: (err) => {
        this.loadingDetalle.set(false);
        this.errorDetalle.set(err?.error?.mensaje ?? 'Error al cargar el detalle de la célula');
      },
    });
  }

  volverListado() {
    this.seleccionada.set(null);
    this.detalle.set(null);
  }

  indentPx(nivel: number): number { return nivel * 28; }

  fmtDate(d: Date): string { return d.toISOString().split('T')[0]; }

  fmtNum(n: number | null): string { return n == null ? '—' : n.toFixed(1); }

  fmtOfrenda(n: number | null): string {
    if (n == null) return '—';
    return '$' + n.toLocaleString('es-CO', { minimumFractionDigits: 0 });
  }
}
