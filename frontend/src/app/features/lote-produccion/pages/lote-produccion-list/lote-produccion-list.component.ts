// src/app/features/lote-produccion/pages/lote-produccion-list/lote-produccion-list.component.ts
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { SidebarComponent } from '../../../../shared/components/sidebar/sidebar.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faPlus, faPen, faTrash } from '@fortawesome/free-solid-svg-icons';

import { LoteProduccionDto } from '../../services/lote-produccion.service';
import { LoteService, LoteDto, LoteMortalidadResumenDto } from '../../../lote/services/lote.service';
import { GalponService } from '../../../galpon/services/galpon.service';
import { GalponDetailDto } from '../../../galpon/models/galpon.models';
import { FarmService, FarmDto } from '../../../farm/services/farm.service';
import { NucleoService, NucleoDto } from '../../../lote-levante/services/nucleo.service';

type LoteView = LoteDto & { edadDias: number };

@Component({
  selector: 'app-lote-produccion-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    SidebarComponent,
    FontAwesomeModule
  ],
  templateUrl: './lote-produccion-list.component.html',
  styleUrls: ['./lote-produccion-list.component.scss'],
  encapsulation: ViewEncapsulation.Emulated
})
export class LoteProduccionListComponent implements OnInit {
  private readonly SIN_GALPON = '__SIN_GALPON__';

  // Icons
  faPlus = faPlus;
  faPen = faPen;
  faTrash = faTrash;

  // UI
  loading = false;
  modalOpen = false;

  // Catálogos
  granjas: FarmDto[] = [];
  nucleos: NucleoDto[] = [];
  galpones: Array<{ id: string; label: string }> = [];

  // Selección / filtro
  selectedGranjaId: number | null = null;
  selectedNucleoId: string | null = null;
  selectedGalponId: string | null = null;

  selectedLoteId: number | string | null = null;
  selectedLoteNombre = '';
  selectedLoteDias = 0;
  selectedLoteFechaEncaset: string | Date | null = null;

  // Datos
  private allLotes: LoteDto[] = [];
  lotes: LoteView[] = [];
  registros: LoteProduccionDto[] = [];

  // NUEVO: ficha/estados
  selectedLote?: LoteDto;
  resumenSelected: LoteMortalidadResumenDto | null = null;

  // Modal / Form
  form!: FormGroup;
  editing: LoteProduccionDto | null = null;
  esPrimerRegistroProduccion = false;

  // Aux
  private galponNameById = new Map<string, string>();

  // trackBy
  trackByLoteId = (_: number, l: LoteView) => l.loteId as any;
  trackByRegistroId = (_: number, r: LoteProduccionDto) => r.id as any;
  trackByNucleo = (_: number, n: NucleoDto) => n.nucleoId as any;

  constructor(
    private fb: FormBuilder,
    private loteSvc: LoteService,
    private farmSvc: FarmService,
    private nucleoSvc: NucleoService,
    private galponSvc: GalponService,
  ) {}

  ngOnInit() {
    this.farmSvc.getAll().subscribe({
      next: fs => (this.granjas = fs || []),
      error: () => (this.granjas = [])
    });

    this.form = this.fb.group({
      fecha: [this.hoyISO(), Validators.required],
      loteId: ['', Validators.required],
      mortalidadH: [0, [Validators.required, Validators.min(0)]],
      mortalidadM: [0, [Validators.required, Validators.min(0)]],
      selH:        [0, [Validators.required, Validators.min(0)]],
      consKgH:     [0, [Validators.required, Validators.min(0)]],
      consKgM:     [0, [Validators.required, Validators.min(0)]],
      huevoTot:    [0, [Validators.required, Validators.min(0)]],
      huevoInc:    [0, [Validators.required, Validators.min(0)]],
      tipoAlimento: ['', Validators.required],
      observaciones: [''],
      pesoHuevo:   [0, [Validators.required, Validators.min(0)]],
      etapa:       [1, Validators.required],
      hembrasInicio: [null],
      machosInicio:  [null],
      huevosInicio:  [null],
      tipoNido:      [''],
      nucleoP:       [''],
      ciclo:         ['']
    });
  }

  // Getters chips
  get selectedGranjaName(): string {
    const g = this.granjas.find(x => x.id === (this.selectedGranjaId as any));
    return g?.name ?? (this.selectedGranjaId != null ? String(this.selectedGranjaId) : '');
  }
  get selectedNucleoNombre(): string {
    const n = this.nucleos.find(x => x.nucleoId === this.selectedNucleoId);
    return n?.nucleoNombre ?? (this.selectedNucleoId ?? '');
  }
  get selectedGalponNombre(): string {
    if (this.selectedGalponId === this.SIN_GALPON) return '— Sin galpón —';
    const id = (this.selectedGalponId ?? '').trim();
    return this.galponNameById.get(id) || id;
  }

