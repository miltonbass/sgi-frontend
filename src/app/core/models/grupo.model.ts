export type TipoGrupo = 'CELULA' | 'MINISTERIO' | 'CLASE';

export interface Grupo {
  id: string;
  nombre: string;
  tipo: TipoGrupo;
  descripcion: string;
  liderId: string | null;
  liderNombre: string | null;
  grupoPadreId: string | null;
  lugar: string | null;
  activo: boolean;
  totalMiembros: number;
  creadoEn: string;
  actualizadoEn: string;
}

export interface GruposResponse {
  content: Grupo[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
}

export interface CreateGrupoRequest {
  nombre: string;
  tipo?: TipoGrupo;
  descripcion?: string;
  lugar?: string;
  liderId?: string;
  grupoPadreId?: string;
}

export interface UpdateGrupoRequest {
  nombre?: string;
  tipo?: TipoGrupo;
  descripcion?: string;
  lugar?: string;
  liderId?: string | null;
  grupoPadreId?: string | null;
}

export interface MiembroGrupo {
  id: string;
  miembroId: string;
  nombres: string;
  apellidos: string;
  email: string;
  telefono: string | null;
  estado: string;
  rol: string;
  fechaIngreso: string;
  creadoEn: string;
}

export interface GrupoMiembrosResponse {
  grupoId: string;
  nombre: string;
  tipo: string;
  miembros: MiembroGrupo[];
}

export interface AsignarMiembroRequest {
  miembroId: string;
  rol: string;
  fechaIngreso?: string;
}

export const TIPO_GRUPO_LABELS: Record<TipoGrupo, string> = {
  CELULA:     'Célula',
  MINISTERIO: 'Ministerio',
  CLASE:      'Clase',
};

export const ROLES_GRUPO = ['LIDER', 'ASISTENTE', 'PARTICIPANTE'] as const;

export interface GrupoArbolItem {
  id: string;
  nombre: string;
  tipo: string;
  grupoPadreId: string;
  liderNombre: string | null;
  nivel: number;
  totalMiembros: number;
  ultimaSesionFecha: string | null;
  promedioAsistencia30d: number | null;
}

export interface MiArbolResponse {
  grupoRaizId: string;
  grupoRaizNombre: string;
  subArbol: GrupoArbolItem[];
}
