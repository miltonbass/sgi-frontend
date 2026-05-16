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
