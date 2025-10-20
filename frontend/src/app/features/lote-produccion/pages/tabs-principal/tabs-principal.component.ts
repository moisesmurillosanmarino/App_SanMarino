import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SeguimientoItemDto } from '../../services/produccion.service';
import { LoteVM } from '../../services/ui.contracts';
import { TablaListaIndicadoresComponent } from '../tabla-lista-indicadores/tabla-lista-indicadores.component';
import { GraficasPrincipalComponent } from '../graficas-principal/graficas-principal.component';

@Component({
  selector: 'app-tabs-principal',
  standalone: true,
  imports: [CommonModule, TablaListaIndicadoresComponent, GraficasPrincipalComponent],
  templateUrl: './tabs-principal.component.html',
  styleUrls: ['./tabs-principal.component.scss']
})
export class TabsPrincipalComponent implements OnInit, OnChanges {
  @Input() seguimientos: SeguimientoItemDto[] = [];
  @Input() selectedLote: LoteVM | null = null;
  @Input() loading: boolean = false;

  @Output() create = new EventEmitter<void>();
  @Output() edit = new EventEmitter<SeguimientoItemDto>();
  @Output() delete = new EventEmitter<number>();

  activeTab: 'general' | 'indicadores' | 'grafica' = 'general';

  constructor() { }

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges): void {
  }

  // ================== EVENTOS ==================
  onTabChange(tab: 'general' | 'indicadores' | 'grafica'): void {
    this.activeTab = tab;
  }

  onCreate(): void {
    this.create.emit();
  }

  onEdit(seg: SeguimientoItemDto): void {
    this.edit.emit(seg);
  }

  onDelete(id: number): void {
    this.delete.emit(id);
  }

  // ================== CALCULO DE EDAD ==================
  calcularEdadDias(fechaRegistro: string | Date): number {
    if (!this.selectedLote?.fechaInicio) return 0;
    
    const fechaInicio = new Date(this.selectedLote.fechaInicio);
    const fechaReg = new Date(fechaRegistro);
    const diffTime = fechaReg.getTime() - fechaInicio.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return Math.max(1, diffDays);
  }

  // ================== CALCULOS ==================
  getTotalHuevos(): number {
    return this.seguimientos.reduce((total, seg) => total + (seg.huevosTotales || 0), 0);
  }
}



