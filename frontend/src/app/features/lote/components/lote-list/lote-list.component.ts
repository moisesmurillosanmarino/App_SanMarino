import { Component, OnInit, Directive, ElementRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule, NgControl
} from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { finalize } from 'rxjs/operators';
import { forkJoin } from 'rxjs';

import { SidebarComponent } from '../../../../shared/components/sidebar/sidebar.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faPlus, faPen, faTrash, faTimes, faEye } from '@fortawesome/free-solid-svg-icons';

import {
  LoteService, LoteDto, CreateLoteDto, UpdateLoteDto, LoteMortalidadResumenDto
} from '../../services/lote.service';
import { FarmService, FarmDto } from '../../../farm/services/farm.service';
import { NucleoService, NucleoDto } from '../../../nucleo/services/nucleo.service';
import { GalponService } from '../../../galpon/services/galpon.service';
import { GalponDetailDto } from '../../../galpon/models/galpon.models';
import { UserService, UserDto } from '../../../../core/services/user/user.service';
import { Company, CompanyService } from '../../../../core/services/company/company.service';

/* ============================================================
   Directiva standalone para separador de miles (es-CO)
   Uso en HTML (recomendado para hembrasL, machosL, mixtas):
   <input type="text" formControlName="hembrasL" appThousandSeparator ... />
   ============================================================ */
@Directive({
  selector: 'input[appThousandSeparator]',
  standalone: true
})
export class ThousandSeparatorDirective {
  private readonly formatter = new Intl.NumberFormat('es-CO', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0 // ← aves/individuos sin decimales
  });

  private decimalSeparator = ',';   // es-CO
  private thousandSeparator = '.';  // es-CO

  constructor(
    private el: ElementRef<HTMLInputElement>,
    private ngControl: NgControl
  ) {}

  // Al enfocar: quitar formato para edición cómoda
  @HostListener('focus')
  onFocus() {
    const raw = this.unformat(this.el.nativeElement.value);
    this.el.nativeElement.value = raw ?? '';
  }

  // Mientras escribe: actualizar el FormControl con número limpio
  @HostListener('input', ['$event'])
  onInput(e: Event) {
    const input = e.target as HTMLInputElement;
    const raw = this.unformat(input.value);
    const numeric = this.toNumber(raw);

    // Enviar valor numérico al control (o null si inválido)
    this.ngControl?.control?.setValue(
      isNaN(numeric) ? null : Math.round(numeric), // redondeamos a entero
      { emitEvent: true, emitModelToViewChange: false }
    );
  }

  // Al salir: mostrar con separadores (si hay valor)
  @HostListener('blur')
  onBlur() {
    const controlVal = this.ngControl?.control?.value;
    if (controlVal === null || controlVal === undefined || controlVal === '') {
      this.el.nativeElement.value = '';
      return;
    }
    const n = Number(controlVal);
    this.el.nativeElement.value = isNaN(n) ? '' : this.formatter.format(n);
  }

  private unformat(val: string): string {
    if (!val) return '';
    return val
      .replace(new RegExp('\\' + this.thousandSeparator, 'g'), '') // quitar puntos
      .replace(this.decimalSeparator, '.')                         // coma → punto
      .replace(/[^\d.-]/g, '');                                    // limpiar
  }

  private toNumber(val: string): number {
    return parseFloat(val);
  }
}

/* ============================================================
   Componente: LoteListComponent (actualizado con la directiva)
   ============================================================ */
@Component({
  selector: 'app-lote-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    HttpClientModule,
    SidebarComponent,
    FontAwesomeModule,
    FormsModule,
    ThousandSeparatorDirective // ← disponible para tu template externo
  ],
  templateUrl: './lote-list.component.html',
  styleUrls: ['./lote-list.component.scss']
})
export class LoteListComponent implements OnInit {
  // Iconos
  faPlus = faPlus; faPen = faPen; faTrash = faTrash; faTimes = faTimes; faEye = faEye;

  // Estado UI
  loading = false;
  modalOpen = false;
  editing: LoteDto | null = null;
  selectedLote: LoteDto | null = null;

  // Búsqueda de texto (lista)
  filtro = '';

  // Formularios
  form!: FormGroup;

