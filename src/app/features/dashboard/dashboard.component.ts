import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { ReporteService } from '../../core/services/reporte.service';
import { DashboardSedeResponse, CrecimientoPeriodo } from '../../core/models/reporte.model';

interface ChartBar {
  periodo: string;
  label: string;
  totalMiembros: number;
  nuevos: number;
  cx: number;
  barX: number;
  barY: number;
  barW: number;
  barH: number;
  lineY: number;
  showLabel: boolean;
}

interface ChartData {
  bars: ChartBar[];
  linePoints: string;
  W: number;
  H: number;
  padL: number;
  padT: number;
  innerH: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    DatePipe, DecimalPipe, ReactiveFormsModule,
    MatCardModule, MatIconModule, MatButtonModule,
    MatProgressSpinnerModule, MatTooltipModule, MatDividerModule,
    MatFormFieldModule, MatInputModule, MatDatepickerModule, MatNativeDateModule,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
  private readonly service = inject(ReporteService);
  private readonly router  = inject(Router);

  readonly loading   = signal(true);
  readonly dashboard = signal<DashboardSedeResponse | null>(null);

  private readonly _hoy      = new Date();
  private readonly _hace6m   = new Date(new Date().setMonth(new Date().getMonth() - 6));
  readonly fechaDesdeCtrl    = new FormControl<Date>(this._hace6m, { nonNullable: true });
  readonly fechaHastaCtrl    = new FormControl<Date>(this._hoy,    { nonNullable: true });

  readonly tipoEventoLabels: Record<string, string> = {
    CULTO: 'Culto', REUNION: 'Reunión', CONFERENCIA: 'Conferencia', ESPECIAL: 'Especial',
  };
  readonly tipoEventoIcons: Record<string, string> = {
    CULTO: 'church', REUNION: 'groups', CONFERENCIA: 'mic', ESPECIAL: 'star',
  };

  readonly chartData = computed<ChartData | null>(() => {
    const data = this.dashboard()?.crecimiento;
    if (!data?.length) return null;
    return this.buildChart(data);
  });

  ngOnInit() {
    this.cargarDashboard();
  }

  cargarDashboard() {
    this.loading.set(true);
    this.service.getDashboardSede(
      this.fmtDate(this.fechaDesdeCtrl.value),
      this.fmtDate(this.fechaHastaCtrl.value),
    ).subscribe({
      next: d  => { this.dashboard.set(d); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  private fmtDate(d: Date): string {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  private buildChart(data: CrecimientoPeriodo[]): ChartData {
    const W = 560, H = 180;
    const padL = 48, padT = 16, padR = 16, padB = 40;
    const innerW = W - padL - padR;
    const innerH = H - padT - padB;
    const colW   = innerW / data.length;

    const maxNuevos = Math.max(...data.map(d => d.nuevos), 1);
    const maxTotal  = Math.max(...data.map(d => d.totalMiembros));
    const minTotal  = Math.min(...data.map(d => d.totalMiembros));
    const totalRange = maxTotal - minTotal || 1;

    const barZone  = innerH * 0.55;
    const lineZone = innerH * 0.38;
    const lineTop  = padT + 4;

    // Mostrar una etiqueta cada N puntos según densidad
    const n = data.length;
    const step = n <= 10 ? 1 : n <= 20 ? 2 : n <= 60 ? 7 : 14;

    const bars: ChartBar[] = data.map((d, i) => {
      const cx   = padL + i * colW + colW / 2;
      const barW = Math.max(colW * 0.55, 2);
      const barH = maxNuevos > 0 ? (d.nuevos / maxNuevos) * barZone : 0;
      const barX = cx - barW / 2;
      const barY = padT + innerH - barH;
      const lineY = lineTop + lineZone - ((d.totalMiembros - minTotal) / totalRange) * lineZone;
      return { ...d, cx, barX, barY, barW, barH, lineY, showLabel: i % step === 0 };
    });

    const linePoints = bars.map(b => `${b.cx},${b.lineY}`).join(' ');
    return { bars, linePoints, W, H, padL, padT, innerH };
  }

  irAMiembro(id: string) {
    this.router.navigate(['/miembros', id]);
  }

  diasColor(dias: number | null): string {
    if (dias === null || dias >= 15) return 'critico';
    if (dias >= 7) return 'alerta';
    return 'ok';
  }
}
