import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { SidebarComponent } from '../../../../shared/components/sidebar/sidebar.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faPlus, faPen, faTrash } from '@fortawesome/free-solid-svg-icons';

import {
  LoteReproductoraService,
  FarmDto,
  NucleoDto,
  LoteDto,
  CreateLoteReproductoraDto,
  LoteReproductoraDto
} from '../../services/lote-reproductora.service';

interface LoteDtoExtendido {
  loteId: string;
  loteNombre: string;
  granjaId: number;
  nucleoId?: number;
  galponId?: number;
  regional?: string;
  fechaEncaset?: string;
  hembrasL?: number;
  machosL?: number;
  mixtas?: number;
  avesEncasetadas?: number;
  pesoInicialM?: number;
  pesoInicialH?: number;
  pesoMixto?: number;
}

@Component({
  selector: 'app-lote-reproductora-list',
  standalone: true,
  templateUrl: './lote-reproductora-list.component.html',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    SidebarComponent,
    FontAwesomeModule
  ]
})
export class LoteReproductoraListComponent implements OnInit {
  faPlus = faPlus;
  faPen = faPen;
  faTrash = faTrash;

  granjas: FarmDto[] = [];
  nucleos: NucleoDto[] = [];
  lotes: LoteDto[] = [];
  registros: LoteReproductoraDto[] = [];

  selectedGranjaId: number | null = null;
  selectedNucleoId: string | null = null;
  selectedLoteId: string | null = null;
  loteSeleccionado: LoteDtoExtendido | null = null;

  loading = false;
  form!: FormGroup;
  modalOpen = false;
  editing: LoteReproductoraDto | null = null;


  detalleOpen = false;
  detalleData: LoteReproductoraDto | null = null;

  constructor(private fb: FormBuilder, private svc: LoteReproductoraService) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      loteId: [''],
      reproductoraId: [''],
      nombreLote: [''],
      fechaEncasetamiento: ['', Validators.required],
      m: [0],
      h: [0],
      mixtas: [0],
      mortCajaH: [0],
      mortCajaM: [0],
      unifH: [0],
      unifM: [0],
      pesoInicialH: [0],
      pesoInicialM: [0]
    });

    this.svc.getGranjas().subscribe(r => this.granjas = r);
  }

  view(r: LoteReproductoraDto) {
    this.detalleData = r;
    this.detalleOpen = true;
  }

  closeDetalle() {
    this.detalleOpen = false;
    this.detalleData = null;
  }

  onGranjaChange(): void {
    this.selectedNucleoId = null;
    this.selectedLoteId = null;
    this.nucleos = [];
    this.lotes = [];
    this.registros = [];
    if (this.selectedGranjaId) {
      this.svc.getNucleosPorGranja(this.selectedGranjaId).subscribe(n => this.nucleos = n);
    }
  }

  onNucleoChange(): void {
    this.selectedLoteId = null;
    this.lotes = [];
    this.registros = [];
    this.svc.getLotes().subscribe(l => {
      const granjaIdStr = this.selectedGranjaId?.toString();
      const nucleoIdStr = this.selectedNucleoId?.toString();
      this.lotes = l.filter(x =>
        x.granjaId.toString() === granjaIdStr &&
        x.nucleoId.toString() === nucleoIdStr
      );
    });
  }

  onLoteChange(): void {
    const lote = this.lotes.find(l => l.loteId === this.selectedLoteId);
    if (lote) {
      this.loteSeleccionado = {
        ...lote,
        nucleoId: lote.nucleoId ? +lote.nucleoId : undefined,
        galponId: lote.galponId ? +lote.galponId : undefined
      };
    } else {
      this.loteSeleccionado = null;
    }

    if (this.selectedLoteId) {
      this.loading = true;
      this.svc.getAll().subscribe({
        next: r => {
          this.registros = r.filter(x => x.loteId === this.selectedLoteId);
          this.loading = false;
        },
        error: () => this.loading = false
      });
    } else {
      this.registros = [];
    }
  }


  openNew(): void {
    this.editing = null;
    const lote = this.lotes.find(l => l.loteId === this.selectedLoteId);
    this.form.reset({
    loteId: this.selectedLoteId,
  nombreLote: lote?.loteNombre || ''
});
    this.modalOpen = true;
  }

  edit(r: LoteReproductoraDto): void {
    this.editing = r;
    this.form.patchValue({
      ...r,
      fechaEncasetamiento: r.fechaEncasetamiento?.slice(0, 10)
    });
    this.modalOpen = true;
  }

  delete(loteId: string, repId: string): void {
    if (!confirm('¿Deseas eliminar este lote reproductora?')) return;
    this.svc.delete(loteId, repId).subscribe(() => this.onLoteChange());
  }

  save(): void {
    if (this.form.invalid) {
      return; // sin alertas visibles
    }

    const formValue = this.form.value;

    const data: CreateLoteReproductoraDto = {
      ...formValue,
      m: formValue.m ?? 0,
      h: formValue.h ?? 0,
      mixtas: formValue.mixtas ?? 0,
      mortCajaH: formValue.mortCajaH ?? 0,
      mortCajaM: formValue.mortCajaM ?? 0,
      unifH: formValue.unifH ?? 0,
      unifM: formValue.unifM ?? 0,
      pesoInicialM: formValue.pesoInicialM ?? 0,
      pesoInicialH: formValue.pesoInicialH ?? 0,
      reproductoraId: this.editing ? this.editing.reproductoraId : 'Sanmarino',
      fechaEncasetamiento: new Date(formValue.fechaEncasetamiento).toISOString()
    };

    const request = this.editing
      ? this.svc.update(data)
      : this.svc.create(data);

    request.subscribe(() => {
      if (!this.editing && this.loteSeleccionado) {
        const difM = data.m - (this.loteSeleccionado.machosL ?? 0);
        const difH = data.h - (this.loteSeleccionado.hembrasL ?? 0);
        const difX = data.mixtas - (this.loteSeleccionado.mixtas ?? 0);

        const sumaM = difM > 0 ? difM : 0;
        const sumaH = difH > 0 ? difH : 0;
        const sumaX = difX > 0 ? difX : 0;

        const updatedLote = {
          ...this.loteSeleccionado,
          machosL: (this.loteSeleccionado.machosL ?? 0) + sumaM,
          hembrasL: (this.loteSeleccionado.hembrasL ?? 0) + sumaH,
          mixtas: (this.loteSeleccionado.mixtas ?? 0) + sumaX,
          avesEncasetadas:
            (this.loteSeleccionado.avesEncasetadas ?? 0) + sumaM + sumaH + sumaX
        };

        this.svc.updateLote(updatedLote).subscribe(() => {
          this.onLoteChange(); // refresca la parte superior
        });
      }

      this.modalOpen = false;
      this.onLoteChange(); // refresca tabla inferior
    });
  }


  cancel(): void {
    this.modalOpen = false;
  }
}
