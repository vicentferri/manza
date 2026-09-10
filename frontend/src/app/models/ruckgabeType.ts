/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

export class ruckgabeType {
    public id: number;
    public numero: number;
    public fecha: Date;
    public entrega: Date;
    public referencia: string;
    public almacen: number;
    public responsable: number;
    public idCliente: number;
    public nombrecliente: string;
    public idEntrega: number;
    public nombreentrega: string;
    public observaciones: string;
    public usuario: number;
    public estado: number;
    public formapago: number;
    public incoterm: number;
    public coeficiente: number;
    public promocion_activa: number;
    public promocion_coeficiente: number;
    public promocion_modificapvp: number;
    public promocion_modificapvc: number;


    constructor() {
        this.id = 0;
        this.numero = 0;
        this.fecha = new Date();
        this.almacen = -1;
        this.responsable = -1;
        this.idCliente = -1;
        this.nombrecliente = "Seleccionar Cliente...";
        this.idEntrega = -1;
        this.nombreentrega = "";
        this.usuario = -1;
        this.estado = 0;
        this.coeficiente = 1;
        this.promocion_activa = 0;
        this.promocion_coeficiente = 0;
        this.promocion_modificapvp = 0;
        this.promocion_modificapvc = 0;
        this.entrega = new Date();
        this.referencia = "";
        this.observaciones = "";
        this.formapago = -1;
        this.incoterm = -1;
        this.nombreentrega = "";
        this.referencia = "";
        this.observaciones = "";
        this.formapago = -1;
        this.incoterm = -1;
        this.coeficiente = 1;
        this.promocion_activa = 0;
        this.promocion_coeficiente = 0;
        this.promocion_modificapvp = 0;
        this.promocion_modificapvc = 0;
        this.usuario = -1;
        this.estado = 0;

    }


}
