// src/app/features/lote-levante/services/seguimiento-lote-levante.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
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
  fechaRegistro: string;   // ISO (ej: 2025-08-27T00:00:00.000Z)
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
  ciclo: string;           // backend valida "Normal"
}

export interface UpdateSeguimientoLoteLevanteDto extends CreateSeguimientoLoteLevanteDto {
  id: number;
}

@Injectable({ providedIn: 'root' })
export class SeguimientoLoteLevanteService {
  /**
   * Nota: environment.apiUrl debe incluir `/api` (p.ej. http://localhost:5002/api)
   */
  private readonly baseUrl = `${environment.apiUrl}/SeguimientoLoteLevante`;

  constructor(private http: HttpClient) {}

  /** NUEVO: GET todo (usa /filtro sin parámetros) */
  getAll(): Observable<SeguimientoLoteLevanteDto[]> {
    return this.http.get<SeguimientoLoteLevanteDto[]>(`${this.baseUrl}/filtro`);
  }

  /**
   * Polyfill: obtener por id (el backend no expone GET /{id}).
   * Se trae todo y filtra en cliente.
   * Sugerencia: si quieres, añadimos en el back:
   *   [HttpGet("{id}")] public async Task<IActionResult> GetById(int id) { ... }
   */
  getById(id: number): Observable<SeguimientoLoteLevanteDto> {
    return this.getAll().pipe(
      map((list) => {
        const found = (list ?? []).find(x => x.id === id);
        if (!found) throw new Error(`Seguimiento ${id} no encontrado`);
        return found;
      })
    );
  }

  /** GET por lote */
  getByLoteId(loteId: string): Observable<SeguimientoLoteLevanteDto[]> {
    return this.http.get<SeguimientoLoteLevanteDto[]>(
      `${this.baseUrl}/por-lote/${encodeURIComponent(loteId)}`
    );
  }

  /** GET filtro opcional (loteId, desde, hasta) */
  filter(params: { loteId?: string; desde?: string | Date; hasta?: string | Date }): Observable<SeguimientoLoteLevanteDto[]> {
    let httpParams = new HttpParams();
    if (params.loteId) httpParams = httpParams.set('loteId', params.loteId);
    if (params.desde)  httpParams = httpParams.set('desde', this.toIsoDate(params.desde));
    if (params.hasta)  httpParams = httpParams.set('hasta', this.toIsoDate(params.hasta));
    return this.http.get<SeguimientoLoteLevanteDto[]>(`${this.baseUrl}/filtro`, { params: httpParams });
  }

  /** Crear */
  create(dto: CreateSeguimientoLoteLevanteDto): Observable<SeguimientoLoteLevanteDto> {
    return this.http.post<SeguimientoLoteLevanteDto>(this.baseUrl, dto);
  }

  /** Actualizar */
  update(dto: UpdateSeguimientoLoteLevanteDto): Observable<SeguimientoLoteLevanteDto> {
    return this.http.put<SeguimientoLoteLevanteDto>(`${this.baseUrl}/${dto.id}`, dto);
  }

  /** Eliminar */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  // Helpers
  private toIsoDate(d: string | Date): string {
    const dd = typeof d === 'string' ? new Date(d) : d;
    return dd.toISOString();
  }
}
