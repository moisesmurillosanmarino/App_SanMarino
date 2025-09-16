import { Component, OnInit, Input } from '@angular/core';
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

@Component({
  selector: 'app-nucleo-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SidebarComponent,
    FontAwesomeModule
  ],
  templateUrl: './nucleo-list.component.html',
  styleUrls: ['./nucleo-list.component.scss'],
  // Opcional: añade la clase 'embedded' al host cuando embedded=true (para tus estilos)
  host: { '[class.embedded]': 'embedded' }
})
export class NucleoListComponent implements OnInit {
  faPlus  = faPlus;
  faPen   = faPen;
  faTrash = faTrash;

  @Input() embedded = false;

  // Filtros
  filtro = '';
  selectedCompanyId: number | null = null;
  selectedFarmId: number | null = null;

  // Datos
  nucleos: NucleoDto[] = [];
  viewNucleos: NucleoDto[] = [];
  farms: FarmDto[] = [];
  companies: Company[] = [];

  // Mapas auxiliares
  farmMap: Record<number, string> = {};
  companyMap: Record<number, string> = {};

  loading = false;
  modalOpen = false;
  editing: NucleoDto | null = null;
  form!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private nucleoSvc: NucleoService,
    private farmSvc: FarmService,
    private companySvc: CompanyService
  ) {}

  ngOnInit() {
    // Formulario
    this.form = this.fb.group({
      nucleoId: ['', Validators.required],
      granjaId: [null, Validators.required],
      nucleoNombre: ['', Validators.required]
    });

    // Cargar granjas y companies
    this.farmSvc.getAll().subscribe(list => {
      this.farms = list;
      list.forEach(f => (this.farmMap[f.id] = f.name));
      this.recompute();

      this.companySvc.getAll().subscribe(clist => {
        this.companies = clist;
        clist.forEach(c => {
          if (c.id !== undefined) this.companyMap[c.id] = c.name;
        });
        this.recompute();
      });
    });

    // Carga inicial de núcleos
    this.loadNucleos();
  }

  // ===== NEW: trackBy para *ngFor
  trackByNucleo = (_: number, n: NucleoDto) => `${n.nucleoId}|${n.granjaId}`;

  // Granja filtrada por compañía (para el combo)
  get farmsFiltered(): FarmDto[] {
    if (this.selectedCompanyId == null) return this.farms;
    return this.farms.filter(f => f.companyId === this.selectedCompanyId);
  }

  private loadNucleos() {
    this.loading = true;
    this.nucleoSvc
      .getAll()
      .pipe(finalize(() => (this.loading = false)))
      .subscribe(list => {
        this.nucleos = list;
        this.recompute();
      });
  }

  // Recalcular la vista en base a filtros
  recompute() {
    const term = this.normalize(this.filtro);
    let res = [...this.nucleos];

    // Filtro por compañía
    if (this.selectedCompanyId != null) {
      res = res.filter(n => {
        const farm = this.farms.find(f => f.id === n.granjaId);
        return farm ? farm.companyId === this.selectedCompanyId : false;
      });
    }

    // Filtro por granja
    if (this.selectedFarmId != null) {
      res = res.filter(n => n.granjaId === this.selectedFarmId);
    }

    // Filtro por texto
    if (term) {
      res = res.filter(n => {
        const haystack = [
          String(n.nucleoId ?? ''),
          this.safe(n.nucleoNombre),
          this.safe(this.getFarmName(n.granjaId))
        ]
          .map(this.normalize)
          .join(' ');
        return haystack.includes(term);
      });
    }

    this.viewNucleos = res;
  }

  onCompanyChange(val: number | null) {
    this.selectedCompanyId = val;

    // Si la granja seleccionada no pertenece a la compañía actual, limpiar
    if (
      this.selectedFarmId != null &&
      !this.farmsFiltered.some(f => f.id === this.selectedFarmId)
    ) {
      this.selectedFarmId = null;
    }
    this.recompute();
  }

  resetFilters() {
    this.filtro = '';
    this.selectedCompanyId = null;
    this.selectedFarmId = null;
    this.recompute();
  }

  // ② openModal: asigna el ID al crear
  openModal(n?: NucleoDto) {
    this.editing = n ?? null;
    if (n) {
      // Editar: usamos los valores existentes (incluye el ID)
      this.form.patchValue(n);
    } else {
      // Crear: generamos un ID de 6 dígitos único basado en lo que ya cargó la tabla
      const newId = this.generateUniqueId6(this.nucleos);
      this.form.reset({
        nucleoId: newId,       // ← asignado automáticamente
        granjaId: null,
        nucleoNombre: ''
      });
    }
    this.modalOpen = true;
  }

  // ① Generador de ID de 6 dígitos que no colisiona con los existentes
  private generateUniqueId6(existing: Array<NucleoDto>): string {
    const used = new Set(existing.map(x => String(x.nucleoId)));
    let tries = 0;
    while (tries < 100) {
      const rnd = Math.floor(100000 + Math.random() * 900000); // 100000..999999
      const id = String(rnd);
      if (!used.has(id)) return id;
      tries++;
    }
    // Fallback improbable: añade sufijo incremental
    let seq = 100000;
    while (used.has(String(seq)) && seq <= 999999) seq++;
    return String(seq);
  }

  save() {
    if (this.form.invalid) return;

    // Verificación rápida de unicidad (solo en crear)
    if (!this.editing) {
      const id = String(this.form.value.nucleoId);
      if (this.nucleos.some(n => String(n.nucleoId) === id)) {
        // Reintenta generar y asigna
        const newId = this.generateUniqueId6(this.nucleos);
        this.form.get('nucleoId')?.setValue(newId);
      }
    }

    const v = this.form.value as NucleoDto;
    const op$ = this.editing
      ? this.nucleoSvc.update(v as UpdateNucleoDto)
      : this.nucleoSvc.create(v as CreateNucleoDto);

    this.loading = true;
    op$
      .pipe(finalize(() => {
        this.loading = false;
        this.modalOpen = false;
        this.loadNucleos();
      }))
      .subscribe();
  }


  delete(n: NucleoDto) {
    if (!confirm(`¿Eliminar el núcleo “${n.nucleoNombre}”?`)) return;
    this.loading = true;
    this.nucleoSvc
      .delete(n.nucleoId, n.granjaId)
      .pipe(
        finalize(() => {
          this.loading = false;
          this.loadNucleos();
        })
      )
      .subscribe();
  }

  // Aux
  getFarmName(granjaId: number): string {
    return this.farmMap[granjaId] || '–';
  }

  getCompanyName(granjaId: number): string {
    const farm = this.farms.find(f => f.id === granjaId);
    return farm ? this.companyMap[farm.companyId] || '–' : '–';
  }

  private normalize(s: string): string {
    return (s || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }

  private safe(s: any): string {
    return s == null ? '' : String(s);
  }
}