  // Filtros en cascada
  onGranjaChange(): void {
    this.selectedNucleoId = null;
    this.selectedGalponId = null;
    this.selectedLoteId = null;

    this.registros = [];
    this.galpones = [];
    this.nucleos = [];
    this.lotes = [];
    this.allLotes = [];

    // limpiar ficha
    this.selectedLote = undefined;
    this.resumenSelected = null;
    this.selectedLoteNombre = '';
    this.selectedLoteDias = 0;
    this.selectedLoteFechaEncaset = null;

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

    this.registros = [];
    this.selectedLote = undefined;
    this.resumenSelected = null;
    this.selectedLoteNombre = '';
    this.selectedLoteDias = 0;
    this.selectedLoteFechaEncaset = null;

    this.applyFiltersToLotes();
    this.loadGalponCatalog();
  }

  onGalponChange(): void {
    this.selectedLoteId = null;

    this.registros = [];
    this.selectedLote = undefined;
    this.resumenSelected = null;
    this.selectedLoteNombre = '';
    this.selectedLoteDias = 0;
    this.selectedLoteFechaEncaset = null;

    this.applyFiltersToLotes();
  }

  onLoteChange(): void {
    this.registros = [];
    this.selectedLote = undefined;
    this.resumenSelected = null;
    this.selectedLoteNombre = '';
    this.selectedLoteDias = 0;
    this.selectedLoteFechaEncaset = null;

    if (this.selectedLoteId == null) {
      this.esPrimerRegistroProduccion = false;
      return;
    }

    const lote = this.lotes.find(l => (l.loteId as any) === this.selectedLoteId);
    this.selectedLoteNombre = lote?.loteNombre ?? '';
    this.selectedLoteDias = lote?.edadDias ?? 0;
    this.selectedLoteFechaEncaset = lote?.fechaEncaset ?? null;

    // Registros (sessionStorage)
    const stored = sessionStorage.getItem('registros-produccion');
    const all: LoteProduccionDto[] = stored ? JSON.parse(stored) : [];
    this.registros = all.filter(r => (r.loteId as any) === this.selectedLoteId);
    this.esPrimerRegistroProduccion = this.registros.length === 0 && this.selectedLoteDias >= 182; // 26 semanas * 7 días = 182 días

    // NUEVO: cargar ficha y resumen
    this.loteSvc.getById(String(this.selectedLoteId)).subscribe({
      next: l => (this.selectedLote = l),
      error: () => (this.selectedLote = undefined)
    });

    this.loteSvc.getResumenMortalidad(String(this.selectedLoteId)).subscribe({
      next: r => (this.resumenSelected = r),
      error: () => (this.resumenSelected = null)
    });
  }

