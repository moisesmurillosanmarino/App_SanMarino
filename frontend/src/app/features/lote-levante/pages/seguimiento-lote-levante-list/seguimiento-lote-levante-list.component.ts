// src/app/features/lote-levante/pages/seguimiento-lote-levante-list/seguimiento-lote-levante-list.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { finalize } from 'rxjs/operators';
import { GalponService } from '../../../galpon/services/galpon.service';
import { GalponDetailDto } from '../../../galpon/models/galpon.models';

import { SidebarComponent } from '../../../../shared/components/sidebar/sidebar.component';

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

type Sexo = 'H' | 'M' | 'A';  // H = hembras, M = machos, A = ambos
type Raza = 'RA' | 'ITAL' | 'PAVA' | 'GENERICA';

interface AlimentoOpt {
  id: string;        // código o slug interno
  nombre: string;    // etiqueta a mostrar
  sexo: Sexo;        // a quién aplica
  raza: Raza;        // línea/raza para filtrados futuros
  activo?: boolean;  // por si luego quieres desactivar alguno
}

@Component({
  selector: 'app-seguimiento-lote-levante-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, SidebarComponent, SeguimientoCalculosComponent],
  templateUrl: './seguimiento-lote-levante-list.component.html',
  styleUrls: ['./seguimiento-lote-levante-list.component.scss']
})
export class SeguimientoLoteLevanteListComponent implements OnInit {
  // ================== constantes / sentinelas ==================
  readonly SIN_GALPON = '__SIN_GALPON__';

  // ================== CATÁLOGO LOCAL: Alimentos ==================
  // Notas:
  // - sexo: 'H' hembras, 'M' machos, 'A' ambos
  // - raza: tomada del screenshot/convención. Si no hubo dato claro, se usa 'GENERICA'.
  // - Puedes extender libremente esta lista o moverla a un servicio cuando tengas API.
  readonly alimentos: AlimentoOpt[] = [
    // ====== Genéricos de levante/producción (ambos) ======
    { id: 'preiniciador',           nombre: 'Preiniciador',             sexo: 'A', raza: 'GENERICA' },
    { id: 'iniciador-h',            nombre: 'Iniciador H',              sexo: 'H', raza: 'GENERICA' },
    { id: 'iniciador-m',            nombre: 'Iniciador M',              sexo: 'M', raza: 'GENERICA' },
    { id: 'crecimiento',            nombre: 'Crecimiento',              sexo: 'A', raza: 'GENERICA' },
    { id: 'desarrollo-h',           nombre: 'Desarrollo H',             sexo: 'H', raza: 'GENERICA' },
    { id: 'desarrollo-m',           nombre: 'Desarrollo M',             sexo: 'M', raza: 'GENERICA' },
    { id: 'prepostura-h',           nombre: 'Prepostura H',             sexo: 'H', raza: 'GENERICA' },
    { id: 'mantenimiento',          nombre: 'Mantenimiento',            sexo: 'A', raza: 'GENERICA' },

    // ====== Basados en tu imagen (códigos/etiquetas abreviadas) ======
    // GR PRODUCCIÓN I / II (Reproductoras) – parecen Hembras
    { id: 'gr-prod-i-reprod',       nombre: 'GR Producción I Reprod',   sexo: 'H', raza: 'RA' },
    { id: 'gr-prod-ii-reprod',      nombre: 'GR Producción II Reprod',  sexo: 'H', raza: 'RA' },

    // Huevo "prepico" / Fase III (mantengo genérico; ajusta cuando definas exactamente)
    { id: 'huevo-prepico-reprod',   nombre: 'Huevo Prepico Reprod',     sexo: 'H', raza: 'GENERICA' },
    { id: 'huevo-prepico-f3',       nombre: 'Huevo Prepico Fase III',   sexo: 'H', raza: 'GENERICA' },

    // ITAL (línea italiana) – Hembras (pollita/polla reproducciones)
    { id: 'ital-polla-levante-rep', nombre: 'ITAL Polla Levante Reprod', sexo: 'H', raza: 'ITAL' },
    { id: 'ital-pollita-prein',     nombre: 'ITAL Pollita Prein Reprod', sexo: 'H', raza: 'ITAL' },
    { id: 'ital-pollita-inic',      nombre: 'ITAL Pollita Inici Reprod', sexo: 'H', raza: 'ITAL' },
    { id: 'ital-prepico-reprod',    nombre: 'ITAL Prepico Reproductor',  sexo: 'H', raza: 'ITAL' },
    { id: 'ital-prepostura-reprod', nombre: 'ITAL Prepostura Reproductor', sexo: 'H', raza: 'ITAL' },

    // MACHOS REPRODUCTORES (varias “líneas” A / N / S según se alcanza a leer)
    { id: 'machos-reprod-a',        nombre: 'Machos Reproductores A',   sexo: 'M', raza: 'RA' },
    { id: 'machos-reprod-n',        nombre: 'Machos Reproductores N',   sexo: 'M', raza: 'RA' },
    { id: 'machos-reprod-s',        nombre: 'Machos Reproductores S',   sexo: 'M', raza: 'RA' },

    // PAVA (turquía) – los dejo como “ambos” para no frenar el flujo (puedes ocultarlos si no aplica)
    { id: 'pava-mantenimiento-pll', nombre: 'Pava Mantenimiento PLL',    sexo: 'A', raza: 'PAVA' },
    { id: 'pava-reprod-crec-1',     nombre: 'Pava Reprod Crecimiento 1', sexo: 'A', raza: 'PAVA' },
    { id: 'pava-reprod-crec-2',     nombre: 'Pava Reprod Crecimiento 2', sexo: 'A', raza: 'PAVA' },
    { id: 'pava-reprod-produccion', nombre: 'Pava Reprod Producción',    sexo: 'A', raza: 'PAVA' },
  ];

