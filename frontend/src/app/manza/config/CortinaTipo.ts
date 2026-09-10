
export class CortinaTipo {

    codeCentro: string;
    TipoCortina!: number;

    /* PANEL ENROLLABLE*/
    ancho!: number;
    alto!: number;
    cantidad!: number;
    acc_tipo_id!: number;
    acc_tipo_text!: string;
    acc_marca_id!: number;
    acc_marca_text!: string;
    acc_tubo_id!: number;
    acc_tubo_text!: string;
    acc_modelo_id!: number;
    acc_modelo_text!: string;
    acc_posicion_id!: number;
    acc_posicion_text!: string;
    sop_tipo_id!: number;
    sop_tipo_text!: string;
    sop_color_id!: number;
    sop_color_text!: string;
    tej_tipo_id!: number;
    tej_tipo_text!: string;
    tej_color_id!: number;
    tej_color_text!: string;
    tej_salida_id!: number;
    tej_salida_text!: string;
    con_tipo_id!: number;
    con_tipo_text!: string;
    tap_tipo_id!: number;
    tap_tipo_text!: string;
    tap_color_id!: number;
    tap_color_text!: string;

    cad_color_text!: string;
    cad_Altura!: string;
    cad_Tipo!: number;

    con_color_id!: number;
    con_color_text!: string;
    mando_id!: number;
    mando_text!: string;
    estancia_id!: string;
    estancia_obs!: string;

    Tipo1_Cajon!: string;
    Tipo1_CajonC!: string;
    Tipo1_CajonRAL!: string;
    Tipo1_Guia!: string;
    Tipo1_GuiaC!: string;
    Tipo1_GuiaRAL!: string;
    SubTipoCortina!: number;

    Tipo1_Cargador: string = '-1';


    /* PANEL JAPONES */
    PJ_TipoJapones!: number;
    PJ_Ancho_1!: number;
    PJ_Alto_1!: number;
    PJ_Cantidad_1!: number;
    PJ_Contrapeso_1!: string;
    PJ_tejidos_id!: number;
    PJ_tejidos_text!: string;
    PJ_tejidosC_id!: number;
    PJ_tejidosC_text!: string;
    PJ_Ancho_2!: number;
    PJ_NumeroVias_2!: string;
    PJ_PosicionMando_2!: string;
    PJ_TipoRecogida_2!: string;
    PJ_ColorRiel_2!: string;
    PJ_TipoSoporte_2!: string;
    PJ_Impresion!: boolean;
    PJ_ID_Imagen!: string;
    PJ_Estancia!: string;
    PJ_Estancia_Obs!: string;
    PJ_NumeroPortatelas!: number;
    PJ_NumeroLamas!: number;
    PJ_AnchoLama!: number;
    PJ_AltoLamaTerminada!: number;
    PJ_NumeroPanos!: number;

    PJ_CombinarColores!: boolean;
    Tipo2_Tejido!: string;
    Tipo2_TejidoColor!: string;
    Tipo2_TejidoColor_2!: string;
    Tipo2_TejidoColor_3!: string;
    Tipo2_TejidoColor_4!: string;
    Tipo2_TejidoColor_5!: string;


    PJ_Text_2!: string;
    PJ_Text_3!: string;
    PJ_Text_4!: string;
    PJ_Text_5!: string;

    /* PANEL JAPONES */

    /* PANEL VERTICAL */
    TipoVertical!: number;
    PV_SEL_1!: boolean;
    PV_Ancho_1!: number;
    PV_Alto_1!: number;
    PV_Cantidad_1!: number;
    PV_AnchoLama_1!: string;
    PV_PosicionMecanismo_1!: string;
    PV_ColorRiel_1!: string;
    PV_Accionamiento_1!: string;
    PV_TipoSoporte_1!: string;
    PV_TipoRecogida_1!: string;
    PV_Tejido_id!: number;
    PV_Tejido_text!: string;
    PV_Tejido_c1_id!: number;
    PV_Tejido_c1_text!: string;
    PV_Tejido_c2_id!: number;
    PV_Tejido_c2_text!: string;
    PV_estancia_id_1!: string;
    PV_estancia_obs_1!: string;
    PV_Impresion_1!: boolean;
    PV_ID_Imagen_1!: string;


    PV_SEL_2!: boolean;
    PV_Ancho_2!: number;
    PV_Cantidad_2!: number;
    PV_AlturaMin_2!: number;
    PV_AlturaMax_2!: number;
    PV_AnchoLama_2!: string;
    PV_PosicionMecanismo_2!: string;
    PV_ColorRiel_2!: string;
    PV_Accionamiento_2!: string;
    PV_TipoSoporte_2!: string;
    PV_TipoRecogida_2!: string;
    PV_estancia_id_2!: string;
    PV_estancia_obs_2!: string;
    PV_Impresion_2!: boolean;
    PV_ID_Imagen_2!: string;
    /* PANEL VERTICAL */


