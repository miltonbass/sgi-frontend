import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import {
  Miembro,
  MiembrosResponse,
  CreateMiembroRequest,
  CambioEstadoRequest,
  PerfilMiembro,
  HistorialEstado,
  EstadoMiembro,
  ImportResult,
} from '../models/member.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class MemberService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/v1/miembros`;

  getAll(params?: { estado?: EstadoMiembro; page?: number; size?: number }) {
    let p = new HttpParams();
    if (params?.estado) p = p.set('estado', params.estado);
    if (params?.page !== undefined) p = p.set('page', params.page);
    if (params?.size !== undefined) p = p.set('size', params.size);
    return this.http.get<MiembrosResponse>(this.baseUrl, { params: p });
  }

  buscar(params: { q: string; estado?: EstadoMiembro; page?: number; size?: number }) {
    let p = new HttpParams().set('q', params.q);
    if (params.estado) p = p.set('estado', params.estado);
    if (params.page !== undefined) p = p.set('page', params.page);
    if (params.size !== undefined) p = p.set('size', params.size);
    return this.http.get<MiembrosResponse>(`${this.baseUrl}/buscar`, { params: p });
  }

  getById(id: string) {
    return this.http.get<Miembro>(`${this.baseUrl}/${id}`);
  }

  getPerfil(id: string) {
    return this.http.get<PerfilMiembro>(`${this.baseUrl}/${id}/perfil`);
  }

  create(data: CreateMiembroRequest) {
    return this.http.post<Miembro>(this.baseUrl, data);
  }

  update(id: string, data: Partial<CreateMiembroRequest>) {
    return this.http.put<Miembro>(`${this.baseUrl}/${id}`, data);
  }

  cambiarEstado(id: string, data: CambioEstadoRequest) {
    return this.http.patch<Miembro>(`${this.baseUrl}/${id}/estado`, data);
  }

  getHistorialEstado(id: string) {
    return this.http.get<{ historial: HistorialEstado[] }>(`${this.baseUrl}/${id}/historial-estado`);
  }

  inactivar(id: string, motivo: string) {
    return this.http.delete(`${this.baseUrl}/${id}`, { body: { motivo } });
  }

  asignarConsolidador(id: string, consolidadorId: string | null) {
    return this.http.patch<Miembro>(`${this.baseUrl}/${id}/consolidador`, { consolidadorId });
  }

  importar(archivo: File, estadoDefault: 'VISITOR' | 'MIEMBRO' = 'VISITOR') {
    const formData = new FormData();
    formData.append('archivo', archivo);
    formData.append('estadoDefault', estadoDefault);
    return this.http.post<ImportResult>(`${this.baseUrl}/import`, formData);
  }

  exportarMiembros(params: {
    formato?: 'EXCEL' | 'PDF';
    estado?: string;
    grupoId?: string;
    fechaDesde?: string;
    fechaHasta?: string;
  }) {
    let p = new HttpParams();
    if (params.formato)    p = p.set('formato',    params.formato);
    if (params.estado)     p = p.set('estado',     params.estado);
    if (params.grupoId)    p = p.set('grupoId',    params.grupoId);
    if (params.fechaDesde) p = p.set('fechaDesde', params.fechaDesde);
    if (params.fechaHasta) p = p.set('fechaHasta', params.fechaHasta);
    return this.http.get(`${this.baseUrl}/exportar`, { params: p, responseType: 'blob' });
  }
}
