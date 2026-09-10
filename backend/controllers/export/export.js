'use strict'

function export_grid(req,res)
{

    
        var format = req.body.format;
        var filename = req.body.filename;
        var content = req.body.content;

        console.log(req.body);

        var fullName = filename + "." + format;
        var mimetype = "application/vnd.ms-excel";
        if (format == "xls")
        {
            mimetype = "application/vnd.ms-excel";
        }
        if (format == "xml")
        {
            mimetype = "application/xml";
        }
        if (format == "html")
        {
            mimetype = "text/html";
        }
        if (format == "cvs")
        {
            mimetype = "text/plain";
        }
        if (format == "tsv")
        {
            mimetype = "text/plain";
        }
        if (format == "json")
        {
            mimetype = "text/plain";
        }
        if (format == "array")
        {
            mimetype = "text/plain";
        }

        var contentDisposition = "attachment; filename=" + fullName;
        res.append("Pragma","public");
        res.append("Expires", "0");
        res.append("Cache-Control", "must-revalidate,post-check=0,pre-check=0");
        res.append("Cache-Control-Private", "false");
        res.append("Content-Type", mimetype);
        res.append("Content-Disposition", contentDisposition);
        res.status(200).send(content);
       
}

module.exports = {
    export_grid
}