import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SidebarComponent } from '../../../../shared/components/sidebar/sidebar.component';
import { DbStudioService, SchemaDto, TableDto, QueryResultDto } from '../../data/db-studio.service';

@Component({
  selector: 'app-db-studio-main',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent],
  templateUrl: './db-studio-main.component.html',
  styleUrls: ['./db-studio-main.component.scss']
})
export class DbStudioMainComponent implements OnInit {
  private dbService = inject(DbStudioService);
  private router = inject(Router);

  // ====== Estado ======
  loading = signal<boolean>(false);
  error = signal<string | null>(null);
  
  // ====== Datos ======
  schemas = signal<SchemaDto[]>([]);
  tables = signal<TableDto[]>([]);
  
  // ====== Filtros ======
  selectedSchema = signal<string>('public');
  searchTerm = signal<string>('');
  
  // ====== Consola SQL ======
  sqlQuery = signal<string>('SELECT * FROM information_schema.tables LIMIT 10;');
  queryResult = signal<QueryResultDto | null>(null);
  queryLoading = signal<boolean>(false);
  
  // ====== Computed ======
  filteredTables = computed(() => {
    const tables = this.tables();
    const search = this.searchTerm().toLowerCase();
    
    if (!search) return tables;
    
    return tables.filter(table => 
      table.name.toLowerCase().includes(search) ||
      table.kind.toLowerCase().includes(search)
    );
  });

  // ====== Ciclo de vida ======
  ngOnInit(): void {
    this.loadSchemas();
    this.loadTables();
  }

  // ====== Carga de datos ======
  loadSchemas(): void {
    this.loading.set(true);
    this.error.set(null);
    
    this.dbService.getSchemas().subscribe({
      next: (schemas) => {
        this.schemas.set(schemas);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(this.getErrorMessage(err));
        this.loading.set(false);
      }
    });
  }

  loadTables(): void {
    this.loading.set(true);
    this.error.set(null);
    
    this.dbService.getTables(this.selectedSchema()).subscribe({
      next: (tables) => {
        this.tables.set(tables);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(this.getErrorMessage(err));
        this.loading.set(false);
      }
    });
  }

  // ====== Navegación ======
  selectSchema(schema: string): void {
    if (this.selectedSchema() === schema) return;
    
    this.selectedSchema.set(schema);
    this.loadTables();
  }

  openTable(schema: string, table: string): void {
    this.router.navigate(['/db-studio/explorer'], { 
      queryParams: { schema, table } 
    });
  }

  openQueryConsole(): void {
    this.router.navigate(['/db-studio/query-console']);
  }

  openCreateTable(): void {
    this.router.navigate(['/db-studio/create-table']);
  }

  // ====== Consola SQL ======
  executeQuery(): void {
    if (!this.sqlQuery().trim()) return;
    
    this.queryLoading.set(true);
    this.error.set(null);
    
    this.dbService.executeQuery({
      sql: this.sqlQuery(),
      params: {}
    }).subscribe({
      next: (result) => {
        this.queryResult.set(result);
        this.queryLoading.set(false);
      },
      error: (err) => {
        this.error.set(this.getErrorMessage(err));
        this.queryLoading.set(false);
      }
    });
  }

  clearQuery(): void {
    this.sqlQuery.set('');
    this.queryResult.set(null);
  }

  // ====== Utilidades ======
  private getErrorMessage(error: any): string {
    return error?.error?.message || 
           error?.error?.title || 
           error?.message || 
           'Error desconocido';
  }

  formatNumber(num: number): string {
    return num.toLocaleString('es-ES');
  }

  formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // ====== Acciones rápidas ======
  refreshData(): void {
    this.loadSchemas();
    this.loadTables();
  }

  exportSchema(schema: string): void {
    // TODO: Implementar exportación de esquema
    console.log('Exportar esquema:', schema);
  }

  analyzeDatabase(): void {
    // TODO: Implementar análisis de base de datos
    console.log('Analizar base de datos');
  }
}

