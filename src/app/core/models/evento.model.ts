export type TipoEvento = 'CULTO' | 'REUNION' | 'CONFERENCIA' | 'ESPECIAL';
export type EstadoEvento = 'PROGRAMADO' | 'ABIERTO' | 'CERRADO' | 'CANCELADO';
export type FrecuenciaRecurrencia = 'DIARIA' | 'SEMANAL' | 'QUINCENAL' | 'MENSUAL';
export type DiaSemana = 'LUNES' | 'MARTES' | 'MIERCOLES' | 'JUEVES' | 'VIERNES' | 'SABADO' | 'DOMINGO';

export interface PatronRecurrencia {
  frecuencia: FrecuenciaRecurrencia;
  diaSemana?: DiaSemana;
  hasta?: string;
}

export interface Evento {
  id: string;
  sedeId: string;
  titulo: string;
  tipo: TipoEvento;
  estado: EstadoEvento;
  descripcion: string | null;
  fechaInicio: string;
  fechaFin: string | null;
  lugar: string | null;
  capacidad: number | null;
  recurrente: boolean;
  patronRecurrencia: PatronRecurrencia | null;
  creadoPor: string;
  creadoEn: string;
  actualizadoEn: string;
}

export interface EventosResponse {
  content: Evento[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
}

export interface CreateEventoRequest {
  titulo: string;
  tipo: TipoEvento;
  descripcion?: string;
  fechaInicio: string;
  fechaFin?: string;
  lugar?: string;
  capacidad?: number;
  recurrente: boolean;
  patronRecurrencia?: PatronRecurrencia | null;
}

export interface UpdateEventoRequest {
  titulo?: string;
  tipo?: TipoEvento;
  descripcion?: string;
  fechaInicio?: string;
  fechaFin?: string;
  lugar?: string;
  capacidad?: number;
  recurrente?: boolean;
  patronRecurrencia?: PatronRecurrencia | null;
}

export const TIPOS_EVENTO: TipoEvento[] = ['CULTO', 'REUNION', 'CONFERENCIA', 'ESPECIAL'];
export const ESTADOS_EVENTO: EstadoEvento[] = ['PROGRAMADO', 'ABIERTO', 'CERRADO', 'CANCELADO'];
export const FRECUENCIAS: FrecuenciaRecurrencia[] = ['DIARIA', 'SEMANAL', 'QUINCENAL', 'MENSUAL'];
export const DIAS_SEMANA: DiaSemana[] = ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO', 'DOMINGO'];

export const TIPO_EVENTO_LABELS: Record<TipoEvento, string> = {
  CULTO: 'Culto',
  REUNION: 'Reunión',
  CONFERENCIA: 'Conferencia',
  ESPECIAL: 'Especial',
};

export const ESTADO_EVENTO_LABELS: Record<EstadoEvento, string> = {
  PROGRAMADO: 'Programado',
  ABIERTO: 'Abierto',
  CERRADO: 'Cerrado',
  CANCELADO: 'Cancelado',
};

export const FRECUENCIA_LABELS: Record<FrecuenciaRecurrencia, string> = {
  DIARIA: 'Diaria',
  SEMANAL: 'Semanal',
  QUINCENAL: 'Quincenal',
  MENSUAL: 'Mensual',
};

export const DIA_SEMANA_LABELS: Record<DiaSemana, string> = {
  LUNES: 'Lunes',
  MARTES: 'Martes',
  MIERCOLES: 'Miércoles',
  JUEVES: 'Jueves',
  VIERNES: 'Viernes',
  SABADO: 'Sábado',
  DOMINGO: 'Domingo',
};

export const TRANSICIONES_EVENTO: Record<EstadoEvento, EstadoEvento[]> = {
  PROGRAMADO: ['ABIERTO', 'CANCELADO'],
  ABIERTO: ['CERRADO', 'CANCELADO'],
  CERRADO: [],
  CANCELADO: [],
};
