import { Component, OnInit, ViewChild } from '@angular/core';
import { HaruService } from '../../../services/haru.service';
import { ToastrService } from 'ngx-toastr';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { SearchArtikelComponent } from '../../../shared/search-artikel/search-artikel.component';

@Component({
  selector: 'app-cd-producto-v2',
  templateUrl: './cd-producto-v2.component.html',
  styleUrls: ['./cd-producto-v2.component.css'],
  providers: [HaruService]
})
export class CdProductoV2Component implements OnInit {

  @ViewChild('modalArticulos', { static: false }) modalArticulos!: ModalDirective;
  @ViewChild('modalAddTejido', { static: false }) modalAddTejido!: ModalDirective;
  @ViewChild('SearchArtikel', { static: false }) search!: SearchArtikelComponent;

  productos = [
    { id: 1, name: 'Enrollables' },
    { id: 2, name: 'Paneles Japoneses' },
    { id: 3, name: 'Paneles Verticales' },
    { id: 5, name: 'Enrollables Impresión' },
    { id: 7, name: 'Menorca sin Cordón' },
    { id: 0, name: 'No Asignado' }
  ];

  tejidos: any[] = [];
  colores: any[] = [];
  tejidosList: any[] = [];

  selectedTejido: any | null = null;
  editedTejido: any = {};
  selectedColor: any | null = null;

  filterTejidos = { nombre: '', producto: '', tejido: '' };
  filterColores = { color: '', articulos: '' };
  newColor = '';

  editingColorId = 0;
  editColorValue = '';

  tejidomodel = { nombre: '', producto: 1, tejido: -1 };

  constructor(private service: HaruService, private toaster: ToastrService) { }

  ngOnInit() {
    this.loadProductos();
    this.loadTejidosList();
  }

  // ─── Computed ────────────────────────────────────────────────────

  get filteredTejidos(): any[] {
    const fN = this.filterTejidos.nombre.toLowerCase();
    const fP = this.filterTejidos.producto.toLowerCase();
    const fT = this.filterTejidos.tejido.toLowerCase();
    return this.tejidos.filter(t =>
      (!fN || (t.name || '').toLowerCase().includes(fN)) &&
      (!fP || this.getProductoName(t._producto).toLowerCase().includes(fP)) &&
      (!fT || (t.descripcion || '').toLowerCase().includes(fT))
    );
  }

  get filteredColores(): any[] {
    const fC = this.filterColores.color.toLowerCase();
    const fA = this.filterColores.articulos.toLowerCase();
    return this.colores.filter(c =>
      (!fC || (c.color || '').toLowerCase().includes(fC)) &&
      (!fA || (c.articulos || '').toLowerCase().includes(fA))
    );
  }

  getProductoName(id: number): string {
    const p = this.productos.find(x => x.id === id);
    return p ? p.name : 'No Asignado';
  }

  getProductoBadgeClass(id: number): string {
    const map: { [k: number]: string } = {
      1: 'badge-primary',
      2: 'badge-success',
      3: 'badge-warning',
      5: 'badge-info',
      7: 'badge-secondary',
      0: 'badge-light'
    };
    return map[id] !== undefined ? map[id] : 'badge-light';
  }

  getArticulosCount(articulos: string): number {
    if (!articulos || !articulos.trim()) return 0;
    return articulos.split(',').filter(a => a.trim()).length;
  }

  // ─── API calls ───────────────────────────────────────────────────

  loadProductos() {
    this.service.HTTP_Get('/sm/cd_model_productos').subscribe(
      data => { this.tejidos = data.Table; },
      () => { this.toaster.error('Error al cargar los tejidos', 'Error'); }
    );
  }

  loadTejidosList() {
    this.service.HTTP_Get('/sm/tejidos_cliente/2').subscribe(
      data => {
        this.tejidosList = data.Table;
        this.tejidosList.push({ idrow: -1, descripcion: 'No Tiene Tejido' });
        if (this.tejidomodel.tejido === -1 && this.tejidosList.length > 0) {
          this.tejidomodel.tejido = this.tejidosList[0].idrow;
        }
      },
      () => { this.toaster.error('Error al cargar lista de tejidos', 'Error'); }
    );
  }

  loadColores(tejido: any) {
    this.service.HTTP_Get('/sm/cd_model_productos_colores/' + tejido.id).subscribe(
      data => {
        this.colores = data.Table;
      },
      () => { this.toaster.error('Error al cargar los colores', 'Error'); }
    );
  }

  private postUpdate(
    id: number,
    table: string,
    field: string,
    value: string,
    onSuccess?: () => void
  ) {
    const params = { id, table, column: 'id', field, value };
    this.service.HTTP_Post('/update_table', JSON.stringify(params)).subscribe(
      data => { if (data.message === 'OK' && onSuccess) { onSuccess(); } },
      () => { this.toaster.error('Error al guardar', 'Error'); }
    );
  }

  // ─── Tejido selection ─────────────────────────────────────────────

  selectTejido(item: any) {
    this.selectedTejido = item;
    this.editedTejido = { ...item };
    this.colores = [];
    this.newColor = '';
    this.cancelColorEdit();
    this.loadColores(item);
  }

  // ─── Tejido detail editing ────────────────────────────────────────

