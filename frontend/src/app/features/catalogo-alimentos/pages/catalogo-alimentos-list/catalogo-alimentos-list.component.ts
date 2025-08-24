import { Component, OnInit, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SidebarComponent } from '../../../../shared/components/sidebar/sidebar.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faPlus, faPen, faTrash, faSearch, faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { finalize } from 'rxjs/operators';

import {
  CatalogoAlimentosService,
  CatalogItemDto,
  CatalogItemCreateRequest,
  CatalogItemUpdateRequest,
  PagedResult
} from '../../services/catalogo-alimentos.service';

@Component({
  selector: 'app-catalogo-alimentos-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, SidebarComponent, FontAwesomeModule],
  templateUrl: './catalogo-alimentos-list.component.html',
  styleUrls: ['./catalogo-alimentos-list.component.scss']
})
export class CatalogoAlimentosListComponent implements OnInit {
  // Icons
  faPlus = faPlus; faPen = faPen; faTrash = faTrash; faSearch = faSearch;
  faChevronLeft = faChevronLeft; faChevronRight = faChevronRight;

  // UI state
  loading = false;
  modalOpen = false;
  editing: CatalogItemDto | null = null;

  // Listado
  q = '';
  page = 1;
  pageSize = 20;
  total = 0;
  items: CatalogItemDto[] = [];


  // Form
  form!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private svc: CatalogoAlimentosService
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      codigo: ['', [Validators.required, Validators.maxLength(10)]],
      nombre: ['', [Validators.required, Validators.maxLength(150)]],
      activo: [true, Validators.required],
      metadata: this.fb.array<FormGroup>([])
    });

    this.load();
  }

  // Metadata helpers
  get metadataArray(): FormArray<FormGroup> {
    return this.form.get('metadata') as FormArray<FormGroup>;
  }

  addMetaRow(k = '', v = ''): void {
    this.metadataArray.push(this.fb.group({
      key: [k, [Validators.required, Validators.maxLength(50)]],
      value: [v, [Validators.required, Validators.maxLength(200)]]
    }));
  }

  removeMetaRow(i: number): void {
    this.metadataArray.removeAt(i);
  }

  toMetadataObject(): any {
    const obj: any = {};
    for (const g of this.metadataArray.controls) {
      const key = (g.get('key')?.value || '').trim();
      const value = g.get('value')?.value;
      if (key) obj[key] = value;
    }
    return obj;
  }

  fromMetadataObject(meta: any): void {
    this.metadataArray.clear();
    if (!meta || typeof meta !== 'object') return;
    Object.keys(meta).forEach(k => this.addMetaRow(k, meta[k]));
    if (this.metadataArray.length === 0) this.addMetaRow();
  }

  // CRUD UI
  create(): void {
    this.editing = null;
    this.form.reset({ codigo: '', nombre: '', activo: true });
    this.metadataArray.clear();
    this.addMetaRow(); // primera fila vacía
    this.modalOpen = true;
  }

  edit(item: CatalogItemDto): void {
    this.editing = item;
    this.form.reset({
      codigo: item.codigo,
      nombre: item.nombre,
      activo: item.activo
    });
    // Código no editable al editar (clave natural)
    this.form.get('codigo')?.disable();
    this.fromMetadataObject(item.metadata);
    this.modalOpen = true;
  }

  cancel(): void {
    this.modalOpen = false;
    this.editing = null;
    this.form.get('codigo')?.enable();
  }

  save(): void {
    if (this.form.invalid) return;

    const raw = this.form.getRawValue();
    const metadata = this.toMetadataObject();

    this.loading = true;

    if (this.editing) {
      const dto: CatalogItemUpdateRequest = {
        nombre: raw.nombre,
        activo: raw.activo,
        metadata
      };
      this.svc.update(this.editing.id!, dto)
        .pipe(finalize(() => this.loading = false))
        .subscribe(() => {
          this.cancel();
          this.load();
        });
    } else {
      const dto: CatalogItemCreateRequest = {
        codigo: raw.codigo,
        nombre: raw.nombre,
        activo: raw.activo,
        metadata
      };
      this.svc.create(dto)
        .pipe(finalize(() => this.loading = false))
        .subscribe(() => {
          this.cancel();
          this.load();
        });
    }
  }

  delete(id: number): void {
    if (!confirm('¿Eliminar este alimento?')) return;
    this.loading = true;
    this.svc.delete(id)
      .pipe(finalize(() => this.loading = false))
      .subscribe(() => this.load());
  }

  // Data
  load(): void {
    this.loading = true;
    this.svc.list(this.q, this.page, this.pageSize)
      .pipe(finalize(() => this.loading = false))
      .subscribe((res: PagedResult<CatalogItemDto>) => {
        this.items = res.items;
        this.total = res.total;
        this.page = res.page;
        this.pageSize = res.pageSize;
      });
  }

  next(): void {
    if (this.page * this.pageSize >= this.total) return;
    this.page++;
    this.load();
  }

  prev(): void {
    if (this.page <= 1) return;
    this.page--;
    this.load();
  }

  // Util
  trackById = (_: number, r: CatalogItemDto) => r.id;
  metaPreview(m: any): string {
    try {
      const s = JSON.stringify(m);
      return s.length > 60 ? s.substring(0, 60) + '…' : s;
    } catch { return ''; }
  }


  get totalPages(): number {
    const size = this.pageSize || 1;
    return Math.max(1, Math.ceil(this.total / size));
  }
}
