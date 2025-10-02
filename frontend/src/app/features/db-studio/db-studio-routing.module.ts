// src/app/features/db-studio/db-studio-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ExplorerPage } from './pages/explorer/explorer.page';
import { QueryConsolePage } from './pages/query-console/query-console.page';
import { CreateTablePage } from './pages/create-table/create-table.page';

const routes: Routes = [
  { path: '', component: ExplorerPage },
  { path: 'query', component: QueryConsolePage },
  { path: 'create-table', component: CreateTablePage },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DbStudioRoutingModule {}