    /* COMPAC */
    junquillo!: string;
    ancho2!: number;
    com_acc_tipo_id!: string;
    com_acc_tipo_text!: string;
    com_acc_marca_id!: string;
    com_acc_marca_text!: string;
    com_acc_tubo_id!: string;
    com_acc_tubo_text!: string;
    com_acc_modelo_id!: string;
    com_acc_modelo_text!: string;
    com_acc_posicion_id!: string;
    com_acc_posicion_text!: string;
    com_sop_tipo_id!: string;
    com_sop_tipo_text!: string;
    com_sop_color_id!: string;
    com_sop_color_text!: string;
    com_tej_tipo_id!: number;
    com_tej_tipo_text!: string;
    com_tej_color_id!: number;
    com_tej_color_text!: string;
    com_tej_salida_id!: number;
    com_tej_salida_text!: string;
    com_con_tipo_id!: string;
    com_con_tipo_text!: string;
    com_tap_tipo_id!: string;
    com_tap_tipo_text!: string;
    com_tap_color_id!: string;
    com_tap_color_text!: string;
    com_cad_altura_id!: string;
    com_cad_altura_text!: string;
    com_cad_color_id!: string;
    com_cad_color_text!: string;
    com_cad_Altura!: string;
    com_cad_Tipo!: string;
    com_con_color_id!: string;
    com_con_color_text!: string;
    com_estancia_id!: string;
    com_estancia_obs!: string;
    perfileria!: string;
    ral!: string;
    com_Impresion!: boolean;
    com_ID_Imagen!: string;
    /* COMPAC */

    /* IMPRESION DIGITAL */
    impresion!: boolean;
    impresion_imagen!: string;
    /* IMPRESION DIGITAL */

    /* HONEYCOMB */
    color_perfil_id!: number;
    color_perfil_text!: string;
    hc_accionamiento_id!: number;
    hc_accionamiento_text!: string;
    /* HONEYCOMB */

    instrucciones: string;

    articulos = [];


    precios = {

        T1_Cantidad: 1,
        T1_Tejido: 0,
        T1_Tejido_C1: "",
        T1_Inc_CadenaMetalica: 0,
        T1_Inc_CadenaMetalica_C1: '',
        T1_Inc_Contrapeso: 0,
        T1_Inc_Contrapeso_C1: '',
        T1_Inc_Mando: 0,
        T1_Inc_Mando_C1: '',
        T1_Inc_Impresion: 0,
        T1_Inc_Impresion_C1: '',
        T1_PVP: 0,
        T1_PVP_C1: '',
        T1_Fecha_Entrega: "",
        T1_Transporte: "",
        T1_Inc_Cargador: 0,
        T1_Inc_Cargador_C1: '',
        T1_Inc_Cargador_48: 0,

        T2_Cantidad: 1,
        T2_Tejido: 0,
        T2_Tejido_C1: '',
        T2_NumeroVias: 0,
        T2_NumeroVias_C1: '',
        T2_NumSoportes: 0,
        T2_TipoSoporte: 0,
        T2_TipoSoporte_C1: '',
        T2_Inc_Impresion: 0,
        T2_Inc_Impresion_C1: '',
        T2_PVP: 0,
        T2_PVP_C1: '',
        T2_Fecha_Entrega: "",
        T2_Transporte: "",
        T2_SoporteTotal: 0,

        T3_Cantidad: 1,
        T3_Tejido: 0,
        T3_Tejido_C1: '',
        T3_TejidosCombinados: 0,
        T3_TejidosCombinados_C1: '',

        T3_TipoSoporte: 0,
        T3_NumSoportes: 0,
        T3_TipoSoporte_C1: '',
        T3_PVP: 0,
        T3_PVP_C1: '',
        T3_Fecha_Entrega: "",
        T3_Transporte: "",

        T32_Cantidad: 1,
        T32_Tejido: 0,
        T32_Tejido_C1: '',
        T32_TejidosCombinados: 0,
        T32_TejidosCombinados_C1: '',
        T32_TipoSoporte: 0,
        T32_NumSoportes: 0,
        T32_TipoSoporte_C1: '',

        T4_Cantidad: 1,
        T4_Tejido: 0,
        T4_Tejido_C1: '',
        T4_Coeficiente: 1,
        T4_PVP: 0,
        T4_PVP_C1: '',
        T4_Fecha_Entrega: "",
        T4_Transporte: "",

        T7_PVP: 0,
        T7_PVP_C1: '',
        T7_Fecha_Entrega: '',
        T7_Transporte: 0,

    }

