/* =====================================================================
   09 - Datos: tejidos HoneyComb para el generador de tarifas (rama honeyComb_tarifas)
   - Alta del producto 7 HONEYCOMB en SOL_ARTICULOS_PRODUCTOS.
   - Coste por m2 de los 5 tejidos HONEYCOMB OPACO 16 MM (idrow 252-256): 9,35.
   - Asigna esos tejidos al producto 7 en SOL_ARTICULOS_TEJIDOS_CLIENTES_PRODUCTOS
     para los clientes 1, 2, 4 y 5 (IMPRESION 0, DIASFABRICACION 5). La opacidad, el
     nombre y el código de proveedor los calcula la tabla a partir del tejido.
   El configurador HoneyComb no lee esta tabla: no cambia lo que ven los clientes.
   Idempotente: el coste se fija siempre y solo se insertan las asignaciones que faltan.
   ===================================================================== */
set ansi_nulls on
go
set quoted_identifier on
go
set xact_abort on
go

begin tran

-- Producto 7 (lo exige la FK de SOL_ARTICULOS_TEJIDOS_CLIENTES_PRODUCTOS). Ojo: desde aquí,
-- AT_Configuracion_Cliente_Nuevo_Inicio crea también filas de accionamientos del 7 en los clientes nuevos.
if not exists (select 1 from dbo.SOL_ARTICULOS_PRODUCTOS where idrow = 7)
	insert into dbo.SOL_ARTICULOS_PRODUCTOS(idrow, descripcion) values (7, 'HONEYCOMB')

update dbo.SOL_ARTICULOS_TEJIDOS
set COSTE = 9.35
where idrow between 252 and 256
  and descripcion like 'HONEYCOMB%'

-- opacidad, Ntejido y codigoprov son columnas calculadas a partir del tejido y el cliente
insert into dbo.SOL_ARTICULOS_TEJIDOS_CLIENTES_PRODUCTOS(CLIENTE, PRODUCTO, TEJIDO, IMPRESION, DIASFABRICACION)
select c.cliente, 7, t.idrow, 0, 5
from dbo.SOL_ARTICULOS_TEJIDOS t
cross join (values (1), (2), (4), (5)) as c(cliente)
where t.idrow between 252 and 256
  and t.descripcion like 'HONEYCOMB%'
  and not exists (select 1 from dbo.SOL_ARTICULOS_TEJIDOS_CLIENTES_PRODUCTOS x
                  where x.CLIENTE = c.cliente and x.PRODUCTO = 7 and x.TEJIDO = t.idrow)

commit
go
