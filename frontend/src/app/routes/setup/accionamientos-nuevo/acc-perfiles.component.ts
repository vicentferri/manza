import { Component, Input, OnInit } from '@angular/core';
import { HaruService } from '../../../services/haru.service';
import { ToastrService } from 'ngx-toastr';

/*
 * Perfiles de configurador (sqlPerfiles 01-09; backend controllers/sm/cfg_perfil.js, /api/sm/cfg/admin/*).
 * Un perfil es una plantilla de configurador: qué productos ve, con qué motor, con qué nombre, qué documentos
 * y qué parámetros. Cada cliente apunta a un perfil (sin perfil o con uno desactivado: ESTANDAR). Dentro del
 * perfil, cada usuario sigue limitando los productos con sus casillas (pantalla Clientes).
 * Los cambios se ven en el configurador al momento (cuando el usuario vuelve a entrar) y quedan en CFG_AUDITORIA.
 * seccion: pf_perfiles (perfiles y clientes) · pf_productos · pf_documentos · pf_parametros
 */

/* Parámetros conocidos, con su explicación (se pueden añadir otros a mano) */
export const PARAMETROS_CONOCIDOS = [
    { clave: 'logo', ayuda: 'Texto del logo de la cabecera (LM, SM...)', tipo: 'texto' },
    { clave: 'imagenes_tejido', ayuda: 'Fotos del color de tejido debajo del desplegable', tipo: 'si_no' },
    { clave: 'imagenes_contrapeso', ayuda: 'Foto del contrapeso en el enrollable', tipo: 'si_no' },
    { clave: 'ocultar_guias_zip_antiguo', ayuda: 'En el Cajón ZIP antiguo (dentro del enrollable) no se eligen guías', tipo: 'si_no' }
];

@Component({
    selector: 'app-acc-perfiles',
    templateUrl: './acc-perfiles.component.html',
    styleUrls: ['./accionamientos-nuevo.component.css']
})
export class AccPerfilesComponent implements OnInit {

    @Input() seccion = 'pf_perfiles';

    readonly title = 'Perfiles';
    readonly nombresProducto: { [tipo: number]: string } = {
        1: 'Enrollable', 2: 'Panel japonés', 3: 'Vertical', 4: 'Solar Mini', 6: 'Cajón ZIP', 7: 'HoneyComb'
    };
    readonly tiposProducto = [1, 2, 3, 4, 6, 7];
    readonly parametrosConocidos = PARAMETROS_CONOCIDOS;

    perfiles: any[] = [];
    clientes: any[] = [];
    perfilId: number = null;
    detalle: any = null;
    vista: any = null;
    guardando = false;

    /* Códigos de cliente (Fase 2, CFG_CLIENTE_CODIGO): por cliente, para cada tejido de un producto o cada opción de una lista */
    readonly productosTejido = [
        { id: 'ENR', label: 'Enrollable' }, { id: 'MINI', label: 'Solar Mini' }, { id: 'ZIP', label: 'Cajón ZIP' },
        { id: 'VER', label: 'Vertical' }, { id: 'PJ', label: 'Panel japonés' }
    ];
    readonly listasCodigo = [
        { id: 'accionamientos', label: 'Enrollable · Accionamientos' }, { id: 'sistemas', label: 'Enrollable · Sistemas' },
        { id: 'mandos', label: 'Enrollable · Mandos' }, { id: 'cargadores', label: 'Enrollable · Cargadores' },
        { id: 'baterias', label: 'Enrollable · Baterías' }, { id: 'modelos_motor', label: 'Enrollable · Modelos de motor' },
        { id: 'soportes', label: 'Enrollable · Soportes' }, { id: 'tapas', label: 'Enrollable · Tapas' },
        { id: 'contrapesos', label: 'Enrollable · Contrapesos' },
        { id: 'mini_junquillos', label: 'Solar Mini · Junquillos' }, { id: 'mini_colores_perfil', label: 'Solar Mini · Colores de perfilería' },
        { id: 'zip_modelos_cajon', label: 'Cajón ZIP · Modelos de cajón' }, { id: 'zip_guias', label: 'Cajón ZIP · Guías' },
        { id: 'zip_modelos_motor', label: 'Cajón ZIP · Modelos de motor' }, { id: 'zip_mandos', label: 'Cajón ZIP · Mandos' },
        { id: 'ver_accionamientos', label: 'Vertical · Accionamientos' }, { id: 'ver_soportes', label: 'Vertical · Soportes' },
        { id: 'pj_soportes', label: 'Panel japonés · Soportes' }, { id: 'pj_contrapesos', label: 'Panel japonés · Contrapesos' }
    ];
    codCliente: number = null;
    codAmbito: 'TEJIDO' | 'OPCION' = 'TEJIDO';
    codCatalogo = 'ENR';
    codFilas: any[] = [];
    codBuscar = '';
    codCargando = false;
    private codigosCliente: { [clave: string]: string } = {};

