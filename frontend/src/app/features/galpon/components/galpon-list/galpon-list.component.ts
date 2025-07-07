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
import { faPlus, faPen, faTrash,faEye  } from '@fortawesome/free-solid-svg-icons';

import {
  GalponService,
  GalponDto,
  CreateGalponDto,
  UpdateGalponDto
} from '../../services/galpon.service';
import {
  NucleoService,
  NucleoDto
} from '../../../nucleo/services/nucleo.service';
import {
  FarmService,
  FarmDto
} from '../../../farm/services/farm.service';
import { GalponFilterPipe } from '../../pipe/galpon-filter.pipe';
import {  CompanyService,Company } from '../../../../core/services/company/company.service';
import { MasterListService } from '../../../../core/services/master-list/master-list.service';

interface Option {
  id: string;
  label: string;
  granjaId: number;
}

@Component({
  selector: 'app-galpon-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SidebarComponent,
    FontAwesomeModule,
    FormsModule,
    GalponFilterPipe
  ],
  templateUrl: './galpon-list.component.html',
  styleUrls: ['./galpon-list.component.scss']
})
export class GalponListComponent implements OnInit {
  faPlus  = faPlus;
  faPen   = faPen;
  faTrash = faTrash;
  faEye = faEye;

  galpones: GalponDto[] = [];

  allNucleos: NucleoDto[] = [];
  farms: FarmDto[] = [];
  companies: Company[] = [];


  nucleoOptions: Option[] = [];
  nucleoMap: Record<string, string> = {};

  loading = false;
  filterText = '';

  // modal & form
  modalOpen = false;
  form!: FormGroup;
  editing: GalponDto | null = null;
  filtro: string = '';
  typegarponOptions: string[] = [];

  detailOpen = false;
  selectedDetail: GalponDto | null = null;

  constructor(
    private fb: FormBuilder,
    private svc: GalponService,
    private nucleoSvc: NucleoService,
    private farmSvc: FarmService,
    private companySvc: CompanyService,
     private mlSvc: MasterListService,    // inyectamos el servicio de master-lists
  ) {}

  ngOnInit() {
    // Inicializa form
    this.form = this.fb.group({
      galponId:       ['', Validators.required],
      galponNombre:   ['', Validators.required],
      galponNucleoId: ['', Validators.required],
      granjaId:       [null, Validators.required],
      ancho:          ['', Validators.required],
      largo:          ['', Validators.required],
      tipoGalpon:     ['', Validators.required]
    });

    // Cargo farms + nucleos antes de cargar galpones
    forkJoin({
      farms:    this.farmSvc.getAll(),
      nucleos:  this.nucleoSvc.getAll(),
      companies: this.companySvc.getAll()
    }).subscribe(({ farms, nucleos, companies }) => {
      this.farms = farms;
      this.allNucleos = nucleos;
      this.companies = companies;

      // Mapa farmId → nombre
      const farmMap = farms.reduce((m, f) => {
        m[f.id] = f.name;
        return m;
      }, {} as Record<number, string>);

      this.nucleoOptions = nucleos.map(n => ({
        id: n.nucleoId,
        granjaId: n.granjaId,
        label: `${n.nucleoNombre}`
      }));

      this.nucleoMap = nucleos.reduce((m, n) => {
        m[n.nucleoId] = `${n.nucleoNombre} (${farmMap[n.granjaId]})`;
        return m;
      }, {} as Record<string, string>);

      this.form.get('galponNucleoId')!
        .valueChanges
        .subscribe(id => {
          const sel = this.allNucleos.find(x => x.nucleoId === id);
          if (sel) {
            this.form.patchValue({ granjaId: sel.granjaId }, { emitEvent: false });
          }
        });

      this.loadGalpones();
    });

    // 2) Carga los tipos de identificación del master-list con key "identi-select"
    this.mlSvc.getByKey('type_galpon').subscribe({
      next: ml => this.typegarponOptions = ml.options,
      error: err => console.error('No pude cargar tipos de galpon', err)
    });
  }

  private loadGalpones() {
    this.loading = true;
    this.svc.getAll()
      .pipe(finalize(() => this.loading = false))
      .subscribe(list => this.galpones = list);
  }

  openModal(g?: GalponDto) {
    this.editing = g ?? null;

    if (g) {
      this.form.patchValue(g);
    } else {
      const lastId = this.galpones
        .map(g => parseInt(g.galponId.replace(/\D/g, '')))
        .reduce((max, cur) => cur > max ? cur : max, 0);
      const newId = `G${(lastId + 1).toString().padStart(4, '0')}`;

      this.form.reset({
        galponId:       newId,
        galponNucleoId: '',
        galponNombre:   '',
        granjaId:       null,
        ancho:          '',
        largo:          '',
        tipoGalpon:     ''
      });
    }
    this.modalOpen = true;
  }

  showDetail(g: GalponDto) {
    this.selectedDetail = g;
    this.detailOpen = true;
  }

  save() {
    if (this.form.invalid) return;
    const v = this.form.value as CreateGalponDto | UpdateGalponDto;

    this.loading = true;
    let call$ = this.svc.create(v as CreateGalponDto);
    if (this.editing) {
      call$ = this.svc.update(v as UpdateGalponDto);
    }

    call$
      .pipe(finalize(() => {
        this.loading = false;
        this.modalOpen = false;
        this.loadGalpones();
      }))
      .subscribe();
  }

  delete(id: string) {
    if (!confirm('¿Eliminar este galpón?')) return;
    this.loading = true;
    this.svc.delete(id)
      .pipe(finalize(() => this.loadGalpones()))
      .subscribe();
  }

  /** Info del núcleo seleccionado */
  get selectedNucleoInfo(): NucleoDto | undefined {
    const id = this.form.get('galponNucleoId')!.value;
    return this.allNucleos.find(n => n.nucleoId === id);
  }

  // Métodos auxiliares para la vista
  getCompanyNameByGalpon(g: GalponDto): string {
    const nucleo = this.allNucleos.find(n => n.nucleoId === g.galponNucleoId);
    const farm = this.farms.find(f => f.id === nucleo?.granjaId);
    const company = this.companies.find(c => c.id === farm?.companyId);
    return company?.name || '–';
  }

  getNucleoNameByGalpon(g: GalponDto): string {
    const nucleo = this.allNucleos.find(n => n.nucleoId === g.galponNucleoId);
    return nucleo?.nucleoNombre || '–';
  }

  getGranjaNameByGalpon(g: GalponDto): string {
    const nucleo = this.allNucleos.find(n => n.nucleoId === g.galponNucleoId);
    const farm = this.farms.find(f => f.id === nucleo?.granjaId);
    return farm?.name || '–';
  }

  getArea(g: GalponDto | null): string {
    if (!g?.ancho || !g?.largo) return '–';

    const ancho = parseFloat(g.ancho);
    const largo = parseFloat(g.largo);

    if (isNaN(ancho) || isNaN(largo)) return '–';

    return (ancho * largo).toFixed(2);
  }

  getGranjaNombreByNucleoId(nucleoId: string): string {
    const nucleo = this.allNucleos.find(n => n.nucleoId === nucleoId);
    const granja = this.farms.find(f => f.id === nucleo?.granjaId);
    return granja?.name || '–';
  }


}
