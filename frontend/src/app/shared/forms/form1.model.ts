import {
    DynamicFormControlModel, DynamicCheckboxModel, DynamicInputModel,
    DynamicRadioGroupModel, DynamicSelectModel, DynamicTextAreaModel, DynamicDatePickerModel
} from '@ng-dynamic-forms/core';

export const COLOR_MODEL: DynamicFormControlModel[] = [

    new DynamicInputModel({ id: 'colores_nombre', label: 'Nombre', maxLength: 50, placeholder: 'Clave del Color' }),
    new DynamicInputModel({ id: 'colores_descripcion', label: 'Descripción del Color', maxLength: 50, placeholder: 'Descripción del Color' }),
    new DynamicInputModel({ id: 'colores_descripcion_l1', label: 'Descripción en Inglés', maxLength: 50, placeholder: 'Descripción en Ingles' }),
    new DynamicInputModel({ id: 'colores_descripcion_l2', label: 'Descripción en Francés', maxLength: 50, placeholder: 'Descripción en Francés' }),
    new DynamicCheckboxModel({ id: 'publish', label: 'Publicar Color' }),
];

export const FAMILIEN_MODEL: DynamicFormControlModel[] = [

    new DynamicInputModel({ id: 'nombre', label: 'Nombre', maxLength: 50, placeholder: 'Clave del Color' }),
    new DynamicInputModel({ id: 'descripcion', label: 'Descripción de la Familia', maxLength: 50, placeholder: 'Descripción de la Familia' }),
    new DynamicInputModel({ id: 'descripcion_l1', label: 'Descripción en Inglés', maxLength: 50, placeholder: 'Descripción en Ingles' }),
    new DynamicInputModel({ id: 'descripcion_l2', label: 'Descripción en Francés', maxLength: 50, placeholder: 'Descripción en Francés' }),
    new DynamicInputModel({ id: 'descripcion_l3', label: 'Descripción en Idioma 4', maxLength: 50, placeholder: 'Descripción en Idioma 4' }),
    new DynamicInputModel({ id: 'descripcion_l4', label: 'Descripción en Idioma 5', maxLength: 50, placeholder: 'Descripción en Idioma 5' }),
    new DynamicCheckboxModel({ id: 'publish', label: 'Publicar Familia' }),
];

export const SUBFAMILIEN_MODEL: DynamicFormControlModel[] = [

    new DynamicInputModel({ id: 'idrow', label: 'idrow', maxLength: 50, placeholder: 'Clave' }),
    new DynamicInputModel({ id: 'subfamilia', label: 'SubFamilia', maxLength: 50, placeholder: 'SubFamilia' }),
    new DynamicInputModel({ id: 'nombre', label: 'Nombre', maxLength: 50, placeholder: 'Nombre' }),
    new DynamicCheckboxModel({ id: 'publish', label: 'Publicar' }),
];

export const COMPOSITION_MODEL: DynamicFormControlModel[] = [

    new DynamicInputModel({ id: 'idrow', label: 'idrow', maxLength: 50, placeholder: 'Clave' }),
    new DynamicInputModel({ id: 'descripcion', label: 'Descripción', maxLength: 50, placeholder: 'Descripción' }),
    new DynamicInputModel({ id: 'descripcion_l1', label: 'Descripción en Inglés', maxLength: 50, placeholder: 'Descripción en Ingles' }),
    new DynamicInputModel({ id: 'descripcion_l2', label: 'Descripción en Francés', maxLength: 50, placeholder: 'Descripción en Francés' }),
    new DynamicCheckboxModel({ id: 'publish', label: 'Publicar' }),
];


export const CALIDAD_MODEL: DynamicFormControlModel[] = [

    new DynamicInputModel({ id: 'idrow', label: 'idrow', maxLength: 50, placeholder: 'Clave de la Calidad' }),
    new DynamicInputModel({ id: 'familia', label: 'Familia', maxLength: 50, placeholder: 'Familia' }),
    new DynamicInputModel({ id: 'nombre', label: 'Calidad', maxLength: 50, placeholder: 'Descripción' }),
    new DynamicInputModel({ id: 'nombre_l1', label: 'Calidad en Inglés', maxLength: 50, placeholder: 'Descripción Inglés' }),
    new DynamicInputModel({ id: 'nombre_l2', label: 'Calidad en Francés', maxLength: 50, placeholder: 'Descripción Francés' }),
    new DynamicCheckboxModel({ id: 'publish', label: 'Publicar' }),
];

export const CATEGORIAS_MODEL: DynamicFormControlModel[] = [

    new DynamicInputModel({ id: 'idrow', label: 'idrow', maxLength: 50, placeholder: 'Clave' }),
    new DynamicInputModel({ id: 'nombre', label: 'Descripción', maxLength: 50, placeholder: 'Descripción' }),
    new DynamicInputModel({ id: 'nombre_l1', label: 'Descripción en Inglés', maxLength: 50, placeholder: 'Descripción en Ingles' }),
    new DynamicInputModel({ id: 'nombre_l2', label: 'Descripción en Francés', maxLength: 50, placeholder: 'Descripción en Francés' }),
    new DynamicCheckboxModel({ id: 'publish', label: 'Publicar' }),
];