  // Carga/filtrado lotes
  private reloadLotesThenApplyFilters(): void {
    if (!this.selectedGranjaId) {
      this.allLotes = [];
      this.lotes = [];
      this.galpones = [];
      return;
    }

    this.loading = true;
    this.loteSvc.getAll().subscribe({
      next: (all) => {
        this.allLotes = all || [];
        this.applyFiltersToLotes();
        this.buildGalponesFromLotes();
        this.loading = false;
      },
      error: () => {
        this.allLotes = [];
        this.lotes = [];
        this.galpones = [];
        this.loading = false;
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

    if (this.selectedGalponId) {
      if (this.selectedGalponId === this.SIN_GALPON) {
        filtered = filtered.filter(l => !this.hasValue(l.galponId));
      } else {
        const sel = this.normalizeId(this.selectedGalponId);
        filtered = filtered.filter(l => this.normalizeId(l.galponId) === sel);
      }
    }

    const withAge: LoteView[] = filtered.map(l => ({
      ...l,
      edadDias: this.calcularEdadDias(l.fechaEncaset)
    }));

    this.lotes = withAge.filter(l => l.edadDias >= 182); // 26 semanas * 7 días = 182 días
  }

  // Catálogo de Galpones
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

  private buildGalponesFromLotes(): void {
    if (!this.selectedGranjaId) {
      this.galpones = [];
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

    const hasSinGalpon = base.some(l => !this.hasValue(l.galponId));
    if (hasSinGalpon) {
      result.unshift({ id: this.SIN_GALPON, label: '— Sin galpón —' });
    }

    this.galpones = result.sort((a, b) =>
      a.label.localeCompare(b.label, 'es', { numeric: true, sensitivity: 'base' })
    );
  }

  // CRUD Registros (sessionStorage)
  create() { this.openNew(); }

  openNew() {
    if (!this.selectedLoteId) return;
    this.editing = null;
    this.form.reset({
      ...this.form.getRawValue(),
      fecha: this.hoyISO(),
      loteId: this.selectedLoteId,
      mortalidadH: 0, mortalidadM: 0, selH: 0,
      consKgH: 0, consKgM: 0,
      huevoTot: 0, huevoInc: 0,
      tipoAlimento: '', observaciones: '',
      pesoHuevo: 0, etapa: 1,
      hembrasInicio: null, machosInicio: null, huevosInicio: null,
      tipoNido: '', nucleoP: '', ciclo: ''
    });
    this.modalOpen = true;
  }

  edit(r: LoteProduccionDto) {
    this.editing = r;
    this.form.patchValue({ ...r, fecha: (r.fecha || '').slice(0, 10) });
    this.modalOpen = true;
  }

  delete(id: string | number) {
    if (!confirm('¿Eliminar este registro?')) return;
    const stored = sessionStorage.getItem('registros-produccion');
    let all: LoteProduccionDto[] = stored ? JSON.parse(stored) : [];
    all = all.filter(r => r.id !== id);
    sessionStorage.setItem('registros-produccion', JSON.stringify(all));
    this.onLoteChange();
  }

  save() {
    if (this.form.invalid) return;

    const raw = this.form.value;
    const stored = sessionStorage.getItem('registros-produccion');
    const all: LoteProduccionDto[] = stored ? JSON.parse(stored) : [];

    if (this.editing) {
      const index = all.findIndex(r => r.id === this.editing!.id);
      if (index !== -1) all[index] = { ...all[index], ...raw, id: this.editing!.id };
    } else {
      const newId = `temp-${Date.now()}`;
      all.push({ ...raw, id: newId } as any);
    }

    sessionStorage.setItem('registros-produccion', JSON.stringify(all));
    this.modalOpen = false;
    this.onLoteChange();
  }

  cancel() { this.modalOpen = false; }

  // Helpers de fecha / edad
  private hoyISO(): string {
    const d = new Date();
    return new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())).toISOString().slice(0, 10);
  }

  public calcularEdadDias(fechaEncaset?: string | Date | null): number {
    if (!fechaEncaset) return 0;
    const fecha = new Date(fechaEncaset);
    if (isNaN(fecha.getTime())) return 0;
    const hoy = new Date();
    const msPorDia = 1000 * 60 * 60 * 24;
    const dias = Math.floor((hoy.getTime() - fecha.getTime()) / msPorDia);
    return Math.max(1, dias + 1);
  }

  public calcularEdadDiasDesde(
    fechaEncaset?: string | Date | null,
    fechaReferencia?: string | Date | null
  ): number {
    if (!fechaEncaset || !fechaReferencia) return 0;
    const enc = new Date(fechaEncaset);
    const ref = new Date(fechaReferencia);
    if (isNaN(enc.getTime()) || isNaN(ref.getTime())) return 0;
    const diff = ref.getTime() - enc.getTime();
    if (diff < 0) return 0;
    const MS_DAY = 24 * 60 * 60 * 1000;
    return Math.max(1, Math.floor(diff / MS_DAY) + 1);
  }

  public edadDiasDe(r: LoteProduccionDto): number {
    return this.calcularEdadDiasDesde(this.selectedLoteFechaEncaset, r?.fecha);
  }

  // ========== MÉTODOS LEGACY (SEMANAS) - MANTENER PARA COMPATIBILIDAD ==========
  /** @deprecated Usar calcularEdadDias() en su lugar */
  public calcularEdadSemanas(fechaEncaset?: string | Date | null): number {
    if (!fechaEncaset) return 0;
    const fecha = new Date(fechaEncaset);
    if (isNaN(fecha.getTime())) return 0;
    const hoy = new Date();
    const msPorSemana = 1000 * 60 * 60 * 24 * 7;
    const semanas = Math.floor((hoy.getTime() - fecha.getTime()) / msPorSemana);
    return Math.max(1, semanas + 1);
  }

  /** @deprecated Usar calcularEdadDiasDesde() en su lugar */
  public calcularEdadSemanasDesde(
    fechaEncaset?: string | Date | null,
    fechaReferencia?: string | Date | null
  ): number {
    if (!fechaEncaset || !fechaReferencia) return 0;
    const enc = new Date(fechaEncaset);
    const ref = new Date(fechaReferencia);
    if (isNaN(enc.getTime()) || isNaN(ref.getTime())) return 0;
    const diff = ref.getTime() - enc.getTime();
    if (diff < 0) return 0;
    const MS_WEEK = 7 * 24 * 60 * 60 * 1000;
    return Math.max(1, Math.floor(diff / MS_WEEK) + 1);
  }

  /** @deprecated Usar edadDiasDe() en su lugar */
  public edadSemanaDe(r: LoteProduccionDto): number {
    return this.calcularEdadSemanasDesde(this.selectedLoteFechaEncaset, r?.fecha);
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
}
