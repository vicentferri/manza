import { Component, OnInit, ViewChild, ElementRef, Output, EventEmitter } from '@angular/core';
import { HaruService } from '../../services/haru.service';
import { ToastrService } from 'ngx-toastr';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { fabric } from 'fabric';

export interface ImpresionDigitalSeleccion {
    imagenId: number;
    coleccionId: number;
    nombre: string;
    precio: number;
    personalizable: boolean;
    texto: string;
    x: number;
    y: number;
    fontSize: number;
    fontFamily: string;
    color: string;
    previewUrl: string;
}

const CANVAS_MAX_WIDTH = 480;

@Component({
    selector: 'app-impresion-digital-selector',
    templateUrl: './impresion-digital-selector.component.html',
    styleUrls: ['./impresion-digital-selector.component.css'],
    providers: [HaruService]
})
export class ImpresionDigitalSelectorComponent implements OnInit {

    @ViewChild('modalSelector', { static: false }) modalSelector!: ModalDirective;
    @ViewChild('canvasPersonalizacion', { static: false }) canvasRef!: ElementRef<HTMLCanvasElement>;

    @Output() seleccionado = new EventEmitter<ImpresionDigitalSeleccion>();

    paso: 1 | 2 = 1;

    colecciones: any[] = [];
    coleccionFiltro: number | string = -1;

    imagenes: any[] = [];
    total = 0;
    pagina = 1;
    porPagina = 12;

    imagenSeleccionada: any = null;

    private canvas: fabric.Canvas = null;
    private textbox: fabric.Textbox = null;
    private escala = 1;
    fontFamily = 'Arial';
    color = '#000000';
    guardando = false;

    constructor(private service: HaruService, private toaster: ToastrService) { }

    ngOnInit() { }

    abrir() {
        this.paso = 1;
        this.coleccionFiltro = -1;
        this.pagina = 1;
        this.loadColecciones();
        this.loadImagenes();
        this.modalSelector.show();
    }

    cerrar() {
        this.destruirCanvas();
        this.modalSelector.hide();
    }

    // ── Paso 1: selección ─────────────────────────────────────────────

    loadColecciones() {
        this.service.HTTP_Get('/sm/impresion_digital_colecciones').subscribe(
            data => { this.colecciones = (data.Table || []).filter((c: any) => c.activo); },
            () => { }
        );
    }

    loadImagenes() {
        let route = '/sm/impresion_digital_imagenes?activo=1&pagina=' + this.pagina + '&porPagina=' + this.porPagina;
        if (this.coleccionFiltro && this.coleccionFiltro !== -1) { route += '&coleccion_id=' + this.coleccionFiltro; }

        this.service.HTTP_Get(route).subscribe(
            data => {
                this.imagenes = data.Table || [];
                this.total = data.total || 0;
            },
            () => { this.toaster.error('Error al cargar las imágenes de impresión digital'); }
        );
    }

    onFiltroChange() {
        this.pagina = 1;
        this.loadImagenes();
    }

    get totalPaginas(): number {
        return Math.max(1, Math.ceil(this.total / this.porPagina));
    }

    get paginas(): number[] {
        const total = this.totalPaginas;
        const current = this.pagina;
        const pages: number[] = [];
        const start = Math.max(1, current - 2);
        const end = Math.min(total, current + 2);
        for (let i = start; i <= end; i++) { pages.push(i); }
        return pages;
    }

    irPagina(p: number) {
        if (p >= 1 && p <= this.totalPaginas) {
            this.pagina = p;
            this.loadImagenes();
        }
    }

    getImagenUrl(archivoWeb: string): string {
        return this.service.Upload_URL('/uploads_impresion_digital/' + archivoWeb);
    }

    elegirImagen(img: any) {
        this.imagenSeleccionada = img;
        if (img.personalizable) {
            this.paso = 2;
            setTimeout(() => this.iniciarCanvas(), 0);
        } else {
            this.confirmarSinPersonalizar();
        }
    }

    // ── Paso 2: personalización con fabric.js ────────────────────────

