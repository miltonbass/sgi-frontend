export interface SesionGrupo {
  id: string;
  grupoId: string;
  grupoNombre: string;
  fecha: string;
  lugar: string | null;
  tema: string | null;
  comentarios: string | null;
  ofrendaMonto: number | null;
  creadoPor: string;
  creadoEn: string;
  actualizadoEn: string;
  totalPresentes: number;
  totalMiembros: number;
}

export interface CreateSesionRequest {
  fecha: string;
  lugar?: string;
  tema?: string;
  comentarios?: string;
  ofrendaMonto?: number;
}

export interface UpdateSesionRequest {
  fecha?: string;
  lugar?: string;
  tema?: string;
  comentarios?: string;
  ofrendaMonto?: number | null;
}

export interface AsistenciaSesion {
  id: string;
  sesionId: string;
  miembroId: string | null;
  miembroNombres: string | null;
  miembroApellidos: string | null;
  visitanteNombre: string | null;
  visitanteTelefono: string | null;
  presente: boolean;
  creadoEn: string;
}

export interface SesionAsistenciaResumen {
  asistencias: AsistenciaSesion[];
  totalPresentes: number;
  totalMiembros: number;
  sesionFecha: string;
  grupoNombre: string;
}

export interface RegistrarAsistenciaSesionRequest {
  miembroId?: string;
  visitanteNombre?: string;
  visitanteTelefono?: string;
}
