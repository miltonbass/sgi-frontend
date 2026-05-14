import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map } from 'rxjs/operators';
import {
  Grupo, GruposResponse, CreateGrupoRequest, UpdateGrupoRequest,
  MiembroGrupo, GrupoMiembrosResponse, AsignarMiembroRequest, MiArbolResponse,
} from '../models/grupo.model';
import {
  SesionGrupo, CreateSesionRequest, UpdateSesionRequest,
  SesionAsistenciaResumen, AsistenciaSesion, RegistrarAsistenciaSesionRequest,
} from '../models/sesion.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class GrupoService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/v1/grupos`;

  getAll(params?: { tipo?: string; activo?: boolean; page?: number; size?: number }) {
    let p = new HttpParams();
    if (params?.tipo)  p = p.set('tipo', params.tipo);
    if (params?.activo !== undefined) p = p.set('activo', params.activo);
    if (params?.page !== undefined) p = p.set('page', params.page);
    if (params?.size !== undefined) p = p.set('size', params.size);
    return this.http.get<GruposResponse>(this.baseUrl, { params: p });
  }

  getById(id: string) {
    return this.http.get<Grupo>(`${this.baseUrl}/${id}`);
  }

  getMiArbol() {
    return this.http.get<MiArbolResponse>(`${this.baseUrl}/mi-arbol`);
  }

  create(data: CreateGrupoRequest) {
    return this.http.post<Grupo>(this.baseUrl, data);
  }

  update(id: string, data: UpdateGrupoRequest) {
    return this.http.put<Grupo>(`${this.baseUrl}/${id}`, data);
  }

  desactivar(id: string) {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }

  activar(id: string) {
    return this.http.patch(`${this.baseUrl}/${id}/activar`, {});
  }

  getMiembros(id: string) {
    return this.http.get<GrupoMiembrosResponse>(`${this.baseUrl}/${id}/miembros`).pipe(
      map(res => res.miembros ?? []),
    );
  }

  asignarMiembro(id: string, data: AsignarMiembroRequest) {
    return this.http.post<MiembroGrupo>(`${this.baseUrl}/${id}/miembros`, data);
  }

  quitarMiembro(grupoId: string, miembroId: string) {
    return this.http.delete(`${this.baseUrl}/${grupoId}/miembros/${miembroId}`);
  }

  // ── Sesiones ────────────────────────────────────────────────
  getSesiones(grupoId: string) {
    return this.http.get<SesionGrupo[]>(`${this.baseUrl}/${grupoId}/sesiones`);
  }

  getSesion(grupoId: string, sesionId: string) {
    return this.http.get<SesionGrupo>(`${this.baseUrl}/${grupoId}/sesiones/${sesionId}`);
  }

  createSesion(grupoId: string, data: CreateSesionRequest) {
    return this.http.post<SesionGrupo>(`${this.baseUrl}/${grupoId}/sesiones`, data);
  }

  updateSesion(grupoId: string, sesionId: string, data: UpdateSesionRequest) {
    return this.http.put<SesionGrupo>(`${this.baseUrl}/${grupoId}/sesiones/${sesionId}`, data);
  }

  deleteSesion(grupoId: string, sesionId: string) {
    return this.http.delete(`${this.baseUrl}/${grupoId}/sesiones/${sesionId}`);
  }

  // ── Asistencia de sesión ─────────────────────────────────────
  getSesionAsistencias(grupoId: string, sesionId: string) {
    return this.http.get<SesionAsistenciaResumen>(
      `${this.baseUrl}/${grupoId}/sesiones/${sesionId}/asistencias`,
    );
  }

  registrarAsistenciaSesion(grupoId: string, sesionId: string, data: RegistrarAsistenciaSesionRequest) {
    return this.http.post<AsistenciaSesion>(
      `${this.baseUrl}/${grupoId}/sesiones/${sesionId}/asistencias`, data,
    );
  }

  eliminarAsistenciaSesion(grupoId: string, sesionId: string, asistenciaId: string) {
    return this.http.delete(
      `${this.baseUrl}/${grupoId}/sesiones/${sesionId}/asistencias/${asistenciaId}`,
    );
  }
}
