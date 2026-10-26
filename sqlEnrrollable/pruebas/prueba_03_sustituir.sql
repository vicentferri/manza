/* Prueba del 03 (sustitución de la fabricación del enrollable) contra la BD local, por
   sp_fabricacion_generate. Todo dentro de una transacción que se deshace: no deja restos.
   Pedido real 7304 (cliente 4), tres líneas de enrollable antiguas con fabricación guardada:
     - caso 1: la línea del medio (9348) pasa al modelo nuevo con un juego ZZ de 2 reglas
         -> sale por reglas con idpedido 2; las otras dos no se tocan (mismas filas, mismos id)
     - caso 2: además la primera (9346) pasa al modelo nuevo con un sistema sin juego
         -> la primera queda sin fabricación; la tercera sigue sin tocar
   Pedido real 17085 (Leroy Merlín, cliente 1): su fabricación de enrollable no se toca.
   Ejecutar: sqlcmd -S <servidor> -U sa -C -d SOLARMANES_DEV -f 65001 -i prueba_03_sustituir.sql */
set nocount on
set xact_abort on

declare @pedido int = 7304, @A int = 9346, @B int = 9348, @C int = 9347, @leroy int = 17085
declare @fallos int = 0
declare @acc int, @s1 int, @s2 int, @n int
declare @juego varchar(50) = 'ENROLLABLE_ZZ_V3A'
declare @antes table(id int, idrow int, idpedido int, articulo int, descripcion varchar(512), cantidad decimal(18,6),
                     unidad int, consumo decimal(18,6), orden int, ancho decimal(18,6), alto decimal(18,6), cod_sol varchar(100))
declare @leroyAntes table(id int, idrow int, idpedido int, articulo int, descripcion varchar(512), cantidad decimal(18,6),
                          unidad int, consumo decimal(18,6), orden int, ancho decimal(18,6), alto decimal(18,6), cod_sol varchar(100))

if object_id('dbo.dev_sp_fabricacion_tipo_1') is not null or object_id('dbo.dev_sp_fabricacion_tipo_1_copia_20261022') is null
   or object_definition(object_id('dbo.sp_fabricacion_generate')) not like '%execute temp_sp_fabricacion_tipo_1_v3 @idPedido,0,1%'
begin
	print 'FALLO el script 03 no está aplicado'
	return
end
print 'OK    03 aplicado: el router llama al v3, existe la copia y no existe el original'

begin tran

insert @antes
select id, idrow, idpedido, articulo, descripcion, cantidad, unidad, consumo, orden, ancho, alto, cod_sol
from SOL_PEDIDOS_COLA_TIPO_1_FABRICACION where idrow in (@A, @B, @C)
insert @leroyAntes
select f.id, f.idrow, f.idpedido, f.articulo, f.descripcion, f.cantidad, f.unidad, f.consumo, f.orden, f.ancho, f.alto, f.cod_sol
from SOL_PEDIDOS_COLA_TIPO_1_FABRICACION f join SOL_PEDIDOS_COLA_TIPO_1 t on t.id = f.idrow
join sol_pedidos_cola_lineas l on l.id = t.idrow where l.idrow = @leroy

/* ---- Leroy: no se toca ---- */
execute sp_fabricacion_generate @leroy, 1, 0, 1
select @n = count(*) from (
	select * from @leroyAntes
	except
	select f.id, f.idrow, f.idpedido, f.articulo, f.descripcion, f.cantidad, f.unidad, f.consumo, f.orden, f.ancho, f.alto, f.cod_sol
	from SOL_PEDIDOS_COLA_TIPO_1_FABRICACION f join SOL_PEDIDOS_COLA_TIPO_1 t on t.id = f.idrow
	join sol_pedidos_cola_lineas l on l.id = t.idrow where l.idrow = @leroy) d
if @n = 0 and (select count(*) from @leroyAntes) > 0
   and (select count(*) from @leroyAntes) = (select count(*) from SOL_PEDIDOS_COLA_TIPO_1_FABRICACION f join SOL_PEDIDOS_COLA_TIPO_1 t on t.id = f.idrow
                                            join sol_pedidos_cola_lineas l on l.id = t.idrow where l.idrow = @leroy)
	print 'OK    Leroy (pedido 17085): fabricación del enrollable sin tocar (mismas filas y mismos id)'
else begin print 'FALLO Leroy: fabricación del enrollable cambiada'; set @fallos += 1 end

