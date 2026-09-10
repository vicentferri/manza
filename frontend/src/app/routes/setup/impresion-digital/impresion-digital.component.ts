import { Component, OnInit, ViewChild } from '@angular/core';
import { HaruService } from '../../../services/haru.service';
import { UploadService } from '../../../services/upload.service';
import { ToastrService } from 'ngx-toastr';
import { ModalDirective } from 'ngx-bootstrap/modal';

@Component({
    selector: 'app-impresion-digital',
    templateUrl: './impresion-digital.component.html',
    styleUrls: ['./impresion-digital.component.css'],
    providers: [HaruService, UploadService]
})
export class ImpresionDigitalComponent implements OnInit {

    @ViewChild('modalSubida', { static: false }) modalSubida!: ModalDirective;
    @ViewChild('modalColecciones', { static: false }) modalColecciones!: ModalDirective;
    @ViewChild('inputFile', { static: false }) inputFile!: any;

    title = 'Gestión de Impresiones Digitales';

    colecciones: any[] = [];
    coleccionFiltro: number | string = -1;
    activoFiltro: string = '';

    imagenes: any[] = [];
    total = 0;
    pagina = 1;
    porPagina = 24;

    isDragOver = false;

    // Modal subida
    fileSeleccionado: File = null;
    previewUrl: string | ArrayBuffer = null;
    formSubida: any = { coleccion_id: -1, coleccion_nueva: '', nombre: '', precio: 0, activo: true, personalizable: false };
    subiendo = false;

    // Modal colecciones
    formColeccion: any = { idrow: null, nombre: '', activo: true };

    constructor(private service: HaruService, private upload: UploadService, private toaster: ToastrService) { }

    ngOnInit() {
        this.loadColecciones();
        this.loadImagenes();
    }

    // ── Carga de datos ───────────────────────────────────────────────

    loadColecciones() {
        this.service.HTTP_Get('/sm/impresion_digital_colecciones').subscribe(
            data => { this.colecciones = data.Table || []; },
            () => { this.toaster.error('Error al cargar las colecciones', this.title); }
        );
    }

