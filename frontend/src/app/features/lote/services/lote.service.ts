import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { LoteReproductoraDto } from '../../lote-reproductora/services/lote-reproductora.service';

export interface LoteDto {
  loteId: string;
  loteNombre: string;
  granjaId: number;
  nucleoId?: number;
  galponId?: number;
  regional?: string;
  fechaEncaset?: string;
  hembrasL?: number;
  machosL?: number;
  pesoInicialH?: number;
  pesoInicialM?: number;
  unifH?: number;
  unifM?: number;
  mortCajaH?: number;
  mortCajaM?: number;
  raza?: string;
  anoTablaGenetica?: number;
  linea?: string;
  tipoLinea?: string;
  codigoGuiaGenetica?: string;
  tecnico?: string;
  mixtas?: number;
  pesoMixto?: number;
  avesEncasetadas?: number;
  loteErp?: string;
  lineaGenetica?: string;
}

export interface CreateLoteDto extends Omit<LoteDto, 'loteId'> {
  loteId: string;
}

export interface UpdateLoteDto extends LoteDto {}

@Injectable({
  providedIn: 'root'
})
export class LoteService {
  private readonly baseUrl = `${environment.apiUrl}/Lote`;
  private readonly base = environment.apiUrl;

  constructor(private readonly http: HttpClient) {}

  getAll(): Observable<LoteDto[]> {
    return this.http.get<LoteDto[]>(this.baseUrl);
  }

  getById(loteId: string): Observable<LoteDto> {
    return this.http.get<LoteDto>(`${this.baseUrl}/${loteId}`);
  }

  create(dto: CreateLoteDto): Observable<LoteDto> {
    return this.http.post<LoteDto>(this.baseUrl, dto); // ✅ sin envolver
  }

  update(dto: UpdateLoteDto): Observable<LoteDto> {
    return this.http.put<LoteDto>(`${this.baseUrl}/${dto.loteId}`, dto); // ✅ sin envolver
  }

  delete(loteId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${loteId}`);
  }

  getReproductorasByLote(loteId: string): Observable<LoteReproductoraDto[]> {
    return this.http.get<LoteReproductoraDto[]>(`${this.base}/LoteReproductora?loteId=${loteId}`);
  }
}
