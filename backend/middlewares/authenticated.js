'use strict'

var jwt = require('jwt-simple');
var moment = require('moment');

var secret = 'clave_secreta_del_curso_angular';


exports.ensureAuth = function(req,res,next){

	if (!req.headers.authorization){
		return res.status(404).send({message:'no tiene la autenticacion'});

	}

	var token = req.headers.authorization.replace(/['"']+/g,'');

	try
	{
		var payload = jwt.decode(token,secret);
		if (payload.exp <= moment().unix()){
			return res.status(401).send({
				message:'el token ha expirado'
			});
		}
	}
	catch(err)
	{
		return res.status(404).send({
				message:'el token no es valido'
			});

	}

	req.user = payload;

	next();
};

/* Sección "Nuevo sistema": solo estos usuarios (el login admite username o email, y en USERS son iguales) */
var USUARIOS_NUEVO_SISTEMA = ['jrumi@solarmanes.es', 'jmartinez@solarmanes.es'];

/* Va siempre después de ensureAuth, que rellena req.user con el token */
exports.ensureNuevoSistema = function(req,res,next){

	var email = String((req.user && req.user.email) || '').trim().toLowerCase();

	if (USUARIOS_NUEVO_SISTEMA.indexOf(email) === -1){
		return res.status(403).send({message:'no tiene acceso a Nuevo sistema'});
	}

	next();
};