export const LINEAS_MODEL: DynamicFormControlModel[] = [

    new DynamicInputModel({ id: 'idrow', label: 'idrow', maxLength: 50, placeholder: 'Clave' }),
    new DynamicSelectModel<string>({ id: 'categoria', label: 'Categoria', multiple: false, options: [], placeholder: 'Seleccionar una categoría' }),
    new DynamicInputModel({ id: 'nombre', label: 'Descripción', maxLength: 50, placeholder: 'Descripción' }),
    new DynamicInputModel({ id: 'nombre_l1', label: 'Descripción en Inglés', maxLength: 50, placeholder: 'Descripción en Ingles' }),
    new DynamicInputModel({ id: 'nombre_l2', label: 'Descripción en Francés', maxLength: 50, placeholder: 'Descripción en Francés' }),
    new DynamicCheckboxModel({ id: 'publish', label: 'Publicar' }),
];

export const SUBLINEAS_MODEL: DynamicFormControlModel[] = [

    new DynamicInputModel({ id: 'idrow', label: 'idrow', maxLength: 50, placeholder: 'Clave' }),
    new DynamicSelectModel<string>({ id: 'linea', label: 'Linea', multiple: false, options: [], placeholder: 'Seleccionar una linea' }),
    new DynamicInputModel({ id: 'nombre', label: 'Descripción', maxLength: 50, placeholder: 'Descripción' }),
    new DynamicInputModel({ id: 'caracteristicas', label: 'características', maxLength: 2500, placeholder: 'Caracteristicas' }),
    new DynamicInputModel({ id: 'nombre_l1', label: 'Descripción en Inglés', maxLength: 50, placeholder: 'Descripción en Ingles' }),
    new DynamicInputModel({ id: 'nombre_l2', label: 'Descripción en Francés', maxLength: 50, placeholder: 'Descripción en Francés' }),
    new DynamicCheckboxModel({ id: 'publish', label: 'Publicar' }),
];

export const CATEGORIASM_MODEL: DynamicFormControlModel[] = [

    new DynamicInputModel({ id: 'idrow', label: 'idrow', maxLength: 50, placeholder: 'Clave' }),
    new DynamicInputModel({ id: 'nombre', label: 'Descripción', maxLength: 50, placeholder: 'Descripción' }),
    new DynamicInputModel({ id: 'nombre_l1', label: 'Descripción en Inglés', maxLength: 50, placeholder: 'Descripción en Ingles' }),
    new DynamicInputModel({ id: 'nombre_l2', label: 'Descripción en Francés', maxLength: 50, placeholder: 'Descripción en Francés' }),
    new DynamicCheckboxModel({ id: 'publish', label: 'Publicar' }),
];

export const ARTICULOS_MODEL: DynamicFormControlModel[] = [

    new DynamicInputModel({ id: 'idrow', label: 'idrow', maxLength: 50, placeholder: 'Clave' }),
    new DynamicInputModel({ id: 'descripcion', label: 'Descripción', maxLength: 50, placeholder: 'Descripción' }),
    new DynamicInputModel({ id: 'web_descripcion', label: 'Descripción Web', maxLength: 50, placeholder: 'Descripción en Web' }),
    new DynamicInputModel({ id: 'web_descripcion_l1', label: 'Descripción Web Inglés', maxLength: 50, placeholder: 'Descripción en Ingles' }),
    new DynamicInputModel({ id: 'web_descripcion_l2', label: 'Descripción Web Francés', maxLength: 50, placeholder: 'Descripción en Francés' }),
    new DynamicInputModel({ id: 'queaportamos', label: '¿Qué Aportamos?', maxLength: 2500, placeholder: 'Que Aportamos' }),
    new DynamicInputModel({ id: 'recomendado', label: 'Recomendado', maxLength: 2500, placeholder: 'Recomendado' }),
    new DynamicInputModel({ id: 'beneficios', label: 'Beneficios', maxLength: 2500, placeholder: 'Beneficios' }),
    new DynamicInputModel({ id: 'composicion_tecnica', label: 'Composición Técnica', maxLength: 2500, placeholder: 'Composición Técnica' }),
    new DynamicInputModel({ id: 'agrupacion', label: 'agrupacion', maxLength: 250, placeholder: 'Agrupacion' }),
    new DynamicInputModel({ id: 'talla', label: 'Tamaño', maxLength: 250, placeholder: 'Tamaño / Talla' }),
    new DynamicCheckboxModel({ id: 'publish', label: 'Publicar' }),
    new DynamicInputModel({ id: 'tamano_l1', label: 'Tamaño ES', maxLength: 125, placeholder: 'Tamaño ES' }),
    new DynamicInputModel({ id: 'tamano_l2', label: 'Tamaño EN', maxLength: 125, placeholder: 'Tamaño EN' }),
    new DynamicInputModel({ id: 'tamano_l3', label: 'Tamaño FR', maxLength: 125, placeholder: 'Tamaño FR' }),
    new DynamicInputModel({ id: 'referencia_l1', label: 'Referencia ES', maxLength: 125, placeholder: 'Referencia ES' }),
    new DynamicInputModel({ id: 'referencia_l2', label: 'Referencia EN', maxLength: 125, placeholder: 'Referencia EN' }),
    new DynamicInputModel({ id: 'referencia_l3', label: 'Referencia FR', maxLength: 125, placeholder: 'Referencia FR' }),
    new DynamicInputModel({ id: 'composicion_l1', label: 'Composición ES', maxLength: 125, placeholder: 'Composición ES' }),
    new DynamicInputModel({ id: 'composicion_l2', label: 'Composición EN', maxLength: 125, placeholder: 'Composición EN' }),
    new DynamicInputModel({ id: 'composicion_l3', label: 'Composición FR', maxLength: 125, placeholder: 'Composición FR' }),

];

export const ARTICULOS_MODEL_2: DynamicFormControlModel[] = [

    new DynamicInputModel({ id: 'idrow', label: 'idrow', maxLength: 50, placeholder: 'Clave' }),

];

