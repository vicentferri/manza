/* Prueba del 05 (tejido del maestro) contra la BD local, con rollback: no deja restos.
   Un juego ZZ con los tres parámetros de tejido y UNA regla de tejido general
   (artículo según el pedido, consumo en m²), sobre la línea 9348 del pedido real 7304.
     - cada tejido del maestro da su artículo de Solupyme sin escribir una regla por tejido
     - medidas con decimales (100,5 x 140,5)
     - línea sin tejido -> SIN ARTÍCULO (un tejido inexistente no cabe: nacc_tejido_id tiene clave ajena)
     - todos los tejidos del maestro tienen exactamente un artículo en ARTICULOS
   Ejecutar: sqlcmd -S <servidor> -U sa -C -d SOLARMANES_DEV -f 65001 -i prueba_05_tejido_maestro.sql */
set nocount on
set xact_abort on

declare @pedido int = 7304, @B int = 9348
declare @fallos int = 0
declare @acc int, @s1 int, @r int, @n int, @t1 int, @t2 int, @art1 int, @art2 int
declare @juego varchar(50) = 'ENROLLABLE_ZZ_TEJ'

begin tran

select top 1 @acc = id from SOL_ACC_ACCIONAMIENTO order by id
select @t1 = min(idrow), @t2 = max(idrow) from SOL_TEJIDOS_MAESTRO
select @art1 = a.idrow from SOL_TEJIDOS_MAESTRO m join ARTICULOS a on a.cod_solupyme = m.cod_solupyme where m.idrow = @t1
select @art2 = a.idrow from SOL_TEJIDOS_MAESTRO m join ARTICULOS a on a.cod_solupyme = m.cod_solupyme where m.idrow = @t2

insert SOL_ACC_SISTEMA (codigo, nombre) values ('ZZ_TEJ', 'ZZ tejido') set @s1 = scope_identity()
insert SOL_FABRICACION_SISTEMAS (sistema, descripcion, tipo_linea, tabla_origen, tabla_fabricacion, tabla_parametros, procedimiento, activo, producto, acc_sistema_id)
select @juego, 'Enrollable · ZZ tejido', 1, tabla_origen, tabla_fabricacion, tabla_parametros, procedimiento, 1, 1, @s1
from SOL_FABRICACION_PRODUCTOS where producto = 1

/* Parámetros dados de alta como lo hace la pantalla */
execute @r = sp_fabricacion_parametro_edit @juego, '@ANCHO', 'COLUMNA', 'ancho', 10
execute @r = sp_fabricacion_parametro_edit @juego, '@ALTO', 'COLUMNA', 'alto', 20
execute @r = sp_fabricacion_parametro_edit @juego, '@TEJIDO_ID', 'COLUMNA', 'nacc_tejido_id', 30
execute @r = sp_fabricacion_parametro_edit @juego, '@TEJIDO_REFERENCIA', 'BUSQUEDA', '@TEJIDO_ID', 200, 'ENR_TEJIDO_SOLUPYME'
if @r = 1 print 'OK    alta de @TEJIDO_REFERENCIA con la búsqueda del maestro'
else begin print 'FALLO alta de @TEJIDO_REFERENCIA: ' + cast(@r as varchar); set @fallos += 1 end
execute @r = sp_fabricacion_parametro_edit @juego, '@TEJIDO_ARTICULO', 'BUSQUEDA', '@TEJIDO_REFERENCIA', 210, 'ARTICULO_POR_CODIGO'
if @r = 1 print 'OK    alta de @TEJIDO_ARTICULO con ARTICULO_POR_CODIGO'
else begin print 'FALLO alta de @TEJIDO_ARTICULO: ' + cast(@r as varchar); set @fallos += 1 end
execute @r = sp_fabricacion_parametro_edit @juego, '@TEJIDO_ANCHO', 'FORMULA', '@ANCHO -- 2', 220

/* UNA regla de tejido para cualquier tejido */
insert SOL_ARTICULOS_FABRICACION_RELACION_V2 (sistema, orden, atributo, valor, articulos, nombre_parametro1, consumo, param_ancho, param_alto) values
	(@juego, 1, 'TEJIDO', '', '@TEJIDO_ARTICULO', '', '@TEJIDO_ANCHO ** @ALTO *T 0.0001', '@TEJIDO_ANCHO', '@ALTO')

