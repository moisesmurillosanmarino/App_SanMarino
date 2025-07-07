import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

export interface UserDto {
  id: string;
  nombre: string;
  apellido: string;
  cedula: string;
  correo: string;
  telefono: string;
}

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly users: UserDto[] = [
    { id: '1', nombre: 'Ana',    apellido: 'Gómez',   cedula: '12345678', correo: 'ana@gomez.com',   telefono: '3001234567' },
    { id: '2', nombre: 'Carlos', apellido: 'Pérez',   cedula: '87654321', correo: 'carlos@perez.com', telefono: '3107654321' },
    { id: '3', nombre: 'Luisa',  apellido: 'Ramírez', cedula: '11223344', correo: 'luisa@ramirez.com', telefono: '3120011223' }
  ];

  getAll(): Observable<UserDto[]> {
    return of(this.users);
  }
}
