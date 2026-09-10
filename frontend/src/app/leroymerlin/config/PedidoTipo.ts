import { CortinaTipo } from './CortinaTipo';

export class PedidoTipo {

    address : {
        name : string;
        lastname : string;
        business : string;
        nif : string;
        address : string;
        city : string;
        province : string;
        postcode : string;
        country : string;
        phone : string;
    }

    lines : Array<CortinaTipo>

}