import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { DashboardSedeResponse, DashboardGlobalResponse } from '../models/reporte.model';
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

  getDashboardGlobal(fechaDesde?: string, fechaHasta?: string) {
    let params = new HttpParams();
    if (fechaDesde) params = params.set('fechaDesde', fechaDesde);
    if (fechaHasta) params = params.set('fechaHasta', fechaHasta);
    return this.http.get<DashboardGlobalResponse>(`${this.base}/dashboard-global`, { params });
  }
}
