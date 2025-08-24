// src/app/core/services/permission/permission.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface Permission {
  id: number;
  key: string;
  description?: string | null;
}

export interface CreatePermissionDto {
  key: string;
  description?: string | null;
}

export interface UpdatePermissionDto extends CreatePermissionDto {
  id: number;
}

@Injectable({ providedIn: 'root' })
export class PermissionService {
  private readonly baseUrl = `${environment.apiUrl}/Permission`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Permission[]> {
    return this.http.get<Permission[]>(this.baseUrl);
  }

  getKeys(): Observable<string[]> {
    return this.http.get<string[]>(`${this.baseUrl}/keys`);
  }

  create(dto: CreatePermissionDto): Observable<Permission> {
    const payload = { ...dto, key: dto.key.trim().toLowerCase() };
    return this.http.post<Permission>(this.baseUrl, payload);
  }

  update(dto: UpdatePermissionDto): Observable<Permission> {
    const payload = { ...dto, key: dto.key.trim().toLowerCase() };
    return this.http.put<Permission>(`${this.baseUrl}/${dto.id}`, payload);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
