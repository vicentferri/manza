'use strict';

var fs = require('fs');
var sql = require('mssql');
var path = require('path');

function publish_articulo_name(res,idrow,url,pos){

        var request = new sql.Request();
        request.input('idrow',sql.VarChar(2500),idrow);
        request.input('url',sql.VarChar(255),url);
        request.input('pos',sql.Int,pos);
        request.execute('sp_nh_articulo_imagen', 
        function(err, recordsets, returnValue) {

            if (err == null)
            {       
                if (recordsets.returnValue == null)
                {
                    res.status(500).send({message: 'ko'});
                }
                else
                {
                    res.status(200).send({message: 'ok'});
                }
            }
            else 
            {
                console.log(err);
                res.status(500).send({message: 'ko'});
            }
        });
 }

 function getImage(req,res){

    var name = req.params.name;
    var path_file = 'uploads/articles/' + name;
    //var path_file = './' + name;

    fs.exists(path_file, function(exists){

            if (exists){
                res.sendFile(path.resolve(path_file));
            } else {
                res.status(404).send({message: 'la imagen no existe'});
            }
    });

   

 }

function uploadImage(req,res){
    
    var id   = req.params.id;
    var name = req.params.name;
    var tipo = req.params.tipo;
    var filename = "No Subida";

    if (req.files)
    {

        var filePath  = req.files.image.path;
        var fileSplit = filePath.split('/');
        var fileName  = fileSplit[2];
        var fileExt   = fileName.split('.');
        var extfile   = fileExt[1];


        if (extfile == 'png' || extfile == 'jpg' || extfile == 'jpeg' || extfile == 'gif' ||
            extfile == 'PNG' || extfile == 'JPG' || extfile == 'JPEG' || extfile == 'GIF')
        {

            var destFile = fileSplit[0]+'/'+fileSplit[1]+'/'+name+'.'+extfile;
            if (tipo == 0){
                name     = req.files.image.originalFilename;
                destFile = fileSplit[0]+'/'+fileSplit[1]+'/'+name;
            }

            fs.rename(filePath,destFile, (err) => {
                if (err){
                    console.log(err);
                }
            });

            var tempName = name+'.'+extfile;
            publish_articulo_name(res,id,tempName,1)



        } else {

            fs.unlink(filePath, (err) => {

                if (err){
                    res.status(500).send({message:err});
                } else {
                    res.status(200).send({message:'Extensión no valida'});
                }
            })
            
        }

    } 
    else 
    {
        res.status(400).send({message:'no hay archivos'});
    }


}

module.exports = {
    uploadImage,
    getImage
};