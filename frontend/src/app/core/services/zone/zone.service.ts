// src/app/core/services/zone/zone.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Zone } from '../../../features/config/zone/zone.model';

@Injectable({ providedIn: 'root' })
export class ZoneService {
  private _zones = new BehaviorSubject<Zone[]>([
    // datos de ejemplo basado en tu captura
    { companyId: 1, id: 1,  name: 'CUNDINAMARCA', status: 'Activo' },
    { companyId: 1, id: 2,  name: 'BOYACÁ',        status: 'Activo' },
    { companyId: 1, id: 3,  name: 'TOLIMA',        status: 'Activo' },
    /* …hasta id 17 … */
  ]);
  readonly zones$ = this._zones.asObservable();
  list$: any;

  /** Crear o actualizar */
  save(z: Zone) {
    const list = [...this._zones.value];
    const idx  = list.findIndex(x => x.id === z.id && x.companyId === z.companyId);
    if (idx >= 0) list[idx] = z;
    else          list.push(z);
    this._zones.next(list);
  }

  /** Eliminar */
  delete(companyId: number, id: number) {
    this._zones.next(this._zones.value.filter(x => !(x.companyId === companyId && x.id === id)));
  }
}
