import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import {
  HoneycombArticulosService,
  TipoArticulo,
  TipoAtributo,
  ArticuloHoneycomb,
  ArticuloValor,
  FKOption,
  TablaFK
} from './honeycomb-admin-link.service';


@Component({
  selector: 'app-honeycomb-admin-link',
  templateUrl: './honeycomb-admin-link.component.html',
  styleUrls: ['./honeycomb-admin-link.component.scss']
})
export class HoneycombAdminLinkComponent implements OnInit {



  // ─── TABS ────────────────────────────────────────────────────────
  tabActivo: 'tipos' | 'articulos' | 'valores' = 'tipos';

  cargando = false;

  // ─── PESTAÑA 1: TIPOS DE ARTÍCULO ───────────────────────────────
  tiposArticulo: TipoArticulo[] = [];
  tipoSeleccionado: TipoArticulo | null = null;
  atributos: TipoAtributo[] = [];

  modalTipo = false;
  formTipo: Partial<TipoArticulo> = {};

  modalAtributo = false;
  formAtributo: Partial<TipoAtributo> = {};

  // ─── PESTAÑA 2: ARTÍCULOS ────────────────────────────────────────
  articulos: ArticuloHoneycomb[] = [];
  articulosFiltrados: ArticuloHoneycomb[] = [];
  filtroTexto = '';
  filtroTipo = 0;
  seleccionados: number[] = [];
  tipoMasivo = 0;

  // ─── PESTAÑA 3: VALORES ──────────────────────────────────────────
  articuloEditando: ArticuloHoneycomb | null = null;
  atributosDelTipo: TipoAtributo[] = [];
  valoresForm: { [idAtributo: number]: any } = {};
  fkOptions: { [idAtributo: number]: FKOption[] } = {};
  guardandoValores = false;

  // ─── OPCIONES FIJAS ──────────────────────────────────────────────
  tiposDato = ['TEXT', 'INT', 'DECIMAL', 'FK'];

  tablasFK: TablaFK[] = [];
  modalTablaFK = false;
  formTablaFK: Partial<TablaFK> = {};

  constructor(
    private service: HoneycombArticulosService,
    private toastr: ToastrService
  ) { }

  ngOnInit() {
    this.cargarTipos();
    this.cargarTablasFK();
    this.cargarArticulos();
  }

  // ════════════════════════════════════════════════════════════════
  // PESTAÑA 1 – TIPOS DE ARTÍCULO Y ATRIBUTOS
  // ════════════════════════════════════════════════════════════════

  cargarTipos() {
    this.service.getTiposArticulo().subscribe(
      data => this.tiposArticulo = data,
      () => this.toastr.error('Error al cargar tipos de artículo')
    );
  }

  seleccionarTipo(tipo: TipoArticulo) {
    this.tipoSeleccionado = tipo;
    this.cargarAtributos(tipo.Id);
  }

  cargarAtributos(idTipo: number) {
    this.service.getAtributosByTipo(idTipo).subscribe(
      data => this.atributos = data,
      () => this.toastr.error('Error al cargar atributos')
    );
  }

  abrirModalTipo(tipo?: TipoArticulo) {
    this.formTipo = tipo ? { ...tipo } : { Activo: true };
    this.modalTipo = true;
  }

  guardarTipo() {
    if (!this.formTipo.Nombre) {
      this.toastr.warning('El nombre es obligatorio');
      return;
    }
    this.service.saveTipoArticulo(this.formTipo).subscribe(
      () => {
        this.toastr.success('Tipo guardado');
        this.modalTipo = false;
        this.cargarTipos();
      },
      () => this.toastr.error('Error al guardar tipo')
    );
  }

  eliminarTipo(tipo: TipoArticulo) {
    if (!confirm(`¿Eliminar el tipo "${tipo.Nombre}"?`)) return;
    this.service.deleteTipoArticulo(tipo.Id).subscribe(
      () => {
        this.toastr.success('Tipo eliminado');
        if (this.tipoSeleccionado && this.tipoSeleccionado.Id === tipo.Id) {
          this.tipoSeleccionado = null;
          this.atributos = [];
        }
        this.cargarTipos();
      },
      () => this.toastr.error('Error al eliminar tipo')
    );
  }

  abrirModalAtributo(atributo?: TipoAtributo) {
    if (!this.tipoSeleccionado) return;
    this.formAtributo = atributo
      ? { ...atributo }
      : { IdTipoArticulo: this.tipoSeleccionado.Id, TipoDato: 'TEXT', Obligatorio: false, Orden: this.atributos.length + 1, Activo: true };
    this.modalAtributo = true;
  }

