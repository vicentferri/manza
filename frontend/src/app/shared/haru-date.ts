export class HaruDate {
    
    fromDate : Date;
    toDate : Date;
    
    constructor(){
        this.fromDate = new Date();
        this.toDate = new Date();
    }
    
    set _fromDate(e){
        var es: string[]= e.split('-');
        let d = new Date(Date.UTC(Number(es[0]), Number(es[1])-1, Number(es[2])));
        this.fromDate.setFullYear(d.getUTCFullYear(), d.getUTCMonth(),d.getUTCDate()+1);
    }
    
    get _fromDate(){
        return this.fromDate.toISOString().substring(0,10);
    }
    
}


