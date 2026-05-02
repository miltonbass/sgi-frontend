import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import {
  Evento, EventosResponse, CreateEventoRequest, UpdateEventoRequest,
} from '../models/evento.model';

export interface EventosFiltros {
  tipo?: string;
  estado?: string;
  desde?: string;
  hasta?: string;
  page?: number;
  size?: number;
}

@Injectable({ providedIn: 'root' })
export class EventoService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/v1/eventos`;

  getAll(filtros?: EventosFiltros) {
    let params = new HttpParams();
    if (filtros?.tipo)   params = params.set('tipo', filtros.tipo);
    if (filtros?.estado) params = params.set('estado', filtros.estado);
    if (filtros?.desde)  params = params.set('desde', filtros.desde);
    if (filtros?.hasta)  params = params.set('hasta', filtros.hasta);
    if (filtros?.page !== undefined) params = params.set('page', filtros.page);
    if (filtros?.size !== undefined) params = params.set('size', filtros.size);
    return this.http.get<EventosResponse>(this.baseUrl, { params });
  }

  getById(id: string) {
    return this.http.get<Evento>(`${this.baseUrl}/${id}`);
  }

  create(data: CreateEventoRequest) {
    return this.http.post<Evento>(this.baseUrl, data);
  }

  update(id: string, data: UpdateEventoRequest) {
    return this.http.put<Evento>(`${this.baseUrl}/${id}`, data);
  }

  cambiarEstado(id: string, estado: string) {
    return this.http.patch<Evento>(`${this.baseUrl}/${id}/estado`, { estado });
  }

  cancelar(id: string) {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }
}
