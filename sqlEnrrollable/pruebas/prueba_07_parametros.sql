/* Prueba del 07 (parámetros estándar del enrollable) contra la BD local, con rollback: no deja restos.
   Línea 9348 del pedido real 7304 con TODOS los pasos del configurador informados con códigos ZZ, en un juego ZZ
   creado con sp_enrollable_parametros_base:
     - el juego recibe los 57 parámetros y repetir el procedimiento no crea ninguno ni pisa lo cambiado
     - cada parámetro de la línea lleva el valor esperado (ids, códigos, altura, tejido del maestro, salida)
     - una línea de cadena sin motor deja vacíos los parámetros del motor
     - dos reglas escritas con los códigos (soporte y tapa; mando) se cumplen o no según la línea
     - un juego de HoneyComb no puede usar el procedimiento
   Ejecutar: sqlcmd -S <servidor> -U sa -C -d SOLARMANES_DEV -f 65001 -i prueba_07_parametros.sql */
set nocount on
set xact_abort on

declare @pedido int = 7304, @B int = 9348
declare @fallos int = 0
declare @n int, @r int, @creados int, @total int
declare @sis int, @cadena int, @motor int, @tcad int, @aro int, @med int, @alt int, @ccad int, @tmot int, @mmot int, @man int, @car int, @bat int
declare @sop int, @csop int, @tap int, @ctap int, @con int, @ccon int
declare @juego varchar(50) = 'ENROLLABLE_ZZ_PAR'
declare @t table(creados int)
declare @esperado table(parametro varchar(50), valor varchar(255))

begin tran

select @cadena = id from SOL_ACC_ACCIONAMIENTO where codigo = 'CADENA'
select @motor = id from SOL_ACC_ACCIONAMIENTO where codigo = 'MOTOR'

insert SOL_ACC_SISTEMA (codigo, nombre) values ('ZZ_PAR', 'ZZ par') set @sis = scope_identity()
insert SOL_ACC_TIPO_CADENA (accionamiento_id, codigo, nombre) values (@cadena, 'ZZTCAD', 'ZZ tipo cadena') set @tcad = scope_identity()
insert SOL_ACC_TIPO_ARO_CADENA (tipo_cadena_id, codigo, nombre) values (@tcad, 'ZZARO', 'ZZ aro') set @aro = scope_identity()
insert SOL_ACC_TIPO_CADENA_MEDIDA (tipo_cadena_id, codigo, nombre) values (@tcad, 'ZZMED', 'ZZ medida') set @med = scope_identity()
insert SOL_ACC_ALTURA (codigo, valor, nombre) values ('ZZALT', 125, 'ZZ altura') set @alt = scope_identity()
insert SOL_ACC_COLOR_CADENA (codigo, nombre) values ('ZZCCAD', 'ZZ color cadena') set @ccad = scope_identity()
insert SOL_ACC_TIPO_MOTOR (accionamiento_id, codigo, nombre) values (@motor, 'ZZTMOT', 'ZZ tipo motor') set @tmot = scope_identity()
insert SOL_ACC_MODELO_MOTOR (tipo_motor_id, codigo, nombre) values (@tmot, 'ZZMMOT', 'ZZ modelo motor') set @mmot = scope_identity()
insert SOL_ACC_MANDO (codigo, nombre) values ('ZZMAN', 'ZZ mando') set @man = scope_identity()
insert SOL_ACC_CARGADOR (codigo, nombre) values ('ZZCAR', 'ZZ cargador') set @car = scope_identity()
insert SOL_ACC_BATERIA (codigo, nombre) values ('ZZBAT', 'ZZ bateria') set @bat = scope_identity()
insert SOL_ACC_SOPORTE (codigo, nombre) values ('ZZSOP', 'ZZ soporte') set @sop = scope_identity()
insert SOL_ACC_COLOR_SOPORTE (codigo, nombre) values ('ZZCSOP', 'ZZ color soporte') set @csop = scope_identity()
insert SOL_ACC_TAPA (codigo, nombre) values ('ZZTAP', 'ZZ tapa') set @tap = scope_identity()
insert SOL_ACC_COLOR_TAPA (codigo, nombre) values ('ZZCTAP', 'ZZ color tapa') set @ctap = scope_identity()
insert SOL_ACC_CONTRAPESO (codigo, nombre) values ('ZZCON', 'ZZ contrapeso') set @con = scope_identity()
insert SOL_ACC_COLOR_CONTRAPESO (codigo, nombre) values ('ZZCCON', 'ZZ color contrapeso') set @ccon = scope_identity()

insert SOL_FABRICACION_SISTEMAS (sistema, descripcion, tipo_linea, tabla_origen, tabla_fabricacion, tabla_parametros, procedimiento, activo, producto, acc_sistema_id)
select @juego, 'Enrollable · ZZ par', 1, tabla_origen, tabla_fabricacion, tabla_parametros, procedimiento, 1, 1, @sis
from SOL_FABRICACION_PRODUCTOS where producto = 1

