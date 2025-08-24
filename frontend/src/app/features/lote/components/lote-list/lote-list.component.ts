// src/app/features/lote/lote-list.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  FormsModule
} from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { finalize } from 'rxjs/operators';

import { SidebarComponent } from '../../../../shared/components/sidebar/sidebar.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faPlus, faPen, faTrash, faTimes, faEye } from '@fortawesome/free-solid-svg-icons';

import {
  LoteService,
  LoteDto,
  CreateLoteDto,
  UpdateLoteDto
} from '../../services/lote.service';
import { FarmService, FarmDto } from '../../../farm/services/farm.service';
import { NucleoService, NucleoDto } from '../../../nucleo/services/nucleo.service';
import { GalponService, GalponDto } from '../../../galpon/services/galpon.service';
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
  // iconos
  faPlus  = faPlus;
  faPen   = faPen;
  faTrash = faTrash;
  faTimes = faTimes;
  faEye = faEye;

  selectedLote: any = null;
  filtro: string = '';

  // datos maestros
  farms:    FarmDto[]   = [];
  nucleos:  NucleoDto[] = [];
  galpones: GalponDto[] = [];
  tecnicos: UserDto[]   = [];
  lotesReproductora: LoteReproductoraDto[] = [];


  // mapas para mostrar nombres
  farmMap:   Record<number,string> = {};
  nucleoMap: Record<string,string> = {};
  galponMap: Record<string,string> = {};
  techMap:   Record<string,string> = {};

  // arrays filtrados
  filteredNucleos:  NucleoDto[]  = [];
  filteredGalpones: GalponDto[] = [];

  // lotes
  lotes: LoteDto[] = [];

