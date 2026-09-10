'use strict'

var sql = require('mssql');
//var parseXlsx = require('excel');
//import parseXlsx from 'excel';
var Excel = require('exceljs');
//var xlsx = require('xlsx');
//let parseXlsx = require('excel');


function regenerate(req,res){

    var idrow = req.body.idrow;
    var coef = req.body.coef;

    var request = new sql.Request();
        request.input('idrow',sql.Int,idrow);
        request.input('coeficiente',sql.Decimal(12,2),coef);
        request.execute('sp_tarifas_pvp_from_pvc', 
        function(err, recordsets, returnValue) {

            if (err == null)
            {       
                if (recordsets.returnValue == null)
                {
                    res.status(500).send({message: 'KO'});
                }
                else
                {
                    res.status(200).send({message: 'OK',idrow: recordsets.returnValue});
                }
            }
            else 
            {
                
                res.status(500).send({message: 'KO'});
            }
            });
}

function regenerate2(req,res){

    var idrow = req.body.idrow;
    var coef = req.body.coef;

    var request = new sql.Request();
        request.input('idrow',sql.Int,idrow);
        request.input('coeficiente',sql.Decimal(12,2),coef);
        request.execute('sp_tarifas_pvc_from_pvp', 
        function(err, recordsets, returnValue) {

            if (err == null)
            {       
                if (recordsets.returnValue == null)
                {
                    res.status(500).send({message: 'KO'});
                }
                else
                {
                    res.status(200).send({message: 'OK',idrow: recordsets.returnValue});
                }
            }
            else 
            {
                
                res.status(500).send({message: 'KO'});
            }
            });
}

function calculate(req,res){
	
	var cliente   = req.params.cliente;
	var tubo      = req.params.tubo;
	var tejido    = req.params.tejido;
	var marca     = req.params.marca;
	var ancho     = req.params.ancho;
	var alto      = req.params.alto;
    var impresion = req.params.impresion;
    var producto  = req.params.producto;
    var ancholama = req.params.ancholama;
	var a1        = 0;
	var a2        = '';
	
	var request = new sql.Request();
        request.input('clientes',sql.Int,cliente);
		request.input('tubos',sql.Int,tubo);
		request.input('tejidos',sql.Int,tejido);
		request.input('marcas',sql.Int,marca);
		request.input('Ancho',sql.Decimal(12,2),ancho);
		request.input('Alto',sql.Decimal(12,2),alto);
        request.input('impresion',sql.Int,impresion);
        request.input('producto',sql.Int,producto);
        request.input('ancholama',sql.Int,ancholama);
		request.output('v1',sql.Decimal(12,2),a1);
		request.output('v2',sql.VarChar(255),a2);
        request.execute('sp_tarifas_calculate_prices', 
        function(err, recordsets, returnValue) {

            if (err == null)
            {       
                if (recordsets.returnValue == null)
                {
                    res.status(500).send({message: 'KO'});
                }
                else
                {
					a1 = recordsets.output.v1;
					a2 = recordsets.output.v2;
                    res.status(200).send({message: 'OK',v1:a1,v2: a2});
                }
            }
            else 
            {
                
                res.status(500).send({message: 'KO'});
            }
            });
	
}

function delete_all(req,res){
	

	 var idrow = req.body.idrow;

     var request = new sql.Request();
        request.input('idrow',sql.Int,idrow);
        request.execute('sp_sm_tarifas_delete', 
        function(err, recordsets, returnValue) {

            if (err == null)
            {       
                if (recordsets.returnValue == null)
                {
                    res.status(500).send({message: 'KO'});
                }
                else
                {
                    res.status(200).send({message: 'OK',idrow: recordsets.returnValue});
                }
            }
            else 
            {
                
                res.status(500).send({message: 'KO'});
            }

           
            });
}

function delete_lines(req,res){

    var idrow = req.params.idrow;

     var request = new sql.Request();
        request.input('idrow',sql.Int,idrow);
        request.execute('sp_sm_tarifas_delete_lineas', 
        function(err, recordsets, returnValue) {

            if (err == null)
            {       
                if (recordsets.returnValue == null)
                {
                    res.status(500).send({message: 'KO'});
                }
                else
                {
                    res.status(200).send({message: 'OK',idrow: recordsets.returnValue});
                }
            }
            else 
            {
                
                res.status(500).send({message: 'KO'});
            }

           
            });
}

function process(req,res){

    var name      = req.params.name;
    var idrow     = req.params.idrow;
    var type      = req.params.type;
    
    console.log("process");
   
    var path_file = 'uploads/tarifas/' + name + '.xlsx';

    console.log(path_file);

    res.status(200).send({message: 'OK'});

}

/*
function process(req,res){

    var name      = req.params.name;
    var idrow     = req.params.idrow;
    var type      = req.params.type;
    
    console.log("process");
    


    var path_file = 'uploads/tarifas/' + name + '.xlsx';

    console.log(path_file);

    parseXlsx(path_file,function(err,data){

            if (err) {

                throw err;

                res.status(500).send({message: 'KO'});

            } else {

                    var op = 0;
                    
                    if (type == 1){
                        var cols = [1.00,1.20,1.40,1.60,1.80,2.00,2.20,2.40,2.60,2.80];
                        var rows = [1.00,1.20,1.40,1.60,1.80,2.00,2.20,2.40,2.60,2.80,3.00];
                    }

                    if (type == 2){
                        var cols = [1.00,1.20,1.40,1.60,1.80,2.00,2.20,2.40];
                        var rows = [1.00,1.20,1.40,1.60,1.80,2.00,2.20,2.40,2.60,2.80,3.00];
                    }

                    if (type == 3){
                        var cols = [0.40,0.60,0.80,1.00,1.20];
                        var rows = [0.60,0.80,1.00,1.20,1.40,1.60,1.80,2.00,2.20];
                    }

                    if (type == 4){
                        var cols = [0.60,0.80,1.00,1.20,1.40,1.60,1.80,2.00];
                        var rows = [1.00,1.20,1.40,1.60,1.80,2.00,2.20,2.40,2.60,2.80,3.00];
                    }

                    if (type == 5){
                        var cols = [1.00,1.10,1.20,1.30,1.40,1.50,1.60,1.70,1.80,1.90,2.00,2.10,2.20,2.30,2.40,2.50,2.60,2.70,2.80,2.90];
                        var rows = [1.00,1.10,1.20,1.30,1.40,1.50,1.60,1.70,1.80,1.90,2.00,2.10,2.20,2.30,2.40,2.50,2.60,2.70,2.80,2.90,3.00,3.10,3.20,3.30,3.40,3.50,3.60,3.70,3.80,3.90,4.00];
                    }

                    if (type == 6){
                        var cols = [0.60,0.80,1.00,1.20,1.40,1.60,1.80,2.00,2.20,2.40,2.60,2.80,3.00,3.20,3.40,3.60,3.80,4.00,4.20,4.40,4.60,4.80,5.00,5.20,5.40,5.60,5.80,6.00];
                        var rows = [0.60,0.80,1.00,1.20,1.40,1.60,1.80,2.00,2.20,2.40,2.60,2.80,3.00,3.20,3.40,3.60,3.80,4.00,4.20,4.40,4.60,4.80,5.00,5.20,5.40,5.60,5.80,6.00];
                    }


                    var col = 0;
                    var row = 0;
                    var ipos = 0;

                               
                    var accept = SaveMapCell(op,idrow,0,0,'','',0,0,'','');      
                    op = 1;

                    for (var icol=0;icol < cols.length; icol++){

                        var accept = SaveMapCell(op,idrow,1+icol,0,cols[icol],'',icol,0,'BW80','ch');
                    }
                    

                    for (var irow = 0;irow < data.length; irow++){

                        row = rows[irow];
                         
                         ipos++;
                         accept = SaveMapCell(op,idrow,0,1+irow,rows[irow],'',0,1+row,'BW60','rh');

                         for (var icol = 0; icol < data[irow].length; icol++){

                             col = cols[icol];

                             var value = data[irow][icol];


                             if (value != ""){   
                                var values = value.split(';');
                                var prec = values[0].replace(',','.');
                                var c1 = values[1];

                               

                            } else {
                                var prec = "";
                                var c1 = "";
                            }

                            var accept = SaveMapCell(op,idrow,1+icol,1+irow,prec,c1,col,row,'W80','rw')
                           

                             //console.log("ROW=" + row + ",COL=" + col + ",prec=" + prec + ",c1=" + c1);
                         }

                    }

                    //console.log("HIER");
                         res.status(200).send({message: 'OK'});
            }
    });

}
*/

