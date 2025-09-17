// src/app/features/inventario/components/kardex-list/kardex-list.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InventarioService, FarmDto, CatalogItemDto, KardexItemDto } from '../../services/inventario.service';

@Component({
  selector: 'app-kardex-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './kardex-list.component.html',
  styleUrls: ['./kardex-list.component.scss']
})
export class KardexListComponent {
  farms: FarmDto[] = [];
  items: CatalogItemDto[] = [];
  kardex: KardexItemDto[] = [];
  loading = false;

  farmId: number | null = null;
  itemId: number | null = null;
  desde: string | null = null;
  hasta: string | null = null;

  constructor(private invSvc: InventarioService) {
    this.invSvc.getFarms().subscribe(f => this.farms = f);
    this.invSvc.getCatalogo().subscribe(c => this.items = c.filter(x => x.activo));
  }

  load() {
    if (!this.farmId || !this.itemId) return;
    this.loading = true;
    this.invSvc.getKardex(this.farmId, this.itemId, this.desde || undefined, this.hasta || undefined)
      .subscribe({
        next: (rows) => { this.kardex = rows; this.loading = false; },
        error: () => { this.loading = false; }
      });
  }

  get signClass() {
    return (qty: number) => qty > 0 ? 'text-green' : qty < 0 ? 'text-red' : '';
  }
}
