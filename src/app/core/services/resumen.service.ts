import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { ResumenAsistencia } from '../models/resumen.model';

@Injectable({ providedIn: 'root' })
export class ResumenService {
  private readonly http = inject(HttpClient);

  private url(eventoId: string) {
    return `${environment.apiUrl}/v1/eventos/${eventoId}/resumen`;
  }

  getResumen(eventoId: string) {
    return this.http.get<ResumenAsistencia>(this.url(eventoId));
  }

  exportar(eventoId: string) {
    return this.http.get(this.url(eventoId) + '/exportar', { responseType: 'blob' });
  }
}
