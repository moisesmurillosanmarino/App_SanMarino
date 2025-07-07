// src/app/core/services/city/city.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface CityDto {
  municipioId: number;
  municipioNombre: string;
  departamentoId: number;
  active: boolean;
}

export interface CreateCityDto {
  municipioNombre: string;
  departamentoId: number;
  active: boolean;
}

export interface UpdateCityDto {
  municipioId: number;
  municipioNombre: string;
  departamentoId: number;
  active: boolean;
}

@Injectable({ providedIn: 'root' })
export class CityService {
  private readonly base = `${environment.apiUrl}/Municipio`;
  constructor(private http: HttpClient) {}

  getAll(): Observable<CityDto[]> {
    return this.http.get<CityDto[]>(this.base);
  }

  getById(id: number): Observable<CityDto> {
    return this.http.get<CityDto>(`${this.base}/${id}`);
  }

  create(dto: CreateCityDto): Observable<CityDto> {
    return this.http.post<CityDto>(this.base, dto);
  }

  update(dto: UpdateCityDto): Observable<void> {
    return this.http.put<void>(`${this.base}/${dto.municipioId}`, dto);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
