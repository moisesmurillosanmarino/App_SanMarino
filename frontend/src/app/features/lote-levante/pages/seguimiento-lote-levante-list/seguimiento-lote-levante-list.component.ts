// src/app/features/lote-levante/pages/seguimiento-lote-levante-list/seguimiento-lote-levante-list.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { finalize } from 'rxjs/operators';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faPlus, faPen, faTrash } from '@fortawesome/free-solid-svg-icons';
import { SidebarComponent } from '../../../../shared/components/sidebar/sidebar.component';

import { LoteService, LoteDto } from '../../../lote/services/lote.service';
import {
  SeguimientoLoteLevanteService,
  SeguimientoLoteLevanteDto,
  CreateSeguimientoLoteLevanteDto,
  UpdateSeguimientoLoteLevanteDto
} from '../../services/seguimiento-lote-levante.service';

@Component({
  selector: 'app-seguimiento-lote-levante-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SidebarComponent,
    FontAwesomeModule
  ],
  templateUrl: './seguimiento-lote-levante-list.component.html',
  styleUrls: ['./seguimiento-lote-levante-list.component.scss']
})
export class SeguimientoLoteLevanteListComponent implements OnInit {
  faPlus = faPlus;
  faPen = faPen;
  faTrash = faTrash;

  lotes: LoteDto[] = [];
  seguimientos: SeguimientoLoteLevanteDto[] = [];
  selectedLoteId: string | null = null;

  form!: FormGroup;
  loading = false;
  modalOpen = false;
  editing: SeguimientoLoteLevanteDto | null = null;

  constructor(
    private fb: FormBuilder,
    private loteSvc: LoteService,
    private segSvc: SeguimientoLoteLevanteService
  ) {}

  ngOnInit(): void {
    this.loteSvc.getAll().subscribe(data => {
      this.lotes = data.filter(l => this.calcularEdadSemanas(l.fechaEncaset) < 25);
    });

    this.form = this.fb.group({
      fechaRegistro:      [new Date().toISOString().substring(0, 10), Validators.required],
      loteId:             ['', Validators.required],
      mortalidadHembras:  [0, Validators.required],
      mortalidadMachos:   [0, Validators.required],
      selH:               [0, Validators.required],
      selM:               [0, Validators.required],
      errorSexajeHembras: [0, Validators.required],
      errorSexajeMachos:  [0, Validators.required],
      tipoAlimento:       ['', Validators.required],
      consumoKgHembras:   [0, Validators.required],
      observaciones:      [''],
      ciclo:              ['Normal']
    });
  }

  onLoteChange(): void {
    if (!this.selectedLoteId) {
      this.seguimientos = [];
      return;
    }
    this.loading = true;
    this.segSvc.getByLoteId(this.selectedLoteId)
      .pipe(finalize(() => this.loading = false))
      .subscribe(data => this.seguimientos = data);
  }

  create(): void {
    this.editing = null;
    this.form.reset({
      fechaRegistro: new Date().toISOString().substring(0, 10),
      loteId: this.selectedLoteId,
      mortalidadHembras: 0,
      mortalidadMachos: 0,
      selH: 0,
      selM: 0,
      errorSexajeHembras: 0,
      errorSexajeMachos: 0,
      tipoAlimento: '',
      consumoKgHembras: 0,
      observaciones: '',
      ciclo: 'Normal'
    });
    this.modalOpen = true;
  }

  edit(seg: SeguimientoLoteLevanteDto): void {
    this.editing = seg;
    this.form.patchValue({
      fechaRegistro: seg.fechaRegistro.substring(0, 10),
      loteId: seg.loteId,
      mortalidadHembras: seg.mortalidadHembras,
      mortalidadMachos: seg.mortalidadMachos,
      selH: seg.selH,
      selM: seg.selM,
      errorSexajeHembras: seg.errorSexajeHembras,
      errorSexajeMachos: seg.errorSexajeMachos,
      tipoAlimento: seg.tipoAlimento,
      consumoKgHembras: seg.consumoKgHembras,
      observaciones: seg.observaciones,
      ciclo: seg.ciclo
    });
    this.modalOpen = true;
  }

  delete(id: number): void {
    if (!confirm('¿Eliminar este registro?')) return;
    this.segSvc.delete(id).subscribe(() => this.onLoteChange());
  }

  cancel(): void {
    this.modalOpen = false;
  }

  save(): void {
    console.log('Guardando...');
    if (this.form.invalid) return;
    console.warn('Formulario inválido', this.form.value);
    const raw = this.form.value;
    const dto: CreateSeguimientoLoteLevanteDto = {
      fechaRegistro: new Date(raw.fechaRegistro).toISOString(),
      loteId: raw.loteId,
      mortalidadHembras: raw.mortalidadHembras,
      mortalidadMachos: raw.mortalidadMachos,
      selH: raw.selH,
      selM: raw.selM,
      errorSexajeHembras: raw.errorSexajeHembras,
      errorSexajeMachos: raw.errorSexajeMachos,
      tipoAlimento: raw.tipoAlimento,
      consumoKgHembras: raw.consumoKgHembras,
      observaciones: raw.observaciones,
      kcalAlH: null,
      protAlH: null,
      kcalAveH: null,
      protAveH: null,
      ciclo: raw.ciclo
    };

    const op$ = this.editing
      ? this.segSvc.update({ ...dto, id: this.editing.id } as UpdateSeguimientoLoteLevanteDto)
      : this.segSvc.create(dto);

    this.loading = true;
    op$.pipe(finalize(() => {
      this.loading = false;
      this.modalOpen = false;
      this.onLoteChange();
    })).subscribe();
  }

  public calcularEdadSemanas(fechaEncaset: string | Date | null | undefined): number {
    if (!fechaEncaset) return 0;
    const inicio = new Date(fechaEncaset);
    const hoy = new Date();
    const msPorSemana = 1000 * 60 * 60 * 24 * 7;
    const semanas = Math.floor((hoy.getTime() - inicio.getTime()) / msPorSemana);
    return semanas + 1; // Semana base 1
  }

}