    constructor(codecentro: string) {

        this.codeCentro = codecentro;
        this.instrucciones = "";
    }


    getFechaEntrega() {
        var fecha = "";
        if (this.TipoCortina == 1) {
            fecha = this.precios.T1_Fecha_Entrega;
        }

        if (this.TipoCortina == 2) {
            fecha = this.precios.T2_Fecha_Entrega;
        }

        if (this.TipoCortina == 3) {
            fecha = this.precios.T3_Fecha_Entrega;
        }

        if (this.TipoCortina == 4) {
            fecha = this.precios.T4_Fecha_Entrega;
        }

        return fecha;
    }

    getTotal() {
        var total = 0;
        if (this.TipoCortina == 1) {
            total = this.precios.T1_PVP == null ? 0 : this.precios.T1_PVP;
        }

        if (this.TipoCortina == 2) {
            total = this.precios.T2_PVP == null ? 0 : this.precios.T2_PVP;
        }

        if (this.TipoCortina == 3) {
            total = this.precios.T3_PVP == null ? 0 : this.precios.T3_PVP;
        }

        if (this.TipoCortina == 4) {
            total = this.precios.T4_PVP == null ? 0 : this.precios.T4_PVP;
        }

        if (this.TipoCortina == 7) {
            total = this.precios.T7_PVP == null ? 0 : this.precios.T7_PVP;
        }

        return total;
    }




