'use script'

var sql = require('mssql');


function cd_bestellung_detail(req,res)
{
	var id = req.params.id;


	var values = {

		header : {},
		lines : {}
	}


	res.status(200).send(values);
}


module.exports = {
	cd_bestellung_detail
}