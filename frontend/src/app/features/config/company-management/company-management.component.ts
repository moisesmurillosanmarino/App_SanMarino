// src/app/features/config/company-management/company-management.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import {
  ReactiveFormsModule,
  FormsModule,
  FormBuilder,
  FormGroup,
  Validators
} from '@angular/forms';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import {
  FontAwesomeModule,
  FaIconLibrary
} from '@fortawesome/angular-fontawesome';
import {
  faBuilding,
  faMobileAlt,
  faPen,
  faTrash,
  faPlus
} from '@fortawesome/free-solid-svg-icons';
import { CompanyService, Company } from '../../../core/services/company/company.service';
import { MasterListService } from '../../../core/services/master-list/master-list.service';
import countriesData from '../company/countries.json';
import { finalize } from 'rxjs';

interface Country {
  code: string;
  name: string;
  states: { code: string; name: string; cities: string[] }[];
}

@Component({
  selector: 'app-company-management',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule,
    SidebarComponent,
    FontAwesomeModule
  ],
  templateUrl: './company-management.component.html',
  styleUrls: ['./company-management.component.scss']
})
export class CompanyManagementComponent implements OnInit {
  // Iconos
  faBuilding = faBuilding;
  faMobileAlt = faMobileAlt;
  faPen = faPen;
  faTrash = faTrash;
  faPlus = faPlus;

  // Formulario y datos
  form!: FormGroup;
  list: Company[] = [];
  editing = false;
  modalOpen = false;
  loading = false;

  // Países / estados / ciudades
  countries: Country[] = countriesData;
  states: Country['states'] = [];
  cities: string[] = [];

  // Permisos
  allModules = [
    { key: 'dashboard', label: 'Dashboard' },
    { key: 'reports', label: 'Reportes' },
    { key: 'farms', label: 'Granjas' },
    { key: 'users', label: 'Usuarios' }
  ];

  // ← NUEVO: almacenamiento de los tipos de identificación
  identificationOptions: string[] = [];

  constructor(
    private fb: FormBuilder,
    private svc: CompanyService,
    private mlSvc: MasterListService,    // inyectamos el servicio de master-lists
    library: FaIconLibrary
  ) {
    library.addIcons(faBuilding, faMobileAlt, faPen, faTrash, faPlus);
  }

  ngOnInit(): void {
    // 1) Inicializa el formulario
    this.form = this.fb.group({
      id:            [null],
      name:          ['', Validators.required],
      identifier:    ['', Validators.required],  // número de documento
      documentType:  ['', Validators.required],  // tipo de documento
      address:       [''],
      phone:         [''],
      email:         ['', Validators.email],
      country:       [''],
      state:         [''],
      city:          [''],
      visualPermissions: this.fb.group(
        this.allModules.reduce((m, mod) => {
          m[mod.key] = [false];
          return m;
        }, {} as Record<string, any>)
      ),
      mobileAccess: [false]
    });

    // 2) Carga los tipos de identificación del master-list con key "identi-select"
    this.mlSvc.getByKey('type_identit').subscribe({
      next: ml => this.identificationOptions = ml.options,
      error: err => console.error('No pude cargar tipos de ID', err)
    });

    // 3) Finalmente, trae las empresas
    this.loadCompanies();
  }

  private loadCompanies() {
    this.loading = true;
    this.svc.getAll()
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: data => this.list = data,
        error: err => console.error('Error cargando empresas', err)
      });
  }

  openModal(c?: Company) {
    this.editing = !!c;
    if (c) {
      this.onCountryChange(c.country);
      this.onStateChange(c.state);
      this.form.patchValue({
        ...c,
        documentType: c.documentType
      });
    } else {
      this.form.reset({
        id: null,
        name: '',
        identifier: '',
        documentType: '',
        address: '',
        phone: '',
        email: '',
        country: '',
        state: '',
        city: '',
        mobileAccess: false
      });
      this.states = [];
      this.cities = [];
    }
    this.modalOpen = true;
  }

  save() {
    if (this.form.invalid) return;
    const v = this.form.value;
    const perms = Object.entries(v.visualPermissions)
      .filter(([_, ok]) => ok)
      .map(([key]) => key);

    const comp: Company = {
      id: v.id,
      name: v.name,
      identifier: v.identifier,
      documentType: v.documentType,
      address: v.address,
      phone: v.phone,
      email: v.email,
      country: v.country,
      state: v.state,
      city: v.city,
      visualPermissions: perms,
      mobileAccess: v.mobileAccess
    };

    this.loading = true;
    const call$ = this.editing
      ? this.svc.update(comp)
      : this.svc.create(comp);

    call$
      .pipe(finalize(() => {
        this.loading = false;
        this.modalOpen = false;
      }))
      .subscribe({
        next: () => this.loadCompanies(),
        error: err => console.error('Error guardando empresa', err)
      });
  }

  delete(id: number) {
    if (!confirm('¿Eliminar esta empresa?')) return;
    this.loading = true;
    this.svc.delete(id)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: () => this.loadCompanies(),
        error: err => console.error('Error eliminando empresa', err)
      });
  }

  closeModal() {
    this.modalOpen = false;
  }

  onCountryChange(code: string) {
    const country = this.countries.find(c => c.code === code);
    this.states = country?.states ?? [];
    this.cities = [];
    this.form.patchValue({ state: '', city: '' });
  }

  onStateChange(code: string) {
    const state = this.states.find(s => s.code === code);
    this.cities = state?.cities ?? [];
    this.form.patchValue({ city: '' });
  }
}
