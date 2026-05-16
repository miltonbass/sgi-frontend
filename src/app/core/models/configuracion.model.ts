export interface RedesSociales {
  instagram: string | null;
  facebook:  string | null;
  youtube:   string | null;
}

export interface ConfiguracionSedeResponse {
  id:              string;
  codigo:          string;
  nombre:          string;
  descripcion:     string | null;
  ciudad:          string | null;
  departamento:    string | null;
  pais:            string | null;
  direccion:       string | null;
  telefono:        string | null;
  email:           string | null;
  sitioWeb:        string | null;
  zonaHoraria:     string | null;
  fechaFundacion:  string | null;
  redesSociales:   RedesSociales | null;
  activa:          boolean;
}

export interface ActualizarConfiguracionSedeRequest {
  nombre:          string;
  descripcion?:    string | null;
  ciudad?:         string | null;
  departamento?:   string | null;
  pais?:           string | null;
  direccion?:      string | null;
  telefono?:       string | null;
  email?:          string | null;
  sitioWeb?:       string | null;
  zonaHoraria?:    string | null;
  fechaFundacion?: string | null;
  redesSociales?:  Partial<RedesSociales> | null;
}

// ── Branding ─────────────────────────────────────────────────────────────────

export interface BrandingResponse {
  logoUrl:                string;
  logoCompactoUrl:        string;
  colorPrimario:          string | null;
  colorAcento:            string | null;
  tieneLogoPersonalizado: boolean;
  tieneLogoCompacto:      boolean;
}

export interface ActualizarBrandingRequest {
  colorPrimario?: string;
  colorAcento?:   string;
}

export interface LogoUploadResponse {
  logoUrl:  string;
  mensaje:  string;
}

export interface BrandingConfig {
  colorPrimario:          string | null;
  colorAcento:            string | null;
  tieneLogoPersonalizado: boolean;
  tieneLogoCompacto:      boolean;
}

// ── Notificaciones ───────────────────────────────────────────────────────────

export interface NotificacionEventoConfig {
  activo: boolean;
  cc:     string;
}

export interface NotificacionesResponse {
  nuevoMiembro:      NotificacionEventoConfig;
  cambioEstado:      NotificacionEventoConfig;
  alertaSeguimiento: NotificacionEventoConfig;
  nuevoUsuario:      NotificacionEventoConfig;
}

export type ActualizarNotificacionesRequest = NotificacionesResponse;

// ── SMTP ─────────────────────────────────────────────────────────────────────

export type CifradoSmtp = 'TLS' | 'STARTTLS' | 'NONE';

export interface ConfiguracionSmtpResponse {
  host:           string | null;
  puerto:         number | null;
  usuario:        string | null;
  passwordMasked: string | null;
  cifrado:        CifradoSmtp | null;
  remitente:      string | null;
  activo:         boolean;
  configurado:    boolean;
}

export interface ActualizarSmtpRequest {
  host:      string;
  puerto:    number;
  usuario:   string;
  password?: string;
  cifrado:   CifradoSmtp;
  remitente: string;
  activo:    boolean;
}

export interface SmtpProbarResponse {
  exitoso: boolean;
  mensaje: string;
}
