import { Component, OnInit, ViewChild } from '@angular/core';
import { HaruService } from '../../../services/haru.service';
import { ToastrService } from 'ngx-toastr';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { environment } from '../../../../environments/environment';

/*
 * Imágenes de los colores de tejido de Leroy Merlín (SOL_TEJIDOS_COLORES_IMAGENES, sqlTejidos/05).
 * Una fila por tejido + color de los clientes 1 y 5 (comparten imagen), con dos caras:
 * A = por delante y B = por detrás. Se ven en el configurador junto al color (manza/tejido-imagen).
 * El backend reduce la imagen al subirla (JPG de 800 px como máximo); admite también TIF.
 */
@Component({
    selector: 'app-tejidos-imagenes',
    templateUrl: './tejidos-imagenes.component.html',
    styleUrls: ['./tejidos-imagenes.component.css'],
    providers: [HaruService]
})
export class TejidosImagenesComponent implements OnInit {

    @ViewChild('modalImagen', { static: false }) modalImagen!: ModalDirective;

    title = 'Imágenes de Tejidos';
    caras = [{ cara: 'A', nombre: 'Delante' }, { cara: 'B', nombre: 'Detrás' }];

    datos: any[] = [];
    datosFiltrados: any[] = [];
    tejidos: string[] = [];

    busqueda = '';
    filtroTejido = '';
    filtroImagen = '';

    // Subida: la fila y la cara a las que va el fichero elegido
    destino: any = null;
    subiendo = '';

    ampliada: any = null;

    private urlImagenes = environment.host_ip + '/api/sm/tejidos_imagenes/imagen/';

    constructor(private service: HaruService, private toaster: ToastrService) { }

    ngOnInit() {
        this.loadData();
    }

    loadData() {
        this.service.HTTP_Get('/sm/tejidos_imagenes').subscribe(
            data => {
                this.datos = data.Table || [];
                this.tejidos = Array.from(new Set(this.datos.map(d => d.desc_tejido)));
                this.aplicarFiltros();
            },
            err => { this.error(err, 'Error al cargar los colores'); }
        );
    }

    // ── Filtros ───────────────────────────────────────────────────────

    aplicarFiltros() {
        const texto = this.busqueda.trim().toUpperCase();
        this.datosFiltrados = this.datos.filter(d =>
            (!texto || (d.desc_tejido + ' ' + d.desc_color).toUpperCase().indexOf(texto) !== -1) &&
            (!this.filtroTejido || d.desc_tejido === this.filtroTejido) &&
            (this.filtroImagen !== 'sin' || !d.a_modified) &&
            (this.filtroImagen !== 'sinB' || !d.b_modified) &&
            (this.filtroImagen !== 'con' || d.a_modified)
        );
    }

    limpiarFiltros() {
        this.busqueda = '';
        this.filtroTejido = '';
        this.filtroImagen = '';
        this.aplicarFiltros();
    }

    get conImagen(): number {
        return this.datos.filter(d => d.a_modified).length;
    }

    // ── Imágenes ──────────────────────────────────────────────────────

    tiene(fila: any, cara: string): boolean {
        return !!fila[cara.toLowerCase() + '_modified'];
    }

    url(fila: any, cara: string): string {
        const version = new Date(fila[cara.toLowerCase() + '_modified']).getTime();
        return this.urlImagenes + fila.tejido + '/' + fila.color + '/' + cara + '?v=' + version;
    }

    ampliar(fila: any, cara: string) {
        if (!this.tiene(fila, cara)) { return; }
        this.ampliada = { fila, cara };
        this.modalImagen.show();
    }

    elegirFichero(fila: any, cara: string, input: HTMLInputElement) {
        this.destino = { fila, cara };
        input.value = '';
        input.click();
    }

    subir(event: any) {
        const fichero: File = event.target.files && event.target.files[0];
        if (!fichero || !this.destino) { return; }
        if (fichero.size > 30 * 1024 * 1024) {
            this.toaster.warning('La imagen ocupa más de 30 MB', this.title);
            return;
        }
        const { fila, cara } = this.destino;
        const lector = new FileReader();
        lector.onload = () => {
            this.subiendo = fila.tejido + '/' + fila.color + '/' + cara;
            const body = JSON.stringify({ base64: lector.result, filename: fichero.name });
            this.service.HTTP_Post('/sm/tejidos_imagenes/imagen/' + fila.tejido + '/' + fila.color + '/' + cara, body).subscribe(
                () => {
                    this.subiendo = '';
                    this.toaster.success(fila.desc_tejido + ' ' + fila.desc_color + ': imagen guardada', this.title);
                    this.loadData();
                },
                err => { this.subiendo = ''; this.error(err, 'Error al guardar la imagen'); }
            );
        };
        lector.readAsDataURL(fichero);
    }

    quitar(fila: any, cara: string) {
        const nombre = cara === 'A' ? 'de delante' : 'de detrás';
        if (!confirm('¿Quitar la imagen ' + nombre + ' de ' + fila.desc_tejido + ' ' + fila.desc_color + '?')) { return; }
        this.service.HTTP_Delete('/sm/tejidos_imagenes/imagen/' + fila.tejido + '/' + fila.color + '/' + cara).subscribe(
            () => { this.loadData(); },
            err => { this.error(err, 'Error al quitar la imagen'); }
        );
    }

    private error(err: any, defecto: string) {
        const msg = err && err.error && err.error.message && err.error.message !== 'KO' ? err.error.message : defecto;
        this.toaster.error(msg, this.title);
    }
}
