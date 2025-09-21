// src/app/core/services/company/company.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface Company {
  id?: number;
  name: string;
  identifier: string;
  documentType: string;
  address?: string;
  phone?: string;
  email?: string;
  // antiguos (fallback visual)
  country?: string;
  state?: string;
  city?: string;
  // nuevos preferidos
  countryId?: number;
  departamentoId?: number;
  municipioId?: number;

  roleIds?: number[];
  visualPermissions?: string[];
  mobileAccess?: boolean;
}


@Injectable({ providedIn: 'root' })
export class CompanyService {
  private readonly baseUrl = `${environment.apiUrl}/Company`;

  constructor(private http: HttpClient) {}

  /** Trae todas las empresas */
  getAll(): Observable<Company[]> {
    return this.http.get<Company[]>(this.baseUrl);
  }

  /** Crea una nueva */
  create(c: Company): Observable<Company> {
    return this.http.post<Company>(this.baseUrl, c);
  }

  /** Actualiza existentes */
  update(c: Company): Observable<Company> {
    return this.http.put<Company>(`${this.baseUrl}/${c.id}`, c);
  }

  /** Elimina por id */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }


}
