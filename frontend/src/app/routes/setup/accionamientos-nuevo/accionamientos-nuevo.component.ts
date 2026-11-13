import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
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
 *
 * Arriba se elige el producto: Enrollable o Solar Mini (sqlSolarMini/01). El Solar Mini tiene sus propias listas
 * (mini_* en el backend), planas y sin sistemas: perfilería, accionamiento, tejido y sus suplementos.
 * El Cajón ZIP (sqlCajonZip/01, zip_* en el backend) tampoco tiene sistemas: la raíz es el modelo de cajón, que
 * marca sus soportes, salidas, colores, tipos de motor y guías; cada guía sus contrapesos y colores, y cada
 * contrapeso sus colores. Tejido (una lista), lacados (aislados) y suplementos aparte.
 * El Vertical (sqlVertical/01, ver_* en el backend) tampoco tiene sistemas: la raíz es el tipo de vertical (Normal,
 * Inclinada y Viena, fijos) y CADA TIPO TIENE SUS PROPIAS LISTAS (ancho de lama, posición del mecanismo, color del
 * riel, accionamiento, soporte y recogida), que se pueden copiar de otro tipo. El tipo marca sus modalidades
 * (completa, solo mecanismo, solo tejido) y tiene su lista de tejidos.
 * El Panel japonés (sqlPanelJapones/01, pj_* en el backend) tampoco tiene sistemas ni tipos: modalidades fijas (completa,
 * solo riel, solo tejido), listas planas y propias del mecanismo (vías, color, mando, recogida, contrapeso, soporte) y
 * una lista de tejidos.
 * La HoneyComb (2026-11-13) NO usa el modelo nuevo: sus secciones son las pantallas de siempre (antes /manza/admin-data y
 * /manza/admin-images), sobre sus tablas SOL_ARTICULOS_HONEYCOMB_* y su tarifa. Así no cambian ni su configurador (lo usa
 * Leroy), ni su precio, ni su fabricación. No deja renombrar lo que usan las reglas de fabricación (backend honeycomb.js).
 * Se puede abrir directamente con ?producto=hc (y &seccion=...): es adonde llevan las rutas antiguas.
 */
@Component({
    selector: 'app-accionamientos-nuevo',
    templateUrl: './accionamientos-nuevo.component.html',
    styleUrls: ['./accionamientos-nuevo.component.css'],
    providers: [HaruService]
})
export class AccionamientosNuevoComponent implements OnInit {

    title = 'Productos';

    readonly productos = [
        { id: 'enrollable', label: 'Enrollable' },
        { id: 'mini', label: 'Solar Mini' },
        { id: 'zip', label: 'Cajón ZIP' },
        { id: 'ver', label: 'Vertical' },
        { id: 'pj', label: 'Panel japonés' },
        { id: 'hc', label: 'HoneyComb' }
    ];
    producto = 'enrollable';

    readonly seccionesEnrollable = [
        { id: 'accionamientos', paso: '1', label: 'Accionamientos', ayuda: 'Qué sistemas tiene cada uno', icono: 'fa-hand-pointer-o' },
        { id: 'cadena', paso: '2', label: 'Cadena', ayuda: 'Tipos, alturas y colores', icono: 'fa-link' },
        { id: 'motor', paso: '3', label: 'Motor', ayuda: 'Tipos, modelos, accesorios y sistemas', icono: 'fa-cog' },
        { id: 'soportes', paso: '4', label: 'Soportes, tapas y contrapesos', ayuda: 'Qué soportes, tapas y contrapesos tiene cada sistema', icono: 'fa-th-large' },
        { id: 'tejidos', paso: '', label: 'Tejidos', ayuda: 'Los que ofrece cada sistema', icono: 'fa-th' },
        { id: 'impresion', paso: '', label: 'Impresión digital', ayuda: 'Importe fijo por cortina y tejidos aptos', icono: 'fa-picture-o' },
        { id: 'listas', paso: '', label: 'Listas de opciones', ayuda: 'Sistemas, piezas, colores, mandos...', icono: 'fa-list' },
        { id: 'suplementos', paso: '', label: 'Suplementos', ayuda: 'Todos los precios que suman', icono: 'fa-eur' }
    ];

