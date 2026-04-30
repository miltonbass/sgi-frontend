export type TipoGrupo = 'CELULA' | 'MINISTERIO' | 'CLASE';

export interface Grupo {
  id: string;
  nombre: string;
  tipo: TipoGrupo;
  descripcion: string;
  liderId: string | null;
  liderNombre: string | null;
  activo: boolean;
  totalMiembros: number;
  creadoEn: string;
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
  tipo: TipoGrupo;
  descripcion?: string;
  liderId?: string;
}

export interface UpdateGrupoRequest {
  nombre?: string;
  tipo?: TipoGrupo;
  descripcion?: string;
  liderId?: string | null;
}

export interface MiembroGrupo {
  miembroId: string;
  nombres: string;
  apellidos: string;
  email: string;
  rol: string;
  fechaIngreso: string;
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

export const ROLES_GRUPO = ['LIDER', 'LIDER_AUXILIAR', 'MIEMBRO', 'VISITANTE'] as const;
