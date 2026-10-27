/* =====================================================================
   08 - Fabricación del enrollable sin tipo de aro ni tipo de cadena a medida (va con sqlAccionamientos/34 y 35)
   Los tipos de aro de cadena eran las alturas: el 34 los pasa a SOL_ACC_ALTURA con el MISMO código
   (100_CM, 125_CM...) y borra SOL_ACC_TIPO_ARO_CADENA y la columna nacc_tipo_aro_id. Antes, aquí:
   - Las reglas de los juegos del enrollable que preguntan por el tipo de aro pasan a preguntar por la
     altura: "@TIPO_ARO == 100_CM" -> "@ALTURA == 100_CM" (decisión del usuario, 2026-10-27). Como el
     código es el mismo, la regla da lo mismo.
   - Fuera los parámetros @TIPO_ARO y @TIPO_ARO_ID de esos juegos y la búsqueda ENR_TIPO_ARO.
   - Cadena a medida ya no tiene tipos (el 35 borra SOL_ACC_TIPO_CADENA_MEDIDA y nacc_cadena_medida_id): fuera
     los parámetros @CADENA_MEDIDA y @CADENA_MEDIDA_ID y la búsqueda ENR_CADENA_MEDIDA. Ninguna regla los usaba;
     siguen @TIPO_CADENA == CADENA_A_MEDIDA, @CADENA_LONGITUD y el color.
   - Los parámetros estándar del enrollable quedan en 53: el 07 (ya sin ellos) se vuelve a ejecutar después
     de este, para que sp_enrollable_parametros_base no los vuelva a crear.
   Se para sin tocar nada si una regla usa @TIPO_ARO_ID (es un id de aro, no de altura) o @CADENA_MEDIDA,
   o si otro parámetro se calcula a partir de los que se borran.
   Idempotente: si ya no quedan, no hace nada.
   ===================================================================== */
set nocount on
go

declare @juegos table (sistema varchar(50) primary key)
insert @juegos select sistema from SOL_FABRICACION_SISTEMAS where producto = 1

/* textos de la regla en los que puede aparecer un parámetro */
declare @textos table (idrow int, campo varchar(30), texto varchar(4000))
insert @textos
select r.idrow, x.campo, x.texto
from SOL_ARTICULOS_FABRICACION_RELACION_V2 r
join @juegos j on j.sistema = r.sistema
cross apply (values ('nombre_parametro1', r.nombre_parametro1), ('nombre_parametro2', r.nombre_parametro2),
                    ('nombre_parametro3', r.nombre_parametro3), ('nombre_parametro4', r.nombre_parametro4),
                    ('consumo', r.consumo), ('articulos', r.articulos),
                    ('param_ancho', r.param_ancho), ('param_alto', r.param_alto)) x(campo, texto)
where x.texto like '%@TIPO[_]ARO%'

if exists (select 1 from @textos where texto like '%@TIPO[_]ARO[_]ID%')
begin
	raiserror('08: hay reglas que usan @TIPO_ARO_ID (un id de aro, que no vale como altura): cámbielas a mano. No se ha hecho nada', 16, 1)
	set noexec on
end
else if exists (select 1 from SOL_ARTICULOS_FABRICACION_RELACION_V2 r join @juegos j on j.sistema = r.sistema
                where concat(r.nombre_parametro1, '|', r.nombre_parametro2, '|', r.nombre_parametro3, '|', r.nombre_parametro4, '|',
                             r.consumo, '|', r.articulos, '|', r.param_ancho, '|', r.param_alto) like '%@CADENA[_]MEDIDA%')
begin
	raiserror('08: hay reglas que usan @CADENA_MEDIDA (el tipo de cadena a medida desaparece): cámbielas a mano. No se ha hecho nada', 16, 1)
	set noexec on
end
else if exists (select 1 from SOL_FABRICACION_PARAMETROS p join @juegos j on j.sistema = p.sistema
                where p.name not in ('@TIPO_ARO', '@TIPO_ARO_ID', '@CADENA_MEDIDA', '@CADENA_MEDIDA_ID')
                  and (p.origen like '%@TIPO[_]ARO%' or p.origen like '%@CADENA[_]MEDIDA%'))
begin
	raiserror('08: hay parámetros que se calculan a partir de @TIPO_ARO o @CADENA_MEDIDA: cámbielos a mano. No se ha hecho nada', 16, 1)
	set noexec on
