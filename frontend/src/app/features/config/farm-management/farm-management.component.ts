// src/app/features/config/farm-management/farm-management.component.ts
import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule }                               from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  FormArray,
  Validators
} from '@angular/forms';
import { SidebarComponent }                           from '../../../shared/components/sidebar/sidebar.component';
import { FontAwesomeModule, FaIconLibrary }           from '@fortawesome/angular-fontawesome';
import {
  faTractor,
  faPlus,
  faTrash,
  faPen,
  faEye,
  faTimes
} from '@fortawesome/free-solid-svg-icons';

interface Company {
  id: number;
  name: string;
}
interface Nucleus {
  id: number;
  name: string;
  houses: { id: number; name: string }[];
}
interface Farm {
  id?: number;
  name: string;
  companyId: number;
  address: string;
  nuclei: Nucleus[];
}

@Component({
  selector: 'app-farm-management',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SidebarComponent,
    FontAwesomeModule
  ],
  templateUrl: './farm-management.component.html',
  styleUrls: ['./farm-management.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FarmManagementComponent implements OnInit {
  // Iconos
  faTractor = faTractor;
  faPlus    = faPlus;
  faTrash   = faTrash;
  faPen     = faPen;
  faEye     = faEye;
  faTimes   = faTimes;

  // Datos en memoria
  companies: Company[] = [
    { id: 1, name: 'Agroavicola San Marino' },
    { id: 2, name: 'Piko' }
  ];
  companyMap: Record<number,string> = {};
  farms: Farm[] = [
    {
      id: 1,
      name: 'Granja Central',
      companyId: 1,
      address: 'Calle 123',
      nuclei: [
        { id: 11, name: 'Núcleo A', houses: [{ id: 111, name: 'Galpón 1' }] }
      ]
    },
    {
      id: 2,
      name: 'Estela',
      companyId: 2,
      address: 'Calle 143-43',
      nuclei: [
        { id: 21, name: 'Núcleo A', houses: [{ id: 2, name: 'Galpón 4' }, { id: 5, name: 'Galpón 3' }] },
        { id: 22, name: 'Núcleo D', houses: [{ id: 1, name: 'Galpón 1' }, { id: 3, name: 'Galpón 9' }] }
      ]
    },
    {
      id: 3,
      name: 'San Pedro',
      companyId: 1,
      address: 'Calle 45-543',
      nuclei: [
        { id: 21, name: 'Núcleo B', houses: [{ id: 211, name: 'Galpón 1' }, { id: 212, name: 'Galpón 2' }] },
        { id: 22, name: 'Núcleo C', houses: [{ id: 221, name: 'Galpón 3' }, { id: 222, name: 'Galpón 4' }] }
      ]
    }
  ];

  // Formulario y modales
  form!: FormGroup;
  modalOpen   = false;
  detailOpen  = false;
  editing     = false;
  selectedFarm: Farm | null = null;
  private nextId = 3;

  constructor(
    private fb: FormBuilder,
    library: FaIconLibrary
  ) {
    library.addIcons(faTractor, faPlus, faTrash, faPen, faEye, faTimes);
  }

  ngOnInit() {
    // Mapeo de empresas
    this.companyMap = this.companies
      .reduce((m, c) => ((m[c.id] = c.name), m), {} as Record<number,string>);

    // Construir formulario
    this.form = this.fb.group({
      id:        [null],
      name:      ['', Validators.required],
      companyId: [null, Validators.required],
      address:   [''],
      nuclei:    this.fb.array([])
    });
  }

  // FormArray de Núcleos
  get nucleiFA(): FormArray {
    return this.form.get('nuclei') as FormArray;
  }

  // Añadir / eliminar núcleos
  newNucleus() {
    this.nucleiFA.push(this.fb.group({
      id:     [Date.now()],
      name:   ['', Validators.required],
      houses: this.fb.array([])
    }));
  }
  removeNucleus(i: number) {
    this.nucleiFA.removeAt(i);
  }

  // FormArray de Galpones dentro de un Núcleo
  housesFA(nucIndex: number): FormArray {
    return this.nucleiFA.at(nucIndex).get('houses') as FormArray;
  }
  addHouse(nucIndex: number) {
    this.housesFA(nucIndex).push(this.fb.group({
      id:   [Date.now()],
      name: ['', Validators.required]
    }));
  }
  removeHouse(nucIndex: number, houseIndex: number) {
    this.housesFA(nucIndex).removeAt(houseIndex);
  }

  // Abrir modal Creación/Edición
  openModal(farm?: Farm) {
    this.editing = !!farm;
    this.form.reset();
    this.nucleiFA.clear();

    if (farm) {
      this.form.patchValue({
        id:        farm.id,
        name:      farm.name,
        companyId: farm.companyId,
        address:   farm.address
      });
      farm.nuclei.forEach(n => {
        const grp = this.fb.group({
          id:     [n.id],
          name:   [n.name, Validators.required],
          houses: this.fb.array([])
        });
        n.houses.forEach(h => (grp.get('houses') as FormArray).push(
          this.fb.group({ id: [h.id], name: [h.name, Validators.required] })
        ));
        this.nucleiFA.push(grp);
      });
    }

    this.modalOpen = true;
  }

  // Guardar cambios
  save() {
    if (this.form.invalid) return;
    const farm = this.form.value as Farm;

    if (this.editing && farm.id != null) {
      this.farms = this.farms.map(f => f.id === farm.id ? farm : f);
    } else {
      farm.id = this.nextId++;
      this.farms.push(farm);
    }
    this.closeModal();
  }

  // Eliminar granja
  deleteFarm(id: number) {
    if (!confirm('¿Eliminar esta granja?')) return;
    this.farms = this.farms.filter(f => f.id !== id);
  }

  closeModal() {
    this.modalOpen = false;
  }

  // Modal detalle (solo lectura)
  openDetail(farm: Farm) {
    this.selectedFarm = farm;
    this.detailOpen = true;
  }
  closeDetail() {
    this.detailOpen = false;
    this.selectedFarm = null;
  }
}
