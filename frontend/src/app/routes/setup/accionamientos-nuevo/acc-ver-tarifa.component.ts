import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { HaruService } from '../../../services/haru.service';
import { ToastrService } from 'ngx-toastr';

/*
 * Tarifa base del Vertical (sqlVertical/10): por tipo + ancho de lama + tejido.
 * El tipo lo elige la pantalla ([tipo]). Aquí se elige el "juego" de la tarifa: un ancho de lama del tipo (o "sin
 * ancho de lama", que vale para las líneas sin lama, como el solo mecanismo, y para los anchos sin filas propias)
 * y un cliente (o la general). Cada juego tiene:
 * - Mecanismo: tramos "hasta X cm de ancho → precio" de una cortina o un riel.
 * - Tejido: € por metro lineal de lama de cada tejido del tipo (por nombre: todos sus colores).
 * Cada tabla se guarda entera con su botón (sustituye el juego). "Pegar" acepta columnas copiadas de Excel.
 * "Copiar de otro tipo" trae lo que falte, emparejando los anchos de lama por su valor en mm.
 */
@Component({
    selector: 'app-acc-ver-tarifa',
    templateUrl: './acc-ver-tarifa.component.html',
    styleUrls: ['./accionamientos-nuevo.component.css']
})
export class AccVerTarifaComponent implements OnInit, OnChanges {

    @Input() tipo: number = null;
    /* los tres tipos (id, nombre), para el nombre y para "Copiar de otro tipo" */
    @Input() tipos: { id: number, nombre: string }[] = [];

    readonly title = 'Tarifa del Vertical';

    anchosLama: any[] = [];
    tejidos: any[] = [];
    filasMecanismo: any[] = [];
    filasTejido: any[] = [];
    clientes: any[] = [];
    cargado = false;

    /* juego elegido: ancho de lama ('' = sin ancho de lama) y cliente ('' = general) */
    lama: any = '';
    cliente: any = '';

    /* lo que se edita del juego elegido */
    tramos: { hasta: any, precio: any }[] = [];
    precios: { nombre: string, colores: number, precio: any, fuera?: boolean }[] = [];
    cambiadoMecanismo = false;
    cambiadoTejido = false;
    guardando = '';

    pegando: '' | 'mecanismo' | 'tejido' = '';
    textoPegado = '';
    origenCopia: number = null;
    copiando = false;

    constructor(private service: HaruService, private toaster: ToastrService) { }

