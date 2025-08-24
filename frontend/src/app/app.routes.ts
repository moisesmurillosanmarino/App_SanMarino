import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login.component';

const routes: Routes = [
  // Redirige la ruta raíz a /login
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  // Define la ruta de login
  { path: 'login', component: LoginComponent },
  // Tus otras rutas...
  // { path: 'home', component: HomeComponent },
  // { path: '**', redirectTo: 'login' } // opcional: todo lo demás a login
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
 