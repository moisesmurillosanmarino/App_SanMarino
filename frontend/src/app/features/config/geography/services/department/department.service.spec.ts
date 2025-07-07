import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Department } from '../../models/department.model.model';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class DepartmentService {
  private baseUrl = '/api/departments';
  private sampleData: Department[] = [
    { id: 1, name: 'Antioquia',       countryId: 1, active: true },
    { id: 2, name: 'Buenos Aires',   countryId: 2, active: true }
  ];

  constructor(private http: HttpClient) {}

  getAll(): Observable<Department[]> {
    return this.http.get<Department[]>(this.baseUrl).pipe(
      map(data => data && data.length ? data : this.sampleData),
      catchError(() => of(this.sampleData))
    );
  }

  getById(id: number): Observable<Department> {
    return this.http.get<Department>(`${this.baseUrl}/${id}`).pipe(
      catchError(() => {
        const found = this.sampleData.find(d => d.id === id);
        return of(found ?? this.sampleData[0]);
      })
    );
  }

  create(dept: Department): Observable<Department> {
    return this.http.post<Department>(this.baseUrl, dept).pipe(
      map(d => {
        this.sampleData.push(d);
        return d;
      }),
      catchError(() => {
        const fake: Department = { ...dept, id: Date.now() };
        this.sampleData.push(fake);
        return of(fake);
      })
    );
  }

  update(dept: Department): Observable<Department> {
    return this.http.put<Department>(`${this.baseUrl}/${dept.id}`, dept).pipe(
      map(d => {
        const idx = this.sampleData.findIndex(x => x.id === dept.id);
        if (idx >= 0) this.sampleData[idx] = d;
        return d;
      }),
      catchError(() => {
        const idx = this.sampleData.findIndex(x => x.id === dept.id);
        if (idx >= 0) this.sampleData[idx] = dept;
        return of(dept);
      })
    );
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`).pipe(
      map(() => {
        this.sampleData = this.sampleData.filter(d => d.id !== id);
      }),
      catchError(() => {
        this.sampleData = this.sampleData.filter(d => d.id !== id);
        return of(void 0);
      })
    );
  }
}
