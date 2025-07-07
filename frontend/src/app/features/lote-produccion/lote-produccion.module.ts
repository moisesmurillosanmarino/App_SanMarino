// src/app/features/lote-produccion/lote-produccion.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoteProduccionRoutingModule } from './lote-produccion-routing.module';
import { LoteProduccionListComponent } from './pages/lote-produccion-list/lote-produccion-list.component';

@NgModule({
  imports: [
    CommonModule,
    LoteProduccionRoutingModule,
    LoteProduccionListComponent
  ]
})
export class LoteProduccionModule {}
