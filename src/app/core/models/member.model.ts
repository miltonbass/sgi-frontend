export type EstadoMiembro = 'VISITOR' | 'MIEMBRO' | 'INACTIVO' | 'RESTAURADO';
export type Genero = 'M' | 'F' | 'OTRO';
export type EstadoCivil = 'SOLTERO' | 'CASADO' | 'VIUDO' | 'DIVORCIADO' | 'UNION_LIBRE';

export interface Miembro {
  id: string;
  sedeId: string;
  creadoPor: string;
  numeroMiembro: string;
  cedula: string;
  nombres: string;
  apellidos: string;
  fechaNacimiento: string;
  genero: Genero;
  estadoCivil: EstadoCivil;
  telefono: string;
  email: string;
  direccion: string;
  ciudad: string;
  fotoUrl: string;
  estado: EstadoMiembro;
  fechaIngreso: string;
  fechaBautismo: string;
  grupoId: string | null;
  consolidadorId: string | null;
  metadata: Record<string, unknown>;
  creadoEn: string;
  actualizadoEn: string;
}

export interface MiembrosResponse {
  content: Miembro[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
}

export interface CreateMiembroRequest {
  nombres: string;
  apellidos: string;
  email?: string;
  telefono?: string;
  fechaNacimiento?: string;
  direccion?: string;
  estadoCivil?: EstadoCivil;
  cedula?: string;
  numeroMiembro?: string;
  genero?: Genero;
  ciudad?: string;
  fotoUrl?: string;
  fechaIngreso?: string;
  fechaBautismo?: string | null;
  grupoId?: string | null;
  metadata?: Record<string, unknown>;
}

export interface CambioEstadoRequest {
  estado: EstadoMiembro;
  motivo: string;
}

export interface HistorialEstado {
  id: string;
  estadoAnterior: EstadoMiembro;
  estadoNuevo: EstadoMiembro;
  motivo: string;
  cambiadoPor: string;
  creadoEn: string;
}

export interface GrupoMiembro {
  grupoId: string;
  nombre: string;
  tipo: string;
  rol: string;
  fechaIngreso: string;
}

export interface AsistenciaReciente {
  eventoId: string;
  presente: boolean;
  observacion: string;
  registradoEn: string;
}

export interface PerfilMiembro {
  datos: Miembro;
  historialEstado: HistorialEstado[];
  grupos: GrupoMiembro[];
  asistenciaReciente: AsistenciaReciente[];
  nivelAcceso: 'COMPLETO' | 'BASICO';
}

export const TRANSICIONES_ESTADO: Record<EstadoMiembro, EstadoMiembro[]> = {
  VISITOR: ['MIEMBRO', 'INACTIVO'],
  MIEMBRO: ['INACTIVO', 'RESTAURADO'],
  INACTIVO: ['RESTAURADO'],
  RESTAURADO: ['MIEMBRO', 'INACTIVO'],
};

export const ESTADO_LABELS: Record<EstadoMiembro, string> = {
  VISITOR: 'Visitante',
  MIEMBRO: 'Miembro',
  INACTIVO: 'Inactivo',
  RESTAURADO: 'Restaurado',
};

export const ESTADO_COLORS: Record<EstadoMiembro, string> = {
  VISITOR: 'estado-visitor',
  MIEMBRO: 'estado-miembro',
  INACTIVO: 'estado-inactivo',
  RESTAURADO: 'estado-restaurado',
};
