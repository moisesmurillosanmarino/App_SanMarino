import { Component, Input, OnInit, OnChanges, SimpleChanges, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { finalize } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { NgChartsModule } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';

import { 
  LiquidacionTecnicaService, 
  LiquidacionTecnicaDto, 
  LiquidacionTecnicaCompletaDto 
} from '../../services/liquidacion-tecnica.service';

@Component({
  selector: 'app-liquidacion-tecnica',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgChartsModule],
  templateUrl: './liquidacion-tecnica.component.html',
  styleUrls: ['./liquidacion-tecnica.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LiquidacionTecnicaComponent implements OnInit, OnChanges {
  @Input() loteId: string | null = null;
  @Input() loteNombre: string | null = null;

  // Señales reactivas
  loading = signal(false);
  liquidacion = signal<LiquidacionTecnicaDto | null>(null);
  liquidacionCompleta = signal<LiquidacionTecnicaCompletaDto | null>(null);
  error = signal<string | null>(null);

  // Formulario para filtros
  form: FormGroup;

  // Vista activa
  vistaActiva: 'resumen' | 'detalle' | 'graficos' = 'resumen';

  // Configuraciones de gráficos
  public barChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
      },
      title: {
        display: false
      }
    },
    scales: {
      x: {
        display: true,
        grid: {
          display: false
        }
      },
      y: {
        display: true,
        beginAtZero: true,
        grid: {
          color: 'rgba(0,0,0,0.1)'
        }
      }
    }
  };

  public pieChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'right',
      },
      title: {
        display: false
      }
    }
  };

  public lineChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
      },
      title: {
        display: false
      }
    },
    scales: {
      x: {
        display: true,
        grid: {
          display: false
        }
      },
      y: {
        display: true,
        beginAtZero: true,
        grid: {
          color: 'rgba(0,0,0,0.1)'
        }
      }
    },
    elements: {
      line: {
        tension: 0.4
      },
      point: {
        radius: 4,
        hoverRadius: 6
      }
    }
  };

  constructor(
    private fb: FormBuilder,
    private liquidacionService: LiquidacionTecnicaService
  ) {
    this.form = this.fb.group({
      fechaHasta: [new Date()],
      tipoVista: ['resumen'] // 'resumen' | 'completa'
    });
  }

  ngOnInit(): void {
    // Escuchar cambios en el formulario
    this.form.valueChanges.subscribe(() => {
      if (this.loteId) {
        this.cargarLiquidacion();
      }
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['loteId'] && this.loteId) {
      this.cargarLiquidacion();
    }
  }

  /**
   * Cargar liquidación técnica según el tipo seleccionado
   */
  cargarLiquidacion(): void {
    if (!this.loteId) {
      this.liquidacion.set(null);
      this.liquidacionCompleta.set(null);
      return;
    }

    const fechaHasta = this.form.value.fechaHasta || new Date();
    const tipoVista = this.form.value.tipoVista || 'resumen';

    this.loading.set(true);
    this.error.set(null);

    let request$: Observable<LiquidacionTecnicaDto | LiquidacionTecnicaCompletaDto>;
    
    if (tipoVista === 'completa') {
      request$ = this.liquidacionService.getLiquidacionCompleta(this.loteId, fechaHasta);
    } else {
      request$ = this.liquidacionService.getLiquidacionTecnica(this.loteId, fechaHasta);
    }

    request$.pipe(
      finalize(() => this.loading.set(false))
    ).subscribe({
      next: (data: LiquidacionTecnicaDto | LiquidacionTecnicaCompletaDto) => {
        if (tipoVista === 'completa') {
          const completaData = data as LiquidacionTecnicaCompletaDto;
          this.liquidacionCompleta.set(completaData);
          this.liquidacion.set(completaData.resumen);
        } else {
          const simpleData = data as LiquidacionTecnicaDto;
          this.liquidacion.set(simpleData);
          this.liquidacionCompleta.set(null);
        }
      },
      error: (error: any) => {
        console.error('Error al cargar liquidación técnica:', error);
        this.error.set(this.getErrorMessage(error));
        this.liquidacion.set(null);
        this.liquidacionCompleta.set(null);
      }
    });
  }

  /**
   * Cambiar vista activa
   */
  cambiarVista(vista: 'resumen' | 'detalle' | 'graficos'): void {
    this.vistaActiva = vista;
  }

  /**
   * Actualizar datos
   */
  actualizar(): void {
    this.cargarLiquidacion();
  }

  /**
   * Obtener indicadores para la tabla comparativa
   */
  get indicadores() {
    const liquidacion = this.liquidacion();
    if (!liquidacion) return [];

    return [
      {
        concepto: 'Mortalidad Hembras',
        real: liquidacion.porcentajeMortalidadHembras,
        guia: null,
        diferencia: null,
        unidad: '%',
        tipo: 'porcentaje'
      },
      {
        concepto: 'Mortalidad Machos',
        real: liquidacion.porcentajeMortalidadMachos,
        guia: null,
        diferencia: null,
        unidad: '%',
        tipo: 'porcentaje'
      },
      {
        concepto: 'Selección Hembras',
        real: liquidacion.porcentajeSeleccionHembras,
        guia: null,
        diferencia: null,
        unidad: '%',
        tipo: 'porcentaje'
      },
      {
        concepto: 'Selección Machos',
        real: liquidacion.porcentajeSeleccionMachos,
        guia: null,
        diferencia: null,
        unidad: '%',
        tipo: 'porcentaje'
      },
      {
        concepto: 'Retiro Total Hembras',
        real: liquidacion.porcentajeRetiroTotalHembras,
        guia: liquidacion.porcentajeRetiroGuia,
        diferencia: liquidacion.porcentajeRetiroGuia ? 
          liquidacion.porcentajeRetiroTotalHembras - liquidacion.porcentajeRetiroGuia : null,
        unidad: '%',
        tipo: 'porcentaje'
      },
      {
        concepto: 'Retiro Total Machos',
        real: liquidacion.porcentajeRetiroTotalMachos,
        guia: liquidacion.porcentajeRetiroGuia,
        diferencia: liquidacion.porcentajeRetiroGuia ? 
          liquidacion.porcentajeRetiroTotalMachos - liquidacion.porcentajeRetiroGuia : null,
        unidad: '%',
        tipo: 'porcentaje'
      },
      {
        concepto: 'Consumo Alimento',
        real: liquidacion.consumoAlimentoRealGramos,
        guia: liquidacion.consumoAlimentoGuiaGramos,
        diferencia: liquidacion.porcentajeDiferenciaConsumo,
        unidad: 'gr',
        tipo: 'peso'
      },
      {
        concepto: 'Peso Semana 25 (Hembras)',
        real: liquidacion.pesoSemana25RealHembras,
        guia: liquidacion.pesoSemana25GuiaHembras,
        diferencia: liquidacion.porcentajeDiferenciaPesoHembras,
        unidad: 'gr',
        tipo: 'peso'
      },
      {
        concepto: 'Uniformidad (Hembras)',
        real: liquidacion.uniformidadRealHembras,
        guia: liquidacion.uniformidadGuiaHembras,
        diferencia: liquidacion.porcentajeDiferenciaUniformidadHembras,
        unidad: '%',
        tipo: 'porcentaje'
      }
    ].filter(ind => ind.real != null);
  }

  /**
   * Obtener clase CSS para el estado del indicador
   */
  getEstadoClase(diferencia: number | null | undefined, tipo: string): string {
    if (diferencia === null || diferencia === undefined) return 'estado-neutral';
    
    const umbral = tipo === 'porcentaje' ? 2 : 5; // 2% para porcentajes, 5% para otros
    
    if (Math.abs(diferencia) <= umbral) return 'estado-bueno';
    if (Math.abs(diferencia) <= umbral * 2) return 'estado-alerta';
    return 'estado-critico';
  }

  /**
   * Obtener texto del estado
   */
  getEstadoTexto(diferencia: number | null | undefined, tipo: string): string {
    if (diferencia === null || diferencia === undefined) return 'Sin datos';
    
    const umbral = tipo === 'porcentaje' ? 2 : 5;
    
    if (Math.abs(diferencia) <= umbral) return 'Normal';
    if (Math.abs(diferencia) <= umbral * 2) return 'Alerta';
    return 'Crítico';
  }

  /**
   * Formatear fecha para mostrar
   */
  formatDate(date: Date | string | null | undefined): string {
    if (!date) return '—';
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('es-ES');
  }

  /**
   * Obtener mensaje de error amigable
   */
  private getErrorMessage(error: any): string {
    if (error.status === 404) {
      return 'Lote no encontrado o sin datos para liquidación técnica';
    }
    if (error.status === 400) {
      return 'Parámetros inválidos para el cálculo';
    }
    if (error.status === 500) {
      return 'Error interno del servidor';
    }
    return 'Error desconocido al calcular liquidación técnica';
  }

  // ==================== MÉTODOS PARA GRÁFICOS ====================

  /**
   * Datos para gráfico de barras: Indicadores Real vs Guía
   */
  get indicadoresChartData(): ChartData<'bar'> {
    const liquidacion = this.liquidacion();
    if (!liquidacion) {
      return { labels: [], datasets: [] };
    }

    const indicadores = [
      { label: 'Mort. H (%)', real: liquidacion.porcentajeMortalidadHembras, guia: null },
      { label: 'Mort. M (%)', real: liquidacion.porcentajeMortalidadMachos, guia: null },
      { label: 'Retiro H (%)', real: liquidacion.porcentajeRetiroTotalHembras, guia: liquidacion.porcentajeRetiroGuia },
      { label: 'Retiro M (%)', real: liquidacion.porcentajeRetiroTotalMachos, guia: liquidacion.porcentajeRetiroGuia },
      { label: 'Consumo (g)', real: liquidacion.consumoAlimentoRealGramos / 1000, guia: liquidacion.consumoAlimentoGuiaGramos ? liquidacion.consumoAlimentoGuiaGramos / 1000 : null },
      { label: 'Peso H (g)', real: liquidacion.pesoSemana25RealHembras ? liquidacion.pesoSemana25RealHembras / 1000 : null, guia: liquidacion.pesoSemana25GuiaHembras ? liquidacion.pesoSemana25GuiaHembras / 1000 : null },
      { label: 'Unif. H (%)', real: liquidacion.uniformidadRealHembras, guia: liquidacion.uniformidadGuiaHembras }
    ].filter(ind => ind.real != null);

    return {
      labels: indicadores.map(ind => ind.label),
      datasets: [
        {
          label: 'Real',
          data: indicadores.map(ind => ind.real || 0),
          backgroundColor: 'rgba(211, 47, 47, 0.8)',
          borderColor: 'rgba(211, 47, 47, 1)',
          borderWidth: 1
        },
        {
          label: 'Guía',
          data: indicadores.map(ind => ind.guia || 0),
          backgroundColor: 'rgba(120, 113, 108, 0.8)',
          borderColor: 'rgba(120, 113, 108, 1)',
          borderWidth: 1
        }
      ]
    };
  }

  /**
   * Datos para gráfico de torta: Distribución de retiros
   */
  get retirosChartData(): ChartData<'pie'> {
    const liquidacion = this.liquidacion();
    if (!liquidacion) {
      return { labels: [], datasets: [] };
    }

    const totalHembras = liquidacion.hembrasEncasetadas;
    const totalMachos = liquidacion.machosEncasetados;
    const total = totalHembras + totalMachos;

    const mortHembras = (liquidacion.porcentajeMortalidadHembras / 100) * totalHembras;
    const mortMachos = (liquidacion.porcentajeMortalidadMachos / 100) * totalMachos;
    const selHembras = (liquidacion.porcentajeSeleccionHembras / 100) * totalHembras;
    const selMachos = (liquidacion.porcentajeSeleccionMachos / 100) * totalMachos;
    const errHembras = (liquidacion.porcentajeErrorSexajeHembras / 100) * totalHembras;
    const errMachos = (liquidacion.porcentajeErrorSexajeMachos / 100) * totalMachos;
    const vivas = total - (mortHembras + mortMachos + selHembras + selMachos + errHembras + errMachos);

    return {
      labels: ['Vivas', 'Mort. Hembras', 'Mort. Machos', 'Sel. Hembras', 'Sel. Machos', 'Error Sexaje'],
      datasets: [{
        data: [vivas, mortHembras, mortMachos, selHembras, selMachos, errHembras + errMachos],
        backgroundColor: [
          'rgba(16, 185, 129, 0.8)', // Verde - Vivas
          'rgba(239, 68, 68, 0.8)',  // Rojo - Mort Hembras
          'rgba(185, 28, 28, 0.8)',  // Rojo oscuro - Mort Machos
          'rgba(245, 158, 11, 0.8)', // Amarillo - Sel Hembras
          'rgba(217, 119, 6, 0.8)',  // Amarillo oscuro - Sel Machos
          'rgba(107, 114, 128, 0.8)' // Gris - Error Sexaje
        ],
        borderColor: [
          'rgba(16, 185, 129, 1)',
          'rgba(239, 68, 68, 1)',
          'rgba(185, 28, 28, 1)',
          'rgba(245, 158, 11, 1)',
          'rgba(217, 119, 6, 1)',
          'rgba(107, 114, 128, 1)'
        ],
        borderWidth: 2
      }]
    };
  }

  /**
   * Datos para gráfico de líneas: Evolución semanal
   */
  get evolucionChartData(): ChartData<'line'> {
    const liquidacionCompleta = this.liquidacionCompleta();
    if (!liquidacionCompleta?.detallesSeguimiento?.length) {
      return { labels: [], datasets: [] };
    }

    const seguimientos = liquidacionCompleta.detallesSeguimiento
      .sort((a, b) => a.semana - b.semana);

    return {
      labels: seguimientos.map(s => `Sem ${s.semana}`),
      datasets: [
        {
          label: 'Mortalidad Hembras',
          data: seguimientos.map(s => s.mortalidadHembras || 0),
          borderColor: 'rgba(239, 68, 68, 1)',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          tension: 0.4,
          fill: false
        },
        {
          label: 'Mortalidad Machos',
          data: seguimientos.map(s => s.mortalidadMachos || 0),
          borderColor: 'rgba(185, 28, 28, 1)',
          backgroundColor: 'rgba(185, 28, 28, 0.1)',
          tension: 0.4,
          fill: false
        },
        {
          label: 'Selección Hembras',
          data: seguimientos.map(s => s.seleccionHembras || 0),
          borderColor: 'rgba(245, 158, 11, 1)',
          backgroundColor: 'rgba(245, 158, 11, 0.1)',
          tension: 0.4,
          fill: false
        },
        {
          label: 'Selección Machos',
          data: seguimientos.map(s => s.seleccionMachos || 0),
          borderColor: 'rgba(217, 119, 6, 1)',
          backgroundColor: 'rgba(217, 119, 6, 0.1)',
          tension: 0.4,
          fill: false
        }
      ]
    };
  }

  /**
   * Datos para gráfico de líneas: Consumo y Peso
   */
  get consumoPesoChartData(): ChartData<'line'> {
    const liquidacionCompleta = this.liquidacionCompleta();
    if (!liquidacionCompleta?.detallesSeguimiento?.length) {
      return { labels: [], datasets: [] };
    }

    const seguimientos = liquidacionCompleta.detallesSeguimiento
      .sort((a, b) => a.semana - b.semana);

    return {
      labels: seguimientos.map(s => `Sem ${s.semana}`),
      datasets: [
        {
          label: 'Consumo Alimento (kg)',
          data: seguimientos.map(s => s.consumoAlimento || 0),
          borderColor: 'rgba(59, 130, 246, 1)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.4,
          fill: false,
          yAxisID: 'y'
        },
        {
          label: 'Peso Hembras (g)',
          data: seguimientos.map(s => (s.pesoPromedioHembras || 0) / 1000), // Convertir a kg para mejor escala
          borderColor: 'rgba(16, 185, 129, 1)',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          tension: 0.4,
          fill: false,
          yAxisID: 'y1'
        },
        {
          label: 'Uniformidad Hembras (%)',
          data: seguimientos.map(s => s.uniformidadHembras || 0),
          borderColor: 'rgba(168, 162, 158, 1)',
          backgroundColor: 'rgba(168, 162, 158, 0.1)',
          tension: 0.4,
          fill: false,
          yAxisID: 'y2'
        }
      ]
    };
  }

  /**
   * Opciones específicas para el gráfico de consumo y peso (múltiples ejes Y)
   */
  get consumoPesoChartOptions(): ChartConfiguration['options'] {
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: 'top',
        },
        title: {
          display: false
        }
      },
      scales: {
        x: {
          display: true,
          grid: {
            display: false
          }
        },
        y: {
          type: 'linear',
          display: true,
          position: 'left',
          title: {
            display: true,
            text: 'Consumo (kg)'
          },
          grid: {
            color: 'rgba(59, 130, 246, 0.1)'
          }
        },
        y1: {
          type: 'linear',
          display: true,
          position: 'right',
          title: {
            display: true,
            text: 'Peso (kg)'
          },
          grid: {
            drawOnChartArea: false,
          },
        },
        y2: {
          type: 'linear',
          display: false,
          min: 0,
          max: 100
        }
      },
      elements: {
        line: {
          tension: 0.4
        },
        point: {
          radius: 4,
          hoverRadius: 6
        }
      }
    };
  }
}