    Enrollable_Add(ancho: string, alto: string, cantidad: string,
        acc_tipo_id: number, acc_tipo_text: string,
        acc_marca_id: number, acc_marca_text: string,
        acc_tubo_id: number, acc_tubo_text: string,
        acc_modelo_id: number, acc_modelo_text: string,
        acc_posicion_id: number, acc_posicion_text: string,
        sop_tipo_id: number, sop_tipo_text: string,
        sop_color_id: number, sop_color_text: string,
        tej_tipo_id: number, tej_tipo_text: string,
        tej_color_id: number, tej_color_text: string,
        tej_salida_id: number, tej_salida_text: string,
        con_tipo_id: number, con_tipo_text: string,
        tap_tipo_id: number, tap_tipo_text: string,
        tap_color_id: number, tap_color_text: string,
        alturaCadena: string, colorCadena: string, cadenaTipo: number,
        con_color_id: number, con_color_text: string,
        impresion: boolean, impresion_imagen: string,
        mando_id: number, mando_text: string,
        estancia: string, estanciaobs: string, values: any,
        Tipo1_Cajon: string,
        Tipo1_CajonC: string,
        Tipo1_CajonRAL: string,
        Tipo1_Guia: string,
        Tipo1_GuiaC: string,
        Tipo1_GuiaRAL: string,
        SubTipoCortina: number,
        Tipo1_Cargador: string,
    ) {
        this.TipoCortina = 1;
        this.ancho = Number(ancho);
        this.alto = Number(alto);
        this.cantidad = Number(cantidad);
        this.acc_tipo_id = acc_tipo_id;
        this.acc_tipo_text = acc_tipo_text;
        this.acc_marca_id = acc_marca_id;
        this.acc_marca_text = acc_marca_text;
        this.acc_tubo_id = acc_tubo_id;
        this.acc_tubo_text = acc_tubo_text;
        this.acc_modelo_id = acc_modelo_id;
        this.acc_modelo_text = acc_modelo_text;
        this.acc_posicion_id = acc_posicion_id;
        this.acc_posicion_text = acc_posicion_text;
        this.sop_tipo_id = sop_tipo_id;
        this.sop_tipo_text = sop_tipo_text;
        this.sop_color_id = sop_color_id;
        this.sop_color_text = sop_color_text;
        this.tej_tipo_id = tej_tipo_id;
        this.tej_tipo_text = tej_tipo_text;
        this.tej_color_id = tej_color_id;
        this.tej_color_text = tej_color_text;
        this.tej_salida_id = tej_salida_id;
        this.tej_salida_text = tej_salida_text;
        this.con_tipo_id = con_tipo_id;
        this.con_tipo_text = con_tipo_text;
        this.tap_tipo_id = tap_tipo_id;
        this.tap_tipo_text = tap_tipo_text;
        this.tap_color_id = tap_color_id;
        this.tap_color_text = tap_color_text;


        /* TIPO DE CADENA*/
        this.cad_color_text = colorCadena;
        this.cad_Altura = alturaCadena;
        this.cad_Tipo = cadenaTipo;

        this.con_color_id = con_color_id;
        this.con_color_text = con_color_text;

        this.impresion = impresion;
        this.impresion_imagen = impresion_imagen;
        this.mando_id = mando_id;
        this.mando_text = mando_text;
        this.estancia_id = estancia;
        this.estancia_obs = estanciaobs;

        this.Tipo1_Cajon = Tipo1_Cajon;
        this.Tipo1_CajonC = Tipo1_CajonC;
        this.Tipo1_CajonRAL = Tipo1_CajonRAL;
        this.Tipo1_Guia = Tipo1_Guia;
        this.Tipo1_GuiaC = Tipo1_GuiaC;
        this.Tipo1_GuiaRAL = Tipo1_GuiaRAL;
        this.SubTipoCortina = SubTipoCortina;
        this.Tipo1_Cargador = Tipo1_Cargador;

        this.precios = Object.assign({}, values);

        var a0 = this.TipoCortina.toString();
        var a1 = this.ancho.toString();
        var a2 = this.alto.toString();
        var a3 = this.cantidad.toString();
        var a4 = this.acc_tipo_text;
        var a5 = this.Field(this.acc_marca_id.toString());
        var a7 = this.acc_modelo_text;
        var a8 = this.acc_posicion_text;
        var a6 = this.acc_tubo_text;
        var a22 = this.mando_id.toString();

        var a9 = this.sop_tipo_text;
        var a10 = this.sop_color_text;

        var a15 = this.tap_tipo_text;
        var a16 = this.tap_color_text;

        var a11 = this.tej_tipo_text;
        var a12 = this.tej_color_text;
        var a13 = this.tej_salida_text;

        var a14 = this.con_tipo_text;
        var a21 = this.con_color_text;

        var a18 = this.cad_color_text;
        var a19 = this.cad_Altura.toString();
        var a20 = this.cad_Tipo;


        var a23 = this.impresion_imagen;

        var instrucciones = "(" + a0 + ") " + a3 + "x" + a1 + "x" + a2;


        if (a4.toUpperCase() == "MOTOR") {
            if (a5 == "005") {
                instrucciones += ",ACC=MO MEC45 NICE";
            }

            if (a5 == "006") {
                instrucciones += ",ACC=MO RAD45 NICE";

                if (a22.toUpperCase() == "1 CANAL") {
                    instrucciones += " 1C";
                }

                if (a22.toUpperCase() == "3 CANALES") {
                    instrucciones += " 3C";
                }

                if (a22.toUpperCase() == "6 CANALES") {
                    instrucciones += " 6C";
                }
            }


        }
        else {

            if (a7.toUpperCase() == "BLANCO") {
                instrucciones += ",ACC=CA DEVA BL";
            }

            if (a7.toUpperCase() == "GRIS") {
                instrucciones += ",ACC=CA DEVA GR";
            }

            if (a7.toUpperCase() == "BEIGE") {
                instrucciones += ",ACC=CA DEVA BEI";
            }

            if (a7.toUpperCase() == "NEGRO") {
                instrucciones += ",ACC=CA DEVA NE";
            }

            if (a18 != "") {
                instrucciones += " (";

                if (a19 != "") {
                    instrucciones += " " + a19;
                }

                if (a18.toUpperCase() == "BLANCO") {
                    instrucciones += " BL";
                }

                if (a18.toUpperCase() == "GRIS") {
                    instrucciones += " GR";
                }

                if (a18.toUpperCase() == "BEIGE") {
                    instrucciones += " BEI";
                }

                if (a18.toUpperCase() == "NEGRO") {
                    instrucciones += " NE";
                }

            }

            instrucciones += " )";

        }

        if (a8.toUpperCase() == "IZQUIERDA") {
            instrucciones += " IZQ";
        }
        else {
            instrucciones += " DER";
        }


        if (a6.toUpperCase() == "TUBO 38") {
            instrucciones += " T38";
        }

        if (a6.toUpperCase() == "TUBO 48") {
            instrucciones += " T48";
        }

        if (a6.toUpperCase() == "TUBO 58") {
            instrucciones += " T58";
        }


        // Soportes

        if (a10.toUpperCase() == "BLANCO") {
            instrucciones += ",SP=DEVA BL";
        }

        if (a10.toUpperCase() == "GRIS") {
            instrucciones += ",SP=DEVA GR";
        }

        if (a10.toUpperCase() == "BEIGE") {
            instrucciones += ",SP=DEVA BEI";
        }

        if (a10.toUpperCase() == "NEGRO") {
            instrucciones += ",SP=DEVA NE";
        }


        // Tapas
        if (this.SubTipoCortina == 1) {
            if (a16.toUpperCase() == "BLANCO") {
                instrucciones += ",TP=DEVA BL";
            }

            if (a16.toUpperCase() == "GRIS") {
                instrucciones += ",TP=DEVA GR";
            }

            if (a16.toUpperCase() == "BEIGE") {
                instrucciones += ",TP=DEVA BEI";
            }

            if (a16.toUpperCase() == "NEGRO") {
                instrucciones += ",TP=DEVA NE";
            }
        }
        instrucciones += ",TE=" + a11.toUpperCase() + " " + a12.toUpperCase();

        if (a13.toUpperCase() == "CASCADA") {
            instrucciones += " CS";
        }
        else
            instrucciones += " PP";

        /* Contrapeso */
        if (this.SubTipoCortina == 1) {
            if (a14.toUpperCase() == "LUNA VISTO") {

                if (a21.toUpperCase() == "BLANCO") {
                    instrucciones += ",CO=LV BL";
                }

                if (a21.toUpperCase() == "GRIS") {
                    instrucciones += ",CO=LV GR";
                }

                if (a21.toUpperCase() == "BEIGE") {
                    instrucciones += ",CO=LV BEI";
                }

                if (a21.toUpperCase() == "NEGRO") {
                    instrucciones += ",CO=LV NE";
                }
            }
            else {
                instrucciones += ",CO=LO BL";
            }
        }

        if (a23 != "") {
            instrucciones += ",I=" + a23;
        }
        this.instrucciones = instrucciones;
    }

