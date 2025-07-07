// src/app/app.component.ts
import { Component }   from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent }   from './shared/components/sidebar/sidebar.component';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet,SidebarComponent],
  template: `<router-outlet></router-outlet>`
})
export class AppComponent {}
