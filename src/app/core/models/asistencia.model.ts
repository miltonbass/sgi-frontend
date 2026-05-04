export interface AsistenciaResponse {
  id: string;
  eventoId: string;
  miembroId: string | null;
  miembroNombres: string | null;
  miembroApellidos: string | null;
  visitanteNombre: string | null;
  visitanteTelefono: string | null;
  presente: boolean;
  observacion: string | null;
  creadoEn: string;
}

export interface CheckInResumen {
  eventoTitulo: string;
  eventoEstado: string;
  capacidad: number | null;
  totalPresentes: number;
  asistencias: AsistenciaResponse[];
}

export interface BusquedaMiembroResult {
  id: string;
  nombres: string;
  apellidos: string;
  telefono: string | null;
  yaRegistrado: boolean;
}

export interface RegistrarMiembroRequest {
  miembroId: string;
  observacion?: string;
}

export interface RegistrarVisitanteRequest {
  visitanteNombre: string;
  visitanteTelefono?: string;
  observacion?: string;
}
