import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  FormsModule
} from '@angular/forms';
import { finalize, forkJoin } from 'rxjs';

import { SidebarComponent } from '../../../../shared/components/sidebar/sidebar.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faPlus, faPen, faTrash } from '@fortawesome/free-solid-svg-icons';

import { FarmService, FarmDto } from '../../services/farm.service';
import { Company, CompanyService } from '../../../../core/services/company/company.service';
import { MasterListService } from '../../../../core/services/master-list/master-list.service';

import { DepartamentoService, DepartamentoDto } from '../../services/departamento.service';
import { CiudadService, CiudadDto } from '../../services/ciudad.service';

// 👇 Importa los componentes que se mostrarán en tabs
import { NucleoListComponent } from '../../../nucleo/components/nucleo-list/nucleo-list.component';
// Usa el path real que pegaste (pages/galpon-list)
import { GalponListComponent } from '../../../galpon/components/galpon-list/galpon-list.component';

interface Option { id: number; label: string; }

@Component({
  selector: 'app-farm-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    SidebarComponent,
    FontAwesomeModule,
    // 👇 habilita renderizado directo en tabs
    NucleoListComponent,
    GalponListComponent
  ],
  templateUrl: './farm-list.component.html',
  styleUrls: ['./farm-list.component.scss']
})
export class FarmListComponent implements OnInit {
  // Íconos
  faPlus  = faPlus;
  faPen   = faPen;
  faTrash = faTrash;

  // Tab activo local (sin router)
  activeTab: 'granjas' | 'nucleos' | 'galpones' = 'granjas';

  // Filtros
  filtroRegionalId: number | null = null;
  filtroNombre = '';
  filtroEstado = '';

  // Datos
  farms: FarmDto[] = [];
  loading = false;

  // Modal y formulario
  modalOpen = false;
  form!: FormGroup;
  editing: FarmDto | null = null;

  // Opciones dinámicas
  companyOptions: Company[] = [];
  statusOptions: string[]   = [];
  regionOptions: Option[]   = [];

  // Departamento / Ciudad
  departamentos: DepartamentoDto[] = [];
  ciudades: CiudadDto[] = [];

  constructor(
    private readonly fb: FormBuilder,
    private readonly svc: FarmService,
    private readonly companySvc: CompanyService,
    private readonly mlSvc: MasterListService,
    private readonly dptoSvc: DepartamentoService,
    private readonly ciudadSvc: CiudadService
  ) {}

  ngOnInit() {
    this.form = this.fb.group({
      id:             [null],
      companyId:      [null, Validators.required],
      name:           ['', Validators.required],
      regionalId:     [null as number | null, Validators.required],
      status:         ['', Validators.required],
      departamentoId: [null, Validators.required],
      ciudadId:       [null, Validators.required]
    });

    this.loadAll();
  }

  private loadAll() {
    this.loading = true;
    forkJoin({
      farms:         this.svc.getAll(),
      regionOptions: this.mlSvc.getByKey('region_option_key'),
      companies:     this.companySvc.getAll(),
      master:        this.mlSvc.getByKey('status'),
      dptos:         this.dptoSvc.getAll()
    })
    .pipe(finalize(() => (this.loading = false)))
    .subscribe(({ farms, companies, master, dptos, regionOptions }) => {
      this.farms          = farms ?? [];
      this.companyOptions = companies ?? [];
      this.statusOptions  = master?.options ?? [];
      this.departamentos  = dptos ?? [];
      this.regionOptions  = this.normalizeRegionOptions(regionOptions);
    });
  }

  private normalizeRegionOptions(src: any): Option[] {
    const raw = src?.options ?? src ?? [];
    if (!Array.isArray(raw)) return [];
    if (raw.length && typeof raw[0] === 'object' && ('id' in raw[0] || 'value' in raw[0])) {
      return raw.map((o: any, idx: number) => ({
        id: Number(o.id ?? o.value ?? idx + 1),
        label: String(o.label ?? o.name ?? o.text ?? o.descripcion ?? o.title ?? o.value ?? o.id)
      }));
    }
    return raw.map((txt: any, idx: number) => ({ id: idx + 1, label: String(txt) }));
  }

