import { Component, OnInit, ViewChild } from '@angular/core';
import { HaruService } from '../../../services/haru.service';
import { ToastrService } from 'ngx-toastr';
import { ModalDirective } from 'ngx-bootstrap/modal';

@Component({
    selector: 'app-usuarios',
    templateUrl: './usuarios.component.html',
    styleUrls: ['./usuarios.component.css'],
    providers: [HaruService]
})
export class UsuariosComponent implements OnInit {

    @ViewChild('modalAdd',      { static: false }) modalAdd!: ModalDirective;
    @ViewChild('modalEdit',     { static: false }) modalEdit!: ModalDirective;
    @ViewChild('modalPermisos', { static: false }) modalPermisos!: ModalDirective;

    title = 'Gestión de Usuarios Internos';

    datos: any[]         = [];
    datosFiltrados: any[] = [];

    seleccionadas = new Set<number>();
    busqueda  = '';
    filtros: any = { name: '', surname: '', email: '' };
    sortCol   = '';
    sortDir: 'asc' | 'desc' = 'asc';
    pagina    = 1;
    porPagina = 50;

    formAdd: any = {
        name: '', surname: '', email: '', password: '',
        empresa: null, subempresa: null, ambito: 'I', isAdmin: false
    };

    formEdit: any = {
        idrow: null, name: '', surname: '', email: '', isAdmin: false
    };

    // Modal de Permisos
    usuarioPermisos: any        = null;
    permisosSeleccionados       = new Set<string>();

    // Lista de todos los módulos disponibles, agrupados
    readonly modulosDisponibles = [
        { grupo: 'Configuración', modulos: [
            { clave: 'config_clientes',         label: 'Clientes' },
            { clave: 'config_clientes_gestion',  label: 'Gestión de Clientes' },
            { clave: 'config_promociones',       label: 'Promociones' },
            { clave: 'config_campos',            label: 'Gestión de Campos' },
            { clave: 'config_articulos',         label: 'Artículos' },
            { clave: 'config_pedidos',           label: 'Pedidos' },
            { clave: 'config_presupuestos',      label: 'Presupuestos' },
        ]},
        { grupo: 'Tarifas', modulos: [
            { clave: 'tarifas_generador', label: 'Generador de Tarifas' },
            { clave: 'tarifas_clientes',  label: 'Tarifas de Clientes' },
            { clave: 'tarifas_leroy',     label: 'Tarifas Leroy Merlín' },
            { clave: 'tarifas_backup',    label: 'Backup' },
        ]},
        { grupo: 'Fabricación', modulos: [
            { clave: 'fab_config', label: 'Configuración' },
        ]},
        { grupo: 'Cortinadecor', modulos: [
            { clave: 'cdeco_tejidos',   label: 'Tejidos' },
            { clave: 'cdeco_atributos', label: 'Configuración Atributos' },
            { clave: 'cdeco_config',    label: 'Configuración' },
        ]},
    ];

    private updateParams: any = {
        table: 'USERS',
        column: 'idrow',
        id: 0,
        field: '',
        value: ''
    };

    constructor(private service: HaruService, private toaster: ToastrService) { }

    ngOnInit() {
        this.loadData();
    }

    loadData() {
        this.service.HTTP_Get('/sm/users').subscribe(
            data => {
                this.datos = data.Table || [];
                this.seleccionadas.clear();
                this.pagina = 1;
                this.aplicarFiltros();
            },
            () => { this.toaster.error('Error al cargar los usuarios', this.title); }
        );
    }

    // ── FILTROS / ORDENACIÓN ────────────────────────────────────────────────

    onBusqueda() { this.pagina = 1; this.aplicarFiltros(); }
    onFiltroColumna() { this.pagina = 1; this.aplicarFiltros(); }

    limpiarFiltros() {
        this.busqueda = '';
        Object.keys(this.filtros).forEach(k => this.filtros[k] = '');
        this.pagina = 1;
        this.aplicarFiltros();
    }