    readonly seccionesMini = [
        { id: 'mini_perfileria', paso: '1', label: 'Perfilería', ayuda: 'Tipos de junquillo, colores y colores RAL', icono: '' },
        { id: 'mini_accionamiento', paso: '2', label: 'Accionamiento', ayuda: 'Colores de cadena y de tapas', icono: '' },
        { id: 'mini_tejidos', paso: '3', label: 'Tejido', ayuda: 'Los que ofrece el Solar Mini', icono: '' },
        { id: 'impresion', paso: '', label: 'Impresión digital', ayuda: 'Importe fijo por cortina y tejidos aptos', icono: 'fa-picture-o' },
        { id: 'mini_suplementos', paso: '', label: 'Suplementos', ayuda: 'Todos los precios que suman', icono: 'fa-eur' }
    ];

    /* Cajón ZIP, en el orden del configurador */
    readonly seccionesZip = [
        { id: 'zip_modelos', paso: '1', label: 'Modelo de cajón', ayuda: 'Soportes, salidas, colores, motores y guías de cada uno', icono: '' },
        { id: 'zip_tejidos', paso: '2', label: 'Tejido', ayuda: 'Los que ofrece el Cajón ZIP', icono: '' },
        { id: 'zip_motor', paso: '3', label: 'Motor', ayuda: 'Tipos, modelos y mandos', icono: '' },
        { id: 'zip_guias', paso: '4', label: 'Guía', ayuda: 'Contrapesos y colores de cada guía', icono: '' },
        { id: 'zip_contrapesos', paso: '5', label: 'Contrapeso', ayuda: 'Colores de cada contrapeso', icono: '' },
        { id: 'zip_lacados', paso: '', label: 'Lacados', ayuda: 'Siempre disponibles, aparte del color', icono: 'fa-paint-brush' },
        { id: 'impresion', paso: '', label: 'Impresión digital', ayuda: 'Importe fijo por cortina y tejidos aptos', icono: 'fa-picture-o' },
        { id: 'zip_listas', paso: '', label: 'Listas de opciones', ayuda: 'Soportes, salidas, colores, mandos', icono: 'fa-list' },
        { id: 'zip_suplementos', paso: '', label: 'Suplementos', ayuda: 'Todos los precios que suman', icono: 'fa-eur' }
    ];

    /* Vertical, en el orden del configurador. Las secciones 2 y 3 son del tipo elegido arriba de ellas */
    readonly seccionesVer = [
        { id: 'ver_tipos', paso: '1', label: 'Tipo y modalidades', ayuda: 'Qué se puede pedir de cada tipo', icono: '' },
        { id: 'ver_opciones', paso: '2', label: 'Opciones del tipo', ayuda: 'Lama, mecanismo, riel, accionamiento, soporte y recogida', icono: '' },
        { id: 'ver_tejidos', paso: '3', label: 'Tejido', ayuda: 'Los que ofrece cada tipo', icono: '' },
        { id: 'impresion', paso: '', label: 'Impresión digital', ayuda: 'Importe fijo por cortina y tejidos aptos', icono: 'fa-picture-o' },
        { id: 'ver_tarifa', paso: '', label: 'Tarifa', ayuda: 'Mecanismo por ancho y tejido por metro de lama', icono: 'fa-table' },
        { id: 'ver_modalidades', paso: '', label: 'Modalidades', ayuda: 'Nombres y suplementos', icono: 'fa-list' },
        { id: 'ver_suplementos', paso: '', label: 'Suplementos', ayuda: 'Todos los precios que suman', icono: 'fa-eur' }
    ];

    /* Panel japonés, en el orden del configurador */
    readonly seccionesPj = [
        { id: 'pj_modalidades', paso: '1', label: 'Tipo de pedido', ayuda: 'Completa, solo riel o solo tejido', icono: '' },
        { id: 'pj_mecanismo', paso: '2', label: 'Mecanismo', ayuda: 'Vías, color, mando, recogida, contrapeso y soporte', icono: '' },
        { id: 'pj_tejidos', paso: '3', label: 'Tejido', ayuda: 'Los que ofrece el panel japonés', icono: '' },
        { id: 'impresion', paso: '', label: 'Impresión digital', ayuda: 'Importe fijo por cortina y tejidos aptos', icono: 'fa-picture-o' },
        { id: 'pj_tarifa_riel', paso: '', label: 'Tarifa del riel', ayuda: 'Solo riel: por vías y ancho', icono: 'fa-table' },
        { id: 'pj_suplementos', paso: '', label: 'Suplementos', ayuda: 'Todos los precios que suman', icono: 'fa-eur' }
    ];

