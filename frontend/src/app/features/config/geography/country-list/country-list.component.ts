// src/app/features/config/geography/country-list/country-list.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators
} from '@angular/forms';
import { RouterModule } from '@angular/router';
import { FontAwesomeModule, FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { faPlus, faPen, faTrash } from '@fortawesome/free-solid-svg-icons';
import { SidebarComponent } from '../../../../shared/components/sidebar/sidebar.component';
import { CountryService, PaisDto } from '../../../../core/services/country/country.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-country-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SidebarComponent,
    RouterModule,
    FontAwesomeModule
  ],
  templateUrl: './country-list.component.html',
  styleUrls: ['./country-list.component.scss']
})
export class CountryListComponent implements OnInit {
  faPlus  = faPlus;
  faPen   = faPen;
  faTrash = faTrash;

  countries: PaisDto[] = [];
  showModal = false;
  countryForm: FormGroup;
  loading = false;
  public editingId: number | null = null;

  constructor(
    library: FaIconLibrary,
    private fb: FormBuilder,
    private svc: CountryService
  ) {
    library.addIcons(faPlus, faPen, faTrash);

    this.countryForm = this.fb.group({
      paisNombre: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadCountries();
  }

  private loadCountries() {
    this.loading = true;
    this.svc.getAll().subscribe({
      next: list => {
        this.countries = list;
        this.loading = false;
      },
      error: err => {
        console.error('Error cargando países', err);
        this.loading = false;
      }
    });
  }

  newCountry() {
    this.editingId = null;
    this.countryForm.reset();
    this.showModal = true;
  }

  editCountry(c: PaisDto) {
    this.editingId = c.paisId;
    this.countryForm.setValue({ paisNombre: c.paisNombre });
    this.showModal = true;
  }

  cancel() {
    this.showModal = false;
    this.countryForm.reset();
  }

  saveCountry() {
    if (this.countryForm.invalid) {
      this.countryForm.markAllAsTouched();
      return;
    }
    const dto = this.countryForm.value as { paisNombre: string };
    this.loading = true;

    const call$: Observable<any> = this.editingId
      ? this.svc.update({ paisId: this.editingId, ...dto })
      : this.svc.create(dto);

    call$.subscribe({
      next: () => {
        this.loadCountries();
        this.showModal = false;
        this.loading = false;
      },
      error: err => {
        console.error('Error guardando país', err);
        this.loading = false;
      }
    });
  }

  deleteCountry(id: number) {
    if (!confirm('¿Eliminar este país?')) return;
    this.loading = true;
    this.svc.delete(id).subscribe({
      next: () => {
        this.loadCountries();
        this.loading = false;
      },
      error: err => {
        console.error('Error eliminando país', err);
        this.loading = false;
      }
    });
  }
}