  // Lista filtrada (panel Granjas)
  get farmsFiltradas(): FarmDto[] {
    const nombre = this.filtroNombre.trim().toLowerCase();
    return (this.farms ?? []).filter(f => {
      const okRegional = this.filtroRegionalId != null ? f.regionalId === this.filtroRegionalId : true;
      const okNombre   = nombre ? (f.name?.toLowerCase().includes(nombre)) : true;
      const okEstado   = this.filtroEstado ? f.status === this.filtroEstado : true;
      return okRegional && okNombre && okEstado;
    });
  }

  // trackBy
  trackByFarm = (_: number, f: FarmDto) => f.id;

  openModal(farm?: FarmDto) {
    this.editing = farm ?? null;

    if (farm) {
      this.form.patchValue({
        id: farm.id ?? null,
        companyId: farm.companyId ?? null,
        name: farm.name ?? '',
        regionalId: farm.regionalId ?? null,
        status: farm.status ?? '',
        departamentoId: farm.departamentoId ?? null,
        ciudadId: farm.ciudadId ?? null
      });

      if (farm.departamentoId) {
        this.ciudadSvc.getByDepartamentoId(farm.departamentoId).subscribe(cs => (this.ciudades = cs));
      } else {
        this.ciudades = [];
      }
    } else {
      this.form.reset({
        id: null,
        companyId: null,
        name: '',
        regionalId: null,
        status: '',
        departamentoId: null,
        ciudadId: null
      });
      this.ciudades = [];
    }

    this.modalOpen = true;
  }

  onDepartamentoChange() {
    const dptoId = this.form.get('departamentoId')?.value;
    this.form.patchValue({ ciudadId: null });
    this.ciudades = [];
    if (dptoId != null) {
      this.ciudadSvc.getByDepartamentoId(+dptoId).subscribe(cs => (this.ciudades = cs));
    }
  }

  save() {
    if (this.form.invalid) return;

    const raw = this.form.value;
    const payload: FarmDto = {
      id: raw.id ?? null,
      companyId: raw.companyId != null ? +raw.companyId : null,
      name: (raw.name ?? '').trim(),
      regionalId: raw.regionalId != null ? +raw.regionalId : null,
      status: raw.status ?? '',
      departamentoId: raw.departamentoId != null ? +raw.departamentoId : null,
      ciudadId: raw.ciudadId != null ? +raw.ciudadId : null
    } as FarmDto;

    this.loading = true;
    const op$ = this.editing ? this.svc.update(payload) : this.svc.create(payload);

    op$
      .pipe(
        finalize(() => {
          this.loading = false;
          this.modalOpen = false;
          this.loadAll();
        })
      )
      .subscribe();
  }

  delete(id: number) {
    if (!confirm('¿Eliminar esta granja?')) return;
    this.loading = true;
    this.svc
      .delete(id)
      .pipe(
        finalize(() => {
          this.loading = false;
          this.loadAll();
        })
      )
      .subscribe();
  }

  // Helpers
  companyName(id: number | null): string {
    const c = this.companyOptions.find(x => x.id === id);
    return c ? c.name : '';
  }

  regionalLabel(id: number | null): string {
    if (id == null) return '';
    const r = this.regionOptions.find(x => x.id === id);
    return r ? r.label : String(id);
  }

  departamentoNombre(id: number | null): string {
    const d = this.departamentos.find(x => x.departamentoId === id);
    return d ? d.departamentoNombre : '';
  }

  ciudadNombre(id: number | null): string {
    const c = this.ciudades.find(x => x.municipioId === id);
    return c ? c.municipioNombre : '';
  }
}
