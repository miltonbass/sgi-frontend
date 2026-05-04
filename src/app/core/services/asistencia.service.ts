import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import {
  AsistenciaResponse, CheckInResumen, BusquedaMiembroResult,
  RegistrarMiembroRequest, RegistrarVisitanteRequest,
} from '../models/asistencia.model';

@Injectable({ providedIn: 'root' })
export class AsistenciaService {
  private readonly http = inject(HttpClient);

  private url(eventoId: string) {
    return `${environment.apiUrl}/v1/eventos/${eventoId}/asistencias`;
  }

  getResumen(eventoId: string) {
    return this.http.get<CheckInResumen>(this.url(eventoId));
  }

  buscar(eventoId: string, q: string) {
    return this.http.get<BusquedaMiembroResult[]>(`${this.url(eventoId)}/buscar`, {
      params: { q },
    });
  }

  registrarMiembro(eventoId: string, data: RegistrarMiembroRequest) {
    return this.http.post<AsistenciaResponse>(this.url(eventoId), data);
  }

  registrarVisitante(eventoId: string, data: RegistrarVisitanteRequest) {
    return this.http.post<AsistenciaResponse>(this.url(eventoId), data);
  }

  eliminar(eventoId: string, asistenciaId: string) {
    return this.http.delete(`${this.url(eventoId)}/${asistenciaId}`);
  }
}