/* ---- caso 1 ---- */
select top 1 @acc = id from SOL_ACC_ACCIONAMIENTO order by id
insert SOL_ACC_SISTEMA (codigo, nombre) values ('ZZ_V3A', 'ZZ v3 a') set @s1 = scope_identity()
insert SOL_ACC_SISTEMA (codigo, nombre) values ('ZZ_V3B', 'ZZ v3 b') set @s2 = scope_identity()
insert SOL_FABRICACION_SISTEMAS (sistema, descripcion, tipo_linea, tabla_origen, tabla_fabricacion, tabla_parametros, procedimiento, activo, producto, acc_sistema_id)
select @juego, 'Enrollable · ZZ v3 a', 1, tabla_origen, tabla_fabricacion, tabla_parametros, procedimiento, 1, 1, @s1
from SOL_FABRICACION_PRODUCTOS where producto = 1
insert SOL_FABRICACION_PARAMETROS (sistema, name, tipo, origen, orden) values (@juego, '@ANCHO', 'COLUMNA', 'ancho', 1)
insert SOL_ARTICULOS_FABRICACION_RELACION_V2 (sistema, orden, atributo, valor, articulos, nombre_parametro1, consumo) values
	(@juego, 1, 'ZZ tubo',  '', '24', '', '@ANCHO'),
	(@juego, 2, 'ZZ pieza', '', '55', '', '2')

update SOL_PEDIDOS_COLA_TIPO_1 set nacc_accionamiento_id = @acc, nacc_sistema_id = @s1 where id = @B
execute sp_fabricacion_generate @pedido, 1, 0, 1

if (select count(*) from SOL_PEDIDOS_COLA_TIPO_1_FABRICACION where idrow = @B) = 2
   and not exists (select 1 from SOL_PEDIDOS_COLA_TIPO_1_FABRICACION where idrow = @B and idpedido <> 2)
   and exists (select 1 from SOL_PEDIDOS_COLA_TIPO_1_FABRICACION where idrow = @B and articulo = 24 and consumo = 1.2)
   and (select count(*) from SOL_PEDIDOS_COLA_TIPO_1_PARAMETERS where idrow = @B and idpedido = 2) = 1
	print 'OK    caso 1: la línea del medio sale por reglas (2 componentes, idpedido 2, parámetros guardados)'
else begin print 'FALLO caso 1: línea del medio'; set @fallos += 1 end

if (select min(idpedido) from @antes where idrow = @B) = 2
	print 'OK    la línea del medio ya era la 2 en su fabricación anterior'
else begin print 'FALLO la fabricación anterior no numeraba la línea del medio como 2'; set @fallos += 1 end

select @n = count(*) from (
	select * from @antes where idrow in (@A, @C)
	except
	select id, idrow, idpedido, articulo, descripcion, cantidad, unidad, consumo, orden, ancho, alto, cod_sol
	from SOL_PEDIDOS_COLA_TIPO_1_FABRICACION where idrow in (@A, @C)) d
if @n = 0 and (select count(*) from @antes where idrow in (@A, @C)) = (select count(*) from SOL_PEDIDOS_COLA_TIPO_1_FABRICACION where idrow in (@A, @C))
	print 'OK    caso 1: las líneas antiguas 1 y 3 sin tocar (mismas filas y mismos id)'
else begin print 'FALLO caso 1: líneas antiguas cambiadas (' + cast(@n as varchar) + ' diferencias)'; set @fallos += 1 end

/* ---- caso 2 ---- */
update SOL_PEDIDOS_COLA_TIPO_1 set nacc_accionamiento_id = @acc, nacc_sistema_id = @s2 where id = @A
execute sp_fabricacion_generate @pedido, 1, 0, 1

select @n = count(*) from (
	select * from @antes where idrow = @C
	except
	select id, idrow, idpedido, articulo, descripcion, cantidad, unidad, consumo, orden, ancho, alto, cod_sol
	from SOL_PEDIDOS_COLA_TIPO_1_FABRICACION where idrow = @C) d
if not exists (select 1 from SOL_PEDIDOS_COLA_TIPO_1_FABRICACION where idrow = @A)
   and (select count(*) from SOL_PEDIDOS_COLA_TIPO_1_FABRICACION where idrow = @B) = 2
   and @n = 0 and (select count(*) from @antes where idrow = @C) = (select count(*) from SOL_PEDIDOS_COLA_TIPO_1_FABRICACION where idrow = @C)
	print 'OK    caso 2: la primera (sistema sin juego) queda vacía, la del medio por reglas y la tercera sin tocar'
else begin print 'FALLO caso 2'; set @fallos += 1 end

rollback

if not exists (select 1 from SOL_ACC_SISTEMA where codigo like 'ZZ[_]V3%')
   and not exists (select 1 from SOL_FABRICACION_SISTEMAS where sistema like '%ZZ[_]V3%')
   and not exists (select 1 from SOL_PEDIDOS_COLA_TIPO_1 where id in (@A, @B, @C) and nacc_accionamiento_id is not null)
   and not exists (select 1 from SOL_PEDIDOS_COLA_TIPO_1_PARAMETERS where idrow in (@A, @B, @C))
   and (select count(*) from SOL_PEDIDOS_COLA_TIPO_1_FABRICACION where idrow in (@A, @B, @C)) = (select count(*) from @antes)
	print 'OK    rollback: sin restos'
else begin print 'FALLO quedan restos'; set @fallos += 1 end

print case when @fallos = 0 then 'TODO OK' else cast(@fallos as varchar) + ' FALLOS' end
