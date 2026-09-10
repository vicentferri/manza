import { Component, OnInit } from '@angular/core';
import { HaruService } from '../../../services/haru.service';
import { ToastrService } from 'ngx-toastr';

interface CentroPromo {
    idrow: number;
    CENTRO: number;
    NOMBRE: string;
    imagen_banner: string;
    usuario: number;
}

interface PromocionCliente {
    IDCLIENTE: number;
    NomFiscal: string;
    desde: string;
    hasta: string;
    promocion_coeficiente: number;
    promocion_coeficiente2: number;
    promocion_modificapvp: number;
    promocion_modificapvc: number;
    promocion_mensaje: string;
    centros: CentroPromo[];
    pedidosVisible: boolean;
}

@Component({
    selector: 'app-promociones-monitor',
    templateUrl: './promociones-monitor.component.html',
    styleUrls: ['./promociones-monitor.component.css'],
    providers: [HaruService]
})
export class PromocionesMonitorComponent implements OnInit {

    title = 'Monitor de Promociones';

    cargando = false;
    grupos: PromocionCliente[] = [];
    pedidosData: any[] = [];

    constructor(
        private service: HaruService,
        private toaster: ToastrService
    ) { }

    ngOnInit() {
        this.loadData();
    }

    loadData() {
        this.cargando = true;
        this.grupos = [];
        this.pedidosData = [];
        let pendiente = 2;
        let rawPromociones: any[] = [];

        const finish = () => {
            if (--pendiente === 0) {
                this.grupos = this.agruparPorCliente(rawPromociones);
                this.cargando = false;
            }
        };

        this.service.HTTP_Get('/sm/promociones_activas').subscribe(
            data => { rawPromociones = data.Table || []; finish(); },
            () => {
                this.toaster.error('Error al cargar las promociones activas', this.title);
                this.cargando = false;
            }
        );

        // SELECT head.cliente_entrega, head.refcliente, SUM(t1.cantidad) total
        // FROM SOL_PEDIDOS_COLA head
        // INNER JOIN sol_pedidos_cola_lineas lin ON lin.idrow = head.idrow
        // INNER JOIN sol_pedidos_cola_tipo_1 t1 ON t1.idrow = lin.id
        // INNER JOIN vw_nh_clientes_promociones pro ON pro.idrow = head.CLIENTE_ENTREGA
        // WHERE CAST(head.fecha AS date) >= pro.desde AND CAST(head.fecha AS date) <= pro.hasta
        //   AND t1.tipo = 1 AND lin.articulo = 1
        // GROUP BY head.cliente_entrega, head.refcliente
        this.service.HTTP_Get('/sm/pedidos_promocion').subscribe(
            data => { this.pedidosData = data.Table || []; finish(); },
            () => {
                this.toaster.error('Error al cargar los pedidos de promoción', this.title);
                this.cargando = false;
            }
        );
    }

    private agruparPorCliente(datos: any[]): PromocionCliente[] {
        const map = new Map<number, PromocionCliente>();
        for (const row of datos) {
            if (!map.has(row.IDCLIENTE)) {
                map.set(row.IDCLIENTE, {
                    IDCLIENTE: row.IDCLIENTE,
                    NomFiscal: row.NomFiscal,
                    desde: row.desde,
                    hasta: row.hasta,
                    promocion_coeficiente: row.promocion_coeficiente,
                    promocion_coeficiente2: row.promocion_coeficiente2,
                    promocion_modificapvp: row.promocion_modificapvp,
                    promocion_modificapvc: row.promocion_modificapvc,
                    promocion_mensaje: row.promocion_mensaje,
                    centros: [],
                    pedidosVisible: false
                });
            }
            map.get(row.IDCLIENTE).centros.push({
                idrow: row.idrow,
                CENTRO: row.CENTRO,
                NOMBRE: row.NOMBRE,
                imagen_banner: row.imagen_banner,
                usuario: row.usuario
            });
        }
        return Array.from(map.values());
    }

    getPedidosGrupo(grupo: PromocionCliente): any[] {
        const centroIds = new Set(grupo.centros.map(c => c.CENTRO));
        return this.pedidosData.filter(p => centroIds.has(p.cliente_entrega));
    }

    getNombreCentro(grupo: PromocionCliente, clienteEntrega: number): string {
        const c = grupo.centros.find(x => x.CENTRO === clienteEntrega);
        return c ? c.NOMBRE : String(clienteEntrega);
    }

    togglePedidos(grupo: PromocionCliente) {
        grupo.pedidosVisible = !grupo.pedidosVisible;
    }

    getBannerUrl(path: string): string {
        return this.service.Upload_URL(path);
    }

    sumTotal(pedidos: any[]): number {
        return pedidos.reduce((acc, p) => acc + (Number(p.total) || 0), 0);
    }

    formatDate(value: any): string {
        if (!value) { return '—'; }
        const d = new Date(value);
        if (isNaN(d.getTime())) { return value; }
        return d.toLocaleDateString('es-ES');
    }
}
