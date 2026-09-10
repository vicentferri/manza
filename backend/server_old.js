'use strict'

const html = __dirname + '/dist/';



var fs = require('fs');
var path = require('path');
var bodyParser = require('body-parser');
var compression = require('compression');
var express = require('express');
var sql = require('mssql');

var app = express();

var AllowCrossDomain = function(req,res,next){
    res.header('Access-Control-Allow-Origin','*'); 
    res.header('Access-Control-Allow-Methods','POST,GET,PUT,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers','X-Requested-With,Content-Type,Authorization');
    res.header('Access-Control-Allow-Credentials',true);
    next();
};

var master_routes = require('./routes/routes');
var sm_routes = require('./routes/sm_routes');
var lm_routes = require('./routes/link_routes');

app.use(compression());
app.use(bodyParser.urlencoded({extended:true,limit: '100mb'}));
app.use(bodyParser.json({limit: '100mb'}));
app.use(bodyParser.raw());
app.use(AllowCrossDomain);
app.use(express.static(html));

var port = process.env.PORT || 3001;


var config = {
    user : 'sa',
    password: 'Cq4iz5Tsq9',
    server : '92.222.16.22',
    database : 'SOLARMANES_DEV',
    language : 'es',
    options : {
        encrypt : false,
        enableArithAbort : true
    },
    connectionTimeout: 300000,
    requestTimeout: 300000,
    pool: {
        idleTimeoutMillis: 300000,
        max: 100
    }
};


var connection = sql.connect(config, function (err) {
    if (err) {
        console.log("NO ES POSIBLE CONECTAR CON LA BASE DE DATOS");
        throw err;
    }
});

module.exports = connection;

/* Generell API*/
app.use('/api',master_routes);

/* SolarManes Explicit API */
app.use('/api/sm',sm_routes);

app.use('/api/lm',lm_routes);



app.use(function(req, res, next){  
    // if the request is not html then move along
    var accept = req.accepts('html', 'json', 'xml', 'text');
    if(accept !== 'html'){
        return next();
    }

    // if the request has a '.' assume that it's for a file, move along
    var ext = path.extname(req.path);
    if (ext !== ''){
        return next();
    }
    fs.createReadStream(html + 'index.html').pipe(res);
});





app.listen(port, function(){

      var env = process.env.NODE_ENV;

	  console.log('Port:' + port + ',Html:' + html + ',env:' + env);
	});
	  
	  