  guardarAtributo() {
    if (!this.formAtributo.Nombre) {
      this.toastr.warning('El nombre es obligatorio');
      return;
    }
    if (this.formAtributo.TipoDato === 'FK' && !this.formAtributo.TablaFK) {
      this.toastr.warning('Debes indicar la tabla FK');
      return;
    }
    this.service.saveTipoAtributo(this.formAtributo).subscribe(
      () => {
        this.toastr.success('Atributo guardado');
        this.modalAtributo = false;
        this.cargarAtributos(this.tipoSeleccionado.Id);
      },
      () => this.toastr.error('Error al guardar atributo')
    );
  }

  eliminarAtributo(atributo: TipoAtributo) {
    if (!confirm(`¿Eliminar el atributo "${atributo.Nombre}"?`)) return;
    this.service.deleteTipoAtributo(atributo.Id).subscribe(
      () => {
        this.toastr.success('Atributo eliminado');
        this.cargarAtributos(this.tipoSeleccionado.Id);
      },
      () => this.toastr.error('Error al eliminar atributo')
    );
  }

  // ════════════════════════════════════════════════════════════════
  // PESTAÑA 2 – ARTÍCULOS ERP
  // ════════════════════════════════════════════════════════════════

  cargarArticulos() {
    this.service.getArticulos().subscribe(
      data => {
        this.articulos = data;
        this.filtrarArticulos();
      },
      () => this.toastr.error('Error al cargar artículos')
    );
  }

  filtrarArticulos() {
    let resultado = [...this.articulos];
    if (this.filtroTexto) {
      const txt = this.filtroTexto.toLowerCase();
      resultado = resultado.filter(a =>
        a.Descripcion.toLowerCase().includes(txt) ||
        a.CodSol.toLowerCase().includes(txt)
      );
    }
    if (this.filtroTipo && +this.filtroTipo > 0) {
      resultado = resultado.filter(a => +a.IdTipoArticulo === +this.filtroTipo);
    }
    this.articulosFiltrados = resultado;
  }

  toggleSeleccion(id: number) {
    const idx = this.seleccionados.indexOf(id);
    idx === -1 ? this.seleccionados.push(id) : this.seleccionados.splice(idx, 1);
  }

  toggleTodos(event: any) {
    this.seleccionados = event.target.checked
      ? this.articulosFiltrados.map(a => a.IdArticuloERP)
      : [];
  }

  estaSeleccionado(id: number): boolean {
    return this.seleccionados.includes(id);
  }

  asignarTipoMasivo() {
    if (!this.tipoMasivo || this.seleccionados.length === 0) {
      this.toastr.warning('Selecciona artículos y un tipo');
      return;
    }
    this.service.asignarTipoMasivo(this.seleccionados, this.tipoMasivo).subscribe(
      () => {
        this.toastr.success(`Tipo asignado a ${this.seleccionados.length} artículos`);
        this.seleccionados = [];
        this.tipoMasivo = 0;
        this.cargarArticulos();
      },
      () => this.toastr.error('Error al asignar tipo masivo')
    );
  }

  cambiarTipoArticulo(articulo: ArticuloHoneycomb, idTipo: number) {
    this.service.asignarTipoArticulo(articulo.IdArticuloERP, idTipo).subscribe(
      () => {
        articulo.IdTipoArticulo = idTipo;
        const tipo = this.tiposArticulo.find(t => t.Id === idTipo);
        articulo.NombreTipoArticulo = tipo ? tipo.Nombre : '';
        this.toastr.success('Tipo actualizado');
      },
      () => this.toastr.error('Error al actualizar tipo')
    );
  }

  abrirValores(articulo: ArticuloHoneycomb) {
    this.articuloEditando = articulo;
    this.valoresForm = {};
    this.fkOptions = {};
    this.atributosDelTipo = [];
    this.tabActivo = 'valores';

    if (!articulo.IdTipoArticulo) {
      this.toastr.warning('El artículo no tiene tipo asignado');
      return;
    }

    // Cargar atributos del tipo
    this.service.getAtributosByTipo(articulo.IdTipoArticulo).subscribe(
      atributos => {
        this.atributosDelTipo = atributos;

        // Cargar valores actuales
        this.service.getValoresArticulo(articulo.IdArticuloERP).subscribe(
          valores => {
            valores.forEach(v => {
              if (v.TipoDato === 'FK') {
                this.valoresForm[v.IdTipoAtributo] = v.ValorFK;
              } else if (v.TipoDato === 'INT') {
                this.valoresForm[v.IdTipoAtributo] = v.ValorInt;
              } else if (v.TipoDato === 'DECIMAL') {
                this.valoresForm[v.IdTipoAtributo] = v.ValorDecimal;
              } else {
                this.valoresForm[v.IdTipoAtributo] = v.ValorTexto;
              }
            });
          }
        );

        // Cargar opciones FK para cada atributo que lo necesite
        atributos.filter(a => a.TipoDato === 'FK').forEach(a => {
          this.service.getFKOptions(a.TablaFK, a.ColumnaFKId, a.ColumnaFKDesc).subscribe(
            opts => this.fkOptions[a.Id] = opts,
            () => this.fkOptions[a.Id] = []
          );
        });
      },
      () => this.toastr.error('Error al cargar atributos del tipo')
    );
  }

