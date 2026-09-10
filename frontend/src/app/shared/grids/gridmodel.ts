
export const gridmodel = (modelname: string): any => {

    const decimal2Value = (row, cellvalue, editor) => {
        editor.jqxNumberInput({ decimalDigits: 2, digits: 2, min: 0, spinButtons: false });
    }

    const decimal3Value = (row, cellvalue, editor) => {
        editor.jqxNumberInput({ decimalDigits: 3, digits: 2, min: 0, spinButtons: false });
    }

    const IntValue = (row, cellvalue, editor) => {
        editor.jqxNumberInput({ decimalDigits: 0, digits: 3, min: 180, spinButtons: false });
    }

    let dropdownitems: any = [{ idrow: 1, nombre: 'uno' }, { idrow: 2, nombre: 'dos' }];





    let model: any = null;

    switch (modelname) {

        case 'colores':
            model = {
                datafields: [
                    { name: 'colores_nombre', type: 'string' },
                    { name: 'colores_descripcion', type: 'string' },
                    { name: 'colores_descripcion_l1', type: 'string' },
                    { name: 'colores_descripcion_l2', type: 'string' },
                    { name: 'publish', type: 'bool' }
                ],
                columns: [
                    { text: 'colores_nombre', datafield: 'colores_nombre', width: 175, filtertype: 'textbox', editable: false },
                    { text: 'colores_descripcion', datafield: 'colores_descripcion', width: 175, filtertype: 'input', editable: false },
                    { text: 'colores_descripcion_l1', datafield: 'colores_descripcion_l1', width: 175, filtertype: 'input', editable: false },
                    { text: 'colores_descripcion_l2', datafield: 'colores_descripcion_l2', width: 175, filtertype: 'input', editable: false },
                    { text: 'Publicar', datafield: 'publish', columntype: 'checkbox', filtertype: 'bool', width: 67 },
                ]
            }
            break;

        case 'familias':
            model = {
                datafields: [
                    { name: 'nombre', type: 'string' },
                    { name: 'descripcion', type: 'string' },
                    { name: 'descripcion_l1', type: 'string' },
                    { name: 'descripcion_l2', type: 'string' },
                    { name: 'descripcion_l3', type: 'string' },
                    { name: 'descripcion_l4', type: 'string' },
                    { name: 'publish', type: 'bool' }
                ],
                columns: [
                    { text: 'nombre', datafield: 'nombre', width: 175, filtertype: 'textbox', editable: false },
                    { text: 'descripcion', datafield: 'descripcion', width: 175, filtertype: 'input', editable: false },
                    { text: 'descripcion_l1', datafield: 'descripcion_l1', width: 175, filtertype: 'input', editable: false },
                    { text: 'descripcion_l2', datafield: 'descripcion_l2', width: 175, filtertype: 'input', editable: false },
                    { text: 'descripcion_l3', datafield: 'descripcion_l3', width: 175, filtertype: 'input', editable: false },
                    { text: 'descripcion_l4', datafield: 'descripcion_l4', width: 175, filtertype: 'input', editable: false },
                    { text: 'Publicar', datafield: 'publish', columntype: 'checkbox', filtertype: 'bool', width: 67 },
                ]
            }
            break;

        case 'subfamilias':
            model = {
                datafields: [
                    { name: 'idrow', type: 'integer' },
                    { name: 'subfamilia', type: 'string' },
                    { name: 'nombre', type: 'string' },
                    { name: 'nombre_l1', type: 'string' },
                    { name: 'nombre_l2', type: 'string' },
                    { name: 'publish', type: 'bool' }
                ],
                columns: [
                    { text: 'idrow', datafield: 'idrow', width: 50, filtertype: 'textbox', editable: false },
                    { text: 'Familia', datafield: 'subfamilia', width: 175, filtertype: 'input', editable: false },
                    { text: 'Descripción', datafield: 'nombre', width: 175, filtertype: 'input', editable: false },
                    { text: 'Descripción (ING)', datafield: 'nombre_l1', width: 175, filtertype: 'input', editable: false },
                    { text: 'Descripción (FR)', datafield: 'nombre_l2', width: 175, filtertype: 'input', editable: false },
                    { text: 'Publicar', datafield: 'publish', columntype: 'checkbox', filtertype: 'bool', width: 67 },
                ]
            }
            break;

        case 'composiciones':
            model = {
                datafields: [
                    { name: 'idrow', type: 'integer' },
                    { name: 'descripcion', type: 'string' },
                    { name: 'descripcion_l1', type: 'string' },
                    { name: 'descripcion_l2', type: 'string' },
                    { name: 'publish', type: 'bool' }
                ],
                columns: [
                    { text: 'idrow', datafield: 'idrow', width: 50, filtertype: 'textbox', editable: false },
                    { text: 'descripcion', datafield: 'descripcion', width: 175, filtertype: 'input', editable: false },
                    { text: 'descripcion_l1', datafield: 'descripcion_l1', width: 175, filtertype: 'input', editable: false },
                    { text: 'descripcion_l2', datafield: 'descripcion_l2', width: 175, filtertype: 'input', editable: false },
                    { text: 'Publicar', datafield: 'publish', columntype: 'checkbox', filtertype: 'bool', width: 67 },
                ]
            }
            break;

        case 'calidades':
            model = {
                datafields: [
                    { name: 'idrow', type: 'integer' },
                    { name: 'familia', type: 'string' },
                    { name: 'nombre', type: 'string' },
                    { name: 'nombre_l1', type: 'string' },
                    { name: 'nombre_l2', type: 'string' },
                    { name: 'publish', type: 'bool' }
                ],
                columns: [
                    { text: 'idrow', datafield: 'idrow', width: 60, filtertype: 'textbox', editable: false },
                    { text: 'familia', datafield: 'familia', width: 100, filtertype: 'input', editable: false },
                    { text: 'nombre', datafield: 'nombre', width: 175, filtertype: 'input', editable: false },
                    { text: 'nombre_l1', datafield: 'nombre_l1', width: 175, filtertype: 'input', editable: false },
                    { text: 'nombre_l2', datafield: 'nombre_l2', width: 175, filtertype: 'input', editable: false },
                    { text: 'Publicar', datafield: 'publish', columntype: 'checkbox', filtertype: 'bool', width: 67 },
                ]
            }
            break;

        case 'categorias':
            model = {
                datafields: [
                    { name: 'idrow', type: 'integer' },
                    { name: 'nombre', type: 'string' },
                    { name: 'nombre_l1', type: 'string' },
                    { name: 'nombre_l2', type: 'string' },
                    { name: 'publish', type: 'bool' }
                ],
                columns: [
                    { text: 'idrow', datafield: 'idrow', width: 50, filtertype: 'textbox', editable: false },
                    { text: 'nombre', datafield: 'nombre', width: 175, filtertype: 'input', editable: false },
                    { text: 'nombre_l1', datafield: 'nombre_l1', width: 175, filtertype: 'input', editable: false },
                    { text: 'nombre_l2', datafield: 'nombre_l2', width: 175, filtertype: 'input', editable: false },
                    { text: 'Publicar', datafield: 'publish', columntype: 'checkbox', filtertype: 'bool', width: 67 },
                ]
            }
            break;

        case 'categoriasm':
            model = {
                datafields: [
                    { name: 'idrow', type: 'integer' },
                    { name: 'nombre', type: 'string' },
                    { name: 'nombre_l1', type: 'string' },
                    { name: 'nombre_l2', type: 'string' },
                    { name: 'publish', type: 'bool' }
                ],
                columns: [
                    { text: 'idrow', datafield: 'idrow', width: 50, filtertype: 'textbox', editable: false },
                    { text: 'nombre', datafield: 'nombre', width: 175, filtertype: 'input', editable: false },
                    { text: 'nombre_l1', datafield: 'nombre_l1', width: 175, filtertype: 'input', editable: false },
                    { text: 'nombre_l2', datafield: 'nombre_l2', width: 175, filtertype: 'input', editable: false },
                    { text: 'Publicar', datafield: 'publish', columntype: 'checkbox', filtertype: 'bool', width: 67 },
                ]
            }
            break;


        case 'lineas':
            model = {
                datafields: [
                    { name: 'idrow', type: 'integer' },
                    { name: 'categoria', type: 'integer' },
                    { name: 'desccategoria', type: 'string' },
                    { name: 'nombre', type: 'string' },
                    { name: 'nombre_l1', type: 'string' },
                    { name: 'nombre_l2', type: 'string' },
                    { name: 'caracteristicas', type: 'string' },
                    { name: 'publish', type: 'bool' }
                ],
                columns: [
                    { text: 'idrow', datafield: 'idrow', width: 50, filtertype: 'textbox', editable: false },
                    { text: 'Categoria', datafield: 'desccategoria', width: 125, filtertype: 'input', editable: false },
                    { text: 'nombre', datafield: 'nombre', width: 400, filtertype: 'input', editable: false },
                    { text: 'nombre_l1', datafield: 'nombre_l1', width: 225, filtertype: 'input', editable: false, hidden: true },
                    { text: 'nombre_l2', datafield: 'nombre_l2', width: 225, filtertype: 'input', editable: false, hidden: true },
                    { text: 'Caracteristicas', datafield: 'caracteristicas', width: 600, filtertype: 'input', editable: false },
                    { text: 'Publicar', datafield: 'publish', columntype: 'checkbox', filtertype: 'bool', width: 67, hidden: true },
                ]
            }
            break;

        case 'sublineas':
            model = {
                datafields: [
                    { name: 'idrow', type: 'integer' },
                    { name: 'linea', type: 'integer' },
                    { name: 'desclinea', type: 'string' },
                    { name: 'nombre', type: 'string' },
                    { name: 'nombre_l1', type: 'string' },
                    { name: 'nombre_l2', type: 'string' },
                    { name: 'caracteristicas', type: 'string' },
                    { name: 'caracteristicas2', type: 'string' },
                    { name: 'categoria', type: 'string' },
                    { name: 'publish', type: 'bool' }
                ],
                columns: [
                    { text: 'Categoria', datafield: 'categoria', width: 125, filtertype: 'input', editable: false },
                    { text: 'idrow', datafield: 'idrow', width: 50, filtertype: 'textbox', editable: false },
                    { text: 'Linea', datafield: 'desclinea', width: 250, filtertype: 'input', editable: false },
                    { text: 'SubLinea', datafield: 'nombre', width: 350, filtertype: 'input', editable: false },
                    { text: 'caracteristicas 1 (min)', datafield: 'caracteristicas', width: 350, filtertype: 'input', editable: false },
                    { text: 'caracteristicas 2', datafield: 'caracteristicas2', width: 350, filtertype: 'input', editable: false },
                    { text: 'nombre_l1', datafield: 'nombre_l1', width: 175, filtertype: 'input', editable: false, hidden: true },
                    { text: 'nombre_l2', datafield: 'nombre_l2', width: 175, filtertype: 'input', editable: false, hidden: true },
                    { text: 'Publicar', datafield: 'publish', columntype: 'checkbox', filtertype: 'bool', width: 67, hidden: true }
                ]
            }
            break;

        case 'sublineas_lineas':
            model = {
                datafields: [
                    { name: 'idrow', type: 'integer' },
                    { name: 'categoria', type: 'string' },
                    { name: 'linea', type: 'integer' },
                    { name: 'desclinea', type: 'string' },
                    { name: 'sublinea', type: 'integer' },
                    { name: 'descsublinea', type: 'string' },
                    { name: 'nombre', type: 'string' },
                    { name: 'nombre_l1', type: 'string' },
                    { name: 'nombre_l2', type: 'string' },
                    { name: 'publish', type: 'bool' }
                ],
                columns: [
                    { text: 'idrow', datafield: 'idrow', width: 50, filtertype: 'textbox', editable: false },
                    { text: 'Categoría', datafield: 'categoria', width: 175, filtertype: 'input', editable: false },
                    { text: 'Linea', datafield: 'desclinea', width: 175, filtertype: 'input', editable: false },
                    { text: 'SubLinea', datafield: 'descsublinea', width: 175, filtertype: 'input', editable: false },
                    { text: 'nombre', datafield: 'nombre', width: 175, filtertype: 'input', editable: false },
                    { text: 'nombre_l1', datafield: 'nombre_l1', width: 175, filtertype: 'input', editable: false },
                    { text: 'nombre_l2', datafield: 'nombre_l2', width: 175, filtertype: 'input', editable: false },
                    { text: 'Publicar', datafield: 'publish', columntype: 'checkbox', filtertype: 'bool', width: 67 },
                ]
            }
            break;


        case 'articulos':
            model = {
                datafields: [
                    { name: 'idrow', type: 'integer' },
                    { name: 'descripcion', type: 'string' },
                    { name: 'web_descripcion', type: 'string' },
                    { name: 'web_descripcion_l1', type: 'string' },
                    { name: 'web_descripcion_l2', type: 'string' },
                    { name: 'categoria', type: 'integer' },
                    { name: 'ncategoria', type: 'string' },
                    { name: 'publish', type: 'bool' },
                    { name: 'agrupacion', type: 'string' },
                    { name: 'udsbolsa', type: 'integer' },
                    { name: 'udscaja', type: 'integer' },
                    { name: 'preciobolsa', type: 'string' },
                    { name: 'preciocaja', type: 'string' },
                    { name: 'queaportamos', type: 'string' },
                    { name: 'recomendado', type: 'string' },
                    { name: 'beneficios', type: 'string' },
                    { name: 'composicion_tecnica', type: 'string' },
                    { name: 'color', type: 'string' },
                    { name: 'descfamilia', type: 'string' },
                    { name: 'descsubfamilia', type: 'string' },
                    { name: 'desccalidad', type: 'string' },
                    { name: 'web_image_1', type: 'string' },
                    { name: 'fichatecnica', type: 'string' },
                    { name: 'talla', type: 'string' },
                    { name: 'tamano_l1', type: 'string' },
                    { name: 'tamano_l2', type: 'string' },
                    { name: 'tamano_l3', type: 'string' },
                    { name: 'referencia_l1', type: 'string' },
                    { name: 'referencia_l2', type: 'string' },
                    { name: 'referencia_l3', type: 'string' },
                    { name: 'composicion_l1', type: 'string' },
                    { name: 'composicion_l2', type: 'string' },
                    { name: 'composicion_l3', type: 'string' },
                    { name: 'linea', type: 'string' },
                    { name: 'sublinea', type: 'string' },
                    { name: 'sublinea2', type: 'string' },
                    { name: 'opcion', type: 'string' },
                    { name: 'caracteristicas', type: 'string' },
                    { name: 'c1', type: 'bool' },
                    { name: 'c2', type: 'bool' },
                    { name: 'c3', type: 'bool' },
                    { name: 'alias2', type: 'string' }
                ],
                columns: [
                    {
                        text: 'idrow', datafield: 'idrow', width: 50, filtertype: 'textbox', editable: false,
                        cellsrenderer: function (row: any, columnfield: any, value: any, defaulthtml: any, columnproperties: any, rowdata: any) {
                            const agrupacion = rowdata.idrow;
                            return '<span style="width:80;margin: 4px;cursor:hand"><a target="_blank" href="/#/routes/master/preview/' + agrupacion + '"> ' + value + '</a></span>';
                        }
                    },
                    { text: 'Familia', datafield: 'descfamilia', width: 100, filtertype: 'input', editable: false, hidden: true },
                    { text: 'SubFamilia', datafield: 'descsubfamilia', width: 100, filtertype: 'input', editable: false, hidden: true },
                    { text: 'descripcion', datafield: 'descripcion', width: 175, filtertype: 'input', editable: false, hidden: true },
                    {
                        text: 'Imagen', datafield: 'web_image_1', width: 80,
                        cellsrenderer: function (row: any, columnfield: any, value: any, defaulthtml: any, columnproperties: any, rowdata: any) {
                            return '<span style="width:80;margin: 4px;cursor:hand">' + value + '</span>';
                        }
                    },
                    {
                        text: 'Ficha', datafield: 'fichatecnica', width: 80,
                        cellsrenderer: function (row: any, columnfield: any, value: any, defaulthtml: any, columnproperties: any, rowdata: any) {
                            return '<span style="width:80;margin: 4px;cursor:hand">' + value + '</span>';
                        }
                    },
                    { text: 'Pub', datafield: 'publish', columntype: 'checkbox', filtertype: 'bool', width: 40 },
                    { text: 'Alias', datafield: 'agrupacion', width: 80, filtertype: 'input', editable: false },
                    { text: 'Alias2', datafield: 'alias2', width: 80, filtertype: 'input', editable: false },
                    { text: 'Color', datafield: 'color', width: 70, filtertype: 'input', editable: false },
                    { text: 'Calidad', datafield: 'desccalidad', width: 100, filtertype: 'input', editable: false, hidden: true },
                    { text: 'web_descripcion', datafield: 'web_descripcion', width: 200, filtertype: 'input', editable: false },
                    { text: 'web_descripcion_l1', datafield: 'web_descripcion_l1', width: 175, filtertype: 'input', editable: false, hidden: true },
                    { text: 'web_descripcion_l2', datafield: 'web_descripcion_l2', width: 175, filtertype: 'input', editable: false, hidden: true },
                    { text: 'Linea', datafield: 'linea', width: 200, filtertype: 'input', editable: false },
                    { text: 'SubLinea', datafield: 'sublinea', width: 200, filtertype: 'input', editable: false },
                    { text: 'Opcion', datafield: 'opcion', width: 200, filtertype: 'input', editable: false },
                    { text: 'SubLinea2', datafield: 'sublinea2', width: 200, filtertype: 'input', editable: false },

                    { text: 'Ud.Ca', datafield: 'udscaja', width: 70, filtertype: 'input', editable: false, cellsalign: 'center', hidden: true },
                    { text: 'Ud Bol', datafield: 'udsbolsa', width: 50, filtertype: 'input', editable: false, cellsalign: 'center', hidden: true },
                    { text: '€/Bol', datafield: 'preciobolsa', width: 50, filtertype: 'input', editable: false, cellsalign: 'center', hidden: true },
                    { text: '€/Caj', datafield: 'preciocaja', width: 50, filtertype: 'input', editable: false, cellsalign: 'center', hidden: true },
                    { text: 'Que Aportamos', datafield: 'queaportamos', width: 200, filtertype: 'input', editable: false, hidden: true },
                    { text: 'Recomendado', datafield: 'recomendado', width: 200, filtertype: 'input', editable: false, hidden: true },
                    { text: 'Beneficios', datafield: 'beneficios', width: 200, filtertype: 'input', editable: false, hidden: true },
                    { text: 'composicion_tecnica', datafield: 'composicion_tecnica', width: 200, filtertype: 'input', editable: false, hidden: true },
                    { text: 'tamaño', datafield: 'talla', width: 100, filtertype: 'input', editable: false, hidden: true },

                    { text: 'Referencia(ES)', datafield: 'referencia_l1', width: 100, filtertype: 'input', editable: false, hidden: true },
                    { text: 'Referencia(EN)', datafield: 'referencia_l2', width: 100, filtertype: 'input', editable: false, hidden: true },
                    { text: 'Referencia(FR)', datafield: 'referencia_l3', width: 100, filtertype: 'input', editable: false, hidden: true },
                    { text: 'Composición(ES)', datafield: 'composicion_l1', width: 100, filtertype: 'input', editable: false, hidden: true },
                    { text: 'Composición(EN)', datafield: 'composicion_l2', width: 100, filtertype: 'input', editable: false, hidden: true },
                    { text: 'Composición(FR)', datafield: 'composicion_l3', width: 100, filtertype: 'input', editable: false, hidden: true },

                    { text: 'Características', datafield: 'caracteristicas', width: 200, filtertype: 'input', editable: false },
                    { text: 'c1', datafield: 'c1', columntype: 'checkbox', filtertype: 'bool', width: 40 },
                    { text: 'c2', datafield: 'c2', columntype: 'checkbox', filtertype: 'bool', width: 40 },
                    { text: 'c3', datafield: 'c3', columntype: 'checkbox', filtertype: 'bool', width: 40 }


                ]
            }
            break;


        case 'usuarios':
            model = {
                datafields: [
                    { name: 'idrow', type: 'integer' },
                    { name: 'name', type: 'string' },
                    { name: 'surname', type: 'string' },
                    { name: 'email', type: 'string' },
                    { name: 'password', type: 'string' },
                    { name: 'descempresa', type: 'string' },
                    { name: 'descsubempresa', type: 'string' },
                    { name: 'empresa', type: 'number' },
                    { name: 'subempresa', type: 'number' },
                    { name: 'ambito', type: 'string' }
                ],
                columns: [
                    { text: 'Nombre', datafield: 'name', width: 150, filtertype: 'input', editable: false },
                    { text: 'Apellidos', datafield: 'surname', width: 150, filtertype: 'input', editable: false },
                    { text: 'email', datafield: 'email', width: 300, filtertype: 'input', editable: false },
                    { text: 'ambito', datafield: 'ambito', width: 100, filtertype: 'input', editable: false },
                    { text: 'Empresa', datafield: 'descempresa', width: 150, filtertype: 'list', editable: false },
                    { text: 'Tienda', datafield: 'descsubempresa', width: 150, filtertype: 'input', editable: false },

                ]
            }
            break;

        case 'clientes':
            model = {
                datafields: [
                    { name: 'id', type: 'int' },
                    { name: 'idEntrega', type: 'int' },
                    { name: 'descTipoWeb', type: 'string' },
                    { name: 'descEstado', type: 'string' },
                    { name: 'numero', type: 'string' },
                    { name: 'nombre', type: 'string' },
                    { name: 'poblacion', type: 'string' },
                    { name: 'telefono', type: 'string' },
                    { name: 'cif', type: 'string' },
                    { name: 'codpostal', type: 'string' },
                    { name: 'ccuenta', type: 'string' },
                    { name: 'nombrepais', type: 'string' },
                    { name: 'provfiscal', type: 'string' },
                    { name: 'nomcomercial', type: 'string' },
                    { name: 'alta', type: 'date' },
                    { name: 'email', type: 'string' }
                ],
                columns: [
                    { text: 'id', dataField: 'id', width: 60, filtertype: 'number', groupable: false, pinned: true },
                    { text: 'idEnt', dataField: 'idEntrega', width: 60, filtertype: 'number', groupable: false, pinned: true },
                    { text: 'Web', dataField: 'descTipoWeb', width: 125, filtertype: 'input', groupable: true, pinned: true },
                    { text: 'Estado', dataField: 'descEstado', width: 100, filtertype: 'textbox' },
                    { text: 'Num', dataField: 'numero', width: 65, filtertype: 'textbox' },
                    { text: 'Nombre', dataField: 'nombre', width: 200, filtertype: 'textbox' },
                    { text: 'NomCom', dataField: 'nomcomercial', width: 150, filtertype: 'textbox' },
                    { text: 'Población', dataField: 'poblacion', width: 100, filtertype: 'textbox' },
                    { text: 'Teléfono', dataField: 'telefono', width: 90, filtertype: 'textbox' },
                    { text: 'CIF', dataField: 'cif', width: 85, filtertype: 'textbox' },
                    { text: 'C.P.', dataField: 'codpostal', width: 50, filtertype: 'textbox' },
                    { text: 'Cuenta', dataField: 'ccuenta', width: 80, filtertype: 'textbox' },
                    { text: 'País', dataField: 'nombrepais', width: 60, filtertype: 'checkedlist' },
                    { text: 'Provincia', dataField: 'provfiscal', width: 100, filtertype: 'textbox' },
                    { text: 'email', dataField: 'email', width: 200, filtertype: 'textbox' },
                    { text: 'alta', dataField: 'alta', width: 120, filtertype: 'textbox', cellsformat: 'dd/MM/yyyy hh:mm:ss', groupable: false }
                ]
            }
            break;

        case 'sm_clientes':
            model = {
                datafields: [
                    { name: 'idrow', type: 'int' },
                    { name: 'percon', type: 'string' },
                    { name: 'tfno1', type: 'string' },
                    { name: 'tfno2', type: 'string' },
                    { name: 'fax', type: 'string' },
                    { name: 'email', type: 'string' },
                    { name: 'movil', type: 'string' },
                    { name: 'habitual', type: 'string' },
                    { name: 'nombre', type: 'string' },
                    { name: 'razon_social', type: 'string' },
                    { name: 'dir', type: 'string' },
                    { name: 'codpos', type: 'string' },
                    { name: 'pob', type: 'string' },
                    { name: 'prv', type: 'string' },
                    { name: 'cif', type: 'string' },
                    { name: 'agente', type: 'string' },
                    { name: 'tag', type: 'string' },
                    { name: 'codigo', type: 'string' },
                    { name: 'importacion', type: 'date' }

                ],
                columns: [
                    { text: 'id', dataField: 'idrow', width: 60, filtertype: 'number', groupable: false, pinned: true },
                    { text: 'Nombre', dataField: 'nombre', width: 200, filtertype: 'textbox', groupable: true, pinned: true },
                    { text: 'Razon Social', dataField: 'razon_social', width: 200, filtertype: 'textbox', groupable: true, pinned: true },
                    { text: 'Codigo', dataField: 'tag', width: 80, filtertype: 'textbox', cellsalign: 'center' },
                    { text: 'Cif', dataField: 'cif', width: 90, filtertype: 'textbox', groupable: true, pinned: true },
                    { text: 'Contacto', dataField: 'percon', width: 175, filtertype: 'input', groupable: true },
                    { text: 'Tfno1', dataField: 'tfno1', width: 100, filtertype: 'textbox' },
                    { text: 'Tfno2', dataField: 'tfno2', width: 100, filtertype: 'textbox' },
                    { text: 'Fax', dataField: 'fax', width: 100, filtertype: 'textbox' },
                    { text: 'Email', dataField: 'email', width: 200, filtertype: 'textbox' },
                    { text: 'Movil', dataField: 'movil', width: 100, filtertype: 'textbox' },
                    { text: 'Habitual', dataField: 'habitual', width: 90, filtertype: 'textbox' },
                    { text: 'Dir', dataField: 'dir', width: 80, filtertype: 'textbox' },
                    { text: 'CodPos', dataField: 'codpos', width: 60, filtertype: 'textbox' },
                    { text: 'Poblacion', dataField: 'pob', width: 125, filtertype: 'textbox' },
                    { text: 'Provincia', dataField: 'prv', width: 125, filtertype: 'textbox' },
                    { text: 'Agente', dataField: 'agente', width: 250, filtertype: 'textbox' },
                    { text: 'Fec.Import', dataField: 'importacion', width: 125, filtertype: 'date', cellsformat: "dd/MM/yyyy" }
                ]
            }
            break;

        case 'tarifas':
            model = {
                datafields: [
                    { name: 'articulo', type: 'number' },
                    { name: 'descripcion', type: 'string' },
                    { name: 'uds_bolsa', type: 'string' },
                    { name: 'uds_caja', type: 'string' },
                    { name: 'precio_ud_bolsa', type: 'string' },
                    { name: 'precio_ud_caja', type: 'string' },
                    { name: 'modif', type: 'string' }
                ],
                columns: [
                    { text: 'id', datafield: 'articulo', width: 50, editable: false },
                    { text: 'Descripción', datafield: 'descripcion', width: 500, filtertype: 'input', editable: false },
                    { text: 'Uds Bolsa', datafield: 'uds_bolsa', width: 100, filtertype: 'input', editable: false, cellsalign: 'center' },
                    { text: 'Uds Caja', datafield: 'uds_caja', width: 100, filtertype: 'input', editable: false, cellsalign: 'center' },
                    { text: 'Precio Bolsa', datafield: 'precio_ud_bolsa', width: 100, filtertype: 'input', editable: false, cellsalign: 'center' },
                    { text: 'Precio Caja', datafield: 'precio_ud_caja', width: 100, filtertype: 'input', editable: false, cellsalign: 'center' },
                    { text: 'Modif', datafield: 'modif', width: 100, editable: false }
                ]
            }
            break;

        case 'tarifasV2':
            model = {
                datafields: [
                    { name: 'descCategoria', type: 'string' },
                    { name: 'nomfiscal', type: 'string' },
                    { name: 'nombre', type: 'string' },
                    { name: 'articulo', type: 'number' },
                    { name: 'descripcion', type: 'string' },
                    { name: 'c1', type: 'number' },
                    { name: 'c2', type: 'number' },
                    { name: 'precio', type: 'number' },
                    { name: 'descunidad', type: 'string' },
                    { name: 'dto1', type: 'number' },
                    { name: 'dto2', type: 'number' },
                    { name: 'modif', type: 'string' },
                    { name: 'alias', type: 'string' }
                ],
                columns: [
                    { text: 'Categoria', datafield: 'descCategoria', width: 100, filtertype: 'input', editable: false },
                    { text: 'Cliente', datafield: 'nomfiscal', width: 100, filtertype: 'input', editable: false },
                    { text: 'Entrega', datafield: 'nombre', width: 100, filtertype: 'input', editable: false },
                    { text: 'Alias', datafield: 'alias', width: 50, editable: false },
                    { text: 'Descripción', datafield: 'descripcion', width: 500, filtertype: 'input', editable: false },
                    { text: 'Desde', datafield: 'c1', width: 70, filtertype: 'input', editable: false, cellsalign: 'center' },
                    { text: 'Hasta', datafield: 'c2', width: 70, filtertype: 'input', editable: false, cellsalign: 'center' },
                    { text: 'Precio', datafield: 'precio', width: 80, filtertype: 'input', editable: false, cellsalign: 'right' },
                    { text: 'Unidad', datafield: 'descunidad', width: 80, filtertype: 'input', editable: false, cellsalign: 'center' },
                    { text: 'Dto1', datafield: 'dto1', width: 60, filtertype: 'input', editable: false, cellsalign: 'center' },
                    { text: 'Dto2', datafield: 'dto2', width: 60, filtertype: 'input', editable: false, cellsalign: 'center' },
                    { text: 'Modif', datafield: 'modif', width: 100, editable: false }
                ]
            }
            break;

        case 'sm_tejidos':
            model = {
                datafields: [
                    { name: 'idrow', type: 'integer' },
                    { name: 'descripcion', type: 'string' },
                    { name: 'opacidad', type: 'string' },
                    { name: 'info_tecnica', type: 'string' },
                    { name: 'uso_recomendado', type: 'string' },
                    { name: 'coste', type: 'number' },
                    { name: 'criterio', type: 'number' },
                    { name: 'coste3', type: 'number' },
                    { name: 'criterio3', type: 'number' },
                    { name: 'coste4', type: 'number' },
                    { name: 'criterio4', type: 'number' },
                    { name: 'densidad', type: 'number' },
                    { name: 'tarifa', type: 'string' }

                ],
                columns: [
                    { text: 'descripcion', datafield: 'descripcion', width: 250, filtertype: 'input', editable: false },
                    {
                        text: 'Coste m2', datafield: 'coste', width: 70, filtertype: 'textbox', editable: true, cellsalign: 'center',
                        cellsformat: 'd2', columntype: 'numberinput', createeditor: decimal2Value, columngroup: 'Enrollables'
                    },
                    { text: 'Criterio', datafield: 'criterio', width: 60, filtertype: 'textbox', editable: true, cellsalign: 'center', columntype: 'numberinput', createeditor: IntValue, columngroup: 'Enrollables' },
                    {
                        text: 'Coste mL', datafield: 'coste3', width: 70, filtertype: 'textbox', editable: true, cellsalign: 'center',
                        cellsformat: 'd2', columntype: 'numberinput', createeditor: decimal2Value, columngroup: 'Verticales'
                    },
                    { text: 'Criterio', datafield: 'criterio3', width: 60, filtertype: 'textbox', editable: true, cellsalign: 'center', columntype: 'numberinput', createeditor: IntValue, columngroup: 'Verticales' },
                    {
                        text: 'Coste mL', datafield: 'coste4', width: 70, filtertype: 'textbox', editable: true, cellsalign: 'center',
                        cellsformat: 'd2', columntype: 'numberinput', createeditor: decimal2Value, columngroup: 'Linea Blanca'
                    },
                    { text: 'Criterio', datafield: 'criterio4', width: 60, filtertype: 'textbox', editable: true, cellsalign: 'center', columntype: 'numberinput', createeditor: IntValue, columngroup: 'Linea Blanca' },
                    {
                        text: 'Densidad', datafield: 'densidad', width: 70, filtertype: 'textbox', editable: true, cellsalign: 'center',
                        cellsformat: 'd2', columntype: 'numberinput', createeditor: decimal2Value
                    },
                    { text: 'opacidad', datafield: 'opacidad', width: 150, filtertype: 'input', editable: false },
                    { text: 'tarifa', datafield: 'tarifa', width: 150, filtertype: 'input', editable: false },
                    { text: 'info_tecnica', datafield: 'info_tecnica', filtertype: 'input', editable: false },
                    { text: 'uso_recomendado', datafield: 'uso_recomendado', width: 200, filtertype: 'input', editable: false },

                ],
                columngroups:
                    [
                        { text: 'Enrollables', align: 'center', name: 'Enrollables' },
                        { text: 'Verticales', align: 'center', name: 'Verticales' },
                        { text: 'Linea Blanca', align: 'center', name: 'Linea Blanca' },

                    ]
            }
            break;

        case 'sm_accionamientos':
            model = {
                datafields: [
                    { name: 'idrow', type: 'integer' },
                    { name: 'descripcion', type: 'string' },

                ],
                columns: [
                    { text: 'idrow', datafield: 'idrow', width: 50, filtertype: 'textbox', editable: false },
                    { text: 'descripcion', datafield: 'descripcion', width: 250, filtertype: 'input', editable: false },


                ]
            }
            break;

        case 'sm_accionamientosmapa':
            model = {
                datafields: [
                    { name: 'idrow', type: 'integer' },
                    { name: 'tipo', type: 'string' },
                    { name: 'accionamiento', type: 'string' },
                    { name: 'descripcion', type: 'string' },
                    { name: 'NomFiscal', type: 'string' },
                    { name: 'descproducto', type: 'string' },
                    { name: 'cliente_permissions', type: 'string' },
                    { name: 'Grupo', type: 'string' },
                    { name: 'Tag', type: 'string' },
                ],
                columns: [
                    { text: 'idrow', datafield: 'idrow', width: 50, filtertype: 'textbox', hidden: false, editable: false },
                    { text: 'Producto', datafield: 'descproducto', width: 125, filtertype: 'input', editable: false },
                    { text: 'Accionamiento', datafield: 'tipo', width: 100, filtertype: 'input', editable: false },
                    { text: 'Modelo', datafield: 'accionamiento', width: 150, filtertype: 'input', editable: false },
                    { text: 'Color/Modelo', datafield: 'descripcion', width: 150, filtertype: 'input', editable: false },
                    { text: 'Cliente', datafield: 'NomFiscal', width: 150, filtertype: 'input', editable: false },
                    { text: 'Grupo', datafield: 'Grupo', width: 150, filtertype: 'input', editable: false },
                    { text: 'Permisos Cliente V2', datafield: 'cliente_permissions', width: 450, filtertype: 'input', editable: false, hidden: true },
                    { text: 'Tag', datafield: 'Tag', width: 175, filtertype: 'textbox', editable: false, hidden: true },

                ]
            }
            break;

        case 'sm_coloresmarcas':
            model = {
                datafields: [
                    { name: 'idrow', type: 'integer' },
                    { name: 'descripcion', type: 'string' },
                    { name: 'tipo', type: 'string' },
                    { name: 'codigo_48', type: 'string' },
                    { name: 'impresiondigital', type: 'string' },
                    { name: 'Bloqueo', type: 'bool' }
                ],
                columns: [
                    { text: 'idrow', datafield: 'idrow', width: 50, filtertype: 'textbox', editable: false },
                    { text: 'tipo', datafield: 'tipo', width: 150, filtertype: 'input', editable: false },
                    { text: 'descripcion', datafield: 'descripcion', width: 250, filtertype: 'input', editable: true },
                    { text: 'Código 48', datafield: 'codigo_48', width: 150, filtertype: 'input', editable: true },
                    { text: 'Impresión Digital', datafield: 'impresiondigital', width: 200, filtertype: 'input', editable: false },
                    { text: 'Bloqueado', datafield: 'Bloqueo', columntype: 'checkbox', filtertype: 'bool', width: 70 },
                ]
            }
            break;


        case 'sm_contrapesos':
            model = {
                datafields: [
                    { name: 'idrow', type: 'integer' },
                    { name: 'descripcion', type: 'string' },
                    { name: 'grupo', type: 'integer' },
                    { name: 'desgrupo', type: 'string' },
                ],
                columns: [
                    { text: 'idrow', datafield: 'idrow', width: 50, filtertype: 'textbox', editable: false },
                    { text: 'descripcion', datafield: 'descripcion', width: 250, filtertype: 'input', editable: false },
                    { text: 'grupo', datafield: 'grupo', width: 50, filtertype: 'textbox', editable: false },
                    { text: 'Nombre grupo', datafield: 'desgrupo', width: 250, filtertype: 'input', editable: false },

                ]
            }
            break;

        case 'sm_soportes':
            model = {
                datafields: [
                    { name: 'idrow', type: 'integer' },
                    { name: 'descripcion', type: 'string' },
                    { name: 'grupo', type: 'integer' },
                    { name: 'desgrupo', type: 'string' },
                ],
                columns: [
                    { text: 'idrow', datafield: 'idrow', width: 50, filtertype: 'textbox', editable: false },
                    { text: 'descripcion', datafield: 'descripcion', width: 250, filtertype: 'input', editable: false },
                    { text: 'grupo', datafield: 'grupo', width: 50, filtertype: 'textbox', editable: false },
                    { text: 'Nombre grupo', datafield: 'desgrupo', width: 250, filtertype: 'input', editable: false },

                ]
            }
            break;

        case 'sm_tapas':
            model = {
                datafields: [
                    { name: 'idrow', type: 'integer' },
                    { name: 'descripcion', type: 'string' },
                    { name: 'grupo', type: 'integer' },
                    { name: 'desgrupo', type: 'string' },
                ],
                columns: [
                    { text: 'idrow', datafield: 'idrow', width: 50, filtertype: 'textbox', editable: false },
                    { text: 'descripcion', datafield: 'descripcion', width: 250, filtertype: 'input', editable: false },
                    { text: 'grupo', datafield: 'grupo', width: 50, filtertype: 'textbox', editable: false },
                    { text: 'Nombre grupo', datafield: 'desgrupo', width: 250, filtertype: 'input', editable: false },

                ]
            }
            break;

        case 'sm_tubos':
            model = {
                datafields: [
                    { name: 'idrow', type: 'integer' },
                    { name: 'descripcion', type: 'string' },
                    { name: 'anchomax', type: 'string' },
                    { name: 'articulos', type: 'string' },
                ],
                columns: [
                    { text: 'idrow', datafield: 'idrow', width: 50, filtertype: 'textbox', editable: false },
                    { text: 'descripcion', datafield: 'descripcion', width: 250, filtertype: 'input', editable: false },
                    { text: 'Anc.Máximo', datafield: 'anchomax', width: 100, filtertype: 'input', editable: false },
                    { text: 'Articulos', datafield: 'articulos', width: 550, filtertype: 'input', editable: false },

                ]
            }
            break;

        case 'sm_embalajes':
            model = {
                datafields: [
                    { name: 'idrow', type: 'integer' },
                    { name: 'descripcion', type: 'string' },
                ],
                columns: [
                    { text: 'idrow', datafield: 'idrow', width: 50, filtertype: 'textbox', editable: false },
                    { text: 'descripcion', datafield: 'descripcion', width: 250, filtertype: 'input', editable: false },

                ]
            }
            break;

        case 'sm_empaquetados':
            model = {
                datafields: [
                    { name: 'idrow', type: 'integer' },
                    { name: 'descripcion', type: 'string' },
                ],
                columns: [
                    { text: 'idrow', datafield: 'idrow', width: 50, filtertype: 'textbox', editable: false },
                    { text: 'descripcion', datafield: 'descripcion', width: 250, filtertype: 'input', editable: false },

                ]
            }
            break;

        case 'sm_instalaciones':
            model = {
                datafields: [
                    { name: 'idrow', type: 'integer' },
                    { name: 'descripcion', type: 'string' },
                ],
                columns: [
                    { text: 'idrow', datafield: 'idrow', width: 50, filtertype: 'textbox', editable: false },
                    { text: 'descripcion', datafield: 'descripcion', width: 250, filtertype: 'input', editable: false },

                ]
            }
            break;

        case 'sm_posicionmando':
            model = {
                datafields: [
                    { name: 'idrow', type: 'integer' },
                    { name: 'descripcion', type: 'string' },
                    { name: 'articulos', type: 'string' },
                ],
                columns: [
                    { text: 'idrow', datafield: 'idrow', width: 50, filtertype: 'textbox', editable: false },
                    { text: 'descripcion', datafield: 'descripcion', width: 200, filtertype: 'input', editable: false },
                    { text: 'articulos', datafield: 'articulos', width: 450, filtertype: 'input', editable: false },

                ]
            }
            break;

        case 'sm_clientesapi':
            model = {
                datafields: [
                    { name: 'idrow', type: 'integer' },
                    { name: 'descripcion', type: 'string' },
                    { name: 'C1_Comercial', type: 'number' },
                    { name: 'C2_Rappel', type: 'number' },
                    { name: 'C3_Publicidad', type: 'number' },
                    { name: 'C4_ProntoPago', type: 'number' },
                    { name: 'Mar_Cliente', type: 'number' },
                    { name: 'Mar_Acc', type: 'number' },
                    { name: 'Mar_Mec', type: 'number' },
                    { name: 'Mar_Tejido', type: 'number' },
                ],
                columns: [
                    { text: 'idrow', datafield: 'idrow', width: 50, filtertype: 'textbox', editable: false, columngroup: 'Cliente' },
                    { text: 'descripcion', datafield: 'descripcion', filtertype: 'input', editable: false, columngroup: 'Cliente' },
                    { text: '%Dto.Com', datafield: 'C1_Comercial', width: 80, filtertype: 'input', editable: true, columntype: 'numberinput', createeditor: decimal2Value, columngroup: 'Margenes', cellsalign: 'center' },
                    { text: '%Rappel', datafield: 'C2_Rappel', width: 80, filtertype: 'input', editable: true, columntype: 'numberinput', createeditor: decimal2Value, columngroup: 'Margenes', cellsalign: 'center' },
                    { text: '%Publi', datafield: 'C3_Publicidad', width: 80, filtertype: 'input', editable: true, columntype: 'numberinput', createeditor: decimal2Value, columngroup: 'Margenes', cellsalign: 'center' },
                    { text: '%P.Pago', datafield: 'C4_ProntoPago', width: 80, filtertype: 'input', editable: true, columntype: 'numberinput', createeditor: decimal2Value, columngroup: 'Margenes', cellsalign: 'center' },

                    { text: 'Mar.Cli', datafield: 'Mar_Cliente', width: 70, filtertype: 'input', editable: true, columntype: 'numberinput', createeditor: decimal2Value, columngroup: 'Margenes', cellsalign: 'center', hidden: true },
                    { text: 'Mar.Acc', datafield: 'Mar_Acc', width: 70, filtertype: 'input', editable: true, columntype: 'numberinput', createeditor: decimal2Value, columngroup: 'Margenes', cellsalign: 'center', hidden: true },
                    { text: 'Mar.Mec', datafield: 'Mar_Mec', width: 70, filtertype: 'input', editable: true, columntype: 'numberinput', createeditor: decimal2Value, columngroup: 'Margenes', cellsalign: 'center', hidden: true },
                    { text: 'Mar.Tej', datafield: 'Mar_Tejido', width: 70, filtertype: 'input', editable: true, columntype: 'numberinput', createeditor: decimal2Value, columngroup: 'Margenes', cellsalign: 'center', hidden: true }
                ],
                columngroups:
                    [
                        { text: 'Datos Cliente', align: 'center', name: 'Cliente' },
                        { text: 'Configuración Descuentos', align: 'center', name: 'Margenes' },
                    ]
            }
            break;

        case 'sm_tejidosclientes':
            model = {
                datafields: [
                    { name: 'idrow', type: 'integer' },
                    { name: 'cliente', type: 'string' },
                    { name: 'descripcion', type: 'string' },
                    { name: 'traduccion', type: 'string' },
                    { name: 'c1', type: 'number' },
                    { name: 'c2', type: 'number' },
                    { name: 'c3', type: 'number' },
                    { name: 'desctarifa', type: 'string' },
                ],
                columns: [
                    { text: 'idrow', datafield: 'idrow', width: 50, filtertype: 'textbox', editable: false },
                    { text: 'cliente', datafield: 'cliente', width: 250, filtertype: 'checkedlist', editable: false },
                    { text: 'descripcion', datafield: 'descripcion', width: 250, filtertype: 'input', editable: false },
                    { text: 'traduccion', datafield: 'traduccion', width: 250, filtertype: 'input', editable: false },
                    { text: 'C1', datafield: 'c1', width: 50, filtertype: 'textbox', editable: false },
                    { text: 'C2', datafield: 'c2', width: 50, filtertype: 'textbox', editable: false },
                    { text: 'C3', datafield: 'c3', width: 50, filtertype: 'textbox', editable: false },
                    {
                        text: 'Tarifa', datafield: 'desctarifa', filtertype: 'textbox', editable: true,
                        columntype: 'dropdownlist'
                    }
                ]
            }
            break;

        case 'sm_estancias':
            model = {
                datafields: [
                    { name: 'idrow', type: 'integer' },
                    { name: 'descripcion', type: 'string' },
                ],
                columns: [
                    { text: 'idrow', datafield: 'idrow', width: 50, filtertype: 'textbox', editable: false },
                    { text: 'descripcion', datafield: 'descripcion', width: 250, filtertype: 'input', editable: false },

                ]
            }
            break;


        case 'sm_promociones':
            model = {
                datafields: [
                    { name: 'idrow', type: 'integer' },
                    { name: 'descripcion', type: 'string' },
                    { name: 'promocion_coeficiente', type: 'number' },
                    { name: 'promocion_coeficiente2', type: 'number' },
                    { name: 'promocion_activa', type: 'number' },
                    { name: 'promocion_modificapvp', type: 'integer' },
                    { name: 'promocion_modificapvc', type: 'integer' },
                    { name: 'desde', type: 'date' },
                    { name: 'hasta', type: 'date' },
                    { name: 'promocion_mensaje', type: 'string' },
                ],
                columns: [
                    { text: 'idrow', datafield: 'idrow', width: 50, filtertype: 'textbox', editable: false },
                    { text: 'descripcion', datafield: 'descripcion', width: 450, filtertype: 'input', editable: false },
                    { text: 'Coeficiente', datafield: 'promocion_coeficiente', width: 50, filtertype: 'textbox', editable: false },
                    { text: 'Coeficiente', datafield: 'promocion_coeficiente2', width: 50, filtertype: 'textbox', editable: false },
                    { text: 'Activa', datafield: 'promocion_activa', width: 50, filtertype: 'textbox', editable: false },
                    { text: 'Modif.PVP', datafield: 'promocion_modificapvp', width: 50, filtertype: 'textbox', editable: false },
                    { text: 'Modif.PVC', datafield: 'promocion_modificapvc', width: 50, filtertype: 'textbox', editable: false },
                    { text: 'Desde', datafield: 'desde', width: 100, filtertype: 'textbox', editable: false, cellsformat: "dd/MM/yyyy" },
                    { text: 'Hasta', datafield: 'hasta', width: 100, filtertype: 'textbox', editable: false, cellsformat: "dd/MM/yyyy" },
                    { text: 'Mensaje', datafield: 'promocion_mensaje', width: 450, filtertype: 'input', editable: false },

                ]
            }
            break;

        case 'nh_stock':
            model = {
                datafields: [
                    { name: 'id', type: 'integer' },
                    { name: 'descripcion', type: 'string' },
                    { name: 'stock', type: 'integer' },
                ],
                columns: [
                    { text: 'id', datafield: 'id', width: 50, filtertype: 'textbox', editable: false },
                    { text: 'descripcion', datafield: 'descripcion', width: 550, filtertype: 'input', editable: false },
                    { text: 'stock', datafield: 'stock', width: 50, filtertype: 'textbox', editable: false, cellsalign: 'center' },

                ]
            }
            break;

        case 'sm_coloresclientes':
            model = {
                datafields: [
                    { name: 'idrow', type: 'integer' },
                    { name: 'cliente', type: 'integer' },
                    { name: 'descCliente', type: 'string' },
                    { name: 'tejido', type: 'integer' },
                    { name: 'descTejido', type: 'string' },
                    { name: 'color', type: 'integer' },
                    { name: 'descripcion', type: 'string' },
                    { name: 'traduccion', type: 'string' }
                ],
                columns: [

                    { text: 'id', datafield: 'idrow', width: 50, filtertype: 'textbox', editable: false },
                    { text: 'Cliente', datafield: 'descCliente', width: 150, filtertype: 'input', editable: false },
                    { text: 'Tejido', datafield: 'descTejido', width: 150, filtertype: 'textbox', editable: false },
                    { text: 'Color', datafield: 'descripcion', width: 175, filtertype: 'textbox', editable: false },
                    { text: 'Traduccion', datafield: 'traduccion', width: 175, filtertype: 'textbox', editable: false },

                ]
            }
            break;

        case 'sm_accionamientosclientes':
            model = {
                datafields: [
                    { name: 'idrow', type: 'integer' },
                    { name: 'descCliente', type: 'string' },
                    { name: 'descripcion', type: 'string' },
                    { name: 'producto', type: 'integer' },
                    { name: 'Nproducto', type: 'string' },
                ],
                columns: [

                    { text: 'id', datafield: 'idrow', width: 50, filtertype: 'textbox', editable: false },
                    { text: 'Cliente', datafield: 'descCliente', width: 175, filtertype: 'input', editable: false },
                    { text: 'Accionamiento', datafield: 'descripcion', width: 175, filtertype: 'textbox', editable: false },
                    { text: 'Producto', datafield: 'producto', width: 50, filtertype: 'textbox', editable: false },
                    { text: 'Descripción', datafield: 'Nproducto', width: 175, filtertype: 'input', editable: false },

                ]
            }
            break;


        case 'sm_accionamientosmarcasclientes':
            model = {
                datafields: [
                    { name: 'id', type: 'integer' },
                    { name: 'iddel', type: 'integer' },
                    { name: 'idrow', type: 'integer' },
                    { name: 'cliente', type: 'integer' },
                    { name: 'Accionamiento', type: 'string' },
                    { name: 'descCliente', type: 'string' },
                    { name: 'Tipo', type: 'string' },
                    { name: 'TipoCliente', type: 'string' },
                    { name: 'producto', type: 'integer' },
                    { name: 'Nproducto', type: 'string' },
                ],
                columns: [

                    { text: 'id', datafield: 'iddel', width: 50, filtertype: 'textbox', editable: false },
                    { text: 'idrow', datafield: 'idrow', width: 50, filtertype: 'textbox', editable: false },
                    { text: 'Accionamiento', datafield: 'Accionamiento', width: 175, filtertype: 'textbox', editable: false },
                    { text: 'Cliente', datafield: 'cliente', width: 50, filtertype: 'textbox', editable: false },
                    { text: 'Nombre', datafield: 'descCliente', width: 175, filtertype: 'input', editable: false },
                    { text: 'Producto', datafield: 'producto', width: 50, filtertype: 'textbox', editable: false },
                    { text: 'Descripción', datafield: 'Nproducto', width: 175, filtertype: 'input', editable: false },

                    { text: 'Tipo', datafield: 'Tipo', width: 175, filtertype: 'textbox', editable: false },
                    { text: 'Traducción', datafield: 'TipoCliente', width: 175, filtertype: 'textbox', editable: false }
                ]

            }
            break;

        case 'sm_accionamientostiposclientes':
            model = {
                datafields: [
                    { name: 'id', type: 'integer' },
                    { name: 'idrow', type: 'integer' },
                    { name: 'tipo', type: 'integer' },
                    { name: 'accionamiento', type: 'string' },
                    { name: 'grupo', type: 'integer' },
                    { name: 'desgrupo', type: 'string' },
                    { name: 'mando', type: 'bool' },
                ],
                columns: [

                    { text: 'id', datafield: 'idrow', width: 50, filtertype: 'textbox', editable: false },
                    { text: 'Accionamiento', datafield: 'accionamiento', width: 175, filtertype: 'textbox', editable: false },
                    { text: 'Tipo', datafield: 'tipo', width: 175, filtertype: 'textbox', editable: false },
                    { text: 'grupo', datafield: 'grupo', width: 50, filtertype: 'textbox', editable: false },
                    { text: 'Nombre grupo', datafield: 'desgrupo', width: 250, filtertype: 'input', editable: false },
                    { text: 'Mando', datafield: 'mando', columntype: 'checkbox', filtertype: 'bool', width: 67 },
                ]

            }
            break;


        case 'sm_soportesclientes':
            model = {
                datafields: [
                    { name: 'id', type: 'integer' },
                    { name: 'idrow', type: 'integer' },
                    { name: 'cliente', type: 'integer' },
                    { name: 'desccliente', type: 'string' },
                    { name: 'descsoporte', type: 'string' },
                    { name: 'traduccion', type: 'string' },
                    { name: 'dgrupo', type: 'string' },

                ],
                columns: [

                    { text: 'idrow', datafield: 'idrow', width: 50, filtertype: 'textbox', editable: false },
                    { text: 'Cliente', datafield: 'cliente', width: 50, filtertype: 'textbox', editable: false },
                    { text: 'Nombre', datafield: 'desccliente', width: 175, filtertype: 'textbox', editable: false },
                    { text: 'Soporte', datafield: 'id', width: 50, filtertype: 'textbox', editable: false },
                    { text: 'Descripción', datafield: 'descsoporte', width: 175, filtertype: 'textbox', editable: false },
                    { text: 'Traducción', datafield: 'traduccion', width: 175, filtertype: 'textbox', editable: false },
                    { text: 'Grupo', datafield: 'dgrupo', width: 175, filtertype: 'textbox', editable: false },
                ]

            }
            break;

        case 'sm_tapasclientes':
            model = {
                datafields: [
                    { name: 'id', type: 'integer' },
                    { name: 'idrow', type: 'integer' },
                    { name: 'cliente', type: 'integer' },
                    { name: 'desccliente', type: 'string' },
                    { name: 'desctapa', type: 'string' },
                    { name: 'traduccion', type: 'string' },
                    { name: 'dgrupo', type: 'string' },


                ],
                columns: [

                    { text: 'idrow', datafield: 'idrow', width: 50, filtertype: 'textbox', editable: false },
                    { text: 'Cliente', datafield: 'cliente', width: 50, filtertype: 'textbox', editable: false },
                    { text: 'Nombre', datafield: 'desccliente', width: 175, filtertype: 'textbox', editable: false },
                    { text: 'Tapa', datafield: 'id', width: 50, filtertype: 'textbox', editable: false },
                    { text: 'Descripción', datafield: 'desctapa', width: 175, filtertype: 'textbox', editable: false },
                    { text: 'Traducción', datafield: 'traduccion', width: 175, filtertype: 'textbox', editable: false },
                    { text: 'Grupo', datafield: 'dgrupo', width: 175, filtertype: 'textbox', editable: false },

                ]

            }
            break;

        case 'sm_contrapesosclientes':
            model = {
                datafields: [
                    { name: 'id', type: 'integer' },
                    { name: 'idrow', type: 'integer' },
                    { name: 'cliente', type: 'integer' },
                    { name: 'desccliente', type: 'string' },
                    { name: 'desccontrapeso', type: 'string' },
                    { name: 'traduccion', type: 'string' },
                    { name: 'dgrupo', type: 'string' },

                ],
                columns: [

                    { text: 'idrow', datafield: 'idrow', width: 50, filtertype: 'textbox', editable: false },
                    { text: 'Cliente', datafield: 'cliente', width: 50, filtertype: 'textbox', editable: false },
                    { text: 'Nombre', datafield: 'desccliente', width: 175, filtertype: 'textbox', editable: false },
                    { text: 'Contrapeso', datafield: 'id', width: 50, filtertype: 'textbox', editable: false },
                    { text: 'Descripción', datafield: 'desccontrapeso', width: 175, filtertype: 'textbox', editable: false },
                    { text: 'Traducción', datafield: 'traduccion', width: 175, filtertype: 'textbox', editable: false },
                    { text: 'Grupo', datafield: 'dgrupo', width: 175, filtertype: 'textbox', editable: false },
                ]

            }
            break;

        case 'sm_contrapesoscoloresclientes':
            model = {
                datafields: [
                    { name: 'id', type: 'integer' },
                    { name: 'contrapeso', type: 'integer' },
                    { name: 'idrow', type: 'integer' },
                    { name: 'cliente', type: 'integer' },
                    { name: 'desccliente', type: 'string' },
                    { name: 'desccontrapeso', type: 'string' },
                    { name: 'color', type: 'string' },
                    { name: 'dgrupo', type: 'string' },

                ],
                columns: [

                    { text: 'idrow', datafield: 'idrow', width: 50, filtertype: 'textbox', editable: false },
                    { text: 'Cliente', datafield: 'cliente', width: 50, filtertype: 'textbox', editable: false },
                    { text: 'Nombre', datafield: 'desccliente', width: 175, filtertype: 'textbox', editable: false },
                    { text: 'Contrapeso', datafield: 'contrapeso', width: 50, filtertype: 'textbox', editable: false },
                    { text: 'Descripción', datafield: 'desccontrapeso', width: 175, filtertype: 'textbox', editable: false },
                    { text: 'Color', datafield: 'id', width: 50, filtertype: 'textbox', editable: false },
                    { text: 'Nombre Color', datafield: 'color', width: 175, filtertype: 'textbox', editable: false },
                    { text: 'Grupo', datafield: 'dgrupo', width: 175, filtertype: 'textbox', editable: false },
                ]

            }
            break;

        case 'apiinvoices':
            model = {
                datafields: [
                    { name: 'idrow', type: 'integer' },
                    { name: 'referencia', type: 'string' },
                    { name: 'factura', type: 'string' }
                ],
                columns: [
                    { text: 'idrow', datafield: 'idrow', width: 50, filtertype: 'textbox', editable: false },
                    { text: 'referencia', datafield: 'referencia', width: 175, filtertype: 'textbox', editable: false },
                    { text: 'factura', datafield: 'factura', width: 175, filtertype: 'textbox', editable: false }
                ]

            }
            break;

        case 'sm_soportescoloresclientes':
            model = {
                datafields: [
                    { name: 'idrow', type: 'integer' },
                    { name: 'id', type: 'integer' },
                    { name: 'cliente', type: 'integer' },
                    { name: 'desccliente', type: 'string' },
                    { name: 'traduccion', type: 'string' },
                    { name: 'color', type: 'string' },
                    { name: 'idsoporte', type: 'integer' },
                    { name: 'dessoporte', type: 'string' },
                    { name: 'dgrupo', type: 'string' },
                ],
                columns: [
                    { text: 'idrow', datafield: 'idsoporte', width: 50, filtertype: 'textbox', editable: false },

                    { text: 'Soporte', datafield: 'id', width: 50, filtertype: 'textbox', editable: false },
                    { text: 'Descripción', datafield: 'dessoporte', width: 175, filtertype: 'textbox', editable: false },
                    { text: 'Cliente', datafield: 'cliente', width: 50, filtertype: 'textbox', editable: false },
                    { text: 'Nombre', datafield: 'desccliente', width: 175, filtertype: 'textbox', editable: false },
                    { text: 'Traduccion', datafield: 'traduccion', width: 175, filtertype: 'textbox', editable: false },
                    { text: 'Color', datafield: 'idrow', width: 50, filtertype: 'textbox', editable: false },
                    { text: 'Nombre Color', datafield: 'color', width: 175, filtertype: 'textbox', editable: false },
                    { text: 'Grupo', datafield: 'dgrupo', width: 175, filtertype: 'textbox', editable: false },

                ]

            }
            break;

        case 'sm_tapascoloresclientes':
            model = {
                datafields: [
                    { name: 'idrow', type: 'integer' },
                    { name: 'id', type: 'integer' },
                    { name: 'idtapa', type: 'integer' },
                    { name: 'tapas', type: 'string' },
                    { name: 'color', type: 'string' },
                    { name: 'tamano', type: 'integer' },
                    { name: 'dgrupo', type: 'string' },
                ],
                columns: [
                    { text: 'Idrow', datafield: 'idtapa', width: 50, filtertype: 'textbox', editable: false },
                    { text: 'Tapa', datafield: 'idrow', width: 50, filtertype: 'textbox', editable: false },
                    { text: 'Descripción', datafield: 'tapas', width: 175, filtertype: 'textbox', editable: false },
                    { text: 'Color', datafield: 'id', width: 50, filtertype: 'textbox', editable: false },
                    { text: 'Nombre Color', datafield: 'color', width: 175, filtertype: 'textbox', editable: false },
                    { text: 'Tamaño', datafield: 'tamano', width: 50, filtertype: 'textbox', editable: false },
                    { text: 'Grupo', datafield: 'dgrupo', width: 175, filtertype: 'textbox', editable: false },


                ]

            }
            break;


        case 'api_atributos':
            model = {
                datafields: [
                    { name: 'id', type: 'integer' },
                    { name: 'atributo', type: 'string' },
                ],
                columns: [
                    { text: 'id', datafield: 'id', width: 50, filtertype: 'textbox', editable: false },
                    { text: 'atributo', datafield: 'atributo', width: 350, filtertype: 'input', editable: false },

                ]
            }
            break;

        case 'sm_tejidoscolores':
            model = {
                datafields: [
                    { name: 'idrow', type: 'integer' },
                    { name: 'tejido', type: 'integer' },
                    { name: 'color', type: 'integer' },
                    { name: 'desctejido', type: 'string' },
                    { name: 'desccolor', type: 'string' },
                    { name: 'impresion_digital', type: 'bool' }
                ],
                columns: [
                    { text: 'idrow', datafield: 'id', width: 50, filtertype: 'textbox', editable: false },
                    { text: 'Tejido', datafield: 'desctejido', width: 250, filtertype: 'input', editable: false },
                    { text: 'Color', datafield: 'desccolor', width: 250, filtertype: 'input', editable: false },
                    { text: 'Impresión Digital', datafield: 'impresion_digital', columntype: 'checkbox', filtertype: 'bool', width: 100 }

                ]
            }
            break;

        case 'sm_tejidosclienteproducto':
            model = {
                datafields: [
                    { name: 'idrow', type: 'integer' },
                    { name: 'cliente', type: 'integer' },
                    { name: 'NomFiscal', type: 'string' },
                    { name: 'producto', type: 'integer' },
                    { name: 'tejido', type: 'integer' },
                    { name: 'impresion', type: 'integer' },
                    { name: 'descproducto', type: 'string' },
                    { name: 'descripcion', type: 'string' },
                    { name: 'diasfabricacion', type: 'integer' },
                ],
                columns: [
                    { text: 'Producto', datafield: 'descproducto', width: 125, filtertype: 'textbox', editable: false },
                    { text: 'Cliente', datafield: 'NomFiscal', width: 200, filtertype: 'textbox', editable: false },
                    { text: 'Tejido', datafield: 'descripcion', width: 400, filtertype: 'textbox', editable: false },
                    { text: 'Impresion', datafield: 'impresion', width: 75, filtertype: 'textbox', editable: false },
                    { text: 'DiasFab', datafield: 'diasfabricacion', width: 75, filtertype: 'textbox', editable: false },
                ],

            }
            break;

        case 'cajones':
            model = {
                datafields: [
                    { name: 'idrow', type: 'integer' },
                    { name: 'descripcion', type: 'string' },
                    { name: 'grupo', type: 'integer' },
                    { name: 'desgrupo', type: 'string' },
                ],
                columns: [
                    { text: 'idrow', datafield: 'idrow', width: 50, filtertype: 'textbox', editable: false },
                    { text: 'descripcion', datafield: 'descripcion', width: 175, filtertype: 'input', editable: false },
                    { text: 'grupo', datafield: 'grupo', width: 50, filtertype: 'textbox', editable: false },
                    { text: 'Nombre grupo', datafield: 'desgrupo', width: 250, filtertype: 'input', editable: false },
                ]
            }
            break;

        case 'sm_cajonesclientes':
            model = {
                datafields: [
                    { name: 'idrow', type: 'integer' },
                    { name: 'descajon', type: 'string' },
                    { name: 'cliente', type: 'integer' },
                    { name: 'descliente', type: 'string' },
                    { name: 'Grupo', type: 'string' },
                ],
                columns: [
                    { text: 'cajón', datafield: 'idrow', width: 50, filtertype: 'textbox', editable: false },
                    { text: 'descripción', datafield: 'descajon', width: 175, filtertype: 'input', editable: false },
                    { text: 'cliente', datafield: 'cliente', width: 50, filtertype: 'textbox', editable: false },
                    { text: 'Nombre', datafield: 'descliente', width: 250, filtertype: 'input', editable: false },
                    { text: 'Grupo', datafield: 'Grupo', width: 250, filtertype: 'input', editable: false },
                ]
            }
            break;

        case 'guias':
            model = {
                datafields: [
                    { name: 'idrow', type: 'integer' },
                    { name: 'descripcion', type: 'string' },
                    { name: 'grupo', type: 'integer' },
                    { name: 'desgrupo', type: 'string' },
                ],
                columns: [
                    { text: 'idrow', datafield: 'idrow', width: 50, filtertype: 'textbox', editable: false },
                    { text: 'descripcion', datafield: 'descripcion', width: 175, filtertype: 'input', editable: false },
                    { text: 'grupo', datafield: 'grupo', width: 50, filtertype: 'textbox', editable: false },
                    { text: 'Nombre grupo', datafield: 'desgrupo', width: 250, filtertype: 'input', editable: false },
                ]
            }
            break;

        case 'sm_clientesapi_tiendas':
            model = {
                datafields: [
                    { name: 'idrow', type: 'integer' },
                    { name: 'cliente', type: 'integer' },
                    { name: 'pais', type: 'integer' },
                    { name: 'descpais', type: 'string' },
                    { name: 'nomfiscal', type: 'string' },
                    { name: 'nombre', type: 'string' },
                    { name: 'domicilio', type: 'string' },
                    { name: 'poblacion', type: 'string' },
                    { name: 'provincia', type: 'string' },
                    { name: 'telefono_1', type: 'string' },
                    { name: 'email_1', type: 'string' },
                    { name: 'diastransporte', type: 'number' },
                    { name: 'codsolupyme', type: 'string' },
                    { name: 'centro', type: 'string' },
                    { name: 'Usuario', type: 'string' },
                    { name: 'Password', type: 'string' },
                ],
                columns: [
                    { text: 'id', datafield: 'idrow', width: 70, filtertype: 'textbox', editable: false, columngroup: 'Cliente', hidden: true },
                    { text: 'Centro', datafield: 'centro', width: 60, filtertype: 'textbox', editable: false, columngroup: 'Cliente', cellsalign: 'center' },
                    { text: 'Pais', datafield: 'descpais', width: 100, filtertype: 'input', editable: false, columngroup: 'Cliente', cellsalign: 'left' },
                    { text: 'Cliente', datafield: 'nomfiscal', width: 150, filtertype: 'input', editable: false, columngroup: 'Cliente', cellsalign: 'left' },
                    { text: 'Nombre del Centro', datafield: 'nombre', width: 300, filtertype: 'input', editable: false, columngroup: 'Cliente' },
                    { text: 'Población', datafield: 'poblacion', width: 300, filtertype: 'input', editable: true, columngroup: 'Cliente', cellsalign: 'left' },
                    { text: 'Provincia', datafield: 'provincia', width: 100, filtertype: 'input', editable: true, columngroup: 'Cliente', cellsalign: 'left' },
                    { text: 'Teléfono', datafield: 'telefono_1', width: 150, filtertype: 'input', editable: true, columngroup: 'Cliente', cellsalign: 'left' },
                    { text: 'Email', datafield: 'email_1', width: 150, filtertype: 'input', editable: true, columngroup: 'Cliente', cellsalign: 'left' },
                    { text: 'D.Transporte', datafield: 'diastransporte', width: 90, filtertype: 'input', editable: true, columntype: 'numberinput', createeditor: decimal2Value, columngroup: 'Conf', cellsalign: 'center' },
                    { text: 'C.Solupyme', datafield: 'codsolupyme', width: 90, filtertype: 'input', editable: true, columntype: 'numberinput', createeditor: decimal2Value, columngroup: 'Conf', cellsalign: 'center' },

                ],
                columngroups:
                    [
                        { text: 'Datos Cliente', align: 'center', name: 'Cliente' },
                        { text: 'Configuración', align: 'center', name: 'Conf' },
                    ]
            }
            break;

        case 'sm_incrementosgenericos':
            model = {
                datafields: [
                    { name: 'id', type: 'integer' },
                    { name: 'cliente', type: 'integer' },
                    { name: 'NomCli', type: 'string' },
                    { name: 'marca', type: 'integer' },
                    { name: 'DesMar', type: 'string' },
                    { name: 'modelo', type: 'integer' },
                    { name: 'DesMod', type: 'string' },
                    { name: 'producto', type: 'integer' },
                    { name: 'DesPro', type: 'string' },
                    { name: 'descripcion', type: 'string' },
                    { name: 'pvp', type: 'number' },
                    { name: 'c1', type: 'string' },
                    { name: 'cod_solupyme', type: 'string' },
                    { name: 'grupo', type: 'integer' },
                    { name: 'dgrupo', type: 'string' },
                ],
                columns: [
                    { text: 'id', datafield: 'id', width: 50, filtertype: 'textbox', editable: false },
                    { text: 'Cliente', datafield: 'cliente', width: 50, filtertype: 'input', editable: false },
                    { text: 'Nombre Cliente', datafield: 'NomCli', width: 250, filtertype: 'input', editable: false },
                    { text: 'Marca', datafield: 'marca', width: 50, filtertype: 'input', editable: false },
                    { text: 'Descripción Marca', datafield: 'DesMar', width: 250, filtertype: 'input', editable: false },
                    { text: 'Modelo', datafield: 'modelo', width: 50, filtertype: 'input', editable: false },
                    { text: 'Descripción Modelo', datafield: 'DesMod', width: 250, filtertype: 'input', editable: false },
                    { text: 'Producto', datafield: 'producto', width: 80, filtertype: 'input', editable: false },
                    { text: 'Descripción Producto', datafield: 'DesPro', width: 150, filtertype: 'input', editable: false },
                    { text: 'Descripción', datafield: 'descripcion', width: 250, filtertype: 'input', editable: true },
                    { text: 'Precio', datafield: 'pvp', width: 100, filtertype: 'input', editable: true },
                    { text: 'C1', datafield: 'c1', width: 100, filtertype: 'input', editable: true },
                    { text: 'Codigo Solupyme', datafield: 'cod_solupyme', width: 100, filtertype: 'input', editable: true },
                    { text: 'Grupo', datafield: 'grupo', width: 80, filtertype: 'input', editable: false },
                    { text: 'Descripción Grupo', datafield: 'dgrupo', width: 150, filtertype: 'input', editable: false },


                ]

            }
            break;

        case 'sm_accionamientos_clientes_tarifas':
            model = {
                datafields: [
                    { name: 'id', type: 'integer' },
                    { name: 'idrow', type: 'integer' },
                    { name: 'NomCli', type: 'string' },
                    { name: 'ancho', type: 'number' },
                    { name: 'pvp', type: 'number' },
                    { name: 'c1', type: 'string' },

                ],
                columns: [
                    { text: 'id', datafield: 'id', width: 50, filtertype: 'textbox', editable: false },
                    { text: 'Cliente', datafield: 'idrow', width: 50, filtertype: 'input', editable: false },
                    { text: 'Nombre Cliente', datafield: 'NomCli', width: 250, filtertype: 'input', editable: false },
                    { text: 'Ancho', datafield: 'ancho', width: 100, filtertype: 'input', editable: true },
                    { text: 'Precio', datafield: 'pvp', width: 100, filtertype: 'input', editable: true },
                    { text: 'C1', datafield: 'c1', width: 100, filtertype: 'input', editable: true },



                ]
            }
            break;

        case 'sm_accionamientos_radio_tipo':
            model = {
                datafields: [
                    { name: 'idrow', type: 'integer' },
                    { name: 'descripcion', type: 'string' },
                    { name: 'modelos', type: 'string' },
                    { name: 'articulos', type: 'string' },


                ],
                columns: [
                    { text: 'idrow', datafield: 'idrow', width: 50, filtertype: 'textbox', editable: false },
                    { text: 'Descripcion', datafield: 'descripcion', width: 250, filtertype: 'input', editable: false },
                    { text: 'Modelos', datafield: 'modelos', width: 250, filtertype: 'input', editable: false },
                    { text: 'Articulos', datafield: 'articulos', width: 250, filtertype: 'input', editable: false },



                ]
            }
            break;

        case 'sm_accionamientos_radio_tipo_cliente':
            model = {
                datafields: [
                    { name: 'idrow', type: 'integer' },
                    { name: 'id', type: 'integer' },
                    { name: 'DesMar', type: 'string' },
                    { name: 'descripcion', type: 'string' },
                    { name: 'cliente', type: 'integer' },
                    { name: 'NomCli', type: 'string' },
                    { name: 'precio', type: 'number' },
                    { name: 'c1', type: 'string' },
                    { name: 'producto', type: 'integer' },
                    { name: 'DesPro', type: 'string' },
                    { name: 'modelo', type: 'integer' },
                    { name: 'DesMod', type: 'string' },

                ],
                columns: [
                    { text: 'id', datafield: 'idrow', width: 50, filtertype: 'textbox', editable: false },
                    { text: 'Mando', datafield: 'id', width: 50, filtertype: 'input', editable: false },
                    { text: 'Descripción Mando', datafield: 'DesMar', width: 250, filtertype: 'input', editable: false },
                    { text: 'Descripción', datafield: 'descripcion', width: 250, filtertype: 'input', editable: false },
                    { text: 'Cliente', datafield: 'cliente', width: 50, filtertype: 'input', editable: false },
                    { text: 'Nombre Cliente', datafield: 'NomCli', width: 250, filtertype: 'input', editable: false },
                    { text: 'Precio', datafield: 'precio', width: 100, filtertype: 'input', editable: true },
                    { text: 'C1', datafield: 'c1', width: 100, filtertype: 'input', editable: true },
                    { text: 'Producto', datafield: 'producto', width: 50, filtertype: 'input', editable: false },
                    { text: 'Descripcion Producto', datafield: 'DesPro', width: 250, filtertype: 'input', editable: false },
                    { text: 'Modelo', datafield: 'modelo', width: 50, filtertype: 'input', editable: false },
                    { text: 'Descripcion Modelo', datafield: 'DesMod', width: 250, filtertype: 'input', editable: false },



                ]
            }
            break;

        case 'sm_contrapeso_clientes_tarifas':
            model = {
                datafields: [
                    { name: 'id', type: 'integer' },
                    { name: 'idrow', type: 'integer' },
                    { name: 'DesCon', type: 'string' },
                    { name: 'ancho', type: 'number' },
                    { name: 'pvp', type: 'number' },
                    { name: 'c1', type: 'string' },

                ],
                columns: [
                    { text: 'id', datafield: 'id', width: 50, filtertype: 'textbox', editable: false },
                    { text: 'Contrapeso', datafield: 'idrow', width: 50, filtertype: 'input', editable: false },
                    { text: 'Descripción Contapeso', datafield: 'DesCon', width: 250, filtertype: 'input', editable: false },
                    { text: 'Ancho', datafield: 'ancho', width: 100, filtertype: 'input', editable: true },
                    { text: 'Precio', datafield: 'pvp', width: 100, filtertype: 'input', editable: true },
                    { text: 'C1', datafield: 'c1', width: 100, filtertype: 'input', editable: true },



                ]
            }
            break;

        case 'sm_tarifa_tejido_vertical':
            model = {
                datafields: [
                    { name: 'ancholama', type: 'integer' },
                    { name: 'tejido', type: 'integer' },
                    { name: 'Ntejido', type: 'string' },
                    { name: 'c1', type: 'number' },
                    { name: 'k', type: 'number' },
                    { name: 'pvp', type: 'number' },

                ],
                columns: [
                    { text: 'Ancho Lama', datafield: 'ancholama', width: 100, filtertype: 'textbox', editable: false },
                    { text: 'Tejido', datafield: 'tejido', width: 50, filtertype: 'input', editable: false },
                    { text: 'Descripcion Tejido', datafield: 'Ntejido', width: 250, filtertype: 'input', editable: false },
                    { text: 'C1', datafield: 'c1', width: 100, filtertype: 'input', editable: true },
                    { text: 'K', datafield: 'k', width: 100, filtertype: 'input', editable: true },
                    { text: 'Precio', datafield: 'pvp', width: 100, filtertype: 'input', editable: true },



                ]
            }
            break;

        case 'sm_accesorios_tarifas':
            model = {
                datafields: [
                    { name: 'id', type: 'integer' },
                    { name: 'idrow', type: 'integer' },
                    { name: 'NomCli', type: 'string' },
                    { name: 'mm', type: 'integer' },
                    { name: 'referencia', type: 'string' },
                    { name: 'cantidad', type: 'integer' },
                    { name: 'pvp', type: 'number' },
                    { name: 'c1', type: 'string' },

                ],
                columns: [
                    { text: 'id', datafield: 'id', width: 50, filtertype: 'textbox', editable: false },
                    { text: 'Cliente', datafield: 'idrow', width: 50, filtertype: 'input', editable: false },
                    { text: 'Nombre Cliente', datafield: 'NomCli', width: 250, filtertype: 'input', editable: false },
                    { text: 'MM', datafield: 'mm', width: 50, filtertype: 'input', editable: false },
                    { text: 'Referencia', datafield: 'referencia', width: 250, filtertype: 'input', editable: false },
                    { text: 'Cantidad', datafield: 'cantidad', width: 50, filtertype: 'input', editable: true },
                    { text: 'Precio', datafield: 'pvp', width: 100, filtertype: 'input', editable: true },
                    { text: 'C1', datafield: 'c1', width: 100, filtertype: 'input', editable: true },



                ]
            }
            break;

        case 'sm_mecanismo_japones_tarifas':
            model = {
                datafields: [
                    { name: 'id', type: 'integer' },
                    { name: 'vias', type: 'integer' },
                    { name: 'cliente', type: 'integer' },
                    { name: 'NomCli', type: 'string' },
                    { name: 'ancho', type: 'number' },
                    { name: 'pvp', type: 'number' },
                    { name: 'c1', type: 'string' },

                ],
                columns: [
                    { text: 'id', datafield: 'id', width: 50, filtertype: 'textbox', editable: false },
                    { text: 'Vias', datafield: 'vias', width: 50, filtertype: 'textbox', editable: false },
                    { text: 'Cliente', datafield: 'cliente', width: 50, filtertype: 'input', editable: false },
                    { text: 'Nombre Cliente', datafield: 'NomCli', width: 250, filtertype: 'input', editable: false },
                    { text: 'Ancho', datafield: 'ancho', width: 100, filtertype: 'input', editable: true },
                    { text: 'Precio', datafield: 'pvp', width: 100, filtertype: 'input', editable: true },
                    { text: 'C1', datafield: 'c1', width: 100, filtertype: 'input', editable: true },



                ]
            }
            break;

        case 'sm_tarifa_mecanismo_vertical':
            model = {
                datafields: [
                    { name: 'ancholama', type: 'integer' },
                    { name: 'ancho', type: 'integer' },
                    { name: 'pvp', type: 'number' },
                    { name: 'lamas', type: 'integer' },
                    { name: 'c1', type: 'string' },
                    { name: 'pvc', type: 'number' },

                ],
                columns: [
                    { text: 'Ancho Lamas', datafield: 'ancholama', width: 50, filtertype: 'textbox', editable: false },
                    { text: 'Ancho', datafield: 'ancho', width: 50, filtertype: 'input', editable: false },
                    { text: 'Precio', datafield: 'pvp', width: 100, filtertype: 'input', editable: true },
                    { text: 'Lamas', datafield: 'lamas', width: 50, filtertype: 'input', editable: true },
                    { text: 'C1', datafield: 'c1', width: 100, filtertype: 'input', editable: true },
                    { text: 'Precio Coste', datafield: 'pvc', width: 100, filtertype: 'input', editable: true },



                ]
            }
            break;

        case 'sm_incrementos':
            model = {
                datafields: [
                    { name: 'id', type: 'integer' },
                    { name: 'cliente', type: 'integer' },
                    { name: 'Ncliente', type: 'string' },
                    { name: 'value', type: 'integer' },
                    { name: 'DesGui', type: 'string' },
                    { name: 'bruto', type: 'bool' },
                    { name: 'idtarifa', type: 'integer' },
                    { name: 'dgrupo', type: 'string' },


                ],
                columns: [
                    { text: 'id', datafield: 'id', width: 50, filtertype: 'textbox', editable: false },
                    { text: 'Cliente', datafield: 'cliente', width: 50, filtertype: 'input', editable: false },
                    { text: 'Nombre Cliente', datafield: 'Ncliente', width: 250, filtertype: 'input', editable: false },
                    { text: 'Guia', datafield: 'value', width: 50, filtertype: 'input', editable: true },
                    { text: 'Descripcion Guia', datafield: 'DesGui', width: 250, filtertype: 'input', editable: false },
                    { text: 'Bruto', datafield: 'bruto', columntype: 'checkbox', filtertype: 'bool', width: 67 },
                    { text: 'Tarifa', datafield: 'idtarifa', width: 50, filtertype: 'input', editable: true },
                    { text: 'Grupo', datafield: 'dgrupo', width: 175, filtertype: 'textbox', editable: false },



                ]
            }
            break;

        case 'sm_incrementos_cajones':
            model = {
                datafields: [
                    { name: 'id', type: 'integer' },
                    { name: 'cliente', type: 'integer' },
                    { name: 'Ncliente', type: 'string' },
                    { name: 'value', type: 'integer' },
                    { name: 'DesCajon', type: 'string' },
                    { name: 'bruto', type: 'bool' },
                    { name: 'idtarifa', type: 'integer' },
                    { name: 'dgrupo', type: 'string' },


                ],
                columns: [
                    { text: 'id', datafield: 'id', width: 50, filtertype: 'textbox', editable: false },
                    { text: 'Cliente', datafield: 'cliente', width: 50, filtertype: 'input', editable: false },
                    { text: 'Nombre Cliente', datafield: 'Ncliente', width: 250, filtertype: 'input', editable: false },
                    { text: 'Cajón', datafield: 'value', width: 50, filtertype: 'input', editable: true },
                    { text: 'Descripcion Cajón', datafield: 'DesCajon', width: 250, filtertype: 'input', editable: false },
                    { text: 'Bruto', datafield: 'bruto', columntype: 'checkbox', filtertype: 'bool', width: 67 },
                    { text: 'Tarifa', datafield: 'idtarifa', width: 50, filtertype: 'input', editable: true },
                    { text: 'Grupo', datafield: 'dgrupo', width: 175, filtertype: 'textbox', editable: false },



                ]
            }
            break;

        case 'sm_incrementos_lacados':
            model = {
                datafields: [
                    { name: 'id', type: 'integer' },
                    { name: 'descripcion', type: 'string' },
                    { name: 'pvp', type: 'number' },
                    { name: 'c1', type: 'string' },
                    { name: 'Basico', type: 'bool' },
                    { name: 'dias', type: 'integer' },
                    { name: 'factor', type: 'number' },


                ],
                columns: [
                    { text: 'id', datafield: 'id', width: 50, filtertype: 'textbox', editable: false },
                    { text: 'Descripción', datafield: 'descripcion', width: 250, filtertype: 'input', editable: false },
                    { text: 'Precio', datafield: 'pvp', width: 100, filtertype: 'input', editable: true },
                    { text: 'C1', datafield: 'c1', width: 100, filtertype: 'input', editable: true },
                    { text: 'Basico', datafield: 'Basico', columntype: 'checkbox', filtertype: 'bool', width: 67 },
                    { text: 'Dias', datafield: 'dias', width: 50, filtertype: 'input', editable: true },
                    { text: 'Factor', datafield: 'factor', width: 100, filtertype: 'input', editable: true },




                ]
            }
            break;


        case 'sm_tejidos_atributos':
            model = {
                datafields: [
                    { name: 'idrow', type: 'integer' },
                    { name: 'tejido', type: 'integer' },
                    { name: 'Ntejido', type: 'string' },
                    { name: 'color', type: 'integer' },
                    { name: 'Ncolor', type: 'string' },
                    { name: 'cliente', type: 'integer' },
                    { name: 'Ncliente', type: 'string' },
                    { name: 'descripcion', type: 'string' },
                    { name: 'anchomax', type: 'number' },
                    { name: 'impresiondigital', type: 'bool' },
                    { name: 'codigoprov', type: 'string' },


                ],
                columns: [
                    { text: 'idrow', datafield: 'idrow', width: 50, filtertype: 'textbox', editable: false },
                    { text: 'Tejido', datafield: 'tejido', width: 50, filtertype: 'input', editable: false },
                    { text: 'Descripcion Tejido', datafield: 'Ntejido', width: 250, filtertype: 'input', editable: false },
                    { text: 'Color', datafield: 'color', width: 50, filtertype: 'input', editable: false },
                    { text: 'Descripcion Color', datafield: 'Ncolor', width: 250, filtertype: 'input', editable: false },
                    { text: 'Cliente', datafield: 'cliente', width: 50, filtertype: 'input', editable: false },
                    { text: 'Nombre Cliente', datafield: 'Ncliente', width: 250, filtertype: 'input', editable: false },
                    { text: 'Descripción', datafield: 'descripcion', width: 250, filtertype: 'input', editable: false },
                    { text: 'Ancho Maximo', datafield: 'anchomax', width: 100, filtertype: 'input', editable: true },
                    { text: 'Impresión Digital', datafield: 'impresiondigital', columntype: 'checkbox', filtertype: 'bool', width: 67 },
                    { text: 'Codigo Proveedor', datafield: 'codigoprov', width: 250, filtertype: 'input', editable: false },





                ]
            }
            break;

        case 'sm_grupo_modelo':
            model = {
                datafields: [
                    { name: 'idrow', type: 'integer' },
                    { name: 'descripcion', type: 'string' },
                    { name: 'modelo', type: 'string' },
                    { name: 'desmodelo', type: 'string' },



                ],
                columns: [
                    { text: 'idrow', datafield: 'idrow', width: 50, filtertype: 'textbox', editable: false },
                    { text: 'Descripción', datafield: 'descripcion', width: 250, filtertype: 'input', editable: false },
                    { text: 'Modelo', datafield: 'modelo', width: 300, filtertype: 'input', editable: false },
                    { text: 'Nombre', datafield: 'desmodelo', width: 250, filtertype: 'input', editable: false },






                ]
            }
            break;
    }
    return model;
}