    Field(value: string): string {

        if (value == "-1") {
            return "000";
        }
        var retValue = "";
        var lenValue = value.length;


        if (lenValue < 3) {
            var dif = 3 - lenValue;

            for (var i = 0; i < dif; i++) {
                retValue += "0";
            }

            retValue += value;
        }
        else {
            retValue = value;
        }

        return retValue;
    }



    Japones_Add_T1(PJ_Ancho_1: string,
        PJ_Alto_1: string,
        PJ_Cantidad_1: string,
        PJ_Tejidos_id: number,
        PJ_Tejidos_text: string,
        PJ_TejidosC_id: number,
        PJ_TejidosC_text: string,
        PJ_Contrapeso_1: string,
        impresion: boolean,
        impresion_imagen: string,
        estancia: string,
        estanciaobs: string,
        PJ_Ancho_2: string,
        PJ_NumeroVias_2: string,
        PJ_PosicionMando_2: string,
        PJ_TipoRecogida_2: string,
        PJ_ColorRiel_2: string,
        PJ_TipoSoporte_2: string,
        PJ_NumeroPortatelas: number,
        PJ_NumeroLamas: number,
        PJ_AnchoLama: number,
        PJ_AltoLamaTerminada: number,
        TipoJapones: number,
        NumeroPanos: number,
        Tipo2_Tejido: string,
        Tipo2_TejidoColor: string,
        Tipo2_TejidoColor_2: string,
        Tipo2_TejidoColor_3: string,
        Tipo2_TejidoColor_4: string,
        Tipo2_TejidoColor_5: string,
        PJ_Text_2: string,
        PJ_Text_3: string,
        PJ_Text_4: string,
        PJ_Text_5: string,
        PJ_CombinarColores: boolean,
        values: any) {
        this.TipoCortina = 2;
        this.PJ_Ancho_1 = Number(PJ_Ancho_1);
        this.PJ_Alto_1 = Number(PJ_Alto_1);
        this.PJ_Cantidad_1 = Number(PJ_Cantidad_1);
        this.PJ_tejidos_id = Number(PJ_Tejidos_id);
        this.PJ_tejidos_text = PJ_Tejidos_text;
        this.PJ_tejidosC_id = Number(PJ_TejidosC_id)
        this.PJ_tejidosC_text = PJ_TejidosC_text;
        this.PJ_Contrapeso_1 = PJ_Contrapeso_1;
        this.impresion = impresion;
        this.impresion_imagen = impresion_imagen;
        this.PJ_Estancia = estancia;
        this.PJ_Estancia_Obs = estanciaobs;
        this.PJ_Ancho_2 = Number(PJ_Ancho_2);
        this.PJ_NumeroVias_2 = PJ_NumeroVias_2;
        this.PJ_PosicionMando_2 = PJ_PosicionMando_2;
        this.PJ_TipoRecogida_2 = PJ_TipoRecogida_2;
        this.PJ_ColorRiel_2 = PJ_ColorRiel_2;
        this.PJ_TipoSoporte_2 = PJ_TipoSoporte_2;
        this.PJ_NumeroPortatelas = PJ_NumeroPortatelas;
        this.PJ_NumeroLamas = PJ_NumeroLamas;
        this.PJ_AnchoLama = PJ_AnchoLama;
        this.PJ_AltoLamaTerminada = PJ_AltoLamaTerminada;
        this.PJ_TipoJapones = TipoJapones;
        this.PJ_NumeroPanos = NumeroPanos;
        this.Tipo2_Tejido = Tipo2_Tejido;
        this.Tipo2_TejidoColor = Tipo2_TejidoColor;
        this.Tipo2_TejidoColor_2 = Tipo2_TejidoColor_2;
        this.Tipo2_TejidoColor_3 = Tipo2_TejidoColor_3;
        this.Tipo2_TejidoColor_4 = Tipo2_TejidoColor_4;
        this.Tipo2_TejidoColor_5 = Tipo2_TejidoColor_5;
        this.PJ_Text_2 = PJ_Text_2;
        this.PJ_Text_3 = PJ_Text_3;
        this.PJ_Text_4 = PJ_Text_4;
        this.PJ_Text_5 = PJ_Text_5;
        this.PJ_CombinarColores = PJ_CombinarColores;
        this.precios = Object.assign({}, values);

        var a0 = this.TipoCortina.toString();
        var a2 = this.PJ_Ancho_1.toString();
        var a3 = this.PJ_Alto_1.toString();
        var a4 = this.PJ_Cantidad_1.toString();
        var a5 = this.PJ_tejidos_text;
        var a6 = this.PJ_tejidosC_text;
        var a7 = this.PJ_Contrapeso_1;
        var a8 = this.impresion_imagen;
        var b0 = this.TipoCortina.toString();
        var b2 = this.PJ_Ancho_2.toString();
        var b4 = this.PJ_NumeroVias_2.toString();
        var b5 = this.PJ_PosicionMando_2.toString().toUpperCase();

        if (b5 == "IZQUIERDA") b5 = "IZQ";
        if (b5 == "DERECHA") b5 = "DER";
        if (b5 == "AMBOS LADOS") b5 = "AL";

        var b6 = this.PJ_TipoRecogida_2.toString().toUpperCase();
        if (b6 == "IZQUIERDA") b6 = "IZQ";
        if (b6 == "DERECHA") b6 = "DER";
        if (b6 == "AMBOS LADOS") b6 = "AL";

        var b7 = this.PJ_ColorRiel_2.toString().toUpperCase();
        if (b7 == "BLANCO") b7 = "BLA";
        if (b7 == "ALUMINIO") b7 = "ALU";

        var b8 = this.PJ_TipoSoporte_2.toString().toUpperCase();
        if (b8 == "TECHO") b8 = "TEC";
        if (b8 == "PARED 6 CM") b8 = "P06";
        if (b8 == "PARED 12 CM") b8 = "P12";
        if (b8 == "PARED 17 CM") b8 = "P17";

        var instrucciones = "(" + a0 + ",T1) " + a4 + "x" + a2 + "x" + a3 + ",TE=" + a5.toUpperCase() + " " + a6.toUpperCase() + ",CO=" + a7 + ",I=" + a8;
        this.instrucciones += instrucciones;

        /*
                                var instrucciones = " (" + b0 + ",T2) " + b3 + "x" + b2 + ",NV=" + b4.toUpperCase() + ",PM=" + b5 + ",TR=" + b6 + ",CR=" + b7;
                                instrucciones += ",TS=" + b8;
                                 this.instrucciones += instrucciones;
        */
    }


