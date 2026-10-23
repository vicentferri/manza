/* =====================================================================
   05 - Tejido del enrollable desde el maestro de tejidos
   Las líneas del configurador nuevo guardan el tejido elegido en
   SOL_PEDIDOS_COLA_TIPO_1.nacc_tejido_id (-> SOL_TEJIDOS_MAESTRO.idrow, ver tejidos.md), con
   tej_tipo_id / tej_color_id a -1. El tejido ya trae su código Solupyme, así que no hay una
   regla por tejido: cada sistema tiene UNA regla de tejido, con el artículo según el pedido
   (@TEJIDO_ARTICULO) y el consumo que corresponda, igual que HoneyComb.
   Los parámetros del juego de un sistema son, como en HoneyComb:
     @TEJIDO_ID         Dato del pedido: nacc_tejido_id
     @TEJIDO_REFERENCIA Búsqueda "Enrollable: tejido del maestro -> código Solupyme" (@TEJIDO_ID)
     @TEJIDO_ARTICULO   Búsqueda "Código Solupyme -> id del artículo" (@TEJIDO_REFERENCIA)
   Este script solo añade la búsqueda ENR_TEJIDO_SOLUPYME (la segunda ya existe) y marca como
   antigua ENR_TEJIDO_ARTICULO (tipo + color de la relación antigua, que no sirve para las líneas
   del maestro). El motor no cambia. Idempotente.
   Requisito: sqlEnrrollable/04 y sqlTejidos/01.
   ===================================================================== */
set ansi_nulls on
go
set quoted_identifier on
go

if object_id('dbo.SOL_TEJIDOS_MAESTRO') is null
	raiserror('Falta SOL_TEJIDOS_MAESTRO: aplique antes sqlTejidos/01', 16, 1)
go

if exists (select 1 from SOL_FABRICACION_BUSQUEDAS where busqueda = 'ENR_TEJIDO_SOLUPYME')
	update SOL_FABRICACION_BUSQUEDAS set
		sistema = null, producto = 1, descripcion = 'Enrollable: tejido del maestro -> código Solupyme',
		tabla = 'SOL_TEJIDOS_MAESTRO', clave = 'idrow', resultado = 'cod_solupyme',
		clave2 = null, filtro_columna = null, filtro_valor = null, texto = null
	where busqueda = 'ENR_TEJIDO_SOLUPYME'
else
	insert SOL_FABRICACION_BUSQUEDAS (busqueda, sistema, producto, descripcion, tabla, clave, resultado)
	values ('ENR_TEJIDO_SOLUPYME', null, 1, 'Enrollable: tejido del maestro -> código Solupyme', 'SOL_TEJIDOS_MAESTRO', 'idrow', 'cod_solupyme')

update SOL_FABRICACION_BUSQUEDAS set descripcion = 'Enrollable (tejido antiguo): tipo de tejido + color -> artículo'
where busqueda = 'ENR_TEJIDO_ARTICULO'

/* Comprobación: las columnas existen */
select 'ENR_TEJIDO_SOLUPYME' as busqueda, 'columna inexistente' as problema
where col_length('dbo.SOL_TEJIDOS_MAESTRO', 'idrow') is null or col_length('dbo.SOL_TEJIDOS_MAESTRO', 'cod_solupyme') is null
go
