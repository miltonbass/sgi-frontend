export type ContactoTipo = 'LLAMADA' | 'VISITA' | 'MENSAJE' | 'REUNION';

export interface ContactoRequest {
  fecha: string;
  tipo: ContactoTipo;
  resumen: string;
  proximaAccion?: string;
  fechaProximaAccion?: string;
  recordatorioActivo: boolean;
}

export interface ContactoResponse {
  id: string;
  miembroId: string;
  consolidadorId: string;
  fecha: string;
  tipo: ContactoTipo;
  resumen: string;
  proximaAccion: string | null;
  fechaProximaAccion: string | null;
  recordatorioActivo: boolean;
  creadoEn: string;
}

export interface ContactoPage {
  content: ContactoResponse[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
}

export interface ResumenSeguimiento {
  totalContactos: number;
  diasDesdeUltimoContacto: number | null;
  ultimoContacto: ContactoResponse | null;
  proximaAccionPendiente: string | null;
  fechaProximaAccion: string | null;
}
