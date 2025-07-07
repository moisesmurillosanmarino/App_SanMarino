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
import { FarmFilterPipe } from '../../pipes/farm-filter.pipe';


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
    FontAwesomeModule,
    FarmFilterPipe
  ],
  templateUrl: './farm-list.component.html',
  styleUrls: ['./farm-list.component.scss']
})
export class FarmListComponent implements OnInit {
  faPlus  = faPlus;
  faPen   = faPen;
  faTrash = faTrash;
  clienteFiltro: string = '';


  farms: FarmDto[] = [];
  loading = false;

  modalOpen = false;
  form!: FormGroup;
  editing: FarmDto | null = null;

  // **Opciones dinámicas**
  companyOptions: Company[]     = [];
  statusOptions: string[]       = [];

  // **Datos “quemados”** (puedes reemplazarlos por llamadas a API si los tienes)
  regionOptions: Option[] = [
    { id: 1, label: 'Centro' },
    { id: 2, label: 'Costa' },
    { id: 3, label: 'Occidente' },
    { id: 4, label: 'Oriente' },
    { id: 5, label: 'Ecuador' },
    { id: 6, label: 'Occidente' }
  ];

  zoneOptions: Option[] = [
    { id: 1, label: 'Cundinamarca' },
    { id: 2, label: 'Boyacá' },
    { id: 3, label: 'Tolima-Huila' },
    { id: 4, label: 'Córdoba-Sucre-Magdalena' },
    { id: 5, label: 'Eje Cafetero' },
    { id: 6, label: 'Norte de Santander' },
    { id: 7, label: 'Ecuador' }
  ];

  constructor(
    private fb: FormBuilder,
    private svc: FarmService,
    private companySvc: CompanyService,
    private mlSvc: MasterListService
  ) {}

  ngOnInit() {
    this.form = this.fb.group({
      id:          [null],
      companyId:   [null, Validators.required],
      name:        ['', Validators.required],
      regionalId:  [null, Validators.required],
      status:      ['', Validators.required],
      zoneId:      [null, Validators.required]
    });
    this.loadAll();
  }

  private loadAll() {
    this.loading = true;

    forkJoin({
      farms:    this.svc.getAll(),
      companies:this.companySvc.getAll(),
      master:   this.mlSvc.getByKey('status')
    })
    .pipe(finalize(() => this.loading = false))
    .subscribe(({ farms, companies, master }) => {
      this.farms          = farms;
      this.companyOptions = companies;
      this.statusOptions  = master.options;
    });
  }

  openModal(farm?: FarmDto) {
    this.editing = farm ?? null;
    if (farm) {
      this.form.patchValue(farm);
    } else {
      this.form.reset({
        id: null,
        companyId: null,
        name: '',
        regionalId: null,
        status: '',
        zoneId: null
      });
    }
    this.modalOpen = true;
  }

  save() {
    if (this.form.invalid) return;
    const v = this.form.value as FarmDto;
    this.loading = true;
    const op = this.editing
      ? this.svc.update(v)
      : this.svc.create(v);
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

  // **Helpers para la vista**
  companyName(id: number|null): string {
    const c = this.companyOptions.find(x => x.id === id);
    return c ? c.name : '';
  }
  regionLabel(id: number|null): string {
    const o = this.regionOptions.find(x => x.id === id);
    return o ? o.label : '';
  }
  zoneLabel(id: number|null): string {
    const o = this.zoneOptions.find(x => x.id === id);
    return o ? o.label : '';
  }
}
