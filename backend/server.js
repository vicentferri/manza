'use strict'

const html = __dirname + '/dist/';



var https = require('https');
var fs = require('fs');
var path = require('path');
var bodyParser = require('body-parser');
var compression = require('compression');
var express = require('express');
var sql = require('mssql');
var cors = require("cors");

var app = express();

var options = {
    key : fs.readFileSync('./Certificado/manzasm.key'),
    cert: fs.readFileSync('./Certificado/manzasm.crt')
};

var master_routes = require('./routes/routes');
var sm_routes = require('./routes/sm_routes');
var lm_routes = require('./routes/link_routes');

app.use(compression());
app.use(bodyParser.urlencoded({extended:true,limit: '100mb'}));
app.use(bodyParser.json({limit: '100mb'}));
app.use(bodyParser.raw());
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }));
app.use(express.static(html));

var porth = 8080;

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
    connectionTimeout: 900000,
    requestTimeout: 900000,
    pool: {
        idleTimeoutMillis: 900000,
        max: 500
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





var httpsServer = https.createServer(options, app);

httpsServer.listen(porth, function(){
      console.log('Port:' + porth);
      console.log('Html:' + html);
    });


