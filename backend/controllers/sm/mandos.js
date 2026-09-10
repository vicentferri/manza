'use strict'

var sql = require('mssql');

async function mandos_cargadores_get(req,res)
{
    try {

        const pool = await sql.connect();
        // --- SQL Server ---
        const result = await pool.request().query(`
          SELECT
            mc.idrow,
            mc.id_marca,
            cm.descripcion  AS marca_descripcion,
            mc.descripcion,
            mc.pvp,
            mc.c1,
            mc.codigo_48
          FROM  sol_articulos_mandos_cargadores mc
          LEFT  JOIN sol_articulos_colores_marcas cm
                 ON  cm.idrow = mc.id_marca
          ORDER BY mc.idrow
        `);
        return res.json({ Table: result.recordset });
    } catch (err) {
        console.error('[GET /sm/mandos_cargadores]', err);
        return res.status(500).json({ message: 'ERROR', detail: err.message });
      }
}

async function mandos_cargador_set(req, res)  {
    try {
      const { id_marca, descripcion, pvp, c1, codigo_48 } = req.body;
  
      const pool = await sql.connect();
      // --- SQL Server ---
      await pool.request()
        .input('id_marca',    sql.Int,           id_marca    || null)
        .input('descripcion', sql.VarChar(100),  descripcion || null)
        .input('pvp',         sql.Decimal(10,2), pvp         || null)
        .input('c1',          sql.VarChar(11),   c1          || null)
        .input('codigo_48',   sql.VarChar(50),   codigo_48   || null)
        .query(`
          INSERT INTO sol_articulos_mandos_cargadores
            (id_marca, descripcion, pvp, c1, codigo_48)
          VALUES
            (@id_marca, @descripcion, @pvp, @c1, @codigo_48)
        `);
  
      return res.json({ message: 'OK' });
  
    } catch (err) {
      console.error('[POST /mandos_cargador]', err);
      return res.status(500).json({ message: 'ERROR', detail: err.message });
    }
  };
  
  
  // ─── DELETE /sm/mandos_cargador/:id ──────────────────────────────────────────
  // Elimina un cargador por su idrow
  async function mandos_cargador_del(req, res) {
    try {
      const idrow = parseInt(req.params.id, 10);
  
      const pool = await sql.connect();

      // --- SQL Server ---
      await pool.request()
        .input('idrow', sql.Int, idrow)
        .query(`
          DELETE FROM sol_articulos_mandos_cargadores
          WHERE  idrow = @idrow
        `);
  
      
      return res.json({ message: 'OK' });
  
    } catch (err) {
      console.error('[DELETE /sm/mandos_cargador/:id]', err);
      return res.status(500).json({ message: 'ERROR', detail: err.message });
    }
  };


module.exports = {
    mandos_cargadores_get,
    mandos_cargador_set,
    mandos_cargador_del

}