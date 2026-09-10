'use strict'

var sql = require('mssql');

function bulk(req,res)
{
	var params = req.body;

	var ids = params.id;
	var table = params.table;
	var column = params.column;
	var field = params.field;
	var value = params.value;
	var type = params.type;
	var param1 = params.param1;
	var param2 = params.param2;
	var param3 = params.param3;

	var request = new sql.Request();
	    request.input('ids',sql.VarChar(2500),ids);
        request.input('table',sql.VarChar(255),table);
        request.input('column',sql.VarChar(50),column);
        request.input('field',sql.VarChar(50),field);
		request.input('value',sql.VarChar(8000),value);
		request.input('type',sql.Int,type);
		request.input('param1',sql.VarChar(50),param1);
		request.input('param2',sql.VarChar(50),param2);
		request.input('param3',sql.VarChar(50),param3);
        request.execute('sp_bulk_update', 
		function(err, recordsets, returnValue) {

			if (err == null)
			{		
				if (recordsets.returnValue == null)
				{
					res.status(500).send({message: 'KO'});
				}
				else
				{
					res.status(200).send({message: 'OK'});
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
	bulk
};


