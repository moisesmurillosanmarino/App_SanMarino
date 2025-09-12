// src/app/features/farm/services/departamento.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface DepartamentoDto {
  departamentoId: number;
  departamentoNombre: string;
  paisId: any ;
}

@Injectable({ providedIn: 'root' })
export class DepartamentoService {
  private readonly baseUrl = `${environment.apiUrl}/Departamento`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<DepartamentoDto[]> {
    return this.http.get<DepartamentoDto[]>(this.baseUrl);
  }

  getById(id: number): Observable<DepartamentoDto> {
    return this.http.get<DepartamentoDto>(`${this.baseUrl}/${id}`);
  }
}