  get alimentosH(): AlimentoOpt[] { return this.alimentos.filter(a => a.activo !== false && (a.sexo === 'H' || a.sexo === 'A')); }
  get alimentosM(): AlimentoOpt[] { return this.alimentos.filter(a => a.activo !== false && (a.sexo === 'M' || a.sexo === 'A')); }

  mapAlimentoNombre = (id?: string | null) => {
    if (!id) return '';
    return this.alimentos.find(a => a.id === id)?.nombre ?? id;
  };

  // ================== catálogos ==================
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

  activeTab: 'principal' | 'calculos' = 'principal';

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
  ) {}

  ngOnInit(): void {
    this.farmSvc.getAll().subscribe({
      next: fs => (this.granjas = fs || []),
      error: () => (this.granjas = [])
    });

    this.form = this.fb.group({
      fechaRegistro:      [new Date().toISOString().substring(0, 10), Validators.required],
      loteId:             ['', Validators.required],
      mortalidadHembras:  [0, [Validators.required, Validators.min(0)]],
      mortalidadMachos:   [0, [Validators.required, Validators.min(0)]],
      selH:               [0, [Validators.required, Validators.min(0)]],
      selM:               [0, [Validators.required, Validators.min(0)]],
      errorSexajeHembras: [0, [Validators.required, Validators.min(0)]],
      errorSexajeMachos:  [0, [Validators.required, Validators.min(0)]],

      // legacy (por compatibilidad con back)
      tipoAlimento:       [''],

      consumoKgHembras:   [0, [Validators.required, Validators.min(0)]],
      observaciones:      [''],

      // Nuevos opcionales
      consumoKgMachos: [null, [Validators.min(0)]],
      pesoPromH:       [null, [Validators.min(0)]],
      pesoPromM:       [null, [Validators.min(0)]],
      uniformidadH:    [null, [Validators.min(0), Validators.max(100)]],
      uniformidadM:    [null, [Validators.min(0), Validators.max(100)]],
      cvH:             [null, [Validators.min(0)]],
      cvM:             [null, [Validators.min(0)]],

      // Selects por sexo (los que verás en los tabs)
      tipoAlimentoHembras: [''],
      tipoAlimentoMachos:  [''],

      consumoAlimentoHembras: [null],
      consumoAlimentoMachos:  [null],
      ciclo: ['Normal'],
    });
  }

  private loadGalponCatalog(): void {
    this.galponNameById.clear();

    if (!this.selectedGranjaId) return;

    // Preferir por Granja+Núcleo si hay núcleo elegido
    if (this.selectedNucleoId) {
      this.galponSvc.getByGranjaAndNucleo(this.selectedGranjaId, this.selectedNucleoId).subscribe({
        next: rows => this.fillGalponMap(rows),
        error: () => this.galponNameById.clear(),
      });
      return;
    }

    // Si no hay núcleo, traer por granja (vía search con pageSize alto)
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
    // Reetiquetar el combo con nombres si ya estaba armado
    this.buildGalponesFromLotes();
  }


  // ================== cascada de filtros ==================
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

  // ================== carga y filtrado ==================
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

      // ← usa el nombre si está en el catálogo; si no, muestra el id
      const label = this.galponNameById.get(id) || id;
      result.push({ id, label });
    }

    this.hasSinGalpon = base.some(l => !this.hasValue(l.galponId));
    if (this.hasSinGalpon) {
      result.unshift({ id: this.SIN_GALPON, label: '— Sin galpón —' });
    }

    // opcional: ordenar por nombre
    this.galpones = result.sort((a, b) =>
      a.label.localeCompare(b.label, 'es', { numeric: true, sensitivity: 'base' })
    );
  }


  // ================== CRUD modal ==================
  create(): void {
    if (!this.selectedLoteId) return;
    this.editing = null;
    this.form.reset({
      fechaRegistro: new Date().toISOString().substring(0, 10),
      loteId: this.selectedLoteId,
      mortalidadHembras: 0,
      mortalidadMachos: 0,
      selH: 0,
      selM: 0,
      errorSexajeHembras: 0,
      errorSexajeMachos: 0,

      // legacy
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

      // nuevos selects
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
      fechaRegistro: seg.fechaRegistro?.substring(0, 10),
      loteId: seg.loteId,
      mortalidadHembras: seg.mortalidadHembras,
      mortalidadMachos: seg.mortalidadMachos,
      selH: seg.selH,
      selM: seg.selM,
      errorSexajeHembras: seg.errorSexajeHembras,
      errorSexajeMachos: seg.errorSexajeMachos,

      // legacy si llegó
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

      // nuevos
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

    const tipoAlH = (raw.tipoAlimentoHembras || '').toString().trim();
    const tipoAlM = (raw.tipoAlimentoMachos  || '').toString().trim();

    const dto: CreateSeguimientoLoteLevanteDto = {
      fechaRegistro: new Date(raw.fechaRegistro).toISOString(),
      loteId: raw.loteId,

      mortalidadHembras: Number(raw.mortalidadHembras) || 0,
      mortalidadMachos: Number(raw.mortalidadMachos) || 0,
      selH: Number(raw.selH) || 0,
      selM: Number(raw.selM) || 0,
      errorSexajeHembras: Number(raw.errorSexajeHembras) || 0,
      errorSexajeMachos: Number(raw.errorSexajeMachos) || 0,

      // compat: mantenemos "tipoAlimento"
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

      // nuevos
      tipoAlimentoHembras: tipoAlH || null,
      tipoAlimentoMachos:  tipoAlM || null,
    };

    const op$ = this.editing
      ? this.segSvc.update({ ...dto, id: this.editing.id } as UpdateSeguimientoLoteLevanteDto)
      : this.segSvc.create(dto);

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


  calcularEdadSemanas(fechaEncaset?: string | Date | null): number {
    if (!fechaEncaset) return 0;
    const d = typeof fechaEncaset === 'string' ? new Date(fechaEncaset) : fechaEncaset;
    if (isNaN(d.getTime())) return 0;
    const MS_WEEK = 7 * 24 * 60 * 60 * 1000;
    return Math.floor((Date.now() - d.getTime()) / MS_WEEK) + 1;
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
      edadSemana?: number | null;
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
}
