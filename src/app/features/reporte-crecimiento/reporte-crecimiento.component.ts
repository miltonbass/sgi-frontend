import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { AuthService } from '../../core/services/auth.service';
import { ReporteService } from '../../core/services/reporte.service';
import { CrecimientoRetencionResponse, CrecimientoRetencionPeriodo } from '../../core/models/reporte.model';
import { SedeInfo } from '../../core/models/auth.model';

interface BarPair {
  periodo: string;
  label: string;
  cx: number;
  bw: number;
  altaX: number; altaY: number; altaH: number;
  bajaX: number; bajaY: number; bajaH: number;
  altas: number;
  bajas: number;
  showLabel: boolean;
}

interface RetencionChart {
  bars: BarPair[];
  W: number; H: number; padL: number; padT: number; innerH: number; baseY: number;
}

@Component({
  selector: 'app-reporte-crecimiento',
  standalone: true,
  imports: [
    DecimalPipe, ReactiveFormsModule,
    MatCardModule, MatIconModule, MatButtonModule,
    MatProgressSpinnerModule, MatTooltipModule,
    MatFormFieldModule, MatSelectModule,
  ],
  templateUrl: './reporte-crecimiento.component.html',
  styleUrl: './reporte-crecimiento.component.scss',
})
export class ReporteCrecimientoComponent implements OnInit {
  private readonly service = inject(ReporteService);
  private readonly auth    = inject(AuthService);

  readonly isAdminGlobal = this.auth.hasAnyRole(['ADMIN_GLOBAL']);
  readonly sedes: SedeInfo[] = this.auth.currentUser()?.sedes ?? [];

  readonly loading = signal(true);
  readonly reporte = signal<CrecimientoRetencionResponse | null>(null);

  readonly mesesCtrl  = new FormControl<number>(12, { nonNullable: true });
  readonly sedeIdCtrl = new FormControl<string>('',  { nonNullable: true });

  readonly opcMeses = [3, 6, 12, 24];

  readonly resumen = computed(() => {
    const periodos = this.reporte()?.periodos ?? [];
    if (!periodos.length) return null;
    return {
      totalAltas:   periodos.reduce((a, p) => a + p.altas, 0),
      totalBajas:   periodos.reduce((a, p) => a + p.bajas, 0),
      tasaPromedio: periodos.reduce((a, p) => a + p.tasaRetencion, 0) / periodos.length,
      desglose: {
        inactividad: periodos.reduce((a, p) => a + p.desgloseBajas.inactividad, 0),
        traslado:    periodos.reduce((a, p) => a + p.desgloseBajas.traslado, 0),
        sinContacto: periodos.reduce((a, p) => a + p.desgloseBajas.sinContacto, 0),
      },
    };
  });

  readonly chart = computed<RetencionChart | null>(() => {
    const periodos = this.reporte()?.periodos;
    if (!periodos?.length) return null;
    return this.buildChart(periodos);
  });

  ngOnInit() { this.cargar(); }

  cargar() {
    this.loading.set(true);
    const sedeId = this.isAdminGlobal ? (this.sedeIdCtrl.value || undefined) : undefined;
    this.service.getCrecimientoRetencion(this.mesesCtrl.value, sedeId).subscribe({
      next: r  => { this.reporte.set(r); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  private buildChart(periodos: CrecimientoRetencionPeriodo[]): RetencionChart {
    const W = 900, H = 220;
    const padL = 48, padT = 20, padR = 16, padB = 65;
    const innerW = W - padL - padR;
    const innerH = H - padT - padB;
    const baseY  = padT + innerH;
    const colW   = innerW / periodos.length;

    const maxVal  = Math.max(...periodos.flatMap(p => [p.altas, p.bajas]), 1);
    const barZone = innerH * 0.85;
    const bw      = Math.max(colW * 0.35, 2);
    const gap     = Math.max(colW * 0.06, 1);
    const n       = periodos.length;
    const step    = n <= 10 ? 1 : n <= 20 ? 2 : 3;

    const bars: BarPair[] = periodos.map((p, i) => {
      const cx    = padL + i * colW + colW / 2;
      const altaH = (p.altas / maxVal) * barZone;
      const bajaH = (p.bajas / maxVal) * barZone;
      return {
        periodo: p.periodo, label: p.label, cx, bw,
        altaX: cx - gap / 2 - bw, altaY: baseY - altaH, altaH,
        bajaX: cx + gap / 2,      bajaY: baseY - bajaH, bajaH,
        altas: p.altas, bajas: p.bajas,
        showLabel: i % step === 0,
      };
    });

    return { bars, W, H, padL, padT, innerH, baseY };
  }

  retencionTexto(tasa: number): string {
    return `${Math.round(tasa / 10)} de cada 10 se quedaron`;
  }

  retencionColor(tasa: number): 'verde' | 'naranja' | 'rojo' {
    if (tasa >= 85) return 'verde';
    if (tasa >= 70) return 'naranja';
    return 'rojo';
  }

  sedeLabel(s: SedeInfo): string {
    return s.nombre ?? s.nombreCorto ?? s.codigo;
  }
}
