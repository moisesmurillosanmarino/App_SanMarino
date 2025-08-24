// src/app/core/auth/token-storage.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AuthSession } from './auth.models';

const KEY = 'auth_session';

@Injectable({ providedIn: 'root' })
export class TokenStorageService {
  private readonly subject = new BehaviorSubject<AuthSession | null>(this.read());
  readonly session$ = this.subject.asObservable();

  save(session: AuthSession, remember = true) {
    const store = remember ? localStorage : sessionStorage;
    store.setItem(KEY, JSON.stringify(session));
    (remember ? sessionStorage : localStorage).removeItem(KEY);
    this.subject.next(session);
  }

  get(): AuthSession | null {
    return this.subject.value ?? this.read();
  }

  getToken(): string | null {
    return this.get()?.accessToken ?? null;
  }

  setActiveCompany(name: string) {
    const current = this.get();
    if (!current) return;
    const updated = { ...current, activeCompany: name };
    this.save(updated, !!localStorage.getItem(KEY)); // conserva persistencia
  }

  clear() {
    localStorage.removeItem(KEY);
    sessionStorage.removeItem(KEY);
    this.subject.next(null);
  }

  private read(): AuthSession | null {
    const raw = localStorage.getItem(KEY) ?? sessionStorage.getItem(KEY);
    try { return raw ? JSON.parse(raw) as AuthSession : null; } catch { return null; }
  }
}