function tarifa_paste(req,res){

    let values    = req.body.values;
    let idrow     = req.params.idrow;
    let type      = req.params.type;
    let op        = 0;
                        
                        if (type == 1){
                            var cols = [1.00,1.20,1.40,1.60,1.80,2.00,2.20,2.40,2.60,2.80];
                            var rows = [1.00,1.20,1.40,1.60,1.80,2.00,2.20,2.40,2.60,2.80,3.00];
                        }

                        if (type == 2){
                            var cols = [1.00,1.20,1.40,1.60,1.80,2.00,2.20,2.40];
                            var rows = [1.00,1.20,1.40,1.60,1.80,2.00,2.20,2.40,2.60,2.80,3.00];
                        }

                        if (type == 3){
                            var cols = [0.40,0.60,0.80,1.00,1.20];
                            var rows = [0.60,0.80,1.00,1.20,1.40,1.60,1.80,2.00,2.20];
                        }

                        if (type == 4){
                            var cols = [0.60,0.80,1.00,1.20,1.40,1.60,1.80,2.00];
                            var rows = [1.00,1.20,1.40,1.60,1.80,2.00,2.20,2.40,2.60,2.80,3.00];
                        }

                        if (type == 5){
                            var cols = [1.00,1.10,1.20,1.30,1.40,1.50,1.60,1.70,1.80,1.90,2.00,2.10,2.20,2.30,2.40,2.50,2.60,2.70,2.80,2.90];
                            var rows = [1.00,1.10,1.20,1.30,1.40,1.50,1.60,1.70,1.80,1.90,2.00,2.10,2.20,2.30,2.40,2.50,2.60,2.70,2.80,2.90,3.00,3.10,3.20,3.30,3.40,3.50,3.60,3.70,3.80,3.90,4.00];
                        }

                        if (type == 6){
                            var cols = [0.60,0.80,1.00,1.20,1.40,1.60,1.80,2.00,2.20,2.40,2.60,2.80,3.00,3.20,3.40,3.60,3.80,4.00,4.20,4.40,4.60,4.80,5.00,5.20,5.40,5.60,5.80,6.00];
                            var rows = [0.60,0.80,1.00,1.20,1.40,1.60,1.80,2.00,2.20,2.40,2.60,2.80,3.00,3.20,3.40,3.60,3.80,4.00,4.20,4.40,4.60,4.80,5.00,5.20,5.40,5.60,5.80,6.00];
                        }

                        var col = 0;
                        var row = 0;
 
                         /* INSERT HEADER */             
                         var accept = SaveMapCell(op,idrow,0,0,'','',0,0,'','');      
                         op = 1;
 
                         for (var icol=0;icol < cols.length; icol++){
 
                             var accept = SaveMapCell(op,idrow,1+icol,0,cols[icol],'',icol,0,'BW80','ch');
                         }
         
                        
                        
                        let irow = 1;
                        let ipos = 0;
                        values.forEach(element => {
                            
                            if (!element.startsWith("C1"))
                            {
                                console.log(row);

                                ipos++;
                                accept = SaveMapCell(op,idrow,0,1+irow,rows[irow],'',0,1+row,'BW60','rh');
                               
                                let data = element.split(";");
                                 for (var icol = 0; icol < data[irow].length; icol++){
                                    var value = data[icol];
                                    var accept = SaveMapCell(op,idrow,1+icol,1+irow,value,c1,col,row,'W80','rw')
                                }
                            }
                        });
                      
                        
    
    res.status(200).send({message: 'OK'});

}

/* START ROW */
function StartRow(res,usuario,data,rows,pos,tab)
{
    UpdateRow(res,usuario,data,rows,pos,tab);
}
/* UPDATE ROW */
function UpdateRow(res,usuario,data,rows,pos,tab)
{
    var row       = data.getRow(pos);
    if (row != null) {

        console.log(row.values);

        if (pos < rows)
        {
            pos = pos + 1;
            UpdateRow(res,usuario,data,rows,pos,tab);
        } 
        else 
        {                   
            console.log("USUARIO="+ usuario);
            EndRow(res,usuario);
        }
    } 
    else 
    {
            console.log("ERROR");
            res.status(500).send({message: 'KO'});
    }
}

/* END ROW */
function EndRow(res,usuario)
{
   
    return Signal(res,3,"KO");
  
}

/* SIGNAL */
function Signal(res,step,value)
{
 
  if (step == 3 && value == "OK")
  {
    res.status(200).send({message: 'OK'});
  }

  if (step == 3 && value == "KO")
  {
    res.status(500).send({message: 'KO'});
  }
}

