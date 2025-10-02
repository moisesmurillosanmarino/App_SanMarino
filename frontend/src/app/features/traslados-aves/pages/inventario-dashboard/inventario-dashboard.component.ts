import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { SidebarComponent } from '../../../../shared/components/sidebar/sidebar.component';
import { LoteFilterComponent, LoteFilterCriteria } from '../../../../shared/components/lote-filter/lote-filter.component';
import { LoteDto } from '../../../lote/services/lote.service';
import { 
  TrasladosAvesService, 
  InventarioAvesDto, 
  InventarioAvesSearchRequest, 
  ResumenInventarioDto,
  PagedResult
} from '../../services/traslados-aves.service';

@Component({
  selector: 'app-inventario-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, SidebarComponent, LoteFilterComponent],
  templateUrl: './inventario-dashboard.component.html',
  styleUrls: ['./inventario-dashboard.component.scss']
})
export class InventarioDashboardComponent implements OnInit {
  // Signals para manejo de estado reactivo
  resumen = signal<ResumenInventarioDto | null>(null);
  inventarios = signal<InventarioAvesDto[]>([]);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);
  totalRecords = signal<number>(0);
  currentPage = signal<number>(1);

  // Filtros
  filtros: InventarioAvesSearchRequest = {
    soloActivos: true,
    sortBy: 'lote_id',
    sortDesc: false,
    page: 1,
    pageSize: 20
  };

  // Computed properties
  hasData = computed(() => this.inventarios().length > 0);
  hasError = computed(() => !!this.error());
  isLoading = computed(() => this.loading());
  totalPages = computed(() => Math.ceil(this.totalRecords() / this.filtros.pageSize));

  // Modal de traslado
  modalTrasladoAbierto = signal<boolean>(false);
  trasladoForm!: FormGroup;
  loteOrigenSeleccionado = signal<LoteDto | null>(null);
  loteDestinoSeleccionado = signal<LoteDto | null>(null);
  inventarioOrigen = signal<InventarioAvesDto | null>(null);
  inventarioDestino = signal<InventarioAvesDto | null>(null);
  procesandoTraslado = signal<boolean>(false);
  errorTraslado = signal<string | null>(null);
  exitoTraslado = signal<boolean>(false);

  constructor(
    private trasladosService: TrasladosAvesService,
    private router: Router,
    private route: ActivatedRoute,
    private fb: FormBuilder
  ) {
    this.initTrasladoForm();
  }

  ngOnInit(): void {
    this.cargarResumen();
    this.cargarInventarios();
  }

  async cargarResumen(): Promise<void> {
    try {
      this.error.set(null);
      const resumen = await this.trasladosService.getResumenInventario().toPromise();
      this.resumen.set(resumen || null);
    } catch (error: any) {
      console.error('Error al cargar resumen:', error);
      this.error.set(error.message || 'Error al cargar el resumen del inventario');
    }
  }

  async cargarInventarios(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);

    try {
      const result = await this.trasladosService.searchInventarios(this.filtros).toPromise();
      if (result) {
        this.inventarios.set(result.items);
        this.totalRecords.set(result.total);
        this.currentPage.set(result.page);
      }
    } catch (error: any) {
      console.error('Error al cargar inventarios:', error);
      this.error.set(error.message || 'Error al cargar los inventarios');
      this.inventarios.set([]);
    } finally {
      this.loading.set(false);
    }
  }

  onFiltroChange(): void {
    this.filtros.page = 1;
    this.cargarInventarios();
  }

  onPageChange(page: number): void {
    this.filtros.page = page;
    this.cargarInventarios();
  }

  onSortChange(sortBy: string): void {
    if (this.filtros.sortBy === sortBy) {
      this.filtros.sortDesc = !this.filtros.sortDesc;
    } else {
      this.filtros.sortBy = sortBy;
      this.filtros.sortDesc = false;
    }
    this.onFiltroChange();
  }

  // Inicialización del formulario de traslado
  private initTrasladoForm(): void {
    this.trasladoForm = this.fb.group({
      cantidadHembras: [0, [Validators.required, Validators.min(0)]],
      cantidadMachos: [0, [Validators.required, Validators.min(0)]],
      observaciones: ['']
    });
  }

  // Modal de traslado
  abrirModalTraslado(): void {
    this.modalTrasladoAbierto.set(true);
    this.limpiarFormularioTraslado();
  }

  cerrarModalTraslado(): void {
    this.modalTrasladoAbierto.set(false);
    this.limpiarFormularioTraslado();
  }

  private limpiarFormularioTraslado(): void {
    this.trasladoForm.reset({
      cantidadHembras: 0,
      cantidadMachos: 0,
      observaciones: ''
    });
    this.loteOrigenSeleccionado.set(null);
    this.loteDestinoSeleccionado.set(null);
    this.inventarioOrigen.set(null);
    this.inventarioDestino.set(null);
    this.errorTraslado.set(null);
    this.exitoTraslado.set(false);
  }

  // Manejo de selección de lotes
  onLoteOrigenSeleccionado(lote: LoteDto | null): void {
    this.loteOrigenSeleccionado.set(lote);
    if (lote) {
      this.cargarInventarioOrigen(lote.loteId);
    } else {
      this.inventarioOrigen.set(null);
    }
  }

  onLoteDestinoSeleccionado(lote: LoteDto | null): void {
    this.loteDestinoSeleccionado.set(lote);
    if (lote) {
      this.cargarInventarioDestino(lote.loteId);
    } else {
      this.inventarioDestino.set(null);
    }
  }

  private async cargarInventarioOrigen(loteId: string): Promise<void> {
    try {
      const inventario = await this.trasladosService.getInventarioByLote(loteId).toPromise();
      this.inventarioOrigen.set(inventario || null);
    } catch (error) {
      console.error('Error cargando inventario origen:', error);
      this.errorTraslado.set('Error al cargar el inventario del lote origen');
    }
  }

  private async cargarInventarioDestino(loteId: string): Promise<void> {
    try {
      const inventario = await this.trasladosService.getInventarioByLote(loteId).toPromise();
      this.inventarioDestino.set(inventario || null);
    } catch (error) {
      console.error('Error cargando inventario destino:', error);
      this.errorTraslado.set('Error al cargar el inventario del lote destino');
    }
  }

  // Procesar traslado
  async procesarTraslado(): Promise<void> {
    if (!this.trasladoForm.valid || !this.loteOrigenSeleccionado() || !this.loteDestinoSeleccionado()) {
      return;
    }

    this.procesandoTraslado.set(true);
    this.errorTraslado.set(null);

    try {
      const request = {
        loteOrigenId: this.loteOrigenSeleccionado()!.loteId,
        loteDestinoId: this.loteDestinoSeleccionado()!.loteId,
        cantidadHembras: this.trasladoForm.get('cantidadHembras')?.value || 0,
        cantidadMachos: this.trasladoForm.get('cantidadMachos')?.value || 0,
        observaciones: this.trasladoForm.get('observaciones')?.value || ''
      };

      await this.trasladosService.trasladoRapido(request).toPromise();
      
      this.exitoTraslado.set(true);
      
      // Recargar datos después del traslado exitoso
      setTimeout(() => {
        this.cargarResumen();
        this.cargarInventarios();
        this.cerrarModalTraslado();
      }, 2000);

    } catch (error: any) {
      console.error('Error procesando traslado:', error);
      this.errorTraslado.set(error.message || 'Error al procesar el traslado');
    } finally {
      this.procesandoTraslado.set(false);
    }
  }

  // Validaciones del formulario
  isFormValid(): boolean {
    return this.trasladoForm.valid && 
           !!this.loteOrigenSeleccionado() && 
           !!this.loteDestinoSeleccionado() &&
           (this.trasladoForm.get('cantidadHembras')?.value > 0 || 
            this.trasladoForm.get('cantidadMachos')?.value > 0);
  }

  getTotalAves(): number {
    const hembras = this.trasladoForm.get('cantidadHembras')?.value || 0;
    const machos = this.trasladoForm.get('cantidadMachos')?.value || 0;
    return hembras + machos;
  }

  // Navegación a otras páginas (mantener funcionalidad existente)
  navegarATraslados(): void {
    this.abrirModalTraslado(); // Cambiar para abrir modal en lugar de navegar
  }

  navegarAMovimientos(): void {
    this.router.navigate(['movimientos'], { relativeTo: this.route });
  }

  navegarAHistorial(): void {
    this.router.navigate(['historial'], { relativeTo: this.route });
  }

  // Acciones de inventario
  async editarInventario(id: number): Promise<void> {
    // TODO: Implementar modal de edición
    console.log('Editar inventario:', id);
  }

  async ajustarInventario(loteId: string): Promise<void> {
    // TODO: Implementar modal de ajuste
    console.log('Ajustar inventario:', loteId);
  }

  async verTrazabilidad(loteId: string): Promise<void> {
    this.router.navigate(['historial', loteId], { relativeTo: this.route });
  }

  async eliminarInventario(id: number): Promise<void> {
    if (!confirm('¿Está seguro de que desea eliminar este inventario?')) {
      return;
    }

    try {
      await this.trasladosService.deleteInventario(id).toPromise();
      this.cargarInventarios(); // Recargar lista
    } catch (error: any) {
      console.error('Error al eliminar inventario:', error);
      this.error.set(error.message || 'Error al eliminar el inventario');
    }
  }

  // Utilidades
  calcularTotalAves(inventario: InventarioAvesDto): number {
    return inventario.cantidadHembras + inventario.cantidadMachos;
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

  formatearNumero(numero: number): string {
    return numero.toLocaleString('es-CO');
  }

  limpiarFiltros(): void {
    this.filtros = {
      soloActivos: true,
      sortBy: 'lote_id',
      sortDesc: false,
      page: 1,
      pageSize: 20
    };
    this.cargarInventarios();
  }

  // Trackby functions para optimización
  trackByInventarioId(index: number, item: InventarioAvesDto): number {
    return item.id;
  }

  trackByGranjaId(index: number, item: any): number {
    return item.granjaId;
  }
}
