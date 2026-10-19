import { Component, OnInit } from '@angular/core';
import { HaruService } from '../../../services/haru.service';
import { ToastrService } from 'ngx-toastr';

/*
 * Mantenimiento del modelo nuevo de accionamientos (tablas SOL_ACC_*).
 * Modelo: modelo_datos_accionamientos.md · Scripts: C:\dev\sqlAccionamientos\
 * Backend: controllers/sm/accionamientos_nuevo.js (/api/sm/acc/*)
 *
 * Las secciones siguen el orden del configurador: accionamiento y sistemas, cadena, motor,
 * y aparte las listas de opciones que se reutilizan (sistemas, colores, mandos...).
 * Cada sección se arma con app-acc-tabla (catálogo) y app-acc-relacion (N:M). Para un catálogo
 * nuevo (soportes, contrapesos...) basta con declararlo en el backend y añadir aquí su sección.
 */
@Component({
    selector: 'app-accionamientos-nuevo',
    templateUrl: './accionamientos-nuevo.component.html',
    styleUrls: ['./accionamientos-nuevo.component.css'],
    providers: [HaruService]
})
export class AccionamientosNuevoComponent implements OnInit {

    title = 'Accionamientos nuevo';

    readonly secciones = [
        { id: 'accionamientos', paso: '1', label: 'Accionamientos', ayuda: 'Qué sistemas tiene cada uno', icono: 'fa-hand-pointer-o' },
        { id: 'cadena', paso: '2', label: 'Cadena', ayuda: 'Tipos, aros, alturas, medidas y colores', icono: 'fa-link' },
        { id: 'motor', paso: '3', label: 'Motor', ayuda: 'Tipos, modelos y sus accesorios', icono: 'fa-cog' },
        { id: 'listas', paso: '', label: 'Listas de opciones', ayuda: 'Sistemas, colores, mandos...', icono: 'fa-list' }
    ];
    seccion = 'accionamientos';

    readonly listas = [
        { id: 'sistemas', label: 'Sistemas', singular: 'sistema', ayuda: 'Rhin, Duero, Sena deco... Se asignan a cada accionamiento en el paso 1.' },
        { id: 'colores_cadena', label: 'Colores de cadena', singular: 'color', ayuda: 'Se asignan a cada tipo de cadena en el paso 2.' },
        { id: 'mandos', label: 'Mandos', singular: 'mando', ayuda: 'Se asignan a cada modelo de motor en el paso 3.' },
        { id: 'cargadores', label: 'Cargadores', singular: 'cargador', ayuda: 'Se asignan a cada modelo de motor en el paso 3.' },
        { id: 'baterias', label: 'Baterías', singular: 'batería', ayuda: 'Se asignan a cada modelo de motor en el paso 3.' }
    ];
    lista: any = this.listas[0];

    /* Los tipos de cadena y de motor cuelgan de los accionamientos fijos CADENA y MOTOR */
    accCadena: any = null;
    accMotor: any = null;
    accionamientosCargados = false;

    accionamientoSel: any = null;
    tipoCadenaSel: any = null;
    pestanaCadena = 'aros';
    tipoMotorSel: any = null;
    pestanaTipoMotor = 'modelos';
    modeloMotorSel: any = null;
    pestanaModelo = 'mandos';

    /* Contadores que fuerzan la recarga de una lista cuando cambia algo que cuelga de ella ("Uso") */
    recargaAcc = 0;
    recargaTipoCadena = 0;
    recargaTipoMotor = 0;
    recargaModelo = 0;

    constructor(private service: HaruService, private toaster: ToastrService) { }

    ngOnInit() {
        this.cargarAccionamientos();
    }

    cambiarSeccion(id: string) {
        this.seccion = id;
        this.accionamientoSel = null;
        this.tipoCadenaSel = null;
        this.tipoMotorSel = null;
        this.modeloMotorSel = null;
        if (id === 'cadena' || id === 'motor') { this.cargarAccionamientos(); }
    }

    cambiarLista(id: string) {
        this.lista = this.listas.find(l => l.id === id);
    }

    /* Cada tipo de cadena enseña solo lo que le corresponde: aros (ARO_CADENA), medidas (CADENA_A_MEDIDA) y colores (todos) */
    seleccionTipoCadena(fila: any) {
        if (!fila || !this.tipoCadenaSel || fila.id !== this.tipoCadenaSel.id) {
            this.pestanaCadena = fila && fila.codigo === 'ARO_CADENA' ? 'aros' : fila && fila.codigo === 'CADENA_A_MEDIDA' ? 'medidas' : 'colores';
        }
        this.tipoCadenaSel = fila;
    }

    seleccionTipoMotor(fila: any) {
        if (!fila || !this.tipoMotorSel || fila.id !== this.tipoMotorSel.id) { this.modeloMotorSel = null; }
        this.tipoMotorSel = fila;
    }

    private cargarAccionamientos() {
        this.service.HTTP_Get('/sm/acc/accionamientos').subscribe(
            data => {
                const lista = data.Table || [];
                this.accCadena = lista.find(a => a.codigo === 'CADENA') || null;
                this.accMotor = lista.find(a => a.codigo === 'MOTOR') || null;
                this.accionamientosCargados = true;
            },
            () => this.toaster.error('Error al cargar los accionamientos', this.title)
        );
    }
}