  // Datos maestros
  farms:    FarmDto[]   = [];
  nucleos:  NucleoDto[] = [];
  galpones: GalponDetailDto[] = [];
  tecnicos: UserDto[]   = [];
  companies: Company[]  = [];

  // Mapas
  farmMap:   Record<number, string> = {};
  nucleoMap: Record<string, string> = {};
  galponMap: Record<string, string> = {};
  techMap:   Record<string, string> = {};
  private farmById: Record<number, FarmDto> = {};

  // Lotes
  lotes: LoteDto[] = [];
  viewLotes: LoteDto[] = [];
  lotesReproductora = [] as any[];

  // Filtros en cascada (LISTA)
  selectedCompanyId: number | null = null;
  selectedFarmId: number | null = null;
  selectedNucleoId: string | null = null;
  selectedGalponId: string | null = null;

  // Filtros en cascada (MODAL)
  nucleosFiltrados:   NucleoDto[] = [];
  galponesFiltrados:  GalponDetailDto[] = [];
  filteredNucleos:    NucleoDto[] = [];
  filteredGalpones:   GalponDetailDto[] = [];

  // Resúmenes de mortalidad
  resumenMap: Record<string, LoteMortalidadResumenDto> = {};
  resumenSelected: LoteMortalidadResumenDto | null = null;

  constructor(
    private fb:        FormBuilder,
    private loteSvc:   LoteService,
    private farmSvc:   FarmService,
    private nucleoSvc: NucleoService,
    private galponSvc: GalponService,
    private userSvc:   UserService,
    private companySvc: CompanyService
  ) {}

  ngOnInit(): void {
    this.initForm();

    // Cargar catálogos base en paralelo
    forkJoin({
      farms:     this.farmSvc.getAll(),
      nucleos:   this.nucleoSvc.getAll(),
      galpones:  this.galponSvc.getAll(),
      tecnicos:  this.userSvc.getAll(),
      companies: this.companySvc.getAll()
    }).subscribe(({ farms, nucleos, galpones, tecnicos, companies }) => {
      // Farms
      this.farms = farms;
      this.farmById = {};
      farms.forEach(f => { this.farmById[f.id] = f; this.farmMap[f.id] = f.name; });

      // Nucleos
      this.nucleos = nucleos;
      nucleos.forEach(n => this.nucleoMap[n.nucleoId] = n.nucleoNombre);

      // Galpones
      this.galpones = galpones;
      galpones.forEach(g => this.galponMap[g.galponId] = g.galponNombre);

      // Técnicos
      this.tecnicos = tecnicos;
      tecnicos.forEach(u => this.techMap[u.id] = `${u.surName} ${u.firstName}`);

      // Companies
      this.companies = companies;

      // Tras cargar catálogos, cargar lotes
      this.loadLotes();
    });

    // ---- CHAIN (MODAL) ----
    this.form.get('granjaId')!.valueChanges.subscribe(granjaId => {
      this.nucleosFiltrados = this.nucleos.filter(n => n.granjaId === Number(granjaId));
      this.filteredNucleos  = this.nucleosFiltrados;
      const primerNucleo = this.nucleosFiltrados[0]?.nucleoId ?? null;
      this.form.patchValue({ nucleoId: primerNucleo });

      this.galponesFiltrados = [];
      this.filteredGalpones  = [];
      this.form.get('galponId')?.setValue(null);
    });

    this.form.get('nucleoId')!.valueChanges.subscribe((nucleoId: string | null) => {
      const granjaId = Number(this.form.get('granjaId')!.value);
      if (granjaId && nucleoId) {
        this.galponSvc.getByGranjaAndNucleo(granjaId, nucleoId).subscribe(data => {
          this.galponesFiltrados = data;
          this.filteredGalpones  = data;
          const primerGalpon = this.galponesFiltrados[0]?.galponId ?? null;
          this.form.patchValue({ galponId: primerGalpon });
        });
      } else {
        this.galponesFiltrados = [];
        this.filteredGalpones  = [];
        this.form.get('galponId')?.setValue(null);
      }
    });

    // Recalculador de aves encasetadas (MODAL)
    this.form.get('hembrasL')!.valueChanges.subscribe(() => this.actualizarEncasetadas());
    this.form.get('machosL')!.valueChanges.subscribe(() => this.actualizarEncasetadas());
    this.form.get('mixtas')!.valueChanges.subscribe(() => this.actualizarEncasetadas());
  }