/* ---- el procedimiento crea los parámetros, una sola vez, sin pisar los cambiados ---- */
insert @t execute sp_enrollable_parametros_base @juego
select @creados = creados from @t
select @n = count(*) from SOL_FABRICACION_PARAMETROS where sistema = @juego
if @creados = 57 and @n = 57 print 'OK    el juego recibe 57 parámetros'
else begin print 'FALLO parámetros creados: ' + cast(@creados as varchar) + ' / ' + cast(@n as varchar); set @fallos += 1 end

update SOL_FABRICACION_PARAMETROS set orden = 9999 where sistema = @juego and name = '@ANCHO'
delete @t
insert @t execute sp_enrollable_parametros_base @juego
select @creados = creados from @t
select @n = count(*) from SOL_FABRICACION_PARAMETROS where sistema = @juego
if @creados = 0 and @n = 57 and (select orden from SOL_FABRICACION_PARAMETROS where sistema = @juego and name = '@ANCHO') = 9999
	print 'OK    repetirlo no crea nada y respeta un parámetro cambiado'
else begin print 'FALLO al repetir: ' + cast(@creados as varchar); set @fallos += 1 end
update SOL_FABRICACION_PARAMETROS set orden = 20 where sistema = @juego and name = '@ANCHO'

/* ---- línea con todos los pasos: cadena a medida con altura ---- */
update SOL_PEDIDOS_COLA_TIPO_1 set
	nacc_accionamiento_id = @cadena, nacc_sistema_id = @sis, nacc_tipo_cadena_id = @tcad, nacc_tipo_aro_id = @aro,
	nacc_cadena_medida_id = @med, nacc_altura_id = @alt, nacc_color_cadena_id = @ccad, nacc_tipo_motor_id = @tmot,
	nacc_modelo_motor_id = @mmot, nacc_mando_id = @man, nacc_cargador_id = @car, nacc_bateria_id = @bat,
	nacc_soporte_id = @sop, nacc_soporte_color_id = @csop, nacc_tapa_id = @tap, nacc_tapa_color_id = @ctap,
	nacc_contrapeso_id = @con, nacc_contrapeso_color_id = @ccon, nacc_cadena_longitud = 150,
	nacc_tejido_id = 1, tej_tipo_id = -1, tej_color_id = -1,
	acc_posicion_id = 1, acc_posicion_text = 'Derecha', impresion = 1, tej_salida_id = 2, tej_salida_text = 'Pegado Pared',
	ancho = 100.5, alto = 140.5, cantidad = 2
where id = @B

insert SOL_ARTICULOS_FABRICACION_RELACION_V2 (sistema, orden, atributo, valor, articulos, nombre_parametro1, nombre_parametro2, operacion, consumo) values
	(@juego, 1, 'ZZ soporte y tapa', '', '55', '@SOPORTE == ZZSOP', '@TAPA == ZZTAP', 'Y', '1'),
	(@juego, 2, 'ZZ mando', '', '24', '@MANDO == ZZMAN', '', '-', '@ANCHO')

execute temp_sp_fabricacion_tipo_1_v3 @pedido, 0, 1

declare @idtejart varchar(20) = (select cast(a.idrow as varchar) from SOL_TEJIDOS_MAESTRO m join ARTICULOS a on a.cod_solupyme = m.cod_solupyme where m.idrow = 1)
declare @idsal varchar(20) = (select cast(articulos as varchar) from SOL_ARTICULOS_SALIDATEJIDO where idrow = 2)

insert @esperado values
	('@CANTIDAD', '2'), ('@ANCHO', '100.50'), ('@ALTO', '140.50'), ('@CADENA_LONGITUD', '150.00'),
	('@POSICION_ID', '1'), ('@POSICION', 'DERECHA'), ('@IMPRESION', '1'),
	('@SALIDA_TEJIDO_ID', '2'), ('@SALIDA_TEJIDO', 'PEGADO PARED'), ('@SALIDA_TEJIDO_ARTICULO', @idsal),
	('@SISTEMA_ID', cast(@sis as varchar)), ('@SISTEMA', 'ZZ_PAR'),
	('@ACCIONAMIENTO', 'CADENA'), ('@TIPO_CADENA', 'ZZTCAD'), ('@TIPO_ARO', 'ZZARO'), ('@CADENA_MEDIDA', 'ZZMED'),
	('@ALTURA', 'ZZALT'), ('@ALTURA_VALOR', '125.00'), ('@COLOR_CADENA', 'ZZCCAD'),
	('@TIPO_MOTOR', 'ZZTMOT'), ('@MODELO_MOTOR', 'ZZMMOT'), ('@MANDO', 'ZZMAN'), ('@CARGADOR', 'ZZCAR'), ('@BATERIA', 'ZZBAT'),
	('@SOPORTE', 'ZZSOP'), ('@COLOR_SOPORTE', 'ZZCSOP'), ('@TAPA', 'ZZTAP'), ('@COLOR_TAPA', 'ZZCTAP'),
	('@CONTRAPESO', 'ZZCON'), ('@COLOR_CONTRAPESO', 'ZZCCON'),
	('@TEJIDO_ID', '1'), ('@TEJIDO_REFERENCIA', '03258'), ('@TEJIDO_ARTICULO', @idtejart),
	('@TEJIDO_NOMBRE', 'ATENAS SCREEN OPACO'), ('@TEJIDO_COLOR', 'BLANCO'), ('@TEJIDO_CRITERIO', '300'),
	('@TEJIDO_GRUPO', 'B300'), ('@TEJIDO_IMPRESION', '0')

