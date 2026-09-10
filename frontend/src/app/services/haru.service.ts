import { Injectable } from "@angular/core";
import { ruckgabeType } from "../models/ruckgabeType";
import { LinType } from "../models/LinType";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { environment } from "../../environments/environment";
import { map, tap } from "rxjs/operators";

@Injectable()
export class HaruService {
  public firmaID = "003";
  private host_ip = "192.168.10.99:6900";
  private host_api_ip = "192.168.10.99:6900";
  private nh_host_ip = "192.168.10.99:6900";
  private api_surl = "/api";
  private export = "";

  private docs_api = "";

  private urlServer = this.host_ip + "/haru_server";
  private urlService = this.urlServer + "/services/bbss/haru.ashx";
  private urlMaster = this.urlServer + "/services/master/master.ashx";
  private urlBBSSService = this.urlServer + "/services/bbss/bbss.ashx";
  private urlProPad = this.urlServer + "/services/bbss/propad2.ashx";
  private urlPromotion =
    this.host_ip + "/haru_server/services/_campaing.ashx?emp=1";
  private urlNHMaster = this.nh_host_ip + this.api_surl;
  private urlNHBase = this.nh_host_ip + "/api";

  private urlCDFiles = "https://www.manzasm.com/cd/api/bestellung_file/uploads/b2b/";

  private urlRiesgos_TipoRiesgo =
    this.urlBBSSService + "?op=get&opt=BBSS_RIESGOS_1_ACC&emp=1";
  private urlRiesgos_ListaRiesgo =
    this.urlBBSSService + "?op=get&opt=BBSS_RIESGOS_1&emp=1";

  constructor(private http: HttpClient) {
    this.firmaID = environment.firmaID;
    this.host_ip = environment.host_ip;
    this.host_api_ip = environment.host_api_ip;
    this.nh_host_ip = environment.nh_host_ip;
    this.api_surl = environment.api_surl;
    this.docs_api = environment.nh_documents;
    this.export = environment.export;

    this.urlServer = this.host_ip + "/haru_server";
    this.urlService = this.urlServer + "/services/bbss/haru.ashx";
    this.urlMaster = this.urlServer + "/services/master/master.ashx";
    this.urlBBSSService = this.urlServer + "/services/bbss/bbss.ashx";
    this.urlProPad = this.urlServer + "/services/bbss/propad2.ashx";
    this.urlPromotion =
      this.host_ip + "/haru_server/services/_campaing.ashx?emp=1";
    this.urlNHMaster = this.nh_host_ip + this.api_surl;
    this.urlNHBase = this.nh_host_ip + "/api";

    this.urlCDFiles = "https://www.manzasm.com/cd/api/bestellung_file/uploads/b2b/";

    this.urlRiesgos_TipoRiesgo =
      this.urlBBSSService + "?op=get&opt=BBSS_RIESGOS_1_ACC&emp=1";
    this.urlRiesgos_ListaRiesgo =
      this.urlBBSSService + "?op=get&opt=BBSS_RIESGOS_1&emp=1";
  }

  public getfirmaID() {
    return this.firmaID;
  }

  /*
    public LoadConfig() {
        return new Promise((resolve, reject) => {
            this.http.get('assets/config/config.json')
                .map(res => res.json())
                .subscribe((data) => {

                    resolve(data);
                })
        });
    }
*/
  public User_Get() {
    const user = localStorage.getItem("currentUser");
    if (user != null) {
      const juser = JSON.parse(user);
      return juser.id;
    }
    return -1;
  }

  public searchCustomers(emp: string, crit: string) {
    const url: string =
      this.urlService + "?op=get&opt=search_cust&emp=" + emp + "&crit=" + crit;
    return this.http.get(url).pipe(map((response: any) => response));
  }

  /* MAESTROS */

  /* Almacenes */
  public loadMaster_Almacenes(emp: number) {
    var url: string =
      this.urlService + "?op=get&opt=master_almacenes&emp=" + emp;
    return this.http.get(url).pipe(map((response: any) => response));
  }

  /* Responsables */
  public loadMaster_Responsables(emp: number) {
    var url: string = this.urlService + "?op=get&opt=master_responsables";
    return this.http.get(url).pipe(map((response: any) => response));
  }


  public DDL_AlbaranCliente(id: string) {
    var url: string =
      this.urlService + "?op=get&opt=DDL_ALBARAN_CLIENTE&id=" + id;
    return this.http.get(url).pipe(map((response: any) => response));
  }