export const USERS_MODEL: DynamicFormControlModel[] = [

    new DynamicInputModel({ id: 'idrow', label: 'idrow', maxLength: 50, placeholder: 'Clave' }),
    new DynamicInputModel({ id: 'name', label: 'name', maxLength: 50, placeholder: 'Nombre' }),
    new DynamicInputModel({ id: 'surname', label: 'surname', maxLength: 50, placeholder: 'Apellidos' }),
    new DynamicInputModel({ id: 'email', label: 'email', maxLength: 50, placeholder: 'email' }),
    new DynamicInputModel({ id: 'password', label: 'password', maxLength: 50, placeholder: 'password' }),
    new DynamicInputModel({ id: 'role', label: 'role', maxLength: 50, placeholder: 'role' }),
    new DynamicSelectModel<string>({ id: 'id2', label: 'Empresa', multiple: false, options: [], placeholder: 'Seleccionar el Cliente' }),
    new DynamicSelectModel<string>({ id: 'id2', label: 'Tienda', multiple: false, options: [], placeholder: 'Seleccionar la Tienda' }),

];

export const TARIFAS2_MODEL: DynamicFormControlModel[] = [

    new DynamicInputModel({ id: 'articulo', label: 'articulo', maxLength: 10, placeholder: 'Clave' }),
    new DynamicInputModel({ id: 'uds_bolsa', label: 'Uds Bolsa', maxLength: 10, placeholder: 'Unidades por Bolsa' }),
    new DynamicInputModel({ id: 'uds_caja', label: 'Uds Caja', maxLength: 10, placeholder: 'Unidades por Caja' }),
    new DynamicInputModel({ id: 'precio_ud_bolsa', label: 'Precio Ud Bolsa', maxLength: 10, placeholder: 'Precio Ud Bolsa' }),
    new DynamicInputModel({ id: 'precio_ud_caja', label: 'Precio Ud Caja', maxLength: 10, placeholder: 'Precio Ud Caja' })
];

export const SM_TEJIDOS_MODEL: DynamicFormControlModel[] = [

    new DynamicInputModel({ id: 'idrow', label: 'idrow', maxLength: 50, placeholder: 'Clave' }),
    new DynamicInputModel({ id: 'descripcion', label: 'descripcion', maxLength: 50, placeholder: 'Descripcion' }),
];

export const SM_ACCIONAMIENTOS_MODEL: DynamicFormControlModel[] = [

    new DynamicInputModel({ id: 'idrow', label: 'idrow', maxLength: 50, placeholder: 'Clave' }),
    new DynamicInputModel({ id: 'descripcion', label: 'descripcion', maxLength: 50, placeholder: 'Descripcion' }),
    
];

export const SM_COLORESMARCAS_MODEL: DynamicFormControlModel[] = [

    new DynamicInputModel({ id: 'idrow', label: 'idrow', maxLength: 50, placeholder: 'Clave' }),
    new DynamicSelectModel<string>({ id: 'tipo', label: 'Tipo', multiple: false, options: [], placeholder: 'Seleccionar un tipo' }),
    new DynamicInputModel({ id: 'descripcion', label: 'descripcion', maxLength: 50, placeholder: 'Descripcion' }),
    new DynamicInputModel({ id: 'codigo_48', label: 'Código 48', maxLength: 50, placeholder: 'Código 48' }),
    new DynamicSelectModel<string>({ id: 'impresiondigital', label: 'Impresión Digital', multiple: false, options: [], placeholder: 'Seleccionar la impresión' }),
    new DynamicCheckboxModel({ id: 'Bloqueo', label: ' Bloqueado' }),
];

export const SM_CONTRAPESOS_MODEL: DynamicFormControlModel[] = [

    new DynamicInputModel({ id: 'idrow', label: 'idrow', maxLength: 50, placeholder: 'Clave' }),
    new DynamicInputModel({ id: 'descripcion', label: 'descripcion', maxLength: 50, placeholder: 'Descripcion' }),
    new DynamicSelectModel({ id: 'grupo', label: 'grupo', multiple: false, options: [], placeholder: 'Seleccionar un grupo' }),
];

export const SM_SOPORTES_MODEL: DynamicFormControlModel[] = [

    new DynamicInputModel({ id: 'idrow', label: 'idrow', maxLength: 50, placeholder: 'Clave' }),
    new DynamicInputModel({ id: 'descripcion', label: 'descripcion', maxLength: 50, placeholder: 'Descripcion' }),
    new DynamicSelectModel({ id: 'grupo', label: 'grupo', multiple: false, options: [], placeholder: 'Seleccionar un grupo' }),
];

export const SM_TAPAS_MODEL: DynamicFormControlModel[] = [

    new DynamicInputModel({ id: 'idrow', label: 'idrow', maxLength: 50, placeholder: 'Clave' }),
    new DynamicInputModel({ id: 'descripcion', label: 'descripcion', maxLength: 50, placeholder: 'Descripcion' }),
    new DynamicSelectModel({ id: 'grupo', label: 'grupo', multiple: false, options: [], placeholder: 'Seleccionar un grupo' }),
];

export const SM_TUBOS_MODEL: DynamicFormControlModel[] = [

    new DynamicInputModel({ id: 'idrow', label: 'idrow', maxLength: 50, placeholder: 'Clave' }),
    new DynamicInputModel({ id: 'descripcion', label: 'descripcion', maxLength: 50, placeholder: 'Descripcion' }),
    new DynamicInputModel({ id: 'anchomax', label: 'ancho maximo', maxLength: 50, placeholder: 'Ancho Máximo' }),
];

