// src/app/features/lote/components/modal-create-edit-lote/modal-create-edit-lote.component.ts
import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidatorFn } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { 
  faUserPlus, faUser, faSave, faTimes, faEnvelope, faPhone, faIdCard, faBuilding, faUsers
} from '@fortawesome/free-solid-svg-icons';
import { Subject, takeUntil, forkJoin } from 'rxjs';

import { LoteService, LoteDto, CreateLoteDto, UpdateLoteDto } from '../../services/lote.service';
import { FarmService, FarmDto } from '../../../farm/services/farm.service';
import { NucleoService, NucleoDto } from '../../../nucleo/services/nucleo.service';
import { GalponService } from '../../../galpon/services/galpon.service';
import { GalponDetailDto } from '../../../galpon/models/galpon.models';
import { UserService, UserDto, User } from '../../../../core/services/user/user.service';
import { Company, CompanyService } from '../../../../core/services/company/company.service';
import { MasterListService } from '../../../../core/services/master-list/master-list.service';
import { GuiaGeneticaService, LineaGeneticaOption } from '../../services/guia-genetica.service';

// === Validador: array requerido (>=1 ítem) ===
const requiredArray: ValidatorFn = (ctrl: AbstractControl) => {
  const v = ctrl.value;
  return Array.isArray(v) && v.length > 0 ? null : { required: true };
};

// === Validador: confirmar contraseña ===
const match = (field: string): ValidatorFn => (ctrl: AbstractControl) => {
  const parent = ctrl.parent as FormGroup | null;
  if (!parent) return null;
  const target = parent.get(field);
  return target && ctrl.value === target.value ? null : { mismatch: true };
};

@Component({
  selector: 'app-modal-create-edit-lote',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, FontAwesomeModule],
  templateUrl: './modal-create-edit-lote.component.html',
  styleUrls: ['./modal-create-edit-lote.component.scss']
})
export class ModalCreateEditLoteComponent implements OnInit, OnDestroy {
  @Input() isOpen: boolean = false;
  @Input() editingLote: LoteDto | null = null;
  @Input() selectedFarmId: number | null = null; // Granja preseleccionada
  
  @Output() close = new EventEmitter<void>();
  @Output() loteSaved = new EventEmitter<LoteDto>();

  // Iconos
  faUserPlus = faUserPlus;
  faUser = faUser;
  faSave = faSave;
  faTimes = faTimes;
  faEnvelope = faEnvelope;
  faPhone = faPhone;
  faIdCard = faIdCard;
  faBuilding = faBuilding;
  faUsers = faUsers;

  // Estado
  loading = false;
  saving = false;
  
  // Form
  form!: FormGroup;

  // Datos maestros
  farms: FarmDto[] = [];
  nucleos: NucleoDto[] = [];
  galpones: GalponDetailDto[] = [];
  tecnicos: User[] = [];
  companies: Company[] = [];

  // Datos para raza y línea genética
  razasDisponibles: string[] = [];
  lineasGeneticas: LineaGeneticaOption[] = [];
  selectedRaza: string = '';
  selectedLineaGeneticaId: number | null = null;

  // Filtros en cascada (modal)
  nucleosFiltrados: NucleoDto[] = [];
  galponesFiltrados: GalponDetailDto[] = [];
  filteredNucleos: NucleoDto[] = [];
  filteredGalpones: GalponDetailDto[] = [];

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private loteSvc: LoteService,
    private farmSvc: FarmService,
    private nucleoSvc: NucleoService,
    private galponSvc: GalponService,
    private userSvc: UserService,
    private companySvc: CompanyService,
    private masterSvc: MasterListService,
    private guiaGeneticaSvc: GuiaGeneticaService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadMasterData();
    this.setupFormChains();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngOnChanges(): void {
    if (this.isOpen) {
      this.loadMasterData();
      if (this.editingLote) {
        this.populateForm();
      } else {
        this.resetForm();
        // Preseleccionar granja si se proporciona
        if (this.selectedFarmId) {
          this.form.patchValue({ granjaId: this.selectedFarmId });
        }
      }
    }
  }

  private initForm(): void {
    this.form = this.fb.group({
      granjaId: ['', Validators.required],
      nucleoId: ['', Validators.required],
      galponId: [''],
      loteNombre: ['', [Validators.required, Validators.minLength(2)]],
      fechaEncaset: ['', Validators.required],
      hembrasL: [0, [Validators.min(0)]],
      machosL: [0, [Validators.min(0)]],
      pesoInicialH: [0, [Validators.min(0)]],
      pesoInicialM: [0, [Validators.min(0)]],
      unifH: [0, [Validators.min(0)]],
      unifM: [0, [Validators.min(0)]],
      mortCajaH: [0, [Validators.min(0)]],
      mortCajaM: [0, [Validators.min(0)]],
      raza: [''],
      anoTablaGenetica: [null],
      linea: [''],
      tipoLinea: [''],
      codigoGuiaGenetica: [''],
      lineaGeneticaId: [null],
      tecnico: [''],
      mixtas: [null, [Validators.min(0)]],
      pesoMixto: [null, [Validators.min(0)]],
      avesEncasetadas: [null, [Validators.min(0)]],
      loteErp: [''],
      lineaGenetica: ['']
    });
  }