function tarifa_file(req,res){

  
    if (req.files)
    {
        console.log(req.files);
        var idrow     = req.params.idrow;
        var type      = req.params.type;
        var filePath  = req.files.file.path;
        var fileSplit = filePath.split('\\');
        var fileName  = fileSplit[2];
        var fileExt   = fileName.split('.');
        var extfile   = fileExt[1];
        let usuario = 100;

        if (type == 1){
            var cols = [1.00,1.20,1.40,1.60,1.80,2.00,2.20,2.40,2.60,2.80];
            var rows = [1.00,1.20,1.40,1.60,1.80,2.00,2.20,2.40,2.60,2.80,3.00];
        }

        if (type == 2){
            var cols = [1.00,1.20,1.40,1.60,1.80,2.00,2.20,2.40];
            var rows = [1.00,1.20,1.40,1.60,1.80,2.00,2.20,2.40,2.60,2.80,3.00];
        }

        if (type == 3){
            var cols = [0.40,0.60,0.80,1.00,1.20];
            var rows = [0.60,0.80,1.00,1.20,1.40,1.60,1.80,2.00,2.20];
        }

        if (type == 4){
            var cols = [0.60,0.80,1.00,1.20,1.40,1.60,1.80,2.00];
            var rows = [1.00,1.20,1.40,1.60,1.80,2.00,2.20,2.40,2.60,2.80,3.00];
        }

        if (type == 5){
            var cols = [1.00,1.10,1.20,1.30,1.40,1.50,1.60,1.70,1.80,1.90,2.00,2.10,2.20,2.30,2.40,2.50,2.60,2.70,2.80,2.90];
            var rows = [1.00,1.10,1.20,1.30,1.40,1.50,1.60,1.70,1.80,1.90,2.00,2.10,2.20,2.30,2.40,2.50,2.60,2.70,2.80,2.90,3.00,3.10,3.20,3.30,3.40,3.50,3.60,3.70,3.80,3.90,4.00];
        }

        if (type == 6){
            var cols = [0.60,0.80,1.00,1.20,1.40,1.60,1.80,2.00,2.20,2.40,2.60,2.80,3.00,3.20,3.40,3.60,3.80,4.00,4.20,4.40,4.60,4.80,5.00,5.20,5.40,5.60,5.80,6.00];
            var rows = [0.60,0.80,1.00,1.20,1.40,1.60,1.80,2.00,2.20,2.40,2.60,2.80,3.00,3.20,3.40,3.60,3.80,4.00,4.20,4.40,4.60,4.80,5.00,5.20,5.40,5.60,5.80,6.00];
        }

        if (type == 7){
            var cols = [1.00,1.20,1.40,1.60,1.80,2.00,2.20,2.40,2.60,2.80,3.00,3.20,3.40,3.60,3.80,4.00,4.20,4.40,4.60,4.80,5.00];
            var rows = [1.00,1.20,1.40,1.60,1.80,2.00,2.20,2.40,2.60,2.80,3.00];
        }

        if (type == 8){
            var rows = [1.00,1.20,1.40,1.60,1.80,2.00,2.20,2.40,2.60,2.80,3.00,3.20,3.40,3.60,3.80,4.00];
            var cols = [1.00,1.20,1.40,1.60,1.80,2.00,2.20,2.40,2.60,2.80];
        }
    
        var path_file = 'uploads/tarifas/' + fileName;
        //var path_file = filePath;
 
        
        var workbook = new Excel.Workbook();
        workbook.xlsx.readFile(path_file)
        .then(function () {
            var worksheet = workbook.getWorksheet(1);
            var filas = worksheet.rowCount;
            if (filas > 0)
            {
                /* PROCEDIMENT */
                let data = workbook.getWorksheet(1);
                
                var op = 0;
                var col = 0;
                var ipos = 0;
                var accept = SaveMapCell(op,idrow,0,0,'','',0,0,'','');      
                op = 1;

                for (var icol=0;icol < cols.length; icol++){
                    var accept = SaveMapCell(op,idrow,1+icol,0,cols[icol],'',icol,0,'BW80','ch');
                }
                

                for (var irow = 0;irow < rows.length; irow++)
                {
                    let row = data.getRow(1+irow);
                    if (row != null)
                    {
                        let values = row.values; 
                        ipos++;
                        let header = rows[irow];
                        accept = SaveMapCell(op,idrow,0,1+irow,header,'',irow,0,'BW60','rh');
                        for (var icol = 0; icol < cols.length; icol++)
                        {
                            col = cols[icol];
                            var value = values[icol+1];
                            if (value == 'undefined') value="0";
                            var prec = value;
                            var c1 = "";

                            let x = 1 + icol;
                            let y = 1 + irow;
                            console.log("X=" + x + ",Y=" + y + ",value="+prec);
                            var accept = SaveMapCell(op,idrow,x,y,prec,c1,col,row,'W80','rw')
                        }
                       
                    }
                }
                res.status(200).send({message: 'OK'});
            }
    });

                /* PROCEDIMENT */
          
        
        
        /*
        parseXlsx(path_file,function(err,data){

                if (err) {

                    throw err;

                    res.status(500).send({message: 'KO'});

                } else {

                        var op = 0;
                        
                        if (type == 1){
                            var cols = [1.00,1.20,1.40,1.60,1.80,2.00,2.20,2.40,2.60,2.80];
                            var rows = [1.00,1.20,1.40,1.60,1.80,2.00,2.20,2.40,2.60,2.80,3.00];
                        }

                        if (type == 2){
                            var cols = [1.00,1.20,1.40,1.60,1.80,2.00,2.20,2.40];
                            var rows = [1.00,1.20,1.40,1.60,1.80,2.00,2.20,2.40,2.60,2.80,3.00];
                        }

                        if (type == 3){
                            var cols = [0.40,0.60,0.80,1.00,1.20];
                            var rows = [0.60,0.80,1.00,1.20,1.40,1.60,1.80,2.00,2.20];
                        }

                        if (type == 4){
                            var cols = [0.60,0.80,1.00,1.20,1.40,1.60,1.80,2.00];
                            var rows = [1.00,1.20,1.40,1.60,1.80,2.00,2.20,2.40,2.60,2.80,3.00];
                        }

                        if (type == 5){
                            var cols = [1.00,1.10,1.20,1.30,1.40,1.50,1.60,1.70,1.80,1.90,2.00,2.10,2.20,2.30,2.40,2.50,2.60,2.70,2.80,2.90];
                            var rows = [1.00,1.10,1.20,1.30,1.40,1.50,1.60,1.70,1.80,1.90,2.00,2.10,2.20,2.30,2.40,2.50,2.60,2.70,2.80,2.90,3.00,3.10,3.20,3.30,3.40,3.50,3.60,3.70,3.80,3.90,4.00];
                        }

                        if (type == 6){
                            var cols = [0.60,0.80,1.00,1.20,1.40,1.60,1.80,2.00,2.20,2.40,2.60,2.80,3.00,3.20,3.40,3.60,3.80,4.00,4.20,4.40,4.60,4.80,5.00,5.20,5.40,5.60,5.80,6.00];
                            var rows = [0.60,0.80,1.00,1.20,1.40,1.60,1.80,2.00,2.20,2.40,2.60,2.80,3.00,3.20,3.40,3.60,3.80,4.00,4.20,4.40,4.60,4.80,5.00,5.20,5.40,5.60,5.80,6.00];
                        }

                        if (type == 7){
                            var cols = [1.00,1.20,1.40,1.60,1.80,2.00,2.20,2.40,2.60,2.80,3.00,3.20,3.40,3.60,3.80,4.00,4.20,4.40,4.60,4.80,5.00];
                            var rows = [1.00,1.20,1.40,1.60,1.80,2.00,2.20,2.40,2.60,2.80,3.00];
                        }


                        var col = 0;
                        var row = 0;
                        var ipos = 0;

                               
                        var accept = SaveMapCell(op,idrow,0,0,'','',0,0,'','');      
                        op = 1;

                        for (var icol=0;icol < cols.length; icol++){

                            var accept = SaveMapCell(op,idrow,1+icol,0,cols[icol],'',icol,0,'BW80','ch');
                        }
                        

                        for (var irow = 0;irow < data.length; irow++){

                            row = rows[irow];
                             
                             ipos++;
                             accept = SaveMapCell(op,idrow,0,1+irow,rows[irow],'',0,1+row,'BW60','rh');

                             for (var icol = 0; icol < data[irow].length; icol++){

                                 col = cols[icol];

                                 var value = data[irow][icol];

 
                                 if (value != ""){   
                                    var values = value.split(';');
                                    var prec = values[0].replace(',','.');
                                    var c1 = values[1];

                                   

                                } else {
                                    var prec = "";
                                    var c1 = "";
                                }

                                var accept = SaveMapCell(op,idrow,1+icol,1+irow,prec,c1,col,row,'W80','rw')
                               

                                 //console.log("ROW=" + row + ",COL=" + col + ",prec=" + prec + ",c1=" + c1);
                             }

                        }

                       
                             res.status(200).send({message: 'OK'});
                }
        });
        
      */
    }
  

}

function put_tarifa(req,res){

    var params = req.body;

    console.log(params);

    var idrow = params.idrow;
    var fecha = params.fecha;
    var obs = params.observaciones;
    var cliente = params.cliente;
    var tipo = params.tipo;
    var marca = params.marca;
    var modelo = (params.modelo == null) ? -1 : params.modelo;
    var tubo = params.tubo;
    var tejido = params.tejido;
    var rows = params.rows;
    var cols = params.cols;
    var impresion = params.impresion;
    var tipot = params.tipot;
	var producto = params.producto;
	var ancholama = params.ancholama;
    var promocion_activa = params.promocion_activa;
    var promocion_coeficiente = params.promocion_coeficiente;
    var promocion_modificapvp = params.promocion_modificapvp;
    var promocion_modificapvc = params.promocion_modificapvc;
    var cajon = (params.cajon == null) ? -1 : params.cajon;
    var lacado = (params.lacado == null) ? -1 : params.lacado;


         if (promocion_activa == true){
                promocion_activa = "1";
            } else {
               promocion_activa = "0";
            } 

          if (promocion_modificapvp == true){
                promocion_modificapvp = "1";
            } else {
               promocion_modificapvp = "0";
            } 
   
        if (promocion_modificapvc == true){
                promocion_modificapvc = "1";
            } else {
               promocion_modificapvc = "0";
            } 


        var request = new sql.Request();
        request.input('idrow',sql.Int,idrow);
        request.input('fecha',sql.VarChar(10),fecha);
        request.input('descripcion',sql.VarChar(255),obs);
        request.input('clientes',sql.Int,cliente);
        request.input('tipos',sql.Int,tipo);
        request.input('marcas',sql.Int,marca);
        request.input('modelo',sql.Int,modelo);
        request.input('tejidos',sql.Int,tejido);
        request.input('tubos',sql.Int,tubo);
        request.input('rows',sql.Int,rows);
        request.input('cols',sql.Int,cols);
        request.input('impresion',sql.Int,impresion);
        request.input('tipo',sql.Int,tipot);
		request.input('producto',sql.Int,producto);
		request.input('ancholama',sql.Int,ancholama);
        request.input('promocion_activa',sql.Int,promocion_activa);
        request.input('promocion_coeficiente',sql.Decimal(12,2),promocion_coeficiente);
        request.input('promocion_modificapvp',sql.Int,promocion_modificapvp);
        request.input('promocion_modificapvc',sql.Int,promocion_modificapvc);
        request.input('cajon',sql.Int,cajon);
        request.input('lacado',sql.Int,lacado);
        request.execute('sp_sm_tarifas_insert', 
        function(err, recordsets, returnValue) {

            if (err == null)
            {       
                if (recordsets.returnValue == null)
                {
                    res.status(500).send({message: 'KO'});
                }
                else
                {
                    res.status(200).send({message: 'OK',idrow: recordsets.returnValue});
                }
            }
            else 
            {
                console.log(err);
                res.status(500).send({message: 'KO'});
            }

           
            });
 }

 function SaveMapCell(id,idrow,x,y,v1,v2,rx,ry,cl,t){

     var request = new sql.Request();
        request.input('op',sql.Int,id);
        request.input('idrow',sql.Int,idrow);
        request.input('x',sql.Int,x);
        request.input('y',sql.Int,y);
        request.input('v1',sql.VarChar(10),v1);
        request.input('v2',sql.VarChar(15),v2);
        request.input('cl',sql.VarChar(10),cl);
        request.input('t',sql.VarChar(10),t);
        request.input('rx',sql.VarChar(10),rx);
        request.input('ry',sql.VarChar(10),ry);
        request.execute('sp_sm_tarifas_insert_lineas', 
        function(err, recordsets, returnValue) {

            if (err == null)
            {       
                if (recordsets.returnValue == null)
                {
                    return false;
                }
                else
                {
                    return true;
                }
            }
            else 
            {
                console.log(err);
                return false;
            }
           
            });
 }

 function put_tarifa_map(req,res){

    var params = req.body;

    var idrow = params.idrow;
    var array = params.values;
    var op = 0;

    for (var i=0;i<array.length;i++){

         var lines = array[i];
         var p = lines.p;
         var c = lines.c;

         for (var j=0;j<c.length;j++){
            var x = c[j].x;
            var y = c[j].y;
            var v1 = c[j].v1;
            var v2 = c[j].v2;
            var rx = c[j].rx;
            var ry = c[j].ry;
            var cl = c[j].cl;
            var t = c[j].t;
            var accept = SaveMapCell(op,idrow,x,y,v1,v2,rx,ry,cl,t)
            op = 1;
         }
         
    }

    res.status(200).send({message: 'OK'});

 }




