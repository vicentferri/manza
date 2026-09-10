
export class KundeType {

	idenlace: number;
	idrow: number;
	cif: string;
	razonsocial: string;
	nombrecomercial: string;
	numero: number;
	area: number;
	tipo: number;
	delegacion: number;
	idioma: number;
	cuentacontable: number;
	pais: number;
	cp: string;
	provincia: string;
	provincianacional: number;
	domicilio: string;
	poblacion: string;
	telefono: string;
	movil: string;
	fax: string;
	email: string;
	web: string;
	formapago: number;
	mesnopago: number;
	iban: string;
	swift: string;
	dia1: number;
	dia2: number;
	dia3: number;

	aseg_aseguradora: number;
	aseg_poliza: string;
	aseg_codigo: string;
	aseg_alta: string;
	aseg_baja: string;
	aseg_concedido: number;
	aseg_maximo: number;
	aseg_actual: number;

	personacontacto: string;

	observaciones!: string;
	cadena!: string;
	gestion!: string;
	actividad!: string;
	sector!: string;
	origen!: string;



	constructor() {
		this.idenlace = -1;
		this.idrow = -1;
		this.cif = "CIF";
		this.razonsocial = "Razón Social del Cliente";
		this.nombrecomercial = "Nombre Comercial";
		this.numero = 1;
		this.area = 1;
		this.tipo = 1;
		this.delegacion = 1;
		this.idioma = 1;
		this.cuentacontable = 430000000;
		this.pais = 1;
		this.cp = "CP";
		this.provincia = "Provincia";
		this.provincianacional = 1;
		this.domicilio = "Domicilio";
		this.poblacion = "Poblacion";
		this.telefono = "Telefono";
		this.movil = "movil";
		this.fax = "fax";
		this.email = "perico@perico.com";
		this.web = "www.perico.com";
		this.formapago = 62;
		this.mesnopago = -1;
		this.iban = "IBAN";
		this.swift = "SWIFT";
		this.dia1 = 15;
		this.dia2 = 30;
		this.dia3 = 0;

		this.aseg_aseguradora = -1;
		this.aseg_poliza = "POLZZSASS";
		this.aseg_codigo = "COD000";
		this.aseg_alta = "01/01/2018";
		this.aseg_baja = "";
		this.aseg_concedido = 100000;
		this.aseg_maximo = 125000;
		this.aseg_actual = 90000;

		this.personacontacto = "";

	}

	public Reset(): number {
		this.idrow = -1;
		this.cif = "CIF";
		this.razonsocial = "Razón Social del Cliente";
		this.nombrecomercial = "Nombre Comercial";
		this.numero = 1;
		this.area = 1;
		this.tipo = 0;
		this.delegacion = 1;
		this.idioma = 1;
		this.cuentacontable = 430000000;
		this.pais = 1;
		this.cp = "CP";
		this.provincia = "Provincia";
		this.provincianacional = 1;
		this.domicilio = "Domicilio";
		this.poblacion = "Poblacion";
		this.telefono = "Telefono";
		this.movil = "movil";
		this.fax = "fax";
		this.email = "perico@perico.com";
		this.web = "www.perico.com";
		this.formapago = 62;
		this.mesnopago = -1;
		this.iban = "IBAN";
		this.swift = "SWIFT";
		this.dia1 = 15;
		this.dia2 = 30;
		this.dia3 = 0;

		this.aseg_aseguradora = -1;
		this.aseg_poliza = "";
		this.aseg_codigo = "";
		this.aseg_alta = "";
		this.aseg_baja = "";
		this.aseg_concedido = 0;
		this.aseg_maximo = 0;
		this.aseg_actual = 0;

		return 1;
	}
}