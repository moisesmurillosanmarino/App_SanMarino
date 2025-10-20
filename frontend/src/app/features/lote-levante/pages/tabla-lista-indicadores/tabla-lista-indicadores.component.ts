import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SeguimientoLoteLevanteDto } from '../../services/seguimiento-lote-levante.service';
import { LoteDto } from '../../../lote/services/lote.service';

interface IndicadorSemanal {
  semana: number;
  fechaInicio: string;
  fechaFin: string;
  avesInicioSemana: number;
  avesFinSemana: number;
  consumoReal: number;
  consumoTabla: number;
  conversionAlimenticia: number;
  gananciaSemana: number;
  gananciaDiariaAcumulada: number;
  mortalidadSem: number;
  seleccionSem: number;
  mortalidadMasSeleccion: number;
  eficiencia: number;
  ip: number;
  vpi: number;
  saldoAvesSemanal: number;
  mortalidadAcum: number;
  seleccionAcum: number;
  mortalidadMasSeleccionAcum: number;
  pisoTermicoVisible: boolean;
  pesoInicial: number;
  pesoCierre: number;
  pesoAnterior: number;
}

@Component({
  selector: 'app-tabla-lista-indicadores',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tabla-lista-indicadores.component.html',
  styleUrls: ['./tabla-lista-indicadores.component.scss']
})
export class TablaListaIndicadoresComponent implements OnInit, OnChanges {
  @Input() seguimientos: SeguimientoLoteLevanteDto[] = [];
  @Input() selectedLote: LoteDto | null = null;
  @Input() loading: boolean = false;

  // Datos calculados
  indicadoresSemanales: IndicadorSemanal[] = [];

  constructor() { }