function tarifas_search(req,res){

			var sqlquery = "select idrow,codigo,fecha,descripcion,coeficiente,promocion_activa,promocion_coeficiente,clientes,promocion_modificapvc,promocion_modificapvp,fn_sistema,fn_modelo,fn_accionamiento,sp_tejido,fn_grupo,op_synchronize,op_synchronized,op_synchr_date from vw_sol_articulos_tarifas order by codigo";
				new sql.Request().query(sqlquery, (err2,result) => {

        			if (err2 == null){
        				res.status(200).send({ Table : result.recordset });
        			} else {
        				res.status(500).send({ message : err2 });	
        			}
        	});
}

function tarifa_lineas(req,res){

    var idrow = req.params.idrow;
	var sqlquery = "select x,y,v1,v2,rx,ry,cl,t from SOL_ARTICULOS_TARIFAS_LINEAS where idrow="+idrow+" order by y,x";
	new sql.Request().query(sqlquery, (err2,result) => {

        			if (err2 == null){
        				res.status(200).send({ Table : result.recordset });
        			} else {
        				res.status(500).send({ message : err2 });	
        			}
        	});
}

function tarifa(req,res){

	var idrow = req.params.idrow;

			var sqlquery = "select idrow,codigo,fecha,descripcion,clientes,tipos,marcas,tejidos,tubos,irows,icols,impresion,tipo,producto,ancholama,coeficiente,promocion_activa,";
            sqlquery += "promocion_coeficiente,promocion_modificapvc,promocion_modificapvp,bloqueo,tipotarifa,cajon,lacado,modelo,fn_sistema,fn_modelo,fn_accionamiento,sp_tejido,fn_grupo,op_synchronize,op_synchronized,op_synchr_date from vw_sol_articulos_tarifas ";
			sqlquery += " where idrow = " + idrow;
				new sql.Request().query(sqlquery, (err2,result) => {

        			if (err2 == null){
        				res.status(200).send({ Table : result.recordset });
        			} else {
        				res.status(500).send({ message : err2 });	
        			}
        	});
}

function tarifa_simulate(req,res)
{
    var idrow = req.params.idrow;

            var sqlquery = "select idrow,nombre,margen1,margen2,margen3,margen4,tipo,marca,tejido,criterio,preciom2,preciomontaje,bloqueo,desmultiplicador,desmultiplicador_trigger,desmultiplicador_value,tipoproducto,grupotejido,grupo,densidad,sp_sistema,sp_modelo,sp_accionamiento,sp_tejido from sol_tarifas_simulate ";
            sqlquery += " where idrow = " + idrow;
                new sql.Request().query(sqlquery, (err2,result) => {

                    if (err2 == null){
                        res.status(200).send({ Table : result.recordset });
                    } else {
                        res.status(500).send({ message : err2 });   
                    }
            });
}

function tarifa_simulate_cli(req,res)
{
    var idrow = req.params.idrow;

            var sqlquery = "select idrow,nombre,margen1,margen2,margen3,margen4,tipo,marca,tejido,criterio,preciom2,preciomontaje,bloqueo,desmultiplicador,c1,c2,c3,c4,dbo.fn_name_clientes(clientes) as clientes from sol_tarifas_simulate_cliente ";
            sqlquery += " where idrow = " + idrow;
                new sql.Request().query(sqlquery, (err2,result) => {

                    if (err2 == null){
                        res.status(200).send({ Table : result.recordset });
                    } else {
                        res.status(500).send({ message : err2 });   
                    }
            });
}

function tarifa_simulate_lines(req,res)
{
    var idrow = req.params.idrow;
    
    //var sqlquery = "select * from SOL_TARIFAS_SIMULATE_LINES where idrow = " + idrow + " order by seccion,descripcion";

    var sqlquery = "select lin.id,lin.idrow,lin.numero,lin.articulo,lin.descripcion,lin.descripcion2,lin.cantidad,lin.unidad,lin.ubicacion,lin.consumo,lin.orden,lin.descUnidad,";
    sqlquery += "lin.cod_sol,lin.fam_sol,lin.ancho,lin.alto,lin.seccion,lin.precio,lin.precio2,lin.desde,lin.hasta,lin.mmeca,lin.bloqueo,lin.syntaxis,art.tipocalculo,art.desctipocalculo,lin.k,lin.dto,";
    sqlquery += " abs((lin.precio-lin.precio_orig)) as cambio from SOL_TARIFAS_SIMULATE_LINES lin ";
    sqlquery += "inner join busqueda_articulos art on art.idrow = lin.articulo ";
    sqlquery += "where lin.idrow = " + idrow + " order by lin.seccion,lin.descripcion";
                new sql.Request().query(sqlquery, (err2,result) => {

                    if (err2 == null){
                        res.status(200).send({ Table : result.recordset });
                    } else {
                        res.status(500).send({ message : err2 });   
                    }
            });
}

function tarifa_simulate_line(req,res)
{
    var id = req.params.id;
    
    var sqlquery = "select * from SOL_TARIFAS_SIMULATE_LINES ";
            sqlquery += " where id = " + id;
                new sql.Request().query(sqlquery, (err2,result) => {

                    if (err2 == null){
                        res.status(200).send({ Table : result.recordset });
                    } else {
                        res.status(500).send({ message : err2 });   
                    }
            });
}

function tarifa_simulate_times(req,res)
{
    var idrow = req.params.idrow;
    let sqlquery = "select id,desde,hasta,tiempo from SOL_TARIFAS_SIMULATE_TIMES ";
    sqlquery += " where idrow = " + idrow;

    if (idrow < 0){
        sqlquery = "select id,desde,hasta,tiempo from SOL_TARIFAS_SIMULATE_TIMES_MASTER ";
    } 
           
                new sql.Request().query(sqlquery, (err2,result) => {

                    if (err2 == null){
                        res.status(200).send({ Table : result.recordset });
                    } else {
                        res.status(500).send({ message : err2 });   
                    }
            });
}

function tarifa_simulate_export_types(req,res)
{
    
    var sqlquery = "select idrow,descripcion,' anc='+cast(minx as varchar)+' a '+cast(maxx as varchar)+'  alt='+cast(miny as varchar)+' a '+cast(maxy as varchar) as rango from SOL_TARIFAS_EXPORTACION";
                new sql.Request().query(sqlquery, (err2,result) => {

                    if (err2 == null){
                        res.status(200).send({ Table : result.recordset });
                    } else {
                        res.status(500).send({ message : err2 });   
                    }
            });
}

function tarifa_simulate_table_details(req,res)
{
    var params = req.params;
    var tarifa = params.tarifa;
    var row = params.row;
    var col = params.col;
       var request = new sql.Request();
        request.input('tarifa',sql.Int,tarifa);
        request.input('rowindex',sql.Int,row);
        request.input('colindex',sql.Int,col);
        request.execute('sp_simulate_table_details', 
        function(err, recordsets, returnValue) {

            if (err == null)
            {       
                if (recordsets.returnValue == null)
                {
                    res.status(500).send({message: 'KO'});
                }
                else
                {
                        //console.log(recordsets);
                    res.status(200).send({ Table : recordsets.recordsets[0] });
                }
            }
            else 
            {
                console.log(err);
                res.status(500).send({message: 'KO'});
            }

           
            });  
}

function tarifa_simulate_table_details_articles(req,res)
{
    var params = req.params;
    var tarifa = params.tarifa;
    var row = params.row;
    var col = params.col;
    var type = params.type;

       var request = new sql.Request();
        request.input('tarifa',sql.Int,tarifa);
        request.input('rowindex',sql.Int,row);
        request.input('colindex',sql.Int,col);
        request.input('type',sql.Int,type);
        request.execute('sp_simulate_table_details_articles', 
        function(err, recordsets, returnValue) {

            if (err == null)
            {       
                if (recordsets.returnValue == null)
                {
                    res.status(500).send({message: 'KO'});
                }
                else
                {
                        //console.log(recordsets);
                    res.status(200).send({ Table : recordsets.recordsets[0] });
                }
            }
            else 
            {
                console.log(err);
                res.status(500).send({message: 'KO'});
            }

           
            });  
}

