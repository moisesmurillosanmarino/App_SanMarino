// src/app/core/services/user/user.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface UserListItem {
  id: string;
  firstName: string;
  surName: string;
  email: string;
  isActive: boolean;
  cedula: string;
  telefono: string;
  ubicacion: string;
  roles: string[];

    // NUEVOS:
    companyNames?: string[];
    primaryCompany?: string;
    primaryRole?: string;
}

// Detalle devuelto por GET /api/Users/{id}
export interface UserDetailDto {
  id: string;
  surName: string;
  firstName: string;
  cedula: string;
  telefono: string;
  ubicacion: string;
  roles: string[];
  companyIds: number[];
  isActive: boolean;
  isLocked: boolean;
  createdAt: string;
  lastLoginAt?: string | null;
  // Nota: el backend no devuelve email en el detalle.
}

// Alias retrocompatible
export type UserDto = UserListItem;

export interface CreateUserDto {
  email: string;
  password: string;
  surName: string;
  firstName: string;
  cedula: string;
  telefono: string;
  ubicacion: string;
  companyIds: number[];
  roleIds: number[];
}

export interface UpdateUserDto {
  surName?: string;
  firstName?: string;
  cedula?: string;
  telefono?: string;
  ubicacion?: string;
  isActive?: boolean;
  isLocked?: boolean;
  companyIds?: number[];
  roleIds?: number[];
}

export interface CreateUserResponse {
  userId: string;
  username: string;
  fullName: string;
  token: string;
  roles: string[];
  empresas: string[];
  permisos: string[];
}

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly baseUrl = `${environment.apiUrl}/Users`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<UserListItem[]> {
    return this.http.get<UserListItem[]>(this.baseUrl);
  }

  getById(id: string): Observable<UserDetailDto> {
    return this.http.get<UserDetailDto>(`${this.baseUrl}/${id}`);
  }

  create(dto: CreateUserDto): Observable<CreateUserResponse> {
    return this.http.post<CreateUserResponse>(this.baseUrl, dto);
  }

  // UDDI genérico (partial update)
  update(id: string, dto: UpdateUserDto): Observable<UserDetailDto> {
    return this.http.patch<UserDetailDto>(`${this.baseUrl}/${id}`, dto);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  // Cambiar contraseña (admin resetea la clave)
  updatePassword(id: string, newPassword: string): Observable<void> {
    // Enviamos ambas keys por compatibilidad con el backend
    const body = { password: newPassword, newPassword };
    return this.http.patch<void>(`${this.baseUrl}/${id}/password`, body);
  }
}