    Vertical_Add_T1(PV_Ancho_1: string, PV_Alto_1: string, PV_Cantidad_1: string,
        PV_AnchoLama_1: string,
        PV_PosicionMecanismo_1: string,
        PV_ColorRiel_1: string,
        PV_Accionamiento_1: string,
        PV_TipoSoporte_1: string,
        PV_TipoRecogida_1: string,
        PV_Tejido_id: number, PV_Tejido_text: string,
        PV_Tejido_c1_id: number, PV_Tejido_c1_text: string,
        PV_Tejido_c2_id: number, PV_Tejido_c2_text: string,
        estancia: string, estanciaobs: string, TipoVertical: number,
        PV_Impresion_1: boolean, PV_ID_Imagen_1: string,
        values: any) {
        this.TipoCortina = 3;
        this.PV_SEL_1 = true;
        this.PV_Ancho_1 = Number(PV_Ancho_1);
        this.PV_Alto_1 = Number(PV_Alto_1);
        this.PV_Cantidad_1 = Number(PV_Cantidad_1);
        this.PV_AnchoLama_1 = PV_AnchoLama_1;
        this.PV_PosicionMecanismo_1 = PV_PosicionMecanismo_1;
        this.PV_ColorRiel_1 = PV_ColorRiel_1;
        this.PV_Accionamiento_1 = PV_Accionamiento_1;
        this.PV_TipoSoporte_1 = PV_TipoSoporte_1;
        this.PV_TipoRecogida_1 = PV_TipoRecogida_1;

        this.PV_Tejido_id = PV_Tejido_id;
        this.PV_Tejido_text = PV_Tejido_text;
        this.PV_Tejido_c1_id = PV_Tejido_c1_id;
        this.PV_Tejido_c1_text = PV_Tejido_c1_text;
        this.PV_Tejido_c2_id = PV_Tejido_c2_id;
        this.PV_Tejido_c2_text = PV_Tejido_c2_text;
        this.PV_estancia_id_1 = estancia;
        this.PV_estancia_obs_1 = estanciaobs;
        this.TipoVertical = TipoVertical;
        this.PV_Impresion_1 = PV_Impresion_1
        this.PV_ID_Imagen_1 = PV_ID_Imagen_1;
        this.precios = Object.assign({}, values);
        this.instrucciones = "";

    }

