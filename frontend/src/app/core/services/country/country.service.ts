import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface PaisDto {
  paisId:     number;
  paisNombre: string;
}

@Injectable({ providedIn: 'root' })
export class CountryService {
  private readonly baseUrl = `${environment.apiUrl}/Pais`;

  constructor(private http: HttpClient) {}

  /** Trae todos los países */
  getAll(): Observable<PaisDto[]> {
    return this.http.get<PaisDto[]>(this.baseUrl);
  }

  /** Trae un país por ID */
  getById(id: number): Observable<PaisDto> {
    return this.http.get<PaisDto>(`${this.baseUrl}/${id}`);
  }

  /** Crea un nuevo país */
  create(dto: Omit<PaisDto, 'paisId'>): Observable<PaisDto> {
    return this.http.post<PaisDto>(this.baseUrl, dto);
  }

  /** Actualiza un país existente */
  update(dto: PaisDto): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${dto.paisId}`, dto);
  }

  /** Elimina por ID */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
