import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs/operators';

import { SeguimientoLoteLevanteService, CreateSeguimientoLoteLevanteDto, UpdateSeguimientoLoteLevanteDto } from '../../services/seguimiento-lote-levante.service';
import { LoteService, LoteDto } from '../../../lote/services/lote.service';

import { SidebarComponent } from '../../../../shared/components/sidebar/sidebar.component';

@Component({
  selector: 'app-seguimiento-lote-levante-form',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent, ReactiveFormsModule],
  templateUrl: './seguimiento-lote-levante-form.component.html',
  styleUrls: ['./seguimiento-lote-levante-form.component.scss']
})
export class SeguimientoLoteLevanteFormComponent implements OnInit {
  form!: FormGroup;
  lotes: LoteDto[] = [];
  seguimientoId: number | null = null;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private segSvc: SeguimientoLoteLevanteService,
    private loteSvc: LoteService
  ) {}

  ngOnInit(): void {
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

    this.loteSvc.getAll().subscribe(data => this.lotes = data);

    const paramId = this.route.snapshot.paramMap.get('id');
    if (paramId) {
      this.seguimientoId = Number(paramId);
      this.loading = true;
      this.segSvc.getById(this.seguimientoId)
        .pipe(finalize(() => this.loading = false))
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
            ciclo: seg.ciclo
          });
        });
    }
  }

  save(): void {
    if (this.form.invalid) return;
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
    const op$ = this.seguimientoId
      ? this.segSvc.update({ ...dto, id: this.seguimientoId } as UpdateSeguimientoLoteLevanteDto)
      : this.segSvc.create(dto);

    op$.pipe(finalize(() => this.loading = false)).subscribe(() => {
      this.router.navigate(['/lote-levante']);
    });
  }

  cancel(): void {
    this.router.navigate(['/lote-levante']);
  }
}
