'use strict'

var bcrypt = require('bcrypt-nodejs');
var sql = require('mssql');
var services = require('../../services/jwt.js');

// ─────────────────────────────────────────────────────────────────────────────
// REGISTRO DE USUARIO INTERNO
// ─────────────────────────────────────────────────────────────────────────────
function register(req, res) {
    var params = req.body;
    var password = params.password;

    bcrypt.hash(password, null, null, function (error, hash) {
        password = hash;
        var request = new sql.Request();
        request.input('idrow',     sql.Int,          params.idrow);
        request.input('name',      sql.VarChar(100),  params.name || params.nombre);
        request.input('surname',   sql.VarChar(100),  params.surname || params.apellidos);
        request.input('email',     sql.VarChar(255),  params.email);
        request.input('password',  sql.VarChar(100),  password);
        request.input('role',      sql.VarChar(255),  params.role);
        request.input('empresa',   sql.Int,           params.empresa);
        request.input('subempresa',sql.Int,           params.subempresa);
        request.input('ambito',    sql.VarChar(1),    params.ambito || 'I');
        request.input('isAdmin',   sql.Bit,           params.isAdmin ? 1 : 0);

        request.execute('Users_Add', function (err, recordsets) {
            if (err == null) {
                if (recordsets.returnValue == null) {
                    res.status(500).send({ message: 'KO' });
                } else {
                    res.status(200).send({ message: 'OK' });
                }
            } else {
                console.log(err);
                res.status(500).send({ message: 'KO' });
            }
        });
    });
}

// ─────────────────────────────────────────────────────────────────────────────
// LISTADO DE USUARIOS INTERNOS
// ─────────────────────────────────────────────────────────────────────────────
function users(req, res) {
    var sqlquery = "SELECT idrow, name, surname, role, email, alta, password, username, ";
    sqlquery += " ISNULL(isAdmin, 0) AS isAdmin, ";
    sqlquery += " (CASE WHEN ambito = 'I' OR ambito = 'Interno' THEN 'Interno' ELSE 'Externo' END) AS ambito, ";
    sqlquery += " url, code, nombre, language, ACTIVO ";
    sqlquery += " FROM vw_users ORDER BY name";

    new sql.Request().query(sqlquery, (err, result) => {
        if (err == null) {
            res.status(200).send({ Table: result.recordset });
        } else {
            console.error('Error en endpoint users():', err);
            res.status(500).send({ message: err });
        }
    });
}

// ─────────────────────────────────────────────────────────────────────────────
// ELIMINAR USUARIO INTERNO
// ─────────────────────────────────────────────────────────────────────────────
function user_del(req, res) {
    var params = req.body;
    var values = params.ids;

    var request = new sql.Request();
    request.input('values', sql.VarChar(2500), values);
    request.execute('sp_users_del', function (err, recordsets) {
        if (err == null) {
            if (recordsets.returnValue == null) {
                res.status(500).send({ message: 'KO' });
            } else {
                res.status(200).send({ message: 'OK' });
            }
        } else {
            console.log(err);
            res.status(500).send({ message: 'KO' });
        }
    });
}

