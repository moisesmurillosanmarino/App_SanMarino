import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators
} from '@angular/forms';
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

@Component({
  selector: 'app-seguimiento-lote-levante-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, SidebarComponent],
  templateUrl: './seguimiento-lote-levante-list.component.html',
  styleUrls: ['./seguimiento-lote-levante-list.component.scss']
})
export class SeguimientoLoteLevanteListComponent implements OnInit {
  // ================== constantes / sentinelas ==================
  /** Valor para representar “Sin galpón” al filtrar lotes con galponId null/undefined/''/0 */
  readonly SIN_GALPON = '__SIN_GALPON__';

  // ================== datos catálogo ==================
  granjas: FarmDto[] = [];
  nucleos: NucleoDto[] = []; // ← NUEVO: catálogo de núcleos por granja
  /** galpones derivados de los lotes (únicos) para la granja/núcleo seleccionados */
  galpones: Array<{ id: string; label: string }> = [];

  // ================== selección / filtro ==================
  selectedGranjaId: number | null = null;
  selectedNucleoId: string | null = null;   // ← NUEVO
  selectedGalponId: string | null = null;   // usa SIN_GALPON para null
  selectedLoteId: string | null = null;

  // ================== lotes y seguimientos ==================
  /** cache de todos los lotes (último getAll) */
  private allLotes: LoteDto[] = [];
  /** lotes filtrados por granja/núcleo/galpón para poblar el <select> de lote */
  lotes: LoteDto[] = [];
  /** registros de seguimiento del lote seleccionado */
  seguimientos: SeguimientoLoteLevanteDto[] = [];

  // ======= detalle/resumen para la tarjeta de resumen =======
  selectedLote: LoteDto | undefined;
  resumenSelected: LoteMortalidadResumenDto | null = null;

  // ================== UI / estado ==================
  loading = false;
  modalOpen = false;
  editing: SeguimientoLoteLevanteDto | null = null;
  hasSinGalpon = false; // si hay lotes sin galpón en la granja/núcleo

