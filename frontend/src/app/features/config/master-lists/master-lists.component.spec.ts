// src/app/features/config/master-lists/master-lists.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule }         from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FontAwesomeModule, FaIconLibrary } from '@fortawesome/angular-fontawesome';
import {
  faList,
  faEye,
  faPen,    // icono para editar
  faTrash   // icono para eliminar
} from '@fortawesome/free-solid-svg-icons';

interface MasterList {
  key: string;
  name: string;
  options: string[];
  expanded?: boolean;
}

@Component({
  selector: 'app-master-lists',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FontAwesomeModule
  ],
  templateUrl: './master-lists.component.html',
  styleUrls: ['./master-lists.component.scss']
})
export class MasterListsComponent implements OnInit {
  // === Iconos públicos para la plantilla ===
  public faList  = faList;
  public faEye   = faEye;
  public faPen   = faPen;
  public faTrash = faTrash;

  // === Datos de ejemplo ===
  public lists: MasterList[] = [
    {
      key: 'ciudades',
      name: 'Ciudades',
      options: ['Bogotá','Medellín','Cali'],
      expanded: false
    },
    {
      key: 'tiposIdent',
      name: 'Tipo de Identificación',
      options: ['Cédula','Pasaporte'],
      expanded: false
    }
  ];

  constructor(
    private router: Router,
    library: FaIconLibrary
  ) {
    // ✅ Registramos los iconos
    library.addIcons(faList, faEye, faPen, faTrash);
  }

  ngOnInit(): void {}

  /** Alterna despliegue de las opciones de la lista */
  public toggleOptions(list: MasterList): void {
    list.expanded = !list.expanded;
  }

  /** Navega a la página de edición/detalle de esta lista */
  public edit(list: MasterList): void {
    this.router.navigate(['/config/master-lists', list.key]);
  }

  /** Elimina la lista de la vista */
  public delete(list: MasterList): void {
    this.lists = this.lists.filter(l => l.key !== list.key);
  }
}
