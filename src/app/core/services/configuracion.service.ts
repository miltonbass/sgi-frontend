import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import {
  ConfiguracionSedeResponse,
  ActualizarConfiguracionSedeRequest,
  BrandingResponse,
  ActualizarBrandingRequest,
  LogoUploadResponse,
  BrandingConfig,
  Moneda,
  ParametrosResponse,
  ActualizarParametrosRequest,
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

  private readonly _moneda = signal<Moneda>('COP');
  readonly moneda = this._moneda.asReadonly();

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

  getParametros() {
    return this.http.get<ParametrosResponse>(`${this.base}/parametros`);
  }

  updateParametros(data: ActualizarParametrosRequest) {
    return this.http.put<ParametrosResponse>(`${this.base}/parametros`, data);
  }

  loadParametros() {
    this.getParametros().subscribe({
      next: p => this._moneda.set(p.moneda),
      error: () => {},
    });
  }

  fmtMoneda(valor: number): string {
    const simbolo: Record<Moneda, string> = { COP: '$', USD: 'US$', EUR: '€' };
    return `${simbolo[this._moneda()]} ${valor.toLocaleString('es-CO')}`;
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
