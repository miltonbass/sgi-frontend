import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import {
  DashboardSedeResponse, DashboardGlobalResponse, CrecimientoRetencionResponse,
  ReporteCelulasResponse, ReporteCelulaDetalleResponse,
} from '../models/reporte.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ReporteService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/v1/reportes`;

  getDashboardSede(fechaDesde?: string, fechaHasta?: string) {
    let params = new HttpParams();
    if (fechaDesde) params = params.set('fechaDesde', fechaDesde);
    if (fechaHasta) params = params.set('fechaHasta', fechaHasta);
    return this.http.get<DashboardSedeResponse>(`${this.base}/dashboard-sede`, { params });
  }

  getCrecimientoRetencion(meses = 12, sedeId?: string) {
    let params = new HttpParams().set('meses', meses.toString());
    if (sedeId) params = params.set('sedeId', sedeId);
    return this.http.get<CrecimientoRetencionResponse>(`${this.base}/crecimiento-retencion`, { params });
  }

  getDashboardGlobal(fechaDesde?: string, fechaHasta?: string) {
    let params = new HttpParams();
    if (fechaDesde) params = params.set('fechaDesde', fechaDesde);
    if (fechaHasta) params = params.set('fechaHasta', fechaHasta);
    return this.http.get<DashboardGlobalResponse>(`${this.base}/dashboard-global`, { params });
  }

  getReporteCelulas(p: { fechaDesde?: string; fechaHasta?: string; nivel?: number; soloActivas?: boolean }) {
    let params = new HttpParams();
    if (p.fechaDesde)          params = params.set('fechaDesde',  p.fechaDesde);
    if (p.fechaHasta)          params = params.set('fechaHasta',  p.fechaHasta);
    if (p.nivel !== undefined)  params = params.set('nivel',       p.nivel);
    if (p.soloActivas !== undefined) params = params.set('soloActivas', p.soloActivas);
    return this.http.get<ReporteCelulasResponse>(`${this.base}/celulas`, { params });
  }

  getReporteCelulaDetalle(id: string, p: { fechaDesde?: string; fechaHasta?: string }) {
    let params = new HttpParams();
    if (p.fechaDesde) params = params.set('fechaDesde', p.fechaDesde);
    if (p.fechaHasta) params = params.set('fechaHasta', p.fechaHasta);
    return this.http.get<ReporteCelulaDetalleResponse>(`${this.base}/celulas/${id}`, { params });
  }
}