// ─────────────────────────────────────────────────────────────────────────────
// AUTENTICACIÓN: doble consulta USERS → CLIENTES_USERS
// ─────────────────────────────────────────────────────────────────────────────
function Authenticate(req, res) {
    var usuario  = req.body.username;
    var password = req.body.password;

    // Función auxiliar para construir y enviar la respuesta de login
    function responderLogin(u, tipo, isAdmin, permisos, urlBase) {
        var userPayload = {
            idrow:       u.idrow,
            name:        u.name,
            surname:     u.surname,
            email:       u.email,
            role:        u.role,
            empresa:     u.empresa,
            subempresa:  u.subempresa,
            ambito:      u.ambito,
            integracion: u.integracion,
            username:    u.username,
            url:         urlBase,
            code:        u.code,
            nombre:      u.nombre,
            language:    u.language,
            tipo:        tipo,
            isAdmin:     isAdmin,
            permisos:    permisos
        };

        var token = services.createToken(userPayload);
        var fullName = (u.name || '') + ' ' + (u.surname || '');

        res.status(200).send({
            ret:         'OK',
            message:     'Accepted',
            token:       token,
            name:        fullName,
            role:        u.role,
            emp:         u.empresa,
            subemp:      u.subempresa,
            user:        u.idrow,
            descemp:     u.descempresa,
            descsubemp:  u.descsubempresa,
            ambito:      u.ambito,
            integracion: u.integracion,
            username:    u.username,
            url:         urlBase,
            code:        u.code,
            nombre:      u.nombre,
            language:    u.language,
            tipo:        tipo,
            isAdmin:     isAdmin,
            permisos:    permisos
        });
    }

    // CONSULTA 1: Buscar en USERS (empleados internos)
    var sqlInterno = "SELECT idrow, password, empresa, subempresa, name, surname, role, email, ambito, " +
                     "integracion, ISNULL(url, '/routes') AS url, code, nombre, language, username, " +
                     "ISNULL(isAdmin, 0) AS isAdmin, ISNULL(ACTIVO, 0) AS activo, " +
                     "(SELECT nomfiscal FROM nh_clientes WHERE idcliente = USERS.EMPRESA) AS descempresa, " +
                     "(SELECT nombre FROM NH_CLIENTES_DOMICILIOS WHERE idrow = USERS.SUBEMPRESA) AS descsubempresa " +
                     "FROM USERS WHERE (username = '" + usuario + "' OR email = '" + usuario + "' OR (email = 'jmartinez@solarmanes.es' AND '" + usuario + "' = 'admin')) AND (ambito = 'I' OR ambito = 'Interno')";

    new sql.Request().query(sqlInterno, (err, resInterno) => {
        if (!err && resInterno.recordset.length === 1) {
            var u = resInterno.recordset[0];
            bcrypt.compare(password, u.password, (errB, ret) => {
                if (!ret) {
                    return res.status(500).send({ ret: 'KO', message: 'User not exists/Password not right' });
                }
                var activo = u.activo === 1 || u.activo === true;
                if (!activo) {
                    return res.status(403).send({ ret: 'KO', message: 'Usuario inactivo. Contacte con el administrador.' });
                }
                var isAdmin = u.isAdmin === 1 || u.isAdmin === true;
                if (isAdmin) {
                    return responderLogin(u, 'interno', true, ['*'], '/routes');
                } else {
                    // Cargar permisos del usuario interno estándar
                    new sql.Request().query(
                        "SELECT modulo FROM dbo.USERS_PERMISOS WHERE id_usuario = " + u.idrow,
                        (errP, resP) => {
                            var permisos = (!errP && resP.recordset) ? resP.recordset.map(r => r.modulo) : [];
                            return responderLogin(u, 'interno', false, permisos, '/routes');
                        }
                    );
                }
            });
        } else {
            // CONSULTA 2: No es empleado interno → buscar en CLIENTES_USERS
            var sqlCliente = "SELECT idrow, password, empresa, subempresa, name, surname, role, email, ambito, " +
                             "integracion, ISNULL(url, '/manza/config/') AS url, code, nombre, language, username, " +
                             "ISNULL(ACTIVO, 0) AS activo, " +
                             "(SELECT nomfiscal FROM nh_clientes WHERE idcliente = CLIENTES_USERS.EMPRESA) AS descempresa, " +
                             "(SELECT nombre FROM NH_CLIENTES_DOMICILIOS WHERE idrow = CLIENTES_USERS.SUBEMPRESA) AS descsubempresa " +
                             "FROM CLIENTES_USERS WHERE username = '" + usuario + "'";

            new sql.Request().query(sqlCliente, (errCli, resCli) => {
                if (!errCli && resCli.recordset.length === 1) {
                    var c = resCli.recordset[0];
                    bcrypt.compare(password, c.password, (errB2, ret2) => {
                        if (!ret2) {
                            return res.status(500).send({ ret: 'KO', message: 'User not exists/Password not right' });
                        }
                        var activoCli = c.activo === 1 || c.activo === true;
                        if (!activoCli) {
                            return res.status(403).send({ ret: 'KO', message: 'Usuario inactivo. Contacte con el administrador.' });
                        }
                        // Cliente: solo acceso a /manza/config/, sin permisos en /routes
                        return responderLogin(c, 'cliente', false, [], '/manza/config/');
                    });
                } else {
                    return res.status(500).send({ ret: 'KO', message: 'User not exists/Password not right' });
                }
            });
        }
    });
}

// ─────────────────────────────────────────────────────────────────────────────
// PERMISOS DE USUARIOS INTERNOS
// ─────────────────────────────────────────────────────────────────────────────
function getPermisos(req, res) {
    var idUsuario = req.params.id;
    var request = new sql.Request();
    request.input('idUsuario', sql.Int, idUsuario);
    request.query("SELECT modulo FROM dbo.USERS_PERMISOS WHERE id_usuario = @idUsuario", (err, result) => {
        if (err) return res.status(500).send({ message: err });
        res.status(200).send({ permisos: result.recordset.map(r => r.modulo) });
    });
}

function savePermisos(req, res) {
    var idUsuario = req.params.id;
    var permisos  = req.body.permisos || [];
    var request   = new sql.Request();
    request.input('idUsuario', sql.Int, idUsuario);

    request.query("DELETE FROM dbo.USERS_PERMISOS WHERE id_usuario = @idUsuario", (err) => {
        if (err) return res.status(500).send({ message: err });
        if (permisos.length === 0) return res.status(200).send({ message: 'OK' });

        var insertQuery = "INSERT INTO dbo.USERS_PERMISOS (id_usuario, modulo) VALUES ";
        var values = permisos.map(mod => "(" + parseInt(idUsuario) + ", '" + mod.replace(/'/g, '') + "')");
        insertQuery += values.join(", ");

        new sql.Request().query(insertQuery, (errInsert) => {
            if (errInsert) return res.status(500).send({ message: errInsert });
            res.status(200).send({ message: 'OK' });
        });
    });
}

module.exports = {
    users,
    register,
    user_del,
    Authenticate,
    getPermisos,
    savePermisos
}
