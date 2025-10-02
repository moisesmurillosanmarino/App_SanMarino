import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { expand, finalize, map, reduce } from 'rxjs/operators';

import { SidebarComponent } from '../../../../shared/components/sidebar/sidebar.component';

import { GalponService } from '../../../galpon/services/galpon.service';
import { GalponDetailDto } from '../../../galpon/models/galpon.models';

import { LoteService, LoteDto, LoteMortalidadResumenDto } from '../../../lote/services/lote.service';

import {
  SeguimientoLoteLevanteService,
  SeguimientoLoteLevanteDto,
  CreateSeguimientoLoteLevanteDto,
  UpdateSeguimientoLoteLevanteDto
} from '../../services/seguimiento-lote-levante.service';

import { FarmService, FarmDto } from '../../../farm/services/farm.service';
import { NucleoService, NucleoDto } from '../../services/nucleo.service';
import { SeguimientoCalculosComponent } from "../../seguimiento-calculos/seguimiento-calculos.component";
import { LiquidacionTecnicaComponent } from '../../components/liquidacion-tecnica/liquidacion-tecnica.component';

// ===== Importa el servicio del catálogo =====
import {
  CatalogoAlimentosService,
  CatalogItemDto,
  PagedResult
} from '../../../catalogo-alimentos/services/catalogo-alimentos.service';
import { EMPTY } from 'rxjs';

  

@Component({
  selector: 'app-seguimiento-lote-levante-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, SidebarComponent, SeguimientoCalculosComponent, LiquidacionTecnicaComponent],
  templateUrl: './seguimiento-lote-levante-list.component.html',
  styleUrls: ['./seguimiento-lote-levante-list.component.scss']
})
export class SeguimientoLoteLevanteListComponent implements OnInit {
  // ================== constantes / sentinelas ==================
  readonly SIN_GALPON = '__SIN_GALPON__';

  // ================== catálogos (BACKEND) ==================
  alimentosCatalog: CatalogItemDto[] = [];
  private alimentosByCode = new Map<string, CatalogItemDto>();
  private alimentosById = new Map<number, CatalogItemDto>();

  private alimentosByName = new Map<string, CatalogItemDto>(); // nombre en minúsculas


  // ================== catálogos (otros) ==================
  granjas: FarmDto[] = [];
  nucleos: NucleoDto[] = [];
  galpones: Array<{ id: string; label: string }> = [];

  // ================== selección / filtro ==================
  selectedGranjaId: number | null = null;
  selectedNucleoId: string | null = null;

  selectedGalponId: string | null = null;
  selectedLoteId: string | null = null;

  // ================== datos ==================
  private allLotes: LoteDto[] = [];
  lotes: LoteDto[] = [];
  seguimientos: SeguimientoLoteLevanteDto[] = [];

  selectedLote?: LoteDto;
  resumenSelected: LoteMortalidadResumenDto | null = null;

  // ================== UI ==================
  loading = false;
  modalOpen = false;
  editing: SeguimientoLoteLevanteDto | null = null;
  hasSinGalpon = false;

  activeTab: 'principal' | 'calculos' | 'liquidacion' = 'principal';

  // ================== formulario modal ==================
  form!: FormGroup;

  private galponNameById = new Map<string, string>();

  constructor(
    private fb: FormBuilder,
    private farmSvc: FarmService,
    private nucleoSvc: NucleoService,
    private loteSvc: LoteService,
    private segSvc: SeguimientoLoteLevanteService,
    private galponSvc: GalponService,
    // servicio de catálogo
    private catalogSvc: CatalogoAlimentosService,
  ) {}

