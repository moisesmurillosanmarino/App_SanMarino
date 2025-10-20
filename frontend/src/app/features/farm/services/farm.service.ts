// src/app/features/farm/services/farm.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { TokenStorageService } from '../../../core/auth/token-storage.service';
import { AuthSession } from '../../../core/auth/auth.models';

export interface FarmDto {
  id: number;                  // ← número garantizado al leer
  name: string;
  companyId: number;           // ← número garantizado al leer
  status: 'A' | 'I' | string;

  // Opcionales para UI
  regional?: string | null;
  regionalId?: number | null;
  department?: string | null;
  city?: string | null;
  departamentoId?: number | null;
  ciudadId?: number | null;

  createdAt?: string;
  updatedAt?: string;
  company?: { id: number; name: string };
}

export interface CreateFarmDto {
  name: string;
  companyId: number;
  status: 'A' | 'I';
  // opcionales
  regional?: string | '1';
  regionalId?: number | null;
  departamentoId?: number | null;
  ciudadId?: number | null;
  department?: string | null;
  city?: string | null;
}

export interface UpdateFarmDto extends CreateFarmDto {
  id: number; // ← requerido en update
}

@Injectable({ providedIn: 'root' })
export class FarmService {
  private readonly baseUrl = `${environment.apiUrl}/Farm`;
  private tokenStorage = inject(TokenStorageService);

  constructor(private http: HttpClient) {}

  getAll(): Observable<FarmDto[]> {
    // Obtener el ID del usuario de la sesión actual
    const session: AuthSession | null = this.tokenStorage.get();
    const userId = session?.user?.id;
    
    console.log('FarmService.getAll() - Usuario de sesión:', userId);
    
    // Crear parámetros de consulta
    let params = new HttpParams();
    if (userId) {
      params = params.set('id_user_session', userId);
    }
    
    console.log('FarmService.getAll() - Parámetros:', params.toString());
    
    return this.http.get<FarmDto[]>(this.baseUrl, { params });
  }

  getById(id: number): Observable<FarmDto> {
    return this.http.get<FarmDto>(`${this.baseUrl}/${id}`);
  }

  create(dto: CreateFarmDto): Observable<FarmDto> {
    return this.http.post<FarmDto>(this.baseUrl, dto);
  }

  update(dto: UpdateFarmDto): Observable<FarmDto> {
    return this.http.put<FarmDto>(`${this.baseUrl}/${dto.id}`, dto);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