  public Aprov_Up_1(mac: string, ids: string) {
    var url: string =
      this.urlProPad +
      "?Op=Insert&Opt=BBSS_APROV_UP_1&mac=" +
      mac +
      "&ids=" +
      ids;
    return this.get(url);
  }

  public Aprov_Up_2(mac: string, ids: string) {
    var url: string =
      this.urlProPad +
      "?Op=Insert&Opt=BBSS_APROV_UP_2&mac=" +
      mac +
      "&ids=" +
      ids;
    return this.get(url);
  }

  public Aprov_Up_3(mac: string, ids: string) {
    var url: string =
      this.urlProPad +
      "?Op=Insert&Opt=BBSS_APROV_UP_3&mac=" +
      mac +
      "&ids=" +
      ids;
    return this.get(url);
  }

  public Aprov_Preview_URL(ids: string) {
    return (
      this.urlServer +
      "/services/bbss/preview.aspx?emp=1&proc=pp_preview&ids=" +
      ids
    );
  }

  public get(url: string) {
    return this.http.get(url).pipe(map((response: any) => response));

  }

  public Export() {
    return this.host_api_ip + "/api/export_grid";
  }





  /* TRANSPORT */
  public Transport_SpainTIR(alb: string, trans: string) {
    var url: string =
      this.urlServer +
      "/services/transport/transport.ashx?op=get&opt=spaintir&alb=" +
      alb +
      "&trans=" +
      trans;
    return this.get(url);
  }

  public Transport_SpanTIR_Update(
    idrow: number,
    bultos: number,
    peso: number,
    volumen: number
  ) {
    var url: string =
      this.urlServer +
      "/services/transport/transport.ashx?op=set&opt=updatedata&id=" +
      idrow +
      "&peso=" +
      peso +
      "&bultos=" +
      bultos +
      "&volumen=" +
      volumen;
    return this.get(url);
  }

  public Transport_SpainTIR_URL(alb: string, trans: string, name: string) {
    return (
      this.urlServer +
      "/services/transport/transport.ashx?op=get&opt=spaintir&alb=" +
      alb +
      "&trans=" +
      trans +
      "&name=" +
      name
    );
  }
  public Transport_Search(trans: string) {
    //return this.urlServer + '/services/transport/transport.ashx?op=get&opt=transport_search&trans='+trans;
    return this.urlNHMaster + "/transport_search/" + trans;
  }
  public Transport_Seguimiento(trans: string) {
    return this.urlNHMaster + "/transport_seguimiento";
  }
  public Transport_PALIBEX_URL(alb: string, trans: string, name: string) {
    return this.urlNHMaster + "/haru/transport/" + trans + "/" + alb;
  }

  public Transport_AZKAR_URL(alb: string, trans: string, name: string) {
    return this.urlNHMaster + "/transport/" + trans + "/" + alb;
  }

  public Articles_Search(
    usuario: number,
    criterio: string,
    alias: string,
    barras: string
  ) {
    var url: string =
      this.urlService + "?op=get&opt=ArticulosSearch&Criterio=" + criterio;
    url += "&Barras=" + barras;
    url += "&Alias=" + alias;
    return url;
  }

  public Articles_Search_(
    usuario: number,
    criterio: string,
    alias: string,
    barras: string
  ) {
    var url: string =
      this.urlService + "?op=get&opt=ArticulosSearch&Criterio=" + criterio;
    url += "&Barras=" + barras;
    url += "&Alias=" + alias;
    url += "&obs=0&pot=0";
    return this.http.get(url).pipe(map((response: any) => response));
  }

  /* FARBEN */
  public Master_Farben_GetURL() {
    return this.urlMaster + "?op=get&opt=farben";
  }

  public Master_Farbet_Set(values: string) {
    var url: string = this.urlMaster + "?op=post&opt=farben";
    return this.http.post(url, values).pipe(map((response: any) => response));
  }

  /* FAMILIEN */
  public Master_Familien_GetURL() {
    return this.urlMaster + "?op=get&opt=familien";
  }

  public Master_Familien_Set(values: string) {
    var url: string = this.urlMaster + "?op=post&opt=familien";
    return this.http.post(url, values).pipe(map((response: any) => response));
  }

  /* SUBFAMILIEN */
  public Master_SubFamilien_GetURL() {
    return this.urlMaster + "?op=get&opt=subfamilien";
  }

  public Master_SubFamilien_Set(values: string) {
    var url: string = this.urlMaster + "?op=post&opt=subfamilien";
    return this.http.post(url, values).pipe(map((response: any) => response));
  }