function tarifa_simulate_table(req,res)
{
    var params      = req.params;
    var idrow       = params.idrow;
    var bloque      = params.bloque;
    
    var request = new sql.Request();
        request.input('tarifa',sql.Int,idrow);
        request.input('bloque',sql.Int,bloque);
        request.execute('sp_solarmanes_precio_tejido_tabla_tarifa', 
        function(err, recordsets, returnValue) {

            if (err == null)
            {       
                if (recordsets.returnValue == null)
                {
                    res.status(500).send({message: 'KO'});
                }
                else
                {
                        //console.log(recordsets);
                    res.status(200).send({ Table : recordsets.recordsets });
                }
            }
            else 
            {
                console.log(err);
                res.status(500).send({message: 'KO'});
            }

           
            });  

}


function tarifa_simulate_table_sync(req,res)
{
    var params      = req.params;
    var idrow       = params.idrow;
    
    
    var request = new sql.Request();
        request.input('tarifa',sql.Int,idrow);
        request.input('bloque',sql.Int,10);
        request.input('dest',sql.Int,4);
        request.input('tipo',sql.Int,5);
        request.input('id',sql.Int,-1);
        request.execute('sp_solarmanes_precio_tejido_tabla_tarifa', 
        function(err, recordsets, returnValue) {

            if (err == null)
            {       
                if (recordsets.returnValue == null)
                {
                    res.status(500).send({message: 'KO'});
                }
                else
                {
                    res.status(200).send(recordsets.recordsets);
                }
            }
            else 
            {
                console.log(err);
                res.status(500).send({message: 'KO'});
            }

           
            });  

}

function tarifa_simulate_table_sync_lm(req,res)
{
    var params      = req.params;
    var idrow       = params.idrow;
    
    
    var request = new sql.Request();
        request.input('tarifa',sql.Int,idrow);
        request.execute('sp_solarmanes_precio_tejido_tabla_tarifa_lm', 
        function(err, recordsets, returnValue) {

            if (err == null)
            {       
                if (recordsets.returnValue == null)
                {
                    res.status(500).send({message: 'KO'});
                }
                else
                {
                    res.status(200).send(recordsets.recordsets);
                }
            }
            else 
            {
                console.log(err);
                res.status(500).send({message: 'KO'});
            }

           
            });  

}

function tarifa_cliente_simulate_table_sync(req,res)
{
    var params      = req.params;
    var idrow       = params.idrow;
    
    
    var request = new sql.Request();
        request.input('tarifa',sql.Int,idrow);
       // request.input('bloque',sql.Int,10);
        request.input('dest',sql.Int,4);
       // request.input('tipo',sql.Int,5);
       // request.input('id',sql.Int,-1);
        request.execute('sp_solarmanes_precio_tejido_tabla_tarifa_cliente', 
        function(err, recordsets, returnValue) {

            if (err == null)
            {       
                if (recordsets.returnValue == null)
                {
                    res.status(500).send({message: 'KO'});
                }
                else
                {
                        //console.log(recordsets);
                    res.status(200).send(recordsets.recordsets);
                }
            }
            else 
            {
                console.log(err);
                res.status(500).send({message: 'KO'});
            }

           
            });  

}

function tarifa_simulate_table_sync_cue(req,res)
{
    let sqlquery = "select dbo.TarifsToExport() as orders";
        new sql.Request().query(sqlquery, (err2,result) => {

                    if (err2 == null){
                        res.status(200).send(result.recordset[0].orders);
                    } else {
                        res.status(500).send({ message : err2 });   
                    }
            });
}

function tarifa_simulate_table_sync_cue_lm(req,res)
{
    let sqlquery = "select dbo.TarifsToExport2() as orders";
        new sql.Request().query(sqlquery, (err2,result) => {

                    if (err2 == null){
                        res.status(200).send(result.recordset[0].orders);
                    } else {
                        res.status(500).send({ message : err2 });   
                    }
            });
}

