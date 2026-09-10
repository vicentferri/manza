'use strict'

var sql = require('mssql');




function Simulation(req,res){

		var body = req.body;

		res.status(200).send({message:"OK"});	
}


module.exports = {
	Simulation
}