import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface NucleoDto {
  nucleoId:     string;
  granjaId:     number;
  nucleoNombre: string;
}

export interface CreateNucleoDto {
  nucleoId:     string;
  granjaId:     number;
  nucleoNombre: string;
}

export interface UpdateNucleoDto {
  nucleoId:     string;
  granjaId:     number;
  nucleoNombre: string;
}

@Injectable({ providedIn: 'root' })
export class NucleoService {
  private readonly baseUrl = `${environment.apiUrl}/Nucleo`;

  constructor(private http: HttpClient) {}

  /** Todos los núcleos */
  getAll(): Observable<NucleoDto[]> {
    return this.http.get<NucleoDto[]>(this.baseUrl);
  }

  /** Uno por clave compuesta */
  getById(nucleoId: string, granjaId: number): Observable<NucleoDto> {
    return this.http.get<NucleoDto>(`${this.baseUrl}/${nucleoId}/${granjaId}`);
  }

  /** Crear nuevo */
  create(dto: CreateNucleoDto): Observable<NucleoDto> {
    return this.http.post<NucleoDto>(this.baseUrl, dto);
  }

  /** Actualizar existente */
  update(dto: UpdateNucleoDto): Observable<NucleoDto> {
    return this.http.put<NucleoDto>(
      `${this.baseUrl}/${dto.nucleoId}/${dto.granjaId}`,
      dto
    );
  }

  /** Eliminar */
  delete(nucleoId: string, granjaId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${nucleoId}/${granjaId}`);
  }
}