    private iniciarCanvas() {
        this.destruirCanvas();

        const img = this.imagenSeleccionada;
        const anchoNatural = img.ancho || CANVAS_MAX_WIDTH;
        this.escala = Math.min(1, CANVAS_MAX_WIDTH / anchoNatural);
        const canvasWidth = Math.round(anchoNatural * this.escala);
        const canvasHeight = Math.round((img.alto || anchoNatural) * this.escala);

        this.canvas = new fabric.Canvas(this.canvasRef.nativeElement, {
            width: canvasWidth,
            height: canvasHeight
        });

        fabric.Image.fromURL(this.getImagenUrl(img.archivo_web), (fondo) => {
            fondo.set({ selectable: false, evented: false });
            fondo.scaleToWidth(canvasWidth);
            this.canvas.setBackgroundImage(fondo, this.canvas.renderAll.bind(this.canvas));

            this.textbox = new fabric.Textbox('Nombre', {
                left: canvasWidth * 0.1,
                top: canvasHeight * 0.4,
                width: canvasWidth * 0.6,
                fontSize: 28,
                fill: this.color,
                fontFamily: this.fontFamily
            });
            this.canvas.add(this.textbox);
            this.canvas.setActiveObject(this.textbox);
        }, { crossOrigin: 'anonymous' });
    }

    actualizarTextoCanvas(texto: string) {
        if (this.textbox) {
            this.textbox.set('text', texto);
            this.canvas.renderAll();
        }
    }

    actualizarFuenteCanvas() {
        if (this.textbox) {
            this.textbox.set({ fontFamily: this.fontFamily, fill: this.color });
            this.canvas.renderAll();
        }
    }

    actualizarTamanoCanvas(fontSize: number) {
        if (this.textbox) {
            this.textbox.set('fontSize', fontSize);
            this.canvas.renderAll();
        }
    }

    volverAlPaso1() {
        this.destruirCanvas();
        this.paso = 1;
    }

    private destruirCanvas() {
        if (this.canvas) {
            this.canvas.dispose();
            this.canvas = null;
            this.textbox = null;
        }
    }

    confirmarPersonalizacion() {
        if (!this.textbox || !this.textbox.text.trim()) {
            this.toaster.warning('Escribe el texto de personalización');
            return;
        }

        const img = this.imagenSeleccionada;
        const x = Math.round(this.textbox.left / this.escala);
        const y = Math.round(this.textbox.top / this.escala);
        const fontSize = Math.round(this.textbox.fontSize / this.escala);

        this.guardando = true;
        const payload = JSON.stringify({
            imagen_id: img.idrow,
            texto: this.textbox.text,
            x, y, fontSize,
            fontFamily: this.fontFamily,
            color: this.color
        });

        this.service.HTTP_Post('/sm/impresion_digital_imagen_preview', payload).subscribe(
            (data: any) => {
                this.guardando = false;
                this.emitirSeleccion({
                    imagenId: img.idrow,
                    coleccionId: img.coleccion_id,
                    nombre: img.nombre,
                    precio: img.precio,
                    personalizable: true,
                    texto: this.textbox.text,
                    x, y, fontSize,
                    fontFamily: this.fontFamily,
                    color: this.color,
                    previewUrl: this.service.Upload_URL(data.previewUrl)
                });
            },
            () => {
                this.guardando = false;
                this.toaster.error('No se pudo generar la vista previa de la personalización');
            }
        );
    }

    private confirmarSinPersonalizar() {
        const img = this.imagenSeleccionada;
        this.emitirSeleccion({
            imagenId: img.idrow,
            coleccionId: img.coleccion_id,
            nombre: img.nombre,
            precio: img.precio,
            personalizable: false,
            texto: '',
            x: 0, y: 0, fontSize: 0,
            fontFamily: '',
            color: '',
            previewUrl: this.getImagenUrl(img.archivo_web)
        });
    }

    private emitirSeleccion(seleccion: ImpresionDigitalSeleccion) {
        this.seleccionado.emit(seleccion);
        this.destruirCanvas();
        this.modalSelector.hide();
    }
}