  /* COMPOSITION */
  public Master_Composition_GetURL() {
    return this.urlMaster + "?op=get&opt=composition";
  }

  public Master_Composition_Set(values: string) {
    var url: string = this.urlMaster + "?op=post&opt=composition";
    return this.http.post(url, values).pipe(map((response: any) => response));
  }

  /* CATEGORIA */
  public Master_Categoria_GetURL() {
    return this.urlMaster + "?op=get&opt=categoria";
  }

  public Master_Categoria_Set(values: string) {
    var url: string = this.urlMaster + "?op=post&opt=categoria";
    return this.http.post(url, values).pipe(map((response: any) => response));
  }

  /* CALIDAD */
  public Master_Calidad_GetURL() {
    return this.urlMaster + "?op=get&opt=calidad";
  }

  public Master_Calidad_Set(values: string) {
    var url: string = this.urlMaster + "?op=post&opt=calidad";
    return this.http.post(url, values).pipe(map((response: any) => response));
  }

  public Master_Get(master: string) {
    var url = this.urlMaster + "?op=get&opt=kunden_master&master=" + master;
    return this.get(url);
  }

  public Bestellung_URL(search: string) {
    return this.urlService + "?op=get&opt=BESTELLUNG&search=" + search;
  }



  /* Procedure für web api benutzung */

  public API_Bestellungen_URL(zustand: string) {
    return (
      this.host_api_ip + "/api/bestellungen_zustand/" + zustand
    );
  }

  public API_Bestellungen_URL2(zustand: string, customer: number) {
    return (
      this.host_api_ip +
      "/api/bestellungen_zustand_customer/" +
      zustand +
      "/" +
      customer
    );
  }

  public API_Bestellungen_URL3(
    zustand: string,
    customer: number,
    desde: string,
    hasta: string
  ) {
    return (
      this.host_api_ip +
      "/api/bestellungen_zustand_customer/" +
      zustand +
      "/" +
      customer +
      "?desde=" +
      desde +
      "&hasta=" +
      hasta
    );
  }

  public API_Budget_URL(zustand: string) {
    return this.host_api_ip + "/api/budget_zustand/" + zustand;
  }

  public API_Bestellungen_URL_Header(url: string) {
    var url: string = this.host_api_ip + url;
    return this.get(url);
  }

  public ReprocessFile(url: string) {
    return this.get(url);
  }

  /* DESGLOSE */
  public Desglose_Listado(): string {
    return this.urlService + "?op=get&opt=desglose_listado&emp=1";
  }

  /* NH Procedures */

  public Master_NH_Familien_GetURL() {
    return this.urlNHMaster + "/familias";
  }

  public Master_NH_Familien() {
    var url = this.urlNHMaster + "/familias_filter";
    return this.http.get(url).pipe(map((response: any) => response));
  }

  public Master_NH_Familien_Set(values: string) {
    var url = this.urlNHMaster + "/familia";
    var Authorization = localStorage.getItem("registerToken");

    if (Authorization == null) {
      Authorization = "KK";
    }

    let headers = new HttpHeaders({
      Authorization: Authorization,
      "Content-Type": "application/json",
    });

    let opts = {
      headers: headers,
    };

    return this.http
      .post(url, values, opts)
      .pipe(map((response: any) => response));
    //return this.http.post(url,values, {headers: headers} ).pipe(map((response:any) => response));
  }

  public Master_NH_Familien_Publish(values: string) {
    var url = this.urlNHMaster + "/publish_familias";
    var Authorization = localStorage.getItem("registerToken");

    if (Authorization == null) {
      Authorization = "KK";
    }

    let headers = new HttpHeaders({
      Authorization: Authorization,
      "Content-Type": "application/json",
    });

    let opts = {
      headers: headers,
    };

    return this.http
      .post(url, values, opts)
      .pipe(map((response: any) => response));
    //return this.http.post(url, values, {headers: headers}).pipe(map((response:any) => response));
  }

  public Master_NH_SubFamilien_GetURL() {
    return this.urlNHMaster + "/subfamilias";
  }

  public Master_NH_SubFamilien_Set(values: string) {
    var url = this.urlNHMaster + "/subfamilia";
    var Authorization = localStorage.getItem("registerToken");

    if (Authorization == null) {
      Authorization = "KK";
    }

    let headers = new HttpHeaders({
      Authorization: Authorization,
      "Content-Type": "application/json",
    });

    let opts = {
      headers: headers,
    };

    return this.http
      .post(url, values, opts)
      .pipe(map((response: any) => response));
  }


