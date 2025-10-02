import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { SidebarComponent } from '../../../../shared/components/sidebar/sidebar.component';
import { LoteFilterComponent, LoteFilterCriteria } from '../../../../shared/components/lote-filter/lote-filter.component';
import { LoteDto } from '../../../lote/services/lote.service';
import { 
  TrasladosAvesService, 
  TrasladoRapidoRequest, 
  TrasladoRapidoResponse,
  InventarioAvesDto
} from '../../services/traslados-aves.service';

@Component({
  selector: 'app-traslado-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SidebarComponent, LoteFilterComponent],
  templateUrl: './traslado-form.component.html',
  styleUrls: ['./traslado-form.component.scss']
})
export class TrasladoFormComponent implements OnInit {
  // Signals para manejo de estado reactivo
  form!: FormGroup;
  lotesDisponibles = signal<string[]>([]);
  inventarioOrigen = signal<InventarioAvesDto | null>(null);
  inventarioDestino = signal<InventarioAvesDto | null>(null);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);
  success = signal<TrasladoRapidoResponse | null>(null);
  validandoLotes = signal<boolean>(false);
  
  // Filtros de lotes
  loteOrigenSeleccionado = signal<LoteDto | null>(null);
  loteDestinoSeleccionado = signal<LoteDto | null>(null);
  filtrosOrigen = signal<LoteFilterCriteria>({});
  filtrosDestino = signal<LoteFilterCriteria>({});

  // Computed properties
  isFormValid = computed(() => this.form?.valid || false);
  hasError = computed(() => !!this.error());
  hasSuccess = computed(() => !!this.success());
  isProcessing = computed(() => this.loading());
  
  totalATrasladas = computed(() => {
    if (!this.form) return 0;
    const hembras = this.form.get('cantidadHembras')?.value || 0;
    const machos = this.form.get('cantidadMachos')?.value || 0;
    return hembras + machos;
  });

  constructor(
    private fb: FormBuilder,
    private trasladosService: TrasladosAvesService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.initForm();
  }

  ngOnInit(): void {
    this.cargarLotesDisponibles();
  }

  private initForm(): void {
    this.form = this.fb.group({
      loteOrigenId: ['', [Validators.required]],
      loteDestinoId: ['', [Validators.required]],
      cantidadHembras: [0, [Validators.required, Validators.min(0)]],
      cantidadMachos: [0, [Validators.required, Validators.min(0)]],
      observaciones: ['']
    });

    // Suscribirse a cambios en los lotes para cargar inventarios
    this.form.get('loteOrigenId')?.valueChanges.subscribe(loteId => {
      if (loteId) {
        this.cargarInventarioOrigen(loteId);
      } else {
        this.inventarioOrigen.set(null);
      }
      this.limpiarMensajes();
    });

    this.form.get('loteDestinoId')?.valueChanges.subscribe(loteId => {
      if (loteId) {
        this.cargarInventarioDestino(loteId);
      } else {
        this.inventarioDestino.set(null);
      }
      this.limpiarMensajes();
    });

    // Validar cantidades cuando cambien
    this.form.get('cantidadHembras')?.valueChanges.subscribe(() => {
      this.validarCantidades();
    });

    this.form.get('cantidadMachos')?.valueChanges.subscribe(() => {
      this.validarCantidades();
    });
  }

  async cargarLotesDisponibles(): Promise<void> {
    try {
      this.error.set(null);
      const lotes = await this.trasladosService.getLotesDisponibles().toPromise();
      this.lotesDisponibles.set(lotes || []);
    } catch (error: any) {
      console.error('Error al cargar lotes:', error);
      this.error.set(error.message || 'Error al cargar los lotes disponibles');
    }
  }

  async cargarInventarioOrigen(loteId: string): Promise<void> {
    try {
      this.validandoLotes.set(true);
      const inventario = await this.trasladosService.getInventarioByLote(loteId).toPromise();
      this.inventarioOrigen.set(inventario || null);
    } catch (error: any) {
      console.error('Error al cargar inventario origen:', error);
      this.inventarioOrigen.set(null);
      this.error.set('Error al cargar el inventario del lote origen');
    } finally {
      this.validandoLotes.set(false);
    }
  }

  async cargarInventarioDestino(loteId: string): Promise<void> {
    try {
      this.validandoLotes.set(true);
      const inventario = await this.trasladosService.getInventarioByLote(loteId).toPromise();
      this.inventarioDestino.set(inventario || null);
    } catch (error: any) {
      console.error('Error al cargar inventario destino:', error);
      this.inventarioDestino.set(null);
      this.error.set('Error al cargar el inventario del lote destino');
    } finally {
      this.validandoLotes.set(false);
    }
  }

  private validarCantidades(): void {
    const inventario = this.inventarioOrigen();
    if (!inventario) return;

    const cantidadHembras = this.form.get('cantidadHembras')?.value || 0;
    const cantidadMachos = this.form.get('cantidadMachos')?.value || 0;

    // Validar que no exceda las cantidades disponibles
    if (cantidadHembras > inventario.cantidadHembras) {
      this.form.get('cantidadHembras')?.setErrors({ 
        exceedsAvailable: { 
          max: inventario.cantidadHembras, 
          actual: cantidadHembras 
        } 
      });
    }

    if (cantidadMachos > inventario.cantidadMachos) {
      this.form.get('cantidadMachos')?.setErrors({ 
        exceedsAvailable: { 
          max: inventario.cantidadMachos, 
          actual: cantidadMachos 
        } 
      });
    }

    // Validar que se traslade al menos una ave
    if (cantidadHembras + cantidadMachos === 0) {
      this.error.set('Debe trasladar al menos una ave');
    } else {
      if (this.error() === 'Debe trasladar al menos una ave') {
        this.error.set(null);
      }
    }
  }

  async onSubmit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const formValue = this.form.value;
    
    // Validaciones adicionales
    if (formValue.loteOrigenId === formValue.loteDestinoId) {
      this.error.set('El lote origen y destino no pueden ser el mismo');
      return;
    }

    if (formValue.cantidadHembras + formValue.cantidadMachos === 0) {
      this.error.set('Debe trasladar al menos una ave');
      return;
    }

    this.loading.set(true);
    this.error.set(null);
    this.success.set(null);

    try {
      const request: TrasladoRapidoRequest = {
        loteOrigenId: formValue.loteOrigenId,
        loteDestinoId: formValue.loteDestinoId,
        cantidadHembras: formValue.cantidadHembras,
        cantidadMachos: formValue.cantidadMachos,
        observaciones: formValue.observaciones || undefined
      };

      const result = await this.trasladosService.trasladoRapido(request).toPromise();
      
      if (result?.success) {
        this.success.set(result);
        this.form.reset();
        this.inventarioOrigen.set(null);
        this.inventarioDestino.set(null);
        
        // Recargar lotes disponibles
        await this.cargarLotesDisponibles();
      } else {
        this.error.set(result?.message || 'Error al realizar el traslado');
      }
    } catch (error: any) {
      console.error('Error al realizar traslado:', error);
      this.error.set(error.message || 'Error al realizar el traslado');
    } finally {
      this.loading.set(false);
    }
  }

  limpiarFormulario(): void {
    this.form.reset();
    this.inventarioOrigen.set(null);
    this.inventarioDestino.set(null);
    this.limpiarMensajes();
  }

  limpiarMensajes(): void {
    this.error.set(null);
    this.success.set(null);
  }

  // Manejo de filtros de lotes
  onLoteOrigenSelected(lote: LoteDto | null): void {
    this.loteOrigenSeleccionado.set(lote);
    if (lote) {
      this.form.patchValue({ loteOrigen: lote.loteId });
      this.cargarInventarioOrigen(lote.loteId);
    } else {
      this.form.patchValue({ loteOrigen: '' });
      this.inventarioOrigen.set(null);
    }
  }

  onLoteDestinoSelected(lote: LoteDto | null): void {
    this.loteDestinoSeleccionado.set(lote);
    if (lote) {
      this.form.patchValue({ loteDestino: lote.loteId });
      this.cargarInventarioDestino(lote.loteId);
    } else {
      this.form.patchValue({ loteDestino: '' });
      this.inventarioDestino.set(null);
    }
  }

  onFiltrosOrigenChange(filtros: LoteFilterCriteria): void {
    this.filtrosOrigen.set(filtros);
  }

  onFiltrosDestinoChange(filtros: LoteFilterCriteria): void {
    this.filtrosDestino.set(filtros);
  }


  // Navegación
  navegarADashboard(): void {
    this.router.navigate(['../dashboard'], { relativeTo: this.route });
  }

  navegarAMovimientos(): void {
    this.router.navigate(['../movimientos'], { relativeTo: this.route });
  }

  // Utilidades de validación
  isFieldInvalid(fieldName: string): boolean {
    const field = this.form.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.form.get(fieldName);
    if (field?.errors) {
      if (field.errors['required']) return `${this.getFieldLabel(fieldName)} es requerido`;
      if (field.errors['min']) return `Valor mínimo: ${field.errors['min'].min}`;
      if (field.errors['exceedsAvailable']) {
        const error = field.errors['exceedsAvailable'];
        return `Cantidad máxima disponible: ${error.max}`;
      }
    }
    return '';
  }

  private getFieldLabel(fieldName: string): string {
    const labels: Record<string, string> = {
      'loteOrigenId': 'Lote origen',
      'loteDestinoId': 'Lote destino',
      'cantidadHembras': 'Cantidad de hembras',
      'cantidadMachos': 'Cantidad de machos'
    };
    return labels[fieldName] || fieldName;
  }

  // Utilidades de formato
  formatearNumero(numero: number): string {
    return numero.toLocaleString('es-CO');
  }

  formatearFecha(fecha: Date | string): string {
    if (!fecha) return '—';
    const date = typeof fecha === 'string' ? new Date(fecha) : fecha;
    return date.toLocaleDateString('es-CO', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // Métodos para autocompletar cantidades
  trasladarTodasLasHembras(): void {
    const inventario = this.inventarioOrigen();
    if (inventario) {
      this.form.get('cantidadHembras')?.setValue(inventario.cantidadHembras);
    }
  }

  trasladarTodosLosMachos(): void {
    const inventario = this.inventarioOrigen();
    if (inventario) {
      this.form.get('cantidadMachos')?.setValue(inventario.cantidadMachos);
    }
  }

  trasladarTodo(): void {
    this.trasladarTodasLasHembras();
    this.trasladarTodosLosMachos();
  }
}
