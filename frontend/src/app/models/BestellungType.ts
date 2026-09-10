


export class BestellungType{

  public cif       : string;
  public nomfiscal : string;
  public dirfiscal : string;
  public cpfiscal  : string;
  public pobfiscal : string;
  public provfiscal : string;
  public telefono1 : string;
  public email1 :string;
  public paisfiscal : string;
  public observaciones : string;
  public nombrentrega : string;
  public domentrega : string;
  public cpentrega : string;
  public pobentrega : string;
  public proventrega : string;
  public paisentrega : string;
  public telefono2 : string;
  public email2 :string;


    constructor (){
      this.cif = "543345666X";
      this.nomfiscal = "OTRA PRUEBA DE CLIENTE";
      this.dirfiscal = "ADDRESS";
      this.cpfiscal = "Code";
      this.pobfiscal = "City";
      this.provfiscal = "Valencia";
      this.telefono1 = "Phone";
      this.email1="test@test.com";
      this.paisfiscal="1";
      this.observaciones="Enviar al apartado de correos";
      this.nombrentrega="Prueba 2";
      this.domentrega="ADDRESS 2";
      this.cpentrega="CODE 2";
      this.pobentrega="City 2";
      this.proventrega="Valencia";
      this.paisentrega="1";
      this.telefono2 = "Phone";
      this.email2="test@test.com";
    }
}