  // Init
  private initForm(): void {
    this.form = this.fb.group({
      loteId:             ['', Validators.required],
      loteNombre:         ['', Validators.required],
      granjaId:           [null, Validators.required],
      nucleoId:           [null],
      galponId:           [null],
      regional:           [''],
      fechaEncaset:       [null, Validators.required],
      hembrasL:           [null],
      machosL:            [null],
      pesoInicialH:       [null],
      pesoInicialM:       [null],
      pesoMixto:          [null],
      unifH:              [null],
      unifM:              [null],
      mortCajaH:          [null],
      mortCajaM:          [null],
      raza:               [''],
      anoTablaGenetica:   [null],
      linea:              [''],
      tipoLinea:          [''],
      codigoGuiaGenetica: [''],
      tecnico:            [''],
      mixtas:             [null],
      avesEncasetadas:    [null],
      loteErp:            [''],
      lineaGenetica:      ['']
    });
  }

  // Cargas
  private loadLotes(): void {
    this.loading = true;
    this.loteSvc.getAll()
      .pipe(finalize(() => this.loading = false))
      .subscribe(list => {
        this.lotes = list;
        this.recomputeList();

        // Cargar resúmenes de mortalidad en paralelo
        const calls = list.map(l => this.loteSvc.getResumenMortalidad(l.loteId));
        if (calls.length) {
          forkJoin(calls).subscribe({
            next: (resumenes) => {
              resumenes.forEach(r => { this.resumenMap[r.loteId] = r; });
            },
            error: () => { /* silencioso */ }
          });
        }
      });
  }

  // FILTROS (LISTA)
  get farmsFilteredL(): FarmDto[] {
    if (this.selectedCompanyId == null) return this.farms;
    return this.farms.filter(f => f.companyId === this.selectedCompanyId);
  }

  get nucleosFilteredL(): NucleoDto[] {
    if (this.selectedFarmId != null) {
      return this.nucleos.filter(n => n.granjaId === this.selectedFarmId);
    }
    if (this.selectedCompanyId != null) {
      const ids = new Set(this.farmsFilteredL.map(f => f.id));
      return this.nucleos.filter(n => ids.has(n.granjaId));
    }
    return this.nucleos;
  }

  get galponesFilteredL(): GalponDetailDto[] {
    let arr = this.galpones;
    if (this.selectedFarmId != null) {
      arr = arr.filter(g => g.granjaId === this.selectedFarmId);
    } else if (this.selectedCompanyId != null) {
      const ids = new Set(this.farmsFilteredL.map(f => f.id));
      arr = arr.filter(g => ids.has(g.granjaId));
    }
    if (this.selectedNucleoId != null) {
      arr = arr.filter(g => g.nucleoId === this.selectedNucleoId);
    }
    return arr;
  }

  onCompanyChangeList(val: number | null) {
    this.selectedCompanyId = val;
    if (this.selectedFarmId != null && !this.farmsFilteredL.some(f => f.id === this.selectedFarmId)) {
      this.selectedFarmId = null;
    }
    if (this.selectedNucleoId != null && !this.nucleosFilteredL.some(n => n.nucleoId === this.selectedNucleoId)) {
      this.selectedNucleoId = null;
    }
    if (this.selectedGalponId != null && !this.galponesFilteredL.some(g => g.galponId === this.selectedGalponId)) {
      this.selectedGalponId = null;
    }
    this.recomputeList();
  }

  onFarmChangeList(val: number | null) {
    this.selectedFarmId = val;
    if (this.selectedNucleoId != null && !this.nucleosFilteredL.some(n => n.nucleoId === this.selectedNucleoId)) {
      this.selectedNucleoId = null;
    }
    if (this.selectedGalponId != null && !this.galponesFilteredL.some(g => g.galponId === this.selectedGalponId)) {
      this.selectedGalponId = null;
    }
    this.recomputeList();
  }

