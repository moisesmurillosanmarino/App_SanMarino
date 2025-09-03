// src/app/features/galpon/pages/galpon-list/galpon-list.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule
} from '@angular/forms';
import { finalize, forkJoin } from 'rxjs';

import { SidebarComponent } from '../../../../shared/components/sidebar/sidebar.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faPlus, faPen, faTrash, faEye } from '@fortawesome/free-solid-svg-icons';

import { GalponService } from '../../services/galpon.service';
import { GalponDetailDto, CreateGalponDto, UpdateGalponDto } from '../../models/galpon.models';

import { NucleoService, NucleoDto } from '../../../nucleo/services/nucleo.service';
import { FarmService, FarmDto } from '../../../farm/services/farm.service';
import { GalponFilterPipe } from '../../pipe/galpon-filter.pipe';
import { Company } from '../../../../core/services/company/company.service';
import { MasterListService } from '../../../../core/services/master-list/master-list.service';

interface NucleoOption { id: string; label: string; granjaId: number; }

@Component({
  selector: 'app-galpon-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SidebarComponent, FontAwesomeModule, FormsModule, GalponFilterPipe],
  templateUrl: './galpon-list.component.html',
  styleUrls: ['./galpon-list.component.scss']
})
export class GalponListComponent implements OnInit {
  faPlus = faPlus; faPen = faPen; faTrash = faTrash; faEye = faEye;

  galpones: GalponDetailDto[] = [];
  allNucleos: NucleoDto[] = [];
  farms: FarmDto[] = [];
  companies: Company[] = []; // si tu service de company ya existe

  nucleoOptions: NucleoOption[] = [];
  loading = false;
  filtro = '';

  // modal & form
  modalOpen = false;
  form!: FormGroup;
  editing: GalponDetailDto | null = null;

  // modal detalle
  detailOpen = false;
  selectedDetail: GalponDetailDto | null = null;

  // combos
  typegarponOptions: string[] = [];

  constructor(
    private fb: FormBuilder,
    private svc: GalponService,
    private nucleoSvc: NucleoService,
    private farmSvc: FarmService,
    private mlSvc: MasterListService
  ) {}

  ngOnInit(): void {
    // Form alineado con Create/Update del backend
    this.form = this.fb.group({
      galponId:    ['', Validators.required],
      galponNombre:['', Validators.required],
      nucleoId:    ['', Validators.required],
      granjaId:    [null, Validators.required],
      ancho:       [''],
      largo:       [''],
      tipoGalpon:  ['']
    });

    forkJoin({
      farms:   this.farmSvc.getAll(),
      nucleos: this.nucleoSvc.getAll()
    }).subscribe(({ farms, nucleos }) => {
      this.farms = farms;
      this.allNucleos = nucleos;

      // opciones de select núcleo
      this.nucleoOptions = nucleos.map(n => ({
        id: n.nucleoId,
        granjaId: n.granjaId,
        label: `${n.nucleoNombre} (Granja #${n.granjaId})`
      }));

      // sincronizar granjaId desde núcleo seleccionado
      this.form.get('nucleoId')!.valueChanges.subscribe(id => {
        const sel = this.allNucleos.find(x => x.nucleoId === id);
        this.form.patchValue({ granjaId: sel?.granjaId ?? null }, { emitEvent: false });
      });

      this.loadGalpones();
    });

    // master-list para tipo de galpón
    this.mlSvc.getByKey('type_galpon').subscribe({
      next: ml => this.typegarponOptions = ml.options,
      error: err => console.error('No pude cargar tipos de galpón', err)
    });
  }

  private loadGalpones(): void {
    this.loading = true;
    this.svc.getAll()
      .pipe(finalize(() => this.loading = false))
      .subscribe(list => this.galpones = list);
  }

  openModal(g?: GalponDetailDto): void {
    this.editing = g ?? null;

    if (g) {
      // Modo edición: rellenar y bloquear ID
      this.form.reset({
        galponId:     g.galponId,
        galponNombre: g.galponNombre,
        nucleoId:     g.nucleoId,      // clave para guardar
        granjaId:     g.granjaId,
        ancho:        g.ancho ?? '',
        largo:        g.largo ?? '',
        tipoGalpon:   g.tipoGalpon ?? ''
      });
      this.form.get('galponId')?.disable(); // ID no editable si ya existe
    } else {
      // Modo creación: sugerir nuevo ID incremental
      const last = this.galpones
        .map(x => parseInt((x.galponId || '').replace(/\D/g, '')))
        .filter(n => !isNaN(n))
        .reduce((max, cur) => cur > max ? cur : max, 0);
      const newId = `G${(last + 1).toString().padStart(4, '0')}`;

      this.form.reset({
        galponId:     newId,
        galponNombre: '',
        nucleoId:     '',
        granjaId:     null,
        ancho:        '',
        largo:        '',
        tipoGalpon:   ''
      });
      this.form.get('galponId')?.enable();
    }

    this.modalOpen = true;
  }

  showDetail(g: GalponDetailDto): void {
    // Si quisieras re-consultar del backend:
    // this.svc.getById(g.galponId).subscribe(d => { this.selectedDetail = d; this.detailOpen = true; });
    this.selectedDetail = g;
    this.detailOpen = true;
  }

  save(): void {
    if (this.form.invalid) return;

    const raw = this.form.getRawValue(); // incluye galponId si estaba disabled
    const payload: CreateGalponDto | UpdateGalponDto = {
      galponId:     raw.galponId,
      galponNombre: raw.galponNombre,
      nucleoId:     raw.nucleoId,
      granjaId:     raw.granjaId,
      ancho:        raw.ancho || null,
      largo:        raw.largo || null,
      tipoGalpon:   raw.tipoGalpon || null
    };

    this.loading = true;

    const call$ = this.editing
      ? this.svc.update(payload as UpdateGalponDto)
      : this.svc.create(payload as CreateGalponDto);

    call$
      .pipe(finalize(() => {
        this.loading = false;
        this.modalOpen = false;
        this.loadGalpones();
      }))
      .subscribe();
  }

  delete(id: string): void {
    if (!confirm('¿Eliminar este galpón?')) return;
    this.loading = true;
    this.svc.delete(id)
      .pipe(finalize(() => this.loadGalpones()))
      .subscribe();
  }

  // Auxiliares de vista
  getArea(g: GalponDetailDto | null): string {
    if (!g?.ancho || !g?.largo) return '–';
    const a = parseFloat(String(g.ancho)); const l = parseFloat(String(g.largo));
    if (isNaN(a) || isNaN(l)) return '–';
    return (a * l).toFixed(2);
  }

  getGranjaNombreByNucleoId(nucleoId: string): string {
    const nucleo = this.allNucleos.find(n => n.nucleoId === nucleoId);
    const granja = this.farms.find(f => f.id === nucleo?.granjaId);
    return granja?.name || '–';
  }
}