export const SM_EMBALAJES_MODEL: DynamicFormControlModel[] = [

    new DynamicInputModel({ id: 'idrow', label: 'idrow', maxLength: 50, placeholder: 'Clave' }),
    new DynamicInputModel({ id: 'descripcion', label: 'descripcion', maxLength: 50, placeholder: 'Descripcion' }),
];

export const SM_EMPAQUETADOS_MODEL: DynamicFormControlModel[] = [

    new DynamicInputModel({ id: 'idrow', label: 'idrow', maxLength: 50, placeholder: 'Clave' }),
    new DynamicInputModel({ id: 'descripcion', label: 'descripcion', maxLength: 50, placeholder: 'Descripcion' }),
];

export const SM_INSTALACIONES_MODEL: DynamicFormControlModel[] = [

    new DynamicInputModel({ id: 'idrow', label: 'idrow', maxLength: 50, placeholder: 'Clave' }),
    new DynamicInputModel({ id: 'descripcion', label: 'descripcion', maxLength: 50, placeholder: 'Descripcion' }),
];

export const SM_POSICIONMANDO_MODEL: DynamicFormControlModel[] = [

    new DynamicInputModel({ id: 'idrow', label: 'idrow', maxLength: 50, placeholder: 'Clave' }),
    new DynamicInputModel({ id: 'descripcion', label: 'descripcion', maxLength: 50, placeholder: 'Descripcion' }),
];

export const SM_CLIENTESAPI_MODEL: DynamicFormControlModel[] = [

    new DynamicInputModel({ id: 'idrow', label: 'idrow', maxLength: 50, placeholder: 'Clave' }),
    new DynamicInputModel({ id: 'descripcion', label: 'descripcion', maxLength: 50, placeholder: 'Descripcion' }),
];

export const SM_TEJIDOS_CLIENTES_MODEL: DynamicFormControlModel[] = [

    new DynamicInputModel({ id: 'idrow', label: 'idrow', maxLength: 50, placeholder: 'Clave' }),
    new DynamicInputModel({ id: 'cliente', label: 'cliente', maxLength: 50, placeholder: 'Cliente' }),
    new DynamicInputModel({ id: 'descripcion', label: 'descripcion', maxLength: 50, placeholder: 'Descripcion' }),
    new DynamicInputModel({ id: 'traduccion', label: 'traduccion', maxLength: 150, placeholder: 'Traduccion' }),
];

export const SM_ESTANCIAS_MODEL: DynamicFormControlModel[] = [

    new DynamicInputModel({ id: 'idrow', label: 'idrow', maxLength: 50, placeholder: 'Clave' }),
    new DynamicInputModel({ id: 'descripcion', label: 'descripcion', maxLength: 50, placeholder: 'Descripcion' }),
];
export const CLIENTES_MODEL: DynamicFormControlModel[] = [

    new DynamicInputModel({ id: 'idrow', label: 'idrow', maxLength: 50, placeholder: 'Clave' }),

];

export const NH_STOCK: DynamicFormControlModel[] = [

    new DynamicInputModel({ id: 'idrow', label: 'idrow', maxLength: 50, placeholder: 'Clave' }),

];

export const SM_PROMOCIONES: DynamicFormControlModel[] = [

    new DynamicInputModel({ id: 'idrow', label: 'idrow', maxLength: 50, placeholder: 'Clave' }),
    new DynamicInputModel({ id: 'descripcion', label: 'descripcion', maxLength: 50, placeholder: 'Descripcion' }),
    new DynamicCheckboxModel({ id: 'promocion_activa', label: 'Promoción Activa' }),
    new DynamicInputModel({ id: 'promocion_coeficiente', label: 'Coeficiente PVP', maxLength: 10, placeholder: 'Coeficiente de Promoción' }),
    new DynamicCheckboxModel({ id: 'promocion_modificapvp', label: 'Promoción Modifica PVP' }),
    new DynamicInputModel({ id: 'promocion_coeficiente2', label: 'Coeficiente C1', maxLength: 10, placeholder: 'Coeficiente de Promoción' }),
    new DynamicCheckboxModel({ id: 'promocion_modificapvc', label: 'Promoción Modifica C1' }),
    new DynamicInputModel({ id: 'desde', label: 'Desde', maxLength: 10, placeholder: 'Inicio de Promoción' }),
    new DynamicInputModel({ id: 'hasta', label: 'Hasta', maxLength: 10, placeholder: 'Fin de Promoción' }),
    new DynamicInputModel({ id: 'promocion_mensaje', label: 'mensaje', maxLength: 255, placeholder: 'Mensaje de la Promoción' }),

    /*
      new DynamicDatePickerModel({id:'hasta',label:'Hasta',
    
                    placeholder: 'Pick a date',
                    value: new Date(),
                    additional: {
                        containerClass: 'theme-red'
                    }
                }),
    */

];

export const SM_COLORESCLIENTES: DynamicFormControlModel[] = [

    new DynamicInputModel({ id: 'idrow', label: 'idrow', maxLength: 50, placeholder: 'Clave' }),
    new DynamicInputModel({ id: 'descCliente', label: 'Cliente', maxLength: 50, placeholder: 'Cliente' }),
    new DynamicInputModel({ id: 'descTejido', label: 'Tejido', maxLength: 50, placeholder: 'Tejido' }),
    new DynamicInputModel({ id: 'descripcion', label: 'Color', maxLength: 50, placeholder: 'Descripcion' }),
    new DynamicInputModel({ id: 'traduccion', label: 'traduccion', maxLength: 150, placeholder: 'Traduccion' }),

];


