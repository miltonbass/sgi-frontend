import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import {
  ConfiguracionSedeResponse,
  ActualizarConfiguracionSedeRequest,
  BrandingResponse,
  ActualizarBrandingRequest,
  LogoUploadResponse,
  BrandingConfig,
  NotificacionesResponse,
  ActualizarNotificacionesRequest,
  ConfiguracionSmtpResponse,
  ActualizarSmtpRequest,
  SmtpProbarResponse,
} from '../models/configuracion.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ConfiguracionService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/v1/configuracion`;

  private readonly _branding$ = new BehaviorSubject<BrandingConfig | null>(null);
  readonly branding$ = this._branding$.asObservable();

  getSede() {
    return this.http.get<ConfiguracionSedeResponse>(`${this.base}/sede`);
  }

  updateSede(data: ActualizarConfiguracionSedeRequest) {
    return this.http.put<ConfiguracionSedeResponse>(`${this.base}/sede`, data);
  }

  getBranding() {
    return this.http.get<BrandingResponse>(`${this.base}/branding`);
  }

  updateBranding(data: ActualizarBrandingRequest) {
    return this.http.put<BrandingResponse>(`${this.base}/branding`, data);
  }

  uploadLogo(formData: FormData) {
    return this.http.post<LogoUploadResponse>(`${this.base}/logo`, formData);
  }

  getLogo() {
    return this.http.get(`${this.base}/logo`, { responseType: 'blob' });
  }

  getLogoCompacto() {
    return this.http.get(`${this.base}/logo/compacto`, { responseType: 'blob' });
  }

  loadBranding() {
    this.getBranding().subscribe({
      next: cfg => this._branding$.next({
        colorPrimario:          cfg.colorPrimario,
        colorAcento:            cfg.colorAcento,
        tieneLogoPersonalizado: cfg.tieneLogoPersonalizado,
        tieneLogoCompacto:      cfg.tieneLogoCompacto,
      }),
      error: () => {},
    });
  }

  getNotificaciones() {
    return this.http.get<NotificacionesResponse>(`${this.base}/notificaciones`);
  }

  updateNotificaciones(data: ActualizarNotificacionesRequest) {
    return this.http.put<NotificacionesResponse>(`${this.base}/notificaciones`, data);
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
