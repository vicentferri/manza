/* Prueba de 01 + 02 (temp_sp_fabricacion_tipo_1_v3) contra la BD local.
   Todo dentro de una transacción que se deshace al final: no deja restos.
   Toma el pedido real 7304 (cliente 4, tres líneas de enrollable antiguas con fabricación):
     - línea A (9346): pasa al modelo nuevo con el sistema ZZ_V3A, que tiene juego con 4 reglas
     - línea B (9348): pasa al modelo nuevo con el sistema ZZ_V3B, que no tiene juego
     - línea C (9347): sigue en el modelo antiguo; su fabricación no debe cambiar
   Ejecutar: sqlcmd -S <servidor> -U sa -C -d SOLARMANES_DEV -f 65001 -i prueba_02_tipo_1_v3.sql */
set nocount on
set xact_abort on

declare @pedido int = 7304, @A int = 9346, @B int = 9348, @C int = 9347
declare @fallos int = 0
declare @acc int, @s1 int, @s2 int
declare @juego varchar(50) = 'ENROLLABLE_ZZ_V3A'
declare @hashC int, @nC int, @nA int, @n int

begin tran

select top 1 @acc = id from SOL_ACC_ACCIONAMIENTO order by id
insert SOL_ACC_SISTEMA (codigo, nombre) values ('ZZ_V3A', 'ZZ v3 a') set @s1 = scope_identity()
insert SOL_ACC_SISTEMA (codigo, nombre) values ('ZZ_V3B', 'ZZ v3 b') set @s2 = scope_identity()

/* Juego del sistema A con el cableado del producto 1 (como POST /fabricacion/sistemas) */
insert SOL_FABRICACION_SISTEMAS (sistema, descripcion, tipo_linea, tabla_origen, tabla_fabricacion, tabla_parametros, procedimiento, activo, producto, acc_sistema_id)
select @juego, 'Enrollable · ZZ v3 a', 1, tabla_origen, tabla_fabricacion, tabla_parametros, procedimiento, 1, 1, @s1
from SOL_FABRICACION_PRODUCTOS where producto = 1

insert SOL_FABRICACION_PARAMETROS (sistema, name, tipo, origen, orden) values
	(@juego, '@ANCHO', 'COLUMNA', 'ancho', 1),
	(@juego, '@ALTO',  'COLUMNA', 'alto',  2),
	(@juego, '@DOBLE', 'FORMULA', '@ANCHO ** 2', 3)

/* 24 = artículo en metros (unidad 3), 55 = artículo por unidades */
insert SOL_ARTICULOS_FABRICACION_RELACION_V2 (sistema, orden, atributo, valor, articulos, nombre_parametro1, consumo) values
	(@juego, 1, 'ZZ tubo', '',      '24',        '',              '@ANCHO'),
	(@juego, 2, 'ZZ pieza', '',     '55',        '@ALTO >= 100',  '2'),
	(@juego, 3, 'ZZ no aplica', '', '55',        '@ANCHO >> 500', '1'),
	(@juego, 4, 'ZZ dinámico', '',  '@NOEXISTE', '',              '1')

select @hashC = checksum_agg(binary_checksum(articulo, descripcion, cantidad, unidad, consumo, orden, ancho, alto, idpedido, cod_sol)),
       @nC = count(*)
from SOL_PEDIDOS_COLA_TIPO_1_FABRICACION where idrow = @C
select @nA = count(*) from SOL_PEDIDOS_COLA_TIPO_1_FABRICACION where idrow = @A

update SOL_PEDIDOS_COLA_TIPO_1 set nacc_accionamiento_id = @acc, nacc_sistema_id = @s1 where id = @A
update SOL_PEDIDOS_COLA_TIPO_1 set nacc_accionamiento_id = @acc, nacc_sistema_id = @s2 where id = @B

/* ---- modo presupuesto: no hace nada ---- */
execute temp_sp_fabricacion_tipo_1_v3 @pedido, 0, 0
select @n = count(*) from SOL_PEDIDOS_COLA_TIPO_1_FABRICACION where idrow = @A
if @n = @nA print 'OK    modo presupuesto (@real = 0): no toca nada (' + cast(@n as varchar) + ' filas)'
else begin print 'FALLO modo presupuesto ha cambiado la línea A'; set @fallos += 1 end

/* ---- modo real ---- */
execute temp_sp_fabricacion_tipo_1_v3 @pedido, 0, 1