  ngOnInit(): void {
    this.calcularIndicadores();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['seguimientos'] || changes['selectedLote']) {
      this.calcularIndicadores();
    }
  }

  // ================== CÁLCULOS DE INDICADORES ==================
  private calcularIndicadores(): void {
    if (!this.seguimientos || this.seguimientos.length === 0 || !this.selectedLote) {
      this.indicadoresSemanales = [];
      return;
    }

    // Agrupar registros por semana
    const registrosPorSemana = this.agruparPorSemana(this.seguimientos);
    
    // Calcular indicadores para cada semana
    this.indicadoresSemanales = this.calcularIndicadoresSemanales(registrosPorSemana);
  }

  private agruparPorSemana(registros: SeguimientoLoteLevanteDto[]): Map<number, SeguimientoLoteLevanteDto[]> {
    const grupos = new Map<number, SeguimientoLoteLevanteDto[]>();
    
    registros.forEach(registro => {
      const semana = this.calcularSemana(registro.fechaRegistro);
      if (!grupos.has(semana)) {
        grupos.set(semana, []);
      }
      grupos.get(semana)!.push(registro);
    });

    // Ordenar registros dentro de cada semana por fecha
    grupos.forEach((registros, semana) => {
      registros.sort((a, b) => new Date(a.fechaRegistro).getTime() - new Date(b.fechaRegistro).getTime());
    });

    return grupos;
  }

  private calcularSemana(fechaRegistro: string | Date): number {
    if (!this.selectedLote?.fechaEncaset) return 1;
    
    const fechaEncaset = new Date(this.selectedLote.fechaEncaset);
    const fechaReg = new Date(fechaRegistro);
    const diffTime = fechaReg.getTime() - fechaEncaset.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return Math.max(1, Math.ceil(diffDays / 7));
  }

  private calcularIndicadoresSemanales(grupos: Map<number, SeguimientoLoteLevanteDto[]>): IndicadorSemanal[] {
    const indicadores: IndicadorSemanal[] = [];
    const semanas = Array.from(grupos.keys()).sort((a, b) => a - b);
    
    let avesAcumuladas = this.selectedLote?.avesEncasetadas || 0;
    let mortalidadAcumulada = 0;
    let seleccionAcumulada = 0;
    let pesoAnterior = this.selectedLote?.pesoInicialH || 0;

    semanas.forEach(semana => {
      const registros = grupos.get(semana) || [];
      const indicador = this.calcularIndicadorSemana(semana, registros, avesAcumuladas, mortalidadAcumulada, seleccionAcumulada, pesoAnterior);
      
      indicadores.push(indicador);
      
      // Actualizar acumulados para la siguiente semana
      avesAcumuladas = indicador.avesFinSemana;
      mortalidadAcumulada += indicador.mortalidadSem;
      seleccionAcumulada += indicador.seleccionSem;
      pesoAnterior = indicador.pesoCierre;
    });

    return indicadores;
  }

  private calcularIndicadorSemana(
    semana: number, 
    registros: SeguimientoLoteLevanteDto[], 
    avesInicio: number,
    mortalidadAcum: number,
    seleccionAcum: number,
    pesoAnterior: number
  ): IndicadorSemanal {
    // Calcular totales de la semana
    const mortalidadTotal = registros.reduce((sum, r) => sum + (r.mortalidadHembras || 0) + (r.mortalidadMachos || 0), 0);
    const seleccionTotal = registros.reduce((sum, r) => sum + (r.selH || 0) + (r.selM || 0), 0);
    const consumoTotal = registros.reduce((sum, r) => sum + (r.consumoKgHembras || 0) + (r.consumoKgMachos || 0), 0);
    
    // Aves al final de la semana
    const avesFin = avesInicio - mortalidadTotal - seleccionTotal;
    
    // Peso promedio de la semana (usar el último registro de la semana)
    const ultimoRegistro = registros[registros.length - 1];
    const pesoPromedio = ((ultimoRegistro?.pesoPromH || 0) + (ultimoRegistro?.pesoPromM || 0)) / 2;
    
    // Consumo real en gramos (convertir de kg a gramos)
    const consumoReal = consumoTotal * 1000;
    
    // Consumo tabla (valor fijo por ahora, debería venir de la tabla genética)
    const consumoTabla = 157;
    
    // Conversión alimenticia
    const conversionAlimenticia = avesFin > 0 ? consumoReal / avesFin : 0;
    
    // Ganancia durante la semana
    const gananciaSemana = pesoPromedio - pesoAnterior;
    
    // Ganancia diaria acumulada
    const gananciaDiariaAcumulada = gananciaSemana / 7;
    
    // Porcentajes
    const mortalidadSem = avesInicio > 0 ? (mortalidadTotal / avesInicio) * 100 : 0;
    const seleccionSem = avesInicio > 0 ? (seleccionTotal / avesInicio) * 100 : 0;
    const mortalidadMasSeleccion = mortalidadSem + seleccionSem;
    
    // Eficiencia
    const eficiencia = conversionAlimenticia > 0 ? pesoPromedio / conversionAlimenticia / 10 : 0;
    
    // IP (Índice de Productividad)
    const ip = conversionAlimenticia > 0 ? ((pesoPromedio / conversionAlimenticia) / 10) / conversionAlimenticia : 0;
    
    // VPI (Variación de Peso Inicial)
    const vpi = pesoAnterior > 0 ? pesoPromedio / pesoAnterior : 0;
    
    // Saldo de aves semanal
    const saldoAvesSemanal = avesFin;
    
    // Acumulados
    const mortalidadAcumTotal = mortalidadAcum + mortalidadSem;
    const seleccionAcumTotal = seleccionAcum + seleccionSem;
    const mortalidadMasSeleccionAcumTotal = mortalidadAcumTotal + seleccionAcumTotal;
    
    // Piso térmico visible (lógica simplificada)
    const pisoTermicoVisible = semana <= 3;

    return {
      semana,
      fechaInicio: this.obtenerFechaInicioSemana(semana),
      fechaFin: this.obtenerFechaFinSemana(semana),
      avesInicioSemana: avesInicio,
      avesFinSemana: avesFin,
      consumoReal,
      consumoTabla,
      conversionAlimenticia,
      gananciaSemana,
      gananciaDiariaAcumulada,
      mortalidadSem,
      seleccionSem,
      mortalidadMasSeleccion,
      eficiencia,
      ip,
      vpi,
      saldoAvesSemanal,
      mortalidadAcum: mortalidadAcumTotal,
      seleccionAcum: seleccionAcumTotal,
      mortalidadMasSeleccionAcum: mortalidadMasSeleccionAcumTotal,
      pisoTermicoVisible,
      pesoInicial: pesoAnterior,
      pesoCierre: pesoPromedio,
      pesoAnterior
    };
  }

  // ================== HELPERS DE FECHA ==================
  private obtenerFechaInicioSemana(semana: number): string {
    if (!this.selectedLote?.fechaEncaset) return '';
    
    const fechaEncaset = new Date(this.selectedLote.fechaEncaset);
    const diasASumar = (semana - 1) * 7;
    const fechaInicio = new Date(fechaEncaset.getTime() + (diasASumar * 24 * 60 * 60 * 1000));
    
    return fechaInicio.toISOString().split('T')[0];
  }

  private obtenerFechaFinSemana(semana: number): string {
    if (!this.selectedLote?.fechaEncaset) return '';
    
    const fechaEncaset = new Date(this.selectedLote.fechaEncaset);
    const diasASumar = (semana * 7) - 1;
    const fechaFin = new Date(fechaEncaset.getTime() + (diasASumar * 24 * 60 * 60 * 1000));
    
    return fechaFin.toISOString().split('T')[0];
  }

  // ================== FORMATO ==================
  formatNumber = (value: number, decimals: number = 2): string => {
    return value.toFixed(decimals);
  };

  formatPercentage = (value: number, decimals: number = 2): string => {
    return `${value.toFixed(decimals)}%`;
  };

  formatDate = (date: string): string => {
    return new Date(date).toLocaleDateString('es-ES');
  };
}