    /* formularios */
    formPerfil: any = null;          // alta o cambio de perfil
    formDuplicar: any = null;        // { codigo, nombre }
    formDocumento: any = null;       // alta o cambio de documento
    nuevoParametro = { clave: '', valor: '' };

    constructor(private service: HaruService, private toaster: ToastrService) { }

    ngOnInit() {
        this.cargarPerfiles();
        this.cargarClientes();
    }

    get perfil(): any {
        return this.perfiles.find(p => p.id === this.perfilId) || null;
    }

    nombrePerfil(id: number): string {
        const p = this.perfiles.find(x => x.id === id);
        return p ? p.codigo : '—';
    }

    private error(err: any, defecto: string) {
        const msg = err && err.error && err.error.message && err.error.message !== 'KO' ? err.error.message : defecto;
        this.toaster.error(msg, this.title);
    }

    /* ---------- perfiles y clientes ---------- */

    cargarPerfiles(elegir?: number) {
        this.service.HTTP_Get('/sm/cfg/admin/perfiles').subscribe(
            data => {
                this.perfiles = data || [];
                const id = elegir || this.perfilId || (this.perfiles[0] && this.perfiles[0].id);
                if (id) { this.elegirPerfil(id); }
            },
            err => this.error(err, 'Error al cargar los perfiles')
        );
    }

    cargarClientes() {
        this.service.HTTP_Get('/sm/cfg/admin/clientes').subscribe(
            data => { this.clientes = data || []; },
            err => this.error(err, 'Error al cargar los clientes')
        );
    }

    elegirPerfil(id: number) {
        this.perfilId = Number(id);
        this.formDocumento = null;
        this.cargarDetalle();
    }

    cargarDetalle() {
        const id = this.perfilId;
        if (!id) { return; }
        this.detalle = null;
        this.vista = null;
        this.service.HTTP_Get('/sm/cfg/admin/perfil/' + id).subscribe(
            data => {
                if (id !== this.perfilId) { return; }
                data.productos.forEach(p => { p.nombre = p.nombre_perfil || ''; p.visible = !!p.visible; });
                this.detalle = data;
            },
            err => this.error(err, 'Error al cargar el perfil')
        );
        this.service.HTTP_Get('/sm/cfg/admin/perfil/' + id + '/vista').subscribe(
            data => { if (id === this.perfilId) { this.vista = data; } },
            () => { }
        );
    }

    nuevoPerfil() {
        this.formDuplicar = null;
        this.formPerfil = { id: null, codigo: '', nombre: '', idioma: 'ES', politica_novedades: 'OCULTAR', activo: true };
    }

    editarPerfil(p: any) {
        this.formDuplicar = null;
        this.formPerfil = { id: p.id, codigo: p.codigo, nombre: p.nombre, idioma: p.idioma, politica_novedades: p.politica_novedades, activo: !!p.activo };
    }

    guardarPerfil() {
        const f = this.formPerfil;
        this.guardando = true;
        this.service.HTTP_Post('/sm/cfg/admin/perfil', JSON.stringify(f)).subscribe(
            data => {
                this.guardando = false;
                this.formPerfil = null;
                this.toaster.success(f.id ? 'Perfil guardado' : 'Perfil creado (con todos los productos ocultos)', this.title);
                this.cargarPerfiles(data.id);
                this.cargarClientes();
            },
            err => { this.guardando = false; this.error(err, 'No se pudo guardar el perfil'); }
        );
    }

