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

export interface ReporteCelulaItem {
  id: string;
  nombre: string;
  liderNombre: string | null;
  grupoPadreId: string | null;
  nivel: number;
  activo: boolean;
  totalMiembros: number;
  totalSesiones: number;
  promedioAsistencia: number | null;
  totalVisitantes: number;
  totalOfrenda: number;
}

export interface ReporteCelulasResponse {
  celulas: ReporteCelulaItem[];
  fechaDesde: string;
  fechaHasta: string;
  totalCelulas: number;
  totalMiembros: number;
  totalOfrenda: number;
  promedioAsistenciaGeneral: number | null;
}

export interface ReporteCelulaDetalleSesion {
  id: string;
  fecha: string;
  tema: string | null;
  lugar: string | null;
  totalPresentes: number;
  totalVisitantes: number;
  ofrendaMonto: number | null;
}

export interface ReporteCelulaDetalleMiembro {
  id: string;
  nombres: string;
  apellidos: string;
  sesionesAsistidas: number;
  totalSesiones: number;
  porcentajeAsistencia: number;
}

export interface ReporteCelulaDetalleResponse {
  id: string;
  nombre: string;
  liderNombre: string | null;
  nivel: number;
  totalMiembros: number;
  fechaDesde: string;
  fechaHasta: string;
  totalOfrenda: number;
  totalVisitantes: number;
  promedioAsistencia: number | null;
  sesiones: ReporteCelulaDetalleSesion[];
  miembros: ReporteCelulaDetalleMiembro[];
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
