import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { SidebarComponent } from '../../../../shared/components/sidebar/sidebar.component';

import {
  CatalogoAlimentosService,
  CatalogItemCreateRequest,
  CatalogItemUpdateRequest
} from '../../services/catalogo-alimentos.service';

@Component({
  selector: 'app-catalogo-alimentos-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SidebarComponent],
  templateUrl: './catalogo-alimentos-form.component.html',
  styleUrls: ['./catalogo-alimentos-form.component.scss']
})
export class CatalogoAlimentosFormComponent implements OnInit {
  loading = false;
  editingId: number | null = null;

  form!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private svc: CatalogoAlimentosService
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      codigo: ['', [Validators.required, Validators.maxLength(10)]],
      nombre: ['', [Validators.required, Validators.maxLength(150)]],
      activo: [true, Validators.required],
      metadata: this.fb.array<FormGroup>([])
    });

    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.editingId = +idParam;
      this.loadItem(this.editingId);
    } else {
      this.addMetaRow();
    }
  }

  // Metadata
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
    const o: any = {};
    for (const g of this.metadataArray.controls) {
      const k = (g.get('key')?.value || '').trim();
      const v = g.get('value')?.value;
      if (k) o[k] = v;
    }
    return o;
  }
  fromMetadataObject(meta: any): void {
    this.metadataArray.clear();
    if (meta && typeof meta === 'object') {
      Object.keys(meta).forEach(k => this.addMetaRow(k, meta[k]));
    }
    if (this.metadataArray.length === 0) this.addMetaRow();
  }

  loadItem(id: number): void {
    this.loading = true;
    this.svc.getById(id)
      .pipe(finalize(() => this.loading = false))
      .subscribe(item => {
        this.form.patchValue({
          codigo: item.codigo,
          nombre: item.nombre,
          activo: item.activo
        });
        this.form.get('codigo')?.disable(); // código no editable
        this.fromMetadataObject(item.metadata);
      });
  }

  save(): void {
    if (this.form.invalid) return;

    const raw = this.form.getRawValue();
    const metadata = this.toMetadataObject();

    this.loading = true;

    if (this.editingId) {
      const dto: CatalogItemUpdateRequest = {
        nombre: raw.nombre,
        activo: raw.activo,
        metadata
      };
      this.svc.update(this.editingId, dto)
        .pipe(finalize(() => this.loading = false))
        .subscribe(() => this.router.navigate(['../'], { relativeTo: this.route }));
    } else {
      const dto: CatalogItemCreateRequest = {
        codigo: raw.codigo,
        nombre: raw.nombre,
        activo: raw.activo,
        metadata
      };
      this.svc.create(dto)
        .pipe(finalize(() => this.loading = false))
        .subscribe(() => this.router.navigate(['../'], { relativeTo: this.route }));
    }
  }

  cancel(): void {
    this.router.navigate(['../'], { relativeTo: this.route });
  }
}
