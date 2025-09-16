// src/app/features/farm/pages/farm-list/farm-list.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { finalize, forkJoin } from 'rxjs';

import { SidebarComponent } from '../../../../shared/components/sidebar/sidebar.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faPlus, faPen, faTrash } from '@fortawesome/free-solid-svg-icons';

import { FarmService, FarmDto, UpdateFarmDto } from '../../services/farm.service';
import { Company, CompanyService } from '../../../../core/services/company/company.service';
import { MasterListService } from '../../../../core/services/master-list/master-list.service';
import { DepartamentoService, DepartamentoDto } from '../../services/departamento.service';
import { CiudadService, CiudadDto } from '../../services/ciudad.service';

@Component({
  selector: 'app-farm-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SidebarComponent,
    FontAwesomeModule,
  ],
  templateUrl: './farm-list.component.html',
  styleUrls: ['./farm-list.component.scss'],
})
export class FarmListComponent implements OnInit {
  // Icons
  faPlus = faPlus;
  faPen  = faPen;
  faTrash = faTrash;

  // Estado general
  loading = false;
  embedded = false; // por si esta vista se embebe en otra

  // Datos base
  farms: FarmDto[] = [];
  companies: Company[] = [];
  regionales: string[] = [];    // opciones de regional como texto
  departamentos: DepartamentoDto[] = [];
  ciudades: CiudadDto[] = [];

  // Vista filtrada
  viewFarms: FarmDto[] = [];

  // Filtros (coinciden con el HTML)
  selectedRegional: string | null = null;
  filtroNombre = '';
  filtroEstado: 'A' | 'I' | '' = '';
  filtroTexto = '';

  // Modal / form
  modalOpen = false;
  form!: FormGroup;
  editing: FarmDto | null = null;

  constructor(
    private readonly fb: FormBuilder,
    private readonly farmSvc: FarmService,
    private readonly companySvc: CompanyService,
    private readonly masterSvc: MasterListService,
    private readonly dptoSvc: DepartamentoService,
    private readonly ciudadSvc: CiudadService
  ) {}

  ngOnInit(): void {
    this.buildForm();
    this.loadAll();
  }

  // ---------------------------
  // Init
  // ---------------------------
  private buildForm(): void {
    this.form = this.fb.group({
      id:             [null],
      companyId:      [null, Validators.required],
      name:           ['', [Validators.required, Validators.maxLength(200)]],
      regional:       [''], // guardamos texto; si usas ID, puedes mapear antes de enviar
      status:         ['A', Validators.required], // A/I
      department:     [''],
      city:           [''],

      // si tu API exige IDs:
      departamentoId: [null],
      ciudadId:       [null],
    });
  }

  private loadAll(): void {
    this.loading = true;
    forkJoin({
      farms:     this.farmSvc.getAll(),                 // lista granjas
      companies: this.companySvc.getAll(),              // compañías
      statusMl:  this.masterSvc.getByKey('status'),     // estados (A/I)
      regionMl:  this.masterSvc.getByKey('region_option_key'), // regiones
      dptos:     this.dptoSvc.getAll(),                 // departamentos
    })
    .pipe(finalize(() => (this.loading = false)))
    .subscribe(({ farms, companies, regionMl, dptos }) => {
      this.farms     = farms ?? [];
      this.companies = companies ?? [];
      this.regionales = this.normalizeRegionStrings(regionMl);
      this.departamentos = dptos ?? [];

      this.recomputeList();
    });
  }

  // Normaliza lista de regiones a string[]
  private normalizeRegionStrings(src: any): string[] {
    const raw = src?.options ?? src ?? [];
    if (!Array.isArray(raw)) return [];
    if (raw.length && typeof raw[0] === 'object') {
      return raw.map((o: any) => String(o.label ?? o.name ?? o.text ?? o.value ?? o.id));
    }
    return raw.map((x: any) => String(x));
  }

