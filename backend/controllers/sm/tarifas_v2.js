'use strict'

var xlsx = require('xlsx');

function Import(fileName,res)
{
    //var path_file = 'uploads/tarifas/' + fileName;
    let path_file = 'c:\\neueharu\\haru\\3001\\uploads\\tarifas\\' + fileName;
    const workbook = xlsx.readFile(path_file);
    var sheet_name_list = workbook.SheetNames;

    
    sheet_name_list.forEach(function(y) {
        var worksheet = workbook.Sheets[y];

        /*
        for(let z in worksheet) {
          if(z[0] === '!') continue;
          console.log(z);
       
        }
*/
       
        
        let rows = 10;
        let current = 1;
        var data = [];
        var linea  = 1;
        var linea1 = [];
        var linea2 = [];
        
        for(let z in worksheet) {

          if(z[0] === '!') continue;
          var tt = 0;
            for (var i = 0; i < z.length; i++) {
                if (!isNaN(z[i])) {
                    tt = i;
                    break;
                }
            };
            
            var col = z.substring(0,tt);
            var row = parseInt(z.substring(tt));
            
            if (row > 1 && col != "A"){
              var value = worksheet[z].v;
              //data.push(value);
              current++;

              if (linea == 1){
                linea1.push(value);
              } else {
                linea2.push(value);
              }
            
              if (current > rows ){
  
                if (linea == 2)
                { 
                   linea = 0;
                   data = [];
                   for (let pos=0;pos<linea1.length;pos++)
                   {
                     let value = linea1[pos] + ";" + linea2[pos];
                     data.push(value);
                   }
                  console.log(data);
                  linea1 = [];
                  linea2 = [];
                }  
                
                linea++;
                current = 1;
              }
           }

        }

      });

   
}

Import("IMAGINE.xlsx","");