  saveNombre() {
    const value = (this.editedTejido.name || '').trim();
    if (!value) {
      this.toaster.warning('El nombre no puede estar vacío', 'Atención');
      this.editedTejido.name = this.selectedTejido.name;
      return;
    }
    if (value === this.selectedTejido.name) return;
    this.editedTejido.name = value;
    this.postUpdate(
      this.selectedTejido.id, 'SOL_CORTINADECOR_LINES_MODEL',
      'name', value,
      () => { this.loadProductos(); }
    );
  }

  saveProducto() {
    if (this.editedTejido._producto == this.selectedTejido._producto) return;
    this.postUpdate(
      this.selectedTejido.id, 'SOL_CORTINADECOR_LINES_MODEL',
      '_producto', this.editedTejido._producto.toString(),
      () => { this.loadProductos(); }
    );
  }

  saveTejidoRef() {
    if (this.editedTejido._tejido == this.selectedTejido._tejido) return;
    this.postUpdate(
      this.selectedTejido.id, 'SOL_CORTINADECOR_LINES_MODEL',
      '_tejido', this.editedTejido._tejido.toString(),
      () => { this.loadProductos(); }
    );
  }

  // ─── Color inline editing ─────────────────────────────────────────

  startEditColor(item: any, event: Event) {
    event.stopPropagation();
    this.editingColorId = item.id;
    this.editColorValue = item.color;
  }

  saveColorEdit(item: any) {
    if (!this.editingColorId) return;
    const value = this.editColorValue.trim();
    if (!value) {
      this.toaster.warning('El color no puede estar vacío', 'Atención');
      this.cancelColorEdit();
      return;
    }
    this.cancelColorEdit();

    this.postUpdate(
      item.id, 'SOL_CORTINADECOR_LINES_COLORES_MODEL',
      'color', value,
      () => {
        this.toaster.success('Color actualizado', 'Actualizar');
        this.loadColores(this.selectedTejido);
      }
    );
  }

  cancelColorEdit() {
    this.editingColorId = 0;
    this.editColorValue = '';
  }

  // ─── Add / Delete color ───────────────────────────────────────────

  addColor() {
    if (!this.newColor.trim()) {
      this.toaster.warning('Debe indicar el nombre del color', 'Atención');
      return;
    }
    const model = {
      id: 0,
      idrow: this.selectedTejido.id,
      color: this.newColor.trim(),
      op: 1
    };
    this.service.HTTP_Post('/sm/cd_model_productos_colores', JSON.stringify(model)).subscribe(
      data => {
        if (data.message === 'OK') {
          this.newColor = '';
          this.loadColores(this.selectedTejido);
        }
      },
      error => { this.toaster.error(error.message, 'Error'); }
    );
  }

  deleteColor(item: any) {
    if (!window.confirm('¿Desea borrar el color seleccionado?')) return;
    const model = { id: item.id, idrow: this.selectedTejido.id, color: item.color, op: 0 };
    this.service.HTTP_Post('/sm/cd_model_productos_colores', JSON.stringify(model)).subscribe(
      data => {
        if (data.message === 'OK') { this.loadColores(this.selectedTejido); }
      },
      error => { this.toaster.error(error.message, 'Error'); }
    );
  }

  // ─── Artículos modal ──────────────────────────────────────────────

  openArticulosModal(color: any) {
    this.selectedColor = color;
    this.modalArticulos.show();
  }

  assignArticulos() {
    const articles = this.search.getRows().join(',');
    this.postUpdate(
      this.selectedColor.id, 'SOL_CORTINADECOR_LINES_COLORES_MODEL',
      'articulos', articles,
      () => {
        this.modalArticulos.hide();
        this.search.clearSelection();
        this.loadColores(this.selectedTejido);
      }
    );
  }

  // ─── Add Tejido modal ─────────────────────────────────────────────

  openAddTejidoModal() {
    this.tejidomodel = {
      nombre: '',
      producto: 1,
      tejido: this.tejidosList.length > 0 ? this.tejidosList[0].idrow : -1
    };
    this.modalAddTejido.show();
  }

  addTejido() {
    if (!this.tejidomodel.nombre.trim()) {
      this.toaster.warning('Debe indicar el nombre del tejido', 'Atención');
      return;
    }
    const nombre = encodeURIComponent(this.tejidomodel.nombre.trim());
    const url = `/sm/cd_model_productos_create/${nombre}/${this.tejidomodel.producto}/${this.tejidomodel.tejido}`;
    this.service.HTTP_Get(url).subscribe(
      () => {
        this.modalAddTejido.hide();
        this.toaster.success('Tejido agregado correctamente');
        this.loadProductos();
      },
      error => { this.toaster.error(error.message, 'Error'); }
    );
  }

  // ─── Delete Tejido ────────────────────────────────────────────────

  deleteTejido() {
    if (!this.selectedTejido) {
      this.toaster.warning('Selecciona un tejido primero', 'Atención');
      return;
    }
    if (!window.confirm('¿Desea eliminar el tejido seleccionado?')) return;

    this.service.HTTP_Post(
      '/sm/cd_model_productos_delete',
      JSON.stringify({ ids: this.selectedTejido.id.toString() })
    ).subscribe(
      () => {
        this.toaster.success('Operación realizada');
        this.selectedTejido = null;
        this.editedTejido = {};
        this.colores = [];
        this.loadProductos();
      },
      error => { this.toaster.error(error.message, 'Error'); }
    );
  }
}