  // ================== INIT ==================
  ngOnInit(): void {
    // cargar catálogos de granjas, etc.
    this.farmSvc.getAll().subscribe({
      next: fs => (this.granjas = fs || []),
      error: () => (this.granjas = [])
    });

    // form
    this.form = this.fb.group({
      // YYYY-MM-DD estable para <input type="date">
      fechaRegistro:      [this.todayYMD(), Validators.required],
      loteId:             ['', Validators.required],
      mortalidadHembras:  [0, [Validators.required, Validators.min(0)]],
      mortalidadMachos:   [0, [Validators.required, Validators.min(0)]],
      selH:               [0, [Validators.required, Validators.min(0)]],
      selM:               [0, [Validators.required, Validators.min(0)]],
      errorSexajeHembras: [0, [Validators.required, Validators.min(0)]],
      errorSexajeMachos:  [0, [Validators.required, Validators.min(0)]],
      // LEGACY: tipoAlimento (se mantiene por compatibilidad, pero preferir H/M)
      tipoAlimento:       [''],
      consumoKgHembras:   [0, [Validators.required, Validators.min(0)]],
      observaciones:      [''],
      consumoKgMachos: [null, [Validators.min(0)]],
      pesoPromH:       [null, [Validators.min(0)]],
      pesoPromM:       [null, [Validators.min(0)]],
      uniformidadH:    [null, [Validators.min(0), Validators.max(100)]],
      uniformidadM:    [null, [Validators.min(0), Validators.max(100)]],
      cvH:             [null, [Validators.min(0)]],
      cvM:             [null, [Validators.min(0)]],
      // NUEVO: selects ligados al catálogo
      tipoAlimentoHembras: [''],
      tipoAlimentoMachos:  [''],
      consumoAlimentoHembras: [null],
      consumoAlimentoMachos:  [null],
      ciclo: ['Normal'],
    });

    // CARGA CATÁLOGO DE ALIMENTOS (para selects y mapeos en tabla)
    this.loadAlimentosCatalog();
  }

  // ================== CATALOGO ALIMENTOS ==================
  private loadAlimentosCatalog(): void {
    const firstPage = 1;
    const pageSize = 100; // ajusta si tu API permite más

    this.catalogSvc.list('', firstPage, pageSize).pipe(
      // si aún faltan páginas, sigue pidiéndolas
      expand((res: PagedResult<CatalogItemDto>) => {
        const received = res.page * res.pageSize;
        const more = received < (res.total ?? 0);
        return more
          ? this.catalogSvc.list('', res.page + 1, res.pageSize)
          : EMPTY;
      }),
      // acumula todos los items de todas las páginas
      reduce((acc: CatalogItemDto[], res: PagedResult<CatalogItemDto>) => {
        const items = Array.isArray(res.items) ? res.items : [];
        return acc.concat(items);
      }, []),
      // ordena por nombre (opcional)
      map(all => all.sort((a, b) =>
        (a.nombre || '').localeCompare(b.nombre || '', 'es', { numeric: true, sensitivity: 'base' })
      ))
    ).subscribe(all => {
      this.alimentosCatalog = all;

      // reconstruye índices
      this.alimentosById.clear();
      this.alimentosByCode.clear();
      this.alimentosByName.clear();

      for (const it of all) {
        if (it.id != null) this.alimentosById.set(it.id, it);
        if (it.codigo)     this.alimentosByCode.set(String(it.codigo).trim(), it);
        if (it.nombre)     this.alimentosByName.set(it.nombre.trim().toLowerCase(), it);
      }
    });
  }

  // Dado un string (código) o número (id), devolver el nombre del alimento
  mapAlimentoNombre = (value?: string | number | null): string => {
    if (value == null || value === '') return '';
    // si vino un número (id)
    if (typeof value === 'number') {
      const f = this.alimentosById.get(value);
      return f?.nombre || String(value);
    }
    // si vino un string (guardamos códigos como strings)
    const k = value.toString().trim();
    // 1) buscar por código
    const found = this.alimentosByCode.get(k);
    if (found) return found.nombre || k;
    // 2) a veces el backend pudo guardar el id como string; intentar parsear
    const asId = Number(k);
    if (!Number.isNaN(asId)) {
      const byId = this.alimentosById.get(asId);
      if (byId) return byId.nombre || k;
    }
    // 3) fallback
    return k;
  };

