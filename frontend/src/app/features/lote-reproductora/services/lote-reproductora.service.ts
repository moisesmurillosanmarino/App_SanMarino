import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface FarmDto {
  id: number;
  name: string;
  companyId: number;
  regionalId: number;
  status: boolean;
  zoneId: number;
}

export interface NucleoDto {
  nucleoId: string;
  granjaId: number;
  nucleoNombre: string;
}

export interface LoteDto {
  loteId: string;
  loteNombre: string;
  granjaId: number;
  nucleoId: string;
  galponId: string;
  fechaEncaset: string;
}

export interface LoteDtoExtendido {
  loteId: string;
  loteNombre: string;
  granjaId: number;
  nucleoId?: number;
  galponId?: number;
  regional?: string;
  fechaEncaset?: string;
  hembrasL?: number;
  machosL?: number;
  mixtas?: number;
  avesEncasetadas?: number;
  pesoInicialM?: number;
  pesoInicialH?: number;
  pesoMixto?: number;
}


export interface LoteReproductoraDto {
  loteId: string;
  reproductoraId: string;
  nombreLote: string;
  fechaEncasetamiento: string;
  m: number;
  h: number;
  mixtas: number;
  mortCajaH: number;
  mortCajaM: number;
  unifH: number;
  unifM: number;
  pesoInicialM: number;
  pesoInicialH: number;
}

export interface CreateLoteReproductoraDto extends Omit<LoteReproductoraDto, never> {}
export interface UpdateLoteReproductoraDto extends LoteReproductoraDto {}

@Injectable({ providedIn: 'root' })
export class LoteReproductoraService {
  private readonly base = `${environment.apiUrl}`;

  constructor(private http: HttpClient) {}

  // ---------- Granjas ----------
  getGranjas(): Observable<FarmDto[]> {
    return this.http.get<FarmDto[]>(`${this.base}/Farm`);
  }

  // ---------- Núcleos ----------
  getNucleosPorGranja(granjaId: number): Observable<NucleoDto[]> {
    return this.http.get<NucleoDto[]>(`${this.base}/Nucleo?granjaId=${granjaId}`);
  }

  // ---------- Lotes ----------
  getLotes(): Observable<LoteDto[]> {
    return this.http.get<LoteDto[]>(`${this.base}/Lote`);
  }

  // ---------- Lote Reproductora ----------
  getAll(): Observable<LoteReproductoraDto[]> {
    return this.http.get<LoteReproductoraDto[]>(`${this.base}/LoteReproductora`);
  }

  getById(loteId: string, repId: string): Observable<LoteReproductoraDto> {
    return this.http.get<LoteReproductoraDto>(`${this.base}/LoteReproductora/${loteId}/${repId}`);
  }

  create(dto: CreateLoteReproductoraDto): Observable<LoteReproductoraDto> {
    return this.http.post<LoteReproductoraDto>(`${this.base}/LoteReproductora`, dto);
  }

  update(dto: UpdateLoteReproductoraDto): Observable<LoteReproductoraDto> {
    return this.http.put<LoteReproductoraDto>(
      `${this.base}/LoteReproductora/${dto.loteId}/${dto.reproductoraId}`, dto);
  }

  delete(loteId: string, repId: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/LoteReproductora/${loteId}/${repId}`);
  }

  getByLoteId(loteId: string): Observable<LoteReproductoraDto[]> {
    return this.http.get<LoteReproductoraDto[]>(`${this.base}/LoteReproductora?loteId=${loteId}`);
  }

  updateLote(dto: LoteDtoExtendido): Observable<any> {
    return this.http.put(`${this.base}/Lote/${dto.loteId}`, dto);
  }

}
