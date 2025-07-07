// src/app/features/lote-produccion/lote-produccion-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoteProduccionListComponent } from './pages/lote-produccion-list/lote-produccion-list.component';

const routes: Routes = [
  { path: '', component: LoteProduccionListComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LoteProduccionRoutingModule {}