    Vertical_Add_T2(PV_Ancho_2: string, PV_Cantidad_2: string, PV_AlturaMin_2: string, PV_AlturaMax_2: string,
        PV_AnchoLama_2: string,
        PV_PosicionMecanismo_2: string,
        PV_ColorRiel_2: string,
        PV_Accionamiento_2: string,
        PV_TipoSoporte_2: string,
        PV_TipoRecogida_2: string,
        estancia: string, estanciaobs: string,
        TipoVertical: number,
        PV_Impresion_2: boolean, PV_ID_Imagen_2: string,
        values: any) {
        this.TipoCortina = 3;
        this.PV_SEL_2 = true;
        this.PV_Ancho_2 = Number(PV_Ancho_2);
        this.PV_Cantidad_2 = Number(PV_Cantidad_2);
        this.PV_AlturaMin_2 = Number(PV_AlturaMin_2);
        this.PV_AlturaMax_2 = Number(PV_AlturaMax_2);
        this.PV_AnchoLama_2 = PV_AnchoLama_2;
        this.PV_PosicionMecanismo_2 = PV_PosicionMecanismo_2;
        this.PV_ColorRiel_2 = PV_ColorRiel_2;
        this.PV_Accionamiento_2 = PV_Accionamiento_2;
        this.PV_TipoSoporte_2 = PV_TipoSoporte_2;
        this.PV_TipoRecogida_2 = PV_TipoRecogida_2;
        this.PV_estancia_id_2 = estancia;
        this.PV_estancia_obs_2 = estanciaobs;
        this.TipoVertical = TipoVertical
        this.PV_Impresion_2 = PV_Impresion_2
        this.PV_ID_Imagen_2 = PV_ID_Imagen_2;
        this.precios = Object.assign({}, values);
        this.instrucciones = "";
    }