  // ---------------------------
  // Filtros / vista
  // ---------------------------
  recomputeList(): void {
    const nameFilter = (this.filtroNombre || '').trim().toLowerCase();
    const text = (this.filtroTexto || '').trim().toLowerCase();
    const selectedRegional = (this.selectedRegional || '').toLowerCase();
    const estado = this.filtroEstado;

    this.viewFarms = (this.farms ?? []).filter((f) => {
      const regionalTxt = (f.regional ?? '').toLowerCase();
      const nombreTxt = (f.name ?? '').toLowerCase();
      const companyTxt = (this.companyName(f.companyId) ?? '').toLowerCase();
      const deptTxt = (f.department ?? '').toLowerCase();
      const cityTxt = (f.city ?? '').toLowerCase();

      const okRegional = selectedRegional ? regionalTxt === selectedRegional : true;
      const okNombre = nameFilter ? nombreTxt.includes(nameFilter) : true;
      const okEstado = estado ? f.status === estado : true;

      // búsqueda libre
      const okText = text
        ? (nombreTxt.includes(text) || regionalTxt.includes(text) || companyTxt.includes(text) || deptTxt.includes(text) || cityTxt.includes(text))
        : true;

      return okRegional && okNombre && okEstado && okText;
    });
  }

  resetFilters(): void {
    this.selectedRegional = null;
    this.filtroNombre = '';
    this.filtroEstado = '';
    this.filtroTexto = '';
    this.recomputeList();
  }

  // ---------------------------
  // Modal
  // ---------------------------
  openModal(farm?: FarmDto): void {
    this.editing = farm ?? null;

    if (farm) {
      // Edición
      this.form.reset({
        id: farm.id ?? null,
        companyId: farm.companyId ?? null,
        name: farm.name ?? '',
        regional: farm.regional ?? '',
        status: farm.status ?? 'A',
        department: farm.department ?? '',
        city: farm.city ?? '',
        departamentoId: farm.departamentoId ?? null,
        ciudadId: farm.ciudadId ?? null,
      });

      // Cargar ciudades si hay dptoId
      if (farm.departamentoId) {
        this.ciudadSvc.getByDepartamentoId(farm.departamentoId).subscribe((cs) => (this.ciudades = cs));
      } else {
        this.ciudades = [];
      }
    } else {
      // Nuevo
      this.form.reset({
        id: null,
        companyId: null,
        name: '',
        regional: '',
        status: 'A',
        department: '',
        city: '',
        departamentoId: null,
        ciudadId: null,
      });
      this.ciudades = [];
    }

    this.modalOpen = true;
  }

  cancel(): void {
    this.modalOpen = false;
    this.form.reset();
  }

  onDepartamentoChange(): void {
    const dptoId = this.form.get('departamentoId')?.value;
    this.form.patchValue({ ciudadId: null, city: '' });
    this.ciudades = [];
    if (dptoId != null) {
      this.ciudadSvc.getByDepartamentoId(+dptoId).subscribe((cs) => (this.ciudades = cs));
    }
  }

  // ---------------------------
  // Persistencia
  // ---------------------------
  // dentro de FarmListComponent
save(): void {
  if (this.form.invalid) {
    this.form.markAllAsTouched();
    return;
  }

  const raw = this.form.value;

  const base = {
    name: (raw.name ?? '').trim(),
    companyId: Number(raw.companyId),
    status: (raw.status ?? 'A') as 'A' | 'I',
    regional: (raw.regional ?? '') || null,
    regionalId: raw.regionalId ?? null,  // si algún día lo usas
    departamentoId: raw.departamentoId != null ? Number(raw.departamentoId) : null,
    ciudadId: raw.ciudadId != null ? Number(raw.ciudadId) : null,
    department: raw.department ?? null,
    city: raw.city ?? null,
  };

  this.loading = true;

  if (this.editing) {
    const dto = { id: this.editing.id, ...base };
    this.farmSvc.update(dto)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe(() => {
        this.modalOpen = false;
        this.loadAll();
      });
  } else {
    const dto = { ...base };
    this.farmSvc.create(dto)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe(() => {
        this.modalOpen = false;
        this.loadAll();
      });
  }
}


  delete(id: number): void {
    if (!confirm('¿Eliminar esta granja?')) return;
    this.loading = true;
    this.farmSvc
      .delete(id)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe(() => this.loadAll());
  }

  // ---------------------------
  // Helpers
  // ---------------------------
  companyName(id: number | null | undefined): string {
    if (id == null) return '';
    return this.companies.find((c) => c.id === id)?.name ?? '';
  }

  trackByFarm = (_: number, f: FarmDto) => f.id;
}
