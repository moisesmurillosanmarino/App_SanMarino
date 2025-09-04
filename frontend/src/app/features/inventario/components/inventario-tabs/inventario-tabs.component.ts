// src/app/features/inventario/components/inventario-tabs/inventario-tabs.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../../../../shared/components/sidebar/sidebar.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faBoxesStacked, faRightLeft, faWarehouse } from '@fortawesome/free-solid-svg-icons';

import { MovimientosFormComponent } from '../movimientos-form/movimientos-form.component';
import { TrasladoFormComponent } from '../traslado-form/traslado-form.component';
import { InventarioListComponent } from '../inventario-list/inventario-list.component';

@Component({
  selector: 'app-inventario-tabs',
  standalone: true,
  imports: [
    CommonModule,
    SidebarComponent,
    FontAwesomeModule,
    MovimientosFormComponent,
    TrasladoFormComponent,
    InventarioListComponent
  ],
  templateUrl: './inventario-tabs.component.html',
  styleUrls: ['./inventario-tabs.component.scss']
})
export class InventarioTabsComponent {
  faBoxes = faBoxesStacked;
  faSwap  = faRightLeft;
  faWare  = faWarehouse;

  activeTab: 'mov' | 'tras' | 'stock' = 'mov';
  setTab(tab: 'mov' | 'tras' | 'stock') { this.activeTab = tab; }
}