    Compac_Add(junquillo: string,
        ancho: string, ancho2: string, alto: string, cantidad: string,
        acc_tipo_id: string, acc_tipo_text: string,
        acc_marca_id: string, acc_marca_text: string,
        acc_modelo_id: string, acc_modelo_text: string,
        acc_tubo_id: string, acc_tubo_text: string,
        acc_posicion_id: string, acc_posicion_text: string,
        sop_tipo_id: string, sop_tipo_text: string,
        sop_color_id: string, sop_color_text: string,
        tap_tipo_id: string, tap_tipo_text: string,
        tap_color_id: string, tap_color_text: string,
        tej_tipo_id: number, tej_tipo_text: string,
        tej_color_id: number, tej_color_text: string,
        tej_salida_id: number, tej_salida_text: string,
        cad_altura_id: string, cad_altura_text: string,
        cad_color_id: string, cad_color_text: string,
        cad_Altura: string, cad_Tipo: string,
        estancia: string, estanciaobs: string, perfileria: string, ral: string, impresion: boolean,
        impresion_imagen: string, values: any) {
        this.TipoCortina = 4;
        this.junquillo = junquillo;
        this.ancho = Number(ancho);
        this.ancho2 = Number(ancho2);
        this.alto = Number(alto);
        this.cantidad = Number(cantidad);

        this.com_acc_tipo_id = acc_tipo_id;
        this.com_acc_tipo_text = acc_tipo_text;
        this.com_acc_marca_id = acc_marca_id;
        this.com_acc_marca_text = acc_marca_text;
        this.com_acc_tubo_id = acc_tubo_id;
        this.com_acc_tubo_text = acc_tubo_text;
        this.com_acc_modelo_id = acc_modelo_id;
        this.com_acc_modelo_text = acc_modelo_text;
        this.com_acc_posicion_id = acc_posicion_id;
        this.com_acc_posicion_text = acc_posicion_text;
        this.com_sop_tipo_id = sop_tipo_id;
        this.com_sop_tipo_text = sop_tipo_text;
        this.com_sop_color_id = sop_color_id;
        this.com_sop_color_text = sop_color_text;
        this.com_tej_tipo_id = tej_tipo_id;
        this.com_tej_tipo_text = tej_tipo_text;
        this.com_tej_color_id = tej_color_id;
        this.com_tej_color_text = tej_color_text;
        this.com_tej_salida_id = tej_salida_id;
        this.com_tej_salida_text = tej_salida_text;

        this.com_tap_tipo_id = tap_tipo_id;
        this.com_tap_tipo_text = tap_tipo_text;
        this.com_tap_color_id = tap_color_id;
        this.com_tap_color_text = tap_color_text;
        this.com_cad_altura_id = cad_altura_id;

        /* CADENA */
        this.com_cad_color_text = cad_color_text;
        this.com_cad_Altura = cad_Altura;
        this.com_cad_Tipo = cad_Tipo;

        this.com_estancia_id = estancia;
        this.com_estancia_obs = estanciaobs;
        this.perfileria = perfileria;
        this.ral = ral

        this.impresion = impresion;
        this.impresion_imagen = impresion_imagen;

        this.precios = Object.assign({}, values);


        var a0 = this.TipoCortina.toString();
        var a1 = this.junquillo;
        var a2 = this.ancho.toString();
        var a3 = this.ancho2.toString();
        var a4 = this.alto.toString();
        var a5 = this.cantidad.toString();

        var a6 = this.com_acc_tipo_text;
        var a7 = this.com_acc_marca_text;
        var a8 = " " + this.com_acc_tubo_text;
        var a9 = " " + this.com_acc_modelo_text;
        var a10 = " " + this.com_acc_posicion_text;

        var a19 = " " + this.com_cad_altura_text;
        var a20 = " " + this.com_cad_color_text;

        var a21 = "";
        if (this.com_cad_Altura) {
            a21 = " " + this.com_cad_Altura.toString();
        }
        var a22 = "";
        if (this.com_cad_Tipo) {
            a22 = " " + this.com_cad_Tipo.toString();
        }

        var a11 = " " + this.com_sop_tipo_text;
        var a12 = " " + this.com_sop_color_text;

        var a13 = this.com_tej_tipo_text;
        var a14 = this.com_tej_color_text;
        var a15 = this.com_tej_salida_text;


        var a17 = " " + this.com_tap_tipo_text;
        var a18 = " " + this.com_tap_color_text;


        var acc = ",ACC=CAD.COM " + a8 + a9 + a10 + a19 + a20 + a21 + a22;
        var sop = ",SOP=" + a11 + a12;
        var tej = ",TEJ=" + a13.toUpperCase() + " " + a14.toUpperCase() + a15;
        var tap = ",TAP=" + a17 + a18;


        var instrucciones = "(" + a0 + ") " + a5 + "x" + a2 + "x" + a4 + "x" + a4 + "x" + a3 + "x" + a1;
        instrucciones += acc + sop + tej + tap;

        this.instrucciones = instrucciones;
    }

    HoneyComb_Add(ancho: number, alto: number, cantidad: number,
        tej_tipo_id: number, tej_tipo_text: string,
        tej_color_id: number, tej_color_text: string,
        color_perfil_id: number, color_perfil_text: string,
        hc_accionamiento_id: number, hc_accionamiento_text: string,
        values: any) {
        this.TipoCortina = 7;
        this.ancho = ancho;
        this.alto = alto;
        this.cantidad = cantidad;
        this.tej_tipo_id = tej_tipo_id;
        this.tej_tipo_text = tej_tipo_text;
        this.tej_color_id = tej_color_id;
        this.tej_color_text = tej_color_text;
        this.color_perfil_id = color_perfil_id;
        this.color_perfil_text = color_perfil_text;
        this.hc_accionamiento_id = hc_accionamiento_id;
        this.hc_accionamiento_text = hc_accionamiento_text;

        this.precios = Object.assign({}, values);

    }

}
