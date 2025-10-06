import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { LoteReproductoraDto } from '../../lote-reproductora/services/lote-reproductora.service';


// ⬇️ NUEVO: DTO del resumen de mortalidad
export interface LoteMortalidadResumenDto {
  loteId: number;  // Cambiado a number
  mortalidadAcumHembras: number;
  mortalidadAcumMachos: number;
  hembrasIniciales: number;
  machosIniciales: number;
  mortCajaHembras: number;
  mortCajaMachos: number;
  saldoHembras: number;
  saldoMachos: number;
}

export interface LoteDto {
  loteId: number;  // Cambiado a number para secuencia numérica
  loteNombre: string;

  granjaId: number;
  nucleoId?: string | null;   // ← string
  galponId?: string | null;   // ← string

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
  lineaGeneticaId?: number;
  tecnico?: string;

  mixtas?: number;
  pesoMixto?: number;
  avesEncasetadas?: number;

  loteErp?: string;
  lineaGenetica?: string;
}

export interface CreateLoteDto extends Omit<LoteDto, 'loteId'> {
  loteId?: number; // Opcional - auto-incremento numérico
}

export interface UpdateLoteDto extends LoteDto {}

@Injectable({ providedIn: 'root' })
export class LoteService {
  private readonly baseUrl = `${environment.apiUrl}/Lote`;
  private readonly base = environment.apiUrl;

  constructor(private readonly http: HttpClient) {}

  getAll(): Observable<LoteDto[]> {
    return this.http.get<LoteDto[]>(this.baseUrl);
  }

  getById(loteId: number): Observable<LoteDto> {
    return this.http.get<LoteDto>(`${this.baseUrl}/${loteId}`);
  }

  create(dto: CreateLoteDto): Observable<LoteDto> {
    return this.http.post<LoteDto>(this.baseUrl, dto);
  }

  update(dto: UpdateLoteDto): Observable<LoteDto> {
    return this.http.put<LoteDto>(`${this.baseUrl}/${dto.loteId}`, dto);
  }

  delete(loteId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${loteId}`);
  }

  getReproductorasByLote(loteId: number): Observable<LoteReproductoraDto[]> {
    return this.http.get<LoteReproductoraDto[]>(`${this.base}/LoteReproductora?loteId=${loteId}`);
  }

   // ⬇️ NUEVO: resumen de mortalidad por lote
  getResumenMortalidad(loteId: number): Observable<LoteMortalidadResumenDto> {
    // Si tu backend quedó como /api/Lotes/{id}/..., cambia baseUrl por `${this.base}/Lotes`
    return this.http.get<LoteMortalidadResumenDto>(
      `${this.baseUrl}/${loteId}/resumen-mortalidad`
    );
  }

  /** Obtiene los lotes filtrados por galpón (galponId) */
  getByGalpon(galponId: string): Observable<LoteDto[]> {
    // Mantiene el patrón de filtros por query-string usado en el archivo
    return this.http.get<LoteDto[]>(
      `${this.baseUrl}?galponId=${encodeURIComponent(galponId)}`
    );
  }
}