export const SM_ACCIONAMIENTOSCLIENTES: DynamicFormControlModel[] = [

    new DynamicInputModel({ id: 'idrow', label: 'idrow', maxLength: 50, placeholder: 'Clave' }),

];

export const SM_ACCIONAMIENTOSMARCASCLIENTES: DynamicFormControlModel[] = [

    new DynamicInputModel({ id: 'iddel', label: 'idrow', maxLength: 50, placeholder: 'Clave' }),
    new DynamicInputModel({ id: 'TipoCliente', label: 'Traducción', maxLength: 50, placeholder: 'Descripción del Accionamiento' }),

];

export const LINEAS_SUBLINEAS_MODEL: DynamicFormControlModel[] = [

    new DynamicInputModel({ id: 'idrow', label: 'idrow', maxLength: 50, placeholder: 'Clave' }),
    new DynamicSelectModel<string>({ id: 'sublinea', label: 'SubLinea', multiple: false, options: [], placeholder: 'Seleccionar una sublinea' }),
    new DynamicInputModel({ id: 'nombre', label: 'Descripción', maxLength: 50, placeholder: 'Descripción' }),
    new DynamicInputModel({ id: 'nombre_l1', label: 'Descripción en Inglés', maxLength: 50, placeholder: 'Descripción en Ingles' }),
    new DynamicInputModel({ id: 'nombre_l2', label: 'Descripción en Francés', maxLength: 50, placeholder: 'Descripción en Francés' }),
    new DynamicCheckboxModel({ id: 'publish', label: 'Publicar' }),

];

export const SM_ACCIONAMIENTOSTIPOSCLIENTES: DynamicFormControlModel[] = [

    new DynamicInputModel({ id: 'idrow', label: 'id', maxLength: 50, placeholder: 'Clave' }),
    new DynamicSelectModel<string>({ id: 'id', label: 'accionamiento', multiple: false, options: [], placeholder: 'Seleccionar un Tipo de Accionamiento' }),
    new DynamicInputModel({ id: 'tipo', label: 'tipo', maxLength: 50, placeholder: 'Descripción del Accionamiento' }),
    new DynamicSelectModel({ id: 'grupo', label: 'grupo', multiple: false, options: [], placeholder: 'Seleccionar un grupo' }),
    new DynamicCheckboxModel({ id: 'mando', label: ' Mando' }),

];

export const SM_ACCIONAMIENTOS_MAPA: DynamicFormControlModel[] = [

    new DynamicInputModel({ id: 'idrow', label: 'id', maxLength: 50, placeholder: 'Clave', hidden: true }),
    new DynamicSelectModel<string>({ id: 'id', label: 'label', multiple: false, options: [], placeholder: 'Seleccionar un Tipo de Accionamiento' }),
    new DynamicInputModel({ id: 'tipo', label: 'tipo', maxLength: 50, placeholder: 'Descripción del Accionamiento' }),

];

export const SM_SOPORTESCLIENTES: DynamicFormControlModel[] = [

    new DynamicInputModel({ id: 'idrow', label: 'id', maxLength: 50, placeholder: 'Clave' }),
    new DynamicSelectModel({ id: 'cliente', label: 'Cliente', multiple: false, options: [], placeholder: 'Seleccionar un cliente' }),
    new DynamicSelectModel({ id: 'id', label: 'Soporte', multiple: false, options: [], placeholder: 'Seleccionar un Soporte', name: 'soporte' }),
    new DynamicInputModel({ id: 'traduccion', label: 'Traducción', maxLength: 50, placeholder: 'Descripción del Soporte' }),

];

export const SM_TAPASCLIENTES: DynamicFormControlModel[] = [

    new DynamicInputModel({ id: 'idrow', label: 'id', maxLength: 50, placeholder: 'Clave' }),
    new DynamicSelectModel({ id: 'cliente', label: 'Cliente', multiple: false, options: [], placeholder: 'Seleccionar un cliente' }),
    new DynamicSelectModel({ id: 'id', label: 'Tapa', multiple: false, options: [], placeholder: 'Seleccionar un Tapa', name: 'tapa' }),
    new DynamicInputModel({ id: 'traduccion', label: 'Traducción', maxLength: 50, placeholder: 'Descripción de la tapa' }),
];

export const APIINVOICES_MODEL: DynamicFormControlModel[] = [

    new DynamicInputModel({ id: 'idrow', label: 'id', maxLength: 50, placeholder: 'Clave' }),


];

export const SM_CONTRAPESOSCLIENTES: DynamicFormControlModel[] = [

    new DynamicInputModel({ id: 'idrow', label: 'id', maxLength: 50, placeholder: 'Clave' }),
    new DynamicSelectModel({ id: 'cliente', label: 'Cliente', multiple: false, options: [], placeholder: 'Seleccionar un Contrapeso' }),
    new DynamicSelectModel({ id: 'id', label: 'Contrapeso', multiple: false, options: [], placeholder: 'Seleccionar un Contrapeso' }),
    new DynamicInputModel({ id: 'traduccion', label: 'Traducción', maxLength: 50, placeholder: 'Descripción del Contrapeso' }),

];

export const SM_CONTRAPESOSCOLORESCLIENTES: DynamicFormControlModel[] = [

    new DynamicInputModel({ id: 'idrow', label: 'id', maxLength: 50, placeholder: 'Clave' }),
    new DynamicSelectModel({ id: 'cliente', label: 'Cliente', multiple: false, options: [], placeholder: 'Seleccionar un Cliente' }),
    new DynamicSelectModel({ id: 'contrapeso', label: 'Contrapeso', multiple: false, options: [], placeholder: 'Seleccionar un Contrapeso' }),
    new DynamicSelectModel({ id: 'id', label: 'Color',  multiple: false, options: [], placeholder: 'Seleccionar un color' }),


];

