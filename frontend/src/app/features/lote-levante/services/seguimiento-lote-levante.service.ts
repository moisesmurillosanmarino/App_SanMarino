//app/features/lote-levante/services/seguimiento-lote-levante.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface SeguimientoLoteLevanteDto {
  id: number;
  fechaRegistro: string;
  loteId: string;
  mortalidadHembras: number;
  mortalidadMachos: number;
  selH: number;
  selM: number;
  errorSexajeHembras: number;
  errorSexajeMachos: number;
  tipoAlimento: string;
  consumoKgHembras: number;
  observaciones?: string;
  kcalAlH?: number | null;
  protAlH?: number | null;
  kcalAveH?: number | null;
  protAveH?: number | null;
  ciclo: string;
}



export interface CreateSeguimientoLoteLevanteDto {
  fechaRegistro: string;
  loteId: string;
  mortalidadHembras: number;
  mortalidadMachos: number;
  selH: number;
  selM: number;
  errorSexajeHembras: number;
  errorSexajeMachos: number;
  tipoAlimento: string;
  consumoKgHembras: number;
  observaciones?: string;
  kcalAlH?: number | null;
  protAlH?: number | null;
  kcalAveH?: number | null;
  protAveH?: number | null;
  ciclo: string;
}

export interface UpdateSeguimientoLoteLevanteDto extends CreateSeguimientoLoteLevanteDto {
  id: number;
}

@Injectable({
  providedIn: 'root'
})
export class SeguimientoLoteLevanteService {
  private readonly baseUrl = `${environment.apiUrl}/SeguimientoLoteLevante`; // ✅ Esta es la ruta nueva
  // Si la ruta antigua es correcta, descomentar la línea de arriba y comentar la de abajo.
  // private readonly baseUrl = `${environment.apiUrl}/seguimiento-lote-levante`; // ❌ Esta es la ruta antigua

  constructor(private http: HttpClient) {}

  getAll(): Observable<SeguimientoLoteLevanteDto[]> {
    return this.http.get<SeguimientoLoteLevanteDto[]>(this.baseUrl);
  }

  getById(id: number): Observable<SeguimientoLoteLevanteDto> {
    return this.http.get<SeguimientoLoteLevanteDto>(`${this.baseUrl}/${id}`);
  }

  getByLoteId(loteId: string): Observable<SeguimientoLoteLevanteDto[]> {
    return this.http.get<SeguimientoLoteLevanteDto[]>(`${this.baseUrl}/por-lote/${loteId}`);
  }

  create(dto: CreateSeguimientoLoteLevanteDto): Observable<SeguimientoLoteLevanteDto> {
    return this.http.post<SeguimientoLoteLevanteDto>(this.baseUrl, dto);
  }

  update(dto: UpdateSeguimientoLoteLevanteDto): Observable<SeguimientoLoteLevanteDto> {
    return this.http.put<SeguimientoLoteLevanteDto>(`${this.baseUrl}/${dto.id}`, dto);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
