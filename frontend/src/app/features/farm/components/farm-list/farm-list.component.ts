// src/app/features/farm/components/farm-list/farm-list.component.ts
import { Component, OnInit } from '@angular/core';
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

interface Option {
  id: number;
  label: string;
}

@Component({
  selector: 'app-farm-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SidebarComponent,
    FormsModule,
    FontAwesomeModule
  ],
  templateUrl: './farm-list.component.html',
  styleUrls: ['./farm-list.component.scss']
})
export class FarmListComponent implements OnInit {
  faPlus  = faPlus;
  faPen   = faPen;
  faTrash = faTrash;

  // Filtros
  filtroRegionalId: number | null = null;
  filtroNombre: string = '';
  filtroEstado: string = '';

  // Datos
  farms: FarmDto[] = [];
  loading = false;

  modalOpen = false;
  form!: FormGroup;
  editing: FarmDto | null = null;

  // Opciones dinámicas
  companyOptions: Company[] = [];
  statusOptions: string[]   = [];

  // Opciones “quemadas” de regional (ajusta si ya vienen de API)
  regionOptions: Option[] = [
    { id: 1, label: 'Centro' },
    { id: 2, label: 'Costa' },
    { id: 3, label: 'Occidente' },
    { id: 4, label: 'Oriente' },
    { id: 5, label: 'Ecuador' },
    { id: 6, label: 'Occidente' }
  ];

  // Departamento / Ciudad
  departamentos: DepartamentoDto[] = [];
  ciudades: CiudadDto[] = [];

  constructor(
    private fb: FormBuilder,
    private svc: FarmService,
    private companySvc: CompanyService,
    private mlSvc: MasterListService,
    private dptoSvc: DepartamentoService,
    private ciudadSvc: CiudadService
  ) {}

  ngOnInit() {
    this.form = this.fb.group({
      id:             [null],
      companyId:      [null, Validators.required],
      name:           ['', Validators.required],
      regionalId:     [null, Validators.required],
      status:         ['', Validators.required],
      departamentoId: [null, Validators.required],
      ciudadId:       [null, Validators.required]
    });

    this.loadAll();
  }

  private loadAll() {
    this.loading = true;
    forkJoin({
      farms:     this.svc.getAll(),
      companies: this.companySvc.getAll(),
      master:    this.mlSvc.getByKey('status'),
      dptos:     this.dptoSvc.getAll()
    })
    .pipe(finalize(() => this.loading = false))
    .subscribe(({ farms, companies, master, dptos }) => {
      this.farms          = farms;
      this.companyOptions = companies;
      this.statusOptions  = master.options;
      this.departamentos  = dptos;
    });
  }

  get farmsFiltradas(): FarmDto[] {
    return this.farms.filter(f => {
      const okRegional = this.filtroRegionalId ? f.regionalId === this.filtroRegionalId : true;
      const okNombre   = this.filtroNombre
        ? (f.name?.toLowerCase().includes(this.filtroNombre.toLowerCase()))
        : true;
      const okEstado   = this.filtroEstado ? f.status === this.filtroEstado : true;
      return okRegional && okNombre && okEstado;
    });
  }

  openModal(farm?: FarmDto) {
    this.editing = farm ?? null;

    if (farm) {
      this.form.patchValue(farm);
      // cargar ciudades del departamento actual
      if (farm.departamentoId) {
        this.dptoSvc.getById(farm.departamentoId).subscribe(() => {
          this.ciudadSvc.getByDepartamentoId(farm.departamentoId!)
            .subscribe(cs => this.ciudades = cs);
        });
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
    if (dptoId) {
      this.ciudadSvc.getByDepartamentoId(dptoId).subscribe(cs => this.ciudades = cs);
    }
  }

  save() {
    if (this.form.invalid) return;
    const v = this.form.value as FarmDto;

    this.loading = true;
    const op = this.editing ? this.svc.update(v) : this.svc.create(v);
    op.pipe(finalize(() => {
        this.loading = false;
        this.modalOpen = false;
        this.loadAll();
      }))
      .subscribe();
  }

  delete(id: number) {
    if (!confirm('¿Eliminar esta granja?')) return;
    this.loading = true;
    this.svc.delete(id)
      .pipe(finalize(() => {
        this.loading = false;
        this.loadAll();
      }))
      .subscribe();
  }

  // Helpers
  companyName(id: number|null): string {
    const c = this.companyOptions.find(x => x.id === id);
    return c ? c.name : '';
  }
  regionLabel(id: number|null): string {
    const o = this.regionOptions.find(x => x.id === id);
    return o ? o.label : '';
  }
  departamentoNombre(id: number|null): string {
    const d = this.departamentos.find(x => x.id === id);
    return d ? d.nombre : '';
  }
  ciudadNombre(id: number|null): string {
    const c = this.ciudades.find(x => x.id === id);
    // si la lista de ciudades visible no corresponde (p.e. otra granja), intenta buscar rápido
    if (c) return c.nombre;
    return ''; // opcional: puedes mantener un cache global si lo necesitas
  }
}