    duplicar() {
        if (!this.perfil) { return; }
        this.formPerfil = null;
        this.formDuplicar = { codigo: this.perfil.codigo + '_COPIA', nombre: this.perfil.nombre + ' (copia)' };
    }

    guardarDuplicado() {
        this.guardando = true;
        this.service.HTTP_Post('/sm/cfg/admin/perfil/' + this.perfilId + '/duplicar', JSON.stringify(this.formDuplicar)).subscribe(
            data => {
                this.guardando = false;
                this.formDuplicar = null;
                this.toaster.success('Perfil duplicado', this.title);
                this.cargarPerfiles(data.id);
            },
            err => { this.guardando = false; this.error(err, 'No se pudo duplicar el perfil'); }
        );
    }

    cambiarPerfilCliente(c: any, perfilId: any) {
        const anterior = c.perfil_id;
        c.perfil_id = Number(perfilId);
        this.service.HTTP_Post('/sm/cfg/admin/cliente_perfil', JSON.stringify({ cliente: c.cliente, perfil_id: c.perfil_id })).subscribe(
            () => {
                this.toaster.success(c.descripcion + ' → ' + this.nombrePerfil(c.perfil_id), this.title);
                this.cargarPerfiles();
                this.cargarClientes();
            },
            err => { c.perfil_id = anterior; this.error(err, 'No se pudo cambiar el perfil del cliente'); }
        );
    }

    /* ---------- productos ---------- */

    guardarProducto(p: any) {
        if (p.tipo === 6 && p.visible && p.motor !== 'NUEVO') {
            this.toaster.warning('El Cajón ZIP propio solo existe con el configurador nuevo', this.title);
            return;
        }
        const body = { tipo: p.tipo, visible: !!p.visible, motor: p.motor, orden: p.orden, nombre: p.nombre };
        this.service.HTTP_Post('/sm/cfg/admin/perfil/' + this.perfilId + '/producto', JSON.stringify(body)).subscribe(
            () => { this.toaster.success(this.nombresProducto[p.tipo] + ' guardado', this.title); this.cargarDetalle(); },
            err => this.error(err, 'No se pudo guardar el producto')
        );
    }

    /* ---------- documentos ---------- */

    nuevoDocumento() {
        this.formDocumento = { id: null, tipo_producto: '', subtipo: '', etiqueta: '', url: 'assets/pdf/', icono: 'fa-solid fa-file-pdf', orden: 1, activo: true };
    }

    editarDocumento(d: any) {
        this.formDocumento = {
            id: d.id, tipo_producto: d.tipo_producto === null ? '' : d.tipo_producto, subtipo: d.subtipo === null ? '' : d.subtipo,
            etiqueta: d.etiqueta, url: d.url, icono: d.icono || '', orden: d.orden, activo: !!d.activo
        };
    }

    guardarDocumento() {
        this.service.HTTP_Post('/sm/cfg/admin/perfil/' + this.perfilId + '/documento', JSON.stringify(this.formDocumento)).subscribe(
            () => { this.toaster.success('Documento guardado', this.title); this.formDocumento = null; this.cargarDetalle(); },
            err => this.error(err, 'No se pudo guardar el documento')
        );
    }

    borrarDocumento(d: any) {
        if (!confirm('¿Quitar el documento "' + d.etiqueta + '" de este perfil?')) { return; }
        this.service.HTTP_Post('/sm/cfg/admin/perfil/' + this.perfilId + '/documento/' + d.id + '/borrar', '{}').subscribe(
            () => { this.toaster.success('Documento quitado', this.title); this.cargarDetalle(); },
            err => this.error(err, 'No se pudo quitar el documento')
        );
    }

    dondeDocumento(d: any): string {
        if (d.tipo_producto === null || d.tipo_producto === '') { return 'Barra superior'; }
        const nombre = this.nombresProducto[d.tipo_producto] || ('Producto ' + d.tipo_producto);
        return d.subtipo ? nombre + ' · subtipo ' + d.subtipo : nombre;
    }

    /* ---------- códigos de cliente ---------- */

