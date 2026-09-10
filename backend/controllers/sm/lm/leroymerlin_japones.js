'use strict'

function Japones_NumeroVias(req,res){


 var values = [
 	{'id' : '2', 'name' : 'Riel 2 Vias'},
 	{'id' : '3', 'name' : 'Riel 3 Vias'},
 	{'id' : '4', 'name' : 'Riel 4 Vias'},
 	{'id' : '5', 'name' : 'Riel 5 Vias'}
 ]

 res.setHeader('Content-Type', 'application/json');
 res.status(200).send(JSON.stringify(values));
 
}

function Japones_ColorMecanismo(req,res){


 var values = [
 	{'id' : 'BLANCO', 'name' : 'BLANCO'}
 	
 ]

 res.setHeader('Content-Type', 'application/json');
 res.status(200).send(JSON.stringify(values));
 
}


function Japones_PosicionMando(req,res){

	var values = [
        {'id' : 'IZ', 'name' : 'Izquierda'},
        {'id' : 'DE', 'name' : 'Derecha'},
        {'id' : 'SM', 'name' : 'Sin Mando'}
        ]
    res.setHeader('Content-Type', 'application/json');
    res.status(200).send(JSON.stringify(values));
}
                                                   
function Japones_Recogida(req,res){

    var values = [                                                   
        {'id' : 'IZ', 'name' : 'Izquierda'},
        {'id' : 'DE', 'name' : 'Derecha'},
        {'id' : 'RC', 'name' : 'Recogida Central'}
    	]
    res.setHeader('Content-Type', 'application/json');
    res.status(200).send(JSON.stringify(values));
}
 
function Japones_TipodeSoporte(req,res){

    var values = [                                               
        {'id' : 'TEC', 'name' : 'Techo'},
        {'id' : 'P08', 'name' : 'Pared 8 cm'},
        {'id' : 'P12', 'name' : 'Pared 12 cm'},
        {'id' : 'P15', 'name' : 'Pared 15 cm'}
        ]
     res.setHeader('Content-Type', 'application/json');
     res.status(200).send(JSON.stringify(values));
}
 
function Japones_Contrapeso(req,res){

    var values = [                                              
        {'id' : '1', 'name' : 'SI'},
        {'id' : '0', 'name' : 'NO'}
        ]

     res.setHeader('Content-Type', 'application/json');
     res.status(200).send(JSON.stringify(values));
 }
                                                  

module.exports = {
Japones_NumeroVias,
Japones_ColorMecanismo,
Japones_PosicionMando,
Japones_Recogida,
Japones_TipodeSoporte,
Japones_Contrapeso
}