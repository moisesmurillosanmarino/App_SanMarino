// src/app/core/services/list.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface ListItem {
  id: number;
  value: string;
}

export interface MasterList {
  id: number;
  key: string;      // identificador único, p.ej. 'ciudades'
  name: string;     // etiqueta legible, p.ej. 'Ciudades'
  items: ListItem[];
}

@Injectable({
  providedIn: 'root'
})
export class ListService {
  private _lists = new BehaviorSubject<MasterList[]>([
    // datos de ejemplo
    { id: 1, key: 'ciudades', name: 'Ciudades', items: [
        { id: 1, value: 'Bogotá' },
        { id: 2, value: 'Medellín' },
        { id: 3, value: 'Cali' },
      ]
    },
    { id: 2, key: 'tiposId', name: 'Tipo de Identificación', items: [
        { id: 1, value: 'Cédula' },
        { id: 2, value: 'Tarjeta de Identidad' },
      ]
    },
  ]);
  readonly lists$ = this._lists.asObservable();

  getById(id: number): MasterList|undefined {
    return this._lists.value.find(l => l.id === id);
  }

  saveList(list: MasterList) {
    const arr = this._lists.value.slice();
    const idx = arr.findIndex(l => l.id === list.id);
    if (idx >= 0) {
      arr[idx] = list;
    } else {
      list.id = Math.max(0, ...arr.map(l => l.id)) + 1;
      arr.push(list);
    }
    this._lists.next(arr);
  }

  deleteList(id: number) {
    this._lists.next(this._lists.value.filter(l => l.id !== id));
  }
}