    /* HoneyComb: cada sección es una pestaña de la pantalla de datos de siempre (app-honeycomb-admin-data), salvo Imágenes */
    readonly seccionesHc = [
        { id: 'hc_tipostejido', paso: '1', label: 'Tipos de tejido', ayuda: 'Opaco, traslúcido...', icono: '' },
        { id: 'hc_colorestejido', paso: '2', label: 'Colores de tejido', ayuda: 'Con su referencia Solupyme (el artículo de fabricación)', icono: '' },
        { id: 'hc_coloresperfil', paso: '3', label: 'Colores de perfil', ayuda: 'Los que deciden las reglas de fabricación', icono: '' },
        { id: 'hc_tiposaccionamiento', paso: '4', label: 'Accionamientos', ayuda: 'Manual, con varilla...', icono: '' },
        { id: 'hc_tarifas', paso: '', label: 'Tarifa', ayuda: 'Precios por medida, con historial', icono: 'fa-table' },
        { id: 'hc_imagenes', paso: '', label: 'Imágenes', ayuda: 'De tejidos, colores, perfiles y accionamientos', icono: 'fa-picture-o' }
    ];
    /* sección de Productos → pestaña de app-honeycomb-admin-data */
    readonly pestanaHc: { [seccion: string]: any } = {
        hc_tipostejido: 'tipostejido', hc_colorestejido: 'colorestejido', hc_coloresperfil: 'coloresperfil',
        hc_tiposaccionamiento: 'tiposaccionamiento', hc_tarifas: 'tarifas'
    };

    secciones = this.seccionesEnrollable;
    seccion = 'accionamientos';

    /* Pestañas de las secciones del Solar Mini: cada una es una lista (clave de CATALOGOS del backend) */
    readonly perfileria = [
        { id: 'mini_junquillos', label: 'Tipo de junquillo', singular: 'tipo de junquillo',
          ayuda: 'Redondeado / Biselado y Cuadrado son fijos: se pueden renombrar u ocultar, pero no borrar. Se pueden añadir más.' },
        { id: 'mini_colores_perfil', label: 'Colores', singular: 'color', ayuda: 'Colores de la perfilería.' },
        { id: 'mini_colores_ral', label: 'Colores RAL', singular: 'color RAL', ayuda: 'Colores RAL de la perfilería, aparte de los colores.' }
    ];
    readonly accionamientoMini = [
        { id: 'mini_colores_cadena', label: 'Color cadena', singular: 'color de cadena', ayuda: 'Colores de la cadena del Solar Mini (no son los del enrollable).' },
        { id: 'mini_colores_tapa', label: 'Color tapas', singular: 'color de tapa', ayuda: 'Colores de las tapas del Solar Mini (no son los del enrollable).' }
    ];
    pestanaPerfileria: any = this.perfileria[0];
    pestanaAccMini: any = this.accionamientoMini[0];

    /* Cajón ZIP: el color lleva RAL y hex (columnas propias de SOL_ACC_ZIP_COLOR) */
    readonly extrasColorZip = [
        { campo: 'ral', label: 'Código RAL', max: 20, placeholder: 'RAL 9010' },
        { campo: 'hex', label: 'Color (hex)', max: 7, placeholder: '#FFFFFF', color: true }
    ];
    /* Listas del Cajón ZIP que se marcan en los pasos (se dan de alta aquí) */
    readonly listasZip = [
        { id: 'zip_soportes', label: 'Soportes', singular: 'soporte', ayuda: 'Cada modelo de cajón marca los suyos en el paso 1.' },
        { id: 'zip_posiciones_salida', label: 'Posiciones de salida', singular: 'posición de salida',
          ayuda: 'Salida del cable (lateral, trasera...). Cada modelo de cajón marca las suyas en el paso 1.' },
        { id: 'zip_colores', label: 'Colores', singular: 'color', extras: this.extrasColorZip,
          ayuda: 'Una sola lista de colores para el cajón, la guía y el contrapeso: cada uno marca los suyos. RAL y hex son opcionales.' },
        { id: 'zip_mandos', label: 'Mandos', singular: 'mando', ayuda: 'Cada modelo de motor marca los suyos en el paso 3.' }
    ];
    listaZip: any = this.listasZip[0];
    /* Pestañas del detalle del modelo de cajón: cada una es una relación del backend */
    readonly pestanasModeloZip = [
        { id: 'zip_modelo_cajon_soporte', label: 'Soportes', vacio: 'No hay soportes. Añádalos en Listas de opciones → Soportes.' },
        { id: 'zip_modelo_cajon_salida', label: 'Posiciones de salida', vacio: 'No hay posiciones de salida. Añádalas en Listas de opciones → Posiciones de salida.' },
        { id: 'zip_modelo_cajon_color', label: 'Colores', vacio: 'No hay colores. Añádalos en Listas de opciones → Colores.' },
        { id: 'zip_modelo_cajon_tipo_motor', label: 'Tipos de motor', vacio: 'No hay tipos de motor. Añádalos en el paso 3 (Motor).' },
        { id: 'zip_modelo_cajon_guia', label: 'Guías', vacio: 'No hay guías. Añádalas en el paso 4 (Guía).' }
    ];
    pestanaModeloZip: any = this.pestanasModeloZip[0];
    modeloCajonSel: any = null;
    tipoMotorZipSel: any = null;
    modeloMotorZipSel: any = null;
    guiaSel: any = null;
    pestanaGuia = 'contrapesos';
    contrapesoSel: any = null;

