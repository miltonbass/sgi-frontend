export type AlertaEstado = 'PENDIENTE' | 'GESTIONADA' | 'DESCARTADA';

export interface AlertaResponse {
  id: string;
  miembroId: string;
  miembroNombres: string;
  miembroApellidos: string;
  miembroTelefono: string;
  consolidadorId: string | null;
  consolidadorNombres: string | null;
  consolidadorApellidos: string | null;
  semanasAusente: number;
  estado: AlertaEstado;
  notas: string | null;
  creadoEn: string;
  gestionadaEn: string | null;
}

export interface AlertasPage {
  content: AlertaResponse[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
}

export interface DetectarResponse {
  alertasCreadas: number;
  miembrosEvaluados: number;
  umbralSemanas: number;
}

export interface AlertaConfiguracion {
  umbralSemanas: number;
}