  // ================== CARGA GALPONES ==================
  private loadGalponCatalog(): void {
    this.galponNameById.clear();
    if (!this.selectedGranjaId) return;

    if (this.selectedNucleoId) {
      this.galponSvc.getByGranjaAndNucleo(this.selectedGranjaId, this.selectedNucleoId).subscribe({
        next: rows => this.fillGalponMap(rows),
        error: () => this.galponNameById.clear(),
      });
      return;
    }

    this.galponSvc.search({ granjaId: this.selectedGranjaId, page: 1, pageSize: 1000, soloActivos: true })
      .subscribe({
        next: res => this.fillGalponMap(res?.items || []),
        error: () => this.galponNameById.clear(),
      });
  }

  private fillGalponMap(rows: GalponDetailDto[] | null | undefined): void {
    for (const g of rows || []) {
      const id = String(g.galponId).trim();
      if (!id) continue;
      this.galponNameById.set(id, (g.galponNombre || id).trim());
    }
    this.buildGalponesFromLotes();
  }

  // ================== CASCADA DE FILTROS ==================
  onGranjaChange(): void {
    this.selectedNucleoId = null;
    this.selectedGalponId = null;
    this.selectedLoteId = null;
    this.seguimientos = [];
    this.galpones = [];
    this.hasSinGalpon = false;
    this.lotes = [];
    this.selectedLote = undefined;
    this.resumenSelected = null;
    this.nucleos = [];

    if (!this.selectedGranjaId) return;

    this.nucleoSvc.getByGranja(this.selectedGranjaId).subscribe({
      next: rows => (this.nucleos = rows || []),
      error: () => (this.nucleos = [])
    });

    this.reloadLotesThenApplyFilters();
    this.loadGalponCatalog();
  }

  onNucleoChange(): void {
    this.selectedGalponId = null;
    this.selectedLoteId = null;
    this.seguimientos = [];
    this.selectedLote = undefined;
    this.resumenSelected = null;
    this.applyFiltersToLotes();
    this.loadGalponCatalog();
  }

  onGalponChange(): void {
    this.selectedLoteId = null;
    this.seguimientos = [];
    this.selectedLote = undefined;
    this.resumenSelected = null;
    this.applyFiltersToLotes();
  }

