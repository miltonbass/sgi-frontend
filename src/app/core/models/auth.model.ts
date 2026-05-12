export interface LoginRequest {
  email: string;
  password: string;
  sedeId: string;
}

export interface SedeInfo {
  id: string;
  codigo: string;
  nombreCorto?: string;
  nombre?: string;
}

export interface UsuarioAuth {
  id: string;
  email: string;
  sedeActiva: string;
  sedeSchema: string;
  roles: string[];
  sedes: SedeInfo[];
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
  usuario: UsuarioAuth;
}

export interface JwtClaims {
  sub: string;
  userId: string;
  sedeId: string;
  sedeSchema: string;
  roles: string[];
  exp: number;
}