    private aplicarFiltros() {
        let result = this.datos;

        if (this.busqueda.trim()) {
            const q = this.busqueda.trim().toLowerCase();
            result = result.filter(r =>
                (r.name    && r.name.toLowerCase().includes(q))    ||
                (r.surname && r.surname.toLowerCase().includes(q)) ||
                (r.email   && r.email.toLowerCase().includes(q))
            );
        }

        Object.keys(this.filtros).forEach(key => {
            const val = (this.filtros[key] || '').trim().toLowerCase();
            if (val) {
                result = result.filter(r =>
                    r[key] != null && r[key].toString().toLowerCase().includes(val)
                );
            }
        });

        if (this.sortCol) {
            const dir = this.sortDir === 'asc' ? 1 : -1;
            result = result.slice().sort((a, b) => {
                const va = a[this.sortCol] || '';
                const vb = b[this.sortCol] || '';
                return va < vb ? -dir : va > vb ? dir : 0;
            });
        }

        this.datosFiltrados = result;
    }

    ordenar(col: string) {
        if (this.sortCol === col) {
            this.sortDir = this.sortDir === 'asc' ? 'desc' : 'asc';
        } else {
            this.sortCol = col;
            this.sortDir = 'asc';
        }
        this.aplicarFiltros();
    }

    // ── PAGINACIÓN ──────────────────────────────────────────────────────────

    get totalPaginas(): number {
        return Math.ceil(this.datosFiltrados.length / this.porPagina);
    }

    get datosPagina(): any[] {
        const inicio = (this.pagina - 1) * this.porPagina;
        return this.datosFiltrados.slice(inicio, inicio + this.porPagina);
    }

    get paginas(): number[] {
        const total   = this.totalPaginas;
        const current = this.pagina;
        const pages: number[] = [];
        const start = Math.max(1, current - 2);
        const end   = Math.min(total, current + 2);
        for (let i = start; i <= end; i++) { pages.push(i); }
        return pages;
    }

    irPagina(p: number) {
        if (p >= 1 && p <= this.totalPaginas) { this.pagina = p; }
    }

    // ── SELECCIÓN MÚLTIPLE ──────────────────────────────────────────────────

    toggleFila(fila: any) {
        if (this.seleccionadas.has(fila.idrow)) {
            this.seleccionadas.delete(fila.idrow);
        } else {
            this.seleccionadas.add(fila.idrow);
        }
    }

    estaSeleccionada(fila: any): boolean {
        return this.seleccionadas.has(fila.idrow);
    }

    get todasSeleccionadas(): boolean {
        return this.datosPagina.length > 0 &&
            this.datosPagina.every(f => this.seleccionadas.has(f.idrow));
    }

    toggleTodas() {
        if (this.todasSeleccionadas) {
            this.datosPagina.forEach(f => this.seleccionadas.delete(f.idrow));
        } else {
            this.datosPagina.forEach(f => this.seleccionadas.add(f.idrow));
        }
    }

    get filaUnica(): any {
        if (this.seleccionadas.size !== 1) { return null; }
        const id = Array.from(this.seleccionadas)[0];
        return this.datos.find(f => f.idrow === id) || null;
    }

    // ── CRUD — AÑADIR USUARIO INTERNO ───────────────────────────────────────

    openAdd() {
        this.formAdd = {
            name: '', surname: '', email: '', password: '',
            empresa: null, subempresa: null, ambito: 'I', isAdmin: false
        };
        this.modalAdd.show();
    }

    guardarAdd() {
        if (!this.formAdd.name.trim()) {
            this.toaster.warning('El nombre es obligatorio', this.title);
            return;
        }
        if (!this.formAdd.email.trim()) {
            this.toaster.warning('El email es obligatorio', this.title);
            return;
        }
        // Garantizar que siempre se crea como usuario interno
        this.formAdd.ambito = 'I';
        this.service.HTTP_Post('/sm/register', JSON.stringify(this.formAdd)).subscribe(
            () => {
                this.toaster.success('Usuario interno agregado correctamente', this.title);
                this.modalAdd.hide();
                this.loadData();
            },
            () => { this.toaster.error('Error al agregar el usuario', this.title); }
        );
    }

    // ── CRUD — EDITAR ────────────────────────────────────────────────────────

    openEdit() {
        if (!this.filaUnica) {
            this.toaster.warning('Selecciona exactamente un usuario para editar', this.title);
            return;
        }
        const d = this.filaUnica;
        this.formEdit = {
            idrow:   d.idrow,
            name:    d.name    || '',
            surname: d.surname || '',
            email:   d.email   || '',
            isAdmin: d.isAdmin === true || d.isAdmin === 1
        };
        this.modalEdit.show();
    }

