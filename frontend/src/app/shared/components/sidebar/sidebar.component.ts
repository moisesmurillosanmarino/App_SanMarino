// src/app/shared/components/sidebar/sidebar.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FontAwesomeModule, FaIconLibrary } from '@fortawesome/angular-fontawesome';
import {
  faTachometerAlt,
  faClipboardList,
  faCalendarDay,
  faChartBar,
  faHeartbeat,
  faCog,
  faUsers,
  faChevronDown,
  faSignOutAlt,
  faList,
  faBuilding,
  faGlobe,
  faMapMarkerAlt,
  faCity,
  faBoxesAlt,
  faWarehouse
} from '@fortawesome/free-solid-svg-icons';
import { map } from 'rxjs/operators';
import { AuthService } from '../../../core/auth/auth.service';

interface MenuItem {
  label:     string;
  icon:      any;
  link?:     string[];
  children?: MenuItem[];
  expanded?: boolean;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, FontAwesomeModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent {
  // Íconos
  faChevronDown   = faChevronDown;
  faSignOutAlt    = faSignOutAlt;
  faTachometerAlt = faTachometerAlt;
  faClipboardList = faClipboardList;
  faCalendarDay   = faCalendarDay;
  faChartBar      = faChartBar;
  faHeartbeat     = faHeartbeat;
  faCog           = faCog;
  faUsers         = faUsers;
  faList          = faList;
  faBuilding      = faBuilding;
  faGlobe         = faGlobe;
  faMapMarkerAlt  = faMapMarkerAlt;
  faCity          = faCity;
  faWarehouse     = faWarehouse;
  faBoxesAlt      = faBoxesAlt;

  /** Menú principal */
  public menuItems: MenuItem[] = [
    { label: 'Dashboard', icon: this.faTachometerAlt, link: ['/dashboard'] },

    // Elementos fuera de configuración
    { label: 'Granjas',   icon: this.faBuilding,  link: ['/config','farms-list'] },
    { label: 'Núcleos',   icon: this.faWarehouse, link: ['/config','nucleos'] },
    { label: 'Galpones',  icon: this.faWarehouse, link: ['/config','galpones'] },
    { label: 'Lotes',     icon: this.faBoxesAlt,  link: ['/config','lotes'] },
    { label: 'Crear lote Reproductora', icon: this.faBoxesAlt, link: ['/daily-log','reproductora'] },

    {
      label: 'Registros Diarios',
      icon: this.faCalendarDay,
      expanded: false,
      children: [
        { label: 'Seguimiento Diario de Levante',    icon: this.faBoxesAlt, link: ['/daily-log','seguimiento'] },
        { label: 'Seguimiento Diario de Producción', icon: this.faBoxesAlt, link: ['/daily-log','produccion'] }
      ]
    },

    {
      label: 'Configuración',
      icon: this.faCog,
      children: [
        { label: 'Listas maestras',  icon: this.faList,        link: ['/config','master-lists'] },
        { label: 'Usuarios',         icon: this.faUsers,       link: ['/config','users'] },
        { label: 'Roles y permisos', icon: this.faUsers,       link: ['/config','role-management'] },
        { label: 'Geografía',           icon: this.faGlobe,       link: ['/config','countries'] },
        //{ label: 'Departamentos',    icon: this.faMapMarkerAlt,link: ['/config','departments'] },
       // { label: 'Ciudades',         icon: this.faCity,        link: ['/config','cities'] },
        { label: 'Empresas',         icon: this.faBuilding,    link: ['/config','companies'] },
         // 👇 NUEVO: Catálogo de Alimentos
        { label: 'Catálogo de alimentos', icon: this.faList, link: ['/config','catalogo-alimentos'] }
      ]
    }
  ];

  /**
   * Datos para el banner “Bienvenido”.
   * Provienen de la sesión guardada por AuthService/TokenStorageService.
   */
  userBanner$ = this.auth.session$.pipe(
    map(s => ({
      fullName: s?.user.fullName ?? s?.user.username ?? 'Usuario',
      company:  s?.activeCompany ?? (s?.companies?.[0] ?? '—'),
      initials: (s?.user.fullName ?? s?.user.username ?? 'U')
                  .trim()
                  .split(/\s+/)
                  .map(w => w[0])
                  .join('')
                  .slice(0, 2)
                  .toUpperCase()
    }))
  );

  constructor(
    library: FaIconLibrary,
    private router: Router,
    private auth: AuthService
  ) {
    library.addIcons(
      faTachometerAlt,
      faClipboardList,
      faCalendarDay,
      faChartBar,
      faHeartbeat,
      faCog,
      faUsers,
      faChevronDown,
      faSignOutAlt,
      faList,
      faBuilding,
      faGlobe,
      faMapMarkerAlt,
      faCity,
      faWarehouse,
      faBoxesAlt
    );
  }

  toggle(item: MenuItem) {
    item.expanded = !item.expanded;
  }

  /** Cierra sesión: limpia token + navegación a /login */
  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