  // ════════════════════════════════════════════════════════════════
  // PESTAÑA 3 – VALORES DE ATRIBUTOS
  // ════════════════════════════════════════════════════════════════

  guardarValores() {
    if (!this.articuloEditando) return;

    const valores = this.atributosDelTipo.map(a => ({
      IdTipoAtributo: a.Id,
      TipoDato: a.TipoDato,
      ValorTexto: a.TipoDato === 'TEXT' ? this.valoresForm[a.Id] || null : null,
      ValorInt: a.TipoDato === 'INT' ? this.valoresForm[a.Id] || null : null,
      ValorDecimal: a.TipoDato === 'DECIMAL' ? this.valoresForm[a.Id] || null : null,
      ValorFK: a.TipoDato === 'FK' ? this.valoresForm[a.Id] || null : null
    }));

    // Validar obligatorios
    const faltantes = this.atributosDelTipo.filter(a =>
      a.Obligatorio && (this.valoresForm[a.Id] === undefined || this.valoresForm[a.Id] === null || this.valoresForm[a.Id] === '')
    );
    if (faltantes.length > 0) {
      this.toastr.warning(`Faltan campos obligatorios: ${faltantes.map(f => f.Nombre).join(', ')}`);
      return;
    }

    this.guardandoValores = true;
    this.service.saveValoresArticulo(this.articuloEditando.IdArticuloERP, valores).subscribe(
      () => {
        this.toastr.success('Valores guardados');
        this.guardandoValores = false;
      },
      () => {
        this.toastr.error('Error al guardar valores');
        this.guardandoValores = false;
      }
    );
  }

  volverAArticulos() {
    this.tabActivo = 'articulos';
    this.articuloEditando = null;
    this.atributosDelTipo = [];
    this.valoresForm = {};
  }

  setTab(tab: 'tipos' | 'articulos' | 'valores') {
    this.tabActivo = tab;
    if (tab === 'articulos' && !this.articulos.length) {
      this.cargarArticulos();
    }
  }

  // Métodos nuevos:
  cargarTablasFK() {
    this.service.getTablasFK().subscribe(
      data => this.tablasFK = data,
      () => this.toastr.error('Error al cargar catálogo de tablas FK')
    );
  }

  abrirModalTablaFK(tabla?: TablaFK) {
    this.formTablaFK = tabla ? { ...tabla } : { Activo: true };
    this.modalTablaFK = true;
  }

  guardarTablaFK() {
    if (!this.formTablaFK.Nombre || !this.formTablaFK.Tabla) {
      this.toastr.warning('Nombre y tabla son obligatorios');
      return;
    }
    this.service.saveTablaFK(this.formTablaFK).subscribe(
      () => {
        this.toastr.success('Tabla FK guardada');
        this.modalTablaFK = false;
        this.cargarTablasFK();
      },
      () => this.toastr.error('Error al guardar tabla FK')
    );
  }

  eliminarTablaFK(tabla: TablaFK) {
    if (!confirm(`¿Eliminar "${tabla.Nombre}" del catálogo?`)) return;
    this.service.deleteTablaFK(tabla.Id).subscribe(
      () => { this.toastr.success('Eliminada'); this.cargarTablasFK(); },
      () => this.toastr.error('Error al eliminar')
    );
  }

  // Cuando el usuario selecciona una tabla FK en el modal de atributo:
  onTablaFKSeleccionada(idTablaFK: number) {
    const tabla = this.tablasFK.find(t => t.Id === +idTablaFK);
    if (tabla) {
      this.formAtributo.TablaFK = tabla.Tabla;
      this.formAtributo.ColumnaFKId = tabla.ColumnaId;
      this.formAtributo.ColumnaFKDesc = tabla.ColumnaDesc;
    }
  }

}
