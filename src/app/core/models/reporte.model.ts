export interface DashboardKpis {
  totalMiembrosActivos: number;
  nuevosMes: number;
  asistenciaPromedio: number | null;
  miembrosEnConsolidacion: number;
}

export interface CrecimientoPeriodo {
  periodo: string;       // YYYY-MM (MES) o YYYY-MM-DD (DIA)
  label: string;         // etiqueta legible del backend
  totalMiembros: number;
  nuevos: number;
}

export interface ProximoEvento {
  id: string;
  titulo: string;
  tipo: string;
  fechaInicio: string;
  lugar: string;
}

export interface AlertaSinContacto {
  miembroId: string;
  nombres: string;
  apellidos: string;
  telefono: string | null;
  diasSinContacto: number | null;
  ultimoContacto: string | null;
}

export interface DashboardGlobalSede {
  sedeId: string;
  sedeCodigo: string;
  sedeNombre: string;
  kpis: DashboardKpis;
  crecimiento: CrecimientoPeriodo[];
}

export interface DashboardGlobalResponse {
  sedes: DashboardGlobalSede[];
  granularidad: 'MES' | 'DIA';
  fechaDesde: string;
  fechaHasta: string;
}

export interface DesgloseBajas {
  inactividad: number;
  traslado: number;
  sinContacto: number;
}

export interface CrecimientoRetencionPeriodo {
  periodo: string;
  label: string;
  miembrosInicio: number;
  miembrosFin: number;
  altas: number;
  bajas: number;
  tasaRetencion: number;
  desgloseBajas: DesgloseBajas;
}

export interface CrecimientoRetencionResponse {
  periodos: CrecimientoRetencionPeriodo[];
  meses: number;
  sedeId?: string;
  sedeNombre?: string;
}

export interface DashboardSedeResponse {
  kpis: DashboardKpis;
  crecimiento: CrecimientoPeriodo[];
  granularidad: 'MES' | 'DIA';
  fechaDesde: string;
  fechaHasta: string;
  proximosEventos: ProximoEvento[];
  alertasSinContacto: AlertaSinContacto[];
}
