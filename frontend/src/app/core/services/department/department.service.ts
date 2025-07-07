import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface DepartamentoDto {
  departamentoId:     number;
  departamentoNombre: string;
  paisId:             number;
  active:             boolean;
}

@Injectable({ providedIn: 'root' })
export class DepartmentService {
  private readonly baseUrl = `${environment.apiUrl}/Departamento`;

  constructor(private http: HttpClient) {}

  /** Trae todos los departamentos */
  getAll(): Observable<DepartamentoDto[]> {
    return this.http.get<DepartamentoDto[]>(this.baseUrl);
  }

  /** Trae uno por ID */
  getById(id: number): Observable<DepartamentoDto> {
    return this.http.get<DepartamentoDto>(`${this.baseUrl}/${id}`);
  }

  /** Crea un departamento */
  create(dto: Omit<DepartamentoDto, 'departamentoId'>): Observable<DepartamentoDto> {
    return this.http.post<DepartamentoDto>(this.baseUrl, dto);
  }

  /** Actualiza uno existente */
  update(dto: DepartamentoDto): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${dto.departamentoId}`, dto);
  }

  /** Elimina por ID */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
