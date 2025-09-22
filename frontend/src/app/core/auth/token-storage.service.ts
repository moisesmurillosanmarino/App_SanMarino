import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AuthSession, MenuItem } from './auth.models';

const KEY = 'auth_session';

@Injectable({ providedIn: 'root' })
export class TokenStorageService {
  private readonly subject = new BehaviorSubject<AuthSession | null>(this.read());
  readonly session$ = this.subject.asObservable();

  // Guarda en localStorage si remember=true; caso contrario, en sessionStorage
  save(session: AuthSession, remember = false) {
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

  getMenu(): MenuItem[] {
    return this.get()?.menu ?? [];
  }

  getMenusByRole() {
    return this.get()?.menusByRole ?? [];
  }

  // Actualiza sólo el menú en el storage manteniendo el tipo de persistencia
  updateMenu(menu: MenuItem[]) {
    const current = this.get();
    if (!current) return;
    const updated = { ...current, menu };
    const persistedInLocal = !!localStorage.getItem(KEY);
    this.save(updated, persistedInLocal);
  }

  setActiveCompany(name: string) {
    const current = this.get();
    if (!current) return;
    const updated = { ...current, activeCompany: name };
    const persistedInLocal = !!localStorage.getItem(KEY);
    this.save(updated, persistedInLocal);
  }

  clear() {
    localStorage.removeItem(KEY);
    sessionStorage.removeItem(KEY);
    this.subject.next(null);
  }

   /** BORRA TODO lo temporal: sessionStorage completo + la clave de localStorage */
   clearAllTemporal() {
    try { sessionStorage.clear(); } catch {}
    try { localStorage.removeItem(KEY); } catch {}
    this.subject.next(null);
  }

  private read(): AuthSession | null {
    const raw = localStorage.getItem(KEY) ?? sessionStorage.getItem(KEY);
    try { return raw ? JSON.parse(raw) as AuthSession : null; } catch { return null; }
  }


  // (Opcional) sincroniza múltiples pestañas
  constructor() {
    window.addEventListener('storage', (e) => {
      if (e.key === KEY) this.subject.next(this.read());
    });
  }
}
