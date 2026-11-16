import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { HaruService } from '../../../services/haru.service';
import { ToastrService } from 'ngx-toastr';

/*
 * Una lista del catálogo vista para un perfil (Fase 2): qué opciones ve y con qué nombre (ES / PT).
 * La pinta app-acc-tabla cuando en Productos se elige "Ver como: <perfil>". El maestro no se edita aquí.
 * Backend: GET/POST /api/sm/cfg/admin/perfil/:id/opciones/:catalogo (y .../todo).
 * padreCampo / padreId: como en app-acc-tabla (listas que cuelgan de otra, p. ej. las de cada tipo de vertical).
 */
@Component({
    selector: 'app-acc-perfil-lista',
    templateUrl: './acc-perfil-lista.component.html',
    styleUrls: ['./accionamientos-nuevo.component.css']
})
export class AccPerfilListaComponent implements OnChanges {

    @Input() perfilId: number = null;
    @Input() perfilCodigo = '';
    @Input() catalogo = '';
    @Input() titulo = '';
    @Input() padreId: number = null;
    /* Se emite al pulsar una fila (la pantalla enseña lo que cuelga de ella, como en el maestro) */
    @Output() seleccion = new EventEmitter<any>();

    filas: any[] = [];
    politica = '';
    cargado = false;
    guardando = false;
    filaSeleccionada: any = null;
    busqueda = '';

    constructor(private service: HaruService, private toaster: ToastrService) { }

    ngOnChanges(changes: SimpleChanges) {
        if (changes.perfilId || changes.catalogo || changes.padreId) { this.cargar(); }
    }

    get visibles(): number {
        return this.filasPadre.filter(f => f.visible).length;
    }

    /* Las del padre elegido (si la lista cuelga de otra) */
    get filasPadre(): any[] {
        return this.padreId ? this.filas.filter(f => f.padre_id === this.padreId) : this.filas;
    }

    get filasFiltradas(): any[] {
        const b = this.busqueda.trim().toLowerCase();
        const base = this.filasPadre;
        return b ? base.filter(f => [f.nombre, f.codigo, f.nombre_es, f.nombre_pt, f.valor]
            .some(v => v !== null && v !== undefined && String(v).toLowerCase().includes(b))) : base;
    }

    nombreMaestro(f: any): string {
        return f.nombre || (f.valor !== null && f.valor !== undefined ? String(f.valor) : f.codigo);
    }

    porId(i: number, f: any) { return f.id; }

    cargar() {
        this.cargado = false;
        if (!this.perfilId || !this.catalogo) { this.filas = []; return; }
        const clave = this.perfilId + '/' + this.catalogo;
        this.service.HTTP_Get('/sm/cfg/admin/perfil/' + this.perfilId + '/opciones/' + this.catalogo).subscribe(
            data => {
                if (clave !== this.perfilId + '/' + this.catalogo) { return; }
                this.politica = data.politica;
                this.filas = data.filas || [];
                this.cargado = true;
            },
            err => this.error(err, 'Error al cargar la lista del perfil')
        );
    }

    seleccionar(f: any) {
        this.filaSeleccionada = f;
        this.seleccion.emit(f);
    }

    private guardar(cambios: any[], ok?: string) {
        this.guardando = true;
        this.service.HTTP_Post('/sm/cfg/admin/perfil/' + this.perfilId + '/opciones/' + this.catalogo, JSON.stringify({ cambios })).subscribe(
            () => { this.guardando = false; if (ok) { this.toaster.success(ok, this.titulo); } this.cargar(); },
            err => { this.guardando = false; this.error(err, 'No se pudo guardar'); this.cargar(); }
        );
    }

    cambiarVisible(f: any, valor: boolean) {
        this.guardar([{ id: f.id, visible: valor }]);
    }

    guardarNombre(f: any, campo: 'nombre_es' | 'nombre_pt', input: HTMLInputElement) {
        const valor = String(input.value || '').trim();
        if (valor === (f[campo] || '')) { return; }
        this.guardar([campo === 'nombre_es' ? { id: f.id, nombre: valor } : { id: f.id, nombre_pt: valor }], 'Nombre guardado');
    }

    /* Todas o ninguna: con padre, solo las de ese padre; si no, todo el catálogo de una vez */
    marcarTodas(valor: boolean) {
        if (this.padreId) {
            this.guardar(this.filasPadre.map(f => ({ id: f.id, visible: valor })));
            return;
        }
        this.guardando = true;
        this.service.HTTP_Post('/sm/cfg/admin/perfil/' + this.perfilId + '/opciones/' + this.catalogo + '/todo', JSON.stringify({ visible: valor })).subscribe(
            () => { this.guardando = false; this.cargar(); },
            err => { this.guardando = false; this.error(err, 'No se pudo guardar'); }
        );
    }

    private error(err: any, defecto: string) {
        const msg = err && err.error && err.error.message && err.error.message !== 'KO' ? err.error.message : defecto;
        this.toaster.error(msg, this.titulo);
    }
}
