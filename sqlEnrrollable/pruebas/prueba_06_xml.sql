/* Prueba del 06 (XML del enrollable: CANT y FACTOR según la unidad) contra la BD local, con rollback.
   Un juego ZZ sobre la línea 9348 del pedido real 7304, con cantidad 2 (dos <Detalles>) y reglas con un
   artículo de cada tipo:
     55   (unidad 1 Ud, 01121)   consumo 2     -> CANT 2    FACTOR 1
     55   (unidad 1 Ud, 01121)   consumo 0,5   -> CANT 0,5  FACTOR 1
     2823 (unidad 4 juego)       consumo 1     -> CANT 1    FACTOR 1
     2166 (unidad 2 m2)         consumo 3,25  -> CANT 1    FACTOR 3,25
     24   (unidad 3 ml, 00007)  consumo @ANCHO cm = 1,005 m -> CANT 1  FACTOR 1,005
     tejido del maestro (sin unidad, 03258) consumo en m2    -> CANT 1  FACTOR 1,3839
     artículo dinámico sin resolver (SIN ARTÍCULO)           -> no sale en el XML
   Ejecutar: sqlcmd -S <servidor> -U sa -C -d SOLARMANES_DEV -f 65001 -i prueba_06_xml.sql */
set nocount on
set xact_abort on

declare @pedido int = 7304, @B int = 9348, @L int = 9348
declare @fallos int = 0
declare @acc int, @s1 int, @r int, @n int, @linea int
declare @juego varchar(50) = 'ENROLLABLE_ZZ_XML'
declare @xml table(n int identity(1,1), value nvarchar(max))
declare @t nvarchar(max) = ''

if object_definition(object_id('dbo.sp_fichero_produccion_2')) not like '%sqlEnrrollable/06%'
begin
	print 'FALLO el script 06 no está aplicado'
	return
end

begin tran

select top 1 @acc = id from SOL_ACC_ACCIONAMIENTO order by id
insert SOL_ACC_SISTEMA (codigo, nombre) values ('ZZ_XML', 'ZZ xml') set @s1 = scope_identity()
insert SOL_FABRICACION_SISTEMAS (sistema, descripcion, tipo_linea, tabla_origen, tabla_fabricacion, tabla_parametros, procedimiento, activo, producto, acc_sistema_id)
select @juego, 'Enrollable · ZZ xml', 1, tabla_origen, tabla_fabricacion, tabla_parametros, procedimiento, 1, 1, @s1
from SOL_FABRICACION_PRODUCTOS where producto = 1

execute @r = sp_fabricacion_parametro_edit @juego, '@ANCHO', 'COLUMNA', 'ancho', 10
execute @r = sp_fabricacion_parametro_edit @juego, '@ALTO', 'COLUMNA', 'alto', 20
execute @r = sp_fabricacion_parametro_edit @juego, '@TEJIDO_ID', 'COLUMNA', 'nacc_tejido_id', 30
execute @r = sp_fabricacion_parametro_edit @juego, '@TEJIDO_ANCHO', 'FORMULA', '@ANCHO -- 2', 40
execute @r = sp_fabricacion_parametro_edit @juego, '@TEJIDO_REFERENCIA', 'BUSQUEDA', '@TEJIDO_ID', 200, 'ENR_TEJIDO_SOLUPYME'
execute @r = sp_fabricacion_parametro_edit @juego, '@TEJIDO_ARTICULO', 'BUSQUEDA', '@TEJIDO_REFERENCIA', 210, 'ARTICULO_POR_CODIGO'
execute @r = sp_fabricacion_parametro_edit @juego, '@NOEXISTE', 'FORMULA', '@ANCHO', 220

insert SOL_ARTICULOS_FABRICACION_RELACION_V2 (sistema, orden, atributo, valor, articulos, nombre_parametro1, consumo, param_ancho, param_alto) values
	(@juego, 1, 'TEJIDO',  '', '@TEJIDO_ARTICULO', '', '@TEJIDO_ANCHO ** @ALTO *T 0.0001', '@TEJIDO_ANCHO', '@ALTO'),
	(@juego, 2, 'UD 2',    '', '55',   '', '2',    '', ''),
	(@juego, 3, 'UD 0,5',  '', '55',   '', '0.5',  '', ''),
	(@juego, 4, 'JUEGO',   '', '2823', '', '1',    '', ''),
	(@juego, 5, 'M2',      '', '2166', '', '3.25', '', ''),
	(@juego, 6, 'ML',      '', '24',   '', '@ANCHO', '', ''),
	(@juego, 7, 'SIN ART', '', '@NOEXISTE', '', '1', '', '')

update SOL_PEDIDOS_COLA_TIPO_1 set nacc_accionamiento_id = @acc, nacc_sistema_id = @s1, nacc_tejido_id = 1,
       tej_tipo_id = -1, tej_color_id = -1, ancho = 100.5, alto = 140.5, cantidad = 2
where id = @B

execute temp_sp_fabricacion_tipo_1_v3 @pedido, 0, 1

insert @xml(value) execute sp_fichero_produccion_2 @pedido
select @t = @t + value + char(10) from @xml order by n

/* Solo el trozo de la línea de prueba: sus <Detalles> son los que llevan el tejido 03258 */
declare @bloques int = (len(@t) - len(replace(@t, '<C1>03258</C1>', ''))) / len('<C1>03258</C1>')
if @bloques = 2 print 'OK    dos <Detalles> (cantidad 2) con el tejido como primer componente'
else begin print 'FALLO bloques con el tejido: ' + cast(@bloques as varchar); set @fallos += 1 end