    /* Listas propias de cada tipo de vertical (pestañas de "Opciones del tipo"; claves de CATALOGOS del backend) */
    readonly listasVer = [
        { id: 'ver_anchos_lama', label: 'Ancho de lama', singular: 'ancho de lama', conValor: true, unidad: 'mm',
          ayuda: 'Anchos de lama en mm. Si el tipo solo tiene uno (la Viena, 127), el configurador lo asigna sin preguntar.' },
        { id: 'ver_posiciones_mecanismo', label: 'Posición del mecanismo', singular: 'posición del mecanismo', ayuda: '' },
        { id: 'ver_colores_riel', label: 'Color del riel', singular: 'color del riel', ayuda: '' },
        { id: 'ver_accionamientos', label: 'Accionamiento', singular: 'accionamiento', ayuda: 'El motor es una opción más (sin modelos ni mandos por ahora).' },
        { id: 'ver_soportes', label: 'Soporte', singular: 'soporte', ayuda: '' },
        { id: 'ver_recogidas', label: 'Recogida', singular: 'recogida', ayuda: '' }
    ];
    pestanaVer: any = this.listasVer[0];

    /* Listas del mecanismo del Panel japonés (pestañas del paso 2; claves de CATALOGOS del backend) */
    readonly listasPj = [
        { id: 'pj_vias', label: 'Número de vías', singular: 'número de vías', conValor: true, unidad: 'vías',
          ayuda: 'Número entero. Al elegirlo, el configurador propone tantas portatelas como vías (se pueden subir hasta el doble).' },
        { id: 'pj_colores_mecanismo', label: 'Color del mecanismo', singular: 'color del mecanismo', ayuda: '' },
        { id: 'pj_posiciones_mando', label: 'Posición del mando', singular: 'posición del mando', ayuda: '' },
        { id: 'pj_recogidas', label: 'Tipo de recogida', singular: 'tipo de recogida', ayuda: '' },
        { id: 'pj_contrapesos', label: 'Contrapeso', singular: 'contrapeso', ayuda: '' },
        { id: 'pj_soportes', label: 'Tipo de soporte', singular: 'tipo de soporte', ayuda: '' }
    ];
    pestanaPj: any = this.listasPj[0];
    /* Tipos de vertical (fijos) y el elegido; otrosTiposVer = origen de "Copiar" (campo, no getter: es un @Input) */
    tiposVer: any[] = [];
    tipoVerId: number = null;
    otrosTiposVer: { id: number, nombre: string }[] = [];
    tipoVerFila: any = null;
    recargaVerTipo = 0;

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
          ayuda: 'Cada sistema marca los suyos en el paso 4.' },
        { id: 'colores_cadena', label: 'Colores de cadena', singular: 'color', ayuda: 'Se asignan en el paso 2: a cada altura de Aro cadena y a los demás tipos de cadena.' },
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
        accionamientos: 'Accionamientos', tipos_cadena: 'Tipos de cadena',
        alturas: 'Alturas', tipos_motor: 'Tipos de motor', modelos_motor: 'Motores',
        zip_modelos_cajon: 'Modelos de cajón', zip_tipos_motor: 'Tipos de motor', zip_modelos_motor: 'Motores',
        zip_guias: 'Guías', zip_contrapesos: 'Contrapesos', zip_lacados: 'Lacados',
        ver_tipos: 'Tipos de vertical', ver_modalidades: 'Modalidades', pj_modalidades: 'Tipos de pedido'
    }, ...this.listas.concat(<any[]>this.perfileria, <any[]>this.accionamientoMini, <any[]>this.listasZip, <any[]>this.listasVer,
        <any[]>this.listasPj)
        .map(l => ({ [l.id]: l.label })));

    /* Los tipos de cadena y de motor cuelgan de los accionamientos fijos CADENA y MOTOR */
    accCadena: any = null;
    accMotor: any = null;
    accionamientosCargados = false;

    accionamientoSel: any = null;
    tipoCadenaSel: any = null;
    pestanaCadena = 'alturas';
    /* Aro cadena: altura elegida, para marcar sus colores */
    alturaSel: any = null;
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
    recargaZipModelo = 0;
    recargaZipTipoMotor = 0;
    recargaZipModeloMotor = 0;
    recargaZipGuia = 0;
    recargaZipContrapeso = 0;

    constructor(private service: HaruService, private toaster: ToastrService, private route: ActivatedRoute) { }

    ngOnInit() {
        this.cargarAccionamientos();
        /* ?producto=hc&seccion=hc_imagenes: abrir un producto (y una sección) directamente (rutas antiguas de la HoneyComb).
           Suscrito y no con snapshot: si ya se está en Productos, Angular reutiliza la pantalla y solo cambian los parámetros.
           La suscripción a ActivatedRoute la cierra Angular al destruir la pantalla */
        this.route.queryParamMap.subscribe(q => {
            const producto = q.get('producto');
            if (producto && this.productos.some(p => p.id === producto)) {
                if (producto !== this.producto) { this.cambiarProducto(producto); }
                const seccion = q.get('seccion');
                if (seccion && seccion !== this.seccion && this.secciones.some(s => s.id === seccion)) { this.cambiarSeccion(seccion); }
            }
        });
    }

    /* Cada producto tiene su menú; se empieza por su primera sección */
    cambiarProducto(id: string) {
        if (id === this.producto) { return; }
        this.producto = id;
        this.secciones = id === 'mini' ? this.seccionesMini : id === 'zip' ? this.seccionesZip
            : id === 'ver' ? this.seccionesVer : id === 'pj' ? this.seccionesPj : id === 'hc' ? this.seccionesHc : this.seccionesEnrollable;
        if (id === 'ver') { this.cargarTiposVer(); }
        this.cambiarSeccion(this.secciones[0].id);
    }

    cambiarSeccion(id: string) {
        this.seccion = id;
        this.accionamientoSel = null;
        this.tipoCadenaSel = null;
        this.alturaSel = null;
        this.tipoMotorSel = null;
        this.modeloMotorSel = null;
        this.sistemaSel = null;
        this.listaSel = null;
        this.modeloCajonSel = null;
        this.tipoMotorZipSel = null;
        this.modeloMotorZipSel = null;
        this.guiaSel = null;
        this.contrapesoSel = null;
        this.tipoVerFila = null;
        if (id === 'cadena' || id === 'motor') { this.cargarAccionamientos(); }
        /* Los nombres de los tipos pueden haber cambiado en el paso 1 */
        if (id === 'ver_opciones' || id === 'ver_tejidos' || id === 'ver_tarifa') { this.cargarTiposVer(); }
    }

    /* Vertical: tipo elegido para las opciones y los tejidos (se conserva al cambiar de sección) */
    elegirTipoVer(id: number) {
        this.tipoVerId = id;
        this.otrosTiposVer = this.tiposVer.filter(t => t.id !== id).map(t => ({ id: t.id, nombre: t.nombre }));
    }

    /* Paso 1: elegir un tipo en la lista también lo deja elegido para los pasos 2 y 3 */
    seleccionTipoVer(fila: any) {
        this.tipoVerFila = fila;
        if (fila) { this.elegirTipoVer(fila.id); }
    }

    private cargarTiposVer() {
        this.service.HTTP_Get('/sm/acc/ver_tipos').subscribe(
            data => {
                this.tiposVer = data.Table || [];
                const actual = this.tiposVer.find(t => t.id === this.tipoVerId) || this.tiposVer[0];
                if (actual) { this.elegirTipoVer(actual.id); }
            },
            () => this.toaster.error('Error al cargar los tipos de vertical', this.title)
        );
    }

    /* Cajón ZIP: al cambiar de tipo de motor, el modelo elegido ya no vale */
    seleccionTipoMotorZip(fila: any) {
        if (!fila || !this.tipoMotorZipSel || fila.id !== this.tipoMotorZipSel.id) { this.modeloMotorZipSel = null; }
        this.tipoMotorZipSel = fila;
    }

    cambiarLista(id: string) {
        this.lista = this.listas.find(l => l.id === id);
        this.listaSel = null;
    }

    /* Cada tipo de cadena enseña solo lo que le corresponde: alturas con sus colores (ARO_CADENA) y colores (los demás) */
    seleccionTipoCadena(fila: any) {
        if (!fila || !this.tipoCadenaSel || fila.id !== this.tipoCadenaSel.id) {
            this.pestanaCadena = fila && fila.codigo === 'ARO_CADENA' ? 'alturas' : 'colores';
        }
        this.tipoCadenaSel = fila;
        this.alturaSel = null;
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