  onNucleoChangeList(_val: string | null) {
    if (this.selectedGalponId != null && !this.galponesFilteredL.some(g => g.galponId === this.selectedGalponId)) {
      this.selectedGalponId = null;
    }
    this.recomputeList();
  }

  resetListFilters() {
    this.filtro = '';
    this.selectedCompanyId = null;
    this.selectedFarmId = null;
    this.selectedNucleoId = null;
    this.selectedGalponId = null;
    this.recomputeList();
  }

  recomputeList() {
    const term = this.normalize(this.filtro);
    let res = [...this.lotes];

    if (this.selectedCompanyId != null) {
      res = res.filter(l => this.farmById[l.granjaId]?.companyId === this.selectedCompanyId);
    }
    if (this.selectedFarmId != null) {
      res = res.filter(l => l.granjaId === this.selectedFarmId);
    }
    if (this.selectedNucleoId != null) {
      res = res.filter(l => (l.nucleoId ?? null) === this.selectedNucleoId);
    }
    if (this.selectedGalponId != null) {
      res = res.filter(l => (l.galponId ?? null) === this.selectedGalponId);
    }
    if (term) {
      res = res.filter(l => {
        const haystack = [
          l.loteId ?? '',
          l.loteNombre ?? '',
          this.nucleoMap[l.nucleoId ?? ''] ?? '',
          this.farmMap[l.granjaId] ?? '',
          this.galponMap[l.galponId ?? ''] ?? ''
        ].map(s => this.normalize(String(s))).join(' ');
        return haystack.includes(term);
      });
    }

    this.viewLotes = res;
  }

  // Acciones UI (DETALLE / MODAL)
  openDetail(lote: LoteDto): void {
    this.selectedLote = lote;
    this.resumenSelected = null;

    this.loteSvc.getResumenMortalidad(lote.loteId).subscribe({
      next: (r) => this.resumenSelected = r,
      error: () => this.resumenSelected = null
    });

    this.loteSvc.getReproductorasByLote(lote.loteId).subscribe(r => {
      this.lotesReproductora = r;
    });
  }

  openModal(l?: LoteDto): void {
    this.editing = l ?? null;

    if (l) {
      this.form.patchValue({
        ...l,
        fechaEncaset: l.fechaEncaset
          ? new Date(l.fechaEncaset).toISOString().substring(0, 10)
          : null
      });

      this.nucleosFiltrados  = this.nucleos.filter(n => n.granjaId === l.granjaId);
      this.filteredNucleos   = this.nucleosFiltrados;
      this.galponesFiltrados = this.galpones.filter(g =>
        g.granjaId === l.granjaId && g.nucleoId === String(l.nucleoId ?? '')
      );
      this.filteredGalpones = this.galponesFiltrados;

    } else {
      const ultimoId = this.lotes.length > 0
        ? Math.max(...this.lotes.map(x => +x.loteId || 0))
        : 0;
      const nuevoId = String(ultimoId + 1);

      this.form.reset({
        loteId: nuevoId,
        loteNombre: '',
        granjaId: null,
        nucleoId: null,
        galponId: null,
        regional: '',
        fechaEncaset: null,
        hembrasL: null,
        machosL: null,
        pesoInicialH: null,
        pesoInicialM: null,
        pesoMixto: null,
        unifH: null,
        unifM: null,
        mortCajaH: null,
        mortCajaM: null,
        raza: '',
        anoTablaGenetica: null,
        linea: '',
        tipoLinea: '',
        codigoGuiaGenetica: '',
        tecnico: '',
        mixtas: null,
        avesEncasetadas: null,
        loteErp: '',
        lineaGenetica: ''
      });

      this.nucleosFiltrados  = []; this.filteredNucleos  = [];
      this.galponesFiltrados = []; this.filteredGalpones = [];
    }

    this.modalOpen = true;
  }

