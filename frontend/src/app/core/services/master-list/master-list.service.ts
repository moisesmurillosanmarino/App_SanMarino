// src/app/core/services/master-list.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface MasterListDto {
  id: number;
  key: string;
  name: string;
  options: string[];
}

export interface CreateMasterListDto {
  key: string;
  name: string;
  options: string[];
}

export interface UpdateMasterListDto {
  id: number;
  key: string;
  name: string;
  options: string[];
}

@Injectable({ providedIn: 'root' })
export class MasterListService {
  private readonly baseUrl = `${environment.apiUrl}/MasterList`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<MasterListDto[]> {
    return this.http.get<MasterListDto[]>(this.baseUrl);
  }

  getById(id: number): Observable<MasterListDto> {
    return this.http.get<MasterListDto>(`${this.baseUrl}/${id}`);
  }

  create(dto: CreateMasterListDto): Observable<MasterListDto> {
    return this.http.post<MasterListDto>(this.baseUrl, dto);
  }
  /** ← NUEVO: trae por key */
  getByKey(key: string): Observable<MasterListDto> {
    return this.http.get<MasterListDto>(`${this.baseUrl}/byKey/${key}`);
  }

  update(dto: UpdateMasterListDto): Observable<MasterListDto> {
    return this.http.put<MasterListDto>(`${this.baseUrl}/${dto.id}`, dto);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