export const SM_SOPORTESCOLORESCLIENTES: DynamicFormControlModel[] = [

    new DynamicInputModel({ id: 'idsoporte', label: 'idrow', maxLength: 50, placeholder: 'Clave' }),
    new DynamicSelectModel({ id: 'id', label: 'Soporte', multiple: false, options: [], placeholder: 'Seleccionar un Soporte' }),
    new DynamicSelectModel({ id: 'idrow', label: 'Color', multiple: false, options: [], placeholder: 'Seleccionar un Color' }),
    new DynamicSelectModel({ id: 'cliente', label: 'Cliente',  multiple: false, options: [], placeholder: 'Seleccionar un Cliente' }),



];

export const SM_TAPASCOLORESCLIENTES: DynamicFormControlModel[] = [

    new DynamicInputModel({ id: 'idtapa', label: 'id', maxLength: 50, placeholder: 'Clave' }),
    new DynamicSelectModel({ id: 'idrow', label: 'Tapa', multiple: false, options: [], placeholder: 'Seleccionar una Tapa' }),
    new DynamicSelectModel({ id: 'id', label: 'Color', multiple: false, options: [], placeholder: 'Seleccionar un Color' }),
    new DynamicInputModel({ id: 'tamano', label: 'Tamaño', maxLength: 50, placeholder: 'Tamaño' }),


];

export const APIATRIBUTOS_MODEL: DynamicFormControlModel[] = [

    new DynamicInputModel({ id: 'id', label: 'id', maxLength: 50, placeholder: 'Clave' }),
    new DynamicInputModel({ id: 'atributo', label: 'atributo', maxLength: 50, placeholder: 'Nombre del Atributo' }),


];

export const SM_TEJIDOSCOLORES_MODEL: DynamicFormControlModel[] = [
    new DynamicInputModel({ id: 'idrow', label: 'id', maxLength: 50, placeholder: 'Clave' }),
];

export const SM_CLIENTES_MODEL: DynamicFormControlModel[] = [

    new DynamicInputModel({ id: 'idrow', label: 'idrow', maxLength: 50, placeholder: 'Clave' }),

];

export const SM_CLIENTES_DIRECCIONES_MODEL: DynamicFormControlModel[] = [

    new DynamicInputModel({ id: 'idrow', label: 'idrow', maxLength: 50, placeholder: 'Clave' }),

];

export const SM_TEJIDOSCLIENTESPRODUCTOS_MODEL: DynamicFormControlModel[] = [

    new DynamicInputModel({ id: 'idrow', label: 'idrow', maxLength: 50, placeholder: 'Clave' }),

];

export const SM_CAJONES_MODEL: DynamicFormControlModel[] = [

    new DynamicInputModel({ id: 'idrow', label: 'idrow', maxLength: 50, placeholder: 'Clave' }),
    new DynamicInputModel({ id: 'descripcion', label: 'descripcion', maxLength: 50, placeholder: 'Descripcion' }),
    new DynamicSelectModel({ id: 'grupo', label: 'grupo', multiple: false, options: [], placeholder: 'Seleccionar un grupo' }),
    
];

export const SM_GUIAS_MODEL: DynamicFormControlModel[] = [

    new DynamicInputModel({ id: 'idrow', label: 'idrow', maxLength: 50, placeholder: 'Clave' }),
    new DynamicInputModel({ id: 'descripcion', label: 'descripcion', maxLength: 50, placeholder: 'Descripcion' }),
    new DynamicSelectModel({ id: 'grupo', label: 'grupo', multiple: false, options: [], placeholder: 'Seleccionar un grupo' }),
    
];

export const SM_CLIENTES_INCREMENTOS_GENERICOS: DynamicFormControlModel[] = [

    new DynamicInputModel({ id: 'id', label: 'idrow', maxLength: 50, placeholder: 'Clave' }),
    new DynamicSelectModel<string>({ id: 'cliente', label: 'Cliente', multiple: false, options: [], placeholder: 'Seleccionar un cliente' }),
    new DynamicSelectModel<string>({ id: 'marca', label: 'Marca', multiple: false, options: [], placeholder: 'Seleccionar una marca' }),
    new DynamicSelectModel<string>({ id: 'modelo', label: 'Modelo', multiple: false, options: [], placeholder: 'Seleccionar un modelo' }),
    new DynamicSelectModel<string>({ id: 'producto', label: 'Producto', multiple: false, options: [], placeholder: 'Seleccionar un producto' }),
    new DynamicInputModel({ id: 'descripcion', label: 'Descripcion', maxLength: 50, placeholder: 'Descripcion' }),
    new DynamicInputModel({ id: 'pvp', label: 'Precio', maxLength: 50, placeholder: 'Precio' }),
    new DynamicInputModel({ id: 'c1', label: 'C1', maxLength: 50, placeholder: 'C1' }),
    new DynamicInputModel({ id: 'cod_solupyme', label: 'Codigo Solupyme', maxLength: 50, placeholder: 'Codigo Solupyme' }),
    

];

