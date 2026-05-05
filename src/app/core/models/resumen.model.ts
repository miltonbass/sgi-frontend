export interface AsistenteResumen {
  nombres: string;
  apellidos: string | null;
  tipo: 'MIEMBRO' | 'VISITANTE';
  hora: string;
}

export interface ComparativaItem {
  fecha: string;
  totalPresentes: number;
  porcentajeCapacidad: number | null;
  eventoId: string | null;
}

export interface ResumenAsistencia {
  eventoId: string;
  titulo: string;
  eventoTitulo?: string;
  tipo: string;
  eventoTipo?: string;
  fechaInicio: string;
  lugar: string | null;
  capacidad: number | null;
  totalPresentes: number;
  porcentajeCapacidad: number | null;
  primerasVisitas: number;
  miembrosActivos: number;
  otrosAsistentes: number;
  asistentes: AsistenteResumen[] | undefined;
  comparativa: ComparativaItem[] | undefined;
}
