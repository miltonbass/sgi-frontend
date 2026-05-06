import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { AlertaResponse, AlertasPage, AlertaEstado, DetectarResponse, AlertaConfiguracion } from '../models/alerta.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AlertaService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/v1/alertas`;

  detectar() {
    return this.http.post<DetectarResponse>(`${this.baseUrl}/detectar`, {});
  }

  getAll(params?: { estado?: AlertaEstado; page?: number; size?: number }) {
    let p = new HttpParams();
    if (params?.estado) p = p.set('estado', params.estado);
    if (params?.page !== undefined) p = p.set('page', params.page);
    if (params?.size !== undefined) p = p.set('size', params.size);
    return this.http.get<AlertasPage>(this.baseUrl, { params: p });
  }

  gestionar(id: string, notas?: string) {
    return this.http.patch<AlertaResponse>(`${this.baseUrl}/${id}/gestionar`, notas ? { notas } : {});
  }

  descartar(id: string, notas?: string) {
    return this.http.patch<AlertaResponse>(`${this.baseUrl}/${id}/descartar`, notas ? { notas } : {});
  }

  getConfiguracion() {
    return this.http.get<AlertaConfiguracion>(`${this.baseUrl}/configuracion`);
  }

  updateConfiguracion(umbralSemanas: number) {
    return this.http.patch<AlertaConfiguracion>(`${this.baseUrl}/configuracion`, { umbralSemanas });
  }
}
