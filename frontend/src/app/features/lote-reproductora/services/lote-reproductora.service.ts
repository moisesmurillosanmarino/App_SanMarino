// app/features/lote-reproductora/services/lote-reproductora.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';

// ------------ Tipos base ------------
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
  pesoMixto?: number | null;
}

export interface LoteReproductoraDto {
  loteId: string;
  reproductoraId: string;
  nombreLote: string;
  fechaEncasetamiento: string | null;
  m: number | null;
  h: number | null;
  mixtas: number | null;
  mortCajaH: number | null;
  mortCajaM: number | null;
  unifH: number | null;
  unifM: number | null;
  pesoInicialM: number | null;
  pesoInicialH: number | null;
  pesoMixto?: number | null;
}

export type CreateLoteReproductoraDto = LoteReproductoraDto;
export type UpdateLoteReproductoraDto = LoteReproductoraDto;

// ------------ Tipos opcionales para búsqueda paginada (si activas /search) ------------
export interface LoteReproductoraSearchRequest {
  loteId?: string;
  reproductoraId?: string;
  fromDate?: string | Date; // se serializa a ISO (UTC) si viene Date
  toDate?: string | Date;
  page?: number;
  pageSize?: number;
  orderBy?: string; // 'FechaEncasetamiento' | 'NombreLote' | ...
  desc?: boolean;
}

export interface PagedResult<T> {
  total: number;
  page: number;
  pageSize: number;
  items: T[];
}

// ASP.NET Core ProblemDetails/ValidationProblemDetails (mínimo útil)
export interface ProblemDetails {
  type?: string;
  title?: string;
  status?: number;
  detail?: string;
  instance?: string;
  errors?: Record<string, string[]>;
}

// ============ Service ============
@Injectable({ providedIn: 'root' })
export class LoteReproductoraService {
  private readonly base = `${environment.apiUrl}`;
  private readonly resourceBase = `${this.base}/LoteReproductora`;

  constructor(private http: HttpClient) {}

  // ---------- Helpers ----------
  private buildParams(obj: Record<string, unknown>): HttpParams {
    let params = new HttpParams();
    Object.entries(obj)
      .filter(([, v]) => v !== undefined && v !== null && v !== '')
      .forEach(([k, v]) => {
        if (v instanceof Date) {
          params = params.set(k, v.toISOString());
        } else {
          params = params.set(k, String(v));
        }
      });
    return params;
  }

  private toIsoOrNull(d?: string | Date | null): string | null {
    if (!d) return null;
    if (d instanceof Date) return d.toISOString();
    // Si ya viene string, asumimos ISO o 'yyyy-MM-dd'
    const date = new Date(d);
    return isNaN(date.getTime()) ? d : date.toISOString();
  }

  private handleError = (err: HttpErrorResponse) => {
    const problem: ProblemDetails | undefined = err.error;
    const message =
      problem?.detail ||
      problem?.title ||
      (typeof err.error === 'string' ? err.error : 'Error inesperado en el servidor.');
    return throwError(() => ({ status: err.status, message, problem }));
  };

  // ---------- Granjas ----------
  getGranjas(): Observable<FarmDto[]> {
    return this.http
      .get<FarmDto[]>(`${this.base}/Farm`)
      .pipe(catchError(this.handleError));
  }

  // ---------- Núcleos ----------
  getNucleosPorGranja(granjaId: number): Observable<NucleoDto[]> {
    const params = this.buildParams({ granjaId });
    return this.http
      .get<NucleoDto[]>(`${this.base}/Nucleo`, { params })
      .pipe(catchError(this.handleError));
  }

  // ---------- Lotes ----------
  getLotes(): Observable<LoteDto[]> {
    return this.http
      .get<LoteDto[]>(`${this.base}/Lote`)
      .pipe(catchError(this.handleError));
  }

  // ---------- Lote Reproductora (CRUD) ----------
  /**
   * Lista general. Si pasas `loteId`, filtra en servidor.
   * (Puedes reemplazar `getByLoteId` por este.)
   */
  getAll(loteId?: string): Observable<LoteReproductoraDto[]> {
    const params = this.buildParams({ loteId });
    return this.http
      .get<LoteReproductoraDto[]>(this.resourceBase, { params })
      .pipe(catchError(this.handleError));
  }

