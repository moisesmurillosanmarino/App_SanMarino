// src/app/features/lote-produccion/pages/lote-produccion-list/lote-produccion-list.component.ts
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs/operators';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faPen, faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';

import { SidebarComponent } from '../../../../shared/components/sidebar/sidebar.component';
import { FarmDto, FarmService } from '../../../farm/services/farm.service';
import { LoteDto, LoteMortalidadResumenDto, LoteService } from '../../../lote/services/lote.service';
import {
  CreateLoteProduccionDto,
  LoteProduccionDto,
  LoteProduccionService,
  UpdateLoteProduccionDto
} from '../../services/lote-produccion.service';

type LoteView = LoteDto;

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
  // ==========================
  // Iconos
  // ==========================
  faPlus = faPlus;
  faPen = faPen;
  faTrash = faTrash;

  // ==========================
  // Constantes / sentinelas
  // ==========================
  readonly SIN_GALPON = '__SIN_GALPON__';

  // ==========================
  // UI
  // ==========================
  loading = false;
  modalOpen = false;

  // ==========================
  // Catálogos / datos base
  // ==========================
  granjas: FarmDto[] = [];
  galpones: Array<{ id: string; label: string }> = [];

  // ==========================
  // Selección / filtro
  // ==========================
  selectedGranjaId: number | null = null;
  selectedGalponId: string | null = null; // usa SIN_GALPON para null/undefined
  selectedLoteId: string | null = null;

  // ==========================
  // Lotes y registros
  // ==========================
  private allLotes: LoteView[] = [];   // cache de todos los lotes (producción >= 26 sem)
  lotes: LoteView[] = [];              // visibles según filtros
  registros: LoteProduccionDto[] = []; // registros del lote seleccionado

  // ==========================
  // Resumen / detalle del lote
  // ==========================
  selectedLote: LoteDto | undefined;
  selectedLoteNombre = '';
  selectedLoteSemanas = 0;
  resumenSelected: LoteMortalidadResumenDto | null = null;

  // ==========================
  // Estado filtro
  // ==========================
  hasSinGalpon = false;

  // ==========================
  // Modal / Form
  // ==========================
  form!: FormGroup;
  editing: LoteProduccionDto | null = null;
  esPrimerRegistroProduccion = false;

  // ==========================
  // Getters auxiliares
  // ==========================
  get selectedGranjaName(): string {
    const g = this.granjas.find(x => x.id === this.selectedGranjaId);
    return g?.name ?? '';
  }

  /** Nombre mostrado del lote desde la lista filtrada */
  get selectedLoteNombreFromList(): string {
    const l = this.lotes.find(x => x.loteId === this.selectedLoteId);
    return l?.loteNombre ?? (this.selectedLoteId || '—');
  }

  /** Alias para el template */
  get selectedLoteNombreChip(): string {
    return this.selectedLoteNombreFromList;
  }

  // ==========================
  // trackBy
  // ==========================
  trackByLoteId = (_: number, l: LoteView) => l.loteId as any;
  trackByRegistroId = (_: number, r: LoteProduccionDto) => r.id as any;

  // ==========================
  // Inyección
  // ==========================
  constructor(
    private fb: FormBuilder,
    private loteSvc: LoteService,
    private farmSvc: FarmService,
    private prodSvc: LoteProduccionService
  ) {}

  // ==========================
  // Init
  // ==========================
  ngOnInit(): void {
    // Catálogos
    this.farmSvc.getAll().subscribe({
      next: (fs) => (this.granjas = fs || []),
      error: () => (this.granjas = [])
    });

    // Form modal
    this.form = this.fb.group({
      fecha: [this.hoyISO(), Validators.required],
      loteId: ['', Validators.required],
      mortalidadH: [0, [Validators.required, Validators.min(0)]],
      mortalidadM: [0, [Validators.required, Validators.min(0)]],
      selH: [0, [Validators.required, Validators.min(0)]],
      consKgH: [0, [Validators.required, Validators.min(0)]],
      consKgM: [0, [Validators.required, Validators.min(0)]],
      huevoTot: [0, [Validators.required, Validators.min(0)]],
      huevoInc: [0, [Validators.required, Validators.min(0)]],
      tipoAlimento: ['', Validators.required],
      observaciones: [''],
      pesoHuevo: [0, [Validators.required, Validators.min(0)]],
      etapa: [1, Validators.required],

      // Iniciales (si es primer registro de producción)
      hembrasInicio: [null],
      machosInicio: [null],
      huevosInicio: [null],
      tipoNido: [''],
      nucleoP: [''],
      ciclo: ['']
    });
  }

  // ==========================
  // Cascada de filtros
  // ==========================
  onGranjaChange(): void {
    // Reset dependientes
    this.selectedGalponId = null;
    this.selectedLoteId = null;
    this.registros = [];
    this.galpones = [];
    this.hasSinGalpon = false;
    this.lotes = [];
    this.selectedLote = undefined;
    this.resumenSelected = null;
    this.selectedLoteNombre = '';
    this.selectedLoteSemanas = 0;

    if (!this.selectedGranjaId) return;
    this.reloadLotesThenApplyFilters();
  }

  onGalponChange(): void {
    this.selectedLoteId = null;
    this.registros = [];
    this.selectedLote = undefined;
    this.resumenSelected = null;
    this.selectedLoteNombre = '';
    this.selectedLoteSemanas = 0;

    this.reloadLotesThenApplyFilters();
  }

  onLoteChange(): void {
    this.registros = [];
    this.selectedLote = undefined;
    this.resumenSelected = null;

    if (!this.selectedLoteId) return;

    // Detalle/resumen lote
    this.loteSvc.getById(this.selectedLoteId).subscribe({
      next: (l) => {
        this.selectedLote = l;
        this.selectedLoteNombre = l.loteNombre || '';
        this.selectedLoteSemanas = this.calcularEdadSemanas(l.fechaEncaset);
      },
      error: () => {
        this.selectedLote = undefined;
        this.selectedLoteNombre = '';
        this.selectedLoteSemanas = 0;
      }
    });

    this.loteSvc.getResumenMortalidad(this.selectedLoteId).subscribe({
      next: (r) => (this.resumenSelected = r),
      error: () => (this.resumenSelected = null)
    });

    // Registros de producción (API)
    this.loading = true;
    this.prodSvc.getByLote(this.selectedLoteId)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (rows) => {
          this.registros = rows || [];
          this.esPrimerRegistroProduccion = (this.registros.length === 0) && (this.selectedLoteSemanas >= 26);
        },
        error: () => {
          this.registros = [];
          this.esPrimerRegistroProduccion = (this.selectedLoteSemanas >= 26);
        }
      });
  }

  // ==========================
  // Carga / filtrado de lotes
  // ==========================
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
          // Producción: mostrar lotes con >= 26 semanas
          this.allLotes = (all || []).filter(l => this.calcularEdadSemanas(l.fechaEncaset) >= 26);
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
    const gid = String(this.selectedGranjaId);
    const byFarm = this.allLotes.filter(l => String(l.granjaId) === gid);

    // ¿Hay lotes sin galpón?
    this.hasSinGalpon = byFarm.some(l => !this.hasValue(l.galponId));

    // Sin galpón seleccionado => todos los lotes de la granja
    if (!this.selectedGalponId) {
      this.lotes = byFarm;
      return;
    }

    // Opción “Sin galpón”
    if (this.selectedGalponId === this.SIN_GALPON) {
      this.lotes = byFarm.filter(l => !this.hasValue(l.galponId));
      return;
    }

    // Galpón específico
    const sel = this.normalizeId(this.selectedGalponId);
    this.lotes = byFarm.filter(l => this.normalizeId(l.galponId) === sel);
  }

  private buildGalponesFromLotes(): void {
    const gid = String(this.selectedGranjaId);
    const byFarm = this.allLotes.filter(l => String(l.granjaId) === gid);

    const seen = new Set<string>();
    const result: Array<{ id: string; label: string }> = [];

    for (const l of byFarm) {
      const id = this.normalizeId(l.galponId);
      if (!id) continue;         // null/'' -> se maneja con “Sin galpón”
      if (seen.has(id)) continue;
      seen.add(id);
      result.push({ id, label: id }); // si luego tienes nombre, cámbialo aquí
    }

    if (byFarm.some(l => !this.hasValue(l.galponId))) {
      result.unshift({ id: this.SIN_GALPON, label: '— Sin galpón —' });
    }

    this.galpones = result;
  }

  // ==========================
  // CRUD modal
  // ==========================
  create(): void {
    this.openNew();
  }

  openNew(): void {
    if (!this.selectedLoteId) return;
    this.editing = null;

    this.form.reset({
      fecha: this.hoyISO(),
      loteId: this.selectedLoteId,
      mortalidadH: 0,
      mortalidadM: 0,
      selH: 0,
      consKgH: 0,
      consKgM: 0,
      huevoTot: 0,
      huevoInc: 0,
      tipoAlimento: '',
      observaciones: '',
      pesoHuevo: 0,
      etapa: 1,
      hembrasInicio: null,
      machosInicio: null,
      huevosInicio: null,
      tipoNido: '',
      nucleoP: '',
      ciclo: ''
    });

    this.modalOpen = true;
  }

  edit(r: LoteProduccionDto): void {
    this.editing = r;
    const fecha = (r.fecha || '').slice(0, 10);
    this.form.patchValue({ ...r, fecha });
    this.modalOpen = true;
  }

  delete(id: string): void {
    if (!confirm('¿Eliminar este registro?')) return;
    this.loading = true;
    this.prodSvc.delete(id)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe(() => this.onLoteChange());
  }

  save(): void {
    if (this.form.invalid) return;

    const raw = this.form.value;
    const dto: CreateLoteProduccionDto | UpdateLoteProduccionDto = {
      ...raw,
      fecha: new Date(raw.fecha + 'T00:00:00Z').toISOString(),
      loteId: String(raw.loteId).trim()
    };

    const op$ = this.editing
      ? this.prodSvc.update({ ...(dto as UpdateLoteProduccionDto), id: this.editing.id })
      : this.prodSvc.create(dto as CreateLoteProduccionDto);

    this.loading = true;
    op$
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: () => {
          this.modalOpen = false;
          this.editing = null;
          this.onLoteChange(); // refresca tabla del lote actual
        }
      });
  }

  cancel(): void {
    this.modalOpen = false;
  }

  // ==========================
  // Helpers
  // ==========================
  calcularEdadSemanas(fechaEncaset?: string | Date | null): number {
    if (!fechaEncaset) return 0;
    const d = typeof fechaEncaset === 'string' ? new Date(fechaEncaset) : fechaEncaset;
    if (isNaN(d.getTime())) return 0;
    const MS_WEEK = 7 * 24 * 60 * 60 * 1000;
    return Math.floor((Date.now() - d.getTime()) / MS_WEEK) + 1;
  }

  private hoyISO(): string {
    const d = new Date();
    return new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())).toISOString().slice(0, 10);
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
