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
