import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  ConfiguracionSedeResponse,
  ActualizarConfiguracionSedeRequest,
  ConfiguracionSmtpResponse,
  ActualizarSmtpRequest,
  SmtpProbarResponse,
} from '../models/configuracion.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ConfiguracionService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/v1/configuracion`;

  getSede() {
    return this.http.get<ConfiguracionSedeResponse>(`${this.base}/sede`);
  }

  updateSede(data: ActualizarConfiguracionSedeRequest) {
    return this.http.put<ConfiguracionSedeResponse>(`${this.base}/sede`, data);
  }

  getSmtp() {
    return this.http.get<ConfiguracionSmtpResponse>(`${this.base}/smtp`);
  }

  updateSmtp(data: ActualizarSmtpRequest) {
    return this.http.put<ConfiguracionSmtpResponse>(`${this.base}/smtp`, data);
  }

  probarSmtp() {
    return this.http.post<SmtpProbarResponse>(`${this.base}/smtp/probar`, {});
  }
}
