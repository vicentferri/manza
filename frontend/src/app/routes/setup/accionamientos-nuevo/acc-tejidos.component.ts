import { Component, Input, OnInit } from '@angular/core';
import { HaruService } from '../../../services/haru.service';
import { ToastrService } from 'ngx-toastr';

/*
 * Tejidos disponibles en el configurador, por sistema (SOL_ACC_SISTEMA_TEJIDO, script 36): de los tejidos
 * activos del maestro (SOL_TEJIDOS_MAESTRO, una fila por tejido + color) se marcan los que ofrece el
 * sistema elegido arriba. Una sola lista por sistema para todos los clientes. "Copiar de otro sistema"
 * deja el sistema con exactamente los tejidos de otro.
 * Los tejidos van agrupados solo por nombre: aquí no se distingue el criterio (la casilla de VERA BLOCK
 * marca los colores de 200, de 250 y de cualquier otro ancho). La casilla del grupo y "Marcar / Quitar
 * lo filtrado" cambian varios de una vez.
 * Cada cambio se guarda al momento; si falla, las casillas vuelven a como estaban.
 * producto = 'mini' (Solar Mini, sqlSolarMini/01) o 'zip' (Cajón ZIP, sqlCajonZip/01): una sola lista sin
 * sistema (SOL_ACC_MINI_TEJIDO / SOL_ACC_ZIP_TEJIDO); "Copiar" la deja con los tejidos de un sistema del enrollable.
 */
@Component({
    selector: 'app-acc-tejidos',
    templateUrl: './acc-tejidos.component.html',
    styleUrls: ['./accionamientos-nuevo.component.css']
})
export class AccTejidosComponent implements OnInit {

    /* 'enrollable' (por sistema), 'mini' (Solar Mini) o 'zip' (Cajón ZIP): estos dos, una sola lista */
    @Input() producto = 'enrollable';

    private readonly NOMBRES = { mini: 'Solar Mini', zip: 'Cajón ZIP' };

    /* Sistemas del modelo nuevo (SOL_ACC_SISTEMA) y el elegido; origen de "Copiar de otro sistema" */
    sistemas: any[] = [];
    sistema: number = null;
    origenCopia: number = null;
    copiando = false;

    tejidos: any[] = [];
    tipos: string[] = [];
    buscar = '';
    filtroTipo = '';
    filtroEstado = '';
    cargado = false;
    estado: '' | 'guardando' | 'guardado' = '';
    private temporizador: any = null;

    /* Grupos visibles con sus tejidos filtrados. En campos y no en getters: un getter crearía objetos
       nuevos en cada ciclo y *ngFor recrearía las filas entre el clic y el change (ver Motores por sistema) */
    grupos: any[] = [];
    visibles: any[] = [];
    abiertos = new Set<string>();

    constructor(private service: HaruService, private toaster: ToastrService) { }

    ngOnInit() {
        /* En el Solar Mini los sistemas solo hacen falta como origen de "Copiar" */
        if (this.esMini) { this.cargar(); }
        this.service.HTTP_Get('/sm/acc/sistemas').subscribe(
            data => {
                this.sistemas = data.Table || [];
                if (this.esMini) { return; }
                const primero = this.sistemas.find(s => s.activo) || this.sistemas[0];
                if (primero) { this.cambiarSistema(primero.id); } else { this.cargado = true; }
            },
            () => this.toaster.error('Error al cargar los sistemas', 'Tejidos')
        );
    }

    /* Producto con una sola lista, sin sistema (Solar Mini o Cajón ZIP). El nombre se mantiene por la plantilla */
    get esMini(): boolean {
        return !!this.NOMBRES[this.producto];
    }

    /* Nombre del producto sin sistema: "Solar Mini", "Cajón ZIP" */
    get nombreProducto(): string {
        return this.NOMBRES[this.producto] || '';
    }

    /* Hay una lista que enseñar: la del producto sin sistema o la del sistema elegido */
    get conLista(): boolean {
        return this.esMini || !!this.sistema;
    }

    /* Nombre de la lista que se edita, para los mensajes */
    get nombreLista(): string {
        return this.esMini ? this.nombreProducto : (this.sistemaSel ? this.sistemaSel.nombre : '');
    }

    private get url(): string {
        return this.esMini ? '/sm/acc/' + this.producto + '/tejidos' : '/sm/acc/tejidos/' + this.sistema;
    }

    get sistemaSel(): any {
        return this.sistemas.find(s => s.id === this.sistema) || null;
    }

    get otrosSistemas(): any[] {
        return this.esMini ? this.sistemas : this.sistemas.filter(s => s.id !== this.sistema);
    }

    cambiarSistema(id: any) {
        this.sistema = id === null || id === '' ? null : Number(id);
        this.origenCopia = null;
        this.tejidos = [];
        this.cargado = false;
        if (this.sistema) { this.cargar(); }
    }