select @n = count(*) from SOL_PEDIDOS_COLA_TIPO_1_FABRICACION where idrow = @A
if @n = 3 print 'OK    línea A: 3 componentes (la regla 3 no aplica)'
else begin print 'FALLO línea A: ' + cast(@n as varchar) + ' componentes, se esperaban 3'; set @fallos += 1 end

if exists (select 1 from SOL_PEDIDOS_COLA_TIPO_1_FABRICACION where idrow = @A and orden = 1 and articulo = 24
           and unidad = 3 and consumo = 1.2 and cantidad = 1 and ancho = 120 and alto = 140 and idpedido = 1
           and isnull(cod_sol,'') <> '' and descUnidad is not null and seccion is not null)
	print 'OK    regla 1: tubo en metros (120 cm -> 1,2), posición 1, enriquecido'
else begin print 'FALLO regla 1'; set @fallos += 1 end

if exists (select 1 from SOL_PEDIDOS_COLA_TIPO_1_FABRICACION where idrow = @A and orden = 2 and articulo = 55 and consumo = 2)
	print 'OK    regla 2: condición @ALTO >= 100 cumplida, consumo 2'
else begin print 'FALLO regla 2'; set @fallos += 1 end

if exists (select 1 from SOL_PEDIDOS_COLA_TIPO_1_FABRICACION where idrow = @A and orden = 4 and articulo is null
           and unidad is null and descripcion like 'SIN ART%NOEXISTE%')
	print 'OK    regla 4: artículo dinámico sin resolver -> línea SIN ARTÍCULO'
else begin print 'FALLO regla 4'; set @fallos += 1 end

select @n = count(*) from SOL_PEDIDOS_COLA_TIPO_1_PARAMETERS where idrow = @A and idpedido = 1
if @n = 3 and exists (select 1 from SOL_PEDIDOS_COLA_TIPO_1_PARAMETERS where idrow = @A and parametro = '@DOBLE' and try_cast(valor as decimal(12,2)) = 240)
	print 'OK    parámetros de A guardados (3, @DOBLE = 240)'
else begin print 'FALLO parámetros de A: ' + cast(@n as varchar); set @fallos += 1 end

select @n = count(*) from SOL_PEDIDOS_COLA_TIPO_1_FABRICACION where idrow = @B
if @n = 0 and not exists (select 1 from SOL_PEDIDOS_COLA_TIPO_1_PARAMETERS where idrow = @B)
	print 'OK    línea B (sistema sin juego): hoja vacía'
else begin print 'FALLO línea B: ' + cast(@n as varchar) + ' filas'; set @fallos += 1 end

if @nC = (select count(*) from SOL_PEDIDOS_COLA_TIPO_1_FABRICACION where idrow = @C)
   and @hashC = (select checksum_agg(binary_checksum(articulo, descripcion, cantidad, unidad, consumo, orden, ancho, alto, idpedido, cod_sol))
                 from SOL_PEDIDOS_COLA_TIPO_1_FABRICACION where idrow = @C)
   and not exists (select 1 from SOL_PEDIDOS_COLA_TIPO_1_PARAMETERS where idrow = @C)
	print 'OK    línea C (modelo antiguo): fabricación intacta (' + cast(@nC as varchar) + ' filas)'
else begin print 'FALLO línea C cambiada'; set @fallos += 1 end

/* Segunda ejecución: borra y regenera, no duplica */
execute temp_sp_fabricacion_tipo_1_v3 @pedido, 0, 1
if (select count(*) from SOL_PEDIDOS_COLA_TIPO_1_FABRICACION where idrow = @A) = 3
   and (select count(*) from SOL_PEDIDOS_COLA_TIPO_1_PARAMETERS where idrow = @A) = 3
	print 'OK    segunda ejecución: no duplica'
else begin print 'FALLO segunda ejecución duplica'; set @fallos += 1 end

rollback

/* Después del rollback todo vuelve a estar como antes */
if (select count(*) from SOL_PEDIDOS_COLA_TIPO_1_FABRICACION where idrow = @A) = @nA
   and not exists (select 1 from SOL_ACC_SISTEMA where codigo like 'ZZ[_]V3%')
   and not exists (select 1 from SOL_FABRICACION_SISTEMAS where sistema like '%ZZ[_]V3%')
   and not exists (select 1 from SOL_PEDIDOS_COLA_TIPO_1 where id in (@A, @B) and nacc_accionamiento_id is not null)
	print 'OK    rollback: sin restos'
else begin print 'FALLO quedan restos'; set @fallos += 1 end

print case when @fallos = 0 then 'TODO OK' else cast(@fallos as varchar) + ' FALLOS' end
