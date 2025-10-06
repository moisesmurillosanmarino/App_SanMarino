// src/app/features/dashboard/dashboard.component.ts
import { Component, OnInit, OnDestroy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../../shared/components/sidebar/sidebar.component';
import { LazyObserveDirective } from '../../shared/directives/lazy-observe.directive';
import { NgChartsModule } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';

import { UserService, UserListItem } from '../../core/services/user/user.service';
import { FarmService, FarmDto } from '../farm/services/farm.service';
import { LoteReproductoraService, LoteDto, LoteDtoExtendido } from '../lote-reproductora/services/lote-reproductora.service';
import { LoteProduccionService, LoteProduccionDto } from '../lote-produccion/services/lote-produccion.service';
import { SeguimientoLoteLevanteService, SeguimientoLoteLevanteDto } from '../lote-levante/services/seguimiento-lote-levante.service';

import { forkJoin, of, interval, Subscription } from 'rxjs';
import { catchError, finalize, map, switchMap, startWith } from 'rxjs/operators';

interface Activity { time: string; description: string; }
interface DailyLog { date: string; entries: number; }
interface FarmStat { name: string; production: number; }
interface Mortality { date: string; deaths: number; }

type SectionKey = 'summary' | 'activities' | 'daily' | 'production' | 'mortality';

@Component({
  standalone: true,
  selector: 'app-dashboard',
  imports: [CommonModule, SidebarComponent, LazyObserveDirective, NgChartsModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {
  // loading por bloque
  loadingSummary = true;
  loadingActivities = false;
  loadingDaily = false;
  loadingProduction = false;
  loadingMortality = false;

  // errores por bloque
  errorSummary: string | null = null;
  errorActivities: string | null = null;
  errorDaily: string | null = null;
  errorProduction: string | null = null;
  errorMortality: string | null = null;

  // datos
  activities: Activity[] = [];
  dailyLogs: DailyLog[] = [];
  farms: FarmStat[] = [];
  mortalities: Mortality[] = [];
  averageProduction = 0;

  // contadores
  totalUsers = 0;
  activeUsers = 0;
  totalFarms = 0;
  totalLotes = 0;

  // caches
  private lotesIndex = new Map<string, LoteDto>();
  private farmsIndex = new Map<number, FarmDto>();

  // Real-time updates
  private refreshSubscription?: Subscription;
  private readonly REFRESH_INTERVAL = 30000; // 30 segundos

  // Signals para estado reactivo
  isRealTimeEnabled = signal(true);
  lastUpdated = signal<Date>(new Date());

  // Chart configurations
  public lineChartType: ChartType = 'line';
  public barChartType: ChartType = 'bar';
  public doughnutChartType: ChartType = 'doughnut';
  public pieChartType: ChartType = 'pie';

  // Chart options
  public chartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      }
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };

  public doughnutOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
      }
    }
  };

  // Chart data
  public dailyRegistersChart: ChartData<'line'> = {
    labels: [],
    datasets: [{
      label: 'Registros Diarios',
      data: [],
      borderColor: '#d32f2f',
      backgroundColor: 'rgba(211, 47, 47, 0.1)',
      tension: 0.4,
      fill: true
    }]
  };

  public productionChart: ChartData<'bar'> = {
    labels: [],
    datasets: [{
      label: 'Producción por Granja',
      data: [],
      backgroundColor: [
        '#d32f2f',
        '#f6d860',
        '#16a34a',
        '#3b82f6',
        '#8b5cf6',
        '#f59e0b',
        '#ef4444',
        '#06b6d4'
      ]
    }]
  };

  public mortalityChart: ChartData<'doughnut'> = {
    labels: [],
    datasets: [{
      label: 'Mortalidad por Fecha',
      data: [],
      backgroundColor: [
        '#ef4444',
        '#f97316',
        '#eab308',
        '#84cc16',
        '#22c55e',
        '#06b6d4',
        '#3b82f6',
        '#8b5cf6'
      ]
    }]
  };

  public farmDistributionChart: ChartData<'pie'> = {
    labels: [],
    datasets: [{
      label: 'Distribución de Lotes por Granja',
      data: [],
      backgroundColor: [
        '#d32f2f',
        '#f6d860',
        '#16a34a',
        '#3b82f6',
        '#8b5cf6',
        '#f59e0b'
      ]
    }]
  };

  constructor(
    private userSvc: UserService,
    private farmSvc: FarmService,
    private loteRepSvc: LoteReproductoraService,
    private loteProdSvc: LoteProduccionService,
    private levanteSvc: SeguimientoLoteLevanteService
  ) {}

  // ============ helpers error =============
  private describeError(err: unknown, fallback = 'No se pudo cargar la información'): string {
    const anyErr = err as any;
    const status: number | undefined = anyErr?.status ?? anyErr?.code;
    const msg: string | undefined = anyErr?.error?.message || anyErr?.error?.error || anyErr?.message;
    const base = msg ? `${fallback}: ${msg}` : fallback;
    return status ? `${base} (HTTP ${status})` : base;
  }

  private setError(section: SectionKey, message: string | null) {
    switch (section) {
      case 'summary':    this.errorSummary = message; break;
      case 'activities': this.errorActivities = message; break;
      case 'daily':      this.errorDaily = message; break;
      case 'production': this.errorProduction = message; break;
      case 'mortality':  this.errorMortality = message; break;
    }
  }

  // ============ init ============
  ngOnInit(): void {
    this.loadSummary();
    this.startRealTimeUpdates();
  }

  ngOnDestroy(): void {
    this.stopRealTimeUpdates();
  }

  // ============ Real-time updates ============
  private startRealTimeUpdates(): void {
    if (!this.isRealTimeEnabled()) return;
    
    this.refreshSubscription = interval(this.REFRESH_INTERVAL)
      .pipe(startWith(0))
      .subscribe(() => {
        this.refreshAllData();
        this.lastUpdated.set(new Date());
      });
  }

  private stopRealTimeUpdates(): void {
    this.refreshSubscription?.unsubscribe();
  }

  public toggleRealTime(): void {
    this.isRealTimeEnabled.update(enabled => !enabled);
    if (this.isRealTimeEnabled()) {
      this.startRealTimeUpdates();
    } else {
      this.stopRealTimeUpdates();
    }
  }

  public refreshAllData(): void {
    // Solo refrescar si no hay errores críticos
    if (!this.errorSummary) {
      this.loadSummary();
    }
    
    // Refrescar secciones visibles
    if (this.activities.length && !this.errorActivities) {
      this.activities = [];
      this.onActivitiesVisible();
    }
    
    if (this.dailyLogs.length && !this.errorDaily) {
      this.dailyLogs = [];
      this.onDailyVisible();
    }
    
    if (this.farms.length && !this.errorProduction) {
      this.farms = [];
      this.onProductionVisible();
    }
    
    if (this.mortalities.length && !this.errorMortality) {
      this.mortalities = [];
      this.onMortalityVisible();
    }
  }

  // ============ SUMMARY ============
  private loadSummary(): void {
    this.loadingSummary = true;
    this.errorSummary = null;
    const summaryErrParts: string[] = [];

    forkJoin({
      users: this.userSvc.getAll().pipe(
        catchError((err) => { 
          console.error('Dashboard: Error cargando usuarios:', err);
          summaryErrParts.push('usuarios'); 
          return of([] as UserListItem[]); 
        })
      ),
      farms: this.farmSvc.getAll().pipe(
        catchError((err) => { 
          console.error('Dashboard: Error cargando granjas:', err);
          summaryErrParts.push('granjas'); 
          return of([] as FarmDto[]); 
        })
      ),
      lotes: this.loteRepSvc.getLotes().pipe(
        catchError((err) => { 
          console.error('Dashboard: Error cargando lotes:', err);
          summaryErrParts.push('lotes'); 
          return of([] as LoteDto[]); 
        })
      ),
    })
    .pipe(finalize(() => { this.loadingSummary = false; }))
    .subscribe({
      next: ({ users, farms, lotes }: { users: UserListItem[]; farms: FarmDto[]; lotes: LoteDto[] | readonly LoteDto[] }) => {
        lotes = [...lotes]; // Ensure lotes is mutable
        // índices
        this.farmsIndex.clear(); this.lotesIndex.clear();
        farms.forEach(f => this.farmsIndex.set(f.id, f));
        lotes.forEach(l => this.lotesIndex.set(l.loteId, l));

        this.totalUsers = users.length;
        this.activeUsers = users.filter(u => u.isActive).length;
        this.totalFarms = farms.length;
        this.totalLotes = lotes.length;
        
        // Actualizar gráfica de distribución de granjas
        this.updateFarmDistributionChart();

        if (summaryErrParts.length) {
          this.errorSummary = `Algunos datos no cargaron: ${summaryErrParts.join(', ')}.`;
        }
      },
      error: (err: unknown) => {
        console.error('Dashboard: Error crítico en loadSummary:', err);
        this.setError('summary', this.describeError(err));
      }
    });
  }

  // ============ HANDLERS LAZY ============
  onActivitiesVisible(): void {
    if (this.loadingActivities || this.activities.length) return;
    this.loadingActivities = true;
    this.errorActivities = null;

    forkJoin({
      lotes: of(this.lotesIndex.size ? Array.from(this.lotesIndex.values()) : []).pipe(
        switchMap((ls: LoteDto[]) => ls.length
          ? of(ls)
          : this.loteRepSvc.getLotes().pipe(
              catchError((err) => { this.setError('activities', this.describeError(err, 'Fallo al cargar lotes')); return of([] as LoteDto[]); })
            )
        )
      ),
      levante: this.levanteSvc.getAll().pipe(
        catchError((err) => { this.setError('activities', this.describeError(err, 'Fallo al cargar actividades (levante)')); return of([] as SeguimientoLoteLevanteDto[]); })
      )
    })
    .pipe(finalize(() => this.loadingActivities = false))
    .subscribe({
      next: ({ lotes, levante }: { lotes: readonly LoteDto[] | LoteDto[]; levante: SeguimientoLoteLevanteDto[] }) => {
        lotes = [...lotes]; // Ensure lotes is mutable
        if (!this.lotesIndex.size) lotes.forEach(l => this.lotesIndex.set(l.loteId, l));

        const actsLevante: Activity[] = (levante ?? [])
          .sort((a: SeguimientoLoteLevanteDto, b: SeguimientoLoteLevanteDto) =>
            +new Date(b.fechaRegistro) - +new Date(a.fechaRegistro)
          )
          .slice(0, 12)
          .map((s: SeguimientoLoteLevanteDto) => ({
            time: new Date(s.fechaRegistro).toLocaleString(),
            description: `Levante – Lote ${s.loteId}: Consumo ${s.consumoKgHembras} kg, Mort H ${s.mortalidadHembras}, Mort M ${s.mortalidadMachos}`
          }));

        this.activities = actsLevante;
      },
      error: (err: unknown) => this.setError('activities', this.describeError(err))
    });
  }

  onDailyVisible(): void {
    if (this.loadingDaily || this.dailyLogs.length) return;
    this.loadingDaily = true;
    this.errorDaily = null;

    this.levanteSvc.getAll().pipe(
      map((rows: SeguimientoLoteLevanteDto[]) => {
        const mapByDate = new Map<string, number>();
        for (const r of rows ?? []) {
          const d = (r.fechaRegistro || '').slice(0, 10);
          if (!d) continue;
          mapByDate.set(d, (mapByDate.get(d) || 0) + 1);
        }
        const list: DailyLog[] = Array.from(mapByDate.entries())
          .map(([date, entries]) => ({ date, entries }))
          .sort((a: DailyLog, b: DailyLog) => a.date < b.date ? 1 : -1)
          .slice(0, 7);
        
        // Actualizar gráfica de registros diarios
        this.updateDailyRegistersChart(list);
        
        return list;
      }),
      catchError((err) => {
        this.setError('daily', this.describeError(err, 'Fallo al cargar registros diarios'));
        return of([] as DailyLog[]);
      }),
      finalize(() => this.loadingDaily = false)
    )
    .subscribe({
      next: (list: DailyLog[]) => { this.dailyLogs = list; },
      error: (err: unknown) => this.setError('daily', this.describeError(err))
    });
  }

  onProductionVisible(): void {
    if (this.loadingProduction || this.farms.length) return;
    this.loadingProduction = true;
    this.errorProduction = null;

    const lotesArr = this.lotesIndex.size ? Array.from(this.lotesIndex.values()) : [];
    const sample = lotesArr.slice(0, 10);

    const loadLotes$ = sample.length
      ? of(sample)
      : this.loteRepSvc.getLotes().pipe(
          map((ls: readonly LoteDto[]) => [...ls].slice(0, 10)),
          catchError((err) => { this.setError('production', this.describeError(err, 'Fallo al cargar lotes')); return of([] as LoteDto[]); })
        );

    loadLotes$.pipe(
      switchMap((lotes: LoteDto[]) => {
        if (!lotes.length) return of([] as { lote: LoteDto; data: LoteProduccionDto[] }[]);
        return forkJoin(
          lotes.map((l) =>
            this.loteProdSvc.getByLote(l.loteId).pipe(
              catchError((err) => {
                this.setError('production', this.describeError(err, `Fallo al cargar producción del lote ${l.loteId}`));
                return of([] as LoteProduccionDto[]);
              }),
              map((data: LoteProduccionDto[]) => ({ lote: l, data }))
            )
          )
        );
      }),
      finalize(() => this.loadingProduction = false)
    )
    .subscribe({
      next: (packs: { lote: LoteDto; data: LoteProduccionDto[] }[]) => {
        const byFarm = new Map<number, number>();
        for (const { lote, data } of packs) {
          const sumInc = data.reduce((s, x) => s + (x.huevoInc || 0), 0);
          byFarm.set(lote.granjaId, (byFarm.get(lote.granjaId) || 0) + sumInc);
        }
        const items: FarmStat[] = Array.from(byFarm.entries()).map(([farmId, inc]) => ({
          name: this.farmsIndex.get(farmId)?.name || `Granja ${farmId}`,
          production: inc
        }));

        const max = items.reduce((m, i) => Math.max(m, i.production), 0) || 1;
        this.farms = items
          .map(i => ({ name: i.name, production: Math.round((i.production / max) * 100) }))
          .sort((a, b) => b.production - a.production);

        const total = this.farms.reduce((s, f) => s + f.production, 0);
        this.averageProduction = this.farms.length ? Math.round(total / this.farms.length) : 0;
        
        // Actualizar gráfica de producción
        this.updateProductionChart(this.farms);
      },
      error: (err: unknown) => this.setError('production', this.describeError(err))
    });
  }

  onMortalityVisible(): void {
    if (this.loadingMortality || this.mortalities.length) return;
    this.loadingMortality = true;
    this.errorMortality = null;

    forkJoin({
      lotes: this.loteRepSvc.getLotes().pipe(
        map((ls: readonly LoteDto[]) => [...ls].slice(0, 10)),
        catchError((err) => { this.setError('mortality', this.describeError(err, 'Fallo al cargar lotes')); return of([] as LoteDto[]); })
      ),
      levante: this.levanteSvc.getAll().pipe(
        catchError((err) => { this.setError('mortality', this.describeError(err, 'Fallo al cargar levante')); return of([] as SeguimientoLoteLevanteDto[]); })
      )
    }).pipe(
      switchMap(({ lotes, levante }: { lotes: LoteDto[]; levante: SeguimientoLoteLevanteDto[] }) => {
        const prods$ = lotes.length
          ? forkJoin(lotes.map((l) =>
              this.loteProdSvc.getByLote(l.loteId).pipe(
                catchError((err) => {
                  this.setError('mortality', this.describeError(err, `Fallo al cargar producción del lote ${l.loteId}`));
                  return of([] as LoteProduccionDto[]);
                })
              )
            ))
          : of([] as LoteProduccionDto[][]);

        return of({ levante }).pipe(
          switchMap((ctx) => prods$.pipe(map((packs) => ({ ...ctx, packs }))))
        );
      }),
      finalize(() => this.loadingMortality = false)
    )
    .subscribe({
      next: ({ levante, packs }: { levante: SeguimientoLoteLevanteDto[]; packs: LoteProduccionDto[][] }) => {
        const byDate = new Map<string, number>();

        for (const s of levante ?? []) {
          const d = (s.fechaRegistro || '').slice(0, 10);
          if (!d) continue;
          const deaths = (s.mortalidadHembras || 0) + (s.mortalidadMachos || 0);
          byDate.set(d, (byDate.get(d) || 0) + deaths);
        }

        for (const arr of packs ?? []) {
          for (const r of arr) {
            const d = (r.fecha || '').slice(0, 10);
            if (!d) continue;
            const deaths = (r.mortalidadH || 0) + (r.mortalidadM || 0);
            byDate.set(d, (byDate.get(d) || 0) + deaths);
          }
        }

        this.mortalities = Array.from(byDate.entries())
          .map(([date, deaths]) => ({ date, deaths }))
          .sort((a, b) => a.date < b.date ? 1 : -1)
          .slice(0, 10);
        
        // Actualizar gráfica de mortalidad
        this.updateMortalityChart(this.mortalities);
      },
      error: (err: unknown) => this.setError('mortality', this.describeError(err))
    });
  }

  // ============ retry ============
  retrySummary()    { this.loadSummary(); }
  retryActivities() { this.activities = []; this.onActivitiesVisible(); }
  retryDaily()      { this.dailyLogs  = []; this.onDailyVisible(); }
  retryProduction() { this.farms      = []; this.averageProduction = 0; this.onProductionVisible(); }
  retryMortality()  { this.mortalities = []; this.onMortalityVisible(); }

  // ============ Chart Updates ============
  private updateDailyRegistersChart(dailyLogs: DailyLog[]): void {
    this.dailyRegistersChart = {
      ...this.dailyRegistersChart,
      labels: dailyLogs.map(d => d.date),
      datasets: [{
        ...this.dailyRegistersChart.datasets[0],
        data: dailyLogs.map(d => d.entries)
      }]
    };
  }

  private updateProductionChart(farms: FarmStat[]): void {
    this.productionChart = {
      ...this.productionChart,
      labels: farms.map(f => f.name),
      datasets: [{
        ...this.productionChart.datasets[0],
        data: farms.map(f => f.production)
      }]
    };
  }

  private updateMortalityChart(mortalities: Mortality[]): void {
    this.mortalityChart = {
      ...this.mortalityChart,
      labels: mortalities.map(m => m.date),
      datasets: [{
        ...this.mortalityChart.datasets[0],
        data: mortalities.map(m => m.deaths)
      }]
    };
  }

  private updateFarmDistributionChart(): void {
    const farmLoteCounts = new Map<string, number>();
    
    // Contar lotes por granja
    Array.from(this.lotesIndex.values()).forEach(lote => {
      const farmName = this.farmsIndex.get(lote.granjaId)?.name || `Granja ${lote.granjaId}`;
      farmLoteCounts.set(farmName, (farmLoteCounts.get(farmName) || 0) + 1);
    });

    const entries = Array.from(farmLoteCounts.entries());
    this.farmDistributionChart = {
      ...this.farmDistributionChart,
      labels: entries.map(([name]) => name),
      datasets: [{
        ...this.farmDistributionChart.datasets[0],
        data: entries.map(([, count]) => count)
      }]
    };
  }

  // ============ Computed Properties ============
  totalAvesActivas = computed(() => {
    return Array.from(this.lotesIndex.values())
      .reduce((total, lote) => {
        const loteExt = lote as any; // Type assertion para acceder a propiedades extendidas
        return total + (loteExt.hembrasL || 0) + (loteExt.machosL || 0);
      }, 0);
  });

  promedioEdadLotes = computed(() => {
    const lotes = Array.from(this.lotesIndex.values());
    if (lotes.length === 0) return 0;
    
    const totalDias = lotes.reduce((sum, lote) => {
      if (!lote.fechaEncaset) return sum;
      const fechaEncaset = new Date(lote.fechaEncaset);
      const hoy = new Date();
      const dias = Math.floor((hoy.getTime() - fechaEncaset.getTime()) / (1000 * 60 * 60 * 24));
      return sum + Math.max(0, dias);
    }, 0);
    
    return Math.round(totalDias / lotes.length);
  });

  eficienciaPromedio = computed(() => {
    if (this.farms.length === 0) return 0;
    return Math.round(this.farms.reduce((sum, f) => sum + f.production, 0) / this.farms.length);
  });

  // ============ TrackBy Functions ============
  trackByActivity(index: number, activity: Activity): string {
    return `${activity.time}-${activity.description}`;
  }
}
