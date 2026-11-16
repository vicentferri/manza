import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { HaruService } from '../../../services/haru.service';
import { ToastrService } from 'ngx-toastr';

/*
 * Tejidos de un producto vistos para un perfil (Fase 2): qué tejidos ve, cómo se llaman la serie y el color
 * (ES / PT) y sus mínimos y máximos de ancho y alto (cm; vacío = los de fabricación). Agrupados por serie: la
 * casilla, el nombre y las medidas de la serie se aplican a todos sus colores.
 * La pinta app-acc-tejidos cuando en Productos se elige "Ver como: <perfil>". Lo que se incluye en el producto
 * se sigue decidiendo en el catálogo maestro.
 * Backend: GET/POST /api/sm/cfg/admin/perfil/:id/tejidos/:producto (y .../todo). producto: ENR, MINI, ZIP, VER, PJ.
 */
@Component({
    selector: 'app-acc-perfil-tejidos',
    templateUrl: './acc-perfil-tejidos.component.html',
    styleUrls: ['./accionamientos-nuevo.component.css']
})
export class AccPerfilTejidosComponent implements OnChanges {

    @Input() perfilId: number = null;
    @Input() perfilCodigo = '';
    @Input() producto = 'ENR';

    readonly title = 'Tejidos del perfil';
    filas: any[] = [];
    politica = '';
    cargado = false;
    guardando = false;
    buscar = '';
    filtroEstado = '';
    /* Grupos (series) en un campo, no en un getter: si no, *ngFor recrearía las filas en cada ciclo */
    grupos: any[] = [];
    abiertos = new Set<string>();

    constructor(private service: HaruService, private toaster: ToastrService) { }

    ngOnChanges(changes: SimpleChanges) {
        if (changes.perfilId || changes.producto) { this.cargar(); }
    }

    get visibles(): number { return this.filas.filter(f => f.visible).length; }

    cargar() {
        this.cargado = false;
        if (!this.perfilId || !this.producto) { this.filas = []; this.agrupar(); return; }
        const clave = this.perfilId + '/' + this.producto;
        this.service.HTTP_Get('/sm/cfg/admin/perfil/' + this.perfilId + '/tejidos/' + this.producto).subscribe(
            data => {
                if (clave !== this.perfilId + '/' + this.producto) { return; }
                this.politica = data.politica;
                this.filas = data.filas || [];
                this.cargado = true;
                this.agrupar();
            },
            err => this.error(err, 'Error al cargar los tejidos del perfil')
        );
    }

    agrupar() {
        const b = this.buscar.trim().toLowerCase();
        const porSerie = new Map<string, any>();
        this.filas.forEach(f => {
            if (this.filtroEstado === 'si' && !f.visible) { return; }
            if (this.filtroEstado === 'no' && f.visible) { return; }
            if (b && ![f.nombre, f.color, f.tipo, f.cod_solupyme, f.nombre_es, f.color_es]
                .some(v => v && String(v).toLowerCase().includes(b))) { return; }
            const clave = (f.tipo || '') + '|' + f.nombre;
            if (!porSerie.has(clave)) { porSerie.set(clave, { clave, tipo: f.tipo, nombre: f.nombre, filas: [] }); }
            porSerie.get(clave).filas.push(f);
        });
        this.grupos = Array.from(porSerie.values()).map(g => Object.assign(g, {
            visibles: g.filas.filter(f => f.visible).length,
            nombre_es: this.comun(g.filas, 'nombre_es'),
            nombre_pt: this.comun(g.filas, 'nombre_pt')
        }));
    }

    /* Valor que tienen todas las filas del grupo ('' si no coinciden) */
    private comun(filas: any[], campo: string): string {
        const v = filas.length ? (filas[0][campo] || '') : '';
        return filas.every(f => (f[campo] || '') === v) ? v : '';
    }

    alternar(g: any) {
        if (this.abiertos.has(g.clave)) { this.abiertos.delete(g.clave); } else { this.abiertos.add(g.clave); }
    }

    medidaTexto(v: any): string {
        return v === null || v === undefined ? '' : String(Number(v)).replace('.', ',');
    }

    private guardar(cambios: any[], ok?: string) {
        if (!cambios.length) { return; }
        this.guardando = true;
        this.service.HTTP_Post('/sm/cfg/admin/perfil/' + this.perfilId + '/tejidos/' + this.producto, JSON.stringify({ cambios })).subscribe(
            () => { this.guardando = false; if (ok) { this.toaster.success(ok, this.title); } this.cargar(); },
            err => { this.guardando = false; this.error(err, 'No se pudo guardar'); this.cargar(); }
        );
    }

    visibleGrupo(g: any, valor: boolean) {
        this.guardar(g.filas.map(f => ({ tejido: f.id, visible: valor })));
    }

    visibleFila(f: any, valor: boolean) {
        this.guardar([{ tejido: f.id, visible: valor }]);
    }

    /* Nombre de la serie (ES o PT): se escribe en todos sus colores */
    nombreGrupo(g: any, campo: 'nombre' | 'nombre_pt', input: HTMLInputElement) {
        const valor = String(input.value || '').trim();
        if (valor === (campo === 'nombre' ? g.nombre_es : g.nombre_pt)) { return; }
        this.guardar(g.filas.map(f => ({ tejido: f.id, [campo]: valor })), 'Nombre de la serie guardado');
    }

    /* El color se renombra en todas las filas de la serie con ese color (una por ancho de rollo): el configurador
       agrupa por nombre y color, y si no saldrían dos colores distintos */
    colorFila(f: any, campo: 'color' | 'color_pt', input: HTMLInputElement) {
        const valor = String(input.value || '').trim();
        if (valor === ((campo === 'color' ? f.color_es : f.color_pt) || '')) { return; }
        const hermanas = this.filas.filter(x => x.nombre === f.nombre && x.tipo === f.tipo && x.color === f.color);
        this.guardar(hermanas.map(x => ({ tejido: x.id, [campo]: valor })), 'Color guardado');
    }

    medidaFila(f: any, campo: string, input: HTMLInputElement) {
        const valor = String(input.value || '').trim();
        if (valor === this.medidaTexto(f[campo])) { return; }
        this.guardar([{ tejido: f.id, [campo]: valor }], 'Medida guardada');
    }

    /* Medida para toda la serie */
    medidaGrupo(g: any, campo: string, input: HTMLInputElement) {
        const valor = String(input.value || '').trim();
        if (valor === '' && !g.filas.some(f => f[campo] !== null)) { return; }
        this.guardar(g.filas.map(f => ({ tejido: f.id, [campo]: valor })), 'Medida guardada en toda la serie');
        input.value = '';
    }

    marcarTodos(valor: boolean) {
        this.guardando = true;
        this.service.HTTP_Post('/sm/cfg/admin/perfil/' + this.perfilId + '/tejidos/' + this.producto + '/todo', JSON.stringify({ visible: valor })).subscribe(
            () => { this.guardando = false; this.cargar(); },
            err => { this.guardando = false; this.error(err, 'No se pudo guardar'); }
        );
    }

    private error(err: any, defecto: string) {
        const msg = err && err.error && err.error.message && err.error.message !== 'KO' ? err.error.message : defecto;
        this.toaster.error(msg, this.title);
    }
}