  // ================== formulario modal ==================
  form!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private farmSvc: FarmService,
    private nucleoSvc: NucleoService,
    private loteSvc: LoteService,
    private segSvc: SeguimientoLoteLevanteService
  ) {}

  // ================== init ==================
  ngOnInit(): void {
    // 1) catálogos base
    this.farmSvc.getAll().subscribe({
      next: (fs) => (this.granjas = fs || []),
      error: () => (this.granjas = [])
    });

    // 2) form modal
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
      ciclo:              ['Normal', Validators.required]
    });
  }

  // ================== eventos de cascada ==================
  onGranjaChange(): void {
    // reiniciar selección dependiente
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

    // Cargar núcleos por granja
    this.nucleoSvc.getByGranja(this.selectedGranjaId).subscribe({
      next: (rows) => (this.nucleos = rows || []),
      error: () => (this.nucleos = [])
    });

    // Cargar lotes y construir filtros
    this.reloadLotesThenApplyFilters();
  }

  onNucleoChange(): void {
    // reiniciar selección dependiente
    this.selectedGalponId = null;
    this.selectedLoteId = null;
    this.seguimientos = [];
    this.selectedLote = undefined;
    this.resumenSelected = null;

    // Recalcula lotes/galpones con el nuevo núcleo
    this.applyFiltersToLotes();
    this.buildGalponesFromLotes();
  }

  onGalponChange(): void {
    // reiniciar selección dependiente
    this.selectedLoteId = null;
    this.seguimientos = [];
    this.selectedLote = undefined;
    this.resumenSelected = null;

    // Recalcula lotes visibles
    this.applyFiltersToLotes();
  }

  onLoteChange(): void {
    this.seguimientos = [];
    this.selectedLote = undefined;
    this.resumenSelected = null;

    if (!this.selectedLoteId) return;

    // 1) Cargar seguimientos del lote
    this.loading = true;
    this.segSvc.getByLoteId(this.selectedLoteId)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (rows) => (this.seguimientos = rows || []),
        error: () => (this.seguimientos = [])
      });

    // 2) Cargar detalle del lote (para tarjeta resumen)
    this.loteSvc.getById(this.selectedLoteId).subscribe({
      next: l => this.selectedLote = l,
      error: () => this.selectedLote = undefined
    });

    // 3) Cargar resumen de mortalidad (para tarjeta resumen)
    this.loteSvc.getResumenMortalidad(this.selectedLoteId).subscribe({
      next: r => this.resumenSelected = r,
      error: () => this.resumenSelected = null
    });
  }

  // ================== carga y filtrado ==================
  /** Trae TODOS los lotes y luego aplica los filtros Granja/Núcleo/Galpón */
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
        next: (all) => {
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

  /** Aplica los filtros actuales (granja/núcleo/galpón) a allLotes para poblar `lotes` */
  private applyFiltersToLotes(): void {
    if (!this.selectedGranjaId) { this.lotes = []; return; }
    const gid = String(this.selectedGranjaId);

    // 1) Por granja
    let filtered = this.allLotes.filter(l => String(l.granjaId) === gid);

    // 2) Por núcleo (si está seleccionado)
    if (this.selectedNucleoId) {
      const nid = String(this.selectedNucleoId);
      filtered = filtered.filter(l => String(l.nucleoId) === nid);
    }

    // ¿Hay lotes sin galpón?
    this.hasSinGalpon = filtered.some(l => !this.hasValue(l.galponId));

    // 3) Por galpón (si está seleccionado)
    if (!this.selectedGalponId) {
      this.lotes = filtered;
      return;
    }

    if (this.selectedGalponId === this.SIN_GALPON) {
      this.lotes = filtered.filter(l => !this.hasValue(l.galponId));
      return;
    }

    const sel = this.normalizeId(this.selectedGalponId);
    this.lotes = filtered.filter(l => this.normalizeId(l.galponId) === sel);
  }

  /** Construye la lista de galpones únicos a partir de los lotes filtrados por granja y núcleo */
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
      if (!id) continue; // los null/'' no se incluyen aquí (van en “Sin galpón”)
      if (seen.has(id)) continue;
      seen.add(id);
      result.push({ id, label: id }); // si tienes galponNombre cámbialo aquí
    }

    // incluye “Sin galpón” si aplica
    this.hasSinGalpon = base.some(l => !this.hasValue(l.galponId));
    if (this.hasSinGalpon) {
      result.unshift({ id: this.SIN_GALPON, label: '— Sin galpón —' });
    }

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
      ciclo: 'Normal'
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
      ciclo: seg.ciclo || 'Normal'
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

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const raw = this.form.value;

    const dto: CreateSeguimientoLoteLevanteDto = {
      fechaRegistro: new Date(raw.fechaRegistro).toISOString(),
      loteId: raw.loteId,
      mortalidadHembras: raw.mortalidadHembras,
      mortalidadMachos: raw.mortalidadMachos,
      selH: raw.selH,
      selM: raw.selM,
      errorSexajeHembras: raw.errorSexajeHembras,
      errorSexajeMachos: raw.errorSexajeMachos,
      tipoAlimento: raw.tipoAlimento,
      consumoKgHembras: raw.consumoKgHembras,
      observaciones: raw.observaciones,
      kcalAlH: null,
      protAlH: null,
      kcalAveH: null,
      protAveH: null,
      ciclo: raw.ciclo
    };

    const op$ = this.editing
      ? this.segSvc.update({ ...dto, id: this.editing.id } as UpdateSeguimientoLoteLevanteDto)
      : this.segSvc.create(dto);

    this.loading = true;
    op$
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: () => {
          this.modalOpen = false;
          this.editing = null;
          this.onLoteChange(); // refresca la tabla del lote actual
        },
        error: () => {
          // opcional: toast/error
        }
      });
  }

  // ================== helpers ==================
  trackById = (_: number, r: SeguimientoLoteLevanteDto) => r.id;
  trackByNucleo = (_: number, n: NucleoDto) => n.nucleoId;

  get selectedLoteNombre(): string {
    const l = this.lotes.find(x => x.loteId === this.selectedLoteId);
    return l?.loteNombre ?? (this.selectedLoteId || '—');
  }

  // Nombre de la granja seleccionada
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
}