  getByLoteId(loteId: string): Observable<LoteReproductoraDto[]> {
    return this.getAll(loteId);
  }

  getById(loteId: string, repId: string): Observable<LoteReproductoraDto> {
    return this.http
      .get<LoteReproductoraDto>(`${this.resourceBase}/${loteId}/${repId}`)
      .pipe(catchError(this.handleError));
  }

  create(dto: CreateLoteReproductoraDto): Observable<LoteReproductoraDto> {
    // Asegura fecha ISO (UTC) si viene en 'yyyy-MM-dd'
    const payload: CreateLoteReproductoraDto = {
      ...dto,
      fechaEncasetamiento: this.toIsoOrNull(dto.fechaEncasetamiento),
    } as CreateLoteReproductoraDto;

    return this.http
      .post<LoteReproductoraDto>(this.resourceBase, payload)
      .pipe(catchError(this.handleError));
  }

  update(dto: UpdateLoteReproductoraDto): Observable<LoteReproductoraDto> {
    const payload: UpdateLoteReproductoraDto = {
      ...dto,
      fechaEncasetamiento: this.toIsoOrNull(dto.fechaEncasetamiento),
    } as UpdateLoteReproductoraDto;

    return this.http
      .put<LoteReproductoraDto>(`${this.resourceBase}/${dto.loteId}/${dto.reproductoraId}`, payload)
      .pipe(catchError(this.handleError));
  }

  delete(loteId: string, repId: string): Observable<void> {
    return this.http
      .delete<void>(`${this.resourceBase}/${loteId}/${repId}`)
      .pipe(catchError(this.handleError));
  }

  // ---------- Bulk ----------
  createMany(dtos: CreateLoteReproductoraDto[]): Observable<LoteReproductoraDto[]> {
    const payload = (dtos ?? []).map(d => ({
      ...d,
      fechaEncasetamiento: this.toIsoOrNull(d.fechaEncasetamiento),
    })) as CreateLoteReproductoraDto[];

    return this.http
      .post<LoteReproductoraDto[]>(`${this.resourceBase}/bulk`, payload)
      .pipe(catchError(this.handleError));
  }

  // ---------- Search (opcional: requiere endpoint /search en el back) ----------
  search(req: LoteReproductoraSearchRequest): Observable<PagedResult<LoteReproductoraDto>> {
    const params = this.buildParams({
      loteId: req.loteId,
      reproductoraId: req.reproductoraId,
      fromDate: this.toIsoOrNull(req.fromDate ?? null),
      toDate: this.toIsoOrNull(req.toDate ?? null),
      page: req.page ?? 1,
      pageSize: req.pageSize ?? 50,
      orderBy: req.orderBy ?? 'FechaEncasetamiento',
      desc: req.desc ?? true,
    });

    // Si tu controller retorna {success, message, total, page, pageSize, data}
    // puedes mapear aquí a PagedResult<T>:
    return this.http
      .get<any>(`${this.resourceBase}/search`, { params })
      .pipe(
        map((res) => {
          // Adapta si tu controller devuelve directamente PagedResult<T>
          if ('items' in res && 'total' in res) {
            return res as PagedResult<LoteReproductoraDto>;
          }
          // Forma envuelta { success, data, total, page, pageSize }
          return {
            total: res.total ?? res?.data?.length ?? 0,
            page: res.page ?? 1,
            pageSize: res.pageSize ?? (res?.data?.length ?? 0),
            items: (res.data ?? res.items ?? []) as LoteReproductoraDto[],
          } as PagedResult<LoteReproductoraDto>;
        }),
        catchError(this.handleError)
      );
  }

  // ---------- Actualiza Lote (metadatos del lote padre) ----------
  updateLote(dto: LoteDtoExtendido): Observable<any> {
    return this.http
      .put(`${this.base}/Lote/${dto.loteId}`, dto)
      .pipe(catchError(this.handleError));
  }
}