    /* El sistema elegido pasa a tener exactamente los tejidos del sistema origen */
    copiar() {
        const origen = this.sistemas.find(s => s.id === Number(this.origenCopia));
        if (!origen || !this.conLista) { return; }
        const nombre = this.nombreLista;
        if (!confirm('¿Dejar ' + nombre + ' con los mismos tejidos que ' + origen.nombre + '? Se quitan los que tenga ahora.')) { return; }
        this.copiando = true;
        this.service.HTTP_Post(this.url + '/copiar', JSON.stringify({ origen: origen.id })).subscribe(
            data => {
                this.copiando = false;
                this.origenCopia = null;
                this.toaster.success(nombre + ': ' + data.disponibles + ' tejidos disponibles, como ' + origen.nombre, 'Tejidos');
                this.cargar();
            },
            err => {
                this.copiando = false;
                const msg = err && err.error && err.error.message && err.error.message !== 'KO' ? err.error.message : 'No se pudo copiar';
                this.toaster.error(msg, 'Tejidos');
            }
        );
    }

    cargar() {
        const sistema = this.sistema;
        this.service.HTTP_Get(this.url).subscribe(
            data => {
                /* si se cambió de sistema mientras cargaba, esta respuesta ya no vale */
                if (sistema !== this.sistema) { return; }
                this.tejidos = (data.Table || []).map(t => Object.assign(t, { disponible: !!t.disponible }));
                this.tipos = [...new Set(this.tejidos.map(t => t.tipo).filter(t => !!t))].sort();
                this.filtrar();
                this.cargado = true;
            },
            () => this.toaster.error('Error al cargar los tejidos', 'Tejidos')
        );
    }

    get totalDisponibles(): number {
        return this.tejidos.filter(t => t.disponible).length;
    }

    get hayFiltro(): boolean {
        return !!this.buscar.trim() || !!this.filtroTipo || !!this.filtroEstado;
    }

    filtrar() {
        const texto = this.normalizar(this.buscar);
        const filtrados = this.tejidos.filter(t =>
            (!texto || [t.cod_solupyme, t.nombre, t.color, t.tipo].some(v => this.normalizar(v).indexOf(texto) >= 0))
            && (!this.filtroTipo || (this.filtroTipo === '-' ? !t.tipo : t.tipo === this.filtroTipo))
            && (!this.filtroEstado || t.disponible === (this.filtroEstado === 'si')));
        const porClave: { [clave: string]: any } = {};
        this.grupos = [];
        filtrados.forEach(t => {
            const clave = t.nombre;
            if (!porClave[clave]) {
                porClave[clave] = { clave, nombre: t.nombre, criterios: [], tejidos: [] };
                this.grupos.push(porClave[clave]);
            }
            const g = porClave[clave];
            g.tejidos.push(t);
            if (t.criterio != null && g.criterios.indexOf(t.criterio) < 0) { g.criterios.push(t.criterio); }
        });
        /* Texto de los anchos del grupo: "200 / 250 cm" */
        this.grupos.forEach(g => g.anchos = g.criterios.length ? g.criterios.sort((a, b) => a - b).join(' / ') + ' cm' : '');
        this.visibles = filtrados;
    }

    /* Con búsqueda o filtro los grupos se ven abiertos; sin ellos, solo los que abra el usuario */
    abierto(g: any): boolean {
        return this.hayFiltro || this.abiertos.has(g.clave);
    }

    alternar(g: any) {
        if (this.abiertos.has(g.clave)) { this.abiertos.delete(g.clave); } else { this.abiertos.add(g.clave); }
    }

    disponibles(lista: any[]): number {
        return lista.filter(t => t.disponible).length;
    }

    todos(lista: any[]): boolean {
        return lista.length > 0 && lista.every(t => t.disponible);
    }

    algunos(lista: any[]): boolean {
        return lista.some(t => t.disponible) && !this.todos(lista);
    }

    cambiarUno(t: any) {
        this.guardar([t], !t.disponible);
    }

    /* Casilla del grupo: si están todos los quita, si no los marca todos */
    cambiarGrupo(g: any) {
        this.guardar(g.tejidos, !this.todos(g.tejidos));
    }

    cambiarFiltrados(disponible: boolean) {
        const lista = this.visibles.filter(t => t.disponible !== disponible);
        if (lista.length === 0) { return; }
        const texto = (disponible ? '¿Marcar como disponibles ' : '¿Quitar ') + lista.length + ' tejido(s)?';
        if (!confirm(texto)) { return; }
        this.guardar(lista, disponible);
    }

    private guardar(lista: any[], disponible: boolean) {
        const cambian = lista.filter(t => t.disponible !== disponible);
        if (cambian.length === 0) { return; }
        cambian.forEach(t => t.disponible = disponible);
        this.estado = 'guardando';
        clearTimeout(this.temporizador);
        const body = { ids: cambian.map(t => t.id), disponible };
        this.service.HTTP_Post(this.url, JSON.stringify(body)).subscribe(
            () => {
                this.estado = 'guardado';
                this.temporizador = setTimeout(() => this.estado = '', 2000);
                if (this.filtroEstado) { this.filtrar(); }
            },
            err => {
                cambian.forEach(t => t.disponible = !disponible);
                this.estado = '';
                const msg = err && err.error && err.error.message && err.error.message !== 'KO' ? err.error.message : 'No se pudo guardar';
                this.toaster.error(msg, 'Tejidos');
            }
        );
    }

    porClave(i: number, g: any): string { return g.clave; }
    porId(i: number, t: any): number { return t.id; }

    private normalizar(valor: any): string {
        return String(valor == null ? '' : valor).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
    }
}
