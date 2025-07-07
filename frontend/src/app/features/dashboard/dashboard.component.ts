// src/app/features/dashboard/dashboard.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule }      from '@angular/common';
import { SidebarComponent }  from '../../shared/components/sidebar/sidebar.component';

interface Activity {
  time: string;
  description: string;
}
interface DailyLog {
  date: string;
  entries: number;
}
interface FarmStat {
  name: string;
  production: number; // porcentaje 0–100
}
interface Mortality {
  date: string;
  deaths: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, SidebarComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  activities: Activity[] = [
    { time: '08:00', description: 'Limpieza de galpón A' },
    { time: '09:30', description: 'Verificación de bebederos' },
    { time: '11:15', description: 'Control sanitario – Lote 3' },
    { time: '14:00', description: 'Carga de alimento – Lote 2' },
  ];

  dailyLogs: DailyLog[] = [
    { date: '2025-05-20', entries: 12 },
    { date: '2025-05-19', entries: 18 },
    { date: '2025-05-18', entries: 15 },
    { date: '2025-05-17', entries: 20 },
  ];

  farms: FarmStat[] = [
    { name: 'Granja A', production: 75 },
    { name: 'Granja B', production: 55 },
    { name: 'Granja C', production: 90 },
    { name: 'Granja D', production: 65 },
  ];

  mortalities: Mortality[] = [
    { date: '2025-05-20', deaths: 3 },
    { date: '2025-05-19', deaths: 1 },
    { date: '2025-05-18', deaths: 4 },
    { date: '2025-05-17', deaths: 2 },
  ];

  averageProduction = 0;

  ngOnInit(): void {
    // calcular promedio de producción para evitar expresiones complejas en la plantilla
    const total = this.farms.reduce((sum, f) => sum + f.production, 0);
    this.averageProduction = Math.round(total / this.farms.length);
  }
}