    ngOnInit() {
        this.service.HTTP_Get('/sm/acc/clientes').subscribe(data => this.clientes = data.Table || [], () => { });
        this.cargar();
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes.tipo && !changes.tipo.firstChange) {
            this.lama = '';
            this.cliente = '';
            this.origenCopia = null;
            this.cargar();
        }
    }

    get nombreTipo(): string {
        const t = this.tipos.find(x => x.id === this.tipo);
        return t ? t.nombre : '';
    }

    get otrosTipos() {
        return this.tipos.filter(t => t.id !== this.tipo);
    }

    get hayCambios(): boolean {
        return this.cambiadoMecanismo || this.cambiadoTejido;
    }

    private valor(v: any): number {
        return v === '' || v === null || v === undefined ? null : Number(v);
    }

    /* los importes se enseñan con coma decimal, como se escriben */
    private coma(v: any): string {
        return v === null || v === undefined ? '' : String(v).replace('.', ',');
    }

    private delJuego(f: any, lama = this.lama, cliente = this.cliente): boolean {
        return f.ancho_lama_id === this.valor(lama) && f.cliente === this.valor(cliente);
    }

    /* filas guardadas de un ancho de lama con el cliente elegido (para las marcas de los botones) */
    filasDe(lama: any): number {
        return this.filasMecanismo.filter(f => this.delJuego(f, lama)).length + this.filasTejido.filter(f => this.delJuego(f, lama)).length;
    }

    /* clientes con tarifa propia en este tipo */
    get clientesConTarifa(): Set<number> {
        return new Set(this.filasMecanismo.concat(this.filasTejido).filter(f => f.cliente !== null).map(f => f.cliente));
    }

    nombreLama(l: any): string {
        return l.nombre || (Number(l.valor) + ' mm');
    }

    cargar() {
        if (!this.tipo) { return; }
        const tipo = this.tipo;
        this.service.HTTP_Get('/sm/acc/ver/tarifa/' + tipo).subscribe(
            data => {
                if (tipo !== this.tipo) { return; }
                this.anchosLama = data.anchosLama || [];
                this.tejidos = data.tejidos || [];
                this.filasMecanismo = data.mecanismo || [];
                this.filasTejido = data.tejido || [];
                if (this.lama !== '' && !this.anchosLama.some(l => l.id === Number(this.lama))) { this.lama = ''; }
                if (this.lama === '' && this.anchosLama.length) { this.lama = this.anchosLama[0].id; }
                this.cargado = true;
                this.prepararJuego();
            },
            () => this.toaster.error('Error al cargar la tarifa', this.title)
        );
    }

    /* cambiar de juego: si hay cambios sin guardar, se pregunta */
    elegir(lama: any, cliente: any) {
        if (this.hayCambios && !confirm('Hay cambios sin guardar en la tarifa. ¿Descartarlos?')) { return; }
        this.lama = lama;
        this.cliente = cliente;
        this.prepararJuego();
    }

    private prepararJuego() {
        this.tramos = this.filasMecanismo.filter(f => this.delJuego(f))
            .map(f => ({ hasta: this.coma(f.hasta), precio: this.coma(f.precio) }));
        const guardados = new Map<string, any>();
        this.filasTejido.filter(f => this.delJuego(f)).forEach(f => guardados.set(f.tejido_nombre, this.coma(f.precio)));
        this.precios = this.tejidos.map(t => ({ nombre: t.nombre, colores: t.colores, precio: guardados.has(t.nombre) ? guardados.get(t.nombre) : '' }));
        /* tejidos con precio que ya no están en el tipo: se enseñan para poder quitarlos */
        guardados.forEach((precio, nombre) => {
            if (!this.tejidos.some(t => t.nombre === nombre)) { this.precios.push({ nombre, colores: 0, precio, fuera: true }); }
        });
        this.cambiadoMecanismo = false;
        this.cambiadoTejido = false;
        this.pegando = '';
    }

    /* ---------- mecanismo ---------- */
    anadirTramo() {
        const ultimo = this.tramos.length ? Number(this.tramos[this.tramos.length - 1].hasta) || 0 : 0;
        this.tramos.push({ hasta: ultimo ? ultimo + 10 : '', precio: '' });
        this.cambiadoMecanismo = true;
    }

    quitarTramo(i: number) {
        this.tramos.splice(i, 1);
        this.cambiadoMecanismo = true;
    }

    /* "100   54,46" por línea (columnas de Excel: tabulador, punto y coma o espacios) */
    private leerPegado(): string[][] {
        return this.textoPegado.split(/\r?\n/).map(l => l.trim()).filter(l => l)
            .map(l => l.split(/\t|;|\s{2,}|\s(?=[\d-])/).map(c => c.trim()).filter(c => c !== ''));
    }

    private numero(texto: string): number {
        const limpio = String(texto).replace(/[€\s]/g, '').replace(/\.(?=\d{3}(\D|$))/g, '').replace(',', '.');
        return limpio === '' ? NaN : Number(limpio);
    }

    aplicarPegado() {
        const filas = this.leerPegado();
        if (this.pegando === 'mecanismo') {
            const tramos = filas.map(c => ({ hasta: this.numero(c[0]), precio: this.numero(c[c.length - 1]) }))
                .filter(t => !isNaN(t.hasta) && !isNaN(t.precio) && t.hasta > 0);
            if (!tramos.length) { this.toaster.warning('No se ha reconocido ninguna fila "ancho  precio"', this.title); return; }
            this.tramos = tramos;
            this.cambiadoMecanismo = true;
            this.toaster.info(tramos.length + ' tramos pegados (falta guardar)', this.title);
        } else {
            let n = 0;
            const sinTejido: string[] = [];
            filas.forEach(c => {
                const precio = this.numero(c[c.length - 1]);
                const nombre = c.slice(0, -1).join(' ').trim().toUpperCase();
                if (!nombre || isNaN(precio)) { return; }
                const p = this.precios.find(x => x.nombre.toUpperCase() === nombre);
                if (p) { p.precio = precio; n++; } else { sinTejido.push(nombre); }
            });
            if (n) { this.cambiadoTejido = true; }
            this.toaster.info(n + ' precios pegados (falta guardar)'
                + (sinTejido.length ? '. No están en el tipo: ' + sinTejido.slice(0, 5).join(', ') + (sinTejido.length > 5 ? '...' : '') : ''), this.title);
        }
        this.pegando = '';
        this.textoPegado = '';
    }

    guardarMecanismo() {
        const tramos = this.tramos.filter(t => t.hasta !== '' || t.precio !== '')
            .map(t => ({ hasta: this.numero(t.hasta), precio: this.numero(t.precio) }));
        if (tramos.some(t => isNaN(t.hasta) || t.hasta <= 0 || isNaN(t.precio) || t.precio < 0)) {
            this.toaster.warning('Cada tramo necesita un ancho mayor que 0 y un precio', this.title);
            return;
        }
        tramos.sort((a, b) => a.hasta - b.hasta);
        this.enviar('mecanismo', { tramos }, () => this.cambiadoMecanismo = false);
    }

    guardarTejido() {
        const precios = this.precios.filter(p => p.precio !== '' && p.precio !== null)
            .map(p => ({ tejido_nombre: p.nombre, precio: this.numero(p.precio) }));
        if (precios.some(p => isNaN(p.precio) || p.precio < 0)) {
            this.toaster.warning('Hay un precio que no es un número', this.title);
            return;
        }
        this.enviar('tejido', { precios }, () => this.cambiadoTejido = false);
    }

    private enviar(parte: 'mecanismo' | 'tejido', cuerpo: any, hecho: () => void) {
        const body = Object.assign({ ancho_lama_id: this.valor(this.lama), cliente: this.valor(this.cliente) }, cuerpo);
        this.guardando = parte;
        this.service.HTTP_Post('/sm/acc/ver/tarifa/' + this.tipo + '/' + parte, JSON.stringify(body)).subscribe(
            data => {
                this.guardando = '';
                hecho();
                this.toaster.success((parte === 'mecanismo' ? 'Mecanismo: ' + data.filas + ' tramos' : 'Tejido: ' + data.filas + ' precios') + ' guardados', this.title);
                this.recargarSinPerder(parte);
            },
            err => {
                this.guardando = '';
                const msg = err && err.error && err.error.message && err.error.message !== 'KO' ? err.error.message : 'No se pudo guardar';
                this.toaster.error(msg, this.title);
            }
        );
    }

    /* recarga las filas guardadas sin perder lo que se esté editando en la otra tabla */
    private recargarSinPerder(parte: string) {
        const otra = parte === 'mecanismo' ? (this.cambiadoTejido ? this.precios : null) : (this.cambiadoMecanismo ? this.tramos : null);
        this.service.HTTP_Get('/sm/acc/ver/tarifa/' + this.tipo).subscribe(data => {
            this.filasMecanismo = data.mecanismo || [];
            this.filasTejido = data.tejido || [];
            this.tejidos = data.tejidos || [];
            this.prepararJuego();
            if (otra && parte === 'mecanismo') { this.precios = <any>otra; this.cambiadoTejido = true; }
            if (otra && parte === 'tejido') { this.tramos = <any>otra; this.cambiadoMecanismo = true; }
        });
    }

    copiar() {
        const origen = this.tipos.find(t => t.id === Number(this.origenCopia));
        if (!origen) { return; }
        if (this.hayCambios && !confirm('Hay cambios sin guardar en la tarifa. ¿Descartarlos?')) { return; }
        this.copiando = true;
        this.service.HTTP_Post('/sm/acc/ver/tarifa/' + this.tipo + '/copiar', JSON.stringify({ origen: origen.id })).subscribe(
            data => {
                this.copiando = false;
                this.origenCopia = null;
                this.toaster.success('De ' + origen.nombre + ': ' + data.mecanismo + ' tramos y ' + data.tejido + ' precios de tejido'
                    + (data.sinLama ? '. ' + data.sinLama + ' filas no se han copiado: su ancho de lama no está en ' + this.nombreTipo : ''), this.title);
                this.cargar();
            },
            err => {
                this.copiando = false;
                const msg = err && err.error && err.error.message && err.error.message !== 'KO' ? err.error.message : 'No se pudo copiar';
                this.toaster.error(msg, this.title);
            }
        );
    }

    /* importe de ejemplo de una lama de 1 m de alto con el precio por metro (ayuda de la columna) */
    porEjemplo(precio: any): number {
        const n = this.numero(precio);
        return isNaN(n) ? null : n * (100 + 5.5) / 100;
    }
}
