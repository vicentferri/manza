/* Prueba del 04 (búsquedas del enrollable) y de descripcion2 del 02, contra la BD local.
   Todo dentro de una transacción que se deshace al final: no deja restos.
   Juego ZZ (Enrollable · ZZ v3 a) sobre la línea 9348 del pedido real 7304:
     - parámetros dados de alta con sp_fabricacion_parametro_edit (validaciones -6, -7 y -9)
     - @SOPORTE: código del soporte del modelo nuevo (ENR_SOPORTE); el desplegable, en prueba_04_valores.js
     - @TEJIDO_ARTICULO: tipo de tejido + color (ENR_TEJIDO_ARTICULO, búsqueda de dos claves)
     - reglas: soporte por código y tejido con medidas propias (descripcion2)
     - combinación de tejido que no existe -> SIN ARTÍCULO
   Ejecutar: sqlcmd -S <servidor> -U sa -C -d SOLARMANES_DEV -f 65001 -i prueba_04_busquedas.sql */
set nocount on
set xact_abort on

declare @pedido int = 7304, @B int = 9348
declare @fallos int = 0
declare @acc int, @s1 int, @sop int, @r int, @n int
declare @juego varchar(50) = 'ENROLLABLE_ZZ_V3A'
declare @tipo int, @color int, @articulo int

/* Combinación de tejido que existe en la relación antigua (tipo 3) */
select top 1 @tipo = value1, @color = value2, @articulo = try_cast(articulos as int)
from SOL_ARTICULOS_FABRICACION_RELACION r
where tipo = 3 and exists (select 1 from articulos a where a.idrow = try_cast(r.articulos as int))
order by value1, value2

begin tran

select top 1 @acc = id from SOL_ACC_ACCIONAMIENTO order by id
insert SOL_ACC_SISTEMA (codigo, nombre) values ('ZZ_V3A', 'ZZ v3 a') set @s1 = scope_identity()
insert SOL_ACC_SOPORTE (codigo, nombre) values ('ZZSOP', 'ZZ soporte') set @sop = scope_identity()
insert SOL_FABRICACION_SISTEMAS (sistema, descripcion, tipo_linea, tabla_origen, tabla_fabricacion, tabla_parametros, procedimiento, activo, producto, acc_sistema_id)
select @juego, 'Enrollable · ZZ v3 a', 1, tabla_origen, tabla_fabricacion, tabla_parametros, procedimiento, 1, 1, @s1
from SOL_FABRICACION_PRODUCTOS where producto = 1

/* ---- alta de parámetros por el procedimiento de la pantalla ---- */
execute @r = sp_fabricacion_parametro_edit @juego, '@ANCHO', 'COLUMNA', 'ancho', 10
execute @r = sp_fabricacion_parametro_edit @juego, '@ALTO', 'COLUMNA', 'alto', 20
execute @r = sp_fabricacion_parametro_edit @juego, '@SOPORTE_ID', 'COLUMNA', 'nacc_soporte_id', 30
execute @r = sp_fabricacion_parametro_edit @juego, '@TEJ_TIPO', 'COLUMNA', 'tej_tipo_id', 40
execute @r = sp_fabricacion_parametro_edit @juego, '@TEJ_COLOR', 'COLUMNA', 'tej_color_id', 50
execute @r = sp_fabricacion_parametro_edit @juego, '@TEJ_ANCHO', 'FORMULA', '@ANCHO -- 2', 60
execute @r = sp_fabricacion_parametro_edit @juego, '@SOPORTE', 'BUSQUEDA', '@SOPORTE_ID', 100, 'ENR_SOPORTE'
if @r = 1 print 'OK    alta de @SOPORTE (búsqueda del producto)'
else begin print 'FALLO alta de @SOPORTE: ' + cast(@r as varchar); set @fallos += 1 end

execute @r = sp_fabricacion_parametro_edit @juego, '@TEJIDO_ARTICULO', 'BUSQUEDA', '@TEJ_TIPO', 110, 'ENR_TEJIDO_ARTICULO'
if @r = -9 print 'OK    búsqueda de dos claves con una sola entrada -> -9'
else begin print 'FALLO dos claves con una entrada: ' + cast(@r as varchar); set @fallos += 1 end
execute @r = sp_fabricacion_parametro_edit @juego, '@SOPORTE2', 'BUSQUEDA', '@SOPORTE_ID;@TEJ_TIPO', 110, 'ENR_SOPORTE'
if @r = -9 print 'OK    búsqueda de una clave con dos entradas -> -9'
else begin print 'FALLO una clave con dos entradas: ' + cast(@r as varchar); set @fallos += 1 end
execute @r = sp_fabricacion_parametro_edit @juego, '@TEJIDO_ARTICULO', 'BUSQUEDA', '@TEJ_TIPO;@NOEXISTE', 110, 'ENR_TEJIDO_ARTICULO'
if @r = -6 print 'OK    segunda entrada que no es un parámetro anterior -> -6'
else begin print 'FALLO segunda entrada inexistente: ' + cast(@r as varchar); set @fallos += 1 end
execute @r = sp_fabricacion_parametro_edit @juego, '@TEJIDO_ARTICULO', 'BUSQUEDA', 'tej_tipo ; @TEJ_COLOR', 110, 'ENR_TEJIDO_ARTICULO'
if @r = 1 and exists (select 1 from SOL_FABRICACION_PARAMETROS where sistema = @juego and name = '@TEJIDO_ARTICULO' and origen = '@TEJ_TIPO;@TEJ_COLOR')
	print 'OK    alta de @TEJIDO_ARTICULO con dos entradas (normaliza a @TEJ_TIPO;@TEJ_COLOR)'