export const SM_ACCIONAMIENTOS_CLIENTES_TARIFAS: DynamicFormControlModel[] = [

    new DynamicInputModel({ id: 'id', label: 'idrow', maxLength: 50, placeholder: 'Clave' }),
    new DynamicSelectModel<string>({ id: 'idrow', label: 'Cliente', multiple: false, options: [], placeholder: 'Seleccionar un cliente' }),
    new DynamicInputModel({ id: 'ancho', label: 'Ancho', maxLength: 50, placeholder: 'Ancho' }),
    new DynamicInputModel({ id: 'pvp', label: 'Precio', maxLength: 50, placeholder: 'Precio' }),
    new DynamicInputModel({ id: 'c1', label: 'C1', maxLength: 50, placeholder: 'C1' }),
    
    

];

export const SM_ACCIONAMIENTOS_RADIO_TIPO: DynamicFormControlModel[] = [

    new DynamicInputModel({ id: 'idrow', label: 'idrow', maxLength: 50, placeholder: 'Clave' }),
    new DynamicInputModel({ id: 'descripcion', label: 'Decripción', maxLength: 50, placeholder: 'Decripción' }),
    new DynamicInputModel({ id: 'modelos', label: 'Modelos', maxLength: 255, placeholder: 'Modelos' }),
    new DynamicInputModel({ id: 'articulos', label: 'Articulos', maxLength: 255, placeholder: 'Articulos' }),
    
    

];

export const SM_ACCIONAMIENTOS_RADIO_TIPO_CLIENTE: DynamicFormControlModel[] = [

    new DynamicInputModel({ id: 'idrow', label: 'idrow', maxLength: 50, placeholder: 'Clave' }),
    new DynamicSelectModel<string>({ id: 'id', label: 'Mando', multiple: false, options: [], placeholder: 'Seleccionar mando' }),
    new DynamicInputModel({ id: 'descripcion', label: 'Decripción', maxLength: 255, placeholder: 'Decripción' }),
    new DynamicSelectModel<string>({ id: 'cliente', label: 'Cliente', multiple: false, options: [], placeholder: 'Seleccionar un cliente' }),
    new DynamicInputModel({ id: 'precio', label: 'Precio', maxLength: 50, placeholder: 'Precio' }),
    new DynamicInputModel({ id: 'c1', label: 'C1', maxLength: 50, placeholder: 'C1' }),
    new DynamicSelectModel<string>({ id: 'producto', label: 'Producto', multiple: false, options: [], placeholder: 'Seleccionar un producto' }),
    new DynamicSelectModel<string>({ id: 'modelo', label: 'Modelo', multiple: false, options: [], placeholder: 'Seleccionar un modelo' }),
    
    

];

export const SM_CONTRAPESO_CLIENTES_TARIFAS: DynamicFormControlModel[] = [

    new DynamicInputModel({ id: 'id', label: 'idrow', maxLength: 50, placeholder: 'Clave' }),
    new DynamicSelectModel<string>({ id: 'idrow', label: 'Contrapeso', multiple: false, options: [], placeholder: 'Seleccionar un contrapeso' }),
    new DynamicInputModel({ id: 'ancho', label: 'Ancho', maxLength: 50, placeholder: 'Ancho' }),
    new DynamicInputModel({ id: 'pvp', label: 'Precio', maxLength: 50, placeholder: 'Precio' }),
    new DynamicInputModel({ id: 'c1', label: 'C1', maxLength: 50, placeholder: 'C1' }),
    
    

];

export const SM_TARIFA_TEJIDO_VERTICAL: DynamicFormControlModel[] = [

    new DynamicInputModel({ id: 'ancholama', label: 'Ancho Lama', maxLength: 50, placeholder: 'Ancho Lama' }),
    new DynamicSelectModel<string>({ id: 'tejido', label: 'Tejido', multiple: false, options: [], placeholder: 'Seleccionar un tejido' }),
    new DynamicInputModel({ id: 'c1', label: 'C1', maxLength: 50, placeholder: 'C1' }),
    new DynamicInputModel({ id: 'k', label: 'K', maxLength: 50, placeholder: 'K' }),
    
    

];

export const SM_ACCESORIOS_TARIFAS: DynamicFormControlModel[] = [

    new DynamicInputModel({ id: 'id', label: 'idrow', maxLength: 50, placeholder: 'Clave' }),
    new DynamicSelectModel<string>({ id: 'idrow', label: 'Cliente', multiple: false, options: [], placeholder: 'Seleccionar un cliente' }),
    new DynamicInputModel({ id: 'mm', label: 'MM', maxLength: 50, placeholder: 'MM' }),
    new DynamicInputModel({ id: 'referencia', label: 'Referencia', maxLength: 50, placeholder: 'Referencia' }),
    new DynamicInputModel({ id: 'cantidad', label: 'Cantidad', maxLength: 50, placeholder: 'Cantidad' }),
    new DynamicInputModel({ id: 'pvp', label: 'Precio', maxLength: 50, placeholder: 'Precio' }),
    new DynamicInputModel({ id: 'c1', label: 'C1', maxLength: 50, placeholder: 'C1' }),
    
    

];

export const SM_MECANISMO_JAPONES_TARIFAS: DynamicFormControlModel[] = [

    new DynamicInputModel({ id: 'id', label: 'idrow', maxLength: 50, placeholder: 'Clave' }),
    new DynamicInputModel({ id: 'vias', label: 'Vias', maxLength: 50, placeholder: 'Vias' }),
    new DynamicSelectModel<string>({ id: 'cliente', label: 'Cliente', multiple: false, options: [], placeholder: 'Seleccionar un cliente' }),
    new DynamicInputModel({ id: 'ancho', label: 'Ancho', maxLength: 50, placeholder: 'Ancho' }),
    new DynamicInputModel({ id: 'pvp', label: 'Precio', maxLength: 50, placeholder: 'Precio' }),
    new DynamicInputModel({ id: 'c1', label: 'C1', maxLength: 50, placeholder: 'C1' }),
    
    

];

