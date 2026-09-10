
export class BestellungLineType {

  public line: number;
  public article: number;
  public desc: string;
  public cant: number;
  public ud: number;
  public ref: string;
  public obs: string;
  public pre: number;
  public dto: number
  public dtov: number;
  public tiva: number
  public iva: number;

  public mbase!: number;
  public miva!: number;
  public mtotal!: number;


  constructor(line: number, article: number, desc: string, cant: number, ud: number, ref: string, obs: string, pre: number, dto: number, dtov: number, tiva: number, iva: number) {
    this.line = line;
    this.article = article;
    this.desc = desc;
    this.cant = cant;
    this.ud = ud;
    this.ref = ref;
    this.obs = obs;
    this.pre = pre;
    this.dto = dto;
    this.dtov = dtov;
    this.tiva = tiva;
    this.iva = iva;

    this.Calculate();
  }


  public Calculate() {

    this.mbase = ((this.cant * this.pre) * (1 - 0.01 * this.dto) - this.dtov);
    this.miva = this.mbase * (0.01 * this.iva);
    this.mtotal = this.mbase + this.miva;

  }
}
