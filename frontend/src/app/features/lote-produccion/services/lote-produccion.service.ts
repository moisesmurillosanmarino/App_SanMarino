// src/app/features/lote-produccion/services/lote-produccion.service.ts
import { Injectable } from '@angular/core';
import { HttpClient }     from '@angular/common/http';
import { Observable }     from 'rxjs';
import { environment }    from '../../../../environments/environment';

export interface LoteProduccionDto {
  id: string;
  fecha: string;
  loteId: string;
  mortalidadH: number;
  mortalidadM: number;
  selH: number;
  consKgH: number;
  consKgM: number;
  huevoTot: number;
  huevoInc: number;
  tipoAlimento: string;
  observaciones?: string;
  pesoHuevo: number;
  etapa: 1|2|3;
}

export interface CreateLoteProduccionDto extends Omit<LoteProduccionDto,'id'> {}
export interface UpdateLoteProduccionDto extends LoteProduccionDto {}

@Injectable({ providedIn: 'root' })
export class LoteProduccionService {
  private readonly base = `${environment.apiUrl}/LoteProduccion`;

  constructor(private http: HttpClient) {}

  getByLote(loteId: string): Observable<LoteProduccionDto[]> {
    return this.http.get<LoteProduccionDto[]>(`${this.base}/por-lote/${loteId}`);
  }
  get(id: string) : Observable<LoteProduccionDto>    { return this.http.get<LoteProduccionDto>(`${this.base}/${id}`); }
  create(dto: CreateLoteProduccionDto): Observable<LoteProduccionDto> {
    return this.http.post<LoteProduccionDto>(this.base, dto);
  }
  update(dto: UpdateLoteProduccionDto): Observable<LoteProduccionDto> {
    return this.http.put<LoteProduccionDto>(`${this.base}/${dto.id}`, dto);
  }
  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
