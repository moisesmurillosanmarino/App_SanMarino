// src/app/features/dashboard/dashboard.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../../shared/components/sidebar/sidebar.component';
import { LazyObserveDirective } from '../../shared/directives/lazy-observe.directive';

import { UserService, UserListItem } from '../../core/services/user/user.service';
import { FarmService, FarmDto } from '../farm/services/farm.service';
import { LoteReproductoraService, LoteDto } from '../lote-reproductora/services/lote-reproductora.service';
import { LoteProduccionService, LoteProduccionDto } from '../lote-produccion/services/lote-produccion.service';
import { SeguimientoLoteLevanteService, SeguimientoLoteLevanteDto } from '../lote-levante/services/seguimiento-lote-levante.service';

import { forkJoin, of } from 'rxjs';
import { catchError, finalize, map, switchMap } from 'rxjs/operators';

interface Activity { time: string; description: string; }
interface DailyLog { date: string; entries: number; }
interface FarmStat { name: string; production: number; }
interface Mortality { date: string; deaths: number; }

type SectionKey = 'summary' | 'activities' | 'daily' | 'production' | 'mortality';

@Component({
  standalone: true,
  selector: 'app-dashboard',
  imports: [CommonModule, SidebarComponent, LazyObserveDirective],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
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
  }

  // ============ SUMMARY ============
  private loadSummary(): void {
    this.loadingSummary = true;
    this.errorSummary = null;
    const summaryErrParts: string[] = [];

    forkJoin({
      users: this.userSvc.getAll().pipe(
        catchError((_err) => { summaryErrParts.push('usuarios'); return of([] as UserListItem[]); })
      ),
      farms: this.farmSvc.getAll().pipe(
        catchError((_err) => { summaryErrParts.push('granjas'); return of([] as FarmDto[]); })
      ),
      lotes: this.loteRepSvc.getLotes().pipe(
        catchError((_err) => { summaryErrParts.push('lotes'); return of([] as LoteDto[]); })
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

        if (summaryErrParts.length) {
          this.errorSummary = `Algunos datos no cargaron: ${summaryErrParts.join(', ')}.`;
        }
      },
      error: (err: unknown) => {
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
}