function tarifa_simulate_table_sync_operate(req,res)
{
    
    var params      = req.body;
    var idrow       = params.idrow;
    var status      = params.status;
    var request = new sql.Request();
        request.input('idrow',sql.VarChar(8000),idrow);
        request.input('status',sql.Int,status);
        request.execute('sp_tarifs_synchronize', 
        function(err, recordsets, returnValue) {

            if (err == null)
            {       
                if (recordsets.returnValue == null)
                {
                    res.status(500).send({message: 'KO'});
                }
                else
                {
                        //console.log(recordsets);
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


function tarifa_simulate_table_sync_operate_lm(req,res)
{
    
    var params      = req.body;
    var idrow       = params.idrow;
    var status      = params.status;
    var request = new sql.Request();
        request.input('idrow',sql.VarChar(8000),idrow);
        request.input('status',sql.Int,status);
        request.execute('sp_tarifs_synchronize_lm', 
        function(err, recordsets, returnValue) {

            if (err == null)
            {       
                if (recordsets.returnValue == null)
                {
                    res.status(500).send({message: 'KO'});
                }
                else
                {
                        //console.log(recordsets);
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


function tarifa_cliente_simulate_table_sync_operate(req,res)
{
    
    var params      = req.body;
    var idrow       = params.idrow;
    var status      = params.status;
  
    console.log(params);
    
    var request = new sql.Request();
        request.input('idrow',sql.VarChar(8000),idrow);
        request.input('status',sql.Int,status);
        request.execute('sp_tarifs_cliente_synchronize', 
        function(err, recordsets, returnValue) {

            if (err == null)
            {       
                if (recordsets.returnValue == null)
                {
                    res.status(500).send({message: 'KO'});
                }
                else
                {
                        //console.log(recordsets);
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

function tarifa_cliente_simulate_table_sync_cue(req,res)
{
    let sqlquery = "select dbo.TarifsClienteToExport() as orders";
        new sql.Request().query(sqlquery, (err2,result) => {

                    if (err2 == null){
                        res.status(200).send(result.recordset[0].orders);
                    } else {
                        res.status(500).send({ message : err2 });   
                    }
            });
}

function tarifa_simulate_cliente_table(req,res)
{
    
    var params      = req.params;
    var idrow       = params.idrow;
    
    var request = new sql.Request();
        request.input('tarifa',sql.Int,idrow);
        request.execute('sp_solarmanes_precio_tejido_tabla_tarifa_cliente', 
        function(err, recordsets, returnValue) {

            if (err == null)
            {       
                if (recordsets.returnValue == null)
                {
                    res.status(500).send({message: 'KO'});
                }
                else
                {
                   res.status(200).send({ Table : recordsets.recordsets });
                }
            }
            else 
            {
                console.log(err);
                res.status(500).send({message: 'KO'});
            }

           
            });  

}

function Simulation_Del(req,res){

    var body = req.body;

    var request = new sql.Request();
       request.input('idrow',sql.Int,body.idrow);
       request.execute('sp_tarifas_simulate_delete', 
       function(err, recordsets, returnValue) {

           if (err == null)
           {       
               if (recordsets.returnValue == null)
               {
                   res.status(500).send({message: 'KO'});
               }
               else
               {
                   res.status(200).send({message: 'OK',idrow: recordsets.returnValue});
               }
           }
           else 
           {
               console.log(err);
               res.status(500).send({message: 'KO'});
           }
          
           });
}

function Simulation_Del_Multiple(req,res){

    var body = req.body;

    var request = new sql.Request();
       request.input('ids',sql.VarChar(8000),body.ids);
       request.execute('sp_tarifas_simulate_delete_multiple', 
       function(err, recordsets, returnValue) {

           if (err == null)
           {       
               if (recordsets.returnValue == null)
               {
                   res.status(500).send({message: 'KO'});
               }
               else
               {
                   res.status(200).send({message: 'OK',idrow: recordsets.returnValue});
               }
           }
           else 
           {
               console.log(err);
               res.status(500).send({message: 'KO'});
           }
          
           });
}

function Simulation_cliente_Del(req,res){

    var body = req.body;

    var request = new sql.Request();
       request.input('idrow',sql.Int,body.idrow);
       request.execute('sp_tarifas_simulate_cliente_delete', 
       function(err, recordsets, returnValue) {

           if (err == null)
           {       
               if (recordsets.returnValue == null)
               {
                   res.status(500).send({message: 'KO'});
               }
               else
               {
                   res.status(200).send({message: 'OK',idrow: recordsets.returnValue});
               }
           }
           else 
           {
               console.log(err);
               res.status(500).send({message: 'KO'});
           }
          
           });
}

function Simulation(req,res){

        var body = req.body;

     var request = new sql.Request();
        request.input('idrow',sql.Int,body.idrow);
        request.input('nombre',sql.VarChar(512),body.nombreescandallo);
        request.input('margen1',sql.Decimal(12,4),body.margentej);
        request.input('margen2',sql.Decimal(12,4),body.margencli);
        request.input('margen3',sql.Decimal(12,4),body.margenmec);
        request.input('margen4',sql.Decimal(12,4),body.margenacc);
        request.input('tipo',sql.Int,body.tipo);
        request.input('marca',sql.Int,body.marca);
        request.input('tejido',sql.Int,body.tejido);
        request.input('criterio',sql.Int,body.criterio);
        request.input('preciom2',sql.Decimal(12, 4),body.preciom2);
        request.input('preciomontaje',sql.Decimal(12, 4),body.preciomon);
        request.input('bloqueo',sql.Int,body.bloqueo);
        request.input('desmultiplicador',sql.Int,body.desmultiplicador);
        request.input('desmultiplicador_trigger',sql.Decimal(12,2),body.desmultiplicador_trigger);
        request.input('desmultiplicador_value',sql.Decimal(12,2),body.desmultiplicador_value);
        request.input('tipoproducto',sql.Int,body.tipoproducto);
        request.input('grupo',sql.Int,body.grupo);
        request.input('grupotejido',sql.Int,body.grupotejido);
        request.input('sp_sistema',sql.VarChar(50),body.sp_sistema);
        request.input('sp_modelo',sql.VarChar(50),body.sp_modelo);
        request.input('sp_accionamiento',sql.VarChar(50),body.sp_accionamiento);
        request.input('sp_tejido',sql.VarChar(50),body.sp_tejido);
        request.execute('sp_tarifas_simulate', 
        function(err, recordsets, returnValue) {

            if (err == null)
            {       
                if (recordsets.returnValue == null)
                {
                    res.status(500).send({message: 'KO'});
                }
                else
                {
                    res.status(200).send({message: 'OK',idrow: recordsets.returnValue});
                }
            }
            else 
            {
                console.log(err);
                res.status(500).send({message: 'KO'});
            }
           
            });
}

function Simulation_Cliente(req,res){

    var body = req.body;
    console.log(body);

 var request = new sql.Request();
    request.input('idrow',sql.Int,body.idrow);
    request.input('nombre',sql.VarChar(512),body.nombreescandallo);
    request.input('c1',sql.Decimal(12,4),body.c1);
    request.input('c2',sql.Decimal(12,4),body.c2);
    request.input('c3',sql.Decimal(12,4),body.c3);
    request.input('c4',sql.Decimal(12,4),body.c4);
    request.execute('sp_tarifas_simulate_cliente', 
    function(err, recordsets, returnValue) {

        if (err == null)
        {       
            if (recordsets.returnValue == null)
            {
                res.status(500).send({message: 'KO'});
            }
            else
            {
                res.status(200).send({message: 'OK',idrow: recordsets.returnValue});
            }
        }
        else 
        {
            console.log(err);
            res.status(500).send({message: 'KO'});
        }
       
        });
}

function tarifas_simulate_export_v2(req,res)
{
    var tarifas = req.body.ids;
    var tipo    = req.body.tipoexport;
    var mapa    = req.body.tipomapa;
    var dtocom  = req.body.dtocom;
    var margen  = req.body.margen;


   var request = new sql.Request();
        request.input('tipo',sql.Int,tipo);
        request.input('tarifas',sql.VarChar(8000),tarifas);
        request.input('mapa',sql.Int,mapa);
        request.input('dtocomercial',sql.Decimal(12,2),dtocom);
        request.input('margencliente',sql.Decimal(12,2),margen);
        request.execute('sp_solarmanes_tabla_tarifa_export_v2', 
        function(err, recordsets, returnValue) {

            if (err == null)
            {       
                if (recordsets.returnValue == null)
                {
                    res.status(500).send({message: 'KO'});
                }
                else
                {
                    res.status(200).send({message: 'OK',Table: recordsets.recordset});
                }
            }
            else 
            {
                console.log(err);
                res.status(500).send({message: 'KO'});
            }
           
            });
}

function tarifas_simulate_cliente_export_v2(req,res)
{
    var tarifas = req.body.ids;
    var tipo    = req.body.tipoexport;

   var request = new sql.Request();
        request.input('tipo',sql.Int,tipo);
        request.input('tarifas',sql.VarChar(8000),tarifas);
        request.execute('sp_solarmanes_tabla_cliente_tarifa_export_v2', 
        function(err, recordsets, returnValue) {

            if (err == null)
            {       
                if (recordsets.returnValue == null)
                {
                    res.status(500).send({message: 'KO'});
                }
                else
                {
                    res.status(200).send({message: 'OK',Table: recordsets.recordset});
                }
            }
            else 
            {
                console.log(err);
                res.status(500).send({message: 'KO'});
            }
           
            });
}

function tarifas_simulate_export_v3(req,res)
{
    var tarifas = req.body.ids;
    var tipo    = req.body.tipoexport;
    var mapa    = req.body.tipomapa;
    var dtocom  = req.body.dtocom;
    var margen  = req.body.margen;

   var request = new sql.Request();
        request.input('tipo',sql.Int,tipo);
        request.input('tarifas',sql.VarChar(8000),tarifas);
        request.input('mapa',sql.Int,mapa);
        request.input('dtocomercial',sql.Decimal(12,2),dtocom);
        request.input('margencliente',sql.Decimal(12,2),margen);
        request.input('mapa',sql.Int,mapa);
        request.execute('sp_solarmanes_tabla_tarifa_export_v2', 
        function(err, recordsets, returnValue) {

            if (err == null)
            {       
                if (recordsets.returnValue == null)
                {
                    res.status(500).send({message: 'KO'});
                }
                else
                {
                    res.status(200).send({message: 'OK',Table: recordsets.recordset});
                }
            }
            else 
            {
                console.log(err);
                res.status(500).send({message: 'KO'});
            }
           
            });
}

function tarifas_simulate_export(req,res){

    var tarifas = req.params.tarifas;
    var tipo    = req.params.tipo;

    var request = new sql.Request();
        request.input('tipo',sql.Int,tipo);
        request.input('tarifas',sql.VarChar(8000),tarifas);
        request.execute('sp_solarmanes_tabla_tarifa_export', 
        function(err, recordsets, returnValue) {

            if (err == null)
            {       
                if (recordsets.returnValue == null)
                {
                    res.status(500).send({message: 'KO'});
                }
                else
                {
                    res.status(200).send({message: 'OK',Table: recordsets.recordset});
                }
            }
            else 
            {
                console.log(err);
                res.status(500).send({message: 'KO'});
            }
           
            });


}


function tarifas_simulate_search(req,res){

    let estado = (req.params.estado == null) ? '-1' : req.params.estado;

            var sqlquery = "select idrow,nombre,margen1,margen2,margen3,margen4,tipo,marca,tejido,preciom2,desmultiplicador,bloqueo,criterio,dbo.fn_tarifa_tejido_grupo(tejido,grupo) as desctejido ";
            sqlquery += ",fn_sistema,fn_modelo,fn_accionamiento,sp_tejido,fn_grupo,op_synchronize,op_synchronized,op_synchr_date,sp_tarifa ";
            sqlquery += "  from vw_sol_tarifas_simulate ";
            if (estado != '-1'){
                sqlquery += " where bloqueo=" + estado; 
            }
            sqlquery += " order by idrow";


                new sql.Request().query(sqlquery, (err2,result) => {

                    if (err2 == null){
                        res.status(200).send({ Table : result.recordset });
                    } else {
                        res.status(500).send({ message : err2 });   
                    }
            });
}

function tarifas_simulate_cli_search(req,res){

    var sqlquery = "select idrow,nombre,margen1,margen2,margen3,margen4,tipo,marca,tejido,desmultiplicador,bloqueo,criterio,(select descripcion from SOL_ARTICULOS_TEJIDOS where idrow=tejido) as desctejido, ";
        sqlquery += "c1,c2,c3,c4,dbo.fn_name_clientes(clientes) as clientes ";
        sqlquery += ",fn_sistema,fn_modelo,fn_accionamiento,sp_tejido,fn_grupo,op_synchronize,op_synchronized,op_synchr_date,razon_social  ";
        sqlquery += "from vw_sol_tarifas_simulate_cliente order by idrow";

                new sql.Request().query(sqlquery, (err2,result) => {

                    if (err2 == null){
                        res.status(200).send({ Table : result.recordset });
                    } else {
                        res.status(500).send({ message : err2 });   
                    }
            });
}

function tarifa_simulate_articles(req,res)
{
    var body = req.body;

    var request = new sql.Request();
        request.input('idrow',sql.Int,body.idrow);
        request.input('articles',sql.VarChar(8000),body.articles);
        request.input('operation',sql.Int,body.operation);
        request.execute('sp_tarifas_simulate_articles', 
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

function operation(req,res)
{
    var body = req.body;

  
    var request = new sql.Request();
        request.input('tarifa',sql.VarChar(8000),body.idrow);
        request.input('operation',sql.Int,body.operation);
        request.input('password',sql.VarChar(25),body.password);
        request.execute('sp_tarifa_operate', 
        function(err, recordsets, returnValue) {

            if (err == null)
            {       

                if (recordsets.returnValue == null)
                {
                    res.status(500).send({message: 'KO', value: recordsets.returnValue});
                }
                else
                {
                    res.status(200).send({message: 'OK', value: recordsets.returnValue});
                }
            }
            else 
            {
                console.log(err);
                res.status(500).send({message: 'KO', value: recordsets.returnValue});
            }
           
            });
}

function bulk(req,res)
{
    let body = req.body;

var request = new sql.Request();
        request.input('ids',sql.VarChar(8000),body.ids);
        request.input('type',sql.Int,body.type);
        request.input('param1',sql.Decimal(12,2),body.param1);
        request.input('param2',sql.VarChar(255),body.param2);
        request.execute('sp_tarifas_bulk_changes', 
        function(err, recordsets, returnValue) {

            if (err == null)
            {       
                if (recordsets.returnValue == null)
                {
                    res.status(500).send({message: 'KO',value: recordsets.returnValue});
                }
                else
                {
                    res.status(200).send({message: 'OK',value: recordsets.returnValue});
                }
            }
            else 
            {
                console.log(err);
                res.status(500).send({message: 'KO'});
            }
           
            });
}

function clonate(req,res)
{

    var body = req.body;

    var request = new sql.Request();
        request.input('tarifa',sql.Int,body.idrow);
        request.input('NuevoNombre',sql.VarChar(512),body.NuevoNombre);
        request.execute('sp_clonate_tarifa', 
        function(err, recordsets, returnValue) {

            if (err == null)
            {       
                if (recordsets.returnValue == null)
                {
                    res.status(500).send({message: 'KO',value: recordsets.returnValue});
                }
                else
                {
                    res.status(200).send({message: 'OK',value: recordsets.returnValue});
                }
            }
            else 
            {
                console.log(err);
                res.status(500).send({message: 'KO'});
            }
           
            });
}

/***
***/
function tarifas_export(req,res)
{
    var tarifas = req.params.tarifas;

    var request = new sql.Request();
        request.input('id2',sql.Int,tarifas);
        request.input('c1',sql.VarChar(10),'varchar');
        request.output('tipo',sql.Int);
        request.execute('sp_export_tarifa_general', 
        function(err, recordsets, returnValue) {

            if (err == null)
            {       
                if (recordsets.returnValue == null)
                {
                    res.status(500).send({message: 'KO'});
                }
                else
                {
                    var tipo = recordsets.output.tipo;
                    res.status(200).send({message: 'OK',Tipo:tipo,Table: recordsets.recordset});
                }
            }
            else 
            {
                console.log(err);
                res.status(500).send({message: 'KO'});
            }
           
            });

}






function tarifas_genera_cliente(req,res)
{
    var ids = req.body.ids;
    var clientes = req.body.idrow;
    var c1 = req.body.c1;
    var c2 = req.body.c2;
    var c3 = req.body.c3;
    var c4 = req.body.c4;


    var request = new sql.Request();
        request.input('ids',sql.VarChar(2500),ids);
        request.input('clientes',sql.VarChar(2500),clientes);
        request.input('c1',sql.Decimal(12,2),c1);
        request.input('c2',sql.Decimal(12,2),c2);
        request.input('c3',sql.Decimal(12,2),c3);
        request.input('c4',sql.Decimal(12,2),c4);
        request.execute('sp_genera_tarifa_cliente', 
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


function tarifas_genera_multiple(req,res)
{
    var base = req.body.base;
    var ids1 = req.body.ids1;
    var ids2 = req.body.ids2;
    var model = req.body.model;
 
    var request = new sql.Request();
        request.input('base',sql.VarChar(2500),base);
        request.input('ids1',sql.VarChar(2500),ids1);
        request.input('ids2',sql.VarChar(2500),ids2);
        request.input('model',sql.Int,model);
        request.execute('sp_generacion_tarifa', 
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

/*
*/
function tarifas_articulos_comunes(req,res)
{
    var base = req.body.base;
    var values = base.split(';');

    let sqlquery = "";
    for (var pos = 0; pos < values.length; pos++){
        
        sqlquery += "select articulo,descripcion,cantidad,precio,precio2,desde,hasta,mmeca ";
        sqlquery += "from SOL_TARIFAS_SIMULATE_LINES where idrow = " + values[pos];

        if (pos < values.length-1){
            sqlquery += " intersect ";
        }
    }

    new sql.Request().query(sqlquery, (err2,result) => {

        if (err2 == null){
            res.status(200).send({ Table : result.recordset });
        } else {
            res.status(500).send({ message : err2 });   
        }
    });

   
    

}

function tarifas_articulos_agregar_multiple(req,res)
{
    
    let ids = req.body.ids;
	let articles = req.body.articles;
	
    var request = new sql.Request();
        request.input('ids',sql.VarChar(8000),ids);
        request.input('articles',sql.VarChar(8000),articles);
        request.execute('sp_tarifas_agregar_articulos', 
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

function tarifas_articulos_borrar_multiple(req,res)
{
    let ids = req.body.ids;
	let deletes = req.body.deletes;

    
    var request = new sql.Request();
        request.input('ids',sql.VarChar(8000),ids);
        request.input('deletes',sql.VarChar(8000),deletes);
        request.execute('sp_tarifas_borrar_articulos', 
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

function tarifas_parametros_export_cliente(req,res)
{
    let body = req.body;


    let idrow = body.idrow;
    let sp_tarifa = body.sp_tarifa;
    let sp_sistema = body.sp_sistema;
    let sp_modelo = body.sp_modelo;
    let sp_accionamiento = body.sp_accionamiento;
    let sp_tejido = body.sp_tejido;
    let sp_grupo = body.sp_grupo;
    let sp_cliente = body.sp_cliente;
    
    var request = new sql.Request();
    request.input('idrow',sql.Int,idrow);
    request.input('sp_tarifa',sql.VarChar(50),sp_tarifa);
    request.input('sp_cliente',sql.VarChar(50),sp_cliente);
    request.input('sp_sistema',sql.VarChar(50),sp_sistema);
    request.input('sp_modelo',sql.VarChar(50),sp_modelo);
    request.input('sp_accionamiento',sql.VarChar(50),sp_accionamiento);
    request.input('sp_tejido',sql.VarChar(50),sp_tejido);
    request.input('sp_grupo',sql.VarChar(50),sp_grupo);
    request.execute('sp_tarifas_export_parametros_cliente', 
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

function tarifas_parametros_export_lm(req,res)
{
    let body = req.body;
    let idrow = body.idrow;
    let sp_tarifa = body.sp_tarifa;
    let sp_cliente = body.sp_cliente;
    let sp_sistema = body.sp_sistema;
    let sp_modelo = body.sp_modelo;
    let sp_accionamiento = body.sp_accionamiento;
    let sp_tejido = body.sp_tejido;
    let sp_grupo = body.sp_grupo;
    
    var request = new sql.Request();
    request.input('idrow',sql.Int,idrow);
    request.input('sp_tarifa',sql.VarChar(25),sp_tarifa);
    request.input('sp_cliente',sql.VarChar(25),sp_cliente);
    request.input('sp_sistema',sql.VarChar(50),sp_sistema);
    request.input('sp_modelo',sql.VarChar(50),sp_modelo);
    request.input('sp_accionamiento',sql.VarChar(50),sp_accionamiento);
    request.input('sp_tejido',sql.VarChar(50),sp_tejido);
    request.input('sp_grupo',sql.VarChar(50),sp_grupo);
    request.execute('sp_tarifas_export_parametros_lm', 
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

function tarifas_parametros_export(req,res)
{
    let body = req.body;
    let idrow = body.idrow;
    let sp_tarifa = body.sp_tarifa;
    let sp_cliente = body.sp_cliente;
    let sp_sistema = body.sp_sistema;
    let sp_modelo = body.sp_modelo;
    let sp_accionamiento = body.sp_accionamiento;
    let sp_tejido = body.sp_tejido;
    let sp_grupo = body.sp_grupo;
    
    var request = new sql.Request();
    request.input('idrow',sql.Int,idrow);
    request.input('sp_tarifa',sql.VarChar(25),sp_tarifa);
    request.input('sp_cliente',sql.VarChar(25),sp_cliente);
    request.input('sp_sistema',sql.VarChar(50),sp_sistema);
    request.input('sp_modelo',sql.VarChar(50),sp_modelo);
    request.input('sp_accionamiento',sql.VarChar(50),sp_accionamiento);
    request.input('sp_tejido',sql.VarChar(50),sp_tejido);
    request.input('sp_grupo',sql.VarChar(50),sp_grupo);
    request.execute('sp_tarifas_export_parametros', 
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

function tarifas_articulos_actualizar_multiple(req,res)
{

let ids = req.body.ids;
let articles = req.body.articles; 
let cantidad = req.body.cantidad;
let precio = req.body.precio;
let desde = req.body.desde;
let hasta = req.body.hasta;
let mmeca = req.body.mmeca;
let k = req.body.k;

var request = new sql.Request();
    request.input('ids',sql.VarChar(8000),ids);
    request.input('articles',sql.VarChar(8000),articles);
    request.input('cantidad',sql.Decimal(12,4),cantidad);
    request.input('precio',sql.Decimal(12,4),precio);
    request.input('desde',sql.Int,desde);
    request.input('hasta',sql.Int,hasta);
    request.input('mmeca',sql.Decimal(12,4),mmeca);
    request.input('k',sql.Int,k);
    request.execute('sp_tarifas_actualizar_articulos', 
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

function tarifas_update_coste(req,res)
{
    let user = 1;

    var request = new sql.Request();
    request.input('user',sql.Int,user);
    request.execute('sp_tarifas_update_coste', 
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

function update_tiempo(desde,hasta,tiempo)
{
    let sqlquery = "update SOL_TARIFAS_SIMULATE_TIMES_MASTER set tiempo="+tiempo+"where desde="+desde+" and hasta="+ hasta;
    new sql.Request().query(sqlquery, (err2,result) => {
        if (err2 == null){
            return true;
        } else {
           return false;   
        }
    });
}

function tarifas_update_manoobra(req,res)
{
    let values = req.body;
    console.log(values);
   

    for (let pos=0;pos<values.length;pos++){
        let item = values[pos];
        let desde = item.Desde;
        let hasta = item.Hasta;
        let tiempo = item.Tiempo;
        update_tiempo(desde,hasta,tiempo);
    }

    res.status(200).send({message: 'OK'});
}

function tarifas_update_manoobra_apply(req,res)
{
    let user = 1;

    var request = new sql.Request();
    request.input('user',sql.Int,user);
    request.execute('sp_tarifas_update_manoobra', 
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

function accesoriostarifas(req,res){

    var params = req.body;


    var ids = [];
    var values = [];

    for (var i=0;i<params.length; i++)
    {
        var id = params[i].id;
        var value = params[i].value;
        ids.push(id);
        values.push(value);
    }

    if (values[0] == ''){
        values[0] = "-1";
    }


   console.log(values);

        var request = new sql.Request();
        request.input('id',sql.Int,values[0]);
        request.input('idrow',sql.Int,values[1]);
        request.input('mm',sql.Int,values[2]);
        request.input('referencia',sql.VarChar(255),values[3]);
        request.input('cantidad',sql.Int,values[4]);
        request.input('pvp',sql.VarChar(15),values[5]);
        request.input('c1',sql.VarChar(25),values[6]);
        
        
        request.execute('sp_master_sm_accesoriotarifas', 
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

 function accesoriostarifas_del(req,res)
{
    let body = req.body;
    let id = body.ids.join(',');
    console.log(body);
    var request = new sql.Request();
    request.input('id',sql.Int,id);
    request.execute('sp_master_sm_accesoriostarifas_delete', 
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

function tarifamecanismovertical(req,res){

    var params = req.body;


    var ids = [];
    var values = [];

    for (var i=0;i<params.length; i++)
    {
        var id = params[i].id;
        var value = params[i].value;
        ids.push(id);
        values.push(value);
    }

    if (values[0] == ''){
        values[0] = "-1";
    }


   console.log(values);

        var request = new sql.Request();
        request.input('ancholama',sql.Int,values[0]);
        request.input('ancho',sql.Int,values[1]);
        request.input('pvp',sql.VarChar(15),values[2]);
        request.input('lamas',sql.Int,values[3]);
        request.input('c1',sql.VarChar(25),values[4]);
        request.input('pvc',sql.VarChar(15),values[5]);
        
        
        request.execute('sp_master_sm_tarifamecanismovertical', 
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

 function tarifamecanismovertical_del(req,res)
{
    let body = req.body;
    
    var request = new sql.Request();
    request.input('ancholama',sql.Int,body.ids[0]);
    request.input('ancho',sql.Int,body.ids[1]);
    request.execute('sp_master_sm_tarifamecanismovertical_delete', 
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

function tarifatejidovertical(req,res){

    var params = req.body;


    var ids = [];
    var values = [];

    for (var i=0;i<params.length; i++)
    {
        var id = params[i].id;
        var value = params[i].value;
        ids.push(id);
        values.push(value);
    }

    if (values[0] == ''){
        values[0] = "-1";
    }


   console.log(values);

        var request = new sql.Request();
        request.input('ancholama',sql.Int,values[0]);
        request.input('tejido',sql.Int,values[1]);
        request.input('c1',sql.VarChar(15),values[2]);
        request.input('k',sql.VarChar(15),values[3]);
        
        
        
        request.execute('sp_master_sm_tarifatejidovertical', 
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

 function tarifatejidovertical_del(req,res)
{
    let body = req.body;
    
    

    var request = new sql.Request();
    request.input('ancholama',sql.Int,body.ids[0]);
    request.input('tejido',sql.Int,body.ids[1]);
    request.execute('sp_master_sm_tarifatejidovertical_delete', 
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

function articulos_accesoriostarifas(req,res)
{
     var query = "SELECT [id],[idrow],(select NomCliente from NH_CLIENTES where IdCliente = idrow) as NomCli,[mm],[referencia],[cantidad],[pvp],[c1] FROM [SOL_ARTICULOS_ACCESORIOS_TARIFAS]";
     ExecuteSQL(query,res);
}

function articulos_tarifamecanismovertical(req,res)
{
     var query = "SELECT [ancholama],[ancho],[pvp],[lamas],[c1],[pvc] FROM [SOL_ARTICULOS_TARIFA_MECANISMO_VERTICAL]";
     ExecuteSQL(query,res);
}

function articulos_tarifatejidovertical(req,res)
{
     var query = "SELECT [ancholama],[tejido], (select descripcion from SOL_ARTICULOS_TEJIDOS where idrow = tejido) as Ntejido,[c1],[k],[pvp] FROM [SOL_ARTICULOS_TARIFA_TEJIDO_VERTICAL]";
     ExecuteSQL(query,res);
}

function ExecuteSQL(query,res)
{
    new sql.Request().query(query, (err2,result) => {

      if (err2 == null)
      {
          res.status(200).send({ Table : result.recordset });
      }
      else
      {
          res.status(500).send({ message : err2 }); 
      }
  });
}

module.exports = {
	put_tarifa,
	tarifa,
	tarifas_search,
	tarifa_lineas,
    put_tarifa_map,
    tarifa_file,
    delete_lines,
	delete_all,
	calculate,
    regenerate,
    regenerate2,
    Simulation,
    Simulation_Cliente,
    Simulation_Del,
    tarifas_simulate_search,
    tarifa_simulate,
    tarifa_simulate_cli,
    tarifa_simulate_articles,
    tarifa_simulate_lines,
    tarifa_simulate_line,
    tarifa_simulate_times,
    tarifa_simulate_table,
    tarifa_simulate_cliente_table,
    clonate,
    bulk,
    operation,
    tarifas_simulate_export,
    tarifas_simulate_export_v2,
    tarifas_simulate_cliente_export_v2,
    tarifa_simulate_export_types,
    tarifas_export,
    tarifas_simulate_cli_search,
    Simulation_cliente_Del,
    tarifas_genera_cliente,
    tarifa_simulate_table_details,
    tarifa_simulate_table_details_articles,
    tarifas_genera_multiple,
    tarifas_articulos_comunes,
    tarifas_articulos_borrar_multiple,
    tarifas_articulos_agregar_multiple,
    tarifas_articulos_actualizar_multiple,
    tarifas_parametros_export,
    tarifas_parametros_export_cliente,
    process,
    tarifa_paste,
    tarifa_simulate_table_sync,
    tarifa_simulate_table_sync_cue,
    tarifa_simulate_table_sync_operate,
    tarifa_cliente_simulate_table_sync_operate,
    tarifa_cliente_simulate_table_sync_cue,
    tarifa_cliente_simulate_table_sync,
    tarifas_update_coste,
    tarifas_update_manoobra,
    tarifas_update_manoobra_apply,
    tarifas_parametros_export_lm,
    Simulation_Del_Multiple,

    tarifa_simulate_table_sync_lm,
    tarifa_simulate_table_sync_cue_lm,
    tarifa_simulate_table_sync_operate_lm,
    accesoriostarifas,
    accesoriostarifas_del,
    tarifamecanismovertical,
    tarifamecanismovertical_del,
    tarifatejidovertical,
    tarifatejidovertical_del,
    articulos_accesoriostarifas,
    articulos_tarifamecanismovertical,
    articulos_tarifatejidovertical
}