export const SM_TARIFA_MECANISMO_VERTICAL: DynamicFormControlModel[] = [

    new DynamicInputModel({ id: 'ancholama', label: 'Ancho Lama', maxLength: 50, placeholder: 'Ancho Lama' }),
    new DynamicInputModel({ id: 'ancho', label: 'Ancho', maxLength: 50, placeholder: 'Ancho' }),
    new DynamicInputModel({ id: 'pvp', label: 'Precio', maxLength: 50, placeholder: 'Precio' }),
    new DynamicInputModel({ id: 'lamas', label: 'Lamas', maxLength: 50, placeholder: 'Lamas' }),
    new DynamicInputModel({ id: 'c1', label: 'C1', maxLength: 50, placeholder: 'C1' }),
    new DynamicInputModel({ id: 'pvc', label: 'Precio Coste', maxLength: 50, placeholder: 'Precio Coste' }),
    
    

];

export const SM_INCREMENTOS: DynamicFormControlModel[] = [

    new DynamicInputModel({ id: 'id', label: 'idrow', maxLength: 50, placeholder: 'Clave' }),
    new DynamicSelectModel<string>({ id: 'cliente', label: 'Cliente', multiple: false, options: [], placeholder: 'Seleccionar un cliente' }),
    new DynamicSelectModel<string>({ id: 'value', label: 'Guia', multiple: false, options: [], placeholder: 'Seleccionar un guia' }),
    new DynamicCheckboxModel({ id: 'bruto', label: ' Bruto' }),
    new DynamicInputModel({ id: 'idtarifa', label: 'Tarifa', maxLength: 50, placeholder: 'Tarifa' }),
    
    

];

export const SM_INCREMENTOS_CAJONES: DynamicFormControlModel[] = [

    new DynamicInputModel({ id: 'id', label: 'idrow', maxLength: 50, placeholder: 'Clave' }),
    new DynamicSelectModel<string>({ id: 'cliente', label: 'Cliente', multiple: false, options: [], placeholder: 'Seleccionar un cliente' }),
    new DynamicSelectModel<string>({ id: 'value', label: 'Cajón', multiple: false, options: [], placeholder: 'Seleccionar un guia' }),
    new DynamicCheckboxModel({ id: 'bruto', label: ' Bruto' }),
    new DynamicInputModel({ id: 'idtarifa', label: 'Tarifa', maxLength: 50, placeholder: 'Tarifa' }),
    
    

];

export const SM_INCREMENTOS_LACADOS: DynamicFormControlModel[] = [

    new DynamicInputModel({ id: 'id', label: 'idrow', maxLength: 50, placeholder: 'Clave' }),
    new DynamicInputModel({ id: 'descripcion', label: 'Decripción', maxLength: 255, placeholder: 'Decripción' }),
    new DynamicInputModel({ id: 'pvp', label: 'Precio', maxLength: 50, placeholder: 'Precio' }),
    new DynamicInputModel({ id: 'c1', label: 'C1', maxLength: 50, placeholder: 'C1' }),
    new DynamicCheckboxModel({ id: 'Basico', label: ' Basico' }),
    new DynamicInputModel({ id: 'dias', label: 'Dias', maxLength: 50, placeholder: 'Dias' }),
    new DynamicInputModel({ id: 'factor', label: 'Factor', maxLength: 50, placeholder: 'Factor' }),
    
    
    
    

];

export const SM_GRUPO_MODELO: DynamicFormControlModel[] = [

    new DynamicInputModel({ id: 'idrow', label: 'idrow', maxLength: 50, placeholder: 'Clave' }),
    new DynamicInputModel({ id: 'descripcion', label: 'Decripción', maxLength: 255, placeholder: 'Decripción' }),
    new DynamicSelectModel<string>({ id: 'modelo', label: 'Modelo', multiple: false, options: [], placeholder: 'Seleccionar un modelo' }),
    
    
    
    
    

];

export const SM_TEJIDOSATRIBUTOS_MODEL: DynamicFormControlModel[] = [

    new DynamicInputModel({ id: 'idrow', label: 'idrow', maxLength: 50, placeholder: 'Clave' }),
    new DynamicSelectModel({ id: 'tejido', label: 'Tejido', multiple: false, options: [], placeholder: 'Seleccionar un tejido' }),
    new DynamicSelectModel({ id: 'color', label: 'Color', multiple: false, options: [], placeholder: 'Seleccionar una color' }),
    new DynamicSelectModel({ id: 'cliente', label: 'Cliente', multiple: false, options: [], placeholder: 'Seleccionar un cliente' }),
    new DynamicInputModel({ id: 'descripcion', label: 'Descripcion', maxLength: 50, placeholder: 'Descripcion' }),
    new DynamicInputModel({ id: 'anchomax', label: 'Maxinmo Ancho', maxLength: 50, placeholder: 'Ancho Maximo' }),
    new DynamicCheckboxModel({ id: 'impresiondigital', label: 'Impresión Digital' }),
    new DynamicInputModel({ id: 'codigoprov', label: 'Codigo Proveedor', maxLength: 50, placeholder: 'Codigo Solupyme' }),
    

];

export const SM_CAJONES_CLIENTES_MODEL: DynamicFormControlModel[] = [

   
   
    new DynamicSelectModel({ id: 'idrow', label: 'Cajón', multiple: false, options: [], placeholder: 'Seleccionar una cajón' }),
    new DynamicSelectModel({ id: 'cliente', label: 'Cliente', multiple: false, options: [], placeholder: 'Seleccionar un cliente' }),
    
    

];
