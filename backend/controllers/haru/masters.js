'use strict'

const fs = require('fs');


function readFile(url,value,op,res)
{
    var maxvalue = 0;
    var exist = 0;
    var delItem = 0;
    var pos = 0;

    fs.readFile(url, (err, json) => {
        
        let obj = JSON.parse(json);
        obj.Table.forEach(element => {

            if (element.descripcion.toUpperCase() == value.toUpperCase() )
            {
                exist = 1;
                if (op == 0){
                    delItem = pos;
                }
            }
            
            if (parseInt(element.idrow) > maxvalue){
                maxvalue = parseInt(element.idrow);           
            }
            pos++;
       });

       if (op==1 && exist==0){
            maxvalue = maxvalue + 1;
            obj.Table.push({"id": maxvalue, "text": value.toUpperCase()});
            fs.writeFileSync(url,JSON.stringify(obj));
            res.status(200).send({message:'OK'});
            
       }

       if (op==1 && exist==1){
            res.status(200).send({message:'Exist'});
       }

       if (op==0 && exist==1){
        obj.Table.splice(delItem,1);
        fs.writeFileSync(url,JSON.stringify(obj));
        res.status(200).send({message:'OK'});
       }
        
     });
}

function post(req,res)
{
    var master = req.body.master;
    var value = req.body.value;
    var op    = req.body.operation;

    
    var url = 'controllers/haru/server/'+master+'.json'

    fs.stat(url, function(err, stat) {
        if (err == null) {

            readFile(url,value,op,res);
          
        } else if (err.code === 'ENOENT') {
          
            let obj = {
                Table  : []
            } 
            fs.writeFileSync(url,JSON.stringify(obj));
            readFile(url,value,op,res);
            
        } else {
          console.log('Some other error: ', err.code);
        }
      });

   

}

function get(req,res)
{
    var master = req.params.master;
    var url = 'controllers/haru/server/'+master+'.json'

    if (url != "") {
    fs.readFile(url, (err, json) => {
       let obj = JSON.parse(json);
        res.json(obj);
    });
    } else {
        res.json({});
    }

}

module.exports = {
    get,
    post
}