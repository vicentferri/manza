'use script'

var sql = require('mssql');

function  fechafabricacion(req,res)
{
	var cliente    = req.params.cliente;
	var producto   = req.params.producto;
    var tejido     = req.params.tejido;
    var entrega    = req.params.entrega;

    var d2         = 0;
    var m2         = 0;
    var y2         = 0;
    var d3         = 0;
    var m3         = 0;
    var y3         = 0;
    var dt         = 0;


	var request = new sql.Request();
        request.input('cliente',sql.Int,cliente);
		request.input('producto',sql.Int,producto);
		request.input('tejido',sql.Int,tejido);
        request.input('entrega',sql.Int,entrega);
		request.output('d2',sql.Int,d2);
        request.output('m2',sql.Int,m2);
        request.output('y2',sql.Int,y2);
        request.output('d3',sql.Int,d3);
        request.output('m3',sql.Int,m3);
        request.output('y3',sql.Int,y3);
        request.output('dt',sql.Int,dt);
        request.execute('sp_fechafabricacion', 
        function(err, recordsets, returnValue) {

            if (err == null)
            {       
                if (recordsets.returnValue == null)
                {
                    res.status(500).send({message: 'KO'});
                }
                else
                {
					d2 = recordsets.output.d2;
                    m2 = recordsets.output.m2;
                    y2 = recordsets.output.y2;
                    d3 = recordsets.output.d3;
                    m3 = recordsets.output.m3;
                    y3 = recordsets.output.y3;
                    dt = recordsets.output.dt;

                    res.status(200).send({message: 'OK',d2:d2,m2:m2,y2:y2,d3:d3,m3:m3,y3:y3,dt:dt});
                }
            }
            else 
            {
                console.log(err);
                res.status(500).send({message: 'KO'});
            }
           
            });
}

module.exports = {
	fechafabricacion
}