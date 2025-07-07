// src/app/features/lote-reproductora/lote-reproductora.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoteReproductoraRoutingModule } from './lote-reproductora-routing.module';
import { LoteReproductoraListComponent } from './pages/lote-reproductora-list/lote-reproductora-list.component';

@NgModule({
  imports: [
    CommonModule,
    LoteReproductoraRoutingModule,
    LoteReproductoraListComponent
  ]
})
export class LoteReproductoraModule {}
