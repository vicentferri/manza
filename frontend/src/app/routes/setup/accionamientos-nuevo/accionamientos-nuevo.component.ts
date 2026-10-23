import { Component, OnInit } from '@angular/core';
import { HaruService } from '../../../services/haru.service';
import { ToastrService } from 'ngx-toastr';

/*
 * Mantenimiento del modelo nuevo de accionamientos (tablas SOL_ACC_*).
 * Modelo: modelo_datos_accionamientos.md · Scripts: C:\dev\sqlAccionamientos\
 * Backend: controllers/sm/accionamientos_nuevo.js (/api/sm/acc/*)
 *
 * Las secciones siguen el orden del configurador: accionamiento y sistemas, cadena, motor,
 * y aparte los tejidos disponibles (app-acc-tejidos, script 29) y las listas de opciones que se
 * reutilizan (sistemas, colores, mandos...).
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

    title = 'Productos';

    readonly secciones = [
        { id: 'accionamientos', paso: '1', label: 'Accionamientos', ayuda: 'Qué sistemas tiene cada uno', icono: 'fa-hand-pointer-o' },
        { id: 'cadena', paso: '2', label: 'Cadena', ayuda: 'Tipos, aros, alturas, medidas y colores', icono: 'fa-link' },
        { id: 'motor', paso: '3', label: 'Motor', ayuda: 'Tipos, modelos, accesorios y sistemas', icono: 'fa-cog' },
        { id: 'soportes', paso: '4', label: 'Soportes y tapas', ayuda: 'Qué soportes y tapas tiene cada sistema', icono: 'fa-th-large' },
        { id: 'tejidos', paso: '', label: 'Tejidos', ayuda: 'Los que salen en el configurador', icono: 'fa-th' },
        { id: 'listas', paso: '', label: 'Listas de opciones', ayuda: 'Sistemas, piezas, colores, mandos...', icono: 'fa-list' },
        { id: 'suplementos', paso: '', label: 'Suplementos', ayuda: 'Todos los precios que suman', icono: 'fa-eur' }
    ];
    seccion = 'accionamientos';

    readonly listas = [
        { id: 'sistemas', label: 'Sistemas', singular: 'sistema', ayuda: 'Rhin, Duero, Sena deco... Se asignan a cada accionamiento en el paso 1. Su precio base sale de las tarifas del generador que tengan este sistema.' },
        /* colores: relación pieza → colores que admite (se marcan al elegir la pieza) */
        { id: 'soportes', label: 'Soportes', singular: 'soporte', colores: 'soporte_color', tituloColores: 'Colores del soporte',
          vacioColores: 'No hay colores de soporte. Añádalos en la pestaña Colores de soporte.',
          ayuda: 'Genéricos (Corto, Largo...). Cada sistema marca los suyos en el paso 4.' },
        { id: 'tapas', label: 'Tapas', singular: 'tapa', colores: 'tapa_color', tituloColores: 'Colores de la tapa',
          vacioColores: 'No hay colores de tapa. Añádalos en la pestaña Colores de tapa.',
          ayuda: 'Cada sistema marca las suyas en el paso 4.' },
        { id: 'contrapesos', label: 'Contrapesos', singular: 'contrapeso', colores: 'contrapeso_color', tituloColores: 'Colores del contrapeso',
          vacioColores: 'No hay colores de contrapeso. Añádalos en la pestaña Colores de contrapeso.',
          ayuda: 'Valen para todos los sistemas.' },
        { id: 'colores_cadena', label: 'Colores de cadena', singular: 'color', ayuda: 'Se asignan a cada tipo de cadena en el paso 2.' },
        { id: 'colores_soporte', label: 'Colores de soporte', singular: 'color', ayuda: 'Se marcan en cada soporte (pestaña Soportes).' },
        { id: 'colores_tapa', label: 'Colores de tapa', singular: 'color', ayuda: 'Se marcan en cada tapa (pestaña Tapas).' },
        { id: 'colores_contrapeso', label: 'Colores de contrapeso', singular: 'color', ayuda: 'Se marcan en cada contrapeso (pestaña Contrapesos).' },
        { id: 'mandos', label: 'Mandos', singular: 'mando', ayuda: 'Se asignan a cada modelo de motor en el paso 3.' },
        { id: 'cargadores', label: 'Cargadores', singular: 'cargador', ayuda: 'Se asignan a cada modelo de motor en el paso 3.' },
        { id: 'baterias', label: 'Baterías', singular: 'batería', ayuda: 'Se asignan a cada modelo de motor en el paso 3.' }
    ];
    lista: any = this.listas[0];

    /* Nombre de cada lista para el resumen de suplementos (claves de CATALOGOS del backend) */
    readonly nombresListas: { [clave: string]: string } = Object.assign({
        accionamientos: 'Accionamientos', tipos_cadena: 'Tipos de cadena', tipos_aro_cadena: 'Tipos de aro',
        tipos_cadena_medida: 'Cadena a medida', alturas: 'Alturas', tipos_motor: 'Tipos de motor', modelos_motor: 'Motores'
    }, ...this.listas.map(l => ({ [l.id]: l.label })));

    /* Los tipos de cadena y de motor cuelgan de los accionamientos fijos CADENA y MOTOR */
    accCadena: any = null;
    accMotor: any = null;
    accionamientosCargados = false;

    accionamientoSel: any = null;
    tipoCadenaSel: any = null;
    pestanaCadena = 'aros';
    tipoMotorSel: any = null;
    /* Paso 3: 'modelos' (tipo → modelo → accesorios) o 'sistemas' (motores por sistema) */
    vistaMotor = 'modelos';
    modeloMotorSel: any = null;
    pestanaModelo = 'mandos';
    sistemaSel: any = null;
    pestanaSistema = 'soportes';
    listaSel: any = null;

    /* Contadores que fuerzan la recarga de una lista cuando cambia algo que cuelga de ella ("Uso") */
    recargaAcc = 0;
    recargaTipoCadena = 0;
    recargaTipoMotor = 0;
    recargaModelo = 0;
    recargaSistemas = 0;
    recargaLista = 0;

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
        this.sistemaSel = null;
        this.listaSel = null;
        if (id === 'cadena' || id === 'motor') { this.cargarAccionamientos(); }
    }

    cambiarLista(id: string) {
        this.lista = this.listas.find(l => l.id === id);
        this.listaSel = null;
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