  public Master_NH_SubFamilien_Publish(values: string) {
    var url = this.urlNHMaster + "/publish_subfamilias";
    var Authorization = localStorage.getItem("registerToken");

    if (Authorization == null) {
      Authorization = "KK";
    }

    let headers = new HttpHeaders({
      Authorization: Authorization,
      "Content-Type": "application/json",
    });

    let opts = {
      headers: headers,
    };

    return this.http
      .post(url, values, opts)
      .pipe(map((response: any) => response));
  }

  public Master_NH_SubFamilien(familie: string) {
    var url: string = this.urlNHMaster + "/subfamilias_filter/" + familie;
    return this.http.get(url).pipe(map((response: any) => response));
  }

  public Master_NH_Farben_GetURL() {
    return this.urlNHMaster + "/colores";
  }

  public Master_NH_Farben_Get() {
    var url = this.urlNHMaster + "/colores";
    //return this.http.get(url).map((res: Response) => res.json());
    return this.http.get(url).pipe(map((response: any) => response));
  }

  public Master_NH_Farben_Set(values: string) {
    var url = this.urlNHMaster + "/color";
    var Authorization = localStorage.getItem("registerToken");

    if (Authorization == null) {
      Authorization = "KK";
    }

    let headers = new HttpHeaders({
      Authorization: Authorization,
      "Content-Type": "application/json",
    });

    let opts = {
      headers: headers,
    };

    return this.http
      .post(url, values, opts)
      .pipe(map((response: any) => response));
    //return this.http.post(url, values, {headers: headers} ).pipe(map((response:any) => response));
  }

  public Master_NH_Farben_Publish(values: string) {
    var url: string = this.urlNHMaster + "/publish_colores";
    var Authorization = localStorage.getItem("registerToken");

    if (Authorization == null) {
      Authorization = "KK";
    }

    let headers = new HttpHeaders({
      Authorization: Authorization,
      "Content-Type": "application/json",
    });

    let opts = {
      headers: headers,
    };

    return this.http
      .post(url, values, opts)
      .pipe(map((response: any) => response));
    //return this.http.post(url, values, {headers: headers} ).pipe(map((response:any) => response));
  }

  public Master_NH_Farben() {
    var url: string = this.urlNHMaster + "/colores_filter/";
    //return this.http.get(url).map((res: Response) => res.json());
    return this.http.get(url).pipe(map((response: any) => response));
  }

  public Master_NH_Calidad_GetURL() {
    return this.urlNHMaster + "/calidades";
  }

  public Master_NH_Calidad_Set(values: string) {
    var url: string = this.urlNHMaster + "/composicion";
    var Authorization = localStorage.getItem("registerToken");

    if (Authorization == null) {
      Authorization = "KK";
    }

    let headers = new HttpHeaders({
      Authorization: Authorization,
      "Content-Type": "application/json",
    });

    let opts = {
      headers: headers,
    };

    return this.http
      .post(url, values, opts)
      .pipe(map((response: any) => response));
    //return this.http.post(url, values, {headers: headers} ).pipe(map((response:any) => response));
  }

  public Master_NH_Calidad_Publish(values: string) {
    var url: string = this.urlNHMaster + "/publish_calidades";
    var Authorization = localStorage.getItem("registerToken");

    if (Authorization == null) {
      Authorization = "KK";
    }

    let headers = new HttpHeaders({
      Authorization: Authorization,
      "Content-Type": "application/json",
    });

    let opts = {
      headers: headers,
    };

    return this.http
      .post(url, values, opts)
      .pipe(map((response: any) => response));
    //return this.http.post(url, values, {headers: headers} ).pipe(map((response:any) => response));
  }

  public Master_NH_Calidades(familie: string) {
    var url: string = this.urlNHMaster + "/calidades_filter/" + familie;
    //return this.http.get(url).map((res: Response) => res.json());
    return this.http.get(url).pipe(map((response: any) => response));
  }

  public Master_NH_Composicion_GetURL() {
    return this.urlNHMaster + "/composiciones";
  }

  public Master_NH_Composicion_Set(values: string) {
    var url: string = this.urlNHMaster + "/composicion";
    var Authorization = localStorage.getItem("registerToken");

    if (Authorization == null) {
      Authorization = "KK";
    }

    let headers = new HttpHeaders({
      Authorization: Authorization,
      "Content-Type": "application/json",
    });

    let opts = {
      headers: headers,
    };

    return this.http
      .post(url, values, opts)
      .pipe(map((response: any) => response));
    //return this.http.post(url, values, {headers: headers} ).pipe(map((response:any) => response));
  }

