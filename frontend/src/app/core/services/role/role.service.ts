// src/app/core/services/role/role.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface Role {
  id: number;
  name: string;
  permissions: string[];
  companyIds: number[];
}

export interface CreateRoleDto {
  name: string;
  permissions: string[];
  companyIds: number[];
}

export interface UpdateRoleDto {
  id: number;
  name: string;
  permissions: string[];
  companyIds: number[];
}

@Injectable({ providedIn: 'root' })
export class RoleService {
  private readonly baseUrl = `${environment.apiUrl}/Role`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Role[]> {
    return this.http.get<Role[]>(this.baseUrl);
  }

  create(dto: CreateRoleDto): Observable<Role> {
    return this.http.post<Role>(this.baseUrl, dto);
  }

  update(dto: UpdateRoleDto): Observable<Role> {
    return this.http.put<Role>(`${this.baseUrl}/${dto.id}`, dto);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  assignPermissions(roleId: number, keys: string[]) {
    return this.http.post<Role>(`${this.baseUrl}/${roleId}/Permissions/assign`, { keys });
  }
  unassignPermissions(roleId: number, keys: string[]) {
    return this.http.post<Role>(`${this.baseUrl}/${roleId}/Permissions/unassign`, { keys });
  }
  replacePermissions(roleId: number, keys: string[]) {
    return this.http.put<Role>(`${this.baseUrl}/${roleId}/Permissions`, { keys });
  }
}
