'use strict'

var config = {
    user : 'sa',
    password: 'erpinnova',
    server : '127.0.0.1\\SQLEXPRESS',
    database : 'SOLARMANES',
    language : 'es',
    options : {
        encrypt : false
    }
};

function get(){
	return config;
}

module.exports = {
	get,
}