  save(): void {
    if (this.form.invalid) return;

    const raw = this.form.value;
    const dto: CreateLoteDto | UpdateLoteDto = {
      ...raw,
      loteId: String(raw.loteId).trim(),
      granjaId: Number(raw.granjaId),
      nucleoId: raw.nucleoId ? String(raw.nucleoId) : undefined,
      galponId: raw.galponId ? String(raw.galponId) : undefined,
      fechaEncaset: raw.fechaEncaset
        ? new Date(raw.fechaEncaset + 'T00:00:00Z').toISOString()
        : undefined
    };

    const op$ = this.editing
      ? this.loteSvc.update(dto as UpdateLoteDto)
      : this.loteSvc.create(dto as CreateLoteDto);

    this.loading = true;
    op$.pipe(finalize(() => {
      this.loading = false;
      this.modalOpen = false;
      this.loadLotes();
    })).subscribe();
  }

  delete(l: LoteDto): void {
    if (!confirm(`¿Eliminar lote “${l.loteNombre}”?`)) return;
    this.loading = true;
    this.loteSvc.delete(l.loteId)
      .pipe(finalize(() => {
        this.loading = false;
        this.loadLotes();
      }))
      .subscribe();
  }

  // Helpers de vista
  calcularEdadSemanas(fechaEncaset?: string | Date | null): number {
    if (!fechaEncaset) return 0;
    const inicio = new Date(fechaEncaset);
    const hoy = new Date();
    const msSem = 1000 * 60 * 60 * 24 * 7;
    return Math.floor((hoy.getTime() - inicio.getTime()) / msSem) + 1;
  }

  calcularFase(fechaEncaset?: string | Date | null): 'Levante' | 'Producción' | 'Desconocido' {
    if (!fechaEncaset) return 'Desconocido';
    return this.calcularEdadSemanas(fechaEncaset) < 25 ? 'Levante' : 'Producción';
  }

  formatNumber(value: number | null | undefined): string {
    if (value == null) return '0';
    return value.toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  }

  formatOrDash(val?: number | null): string {
    return (val === null || val === undefined) ? '—' : this.formatNumber(val);
  }

  vivasH(l: LoteDto): number | null {
    const r = this.resumenMap[l.loteId];
    return r ? r.saldoHembras : null;
  }
  vivasM(l: LoteDto): number | null {
    const r = this.resumenMap[l.loteId];
    return r ? r.saldoMachos : null;
  }
  vivasTotales(l: LoteDto): number | null {
    const r = this.resumenMap[l.loteId];
    return r ? (r.saldoHembras + r.saldoMachos) : null;
  }

  getFarmName(id: number): string {
    return this.farmMap[id] || '–';
  }
  getNucleoName(id?: string | null): string {
    return id ? (this.nucleoMap[id] || '–') : '–';
  }
  getGalponName(id?: string | null): string {
    return id ? (this.galponMap[id] || '–') : '–';
  }

  actualizarEncasetadas(): void {
    const h = +this.form.get('hembrasL')?.value || 0;
    const m = +this.form.get('machosL')?.value || 0;
    const x = +this.form.get('mixtas')?.value  || 0;
    this.form.get('avesEncasetadas')?.setValue(h + m + x);
  }

  onGranjaChange(granjaId: number): void {
    this.nucleosFiltrados = this.nucleos.filter(n => n.granjaId === Number(granjaId));
    this.filteredNucleos  = this.nucleosFiltrados;
    this.form.get('nucleoId')?.setValue(null);
    this.galponesFiltrados = []; this.filteredGalpones = [];
    this.form.get('galponId')?.setValue(null);
  }

  onNucleoChange(nucleoId: string): void {
    const granjaId = this.form.get('granjaId')?.value;
    if (granjaId && nucleoId) {
      this.galponSvc.getByGranjaAndNucleo(Number(granjaId), nucleoId).subscribe(data => {
        this.galponesFiltrados = data;
        this.filteredGalpones = data;
        this.form.get('galponId')?.setValue(null);
      });
    } else {
      this.galponesFiltrados = []; this.filteredGalpones = [];
    }
  }

  private normalize(s: string): string {
    return (s || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }

  trackByLote = (_: number, l: LoteDto) => l.loteId;

  // Mantener enteros (por si llegan decimales desde otra fuente)
  formatearnumeroEntero(controlName: string): void {
    const valor = this.form.get(controlName)?.value;
    if (valor != null && valor !== '') {
      const valorEntero = Math.round(Number(valor));
      this.form.get(controlName)?.setValue(valorEntero);
    } else {
      this.form.get(controlName)?.setValue(null);
    }
  }
}
