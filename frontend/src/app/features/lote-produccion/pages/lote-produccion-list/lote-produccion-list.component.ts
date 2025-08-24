import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { SidebarComponent } from '../../../../shared/components/sidebar/sidebar.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faPlus, faPen, faTrash } from '@fortawesome/free-solid-svg-icons';

import { LoteProduccionDto } from '../../services/lote-produccion.service';
import { LoteService, LoteDto } from '../../../lote/services/lote.service';

@Component({
  selector: 'app-lote-produccion-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    SidebarComponent,
    FontAwesomeModule
  ],
  templateUrl: './lote-produccion-list.component.html'
})
export class LoteProduccionListComponent implements OnInit {
  faPlus = faPlus;
  faPen = faPen;
  faTrash = faTrash;
  esPrimerRegistroProduccion = false;

  lotes: LoteDto[] = [];
  registros: LoteProduccionDto[] = [];
  selectedLoteId: string | null = null;

  form!: FormGroup;
  loading = false;
  modalOpen = false;
  editing: LoteProduccionDto | null = null;

  constructor(
    private fb: FormBuilder,
    private loteSvc: LoteService
  ) {}

  ngOnInit() {
    this.loteSvc.getAll().subscribe(l => {
      this.lotes = l.filter(lote => this.calcularEdadSemanas(lote.fechaEncaset) >= 26);
    });

    this.form = this.fb.group({
      fecha: [new Date().toISOString().slice(0, 10), Validators.required],
      loteId: ['', Validators.required],
      mortalidadH: [0, Validators.required],
      mortalidadM: [0, Validators.required],
      selH: [0, Validators.required],
      consKgH: [0, Validators.required],
      consKgM: [0, Validators.required],
      huevoTot: [0, Validators.required],
      huevoInc: [0, Validators.required],
      tipoAlimento: ['', Validators.required],
      observaciones: [''],
      pesoHuevo: [0, Validators.required],
      etapa: [1, Validators.required],
      hembrasInicio: [null],
      machosInicio: [null],
      huevosInicio: [null],
      tipoNido: [''],
      nucleoP: [''],
      ciclo: ['']
    });
  }

  onLoteChange() {
    if (!this.selectedLoteId) {
      this.registros = [];
      this.esPrimerRegistroProduccion = false;
      return;
    }

    const lote = this.lotes.find(l => l.loteId === this.selectedLoteId);
    const edad = this.calcularEdadSemanas(lote?.fechaEncaset);

    const stored = sessionStorage.getItem('registros-produccion');
    const all: LoteProduccionDto[] = stored ? JSON.parse(stored) : [];

    this.registros = all.filter(r => r.loteId === this.selectedLoteId);
    this.esPrimerRegistroProduccion = this.registros.length === 0 && edad >= 26;
  }

  openNew() {
    this.editing = null;
    this.form.reset({
      ...this.form.value,
      loteId: this.selectedLoteId
    });
    this.modalOpen = true;
  }

  edit(r: LoteProduccionDto) {
    this.editing = r;
    this.form.patchValue({
      ...r,
      fecha: r.fecha.slice(0, 10)
    });
    this.modalOpen = true;
  }

  delete(id: string) {
    if (!confirm('¿Eliminar este registro?')) return;

    const stored = sessionStorage.getItem('registros-produccion');
    let all: LoteProduccionDto[] = stored ? JSON.parse(stored) : [];

    all = all.filter(r => r.id !== id);

    sessionStorage.setItem('registros-produccion', JSON.stringify(all));
    this.onLoteChange();
  }

  save() {
    if (this.form.invalid) return;

    const raw = this.form.value;

    const stored = sessionStorage.getItem('registros-produccion');
    const all: LoteProduccionDto[] = stored ? JSON.parse(stored) : [];

    if (this.editing) {
      const index = all.findIndex(r => r.id === this.editing!.id);
      if (index !== -1) all[index] = { ...raw, id: this.editing.id };
    } else {
      const newId = `temp-${Date.now()}`;
      all.push({ ...raw, id: newId });
    }

    sessionStorage.setItem('registros-produccion', JSON.stringify(all));
    this.modalOpen = false;
    this.onLoteChange();
  }

  cancel() {
    this.modalOpen = false;
  }

  public calcularEdadSemanas(fechaEncaset?: string | Date | null): number {
    if (!fechaEncaset) return 0;
    const fecha = new Date(fechaEncaset);
    const hoy = new Date();
    const msPorSemana = 1000 * 60 * 60 * 24 * 7;
    const semanas = Math.floor((hoy.getTime() - fecha.getTime()) / msPorSemana);
    return semanas + 1;
  }
}
