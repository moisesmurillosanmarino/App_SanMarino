// src/app/features/farm/services/farm.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface FarmDto {
  id: number;
  name: string;
  companyId: number;
  regionalId: number;
  zoneId: number;
  status: string;
}

export interface CreateFarmDto {
  name: string;
  companyId: number;
  regionalId: number;
  zoneId: number;
  status: string;
}

export interface UpdateFarmDto extends CreateFarmDto {
  id: number;
}

@Injectable({ providedIn: 'root' })
export class FarmService {
  private readonly baseUrl = `${environment.apiUrl}/Farm`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<FarmDto[]> {
    return this.http.get<FarmDto[]>(this.baseUrl);
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
