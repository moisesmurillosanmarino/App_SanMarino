// src/app/features/lote-reproductora/lote-reproductora-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoteReproductoraListComponent } from './pages/lote-reproductora-list/lote-reproductora-list.component';

const routes: Routes = [
  { path: '', component: LoteReproductoraListComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LoteReproductoraRoutingModule {}
