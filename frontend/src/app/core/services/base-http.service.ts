// src/app/core/services/base-http.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { HttpCompanyHelperService } from './http-company-helper.service';

/**
 * Servicio base para todas las peticiones HTTP con empresa activa automática
 */
@Injectable({
  providedIn: 'root'
})
export class BaseHttpService {
  protected http = inject(HttpClient);
  protected companyHelper = inject(HttpCompanyHelperService);

  constructor() {}

  /**
   * GET request con empresa activa automática
   */
  get<T>(url: string, options: {
    headers?: { [header: string]: string | string[] };
    params?: HttpParams | { [param: string]: string | number | boolean | ReadonlyArray<string | number | boolean> };
    context?: string;
  } = {}): Observable<T> {
    const { headers = {}, params, context = 'BaseHttpService' } = options;
    
    this.companyHelper.logActiveCompany(context);
    
    const finalHeaders = this.companyHelper.getAuthenticatedHeaders(headers);
    
    return this.http.get<T>(url, { headers: finalHeaders, params })
      .pipe(
        catchError(this.handleError.bind(this))
      );
  }

  /**
   * POST request con empresa activa automática
   */
  post<T>(url: string, body: any, options: {
    headers?: { [header: string]: string | string[] };
    context?: string;
  } = {}): Observable<T> {
    const { headers = {}, context = 'BaseHttpService' } = options;
    
    this.companyHelper.logActiveCompany(context);
    
    const finalHeaders = this.companyHelper.getAuthenticatedHeaders(headers);
    
    return this.http.post<T>(url, body, { headers: finalHeaders })
      .pipe(
        catchError(this.handleError.bind(this))
      );
  }

  /**
   * PUT request con empresa activa automática
   */
  put<T>(url: string, body: any, options: {
    headers?: { [header: string]: string | string[] };
    context?: string;
  } = {}): Observable<T> {
    const { headers = {}, context = 'BaseHttpService' } = options;
    
    this.companyHelper.logActiveCompany(context);
    
    const finalHeaders = this.companyHelper.getAuthenticatedHeaders(headers);
    
    return this.http.put<T>(url, body, { headers: finalHeaders })
      .pipe(
        catchError(this.handleError.bind(this))
      );
  }

  /**
   * DELETE request con empresa activa automática
   */
  deleteRequest<T>(url: string, options: {
    headers?: { [header: string]: string | string[] };
    context?: string;
  } = {}): Observable<T> {
    const { headers = {}, context = 'BaseHttpService' } = options;
    
    this.companyHelper.logActiveCompany(context);
    
    const finalHeaders = this.companyHelper.getAuthenticatedHeaders(headers);
    
    return this.http.delete<T>(url, { headers: finalHeaders })
      .pipe(
        catchError(this.handleError.bind(this))
      );
  }

  /**
   * PATCH request con empresa activa automática
   */
  patch<T>(url: string, body: any, options: {
    headers?: { [header: string]: string | string[] };
    context?: string;
  } = {}): Observable<T> {
    const { headers = {}, context = 'BaseHttpService' } = options;
    
    this.companyHelper.logActiveCompany(context);
    
    const finalHeaders = this.companyHelper.getAuthenticatedHeaders(headers);
    
    return this.http.patch<T>(url, body, { headers: finalHeaders })
      .pipe(
        catchError(this.handleError.bind(this))
      );
  }

  /**
   * Manejo centralizado de errores HTTP
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Error desconocido';
    
    if (error.error instanceof ErrorEvent) {
      // Error del cliente
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Error del servidor
      errorMessage = `Error ${error.status}: ${error.message}`;
      if (error.error?.message) {
        errorMessage += ` - ${error.error.message}`;
      }
    }
    
    console.error('BaseHttpService Error:', errorMessage, error);
    return throwError(() => new Error(errorMessage));
  }

  /**
   * Método utilitario para crear HttpParams
   */
  createParams(params: { [key: string]: any }): HttpParams {
    let httpParams = new HttpParams();
    
    Object.keys(params).forEach(key => {
      const value = params[key];
      if (value !== null && value !== undefined) {
        httpParams = httpParams.set(key, value.toString());
      }
    });
    
    return httpParams;
  }
}
