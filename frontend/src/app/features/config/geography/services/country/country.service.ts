import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Country }    from '../../models/country.model.model';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class CountryService {
  private baseUrl = '/api/countries';
  private sampleData: Country[] = [
    { id: 1, name: 'Colombia',  code: 'CO', active: true },
    { id: 2, name: 'Venezuela', code: 'VZ', active: true }
  ];

  constructor(private http: HttpClient) {}

  getAll(): Observable<Country[]> {
    return this.http.get<Country[]>(this.baseUrl).pipe(
      map(data => data && data.length ? data : this.sampleData),
      catchError(() => of(this.sampleData))
    );
  }

  getById(id: number): Observable<Country> {
    return this.http.get<Country>(`${this.baseUrl}/${id}`).pipe(
      catchError(() => {
        const found = this.sampleData.find(c => c.id === id);
        return of(found ?? this.sampleData[0]);
      })
    );
  }

  create(country: Country): Observable<Country> {
    return this.http.post<Country>(this.baseUrl, country).pipe(
      map(c => {
        this.sampleData.push(c);
        return c;
      }),
      catchError(() => {
        const fake: Country = { ...country, id: Date.now() };
        this.sampleData.push(fake);
        return of(fake);
      })
    );
  }

  update(country: Country): Observable<Country> {
    return this.http.put<Country>(`${this.baseUrl}/${country.id}`, country).pipe(
      map(c => {
        const idx = this.sampleData.findIndex(x => x.id === country.id);
        if (idx >= 0) this.sampleData[idx] = c;
        return c;
      }),
      catchError(() => {
        const idx = this.sampleData.findIndex(x => x.id === country.id);
        if (idx >= 0) this.sampleData[idx] = country;
        return of(country);
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
