export type TareaEstado = 'PENDIENTE' | 'COMPLETADA';
export type TareaTipo  = 'PRIMER_CONTACTO' | 'SEGUIMIENTO';

export interface ConsolidadorResponse {
  id: string;
  nombres: string;
  apellidos: string;
  telefono: string;
  asignadosActivos: number;
  maxAsignados: number;
}

export interface TareaConsolidacionResponse {
  id: string;
  miembroId: string;
  miembroNombres: string;
  miembroApellidos: string;
  miembroTelefono: string;
  consolidadorId: string;
  consolidadorNombres: string;
  consolidadorApellidos: string;
  tipo: TareaTipo;
  estado: TareaEstado;
  descripcion: string;
  notas: string | null;
  creadoEn: string;
  completadaEn: string | null;
}

export interface TareasPage {
  content: TareaConsolidacionResponse[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
}

export interface ConsolidacionConfiguracion {
  maxAsignadosConsolidador: number;
}

export type MiembroEstadoDashboard = 'VISITOR' | 'MIEMBRO' | 'INACTIVO' | 'RESTAURADO';
export type Prioridad = 'ALTA' | 'MEDIA' | 'BAJA';

export interface DashboardResumen {
  totalAsignados: number;
  sinContactoReciente: number;
  conAccionVencida: number;
  contactosHoy: number;
}

export interface DashboardMiembro {
  miembroId: string;
  nombres: string;
  apellidos: string;
  telefono: string | null;
  estado: MiembroEstadoDashboard;
  prioridad: Prioridad;
  ultimoContactoFecha: string | null;
  ultimoContactoTipo: string | null;
  ultimoContactoResumen: string | null;
  diasSinContacto: number | null;
  proximaAccion: string | null;
  fechaProximaAccion: string | null;
  accionVencida: boolean;
  alertaSinContacto: boolean;
}

export interface DashboardResponse {
  resumen: DashboardResumen;
  miembros: DashboardMiembro[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
}

export interface DashboardFiltros {
  estado?: MiembroEstadoDashboard;
  prioridad?: Prioridad;
  soloVencidas?: boolean;
  page?: number;
  size?: number;
}