  onLoteChange(): void {
    this.seguimientos = [];
    this.selectedLote = undefined;
    this.resumenSelected = null;

    if (!this.selectedLoteId) return;

    this.loading = true;
    this.segSvc.getByLoteId(this.selectedLoteId)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: rows => (this.seguimientos = rows || []),
        error: () => (this.seguimientos = [])
      });

    this.loteSvc.getById(this.selectedLoteId).subscribe({
      next: l => (this.selectedLote = l),
      error: () => (this.selectedLote = undefined)
    });

    this.loteSvc.getResumenMortalidad(this.selectedLoteId).subscribe({
      next: r => (this.resumenSelected = r),
      error: () => (this.resumenSelected = null)
    });
  }

  // ================== CARGA Y FILTRADO ==================
  private reloadLotesThenApplyFilters(): void {
    if (!this.selectedGranjaId) {
      this.allLotes = [];
      this.lotes = [];
      this.galpones = [];
      this.hasSinGalpon = false;
      return;
    }

    this.loading = true;
    this.loteSvc.getAll()
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: all => {
          this.allLotes = all || [];
          this.applyFiltersToLotes();
          this.buildGalponesFromLotes();
        },
        error: () => {
          this.allLotes = [];
          this.lotes = [];
          this.galpones = [];
          this.hasSinGalpon = false;
        }
      });
  }

  private applyFiltersToLotes(): void {
    if (!this.selectedGranjaId) { this.lotes = []; return; }
    const gid = String(this.selectedGranjaId);

    let filtered = this.allLotes.filter(l => String(l.granjaId) === gid);

    if (this.selectedNucleoId) {
      const nid = String(this.selectedNucleoId);
      filtered = filtered.filter(l => String(l.nucleoId) === nid);
    }

    this.hasSinGalpon = filtered.some(l => !this.hasValue(l.galponId));

    if (!this.selectedGalponId) { this.lotes = filtered; return; }

    if (this.selectedGalponId === this.SIN_GALPON) {
      this.lotes = filtered.filter(l => !this.hasValue(l.galponId));
      return;
    }

    const sel = this.normalizeId(this.selectedGalponId);
    this.lotes = filtered.filter(l => this.normalizeId(l.galponId) === sel);
  }

  private buildGalponesFromLotes(): void {
    if (!this.selectedGranjaId) {
      this.galpones = [];
      this.hasSinGalpon = false;
      return;
    }

    const gid = String(this.selectedGranjaId);
    let base = this.allLotes.filter(l => String(l.granjaId) === gid);

    if (this.selectedNucleoId) {
      const nid = String(this.selectedNucleoId);
      base = base.filter(l => String(l.nucleoId) === nid);
    }

    const seen = new Set<string>();
    const result: Array<{ id: string; label: string }> = [];

    for (const l of base) {
      const id = this.normalizeId(l.galponId);
      if (!id) continue;
      if (seen.has(id)) continue;
      seen.add(id);
      const label = this.galponNameById.get(id) || id;
      result.push({ id, label });
    }

    this.hasSinGalpon = base.some(l => !this.hasValue(l.galponId));
    if (this.hasSinGalpon) {
      result.unshift({ id: this.SIN_GALPON, label: '— Sin galpón —' });
    }

    this.galpones = result.sort((a, b) =>
      a.label.localeCompare(b.label, 'es', { numeric: true, sensitivity: 'base' })
    );
  }

  // ================== CRUD modal ==================
  create(): void {
    if (!this.selectedLoteId) return;
    this.editing = null;
    this.form.reset({
      fechaRegistro: this.todayYMD(),   // YYYY-MM-DD local
      loteId: this.selectedLoteId,
      mortalidadHembras: 0,
      mortalidadMachos: 0,
      selH: 0,
      selM: 0,
      errorSexajeHembras: 0,
      errorSexajeMachos: 0,
      tipoAlimento: '',
      consumoKgHembras: 0,
      observaciones: '',
      ciclo: 'Normal',
      consumoKgMachos: null,
      pesoPromH: null,
      pesoPromM: null,
      uniformidadH: null,
      uniformidadM: null,
      cvH: null,
      cvM: null,
      tipoAlimentoHembras: '',
      tipoAlimentoMachos:  '',
      consumoAlimentoHembras: null,
      consumoAlimentoMachos:  null,
    });
    this.modalOpen = true;
  }

  edit(seg: SeguimientoLoteLevanteDto): void {
    this.editing = seg;
    this.form.patchValue({
      // normaliza a YYYY-MM-DD para el input date
      fechaRegistro: this.toYMD(seg.fechaRegistro),
      loteId: seg.loteId,
      mortalidadHembras: seg.mortalidadHembras,
      mortalidadMachos: seg.mortalidadMachos,
      selH: seg.selH,
      selM: seg.selM,
      errorSexajeHembras: seg.errorSexajeHembras,
      errorSexajeMachos: seg.errorSexajeMachos,
      tipoAlimento: seg.tipoAlimento ?? '',
      consumoKgHembras: seg.consumoKgHembras,
      observaciones: seg.observaciones || '',
      ciclo: seg.ciclo || 'Normal',
      consumoKgMachos: seg.consumoKgMachos ?? null,
      pesoPromH: seg.pesoPromH ?? null,
      pesoPromM: seg.pesoPromM ?? null,
      uniformidadH: seg.uniformidadH ?? null,
      uniformidadM: seg.uniformidadM ?? null,
      cvH: seg.cvH ?? null,
      cvM: seg.cvM ?? null,
      tipoAlimentoHembras: seg.tipoAlimentoHembras ?? '',
      tipoAlimentoMachos:  seg.tipoAlimentoMachos ?? '',
    });
    this.modalOpen = true;
  }

  delete(id: number): void {
    if (!confirm('¿Eliminar este registro?')) return;
    this.segSvc.delete(id).subscribe(() => this.onLoteChange());
  }

  cancel(): void {
    this.modalOpen = false;
    this.editing = null;
  }

  private toNumOrNull(v: any): number | null {
    if (v === null || v === undefined || v === '') return null;
    const n = typeof v === 'number' ? v : Number(v);
    return isNaN(n) ? null : n;
  }

  save(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const raw = this.form.value;

    // OJO: guardamos los "códigos" de catálogo (string) en tipoAlimentoHembras/Machos
    const tipoAlH = (raw.tipoAlimentoHembras || '').toString().trim();
    const tipoAlM = (raw.tipoAlimentoMachos  || '').toString().trim();

    // Serializa la fecha al MEDIODÍA local → evita corrimiento de día al pasar a UTC
    const ymd = this.toYMD(raw.fechaRegistro)!;

    const baseDto = {
      fechaRegistro: this.ymdToIsoAtNoon(ymd),
      loteId: raw.loteId,
      mortalidadHembras: Number(raw.mortalidadHembras) || 0,
      mortalidadMachos: Number(raw.mortalidadMachos) || 0,
      selH: Number(raw.selH) || 0,
      selM: Number(raw.selM) || 0,
      errorSexajeHembras: Number(raw.errorSexajeHembras) || 0,
      errorSexajeMachos: Number(raw.errorSexajeMachos) || 0,
      // LEGACY: si no se eligió H/M, usar tipoAlimento tradicional
      tipoAlimento: raw.tipoAlimento || tipoAlH || tipoAlM || '',
      consumoKgHembras: Number(raw.consumoKgHembras) || 0,
      consumoKgMachos: this.toNumOrNull(raw.consumoKgMachos),
      pesoPromH:       this.toNumOrNull(raw.pesoPromH),
      pesoPromM:       this.toNumOrNull(raw.pesoPromM),
      uniformidadH:    this.toNumOrNull(raw.uniformidadH),
      uniformidadM:    this.toNumOrNull(raw.uniformidadM),
      cvH:             this.toNumOrNull(raw.cvH),
      cvM:             this.toNumOrNull(raw.cvM),
      observaciones: raw.observaciones,
      kcalAlH: null,
      protAlH: null,
      kcalAveH: null,
      protAveH: null,
      ciclo: raw.ciclo,
      tipoAlimentoHembras: tipoAlH || null,
      tipoAlimentoMachos:  tipoAlM || null,
    };

    const op$ = this.editing
      ? this.segSvc.update({ ...(baseDto as any), id: this.editing.id } as UpdateSeguimientoLoteLevanteDto)
      : this.segSvc.create(baseDto as CreateSeguimientoLoteLevanteDto);

    this.loading = true;
    op$.pipe(finalize(() => (this.loading = false))).subscribe({
      next: () => {
        this.modalOpen = false;
        this.editing = null;
        this.onLoteChange();
      },
      error: () => { /* TODO: toast de error */ }
    });
  }

  // ================== helpers ==================
  trackById = (_: number, r: SeguimientoLoteLevanteDto) => r.id;
  trackByNucleo = (_: number, n: NucleoDto) => n.nucleoId;

  get selectedLoteNombre(): string {
    const l = this.lotes.find(x => x.loteId === this.selectedLoteId);
    return l?.loteNombre ?? (this.selectedLoteId || '—');
  }

  get selectedGranjaName(): string {
    const g = this.granjas.find(x => x.id === this.selectedGranjaId);
    return g?.name ?? '';
  }

  get selectedNucleoNombre(): string {
    const n = this.nucleos.find(x => x.nucleoId === this.selectedNucleoId);
    return n?.nucleoNombre ?? '';
  }

  /** Nombre legible del galpón seleccionado para chips/ficha */
  get selectedGalponNombre(): string {
    if (this.selectedGalponId === this.SIN_GALPON) return '— Sin galpón —';
    const id = (this.selectedGalponId ?? '').trim();
    return this.galponNameById.get(id) || id;
  }

  /** Edad (en días) a HOY desde fecha de encasetamiento (mínimo 1). */
  calcularEdadDias(fechaEncaset?: string | Date | null): number {
    const encYmd = this.toYMD(fechaEncaset);
    const enc = this.ymdToLocalNoonDate(encYmd);
    if (!enc) return 0;
    const MS_DAY = 24 * 60 * 60 * 1000;
    const now = this.ymdToLocalNoonDate(this.todayYMD())!; // hoy al mediodía local
    return Math.max(1, Math.floor((now.getTime() - enc.getTime()) / MS_DAY) + 1);
  }

  /**
   * Edad (en días) del pollito AL MOMENTO DEL REGISTRO.
   * Calcula días desde fechaEncaset hasta fechaRegistro (mínimo 1), sin corrimientos.
   */
  calcularEdadDiasDesde(fechaEncaset?: string | Date | null, fechaReferencia?: string | Date | null): number {
    const enc = this.ymdToLocalNoonDate(this.toYMD(fechaEncaset));
    const ref = this.ymdToLocalNoonDate(this.toYMD(fechaReferencia));
    if (!enc || !ref) return 0;
    const MS_DAY = 24 * 60 * 60 * 1000;
    const diff = ref.getTime() - enc.getTime();
    if (diff < 0) return 0;
    return Math.max(1, Math.floor(diff / MS_DAY) + 1);
  }

  /** Atajo para la tabla: edad en días del registro s usando el encaset del lote seleccionado. */
  edadDiasDe(s: SeguimientoLoteLevanteDto): number {
    return this.calcularEdadDiasDesde(this.selectedLote?.fechaEncaset ?? null, s?.fechaRegistro ?? null);
  }

  // ========== MÉTODOS LEGACY (SEMANAS) - MANTENER PARA COMPATIBILIDAD ==========
  /** @deprecated Usar calcularEdadDias() en su lugar */
  calcularEdadSemanas(fechaEncaset?: string | Date | null): number {
    const encYmd = this.toYMD(fechaEncaset);
    const enc = this.ymdToLocalNoonDate(encYmd);
    if (!enc) return 0;
    const MS_WEEK = 7 * 24 * 60 * 60 * 1000;
    const now = this.ymdToLocalNoonDate(this.todayYMD())!; // hoy al mediodía local
    return Math.max(1, Math.floor((now.getTime() - enc.getTime()) / MS_WEEK) + 1);
  }

  /**
   * @deprecated Usar calcularEdadDiasDesde() en su lugar
   * Edad (en semanas) del pollito AL MOMENTO DEL REGISTRO.
   * Calcula semanas desde fechaEncaset hasta fechaRegistro (mínimo 1), sin corrimientos.
   */
  calcularEdadSemanasDesde(fechaEncaset?: string | Date | null, fechaReferencia?: string | Date | null): number {
    const enc = this.ymdToLocalNoonDate(this.toYMD(fechaEncaset));
    const ref = this.ymdToLocalNoonDate(this.toYMD(fechaReferencia));
    if (!enc || !ref) return 0;
    const MS_WEEK = 7 * 24 * 60 * 60 * 1000;
    const diff = ref.getTime() - enc.getTime();
    if (diff < 0) return 0;
    return Math.max(1, Math.floor(diff / MS_WEEK) + 1);
  }

  /** @deprecated Usar edadDiasDe() en su lugar */
  edadSemanaDe(s: SeguimientoLoteLevanteDto): number {
    return this.calcularEdadSemanasDesde(this.selectedLote?.fechaEncaset ?? null, s?.fechaRegistro ?? null);
  }

  private hasValue(v: unknown): boolean {
    if (v === null || v === undefined) return false;
    const s = String(v).trim().toLowerCase();
    return !(s === '' || s === '0' || s === 'null' || s === 'undefined');
  }

  private normalizeId(v: unknown): string {
    if (v === null || v === undefined) return '';
    return String(v).trim();
  }

  // ========= CÁLCULOS =========
  calcsOpen = false;
  liquidacionOpen = false;
  calcsLoading = false;
  calcsDesde: string | null = null;
  calcsHasta: string | null = null;

  calcsResp: {
    loteId: string;
    total: number;
    desde?: string | null;
    hasta?: string | null;
    items: Array<{
      fecha: string;
      edadDias?: number | null;  // Cambiado de edadSemana a edadDias
      edadSemana?: number | null; // @deprecated - mantener para compatibilidad
      hembraViva?: number | null;
      mortH: number; selH: number; errH: number;
      consKgH?: number | null; pesoH?: number | null; unifH?: number | null;
      mortHPct?: number | null; selHPct?: number | null; errHPct?: number | null;
      machoVivo?: number | null;
      mortM: number; selM: number; errM: number;
      consKgM?: number | null; pesoM?: number | null; unifM?: number | null;
      mortMPct?: number | null; selMPct?: number | null; errMPct?: number | null;
      retiroHPct?: number | null; retiroHAcPct?: number | null;
      retiroMPct?: number | null; retiroMAcPct?: number | null;
      relMHPct?: number | null;
    }>;
  } | null = null;

  openCalculos(): void {
    if (!this.selectedLoteId) return;
    this.calcsOpen = true;
    this.calcsDesde = null;
    this.calcsHasta = null;
    this.reloadCalculos();
  }

  closeCalculos(): void {
    this.calcsOpen = false;
  }

  // ========= LIQUIDACIÓN TÉCNICA =========
  openLiquidacion(): void {
    if (!this.selectedLoteId) return;
    this.liquidacionOpen = true;
  }

  closeLiquidacion(): void {
    this.liquidacionOpen = false;
  }

  reloadCalculos(): void {
    if (!this.selectedLoteId) return;
    this.calcsLoading = true;

    this.segSvc.getResultado({
      loteId: this.selectedLoteId,
      desde: this.calcsDesde || undefined,
      hasta: this.calcsHasta || undefined,
      recalcular: true
    }).subscribe({
      next: (res) => {
        this.calcsResp = res ?? null;
        this.calcsLoading = false;
      },
      error: () => {
        this.calcsResp = null;
        this.calcsLoading = false;
      }
    });
  }

  // ******************************* Helpers de fecha *******************************

  /** Hoy en formato YYYY-MM-DD (local, sin zona) para <input type="date"> */
  private todayYMD(): string {
    const d = new Date();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${d.getFullYear()}-${mm}-${dd}`;
  }

  /** Normaliza cadenas mm/dd/aaaa, dd/mm/aaaa, ISO o Date a YYYY-MM-DD (local) */
  private toYMD(input: string | Date | null | undefined): string | null {
    if (!input) return null;

    if (input instanceof Date && !isNaN(input.getTime())) {
      const y = input.getFullYear();
      const m = String(input.getMonth() + 1).padStart(2, '0');
      const d = String(input.getDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    }

    const s = String(input).trim();

    // YYYY-MM-DD
    const ymd = /^(\d{4})-(\d{2})-(\d{2})$/;
    const m1 = s.match(ymd);
    if (m1) return `${m1[1]}-${m1[2]}-${m1[3]}`;

    // mm/dd/aaaa o dd/mm/aaaa
    const sl = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
    const m2 = s.match(sl);
    if (m2) {
      let a = parseInt(m2[1], 10); // mm o dd
      let b = parseInt(m2[2], 10); // dd o mm
      const yyyy = parseInt(m2[3], 10);
      let mm = a, dd = b;
      if (a > 12 && b <= 12) { mm = b; dd = a; }
      const mmS = String(mm).padStart(2, '0');
      const ddS = String(dd).padStart(2, '0');
      return `${yyyy}-${mmS}-${ddS}`;
    }

    // ISO (con T). Extrae la fecha en LOCAL sin cambiar el día
    const d = new Date(s);
    if (!isNaN(d.getTime())) {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    }

    return null;
  }

  /** Muestra dd/MM/aaaa SIN timezone shift a partir de cualquier entrada */
  formatDMY = (input: string | Date | null | undefined): string => {
    const ymd = this.toYMD(input);
    if (!ymd) return '';
    const [y, m, d] = ymd.split('-');
    return `${d}/${m}/${y}`;
  };

  /** Convierte YYYY-MM-DD a ISO asegurando MEDIODÍA local → evita cruzar de día por zona horaria */
  private ymdToIsoAtNoon(ymd: string): string {
    const iso = new Date(`${ymd}T12:00:00`);
    return iso.toISOString();
  }

  /** Date (local) a partir de YMD en el mediodía local (para cálculos de semanas sin corrimientos) */
  private ymdToLocalNoonDate(ymd: string | null): Date | null {
    if (!ymd) return null;
    const d = new Date(`${ymd}T12:00:00`);
    return isNaN(d.getTime()) ? null : d;
  }
}
