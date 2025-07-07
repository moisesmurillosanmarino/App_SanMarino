// src/app/features/farm/farm-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FarmListComponent } from './components/farm-list/farm-list.component';
import { FarmFormComponent } from './components/farm-form/farm-form.component';

const routes: Routes = [
  { path: '',       component: FarmListComponent },
  { path: 'new',    component: FarmFormComponent },
  { path: ':id',    component: FarmFormComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FarmRoutingModule {}