  public Master_NH_Composicion_Publish(values: string) {
    var url: string = this.urlNHMaster + "/publish_composiciones";
    var Authorization = localStorage.getItem("registerToken");

    if (Authorization == null) {
      Authorization = "KK";
    }

    let headers = new HttpHeaders({
      Authorization: Authorization,
      "Content-Type": "application/json",
    });

    let opts = {
      headers: headers,
    };

    return this.http
      .post(url, values, opts)
      .pipe(map((response: any) => response));
    //return this.http.post(url, values, {headers: headers} ).pipe(map((response:any) => response));
  }

  public Master_NH_Composiciones() {
    var url = this.urlNHMaster + "/composiciones_filter/";
    //return this.http.get(url).map((res: Response) => res.json());
    return this.http.get(url).pipe(map((response: any) => response));
  }

  public Master_NH_Categoria_GetURL() {
    return this.urlNHMaster + "/categorias";
  }

  public Master_NH_Categoria_Set(values: string) {
    var url = this.urlNHMaster + "/categoria";
    var Authorization = localStorage.getItem("registerToken");

    if (Authorization == null) {
      Authorization = "KK";
    }

    let headers = new HttpHeaders({
      Authorization: Authorization,
      "Content-Type": "application/json",
    });

    let opts = {
      headers: headers,
    };

    return this.http
      .post(url, values, opts)
      .pipe(map((response: any) => response));
    //return this.http.post(url, values, {headers: headers} ).pipe(map((response:any) => response));
  }

  public Master_NH_Categoria_Publish(values: string) {
    var url = this.urlNHMaster + "/publish_categorias";
    var Authorization = localStorage.getItem("registerToken");

    if (Authorization == null) {
      Authorization = "KK";
    }

    let headers = new HttpHeaders({
      Authorization: Authorization,
      "Content-Type": "application/json",
    });

    let opts = {
      headers: headers,
    };

    return this.http
      .post(url, values, opts)
      .pipe(map((response: any) => response));
    //return this.http.post(url, values, {headers: headers} ).pipe(map((response:any) => response));
  }

  public Master_NH_Articulo_GetURL(
    criterio: string,
    alias: string,
    barras: string,
    familia: string,
    subfamilia: string,
    color: string,
    composicion: string,
    calidad: string,
    publicados: boolean,
    categoria: number
  ) {
    return (
      this.urlNHMaster +
      "/articulos/" +
      criterio +
      "/" +
      alias +
      "/" +
      barras +
      "/" +
      familia +
      "/" +
      subfamilia +
      "/" +
      color +
      "/" +
      composicion +
      "/" +
      calidad +
      "/" +
      publicados +
      "/" +
      categoria
    );
  }

  public Master_NH_Articulo_Set(values: string) {
    var url = this.urlNHMaster + "/articulo";
    var Authorization = localStorage.getItem("registerToken");

    if (Authorization == null) {
      Authorization = "KK";
    }

    let headers = new HttpHeaders({
      Authorization: Authorization,
      "Content-Type": "application/json",
    });

    let opts = {
      headers: headers,
    };

    return this.http
      .post(url, values, opts)
      .pipe(map((response: any) => response));
    //return this.http.post(url, values, {headers: headers} ).pipe(map((response:any) => response));
  }

  public Master_NH_Articulo_Publish(values: string) {
    var url = this.urlNHMaster + "/publish_articulos";
    var Authorization = localStorage.getItem("registerToken");

    if (Authorization == null) {
      Authorization = "KK";
    }

    let headers = new HttpHeaders({
      Authorization: Authorization,
      "Content-Type": "application/json",
    });

    let opts = {
      headers: headers,
    };

    return this.http
      .post(url, values, opts)
      .pipe(map((response: any) => response));
    //return this.http.post(url, values, {headers: headers} ).pipe(map((response:any) => response));
  }

  public Master_NH_Usuario_GetURL() {
    return this.urlNHMaster + "/users";
  }

  public Master_NH_Usuario_Set(values: string) {
    var url = this.urlNHMaster + "/register";
    var Authorization = localStorage.getItem("registerToken");

    if (Authorization == null) {
      Authorization = "KK";
    }

    let headers = new HttpHeaders({
      Authorization: Authorization,
      "Content-Type": "application/json",
    });

    let opts = {
      headers: headers,
    };

    return this.http
      .post(url, values, opts)
      .pipe(map((response: any) => response));
  }