update SOL_PEDIDOS_COLA_TIPO_1 set nacc_accionamiento_id = @acc, nacc_sistema_id = @s1, nacc_tejido_id = @t1,
       tej_tipo_id = -1, tej_color_id = -1, ancho = 100.5, alto = 140.5
where id = @B

/* ---- primer tejido del maestro ---- */
execute temp_sp_fabricacion_tipo_1_v3 @pedido, 0, 1
if (select count(*) from SOL_PEDIDOS_COLA_TIPO_1_FABRICACION where idrow = @B) = 1
   and exists (select 1 from SOL_PEDIDOS_COLA_TIPO_1_FABRICACION where idrow = @B and articulo = @art1
               and consumo = 1.3839 and ancho = 98.5 and alto = 140.5 and descripcion2 = '98.50 x 140.50' and isnull(cod_sol,'') <> '')
	print 'OK    tejido ' + cast(@t1 as varchar) + ': su artículo ' + cast(@art1 as varchar) + ' con 98,5 x 140,5 = 1,3839 m² (una sola regla)'
else begin print 'FALLO primer tejido'; set @fallos += 1 end

/* ---- otro tejido, la misma regla ---- */
update SOL_PEDIDOS_COLA_TIPO_1 set nacc_tejido_id = @t2 where id = @B
execute temp_sp_fabricacion_tipo_1_v3 @pedido, 0, 1
if exists (select 1 from SOL_PEDIDOS_COLA_TIPO_1_FABRICACION where idrow = @B and articulo = @art2) and @art1 <> @art2
	print 'OK    tejido ' + cast(@t2 as varchar) + ': su artículo ' + cast(@art2 as varchar) + ' con la misma regla'
else begin print 'FALLO segundo tejido'; set @fallos += 1 end

/* ---- sin tejido (NULL) ---- */
update SOL_PEDIDOS_COLA_TIPO_1 set nacc_tejido_id = null where id = @B
execute temp_sp_fabricacion_tipo_1_v3 @pedido, 0, 1
if exists (select 1 from SOL_PEDIDOS_COLA_TIPO_1_FABRICACION where idrow = @B and articulo is null and descripcion like 'SIN ART%')
	print 'OK    línea sin tejido -> SIN ARTÍCULO'
else begin print 'FALLO línea sin tejido'; set @fallos += 1 end

/* ---- aviso: artículos de tejido sin unidad en Solupyme (la hoja deja la unidad en blanco; el consumo no cambia) ---- */
select @n = count(*) from SOL_TEJIDOS_MAESTRO m join ARTICULOS a on a.cod_solupyme = m.cod_solupyme where a.unidad1 is null
print 'AVISO ' + cast(@n as varchar) + ' tejidos del maestro tienen el artículo sin unidad (ARTICULOS.unidad1): la columna Unidad de la hoja sale en blanco'

/* ---- todos los tejidos del maestro tienen un artículo ---- */
select @n = count(*) from SOL_TEJIDOS_MAESTRO m
where (select count(*) from ARTICULOS a where ltrim(rtrim(a.cod_solupyme)) = ltrim(rtrim(m.cod_solupyme))) <> 1
if @n = 0 print 'OK    todos los tejidos del maestro tienen exactamente un artículo en ARTICULOS'
else begin print 'FALLO ' + cast(@n as varchar) + ' tejidos sin artículo o con varios'; set @fallos += 1 end

rollback

if not exists (select 1 from SOL_ACC_SISTEMA where codigo = 'ZZ_TEJ') and not exists (select 1 from SOL_FABRICACION_SISTEMAS where sistema like '%ZZ[_]TEJ%')
   and not exists (select 1 from SOL_PEDIDOS_COLA_TIPO_1 where id = @B and nacc_accionamiento_id is not null)
   and not exists (select 1 from SOL_PEDIDOS_COLA_TIPO_1_PARAMETERS where idrow = @B)
	print 'OK    rollback: sin restos'
else begin print 'FALLO quedan restos'; set @fallos += 1 end

print case when @fallos = 0 then 'TODO OK' else cast(@fallos as varchar) + ' FALLOS' end
