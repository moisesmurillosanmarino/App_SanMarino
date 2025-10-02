// src/app/features/db-studio/pages/explorer/explorer.page.ts
import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DbStudioService, SchemaDto, TableDto, ColumnDto, QueryPageDto } from '../../data/db-studio.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-db-explorer',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './explorer.page.html',
  styleUrls: ['./explorer.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExplorerPage implements OnInit {
  private api = inject(DbStudioService);
  private router = inject(Router);

  loading = signal(false);
  error = signal<string | null>(null);

  schemas = signal<SchemaDto[]>([]);
  selectedSchema = signal<string>('public');

  tables = signal<TableDto[]>([]);
  selectedTable = signal<string | null>(null);

  columns = signal<ColumnDto[]>([]);
  previewPage = signal<QueryPageDto | null>(null);

  // paginación
  limit = signal(20);
  offset = signal(0);

  ngOnInit(): void {
    this.loadSchemas();
    this.loadTables();
  }

  loadSchemas() {
    this.loading.set(true);
    this.api.getSchemas().subscribe({
      next: s => { this.schemas.set(s); this.loading.set(false); },
      error: err => { this.error.set(this.msg(err)); this.loading.set(false); }
    });
  }

  loadTables() {
    this.loading.set(true);
    this.api.getTables(this.selectedSchema()).subscribe({
      next: t => { this.tables.set(t); this.loading.set(false); },
      error: err => { this.error.set(this.msg(err)); this.loading.set(false); }
    });
  }

  selectSchema(sc: string) {
    if (this.selectedSchema() === sc) return;
    this.selectedSchema.set(sc);
    this.selectedTable.set(null);
    this.columns.set([]);
    this.previewPage.set(null);
    this.offset.set(0);
    this.loadTables();
  }

  selectTable(tb: string) {
    this.selectedTable.set(tb);
    this.loadColumns();
    this.loadPreview();
  }

  loadColumns() {
    const sc = this.selectedSchema();
    const tb = this.selectedTable();
    if (!tb) return;
    this.loading.set(true);
    const schemaToSend = sc === 'public' ? undefined : sc;
    this.api.getColumns(tb, schemaToSend).subscribe({
      next: cols => { this.columns.set(cols); this.loading.set(false); },
      error: err => { this.error.set(this.msg(err)); this.loading.set(false); }
    });
  }

  loadPreview() {
    const sc = this.selectedSchema();
    const tb = this.selectedTable();
    if (!tb) return;
    this.loading.set(true);
    this.api.preview(tb, {
      schema: sc === 'public' ? undefined : sc,
      limit: this.limit(),
      offset: this.offset()
    }).subscribe({
      next: p => { this.previewPage.set(p); this.loading.set(false); },
      error: err => { this.error.set(this.msg(err)); this.loading.set(false); }
    });
  }

  pageNext() {
    this.offset.set(this.offset() + this.limit());
    this.loadPreview();
  }
  pagePrev() {
    this.offset.set(Math.max(0, this.offset() - this.limit()));
    this.loadPreview();
  }

  // 🔑 util para header/filas dinámicas sin pipes extra
  keys(row: Record<string, unknown> | undefined | null): string[] {
    return row ? Object.keys(row) : [];
  }

  // navegación a crear
  goCreateTable() {
    this.router.navigate(['./create-table']);
  }

  private msg(err: any): string {
    return err?.error?.message ?? err?.error?.title ?? err?.message ?? 'Error desconocido';
  }
}
