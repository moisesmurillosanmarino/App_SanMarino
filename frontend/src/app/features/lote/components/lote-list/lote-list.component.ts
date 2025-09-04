import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule
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
import { LoteReproductoraDto } from '../../../lote-reproductora/services/lote-reproductora.service';
import { LoteFilterPipe } from '../../pipes/loteFilter.pipe';

@Component({
  selector: 'app-lote-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    HttpClientModule,
    SidebarComponent,
    FontAwesomeModule,
    LoteFilterPipe,
    FormsModule
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

  // Filtro
  filtro = '';

  // Formularios
  form!: FormGroup;

  // Datos maestros
  farms:    FarmDto[]   = [];
  nucleos:  NucleoDto[] = [];
  galpones: GalponDetailDto[] = [];
  tecnicos: UserDto[]   = [];

  // Mapas de nombres
  farmMap:   Record<number, string> = {};
  nucleoMap: Record<string, string> = {};
  galponMap: Record<string, string> = {};
  techMap:   Record<string, string> = {};

  // Lotes
  lotes: LoteDto[] = [];
  lotesReproductora: LoteReproductoraDto[] = [];


  // Filtros en cascada
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
    private userSvc:   UserService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadDependencies();
    this.loadLotes();

    // Encadenados: granja -> núcleos
    this.form.get('granjaId')!.valueChanges.subscribe(granjaId => {
      this.nucleosFiltrados = this.nucleos.filter(n => n.granjaId === Number(granjaId));
      this.filteredNucleos  = this.nucleosFiltrados;
      const primerNucleo = this.nucleosFiltrados[0]?.nucleoId ?? null;
      this.form.patchValue({ nucleoId: primerNucleo });

      this.galponesFiltrados = [];
      this.filteredGalpones  = [];
      this.form.get('galponId')?.setValue(null);
    });

    // núcleo -> galpones
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

    // Recalculador de aves encasetadas
    this.form.get('hembrasL')!.valueChanges.subscribe(() => this.actualizarEncasetadas());
    this.form.get('machosL')!.valueChanges.subscribe(() => this.actualizarEncasetadas());
    this.form.get('mixtas')!.valueChanges.subscribe(() => this.actualizarEncasetadas());
  }

  // --------------------------
  // Init
  // --------------------------
  private initForm(): void {
    this.form = this.fb.group({
      loteId:             ['', Validators.required],
      loteNombre:         ['', Validators.required],
      granjaId:           [null, Validators.required],
      nucleoId:           [null],   // string|null
      galponId:           [null],   // string|null
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

  // --------------------------
  // Cargas
  // --------------------------
  private loadDependencies(): void {
    this.farmSvc.getAll().subscribe(list => {
      this.farms = list;
      list.forEach(f => this.farmMap[f.id] = f.name);
    });

    this.nucleoSvc.getAll().subscribe(list => {
      this.nucleos = list;
      list.forEach(n => this.nucleoMap[n.nucleoId] = n.nucleoNombre);
    });

    this.galponSvc.getAll().subscribe(list => {
      this.galpones = list;
      list.forEach(g => this.galponMap[g.galponId] = g.galponNombre);
    });

    this.userSvc.getAll().subscribe(list => {
      this.tecnicos = list;
      list.forEach(u => this.techMap[u.id] = `${u.surName} ${u.firstName}`);
    });
  }

  private loadLotes(): void {
    this.loading = true;
    this.loteSvc.getAll()
      .pipe(finalize(() => this.loading = false))
      .subscribe(list => {
        this.lotes = list;

        // Cargar resúmenes de mortalidad en paralelo
        const calls = list.map(l => this.loteSvc.getResumenMortalidad(l.loteId));
        if (calls.length) {
          forkJoin(calls).subscribe({
            next: (resumenes) => {
              resumenes.forEach(r => { this.resumenMap[r.loteId] = r; });
            },
            error: () => {
              // Silencio: si falla algún resumen, la UI mostrará "—"
            }
          });
        }
      });
  }

  // --------------------------
  // Acciones UI
  // --------------------------
  openDetail(lote: LoteDto): void {
    this.selectedLote = lote;
    this.resumenSelected = null;

    // Resumen del lote para el panel de detalle
    this.loteSvc.getResumenMortalidad(lote.loteId).subscribe({
      next: (r) => this.resumenSelected = r,
      error: () => this.resumenSelected = null
    });

    // Lotes reproductora asociados
    this.loteSvc.getReproductorasByLote(lote.loteId).subscribe(r => {
      this.lotesReproductora = r;
    });
  }

  openModal(l?: LoteDto): void {
    this.editing = l ?? null;

    if (l) {
      // Edición
      this.form.patchValue({
        ...l,
        fechaEncaset: l.fechaEncaset
          ? new Date(l.fechaEncaset).toISOString().substring(0, 10)
          : null
      });

      // Prefiltros para selects en cascada
      this.nucleosFiltrados  = this.nucleos.filter(n => n.granjaId === l.granjaId);
      this.filteredNucleos   = this.nucleosFiltrados;
      this.galponesFiltrados = this.galpones.filter(g =>
        g.granjaId === l.granjaId && g.nucleoId === String(l.nucleoId ?? '')
      );
      this.filteredGalpones = this.galponesFiltrados;

    } else {
      // Creación: id incremental simple (basado en la tabla cargada)
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

  // --------------------------
  // Helpers de vista
  // --------------------------
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

  trackByLote = (_: number, l: LoteDto) => l.loteId;
}
