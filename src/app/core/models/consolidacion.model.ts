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
