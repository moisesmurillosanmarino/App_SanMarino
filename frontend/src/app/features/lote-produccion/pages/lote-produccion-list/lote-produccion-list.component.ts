// src/app/features/lote-produccion/pages/lote-produccion-list/lote-produccion-list.component.ts
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { SidebarComponent } from '../../../../shared/components/sidebar/sidebar.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faPlus, faPen, faTrash } from '@fortawesome/free-solid-svg-icons';

import { LoteProduccionDto } from '../../services/lote-produccion.service';
import { LoteService, LoteDto } from '../../../lote/services/lote.service';

type LoteView = LoteDto & { edadSemanas: number };

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
  templateUrl: './lote-produccion-list.component.html',
  styleUrls: ['./lote-produccion-list.component.scss'],
  encapsulation: ViewEncapsulation.Emulated
})
export class LoteProduccionListComponent implements OnInit {
  // Icons
  faPlus = faPlus;
  faPen = faPen;
  faTrash = faTrash;

  // UI
  loading = false;
  modalOpen = false;

  // Datos
  lotes: LoteView[] = [];
  registros: LoteProduccionDto[] = [];

  // Selección (precálculos para no usar funciones en template)
  selectedLoteId: number | string | null = null;
  selectedLoteNombre = '';
  selectedLoteSemanas = 0;

  // Modal / Form
  form!: FormGroup;
  editing: LoteProduccionDto | null = null;
  esPrimerRegistroProduccion = false;

  // trackBy
  trackByLoteId = (_: number, l: LoteView) => l.loteId as any;
  trackByRegistroId = (_: number, r: LoteProduccionDto) => r.id as any;

  constructor(
    private fb: FormBuilder,
    private loteSvc: LoteService
  ) {}

  ngOnInit() {
    this.loading = true;
    this.loteSvc.getAll().subscribe({
      next: (lotes) => {
        const withAge: LoteView[] = (lotes || []).map(l => ({
          ...l,
          edadSemanas: this.calcularEdadSemanas(l.fechaEncaset)
        }));
        this.lotes = withAge.filter(l => l.edadSemanas >= 26);
        this.loading = false;
      },
      error: () => { this.lotes = []; this.loading = false; }
    });

    this.form = this.fb.group({
      fecha: [this.hoyISO(), Validators.required],
      loteId: ['', Validators.required],
      mortalidadH: [0, [Validators.required, Validators.min(0)]],
      mortalidadM: [0, [Validators.required, Validators.min(0)]],
      selH:        [0, [Validators.required, Validators.min(0)]],
      consKgH:     [0, [Validators.required, Validators.min(0)]],
      consKgM:     [0, [Validators.required, Validators.min(0)]],
      huevoTot:    [0, [Validators.required, Validators.min(0)]],
      huevoInc:    [0, [Validators.required, Validators.min(0)]],
      tipoAlimento: ['', Validators.required],
      observaciones: [''],
      pesoHuevo:   [0, [Validators.required, Validators.min(0)]],
      etapa:       [1, Validators.required],

      // Iniciales (si es primer registro de producción)
      hembrasInicio: [null],
      machosInicio:  [null],
      huevosInicio:  [null],
      tipoNido:      [''],
      nucleoP:       [''],
      ciclo:         ['']
    });
  }

  // ====== UI Actions
  onLoteChange() {
    if (this.selectedLoteId == null) {
      this.selectedLoteNombre = '';
      this.selectedLoteSemanas = 0;
      this.registros = [];
      this.esPrimerRegistroProduccion = false;
      return;
    }

    const lote = this.lotes.find(l => (l.loteId as any) === this.selectedLoteId);
    this.selectedLoteNombre = lote?.loteNombre ?? '';
    this.selectedLoteSemanas = lote?.edadSemanas ?? 0;

    const stored = sessionStorage.getItem('registros-produccion');
    const all: LoteProduccionDto[] = stored ? JSON.parse(stored) : [];
    this.registros = all.filter(r => (r.loteId as any) === this.selectedLoteId);

    this.esPrimerRegistroProduccion = this.registros.length === 0 && this.selectedLoteSemanas >= 26;
  }

  // Para coincidir con el ejemplo (botón “Nuevo Registro”)
  create() {
    this.openNew();
  }

  openNew() {
    if (!this.selectedLoteId) return;
    this.editing = null;
    this.form.reset({
      ...this.form.getRawValue(),
      fecha: this.hoyISO(),
      loteId: this.selectedLoteId,
      mortalidadH: 0, mortalidadM: 0, selH: 0,
      consKgH: 0, consKgM: 0,
      huevoTot: 0, huevoInc: 0,
      tipoAlimento: '', observaciones: '',
      pesoHuevo: 0, etapa: 1,
      hembrasInicio: null, machosInicio: null, huevosInicio: null,
      tipoNido: '', nucleoP: '', ciclo: ''
    });
    this.modalOpen = true;
  }

  edit(r: LoteProduccionDto) {
    this.editing = r;
    this.form.patchValue({ ...r, fecha: (r.fecha || '').slice(0, 10) });
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
      if (index !== -1) all[index] = { ...all[index], ...raw, id: this.editing!.id };
    } else {
      const newId = `temp-${Date.now()}`;
      all.push({ ...raw, id: newId } as any);
    }

    sessionStorage.setItem('registros-produccion', JSON.stringify(all));
    this.modalOpen = false;
    this.onLoteChange();
  }

  cancel() { this.modalOpen = false; }

  // ====== Helpers
  private hoyISO(): string {
    const d = new Date();
    return new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())).toISOString().slice(0, 10);
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