    get codFilasFiltradas(): any[] {
        const b = this.codBuscar.trim().toLowerCase();
        return b ? this.codFilas.filter(f => [f.texto, f.codigo].some(v => v && String(v).toLowerCase().includes(b))) : this.codFilas;
    }

    cambiarAmbitoCodigo(ambito: 'TEJIDO' | 'OPCION') {
        this.codAmbito = ambito;
        this.codCatalogo = ambito === 'TEJIDO' ? 'ENR' : this.listasCodigo[0].id;
        this.cargarCodigos();
    }

    /* Filas del producto / lista con el código del cliente. Se listan con el perfil efectivo del cliente: las filas son
       las del catálogo y el perfil solo dice si las ve */
    cargarCodigos() {
        const cliente = this.clientes.find(c => c.cliente === Number(this.codCliente));
        this.codFilas = [];
        if (!cliente || !cliente.perfil_efectivo) { return; }
        this.codCargando = true;
        this.service.HTTP_Get('/sm/cfg/admin/cliente/' + cliente.cliente + '/codigos').subscribe(
            cods => {
                this.codigosCliente = {};
                (cods || []).forEach(c => { this.codigosCliente[c.ambito + '|' + c.catalogo + '|' + c.clave] = c.codigo; });
                const url = '/sm/cfg/admin/perfil/' + cliente.perfil_efectivo + (this.codAmbito === 'TEJIDO' ? '/tejidos/' : '/opciones/') + this.codCatalogo;
                this.service.HTTP_Get(url).subscribe(
                    data => {
                        this.codCargando = false;
                        this.codFilas = (data.filas || []).map(f => ({
                            clave: f.id,
                            texto: this.codAmbito === 'TEJIDO' ? f.nombre + ' · ' + f.color + ' (' + f.criterio + ')'
                                : (f.padre ? f.padre + ' · ' : '') + (f.nombre || f.valor || f.codigo),
                            visible: f.visible,
                            codigo: this.codigosCliente[this.codAmbito + '|' + this.codCatalogo + '|' + f.id] || ''
                        }));
                    },
                    err => { this.codCargando = false; this.error(err, 'Error al cargar la lista'); }
                );
            },
            err => { this.codCargando = false; this.error(err, 'Error al cargar los códigos del cliente'); }
        );
    }

    guardarCodigo(f: any, input: HTMLInputElement) {
        const codigo = String(input.value || '').trim();
        if (codigo === (f.codigo || '')) { return; }
        const body = { cambios: [{ ambito: this.codAmbito, catalogo: this.codCatalogo, clave: f.clave, codigo }] };
        this.service.HTTP_Post('/sm/cfg/admin/cliente/' + this.codCliente + '/codigos', JSON.stringify(body)).subscribe(
            () => { f.codigo = codigo; this.toaster.success(codigo ? 'Código guardado' : 'Código quitado', this.title); },
            err => { input.value = f.codigo || ''; this.error(err, 'No se pudo guardar el código'); }
        );
    }

    /* ---------- parámetros ---------- */

    valorParametro(clave: string): string {
        const p = this.detalle && this.detalle.parametros.find(x => x.clave === clave);
        return p ? p.valor : '';
    }

    get parametrosOtros(): any[] {
        const conocidos = this.parametrosConocidos.map(p => p.clave);
        return this.detalle ? this.detalle.parametros.filter(p => !conocidos.includes(p.clave)) : [];
    }

    guardarParametro(clave: string, valor: any) {
        const body = { clave, valor: valor === true ? '1' : valor === false ? '' : (valor || '') };
        this.service.HTTP_Post('/sm/cfg/admin/perfil/' + this.perfilId + '/parametro', JSON.stringify(body)).subscribe(
            () => { this.toaster.success('Parámetro guardado', this.title); this.cargarDetalle(); },
            err => this.error(err, 'No se pudo guardar el parámetro')
        );
    }

    anadirParametro() {
        if (!this.nuevoParametro.clave) { return; }
        this.guardarParametro(this.nuevoParametro.clave, this.nuevoParametro.valor);
        this.nuevoParametro = { clave: '', valor: '' };
    }
}
