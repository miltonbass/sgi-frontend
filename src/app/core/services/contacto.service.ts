import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ContactoRequest, ContactoResponse, ContactoPage, ResumenSeguimiento } from '../models/contacto.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ContactoService {
  private readonly http = inject(HttpClient);
  private readonly base = (miembroId: string) =>
    `${environment.apiUrl}/v1/consolidacion/miembros/${miembroId}/contactos`;

  registrar(miembroId: string, body: ContactoRequest) {
    return this.http.post<ContactoResponse>(this.base(miembroId), body);
  }

  listar(miembroId: string, page = 0, size = 20) {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<ContactoPage>(this.base(miembroId), { params });
  }

  resumen(miembroId: string) {
    return this.http.get<ResumenSeguimiento>(
      `${environment.apiUrl}/v1/consolidacion/miembros/${miembroId}/resumen`,
    );
  }
}
