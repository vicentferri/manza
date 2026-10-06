var https = require('https');
var fs = require('fs');
var path = require('path');
var bodyParser = require('body-parser');
var compression = require('compression');
var express = require('express');
var sql = require('mssql');
var cors = require("cors");

var app = express();

const html = fs.existsSync(__dirname + '/dist/')
    ? __dirname + '/dist/'
    : (fs.existsSync(path.normalize(__dirname + '/../frontend/dist/manza/'))
        ? path.normalize(__dirname + '/../frontend/dist/manza/')
        : __dirname + '/dist/');

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

// Configuración por entorno: backend/.env (no versionado) sobreescribe los valores de producción.
// Formato: CLAVE=valor por línea. Ver .env.example.
var envFile = path.join(__dirname, '.env');
if (fs.existsSync(envFile)) {
    fs.readFileSync(envFile, 'utf8').split(/\r?\n/).forEach(function (line) {
        var m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
        if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2];
    });
}

var porth = parseInt(process.env.PORT || '8080');

var config = {
    user : process.env.DB_USER || 'sa',
    password: process.env.DB_PASSWORD || 'Cq4iz5Tsq9',
    server : process.env.DB_SERVER || '92.222.16.22',
    database : process.env.DB_NAME || 'SOLARMANES_DEV',
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

app.get('/api', function(req, res){
    res.json({ status: 'ok', message: 'API SolarManes Backend Online' });
});

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
    var indexPath = path.join(html, 'index.html');
    if (fs.existsSync(indexPath)) {
        var stream = fs.createReadStream(indexPath);
        stream.on('error', function(err){
            if (!res.headersSent) res.status(500).send(err.message);
        });
        stream.pipe(res);
    } else {
        res.status(200).send('API SolarManes Backend Online');
    }
});

// Errores lanzados dentro de una ruta: se registran y se responde JSON sin la traza
// (la página por defecto de Express enseña rutas y código del servidor).
app.use(function(err, req, res, next){
    console.error('[ruta]', req.method, req.originalUrl, err);
    if (res.headersSent) return next(err);
    var status = err.status || 500;
    res.status(status).json({message:'KO', error: status < 500 ? 'Petición no válida' : 'Error interno del servidor'});
});





// Red de seguridad: un error no capturado dentro de un callback (p. ej. una línea mal formada
// en un controlador) se registra y no tumba el servidor para todos los usuarios.
process.on('uncaughtException', function (err) {
    console.error('[uncaughtException]', new Date().toISOString(), err);
});
process.on('unhandledRejection', function (reason) {
    console.error('[unhandledRejection]', new Date().toISOString(), reason);
});

var httpsServer = https.createServer(options, app);

// Si no se puede escuchar (puerto ocupado, certificado...), salir: un proceso sin puerto no sirve.
httpsServer.on('error', function (err) {
    console.error('[server]', err.message);
    process.exit(1);
});

httpsServer.listen(porth, function(){
      console.log('Port:' + porth);
      console.log('Html:' + html);
    });


