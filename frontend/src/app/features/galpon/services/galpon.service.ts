// src/app/features/galpon/services/galpon.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface GalponDto {
  galponId: string;
  galponNombre: string;
  galponNucleoId: string;
  NucleoId: string;
  granjaId: number;
  ancho: string;
  largo: string;
  tipoGalpon: string;
}


export interface CreateGalponDto {
  galponId: string;
  galponNombre: string;
  galponNucleoId: string;
  NucleoId : string;
  granjaId: number;
  ancho: string;
  largo: string;
  tipoGalpon: string;
}

export interface UpdateGalponDto {
  galponId: string;
  galponNombre: string;
  galponNucleoId: string;
  granjaId: number;
  NucleoId : string;
  ancho: string;
  largo: string;
  tipoGalpon: string;
}

@Injectable({ providedIn: 'root' })
export class GalponService {
  private readonly baseUrl = `${environment.apiUrl}/Galpon`;

  constructor(private http: HttpClient) {}

  /** Trae todos los galpones */
  getAll(): Observable<GalponDto[]> {
    return this.http.get<GalponDto[]>(this.baseUrl);
  }

  /** Crea un galpón */
  create(dto: CreateGalponDto): Observable<GalponDto> {
    return this.http.post<GalponDto>(this.baseUrl, dto);
  }

  /** Actualiza un galpón existente */
  update(dto: UpdateGalponDto): Observable<GalponDto> {
    return this.http.put<GalponDto>(`${this.baseUrl}/${dto.galponId}`, dto);
  }

  /** Elimina un galpón por id */
  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  // ← Nuevo método para filtrar por granja + núcleo
  getByGranjaAndNucleo(granjaId: number, nucleoId: string): Observable<GalponDto[]> {
    return this.http.get<GalponDto[]>(
      `${this.baseUrl}/granja/${granjaId}/nucleo/${nucleoId}`
    );
  }
}