    guardarEdit() {
        const d = this.filaUnica;
        const fields = ['name', 'surname', 'email'];
        let updates: { field: string; value: any }[] = fields.map(f => ({ field: f, value: this.formEdit[f] }));

        const adminVal = this.formEdit.isAdmin ? 1 : 0;
        const prevAdmin = (d && (d.isAdmin === true || d.isAdmin === 1)) ? 1 : 0;
        if (adminVal !== prevAdmin) {
            updates.push({ field: 'isAdmin', value: adminVal });
        }

        let completed = 0;
        let hasError  = false;

        updates.forEach(u => {
            const payload = JSON.stringify({
                ...this.updateParams,
                id:    this.formEdit.idrow,
                field: u.field,
                value: u.value
            });
            this.service.HTTP_Post('/sm/update_table', payload).subscribe(
                () => {
                    completed++;
                    if (completed === updates.length && !hasError) {
                        this.toaster.success('Usuario actualizado', this.title);
                        this.modalEdit.hide();
                        this.loadData();
                    }
                },
                () => {
                    if (!hasError) {
                        hasError = true;
                        this.toaster.error('Error al actualizar el usuario', this.title);
                    }
                }
            );
        });
    }

    // ── CRUD — ELIMINAR ─────────────────────────────────────────────────────

    eliminar() {
        if (this.seleccionadas.size === 0) {
            this.toaster.warning('Selecciona al menos un usuario para eliminar', this.title);
            return;
        }
        const n = this.seleccionadas.size;
        if (!confirm('¿Eliminar ' + (n === 1 ? 'el usuario seleccionado' : 'los ' + n + ' usuarios seleccionados') + '?')) { return; }

        const ids = '[' + Array.from(this.seleccionadas).join(',') + ']';
        this.service.HTTP_Post('/sm/user_del', JSON.stringify({ ids })).subscribe(
            () => {
                this.toaster.success(n + ' usuario(s) eliminado(s)', this.title);
                this.loadData();
            },
            () => { this.toaster.error('Error al eliminar usuarios', this.title); }
        );
    }

    // ── ACTIVAR / DESACTIVAR ────────────────────────────────────────────────

    toggleActivo(fila: any) {
        const newValue = fila.ACTIVO ? 0 : 1;
        const payload = JSON.stringify({
            ...this.updateParams,
            id: fila.idrow,
            field: 'ACTIVO',
            value: newValue
        });
        this.service.HTTP_Post('/sm/update_table', payload).subscribe(
            () => {
                fila.ACTIVO = newValue;
                this.toaster.success(newValue ? 'Usuario activado' : 'Usuario desactivado', this.title);
            },
            () => { this.toaster.error('Error al actualizar el estado del usuario', this.title); }
        );
    }

    // ── GESTIÓN DE PERMISOS ─────────────────────────────────────────────────

    openPermisos() {
        const fila = this.filaUnica;
        if (!fila) {
            this.toaster.warning('Selecciona un usuario para gestionar permisos', this.title);
            return;
        }

        this.usuarioPermisos = fila;
        this.permisosSeleccionados.clear();

        // Si es admin, mostrar modal sin cargar permisos (tiene todo)
        if (fila.isAdmin) {
            this.modalPermisos.show();
            return;
        }

        this.service.HTTP_Get('/sm/users/' + fila.idrow + '/permisos').subscribe(
            (data: any) => {
                const permisos: string[] = data.permisos || [];
                this.permisosSeleccionados = new Set<string>(permisos);
                this.modalPermisos.show();
            },
            () => { this.toaster.error('Error al cargar permisos del usuario', this.title); }
        );
    }

    tienePermiso(clave: string): boolean {
        return this.permisosSeleccionados.has(clave);
    }

    togglePermiso(clave: string) {
        if (this.permisosSeleccionados.has(clave)) {
            this.permisosSeleccionados.delete(clave);
        } else {
            this.permisosSeleccionados.add(clave);
        }
    }

    guardarPermisos() {
        if (!this.usuarioPermisos || this.usuarioPermisos.isAdmin) {
            this.modalPermisos.hide();
            return;
        }

        const payload = { permisos: Array.from(this.permisosSeleccionados) };
        this.service.HTTP_Post('/sm/users/' + this.usuarioPermisos.idrow + '/permisos', JSON.stringify(payload)).subscribe(
            () => {
                this.toaster.success('Permisos actualizados correctamente', this.title);
                this.modalPermisos.hide();
            },
            () => { this.toaster.error('Error al guardar los permisos', this.title); }
        );
    }
}
