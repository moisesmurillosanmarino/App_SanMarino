import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { City }       from '../../models/city.model.model';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class CityService {
  private baseUrl = '/api/cities';
  private sampleData: City[] = [
    { id: 1, name: 'Medellín',    departmentId: 1, active: true },
    { id: 2, name: 'La Plata',    departmentId: 2, active: true }
  ];

  constructor(private http: HttpClient) {}

  getAll(): Observable<City[]> {
    return this.http.get<City[]>(this.baseUrl).pipe(
      map(data => data && data.length ? data : this.sampleData),
      catchError(() => of(this.sampleData))
    );
  }

  getById(id: number): Observable<City> {
    return this.http.get<City>(`${this.baseUrl}/${id}`).pipe(
      catchError(() => {
        const found = this.sampleData.find(c => c.id === id);
        return of(found ?? this.sampleData[0]);
      })
    );
  }

  create(city: City): Observable<City> {
    return this.http.post<City>(this.baseUrl, city).pipe(
      map(c => {
        this.sampleData.push(c);
        return c;
      }),
      catchError(() => {
        const fake: City = { ...city, id: Date.now() };
        this.sampleData.push(fake);
        return of(fake);
      })
    );
  }

  update(city: City): Observable<City> {
    return this.http.put<City>(`${this.baseUrl}/${city.id}`, city).pipe(
      map(c => {
        const idx = this.sampleData.findIndex(x => x.id === city.id);
        if (idx >= 0) this.sampleData[idx] = c;
        return c;
      }),
      catchError(() => {
        const idx = this.sampleData.findIndex(x => x.id === city.id);
        if (idx >= 0) this.sampleData[idx] = city;
        return of(city);
      })
    );
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`).pipe(
      map(() => {
        this.sampleData = this.sampleData.filter(c => c.id !== id);
      }),
      catchError(() => {
        this.sampleData = this.sampleData.filter(c => c.id !== id);
        return of(void 0);
      })
    );
  }
}