select @n = count(*) from @esperado e
join SOL_PEDIDOS_COLA_TIPO_1_PARAMETERS p on p.idrow = @B and p.parametro = e.parametro and p.valor = e.valor
select @total = count(*) from @esperado
if @n = @total print 'OK    los ' + cast(@n as varchar) + ' parámetros de la línea llevan el valor esperado (ids, códigos, altura, salida y tejido)'
else
begin
	print 'FALLO parámetros con otro valor (esperados / correctos): ' + cast(@total as varchar) + ' / ' + cast(@n as varchar)
	select e.parametro, e.valor esperado, p.valor obtenido from @esperado e left join SOL_PEDIDOS_COLA_TIPO_1_PARAMETERS p on p.idrow = @B and p.parametro = e.parametro
	where isnull(p.valor, '#') <> e.valor
	set @fallos += 1
end

/* el tipo de tejido sale del catálogo de tipos */
if exists (select 1 from SOL_PEDIDOS_COLA_TIPO_1_PARAMETERS p where p.idrow = @B and p.parametro = '@TEJIDO_TIPO' and p.valor is not null and p.valor = (select upper(t.descripcion) from SOL_TEJIDOS_MAESTRO m join SOL_TEJIDOS_TIPOS t on t.idrow = m.tipo_tejido where m.idrow = 1))
   or ((select tipo_tejido from SOL_TEJIDOS_MAESTRO where idrow = 1) is null and exists (select 1 from SOL_PEDIDOS_COLA_TIPO_1_PARAMETERS where idrow = @B and parametro = '@TEJIDO_TIPO' and valor is null))
	print 'OK    @TEJIDO_TIPO sale del catálogo de tipos de tejido'
else begin print 'FALLO @TEJIDO_TIPO'; set @fallos += 1 end

/* reglas con los códigos */
if (select count(*) from SOL_PEDIDOS_COLA_TIPO_1_FABRICACION where idrow = @B) = 2
   and exists (select 1 from SOL_PEDIDOS_COLA_TIPO_1_FABRICACION where idrow = @B and orden = 1 and articulo = 55)
   and exists (select 1 from SOL_PEDIDOS_COLA_TIPO_1_FABRICACION where idrow = @B and orden = 2 and articulo = 24 and consumo = 1.005)
	print 'OK    las reglas escritas con los códigos (soporte y tapa; mando) se cumplen'
else begin print 'FALLO reglas con códigos'; set @fallos += 1 end

/* ---- línea sin motor ni mando: el paso queda vacío y la regla del mando no aplica ---- */
update SOL_PEDIDOS_COLA_TIPO_1 set nacc_tipo_motor_id = null, nacc_modelo_motor_id = null, nacc_mando_id = null,
       nacc_cargador_id = null, nacc_bateria_id = null, nacc_tipo_cadena_id = @tcad where id = @B
execute temp_sp_fabricacion_tipo_1_v3 @pedido, 0, 1
select @n = count(*) from SOL_PEDIDOS_COLA_TIPO_1_PARAMETERS where idrow = @B and parametro in ('@TIPO_MOTOR','@MODELO_MOTOR','@MANDO','@CARGADOR','@BATERIA') and valor is null
if @n = 5 and (select count(*) from SOL_PEDIDOS_COLA_TIPO_1_FABRICACION where idrow = @B) = 1
	print 'OK    cadena sin motor: motor, mando, cargador y batería vacíos, y la regla del mando no aplica'
else begin print 'FALLO línea sin motor: ' + cast(@n as varchar); set @fallos += 1 end

/* ---- HoneyComb no puede usar el procedimiento ---- */
begin try
	insert @t execute sp_enrollable_parametros_base 'HONEYCOMB'
	print 'FALLO HoneyComb no debería poder usarlo'; set @fallos += 1
end try
begin catch
	print 'OK    HoneyComb no puede usarlo: ' + error_message()
end catch

rollback

if not exists (select 1 from SOL_ACC_SISTEMA where codigo = 'ZZ_PAR') and not exists (select 1 from SOL_FABRICACION_SISTEMAS where sistema like '%ZZ[_]PAR%')
   and not exists (select 1 from SOL_FABRICACION_PARAMETROS where sistema like '%ZZ[_]PAR%')
   and not exists (select 1 from SOL_ACC_SOPORTE where codigo = 'ZZSOP')
   and not exists (select 1 from SOL_PEDIDOS_COLA_TIPO_1 where id = @B and nacc_accionamiento_id is not null)
	print 'OK    rollback: sin restos'
else begin print 'FALLO quedan restos'; set @fallos += 1 end

print case when @fallos = 0 then 'TODO OK' else cast(@fallos as varchar) + ' FALLOS' end
