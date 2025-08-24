import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  FormsModule
} from '@angular/forms';
import { finalize } from 'rxjs/operators';
import { SidebarComponent } from '../../../../shared/components/sidebar/sidebar.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faPlus, faPen, faTrash } from '@fortawesome/free-solid-svg-icons';

import {
  NucleoService,
  NucleoDto,
  CreateNucleoDto,
  UpdateNucleoDto
} from '../../services/nucleo.service';
import { FarmService, FarmDto } from '../../../farm/services/farm.service';
import { Company, CompanyService } from '../../../../core/services/company/company.service';
import { NucleoFilterPipe } from '../../pipe/nucleo-filter.pipe';

@Component({
  selector: 'app-nucleo-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SidebarComponent,
    FontAwesomeModule,
    NucleoFilterPipe
  ],
  templateUrl: './nucleo-list.component.html',
  styleUrls: ['./nucleo-list.component.scss']
})
export class NucleoListComponent implements OnInit {
  faPlus  = faPlus;
  faPen   = faPen;
  faTrash = faTrash;
  filtro: string = '';


  nucleos:    NucleoDto[] = [];
  farms:      FarmDto[]   = [];
  companies:  Company[]   = [];

  farmMap:    Record<number,string> = {};
  companyMap: Record<number,string> = {};

  loading    = false;
  modalOpen  = false;
  editing    : NucleoDto | null = null;
  form      !: FormGroup;

  constructor(
    private fb:          FormBuilder,
    private nucleoSvc:   NucleoService,
    private farmSvc:     FarmService,
    private companySvc:  CompanyService
  ) {}

  ngOnInit() {
    // Formulario
    this.form = this.fb.group({
      nucleoId:     ['', Validators.required],
      granjaId:     [null, Validators.required],
      nucleoNombre:['', Validators.required]
    });

    // Carga granjas y construye mapa
    this.farmSvc.getAll().subscribe(list => {
      this.farms = list;
      list.forEach(f => this.farmMap[f.id] = f.name);
      // tras tener granjas, cargar compañías
      this.companySvc.getAll().subscribe(clist => {
        this.companies = clist;
        clist.forEach(c => this.companyMap[c.id] = c.name);
      });
    });

    // Carga inicial de núcleos
    this.loadNucleos();
  }

  private loadNucleos() {
    this.loading = true;
    this.nucleoSvc.getAll()
      .pipe(finalize(() => this.loading = false))
      .subscribe(list => this.nucleos = list);
  }

  openModal(n?: NucleoDto) {
    this.editing = n ?? null;
    if (n) {
      this.form.patchValue(n);
    } else {
      this.form.reset({ nucleoId: '', granjaId: null, nucleoNombre: '' });
    }
    this.modalOpen = true;
  }

  save() {
    if (this.form.invalid) return;
    const v = this.form.value as NucleoDto;
    let op$;
    if (this.editing) {
      const dto: UpdateNucleoDto = v;
      op$ = this.nucleoSvc.update(dto);
    } else {
      const dto: CreateNucleoDto = v;
      op$ = this.nucleoSvc.create(dto);
    }
    this.loading = true;
    op$.pipe(finalize(() => {
        this.loading = false;
        this.modalOpen = false;
        this.loadNucleos();
      }))
      .subscribe();
  }

  delete(n: NucleoDto) {
    if (!confirm(`¿Eliminar el núcleo “${n.nucleoNombre}”?`)) return;
    this.loading = true;
    this.nucleoSvc.delete(n.nucleoId, n.granjaId)
      .pipe(finalize(() => {
        this.loading = false;
        this.loadNucleos();
      }))
      .subscribe();
  }

  // Métodos auxiliares para la plantilla
  getFarmName(granjaId: number): string {
    return this.farmMap[granjaId] || '–';
  }
  getCompanyName(granjaId: number): string {
    const farm = this.farms.find(f => f.id === granjaId);
    return farm ? (this.companyMap[farm.companyId] || '–') : '–';
  }
}
