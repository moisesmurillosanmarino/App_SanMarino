import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';

// Ajusta si usas un token de inyección para baseUrl
const API = '/api/DbStudio';

export interface SchemaDto { name: string; tables: number; }
export interface TableDto { schema: string; name: string; kind: string; rows: number; }
export interface ColumnDto { name: string; dataType: string; isNullable: boolean; default?: string | null; isPrimaryKey: boolean; }
export interface QueryPageDto { rows: Record<string, unknown>[]; count: number; limit: number; offset: number; }

export interface CreateTableDto {
  schema: string;
  table: string;
  columns: Array<{ name: string; type: string; nullable: boolean; default?: string | null; identity?: 'always'|'by_default'|null }>;
  primaryKey?: string[] | null;
  uniques?: string[][] | null;
}
export interface AddColumnDto { name: string; type: string; nullable: boolean; default?: string | null; }
export interface AlterColumnDto { newType?: string | null; setNotNull?: boolean | null; dropNotNull?: boolean | null; setDefault?: string | null; dropDefault?: boolean | null; }
export interface SelectQueryDto { sql: string; params?: Record<string, any>; limit?: number; offset?: number; }

@Injectable({ providedIn: 'root' })
export class DbStudioService {
  private http = inject(HttpClient);

  getSchemas(): Observable<SchemaDto[]> {
    return this.http.get<SchemaDto[]>(`${API}/schemas`);
  }

  getTables(schema?: string): Observable<TableDto[]> {
    const params = new HttpParams({ fromObject: schema ? { schema } : {} });
    return this.http.get<TableDto[]>(`${API}/tables`, { params });
  }

  getColumns(table: string, schema?: string): Observable<ColumnDto[]> {
    const url = schema
      ? `${API}/tables/${encodeURIComponent(schema)}/${encodeURIComponent(table)}/columns`
      : `${API}/tables/${encodeURIComponent(table)}/columns`; // usa "public" por defecto
    return this.http.get<ColumnDto[]>(url);
  }

  preview(table: string, opts: { schema?: string; limit?: number; offset?: number } = {}): Observable<QueryPageDto> {
    const { schema, limit = 50, offset = 0 } = opts;
    const url = schema
      ? `${API}/tables/${encodeURIComponent(schema)}/${encodeURIComponent(table)}/preview`
      : `${API}/tables/${encodeURIComponent(table)}/preview`;
    return this.http.get<QueryPageDto>(url, { params: { limit, offset } as any });
  }

  createTable(dto: CreateTableDto): Observable<void> {
    return this.http.post<void>(`${API}/tables`, dto);
  }

  addColumn(schema: string, table: string, dto: AddColumnDto): Observable<void> {
    return this.http.post<void>(`${API}/tables/${encodeURIComponent(schema)}/${encodeURIComponent(table)}/columns`, dto);
  }

  alterColumn(schema: string, table: string, column: string, dto: AlterColumnDto): Observable<void> {
    return this.http.patch<void>(`${API}/tables/${encodeURIComponent(schema)}/${encodeURIComponent(table)}/columns/${encodeURIComponent(column)}`, dto);
  }

  runSelect(dto: SelectQueryDto): Observable<QueryPageDto> {
    return this.http.post<QueryPageDto>(`${API}/query/select`, {
      sql: dto.sql.trim(),
      params: dto.params ?? {},
      limit: dto.limit ?? 100,
      offset: dto.offset ?? 0
    });
  }
}
