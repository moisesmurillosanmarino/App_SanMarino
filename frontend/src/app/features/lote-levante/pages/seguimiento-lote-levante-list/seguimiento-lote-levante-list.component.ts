import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { finalize } from 'rxjs/operators';


import { SidebarComponent } from '../../../../shared/components/sidebar/sidebar.component';

// Servicios de dominio
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

  constructor(
    private fb: FormBuilder,
    private farmSvc: FarmService,
    private nucleoSvc: NucleoService,
    private loteSvc: LoteService,
    private segSvc: SeguimientoLoteLevanteService
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
      tipoAlimento:       ['', Validators.required],
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
      consumoAlimentoHembras: [null],
      consumoAlimentoMachos: [null],
    });
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
  }

  onNucleoChange(): void {
    this.selectedGalponId = null;
    this.selectedLoteId = null;
    this.seguimientos = [];
    this.selectedLote = undefined;
    this.resumenSelected = null;
    this.applyFiltersToLotes();
    this.buildGalponesFromLotes();
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
    if (!this.selectedGranjaId) { this.galpones = []; this.hasSinGalpon = false; return; }
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
      result.push({ id, label: id });
    }

    this.hasSinGalpon = base.some(l => !this.hasValue(l.galponId));
    if (this.hasSinGalpon) result.unshift({ id: this.SIN_GALPON, label: '— Sin galpón —' });

    this.galpones = result;
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
      consumoAlimentoHembras: null,
      consumoAlimentoMachos: null,
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
      tipoAlimento: seg.tipoAlimento,
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
      tipoAlimentoHembras: seg.tipoAlimentoHembras ?? null,
      tipoAlimentoMachos: seg.tipoAlimentoMachos ?? null,
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

    const dto: CreateSeguimientoLoteLevanteDto = {
      fechaRegistro: new Date(raw.fechaRegistro).toISOString(),
      loteId: raw.loteId,

      mortalidadHembras: Number(raw.mortalidadHembras) || 0,
      mortalidadMachos: Number(raw.mortalidadMachos) || 0,
      selH: Number(raw.selH) || 0,
      selM: Number(raw.selM) || 0,
      errorSexajeHembras: Number(raw.errorSexajeHembras) || 0,
      errorSexajeMachos: Number(raw.errorSexajeMachos) || 0,

      tipoAlimento: raw.tipoAlimento,
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
      tipoAlimentoMachos: null,
      tipoAlimentoHembras: null,
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
      error: () => { /* aquí puedes mostrar un toast */ }
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

  // 👇 Añade cerca de otras propiedades de UI
calcsOpen = false;
calcsLoading = false;
calcsDesde: string | null = null;   // formato yyyy-MM-dd
calcsHasta: string | null = null;

// Respuesta del API de cálculos (forma mínima)
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

// 👇 Métodos
openCalculos(): void {
  if (!this.selectedLoteId) return;
  this.calcsOpen = true;
  // valores por defecto del filtro (opcional)
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