else begin print 'FALLO alta de @TEJIDO_ARTICULO: ' + cast(@r as varchar); set @fallos += 1 end

execute @r = sp_fabricacion_parametro_edit 'HONEYCOMB', '@ZZ_SOPORTE', 'BUSQUEDA', '@ANCHO', 999, 'ENR_SOPORTE'
if @r = -7 print 'OK    HoneyComb no puede usar las búsquedas del enrollable -> -7'
else begin print 'FALLO HoneyComb con búsqueda del enrollable: ' + cast(@r as varchar); set @fallos += 1 end

/* El desplegable de valores (sp_fabricacion_parametros_valores) se prueba en prueba_04_valores.js:
   usa INSERT EXEC por dentro y no se puede capturar aquí */

/* ---- reglas ---- */
insert SOL_ARTICULOS_FABRICACION_RELACION_V2 (sistema, orden, atributo, valor, articulos, nombre_parametro1, consumo, param_ancho, param_alto) values
	(@juego, 1, 'ZZ soporte', '', '55',               '@SOPORTE == ZZSOP', '2', null, null),
	(@juego, 2, 'ZZ otro',    '', '55',               '@SOPORTE == OTRO',  '1', null, null),
	(@juego, 3, 'ZZ tejido',  '', '@TEJIDO_ARTICULO', '',                  '@TEJ_ANCHO ** @ALTO *T 0.0001', '@TEJ_ANCHO', '@ALTO')

update SOL_PEDIDOS_COLA_TIPO_1 set nacc_accionamiento_id = @acc, nacc_sistema_id = @s1, nacc_soporte_id = @sop,
       tej_tipo_id = @tipo, tej_color_id = @color
where id = @B
execute temp_sp_fabricacion_tipo_1_v3 @pedido, 0, 1

if exists (select 1 from SOL_PEDIDOS_COLA_TIPO_1_PARAMETERS where idrow = @B and parametro = '@SOPORTE' and valor = 'ZZSOP')
   and exists (select 1 from SOL_PEDIDOS_COLA_TIPO_1_PARAMETERS where idrow = @B and parametro = '@TEJIDO_ARTICULO' and valor = cast(@articulo as varchar))
	print 'OK    parámetros: @SOPORTE = ZZSOP y @TEJIDO_ARTICULO = ' + cast(@articulo as varchar) + ' (tejido ' + cast(@tipo as varchar) + ' / color ' + cast(@color as varchar) + ')'
else begin print 'FALLO parámetros de la línea'; set @fallos += 1 end

select @n = count(*) from SOL_PEDIDOS_COLA_TIPO_1_FABRICACION where idrow = @B
if @n = 2
   and exists (select 1 from SOL_PEDIDOS_COLA_TIPO_1_FABRICACION where idrow = @B and orden = 1 and articulo = 55 and consumo = 2 and descripcion2 is null)
	print 'OK    regla del soporte por código (la de otro código no aplica); sin medidas propias no lleva descripcion2'
else begin print 'FALLO regla del soporte (' + cast(@n as varchar) + ' filas)'; set @fallos += 1 end

if exists (select 1 from SOL_PEDIDOS_COLA_TIPO_1_FABRICACION where idrow = @B and orden = 3 and articulo = @articulo
           and consumo = 1.652 and ancho = 118 and alto = 140 and descripcion2 = '118.00 x 140.00')
	print 'OK    tejido: artículo según tipo + color, 1,18 x 1,40 = 1,652 m², descripcion2 118.00 x 140.00'
else begin print 'FALLO tejido'; set @fallos += 1 end

/* ---- combinación de tejido que no existe ---- */
update SOL_PEDIDOS_COLA_TIPO_1 set tej_color_id = -999 where id = @B
execute temp_sp_fabricacion_tipo_1_v3 @pedido, 0, 1
if exists (select 1 from SOL_PEDIDOS_COLA_TIPO_1_FABRICACION where idrow = @B and orden = 3 and articulo is null and descripcion like 'SIN ART%TEJIDO_ARTICULO%')
	print 'OK    combinación de tejido inexistente -> SIN ARTÍCULO'
else begin print 'FALLO combinación de tejido inexistente'; set @fallos += 1 end

rollback

if not exists (select 1 from SOL_ACC_SISTEMA where codigo like 'ZZ[_]V3%') and not exists (select 1 from SOL_ACC_SOPORTE where codigo = 'ZZSOP')
   and not exists (select 1 from SOL_FABRICACION_SISTEMAS where sistema like '%ZZ[_]V3%')
   and not exists (select 1 from SOL_FABRICACION_PARAMETROS where sistema like '%ZZ[_]V3%' or name = '@ZZ_SOPORTE')
   and not exists (select 1 from SOL_PEDIDOS_COLA_TIPO_1_PARAMETERS where idrow = @B)
	print 'OK    rollback: sin restos'
else begin print 'FALLO quedan restos'; set @fallos += 1 end

print case when @fallos = 0 then 'TODO OK' else cast(@fallos as varchar) + ' FALLOS' end