// Nucleos y galpones filtrados para el formulario
  nucleosFiltrados: NucleoDto[] = [];
  galponesFiltrados: GalponDto[] = [];

  granjas: any[] = []; // Si aún no tienes declarado esto

  // UI state
  loading   = false;
  modalOpen = false;
  editing: LoteDto | null = null;

  form!: FormGroup;

  constructor(
    private fb:        FormBuilder,
    private loteSvc:   LoteService,
    private farmSvc:   FarmService,
    private nucleoSvc: NucleoService,
    private galponSvc: GalponService,
    private userSvc:   UserService
  ) {}

  ngOnInit() {
    // 1) Inicializa el formulario
    this.form = this.fb.group({
      loteId:             ['',],
      loteNombre:         ['', ],
      granjaId:           [null, ],
      nucleoId:           [null, ],
      galponId:           [null, ],
      regional:           [''],
      fechaEncaset:       [null, ],
      hembrasL:           [null, ],
      machosL:            [null, ],
      pesoInicialH:       [null],
      pesoInicialM:       [null],
      pesoMixto:          [null],  // ✅ FALTANTE
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
      loteErp:            [''],     // ✅ FALTANTE
      lineaGenetica:      ['']      // ✅ FALTANTE
    });

    // 2) Carga datos maestros y lotes
    this.loadDependencies();
    this.loadLotes();
    this.form.get('granjaId')!.valueChanges.subscribe(granjaId => {
      console.log('✅ Granja seleccionada:', granjaId);
      this.nucleosFiltrados = this.nucleos.filter(n => n.granjaId === Number(granjaId));
      console.log('🔍 Núcleos filtrados:', this.nucleosFiltrados);

      const primerNucleo = this.nucleosFiltrados[0]?.nucleoId || null;
      this.form.patchValue({ nucleoId: primerNucleo });  // Selección automática
      this.galponesFiltrados = [];
      this.form.get('galponId')?.setValue(null);
    });

    this.form.get('nucleoId')!.valueChanges.subscribe(nucleoId => {
      const granjaId = Number(this.form.get('granjaId')!.value);
      console.log('✅ Núcleo seleccionado:', nucleoId, 'de Granja:', granjaId);

      if (granjaId && nucleoId) {
        this.galponSvc.getByGranjaAndNucleo(granjaId, nucleoId).subscribe(data => {
          this.galponesFiltrados = data;
          console.log('📦 Galpones filtrados:', data);

          const primerGalpon = this.galponesFiltrados[0]?.galponId || null;
          this.form.patchValue({ galponId: primerGalpon });  // Selección automática
        });
      } else {
        this.galponesFiltrados = [];
        this.form.get('galponId')?.setValue(null);
      }
    });

    // 6) Para monitorear la suma de aves encasetadas
    this.form.get('hembrasL')!.valueChanges.subscribe(val => {
      console.log('🐔 Hembra:', val);
      this.actualizarEncasetadas();
    });

    this.form.get('machosL')!.valueChanges.subscribe(val => {
      console.log('🐓 Macho:', val);
      this.actualizarEncasetadas();
    });

    this.form.get('mixtas')?.valueChanges.subscribe(val => {
      console.log('🐥 Mixtas:', val);
      this.actualizarEncasetadas();
    });
  }


  //parceo de numero  con puntos
  parseNumber(value: string | null): number | null {
    if (!value) return null;
    return Number(value.replace(/\./g, '').replace(/,/g, '.'));
  }
  //parceo de

  openDetail(lote: any) {
    this.selectedLote = lote;
    this.loteSvc.getReproductorasByLote(lote.loteId).subscribe(r => {
      this.lotesReproductora = r;
    });
  }

  private loadDependencies() {
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

  private loadLotes() {
    this.loading = true;
    this.loteSvc.getAll()
      .pipe(finalize(() => this.loading = false))
      .subscribe(list => this.lotes = list);
  }

  openModal(l?: LoteDto) {
    this.editing = l ?? null;

    if (l) {
      // parchea el formulario y prefiltra
      this.form.patchValue({
        ...l,
        fechaEncaset: l.fechaEncaset
        ? new Date(l.fechaEncaset).toISOString().substring(0, 10)
        : null
      });
      // prefiltro de encadenados
      this.filteredNucleos  = this.nucleos.filter(n => n.granjaId === l.granjaId);
      this.filteredGalpones = this.galpones.filter(g =>
        g.granjaId === l.granjaId &&
        (Number(g.galponNucleoId) === Number(l.nucleoId))
      );
    } else {
      // calcular nuevo ID
      const ultimoId = this.lotes.length > 0
        ? Math.max(...this.lotes.map(l => +l.loteId || 0))
        : 0;

      const nuevoId = ultimoId + 1;
      // reset total
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
      this.filteredNucleos  = [];
      this.filteredGalpones = [];
    }

    this.modalOpen = true;
  }

  private buildCreateDto(raw: any): CreateLoteDto {
    // raw.fechaEncaset === "2025-06-09"
    const fecha = raw.fechaEncaset
      ? new Date(raw.fechaEncaset + 'T00:00:00Z').toISOString()
      : undefined;

    return {
      loteId:            raw.loteId,
      loteNombre:        raw.loteNombre,
      granjaId:          raw.granjaId,
      nucleoId:          raw.nucleoId ? Number(raw.nucleoId) : undefined,
      galponId:          raw.galponId ? Number(raw.galponId) : undefined,
      regional:          raw.regional || 'Ocidente',
      fechaEncaset:      fecha,   // ahora es string|undefined
      hembrasL:          raw.hembrasL,
      machosL:           raw.machosL,
      pesoInicialH:      raw.pesoInicialH,
      pesoInicialM:      raw.pesoInicialM,
      unifH:             raw.unifH,
      unifM:             raw.unifM,
      mortCajaH:         raw.mortCajaH,
      mortCajaM:         raw.mortCajaM,
      raza:              raw.raza || undefined,
      anoTablaGenetica:  raw.anoTablaGenetica,
      linea:             raw.linea || undefined,
      tipoLinea:         raw.tipoLinea || undefined,
      codigoGuiaGenetica:raw.codigoGuiaGenetica || undefined,
      tecnico:           raw.tecnico || undefined
    };
  }

  save(): void {
    if (this.form.invalid) return;

    const raw = this.form.value;

    const dto: CreateLoteDto | UpdateLoteDto = {
      ...raw,
      loteId: String(raw.loteId).trim(), // 🔐 Asegura string
      granjaId: Number(raw.granjaId),
      nucleoId: raw.nucleoId !== null ? Number(raw.nucleoId) : undefined,
      galponId: raw.galponId !== null ? Number(raw.galponId) : undefined,
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


  delete(l: LoteDto) {
    if (!confirm(`¿Eliminar lote “${l.loteNombre}”?`)) return;
    this.loading = true;
    this.loteSvc.delete(l.loteId)
      .pipe(finalize(() => {
        this.loading = false;
        this.loadLotes();
      }))
      .subscribe();
  }

    // Calcular la edad en semanas desde la fecha de encaset
  calcularEdadSemanas(fechaEncaset?: string | Date | null): number {
    if (!fechaEncaset) return 0;
    const fechaInicio = new Date(fechaEncaset);
    const hoy = new Date();
    const msPorSemana = 1000 * 60 * 60 * 24 * 7;
    const semanas = Math.floor((hoy.getTime() - fechaInicio.getTime()) / msPorSemana);
    return semanas + 1; // Para que la semana mínima sea 1
  }

  // Determinar si está en fase de Levante o Producción
  calcularFase(fechaEncaset?: string | Date | null): 'Levante' | 'Producción' | 'Desconocido' {
    if (!fechaEncaset) return 'Desconocido';
    const semanas = this.calcularEdadSemanas(fechaEncaset);
    return semanas < 25 ? 'Levante' : 'Producción';
  }

  // Calcular el total de aves sumando hembras y machos
  calcularTotalAves(hembras: number | null | undefined, machos: number | null | undefined): number {
    return (hembras || 0) + (machos || 0);
  }

  // Formatear número con separador de miles (p.ej. 12.500,00)
  formatNumber(value: number | null): string {
    if (value === null || value === undefined) return '';
    return value.toLocaleString('es-CO', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
  }

  // Obtener nombre de granja
  getFarmName(id: number): string {
    return this.farmMap[id] || '–';
  }

  // Obtener nombre de núcleo
  getNucleoName(id?: number): string {
    return id != null ? this.nucleoMap[id.toString()] || '–' : '–';
  }

  // Obtener nombre de galpón
  getGalponName(id?: number): string {
    return id != null ? this.galponMap[id.toString()] || '–' : '–';
  }

  // Obtener nombre de técnico
  getTecnicoName(id: string): string {
    return this.techMap[id] || '–';
  }

  actualizarEncasetadas(): void {
    const hembras = +this.form.get('hembrasL')?.value || 0;
    const machos = +this.form.get('machosL')?.value || 0;
    const mixtas = +this.form.get('mixtas')?.value || 0;
    const total = hembras + machos + mixtas;
    this.form.get('avesEncasetadas')?.setValue(total);
  }

  onGranjaChange(granjaId: number): void {
    this.nucleosFiltrados = this.nucleos.filter(n => n.granjaId === granjaId);
    this.form.get('nucleoId')?.setValue(null);
    this.galponesFiltrados = [];
    this.form.get('galponId')?.setValue(null);
  }


  onNucleoChange(nucleoId: string): void {
    const granjaId = this.form.get('granjaId')?.value;
    if (granjaId && nucleoId) {
      this.galponSvc.getByGranjaAndNucleo(granjaId, nucleoId).subscribe(data => {
        this.galponesFiltrados = data;
        this.form.get('galponId')?.setValue(null);
      });
    } else {
      this.galponesFiltrados = [];
    }
  }

}
