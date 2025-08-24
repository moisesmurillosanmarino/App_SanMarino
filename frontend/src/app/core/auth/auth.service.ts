// src/app/core/auth/auth.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LoginPayload, LoginResult, AuthSession } from './auth.models';
import { TokenStorageService } from './token-storage.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private storage = inject(TokenStorageService);
  private baseUrl = `${environment.apiUrl}/Auth`;

  // sesion reactiva para usar con async
  readonly session$ = this.storage.session$;

  login(payload: LoginPayload, remember = true) {
    return this.http.post<LoginResult>(`${this.baseUrl}/login`, payload).pipe(
      map(res => {
        const companies = res.empresas ?? [];
        const session: AuthSession = {
          accessToken:  res.token,
          refreshToken: res.refreshToken,
          user: { username: res.username, fullName: res.fullName, roles: res.roles },
          companies,
          activeCompany: companies[0] ?? undefined
        };
        return session;
      }),
      tap(session => this.storage.save(session, remember))
    );
  }

  logout() {
    this.storage.clear();
  }

  isAuthenticated() {
    return !!this.storage.getToken();
  }
}