declare @esperado nvarchar(max) =
	  N'<C1>03258</C1><C1_CANT>1</C1_CANT><C1_P1>0,985000</C1_P1><C1_P2>1,405000</C1_P2><C1_P3>0</C1_P3><C1_FACTOR>1,383900</C1_FACTOR><C1_SECCION>'
declare @n2 int = (len(@t) - len(replace(@t, @esperado, ''))) / len(@esperado)
if @n2 = 2 print 'OK    tejido (sin unidad): CANT 1, FACTOR 1,3839 (m²), P1 98,5 y P2 140,5 cm en metros'
else begin print 'FALLO tejido: ' + cast(@n2 as varchar); set @fallos += 1 end

declare @c table(codigo nvarchar(20), cant nvarchar(20), factor nvarchar(20), motivo nvarchar(60))
insert @c values
	(N'01121', N'2',    N'1',        N'Ud, consumo 2 -> CANT 2, FACTOR 1'),
	(N'01121', N'0,5',  N'1',        N'Ud, consumo 0,5 -> CANT 0,5, FACTOR 1'),
	(N'3',     N'1',    N'3,250000', N'm2, consumo 3,25 -> CANT 1, FACTOR 3,25'),
	(N'00007', N'1',    N'1,005000', N'ml, 100,5 cm -> 1,005 m: CANT 1, FACTOR 1,005')

declare @codigo nvarchar(20), @cant nvarchar(20), @factor nvarchar(20), @motivo nvarchar(60), @patron nvarchar(200), @veces int
declare ic cursor local fast_forward for select codigo, cant, factor, motivo from @c where codigo <> N'3'
open ic
fetch next from ic into @codigo, @cant, @factor, @motivo
while @@fetch_status = 0
begin
	set @patron = N'>' + @codigo + N'</C%_CANT>' + @cant + N'</C%_CANT>'
	/* el componente: <Cn>codigo</Cn><Cn_CANT>cant</Cn_CANT> ... <Cn_FACTOR>factor</Cn_FACTOR> */
	select @veces = count(*) from @xml
	where value like N'%>' + @codigo + N'</C%><C%_CANT>' + @cant + N'</C%_CANT>%<C%_FACTOR>' + @factor + N'</C%_FACTOR>%'
	if @veces = 2 print 'OK    ' + @motivo + ' (2 Detalles)'
	else begin print 'FALLO ' + @motivo + ': ' + cast(@veces as varchar) + ' veces'; set @fallos += 1 end
	fetch next from ic into @codigo, @cant, @factor, @motivo
end
close ic
deallocate ic

/* juego (unidad 4): artículo 2823 */
declare @cod2823 nvarchar(20) = (select cod_solupyme from ARTICULOS where idrow = 2823)
declare @cod2166 nvarchar(20) = (select cod_solupyme from ARTICULOS where idrow = 2166)
select @veces = count(*) from @xml where value like N'%>' + @cod2823 + N'</C%><C%_CANT>1</C%_CANT>%<C%_FACTOR>1</C%_FACTOR>%'
if @veces >= 2 print 'OK    juego (unidad 4), consumo 1 -> CANT 1, FACTOR 1'
else begin print 'FALLO juego'; set @fallos += 1 end
select @veces = count(*) from @xml where value like N'%>' + @cod2166 + N'</C%><C%_CANT>1</C%_CANT>%<C%_FACTOR>3,250000</C%_FACTOR>%'
if @veces >= 2 print 'OK    m2 (unidad 2), consumo 3,25 -> CANT 1, FACTOR 3,25'
else begin print 'FALLO m2: ' + cast(@veces as varchar); set @fallos += 1 end

/* cada componente es una fila del XML: entre el tejido (C1 = 03258) y el cierre del <Detalles> hay 6 componentes
   (los 6 con artículo; el SIN ARTÍCULO no va) */
declare @ini int, @fin int, @total int = 0, @bien int = 0
declare ib cursor local fast_forward for select n from @xml where value like N'%<C1>03258</C1>%' order by n
open ib
fetch next from ib into @ini
while @@fetch_status = 0
begin
	select @fin = min(n) from @xml where n > @ini and value like N'%</Detalles>%'
	set @total += 1
	if (select count(*) from @xml where n >= @ini and n < @fin) = 6 set @bien += 1
	fetch next from ib into @ini
end
close ib
deallocate ib
if @total = 2 and @bien = 2 print 'OK    6 componentes por <Detalles>: el SIN ARTÍCULO no va al XML y el tejido es el primero'
else begin print 'FALLO componentes por Detalles: ' + cast(@bien as varchar) + ' de ' + cast(@total as varchar); set @fallos += 1 end

rollback

if not exists (select 1 from SOL_ACC_SISTEMA where codigo = 'ZZ_XML') and not exists (select 1 from SOL_FABRICACION_SISTEMAS where sistema like '%ZZ[_]XML%')
   and not exists (select 1 from SOL_PEDIDOS_COLA_TIPO_1 where id = @B and nacc_accionamiento_id is not null)
	print 'OK    rollback: sin restos'
else begin print 'FALLO quedan restos'; set @fallos += 1 end

print case when @fallos = 0 then 'TODO OK' else cast(@fallos as varchar) + ' FALLOS' end
