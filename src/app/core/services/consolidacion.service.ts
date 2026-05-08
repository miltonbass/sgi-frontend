import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import {
  ConsolidadorResponse,
  TareaConsolidacionResponse,
  TareasPage,
  TareaEstado,
  ConsolidacionConfiguracion,
} from '../models/consolidacion.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ConsolidacionService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/v1/consolidacion`;

  getConsolidadores() {
    return this.http.get<ConsolidadorResponse[]>(`${this.baseUrl}/consolidadores`);
  }

  getTareas(params?: { consolidadorId?: string; estado?: TareaEstado; page?: number; size?: number }) {
    let p = new HttpParams();
    if (params?.consolidadorId) p = p.set('consolidadorId', params.consolidadorId);
    if (params?.estado)         p = p.set('estado', params.estado);
    if (params?.page !== undefined) p = p.set('page', params.page);
    if (params?.size !== undefined) p = p.set('size', params.size);
    return this.http.get<TareasPage>(`${this.baseUrl}/tareas`, { params: p });
  }

  completarTarea(id: string, notas?: string) {
    return this.http.patch<TareaConsolidacionResponse>(
      `${this.baseUrl}/tareas/${id}/completar`,
      notas ? { notas } : {},
    );
  }

  getConfiguracion() {
    return this.http.get<ConsolidacionConfiguracion>(`${this.baseUrl}/configuracion`);
  }

  updateConfiguracion(maxAsignadosConsolidador: number) {
    return this.http.patch<ConsolidacionConfiguracion>(
      `${this.baseUrl}/configuracion`,
      { maxAsignadosConsolidador },
    );
  }
}
