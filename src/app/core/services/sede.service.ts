import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Sede, SedesResponse, CreateSedeRequest, UpdateSedeRequest } from '../models/sede.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class SedeService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/v1/sedes`;

  getAll(params?: { page?: number; size?: number }) {
    let p = new HttpParams();
    if (params?.page !== undefined) p = p.set('page', params.page);
    if (params?.size !== undefined) p = p.set('size', params.size);
    return this.http.get<SedesResponse>(this.baseUrl, { params: p });
  }

  create(data: CreateSedeRequest) {
    return this.http.post<Sede>(this.baseUrl, data);
  }

  update(id: string, data: UpdateSedeRequest) {
    return this.http.put<Sede>(`${this.baseUrl}/${id}`, data);
  }

  desactivar(id: string) {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }

  activar(id: string) {
    return this.http.patch(`${this.baseUrl}/${id}/activar`, {});
  }
}