end
go

begin transaction

/* "@TIPO_ARO" como palabra entera (no "@TIPO_AROX"): se marca el final del texto con char(1) */
declare @fin char(1) = char(1)
update r set
	nombre_parametro1 = replace(replace(replace(r.nombre_parametro1 + @fin, '@TIPO_ARO ', '@ALTURA '), '@TIPO_ARO' + @fin, '@ALTURA' + @fin), @fin, ''),
	nombre_parametro2 = replace(replace(replace(r.nombre_parametro2 + @fin, '@TIPO_ARO ', '@ALTURA '), '@TIPO_ARO' + @fin, '@ALTURA' + @fin), @fin, ''),
	nombre_parametro3 = replace(replace(replace(r.nombre_parametro3 + @fin, '@TIPO_ARO ', '@ALTURA '), '@TIPO_ARO' + @fin, '@ALTURA' + @fin), @fin, ''),
	nombre_parametro4 = replace(replace(replace(r.nombre_parametro4 + @fin, '@TIPO_ARO ', '@ALTURA '), '@TIPO_ARO' + @fin, '@ALTURA' + @fin), @fin, ''),
	consumo           = replace(replace(replace(r.consumo + @fin, '@TIPO_ARO ', '@ALTURA '), '@TIPO_ARO' + @fin, '@ALTURA' + @fin), @fin, ''),
	param_ancho       = replace(replace(replace(r.param_ancho + @fin, '@TIPO_ARO ', '@ALTURA '), '@TIPO_ARO' + @fin, '@ALTURA' + @fin), @fin, ''),
	param_alto        = replace(replace(replace(r.param_alto + @fin, '@TIPO_ARO ', '@ALTURA '), '@TIPO_ARO' + @fin, '@ALTURA' + @fin), @fin, '')
from SOL_ARTICULOS_FABRICACION_RELACION_V2 r
join SOL_FABRICACION_SISTEMAS s on s.sistema = r.sistema and s.producto = 1
where concat(r.nombre_parametro1, '|', r.nombre_parametro2, '|', r.nombre_parametro3, '|', r.nombre_parametro4, '|',
             r.consumo, '|', r.param_ancho, '|', r.param_alto) like '%@TIPO[_]ARO%'
print '08: ' + cast(@@rowcount as varchar) + ' reglas pasan de @TIPO_ARO a @ALTURA'

/* No puede quedar ninguna (por ejemplo, "@TIPO_ARO" pegado a un operador) */
if exists (select 1 from SOL_ARTICULOS_FABRICACION_RELACION_V2 r
           join SOL_FABRICACION_SISTEMAS s on s.sistema = r.sistema and s.producto = 1
           where concat(r.nombre_parametro1, '|', r.nombre_parametro2, '|', r.nombre_parametro3, '|', r.nombre_parametro4, '|',
                        r.consumo, '|', r.articulos, '|', r.param_ancho, '|', r.param_alto) like '%@TIPO[_]ARO%')
begin
	rollback transaction
	raiserror('08: quedan reglas con @TIPO_ARO que no se han podido cambiar solas: no se ha hecho nada', 16, 1)
	set noexec on
end
go

delete p from SOL_FABRICACION_PARAMETROS p
join SOL_FABRICACION_SISTEMAS s on s.sistema = p.sistema and s.producto = 1
where p.name in ('@TIPO_ARO', '@TIPO_ARO_ID', '@CADENA_MEDIDA', '@CADENA_MEDIDA_ID')
print '08: ' + cast(@@rowcount as varchar) + ' parámetros del tipo de aro y del tipo de cadena a medida borrados'

delete from SOL_FABRICACION_BUSQUEDAS where busqueda in ('ENR_TIPO_ARO', 'ENR_CADENA_MEDIDA')
print '08: ' + cast(@@rowcount as varchar) + ' búsquedas ENR_TIPO_ARO / ENR_CADENA_MEDIDA borradas'

commit transaction
go

set noexec off
go

if object_definition(object_id('dbo.sp_enrollable_parametros_base')) like '%@TIPO[_]ARO%'
   or object_definition(object_id('dbo.sp_enrollable_parametros_base')) like '%@CADENA[_]MEDIDA%'
	print '08: AVISO: ejecute ahora de nuevo 07_parametros_enrollable.sql (versión sin tipo de aro ni de cadena a medida), o un sistema nuevo volvería a tenerlos'
go
