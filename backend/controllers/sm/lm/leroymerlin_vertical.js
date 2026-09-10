'use strict'

function Vertical_AnchoLama(req,res){

var values = [
    {'id' : '089', 'name' : '89 mm'},
    {'id' : '127', 'name' : '127 mm'}
    ]
     res.setHeader('Content-Type', 'application/json');
     res.status(200).send(JSON.stringify(values));
 }

function Vertical_PosicionMecanismo(req,res){

var values = [
     {'id' : 'IZ', 'name' : 'Izquierda'},
     {'id' : 'DE', 'name' : 'Derecha'}
     ]
     res.setHeader('Content-Type', 'application/json');
     res.status(200).send(JSON.stringify(values));
 }

function Vertical_ColorRiel(req,res){

var values = [
    {'id' : 'BLA', 'name' : 'Blanco'},
    {'id' : 'NEG', 'name' : 'Negro'},
    {'id' : 'GRI', 'name' : 'Gris'}
    ]
     res.setHeader('Content-Type', 'application/json');
     res.status(200).send(JSON.stringify(values));
}


function Vertical_Accionamiento(req,res){

var values = [
  	{'id' : 'COR', 'name' : 'Cordón'},
    {'id' : 'VAR', 'name' : 'Varilla'}
    ]
     res.setHeader('Content-Type', 'application/json');
     res.status(200).send(JSON.stringify(values));
}

function Vertical_TipoSoporte(req,res){

var values = [
    {'id' : 'TEC', 'name' : 'Techo'},
    {'id' : 'P08', 'name' : 'Pared 8 cm'},
    {'id' : 'P12', 'name' : 'Pared 12 cm'},
    {'id' : 'P15', 'name' : 'Pared 15 cm'}
    ]
     res.setHeader('Content-Type', 'application/json');
     res.status(200).send(JSON.stringify(values));
}

function Vertical_TipoRecogida(req,res){

var values = [
                              
    {'id' : 'IZ', 'name' : 'Izquierda'},
    {'id' : 'DE', 'name' : 'Derecha'},
    {'id' : 'RC', 'name' : 'Recogida Central'},
    {'id' : 'A', 'name' : 'Recogida Ambos Lados'}
   ]
     res.setHeader('Content-Type', 'application/json');
     res.status(200).send(JSON.stringify(values));
}

module.exports = {
	Vertical_AnchoLama,
	Vertical_PosicionMecanismo,
	Vertical_ColorRiel,
	Vertical_Accionamiento,
	Vertical_TipoSoporte,
	Vertical_TipoRecogida
}
