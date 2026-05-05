export interface SedeUsuario {
  sedeId: string;
  sedeCodigo: string;
  sedeNombre: string;
  roles: string[];
}

export interface Usuario {
  id: string;
  email: string;
  username: string;
  nombre: string;
  apellido: string;
  telefono: string;
  activo: boolean;
  debeActivar: boolean;
  debeCambiarPassword?: boolean;
  ultimoLogin: string;
  sedes: SedeUsuario[];
  passwordTemporal?: string;
}

export interface UsuariosResponse {
  usuarios: Usuario[];
  total: number;
  pagina: number;
  tamano: number;
}

export interface CreateUsuarioRequest {
  email: string;
  nombre: string;
  apellido: string;
  username: string;
  telefono?: string;
  password?: string;
  sedeId?: string;
  roles?: string[];
}

export interface UpdateUsuarioRequest {
  nombre?: string;
  apellido?: string;
  telefono?: string;
  activo?: boolean;
}

export interface AsignarSedeRequest {
  sedeId: string;
  roles: string[];
}

export const ROLES_DISPONIBLES = [
  'ADMIN_GLOBAL',
  'SUPER_ADMIN',
  'ADMIN_SEDE',
  'PASTOR_PRINCIPAL',
  'PASTOR_SEDE',
  'SECRETARIA',
  'REGISTRO_SEDE',
  'CONSOLIDACION_SEDE',
] as const;