  private loadMasterData(): void {
    this.loading = true;
    
    forkJoin({
      farms: this.farmSvc.getAll(),
      nucleos: this.nucleoSvc.getAll(),
      galpones: this.galponSvc.getAll(),
      tecnicos: this.userSvc.getAll(),
      companies: this.companySvc.getAll(),
      razas: this.guiaGeneticaSvc.getRazasDisponibles(),
    }).subscribe(({ farms, nucleos, galpones, tecnicos, companies, razas }) => {
      this.farms = farms;
      this.nucleos = nucleos;
      this.galpones = galpones;
      this.tecnicos = tecnicos;
      this.companies = companies;
      this.razasDisponibles = razas;
      
      this.loading = false;
      this.cdr.detectChanges();
    });
  }

  private setupFormChains(): void {
    // Chain: Granja -> Núcleo -> Galpón
    this.form.get('granjaId')!.valueChanges.subscribe(granjaId => {
      this.nucleosFiltrados = this.nucleos.filter(n => n.granjaId === Number(granjaId));
      this.filteredNucleos = this.nucleosFiltrados;
      const primerNucleo = this.nucleosFiltrados[0]?.nucleoId ?? null;
      this.form.patchValue({ nucleoId: primerNucleo });

      this.galponesFiltrados = [];
      this.filteredGalpones = [];
      this.form.get('galponId')?.setValue(null);
    });

    this.form.get('nucleoId')!.valueChanges.subscribe(nucleoId => {
      this.galponesFiltrados = this.galpones.filter(g => g.nucleoId === nucleoId);
      this.filteredGalpones = this.galponesFiltrados;
      const primerGalpon = this.galponesFiltrados[0]?.galponId ?? null;
      this.form.patchValue({ galponId: primerGalpon });
    });
  }

  private populateForm(): void {
    if (!this.editingLote) return;

    const lote = this.editingLote;
    this.form.patchValue({
      granjaId: lote.granjaId,
      nucleoId: lote.nucleoId,
      galponId: lote.galponId,
      loteNombre: lote.loteNombre,
      fechaEncaset: lote.fechaEncaset,
      hembrasL: lote.hembrasL,
      machosL: lote.machosL,
      pesoInicialH: lote.pesoInicialH,
      pesoInicialM: lote.pesoInicialM,
      unifH: lote.unifH,
      unifM: lote.unifM,
      mortCajaH: lote.mortCajaH,
      mortCajaM: lote.mortCajaM,
      raza: lote.raza,
      anoTablaGenetica: lote.anoTablaGenetica,
      linea: lote.linea,
      tipoLinea: lote.tipoLinea,
      codigoGuiaGenetica: lote.codigoGuiaGenetica,
      lineaGeneticaId: lote.lineaGeneticaId,
      tecnico: lote.tecnico,
      mixtas: lote.mixtas,
      pesoMixto: lote.pesoMixto,
      avesEncasetadas: lote.avesEncasetadas,
      loteErp: lote.loteErp,
      lineaGenetica: lote.lineaGenetica
    });
  }

  private resetForm(): void {
    this.form.reset();
    this.nucleosFiltrados = [];
    this.galponesFiltrados = [];
    this.filteredNucleos = [];
    this.filteredGalpones = [];
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving = true;
    const formValue = this.form.value;

    const dto: CreateLoteDto | UpdateLoteDto = {
      ...formValue,
      granjaId: Number(formValue.granjaId),
      nucleoId: formValue.nucleoId,
      galponId: formValue.galponId || null,
      hembrasL: Number(formValue.hembrasL) || 0,
      machosL: Number(formValue.machosL) || 0,
      pesoInicialH: Number(formValue.pesoInicialH) || 0,
      pesoInicialM: Number(formValue.pesoInicialM) || 0,
      unifH: Number(formValue.unifH) || 0,
      unifM: Number(formValue.unifM) || 0,
      mortCajaH: Number(formValue.mortCajaH) || 0,
      mortCajaM: Number(formValue.mortCajaM) || 0,
      mixtas: formValue.mixtas ? Number(formValue.mixtas) : null,
      pesoMixto: formValue.pesoMixto ? Number(formValue.pesoMixto) : null,
      avesEncasetadas: formValue.avesEncasetadas ? Number(formValue.avesEncasetadas) : null,
      anoTablaGenetica: formValue.anoTablaGenetica ? Number(formValue.anoTablaGenetica) : null,
      lineaGeneticaId: formValue.lineaGeneticaId ? Number(formValue.lineaGeneticaId) : null
    };

    const operation = this.editingLote 
      ? this.loteSvc.update({ ...dto, loteId: this.editingLote.loteId } as UpdateLoteDto)
      : this.loteSvc.create(dto as CreateLoteDto);

    operation.pipe(takeUntil(this.destroy$)).subscribe({
      next: (savedLote) => {
        this.saving = false;
        this.loteSaved.emit(savedLote);
        this.closeModal();
      },
      error: (error) => {
        console.error('Error guardando lote:', error);
        this.saving = false;
      }
    });
  }

  closeModal(): void {
    this.close.emit();
  }

  // Getters para validación en template
  get isFormValid(): boolean {
    return this.form.valid;
  }

  get isEditing(): boolean {
    return !!this.editingLote;
  }

  get modalTitle(): string {
    return this.isEditing ? 'Editar Lote' : 'Registrar Nuevo Lote';
  }
}
