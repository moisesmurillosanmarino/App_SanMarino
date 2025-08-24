import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule }    from '@angular/common/http';

// Auth / Dashboard / Configuración
import { LoginComponent }             from './features/auth/login/login.component';
import { DashboardComponent }         from './features/dashboard/dashboard.component';
import { ConfigComponent }            from './features/config/config.component';
import { MasterListsComponent }       from './features/config/master-lists/master-lists.component';
import { ListDetailComponent }        from './features/config/master-lists/list-detail/list-detail.component';
import { CompanyManagementComponent } from './features/config/company-management/company-management.component';
import { RoleManagementComponent }    from './features/config/role-management/role-management.component';

// Geografía
import { CountryListComponent }       from './features/config/geography/country-list/country-list.component';
import { CountryDetailComponent }     from './features/config/geography/country-detail/country-detail.component';
import { StateListComponent }         from './features/config/geography/state-list/state-list.component';
import { StateDetailComponent }       from './features/config/geography/state-detail/state-detail.component';
import { DepartmentListComponent }    from './features/config/geography/department-list/department-list.component';
import { DepartmentDetailComponent }  from './features/config/geography/department-detail/department-detail.component';
import { CityListComponent }          from './features/config/geography/city-list/city-list.component';
import { CityDetailComponent }        from './features/config/geography/city-detail/city-detail.component';

// Granjas / Núcleos / Galpones / Lotes
import { FarmListComponent }   from './features/farm/components/farm-list/farm-list.component';
import { FarmFormComponent }   from './features/farm/components/farm-form/farm-form.component';
import { NucleoListComponent } from './features/nucleo/components/nucleo-list/nucleo-list.component';
import { NucleoFormComponent } from './features/nucleo/components/nucleo-form/nucleo-form.component';
import { GalponListComponent } from './features/galpon/components/galpon-list/galpon-list.component';
import { GalponFormComponent } from './features/galpon/components/galpon-form/galpon-form.component';
import { LoteListComponent }   from './features/lote/components/lote-list/lote-list.component';
import { LoteFormComponent }   from './features/lote/components/lote-form/lote-form.component';
import { UserManagementComponent } from './features/config/user-management/user-management.component';

export const appConfig: ApplicationConfig = {
  providers: [
    importProvidersFrom(
      ReactiveFormsModule,
      HttpClientModule
    ),
    provideRouter([
      // público
      { path: '', redirectTo: 'login', pathMatch: 'full' },
      { path: 'login',    component: LoginComponent },
      { path: 'dashboard', component: DashboardComponent },
      {
        path: 'daily-log',
        children: [
          { path: '', redirectTo: 'seguimiento', pathMatch: 'full' },
          {
            path: 'seguimiento',
            loadChildren: () =>
              import('./features/lote-levante/seguimiento-lote-levante.module')
              .then(m => m.SeguimientoLoteLevanteModule)
          },
          {
            path: 'produccion',
            loadChildren: () =>
              import('./features/lote-produccion/lote-produccion.module')
              .then(m => m.LoteProduccionModule)
          },
          {
            path: 'reproductora',
            loadChildren: () =>
              import('./features/lote-reproductora/lote-reproductora.module')
              .then(m => m.LoteReproductoraModule)
          }
        ]
      },
      // config
      {
        path: 'config',
        component: ConfigComponent,
        children: [
          // configuración previa...
          { path: 'master-lists',     component: MasterListsComponent },
          { path: 'master-lists/new', component: ListDetailComponent },
          { path: 'master-lists/:id', component: ListDetailComponent },

          { path: 'companies',       component: CompanyManagementComponent },
          { path: 'role-management', component: RoleManagementComponent },
          { path: 'users',           component: UserManagementComponent },

          // geografía
          { path: 'countries',       component: CountryListComponent },
          { path: 'countries/new',   component: CountryDetailComponent },
          { path: 'countries/:id',   component: CountryDetailComponent },
          { path: 'states',          component: StateListComponent },
          { path: 'states/new',      component: StateDetailComponent },
          { path: 'states/:id',      component: StateDetailComponent },
          { path: 'departments',     component: DepartmentListComponent },
          { path: 'departments/new', component: DepartmentDetailComponent },
          { path: 'departments/:id', component: DepartmentDetailComponent },
          { path: 'cities',          component: CityListComponent },
          { path: 'cities/new',      component: CityDetailComponent },
          { path: 'cities/:id',      component: CityDetailComponent },

          // CRUD Granjas
          { path: 'farms-list',             component: FarmListComponent },
          { path: 'farms-list/new',         component: FarmFormComponent },
          { path: 'farms-list/:id/edit',    component: FarmFormComponent },

          // Núcleos dentro de una granja
          { path: 'nucleos',           component: NucleoListComponent },
          { path: 'nucleos/new',       component: NucleoFormComponent },
          { path: 'nucleos/:nucleoId', component: NucleoFormComponent },

          // Galpones dentro de un núcleo
          { path: 'galpones',           component: GalponListComponent },
          { path: 'galpones/new',       component: GalponFormComponent },
          { path: 'galpones/:galponId', component: GalponFormComponent },

          // Lotes
          { path: 'lotes',      component: LoteListComponent },
          { path: 'lotes/new',  component: LoteFormComponent },
          { path: 'lotes/:id',  component: LoteFormComponent },

          // defecto
          { path: '', redirectTo: 'farms-list', pathMatch: 'full' }
        ]
      }
    ])
  ]
};
