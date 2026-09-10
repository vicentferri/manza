export class MenuItem {
	
	ImageURL : string;
	Label    : string;
	Ref      : string;
	PVP      : number;
	C1       : string;


	constructor (ImageURL:string,Label:string,Ref:string,PVP:number,C1:string)
	{
		this.ImageURL = ImageURL;
		this.Label    = Label;
		this.Ref      = Ref;
		this.PVP      = PVP;
		this.C1       = C1;
	}
}