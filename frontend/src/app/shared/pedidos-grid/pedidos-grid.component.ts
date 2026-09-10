import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
} from "@angular/core";
import { DatePipe } from "@angular/common";
import { PagerService } from "../pager-service.service";

export interface PedidosGridColumn {
  field: string;
  header: string;
  /** Cabecera de grupo (Pedido / Dirección Entrega / Dirección Fiscal ...) */
  group?: string;
  /** Ancho mínimo en px */
  width?: number;
  align?: "left" | "center" | "right";
  /** text (por defecto) | date | datetime | dias (badge) | flag (rojo/verde 0/>0) */
  type?: "text" | "date" | "datetime" | "dias" | "flag";
  /** override del formato de fecha */
  format?: string;
}

/**
 * Tabla HTML configurable que sustituye a jqxGrid en herstellen_v2.
 * Replica: grupos de columnas, fila de filtros, orden por columna,
 * paginación cliente (50/100/500), selección de una fila,
 * badge de "dias" y coloreado de celdas tipo flag.
 */
@Component({
  selector: "app-pedidos-grid",
  templateUrl: "./pedidos-grid.component.html",
  styleUrls: ["./pedidos-grid.component.css"],
  providers: [PagerService, DatePipe],
})
export class PedidosGridComponent implements OnChanges {
  @Input() columns: PedidosGridColumn[] = [];
  @Input() rows: any[] = [];
  @Input() idField = "idrow";
  @Input() loading = false;
  @Input() pageSizeOptions: number[] = [50, 100, 500];
  @Input() pageSize = 500;

  @Output() selectionChange = new EventEmitter<any | null>();

  filters: { [field: string]: string } = {};
  sortField = "";
  sortDir: 0 | 1 | -1 = 0;
  currentPage = 1;
  selectedId: any = null;

  constructor(
    private pagerService: PagerService,
    private datePipe: DatePipe
  ) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes["rows"]) {
      const rows = this.rows || [];
      if (
        this.selectedId != null &&
        !rows.some((r) => r[this.idField] === this.selectedId)
      ) {
        this.selectedId = null;
      }
      this.currentPage = 1;
    }
  }

  /* ---------- cabeceras de grupo ---------- */

  get hasGroups(): boolean {
    return (this.columns || []).some((c) => !!c.group);
  }

  get groupHeaders(): Array<{ name: string; span: number }> {
    const out: Array<{ name: string; span: number }> = [];
    for (const col of this.columns || []) {
      const name = col.group || "";
      const last = out[out.length - 1];
      if (last && last.name === name) {
        last.span++;
      } else {
        out.push({ name: name, span: 1 });
      }
    }
    return out;
  }

  /* ---------- filtrado + orden ---------- */

  get processedRows(): any[] {
    let rows = this.rows || [];

    const activeFilters = Object.keys(this.filters).filter(
      (k) => (this.filters[k] || "").toString().trim() !== ""
    );

    if (activeFilters.length) {
      rows = rows.filter((row) =>
        activeFilters.every((k) => {
          const cell = row[k];
          return (
            cell != null &&
            cell
              .toString()
              .toLowerCase()
              .indexOf(this.filters[k].toString().toLowerCase()) !== -1
          );
        })
      );
    }

    if (this.sortField && this.sortDir !== 0) {
      const f = this.sortField;
      const dir = this.sortDir;
      rows = rows
        .slice()
        .sort((a, b) => dir * this.compare(a[f], b[f]));
    }

    return rows;
  }

  private compare(a: any, b: any): number {
    if (a == null && b == null) return 0;
    if (a == null) return -1;
    if (b == null) return 1;

    const sa = a.toString().trim();
    const sb = b.toString().trim();

    const numeric = /^-?\d*\.?\d+$/;
    if (numeric.test(sa) && numeric.test(sb)) {
      return parseFloat(sa) - parseFloat(sb);
    }

    if (
      typeof a === "string" &&
      typeof b === "string" &&
      sa.indexOf("-") > 0 &&
      !isNaN(Date.parse(sa)) &&
      !isNaN(Date.parse(sb))
    ) {
      return Date.parse(sa) - Date.parse(sb);
    }

    return sa.localeCompare(sb);
  }

  /* ---------- paginación ---------- */

  get pager(): any {
    const total = this.processedRows.length;
    const totalPages = Math.max(1, Math.ceil(total / this.pageSize));
    let page = this.currentPage;
    if (page > totalPages) page = totalPages;
    if (page < 1) page = 1;
    return this.pagerService.getPager(total, page, this.pageSize);
  }

  get pagedRows(): any[] {
    const p = this.pager;
    return this.processedRows.slice(p.startIndex, p.endIndex + 1);
  }

  setPage(page: number) {
    const totalPages = this.pager.totalPages;
    if (page < 1 || page > totalPages) return;
    this.currentPage = page;
  }

  changePageSize(value: any) {
    this.pageSize = +value || 50;
    this.currentPage = 1;
  }

  onFilterChange() {
    this.currentPage = 1;
  }

  clearFilters() {
    this.filters = {};
    this.currentPage = 1;
  }

  /* ---------- orden ---------- */

  setSort(col: PedidosGridColumn) {
    if (this.sortField !== col.field) {
      this.sortField = col.field;
      this.sortDir = 1;
    } else if (this.sortDir === 1) {
      this.sortDir = -1;
    } else {
      this.sortField = "";
      this.sortDir = 0;
    }
    this.currentPage = 1;
  }

  /* ---------- selección ---------- */

  selectRow(row: any) {
    const id = row[this.idField];
    if (this.selectedId === id) {
      this.selectedId = null;
      this.selectionChange.emit(null);
    } else {
      this.selectedId = id;
      this.selectionChange.emit(row);
    }
  }

  clearSelection() {
    this.selectedId = null;
  }

  /* ---------- render de celdas ---------- */

  display(col: PedidosGridColumn, row: any): string {
    const v = row[col.field];
    if (col.type === "date" || col.type === "datetime") {
      if (v == null || v === "") return "";
      const s = v.toString();
      if (s.indexOf("1900-01-01") === 0 || s.indexOf("0001-01-01") === 0) {
        return "";
      }
      const d = new Date(v);
      if (isNaN(d.getTime())) return s;
      const fmt =
        col.format ||
        (col.type === "datetime" ? "dd/MM/yyyy HH:mm:ss" : "dd/MM/yyyy");
      return this.datePipe.transform(d, fmt) || "";
    }
    return v == null ? "" : v.toString();
  }

  cellClass(col: PedidosGridColumn, value: any): string {
    if (col.type === "flag") {
      if (value == 0) return "pg-flag-red";
      if (value > 0) return "pg-flag-green";
    }
    return "";
  }

  diasStyle(value: any): { [k: string]: string } {
    const n = Number(value);
    if (n < 3) return { background: "yellowgreen", color: "black" };
    if (n < 5) return { background: "yellow", color: "black" };
    return { background: "red", color: "white" };
  }

  sortIcon(col: PedidosGridColumn): string {
    if (this.sortField !== col.field || this.sortDir === 0) return "";
    return this.sortDir === 1 ? "▲" : "▼";
  }
}
