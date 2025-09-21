// src/app/shared/services/menu.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, map, tap } from 'rxjs';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import {
  faTachometerAlt, faClipboardList, faCalendarDay, faChartBar, faHeartbeat,
  faCog, faUsers, faChevronDown, faSignOutAlt, faList, faBuilding,
  faGlobe, faMapMarkerAlt, faCity, faBoxesAlt, faWarehouse
} from '@fortawesome/free-solid-svg-icons';
import { environment } from '../../../environments/environment';

export interface ApiMenuItem {
  id: number;
  label: string;
  icon?: string | null;   // ej: "tachometer-alt"
  route?: string | null;  // ej: "/config/farms-list"
  order: number;
  children: ApiMenuItem[];
}

export interface UiMenuItem {
  label: string;
  icon: IconDefinition | null;
  link?: string[];
  children?: UiMenuItem[];
  expanded?: boolean;
}

const ICON_MAP: Record<string, IconDefinition> = {
  'tachometer-alt': faTachometerAlt,
  'clipboard-list': faClipboardList,
  'calendar-day':   faCalendarDay,
  'chart-bar':      faChartBar,
  'heartbeat':      faHeartbeat,
  'cog':            faCog,
  'users':          faUsers,
  'chevron-down':   faChevronDown,
  'sign-out-alt':   faSignOutAlt,
  'list':           faList,
  'building':       faBuilding,
  'globe':          faGlobe,
  'map-marker-alt': faMapMarkerAlt,
  'city':           faCity,
  'boxes-alt':      faBoxesAlt,
  'warehouse':      faWarehouse
};

function toLinkArray(route?: string | null): string[] | undefined {
  if (!route) return undefined;
  // soporte para rutas tipo "/config/farms-list" o "config/farms-list"
  const clean = route.startsWith('/') ? route.substring(1) : route;
  return ['/', ...clean.split('/')];
}

function mapApiToUi(node: ApiMenuItem): UiMenuItem {
  return {
    label: node.label,
    icon: node.icon ? (ICON_MAP[node.icon] ?? null) : null,
    link: toLinkArray(node.route ?? undefined),
    children: node.children?.map(mapApiToUi) ?? [],
    expanded: false
  };
}

@Injectable({ providedIn: 'root' })
export class MenuService {
  private readonly _menu$ = new BehaviorSubject<UiMenuItem[]>([]);
  public readonly menu$ = this._menu$.asObservable();

  constructor(private http: HttpClient) {}

  /** Llama /api/menu/me y actualiza el BehaviorSubject */
  preloadMyMenu() {
    return this.http.get<ApiMenuItem[]>(`${environment.apiUrl}/menu/me`).pipe(
      map(arr => arr?.map(mapApiToUi) ?? []),
      tap(ui => this._menu$.next(ui))
    );
  }

  /** Permite setear manualmente (tests, etc.) */
  setMenuForTest(items: UiMenuItem[]) {
    this._menu$.next(items);
  }
}
