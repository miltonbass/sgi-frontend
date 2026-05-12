import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { ReporteService } from '../../core/services/reporte.service';
import { DashboardGlobalResponse, DashboardGlobalSede } from '../../core/models/reporte.model';

const COLORS = ['#1565c0', '#2e7d32', '#e65100', '#6a1b9a', '#c62828', '#00838f'];

interface ChartLine {
  sedeNombre: string;
  sedeCodigo: string;
  color: string;
  points: string;
  dots: { cx: number; cy: number; value: number }[];
}
interface ChartLabel { x: number; label: string; show: boolean; }
interface ComparisonChart {
  lines: ChartLine[];
  labels: ChartLabel[];
  W: number; H: number; padL: number; padT: number; innerH: number; baseY: number;
}

@Component({
  selector: 'app-dashboard-global',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatCardModule, MatIconModule, MatButtonModule,
    MatProgressSpinnerModule, MatTooltipModule,
    MatFormFieldModule, MatInputModule, MatDatepickerModule, MatNativeDateModule,
  ],
  templateUrl: './dashboard-global.component.html',
  styleUrl: './dashboard-global.component.scss',
})
export class DashboardGlobalComponent implements OnInit {
  private readonly service = inject(ReporteService);

  readonly loading   = signal(true);
  readonly dashboard = signal<DashboardGlobalResponse | null>(null);

  private readonly _hoy    = new Date();
  private readonly _hace6m = new Date(new Date().setMonth(new Date().getMonth() - 6));
  readonly fechaDesdeCtrl  = new FormControl<Date>(this._hace6m, { nonNullable: true });
  readonly fechaHastaCtrl  = new FormControl<Date>(this._hoy,    { nonNullable: true });

  readonly colors = COLORS;

  readonly totales = computed(() => {
    const sedes = this.dashboard()?.sedes ?? [];
    const conAsistencia = sedes.filter(s => s.kpis.asistenciaPromedio !== null);
    return {
      totalMiembrosActivos:    sedes.reduce((a, s) => a + s.kpis.totalMiembrosActivos, 0),
      nuevosMes:               sedes.reduce((a, s) => a + s.kpis.nuevosMes, 0),
      miembrosEnConsolidacion: sedes.reduce((a, s) => a + s.kpis.miembrosEnConsolidacion, 0),
      asistenciaPromedio:      conAsistencia.length
        ? conAsistencia.reduce((a, s) => a + s.kpis.asistenciaPromedio!, 0) / conAsistencia.length
        : null,
    };
  });

  readonly chart = computed<ComparisonChart | null>(() => {
    const sedes = this.dashboard()?.sedes;
    if (!sedes?.length || !sedes[0].crecimiento.length) return null;
    return this.buildChart(sedes);
  });

  ngOnInit() { this.cargarDashboard(); }

  cargarDashboard() {
    this.loading.set(true);
    this.service.getDashboardGlobal(this.fmtDate(this.fechaDesdeCtrl.value), this.fmtDate(this.fechaHastaCtrl.value)).subscribe({
      next: d  => { this.dashboard.set(d); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  private fmtDate(d: Date): string {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  private buildChart(sedes: DashboardGlobalSede[]): ComparisonChart {
    const W = 900, H = 220;
    const padL = 48, padT = 20, padR = 16, padB = 65;
    const innerW = W - padL - padR;
    const innerH = H - padT - padB;
    const periods = sedes[0].crecimiento;
    const colW = innerW / periods.length;

    const allTotales = sedes.flatMap(s => s.crecimiento.map(c => c.totalMiembros));
    const maxTotal = Math.max(...allTotales, 1);
    const minTotal = Math.min(...allTotales, 0);
    const range = maxTotal - minTotal || 1;
    const lineZone = innerH * 0.85;
    const lineTop  = padT + (innerH - lineZone) / 2;

    const n = periods.length;
    const step = n <= 10 ? 1 : n <= 20 ? 2 : n <= 60 ? 7 : 14;

    const lines: ChartLine[] = sedes.map((sede, si) => {
      const color = COLORS[si % COLORS.length];
      const dots = sede.crecimiento.map((c, i) => ({
        cx: padL + i * colW + colW / 2,
        cy: lineTop + lineZone - ((c.totalMiembros - minTotal) / range) * lineZone,
        value: c.totalMiembros,
      }));
      return { sedeNombre: sede.sedeNombre, sedeCodigo: sede.sedeCodigo, color, points: dots.map(d => `${d.cx},${d.cy}`).join(' '), dots };
    });

    const labels: ChartLabel[] = periods.map((p, i) => ({
      x: padL + i * colW + colW / 2, label: p.label, show: i % step === 0,
    }));

    return { lines, labels, W, H, padL, padT, innerH, baseY: padT + innerH };
  }

  asistenciaDeCada10(pct: number | null): string {
    if (pct === null) return '—';
    return Math.round(pct / 10).toString();
  }
}
