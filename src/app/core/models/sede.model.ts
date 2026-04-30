export interface Sede {
  id: string;
  codigo: string;
  nombreCorto: string;
  nombre: string;
  ciudad: string;
  pais: string;
  activa: boolean;
  creadoEn: string;
  actualizadoEn: string;
}

export interface SedesResponse {
  content: Sede[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
}

export interface CreateSedeRequest {
  codigo: string;
  nombreCorto: string;
  nombre: string;
  ciudad: string;
  pais?: string;
}

export interface UpdateSedeRequest {
  nombreCorto?: string;
  nombre?: string;
  ciudad?: string;
  pais?: string;
}
