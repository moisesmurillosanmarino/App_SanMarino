// src/app/features/lote-levante/pages/seguimiento-lote-levante-form/seguimiento-lote-levante-form.component.ts
import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs/operators';

import { SidebarComponent } from '../../../../shared/components/sidebar/sidebar.component';

import {
  SeguimientoLoteLevanteService,
  CreateSeguimientoLoteLevanteDto,
  UpdateSeguimientoLoteLevanteDto
} from '../../services/seguimiento-lote-levante.service';

import { LoteService, LoteDto } from '../../../lote/services/lote.service';

@Component({
  selector: 'app-seguimiento-lote-levante-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, SidebarComponent],
  templateUrl: './seguimiento-lote-levante-form.component.html',
  styleUrls: ['./seguimiento-lote-levante-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SeguimientoLoteLevanteFormComponent implements OnInit {
  form!: FormGroup;

  lotes: LoteDto[] = [];
  seguimientoId: number | null = null;
  loading = false;

  cicloOptions = ['Normal', 'Reforzado'] as const;

  get isEdit(): boolean { return this.seguimientoId !== null; }
  lotesById: Record<string, LoteDto> = {};

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private segSvc: SeguimientoLoteLevanteService,
    private loteSvc: LoteService
  ) {}

  ngOnInit(): void {
    // Form base alineado al HTML (mismos nombres de controles)
    this.form = this.fb.group({
      fechaRegistro:      [new Date().toISOString().substring(0, 10), Validators.required],
      loteId:             ['', Validators.required],
      mortalidadHembras:  [0, [Validators.required, Validators.min(0)]],
      mortalidadMachos:   [0, [Validators.required, Validators.min(0)]],
      selH:               [0, [Validators.required, Validators.min(0)]],
      selM:               [0, [Validators.required, Validators.min(0)]],
      errorSexajeHembras: [0, [Validators.required, Validators.min(0)]],
      errorSexajeMachos:  [0, [Validators.required, Validators.min(0)]],
      tipoAlimento:       ['', Validators.required],
      consumoKgHembras:   [0, [Validators.required, Validators.min(0)]],
      observaciones:      [''],
      ciclo:              ['Normal', Validators.required]
    });

    this.loteSvc.getAll().subscribe(data => {
      this.lotes = data;
      this.lotesById = data.reduce((acc, l) => {
        acc[l.loteId] = l;
        return acc;
      }, {} as Record<string, LoteDto>);
    });


    // Modo edición si viene :id en la ruta
    const paramId = this.route.snapshot.paramMap.get('id');
    if (paramId) {
      this.seguimientoId = Number(paramId);
      this.loading = true;
      this.segSvc.getById(this.seguimientoId)
        .pipe(finalize(() => (this.loading = false)))
        .subscribe(seg => {
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
            ciclo: seg.ciclo || 'Normal'
          });
        });
    }
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

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

    this.loading = true;

    const op$ = this.isEdit
      ? this.segSvc.update({ ...dto, id: this.seguimientoId! } as UpdateSeguimientoLoteLevanteDto)
      : this.segSvc.create(dto);

    op$
      .pipe(finalize(() => (this.loading = false)))
      .subscribe(() => this.router.navigate(['/lote-levante']));
  }

  cancel(): void {
    this.router.navigate(['/lote-levante']);
  }

  loteEdad(id: string | null | undefined): number | null {
    if (!id) return null;
    const fecha = this.lotesById[id]?.fechaEncaset;
    return fecha ? this.calcularEdadSemanas(fecha) : null;
  }

  calcularEdadSemanas(fechaEncaset: string | Date | null | undefined): number {
    if (!fechaEncaset) return 0;
    const d = typeof fechaEncaset === 'string' ? new Date(fechaEncaset) : fechaEncaset;
    if (isNaN(d.getTime())) return 0;
    const MS_WEEK = 7 * 24 * 60 * 60 * 1000;
    return Math.floor((Date.now() - d.getTime()) / MS_WEEK) + 1;
  }

  // (opcional) helper si prefieres método en lugar de acceso por índice
  loteNombre(id: string | null | undefined): string {
    return id ? (this.lotesById[id]?.loteNombre ?? id) : '—';
  }
}
