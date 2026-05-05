import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import {
  Usuario,
  UsuariosResponse,
  CreateUsuarioRequest,
  UpdateUsuarioRequest,
  AsignarSedeRequest,
} from '../models/user.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/v1/usuarios`;

  getAll(params?: { sedeId?: string; rol?: string; pagina?: number; tamano?: number }) {
    let p = new HttpParams();
    if (params?.sedeId) p = p.set('sedeId', params.sedeId);
    if (params?.rol) p = p.set('rol', params.rol);
    if (params?.pagina !== undefined) p = p.set('pagina', params.pagina);
    if (params?.tamano !== undefined) p = p.set('tamano', params.tamano);
    return this.http.get<UsuariosResponse>(this.baseUrl, { params: p });
  }

  create(data: CreateUsuarioRequest) {
    return this.http.post<Usuario>(this.baseUrl, data);
  }

  update(id: string, data: UpdateUsuarioRequest) {
    return this.http.put<Usuario>(`${this.baseUrl}/${id}`, data);
  }

  asignarSede(id: string, data: AsignarSedeRequest) {
    return this.http.post<Usuario>(`${this.baseUrl}/${id}/sedes`, data);
  }

  quitarSede(id: string, sedeId: string) {
    return this.http.delete(`${this.baseUrl}/${id}/sedes/${sedeId}`);
  }

  resetPassword(id: string, passwordNueva: string) {
    return this.http.patch(`${this.baseUrl}/${id}/password`, { passwordNueva });
  }
}
