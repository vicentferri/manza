export class SearchModel {

    Estado: Number;
    Desde: Date;
    _Desde: string = "";
    Hasta: Date;
    _Hasta: String = "";
    NumeroPedido: String;
    Referencia: String;
    Cliente: string;
    Centro: string;
    RefCliente: string;

    constructor() {
        var year = new Date().getFullYear();
        var month = new Date().getMonth();
        this.Estado = 0;
        this.Desde = new Date(year, month, 1);
        this.Hasta = new Date();
        this.NumeroPedido = "";
        this.Referencia = "";
        this.Cliente = "0";
        this.Centro = "0";
        this.RefCliente = "";

    }

    getEstado() {

        if (this.Estado == 0) {
            return "Pendiente";
        }

        if (this.Estado == 100) {
            return "Finalizado";
        }

        return '';
    }

}