  public Master_NH_Upload_URL(idrow: string, name: string, tipo: string) {
    return (
      this.urlNHMaster + "/impresion_image/" + idrow + "/" + name + "/" + tipo
    );
  }

  public Upload_URL(route: string) {
    return this.urlNHMaster + "/sm" + route;
  }

  public Upload_URL_ID(route: string, parameter: number) {
    return this.urlNHMaster + route + "/" + parameter;
  }

  public Master_NH_Upload_GetURL(idrow: string) {
    return this.urlNHMaster + "/images/" + idrow;
  }

  public Master_NH_Upload_Tarifa_URL(idrow: string, tipo: string) {
    return this.urlNHMaster + "/tarifa_file/" + idrow + "/" + tipo;
  }

  public Master_NH_Upload_Invoice_URL(name: string) {
    return this.urlNHMaster + "/invoice/" + name;
  }

  public Master_NH_Upload_File_URL(name: string) {
    return this.urlCDFiles + name;
  }

  /*
    public Notify(route:string){
     var headers = new Headers();
     headers.append('Access-Control-Allow-Origin','*');
     return this.http.get(route, {headers: headers}).map((res: Response) => res.json());
 }
 */

  public Docs_HTTP_Get(route: string) {
    var Authorization = localStorage.getItem("registerToken") || "KK";
    var url = this.docs_api + "/api/haru" + route;
    let headers = new HttpHeaders({
      Authorization: Authorization,
      "Content-Type": "application/json",
    });
    let opts = {
      headers: headers,
    };
    return this.http.get(url, opts).pipe(map((response: any) => response));
  }

  public Docs_HTTP_Post(route: string, values: string) {
    var Authorization = localStorage.getItem("registerToken") || "KK";
    var url = this.docs_api + "/api/haru" + route;
    let headers = new HttpHeaders({
      Authorization: Authorization,
      "Content-Type": "application/json",
    });
    return this.http
      .post(url, values, { headers: headers })
      .pipe(map((response: any) => response));
  }

  public HTTP_Get(route: string) {
    var Authorization = localStorage.getItem("registerToken");
    var url = this.urlNHBase + route;

    if (Authorization == null) {
      Authorization = "KK";
    }

    let headers = new HttpHeaders({
      Authorization: Authorization,
      "Content-Type": "application/json",
    });

    return this.http
      .get(url, { headers: headers })
      .pipe(map((response: any) => response));
  }

  public HTTP_Post(route: string, values: string) {
    var Authorization = localStorage.getItem("registerToken");

    if (Authorization == null) {
      Authorization = "KK";
    }

    var url: string = this.urlNHMaster + route;
    let headers = new HttpHeaders({
      Authorization: Authorization,
      "Content-Type": "application/json",
    });
    return this.http
      .post(url, values, { headers: headers })
      .pipe(map((response: any) => response));
  }

  public HTTP_Put(route: string, values: string) {
    var Authorization = localStorage.getItem("registerToken");

    if (Authorization == null) {
      Authorization = "KK";
    }

    var url: string = this.urlNHMaster + route;
    let headers = new HttpHeaders({
      Authorization: Authorization,
      "Content-Type": "application/json",
    });
    return this.http
      .put(url, values, { headers: headers })
      .pipe(map((response: any) => response));
  }

  public HTTP_Delete(route: string) {
    var Authorization = localStorage.getItem("registerToken");

    if (Authorization == null) {
      Authorization = "KK";
    }

    var url: string = this.urlNHMaster + route;
    let headers = new HttpHeaders({
      Authorization: Authorization,
      "Content-Type": "application/json",
    });
    return this.http
      .delete(url, { headers: headers })
      .pipe(map((response: any) => response));
  }

  public HTTP_Url_Get(route: string) {
    var url = this.host_ip + "/api" + route;
    return url;
  }

  public Authenticate(route: string, values: string) {
    var url: string = this.urlNHMaster + route;
    let headers = new HttpHeaders({
      "Content-Type": "application/json",
    });
    return this.http
      .post(url, values, { headers: headers })
      .pipe(map((response: any) => response));
  }

  public LoadProvinces() {
    return new Promise((resolve, reject) => {
      this.http
        .get("assets/json/provincias.json")
        .pipe(map((response: any) => response));
    });
  }

  logout() {
    // remove user from local storage to log user out
    localStorage.clear();
  }
}
