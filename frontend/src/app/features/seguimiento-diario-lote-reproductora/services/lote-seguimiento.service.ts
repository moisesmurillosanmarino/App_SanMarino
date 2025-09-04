import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface LoteSeguimientoDto {
  id: number;
  fecha: string;
  loteId: string | null;
  reproductoraId: string | null;
  pesoInicial?: number | null;
  pesoFinal?: number | null;
  mortalidadM?: number | null;
  mortalidadH?: number | null;
  selM?: number | null;
  selH?: number | null;
  errorM?: number | null;
  errorH?: number | null;
  tipoAlimento?: string | null;
  consumoAlimento?: number | null;
  observaciones?: string | null;
}

export type CreateLoteSeguimientoDto = Omit<LoteSeguimientoDto, 'id'>;
export type UpdateLoteSeguimientoDto = LoteSeguimientoDto;

@Injectable({ providedIn: 'root' })
export class LoteSeguimientoService {
  private readonly base = `${environment.apiUrl}`; // incluye /api
  private readonly resourceBase = `${this.base}/LoteSeguimiento`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<LoteSeguimientoDto[]> {
    return this.http.get<LoteSeguimientoDto[]>(this.resourceBase);
  }

  getByLoteYRepro(loteId: string, reproductoraId: string): Observable<LoteSeguimientoDto[]> {
    return this.getAll().pipe(
      map(list => (list ?? []).filter(x => x.loteId === loteId && x.reproductoraId === reproductoraId))
    );
  }

  getById(id: number): Observable<LoteSeguimientoDto> {
    return this.http.get<LoteSeguimientoDto>(`${this.resourceBase}/${id}`);
  }

  create(dto: CreateLoteSeguimientoDto): Observable<LoteSeguimientoDto> {
    return this.http.post<LoteSeguimientoDto>(this.resourceBase, dto);
  }

  update(dto: UpdateLoteSeguimientoDto): Observable<LoteSeguimientoDto> {
    return this.http.put<LoteSeguimientoDto>(`${this.resourceBase}/${dto.id}`, dto);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.resourceBase}/${id}`);
  }
}