    loadImagenes() {
        let route = '/sm/impresion_digital_imagenes?pagina=' + this.pagina + '&porPagina=' + this.porPagina;
        if (this.coleccionFiltro && this.coleccionFiltro !== -1) { route += '&coleccion_id=' + this.coleccionFiltro; }
        if (this.activoFiltro !== '') { route += '&activo=' + this.activoFiltro; }

        this.service.HTTP_Get(route).subscribe(
            data => {
                this.imagenes = (data.Table || []).map((r: any) => ({ ...r, _original: { ...r } }));
                this.total = data.total || 0;
            },
            () => { this.toaster.error('Error al cargar las imágenes', this.title); }
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

    // ── URLs de imagen ───────────────────────────────────────────────

    getImagenUrl(archivoWeb: string): string {
        return this.service.Upload_URL('/uploads_impresion_digital/' + archivoWeb);
    }

    // ── Drag & drop / selección de archivo ───────────────────────────

    onDragOver(event: DragEvent) {
        event.preventDefault();
        event.stopPropagation();
        this.isDragOver = true;
    }

    onDragLeave(event: DragEvent) {
        event.preventDefault();
        event.stopPropagation();
        this.isDragOver = false;
    }

    onDrop(event: DragEvent) {
        event.preventDefault();
        event.stopPropagation();
        this.isDragOver = false;
        const files = event.dataTransfer && event.dataTransfer.files;
        if (files && files.length > 0) { this.seleccionarArchivo(files[0]); }
    }

    onFileInputChange(event: any) {
        const file: File = event.target.files[0];
        if (file) { this.seleccionarArchivo(file); }
    }

    private seleccionarArchivo(file: File) {
        if (!file.type.startsWith('image/')) {
            this.toaster.warning('Selecciona un archivo de imagen válido', this.title);
            return;
        }
        this.fileSeleccionado = file;
        this.formSubida = {
            coleccion_id: this.colecciones.length ? this.colecciones[0].idrow : -1,
            coleccion_nueva: '',
            nombre: file.name.replace(/\.[^/.]+$/, ''),
            precio: 0,
            activo: true,
            personalizable: false
        };
        const reader = new FileReader();
        reader.onload = () => { this.previewUrl = reader.result; };
        reader.readAsDataURL(file);
        this.modalSubida.show();
    }

    cerrarModalSubida() {
        this.modalSubida.hide();
        this.fileSeleccionado = null;
        this.previewUrl = null;
        if (this.inputFile) { this.inputFile.nativeElement.value = ''; }
    }

    confirmarSubida() {
        if (!this.fileSeleccionado) { return; }
        if (this.formSubida.coleccion_id === -1 && !this.formSubida.coleccion_nueva.trim()) {
            this.toaster.warning('Selecciona una colección o crea una nueva', this.title);
            return;
        }
        if (!this.formSubida.nombre.trim()) {
            this.toaster.warning('El nombre es obligatorio', this.title);
            return;
        }

        this.subiendo = true;
        const token = localStorage.getItem('registerToken') || 'KK';
        const url = this.service.Upload_URL('/impresion_digital_imagen');

        const fields: any = {
            nombre: this.formSubida.nombre,
            precio: this.formSubida.precio,
            activo: this.formSubida.activo,
            personalizable: this.formSubida.personalizable
        };
        if (this.formSubida.coleccion_id !== -1) {
            fields.coleccion_id = this.formSubida.coleccion_id;
        } else {
            fields.coleccion_nueva = this.formSubida.coleccion_nueva.trim();
        }

        this.upload.makeFileRequest(url, [], [this.fileSeleccionado], token, 'image', fields)
            .then((result: any) => {
                this.subiendo = false;
                if (result.message === 'OK') {
                    this.toaster.success('Imagen subida correctamente', this.title);
                    this.cerrarModalSubida();
                    this.loadColecciones();
                    this.loadImagenes();
                } else {
                    this.toaster.error(result.detail || 'No se pudo subir la imagen', this.title);
                }
            })
            .catch(() => {
                this.subiendo = false;
                this.toaster.error('Error al subir la imagen', this.title);
            });
    }

    // ── Edición inline de imágenes ───────────────────────────────────

    actualizarImagen(img: any) {
        const payload = JSON.stringify({
            idrow: img.idrow,
            coleccion_id: img.coleccion_id,
            nombre: img.nombre,
            precio: img.precio,
            activo: img.activo,
            personalizable: img.personalizable
        });
        this.service.HTTP_Post('/sm/impresion_digital_imagen_update', payload).subscribe(
            () => {
                img._original = { ...img };
                this.toaster.success('Imagen actualizada', this.title);
            },
            () => { this.toaster.error('Error al actualizar la imagen', this.title); }
        );
    }

    eliminarImagen(img: any) {
        if (!confirm('¿Desea eliminar la imagen "' + img.nombre + '"?')) { return; }
        const payload = JSON.stringify({ idrow: img.idrow });
        this.service.HTTP_Post('/sm/impresion_digital_imagen_del', payload).subscribe(
            () => {
                this.toaster.success('Imagen eliminada', this.title);
                this.loadColecciones();
                this.loadImagenes();
            },
            () => { this.toaster.error('Error al eliminar la imagen', this.title); }
        );
    }

    // ── Gestión de colecciones ───────────────────────────────────────

    abrirColecciones() {
        this.formColeccion = { idrow: null, nombre: '', activo: true };
        this.modalColecciones.show();
    }

    editarColeccion(col: any) {
        this.formColeccion = { idrow: col.idrow, nombre: col.nombre, activo: col.activo };
    }

    guardarColeccion() {
        if (!this.formColeccion.nombre.trim()) {
            this.toaster.warning('El nombre de la colección es obligatorio', this.title);
            return;
        }
        const payload = JSON.stringify(this.formColeccion);
        this.service.HTTP_Post('/sm/impresion_digital_coleccion', payload).subscribe(
            () => {
                this.toaster.success('Colección guardada', this.title);
                this.formColeccion = { idrow: null, nombre: '', activo: true };
                this.loadColecciones();
            },
            () => { this.toaster.error('Error al guardar la colección', this.title); }
        );
    }

    eliminarColeccion(col: any) {
        if (col.num_imagenes > 0) {
            this.toaster.warning('No se puede eliminar una colección con imágenes asociadas', this.title);
            return;
        }
        if (!confirm('¿Desea eliminar la colección "' + col.nombre + '"?')) { return; }
        const payload = JSON.stringify({ idrow: col.idrow });
        this.service.HTTP_Post('/sm/impresion_digital_coleccion_del', payload).subscribe(
            () => {
                this.toaster.success('Colección eliminada', this.title);
                this.loadColecciones();
            },
            () => { this.toaster.error('Error al eliminar la colección', this.title); }
        );
    }
}
