// src/app/core/auth/auth.models.ts
export interface LoginPayload {
  email: string;
  password: string;
  companyId?: number;
}

export interface LoginResult {
  token: string;
  refreshToken?: string;

  // del backend (ajusta si cambia):
  username?: string;
  fullName?: string;
  roles?: string[];
  empresas?: string[];   // ["Sanmarino", "Otra S.A."]
  permisos?: string[];
}

export interface AuthSession {
  accessToken: string;
  refreshToken?: string;
  user: {
    username?: string;
    fullName?: string;
    roles?: string[];
  };
  companies: string[];       // nombres legibles
  activeCompany?: string;    // la elegida
}
