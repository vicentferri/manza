/* =====================================================================
   08 - Datos de configuración HoneyComb: tejido automático y reglas
   Generado desde SOLARMANES_DEV el 2026-10-08. Idempotente: solo AÑADE lo que
   falta y NO modifica ni borra nada de lo que ya exista en la BD. Se puede
   ejecutar varias veces. Cada bloque va en su propia transacción.

   Qué lleva:
     1. Parámetros del tejido (SOL_FABRICACION_PARAMETROS): @TEJIDO_REFERENCIA,
        @TEJIDO_ARTICULO, @TEJIDO_ANCHO, @TEJIDO_ALTO (los 11 parámetros base
        los crea el script 01).
     2. Reglas HONEYCOMB (SOL_ARTICULOS_FABRICACION_RELACION_V2): las 37 de
        componentes fijos y por color de perfil, y la del TEJIDO (artículo
        @TEJIDO_ARTICULO, consumo en m2, medidas de corte en P1/P2).
        Una regla se considera ya existente si coinciden sistema, orden, elemento,
        artículos y condición 1: en ese caso no se toca (aunque difiera el consumo;
        un aviso lo indica).
     3. Referencias (código Solupyme) de los colores de tejido, solo donde estén vacías.

   Requiere: 01 y 05 (tablas y columnas param_ancho/param_alto), 07 (ALTO_PLIEGUES).
   Al final muestra avisos: leerlos antes de dar el despliegue por bueno.

   OJO: en DEV la regla PERFIL CRISTAL de orden 10 lleva '@ANCHO -- 10' (las demás
   piezas de perfil llevan '-- 0'). Confirmar que es lo correcto antes de pasarlo.
   ===================================================================== */
set ansi_nulls on
go
set quoted_identifier on
go

/* ---------------- Comprobación de requisitos ---------------- */
declare @falta varchar(300) = null
if object_id('dbo.SOL_FABRICACION_PARAMETROS') is null or object_id('dbo.SOL_FABRICACION_TABLAS') is null
	set @falta = 'faltan las tablas del motor (script 01)'
else if col_length('dbo.SOL_ARTICULOS_FABRICACION_RELACION_V2', 'param_ancho') is null
	set @falta = 'falta la columna param_ancho (script 01)'
else if not exists (select 1 from dbo.SOL_FABRICACION_BUSQUEDAS where busqueda = 'ARTICULO_POR_CODIGO')
	set @falta = 'falta la búsqueda ARTICULO_POR_CODIGO (script 01)'
else if not exists (select 1 from dbo.SOL_FABRICACION_TABLAS where sistema = 'HONEYCOMB' and tabla = 'ALTO_PLIEGUES')
	set @falta = 'falta la tabla ALTO_PLIEGUES (script 07)'
if @falta is not null
begin
	raiserror('08: NO SE EJECUTA, %s', 16, 1, @falta)
	set noexec on
end
go

/* ---------------- 1. Parámetros del tejido ---------------- */
begin transaction
insert into dbo.SOL_FABRICACION_PARAMETROS(sistema, name, tipo, origen, orden, busqueda, tabla)
select 'HONEYCOMB', v.name, v.tipo, v.origen, v.orden, v.busqueda, v.tabla
from (values
	(N'@TEJIDO_REFERENCIA', N'BUSQUEDA', N'@TEJIDO_COLOR_ID', 200, N'HC_TEJIDO_REFERENCIA', null),
	(N'@TEJIDO_ARTICULO', N'BUSQUEDA', N'@TEJIDO_REFERENCIA', 210, N'ARTICULO_POR_CODIGO', null),
	(N'@TEJIDO_ANCHO', N'FORMULA', N'@ANCHO -- 1', 220, null, null),
	(N'@TEJIDO_ALTO', N'TABLA', N'@ALTO', 230, null, N'ALTO_PLIEGUES')
) as v(name, tipo, origen, orden, busqueda, tabla)
where not exists (select 1 from dbo.SOL_FABRICACION_PARAMETROS p where p.sistema = 'HONEYCOMB' and p.name = v.name)
print '08: parámetros de tejido añadidos: ' + cast(@@rowcount as varchar(10)) + ' de 4'
commit transaction
go

/* ---------------- 2. Reglas HONEYCOMB de componentes ---------------- */
begin transaction
declare @reglas table
(
	orden int, atributo varchar(50), valor varchar(50), valor2 varchar(50), articulos varchar(max),
	nombre_parametro1 varchar(255), operacion char(1), nombre_parametro2 varchar(255), operacion2 char(1),
	nombre_parametro3 varchar(255), operacion3 char(1), nombre_parametro4 varchar(255), agregar int, consumo varchar(255)
)
insert into @reglas(orden, atributo, valor, valor2, articulos, nombre_parametro1, operacion, nombre_parametro2, operacion2, nombre_parametro3, operacion3, nombre_parametro4, agregar, consumo)
values
	(10, N'PERFIL CRISTAL', N'', null, N'16468', N'0 <= @ANCHO <= 600', N'Y', N'@COLOR_PERFIL == BLANCO RAL 9016', N'-', N'', N'-', N'', null, N'@ANCHO -- 10'),
	(20, N'PERFIL CRISTAL', N'', null, N'16468', N'0 <= @ANCHO <= 600', N'Y', N'@COLOR_PERFIL == BLANCO RAL 9016', N'-', N'', N'-', N'', null, N'@ANCHO -- 0'),
	(30, N'TAPA PERFIL CRISTAL', N'', null, N'16480', N'0 <= @ANCHO <= 600', N'Y', N'@COLOR_PERFIL == BLANCO RAL 9016', N'-', N'', N'-', N'', null, N'@ANCHO -- 0'),
	(40, N'TAPA PERFIL CRISTAL', N'', null, N'16480', N'0 <= @ANCHO <= 600', N'Y', N'@COLOR_PERFIL == BLANCO RAL 9016', N'-', N'', N'-', N'', null, N'@ANCHO -- 0'),
	(50, N'PERFIL MANUAL', N'', null, N'16472', N'0 <= @ANCHO <= 600', N'Y', N'@COLOR_PERFIL == BLANCO RAL 9016', N'-', N'', N'-', N'', null, N'@ANCHO -- 0'),
	(60, N'PERFIL MANUAL', N'', null, N'16472', N'0 <= @ANCHO <= 600', N'Y', N'@COLOR_PERFIL == BLANCO RAL 9016', N'-', N'', N'-', N'', null, N'@ANCHO -- 0'),
	(70, N'PERFIL FIJACION TEJIDO', N'', null, N'16476', N'0 <= @ANCHO <= 600', N'Y', N'@COLOR_PERFIL == BLANCO RAL 9016', N'-', N'', N'-', N'', null, N'@ANCHO -- 0'),
	(80, N'PERFIL FIJACION TEJIDO', N'', null, N'16476', N'0 <= @ANCHO <= 600', N'Y', N'@COLOR_PERFIL == BLANCO RAL 9016', N'-', N'', N'-', N'', null, N'@ANCHO -- 0'),
	(90, N'GUIA LATERAL', N'', null, N'16484', N'0 <= @ANCHO <= 600', N'Y', N'@COLOR_PERFIL == BLANCO RAL 9016', N'-', N'', N'-', N'', null, N'@ALTO -- 0'),
	(100, N'GUIA LATERAL', N'', null, N'16484', N'0 <= @ANCHO <= 600', N'Y', N'@COLOR_PERFIL == BLANCO RAL 9016', N'-', N'', N'-', N'', null, N'@ALTO -- 0'),
	(110, N'FELPUDO GUIA LATERAL', N'', null, N'16488', N'', N'-', N'', N'-', N'', N'-', N'', null, N'@ALTO -- 0'),
	(120, N'FELPUDO GUIA LATERAL', N'', null, N'16488', N'', N'-', N'', N'-', N'', N'-', N'', null, N'@ALTO -- 0'),
	(130, N'FELPUDO PERFIL MANUAL', N'', null, N'16493', N'', N'-', N'', N'-', N'', N'-', N'', null, N'@ANCHO -- 0'),
	(140, N'FELPUDO PERFIL MANUAL', N'', null, N'16493', N'', N'-', N'', N'-', N'', N'-', N'', null, N'@ANCHO -- 0'),
	(150, N'TAPA DERECHA PERFIL CRISTAL', N'', null, N'16495', N'@COLOR_PERFIL == BLANCO RAL 9016', N'-', N'', N'-', N'', N'-', N'', null, N'1'),
	(160, N'TAPA DERECHA PERFIL CRISTAL', N'', null, N'16499', N'@COLOR_PERFIL == BLANCO RAL 9016', N'-', N'', N'-', N'', N'-', N'', null, N'1'),
	(170, N'CIERRE DERECHA PERFIL CRISTAL', N'', null, N'16507', N'@COLOR_PERFIL == BLANCO RAL 9016', N'-', N'', N'-', N'', N'-', N'', null, N'1'),
	(180, N'CIERRE IZQUIERDA PERFIL CRISTAL', N'', null, N'16503', N'@COLOR_PERFIL == BLANCO RAL 9016', N'-', N'', N'-', N'', N'-', N'', null, N'1'),
	(190, N'TAPA TORNILLO', N'', null, N'16511', N'@COLOR_PERFIL == BLANCO RAL 9016', N'-', N'', N'-', N'', N'-', N'', null, N'4'),
	(200, N'TORNILLO', N'', null, N'16515', N'@COLOR_PERFIL == BLANCO RAL 9016', N'-', N'', N'-', N'', N'-', N'', null, N'8'),
	(210, N'TAPA DERECHA PERFIL MANUAL', N'', null, N'16516', N'@COLOR_PERFIL == BLANCO RAL 9016', N'-', N'', N'-', N'', N'-', N'', null, N'1'),
	(220, N'TAPA IZQUIERDA PERFIL MANUAL', N'', null, N'16520', N'@COLOR_PERFIL == BLANCO RAL 9016', N'-', N'', N'-', N'', N'-', N'', null, N'1'),
	(230, N'CASQUILLO', N'', null, N'16526', N'30 <= @ANCHO <= 36', N'-', N'', N'-', N'', N'-', N'', null, N'4'),
	(230, N'CASQUILLO', N'', null, N'16526', N'36.1 <= @ANCHO <= 62', N'-', N'', N'-', N'', N'-', N'', null, N'6'),
	(230, N'CASQUILLO', N'', null, N'16526', N'62.1 <= @ANCHO <= 88.1', N'-', N'', N'-', N'', N'-', N'', null, N'8'),
	(230, N'CASQUILLO', N'', null, N'16526', N'88.2 <= @ANCHO <= 130', N'-', N'', N'-', N'', N'-', N'', null, N'10'),
	(240, N'MUELLES', N'', null, N'16524', N'', N'-', N'', N'-', N'', N'-', N'', null, N'4'),
	(250, N'PORTA MUELLE', N'', null, N'16525', N'', N'-', N'', N'-', N'', N'-', N'', null, N'4'),
	(260, N'PRISIONEROS', N'', null, N'16593', N'', N'-', N'', N'-', N'', N'-', N'', null, N'8'),
	(270, N'TOALLITA PRIMER', N'', null, N'16529', N'', N'-', N'', N'-', N'', N'-', N'', null, N'1'),
	(280, N'TOALLITA 6X8', N'', null, N'16530', N'', N'-', N'', N'-', N'', N'-', N'', null, N'1'),
	(290, N'FLEJE', N'', null, N'2392', N'', N'-', N'', N'-', N'', N'-', N'', null, N'400'),
	(300, N'PRECINTO', N'', null, N'2778', N'', N'-', N'', N'-', N'', N'-', N'', null, N'400'),
	(310, N'ETIQUETA PRODUCCION', N'', null, N'2389', N'', N'-', N'', N'-', N'', N'-', N'', null, N'25'),
	(320, N'CORDON', N'', null, N'16489', N'', N'-', N'', N'-', N'', N'-', N'', null, N'400'),
	(330, N'CINTA 11 MM', N'', null, N'16494', N'', N'-', N'', N'-', N'', N'-', N'', null, N'@ANCHO -- 0'),
	(340, N'CINTA 11 MM', N'', null, N'16494', N'', N'-', N'', N'-', N'', N'-', N'', null, N'@ANCHO -- 0')

insert into dbo.SOL_ARTICULOS_FABRICACION_RELACION_V2(orden, sistema, atributo, valor, valor2, articulos, nombre_parametro1, operacion, nombre_parametro2, operacion2, nombre_parametro3, operacion3, nombre_parametro4, agregar, consumo)
select r.orden, 'HONEYCOMB', r.atributo, r.valor, r.valor2, r.articulos, r.nombre_parametro1, r.operacion, r.nombre_parametro2, r.operacion2, r.nombre_parametro3, r.operacion3, r.nombre_parametro4, r.agregar, r.consumo
from @reglas r
where not exists (select 1 from dbo.SOL_ARTICULOS_FABRICACION_RELACION_V2 x
	where x.sistema = 'HONEYCOMB' and x.orden = r.orden and x.atributo = r.atributo
	  and isnull(x.articulos, '') = isnull(r.articulos, '') and isnull(x.nombre_parametro1, '') = isnull(r.nombre_parametro1, ''))
print '08: reglas de componentes añadidas: ' + cast(@@rowcount as varchar(10)) + ' de 37'

/* Reglas que ya existían (mismo orden/elemento/artículos/condición 1) pero distintas: NO se tocan */
select 'AVISO: la regla ya existía y es distinta (no se modifica)' as aviso, x.idrow, x.orden, x.atributo, x.articulos,
	x.consumo as consumo_en_bd, r.consumo as consumo_en_script,
	x.nombre_parametro2 as cond2_en_bd, r.nombre_parametro2 as cond2_en_script
from @reglas r
join dbo.SOL_ARTICULOS_FABRICACION_RELACION_V2 x on x.sistema = 'HONEYCOMB' and x.orden = r.orden and x.atributo = r.atributo
	and isnull(x.articulos, '') = isnull(r.articulos, '') and isnull(x.nombre_parametro1, '') = isnull(r.nombre_parametro1, '')
where isnull(x.consumo, '') <> isnull(r.consumo, '') or isnull(x.nombre_parametro2, '') <> isnull(r.nombre_parametro2, '')
	or isnull(x.nombre_parametro3, '') <> isnull(r.nombre_parametro3, '') or isnull(x.operacion, '') <> isnull(r.operacion, '')
order by x.orden
commit transaction
go

/* ---------------- 2b. Regla del TEJIDO (artículo según el pedido, consumo en m2, medidas de corte) ---------------- */
/* Dinámico: así el script compila aunque falten param_ancho/param_alto (lo comprueba el bloque de requisitos) */
begin transaction
if exists (select 1 from dbo.SOL_ARTICULOS_FABRICACION_RELACION_V2 where sistema = 'HONEYCOMB' and atributo = 'TEJIDO' and articulos = N'@TEJIDO_ARTICULO')
	print '08: la regla del tejido ya existe (no se modifica)'
else if exists (select 1 from dbo.SOL_ARTICULOS_FABRICACION_RELACION_V2 where sistema = 'HONEYCOMB' and atributo like 'TEJIDO%')
	print '08: AVISO - ya hay otra regla de TEJIDO en HONEYCOMB; NO se añade la automática para no duplicar el consumo. Revisar a mano en la pantalla de reglas'
else
begin
	exec('insert into dbo.SOL_ARTICULOS_FABRICACION_RELACION_V2(orden, sistema, atributo, valor, valor2, articulos, nombre_parametro1, operacion, nombre_parametro2, operacion2, nombre_parametro3, operacion3, nombre_parametro4, agregar, consumo, param_ancho, param_alto)
	values(350, ''HONEYCOMB'', ''TEJIDO'', '''', null, ''@TEJIDO_ARTICULO'', '''', ''-'', '''', ''-'', '''', ''-'', '''', null, ''@TEJIDO_ANCHO ** @TEJIDO_ALTO *T 0.0001'', ''@TEJIDO_ANCHO'', ''@TEJIDO_ALTO'')')
	print '08: regla del tejido añadida'
end
commit transaction
go

/* ---------------- 3. Referencias (código Solupyme) de los colores de tejido ---------------- */
/* Solo donde está vacía y solo si el id y el nombre del color coinciden con DEV */
begin transaction
if col_length('dbo.SOL_ARTICULOS_HONEYCOMB_COLORESTEJIDO', 'Referencia') is null
	print '08: AVISO - la tabla de colores de tejido no tiene la columna Referencia; no se cargan las referencias'
else
begin
	declare @colores table(id int, color nvarchar(100), referencia varchar(50))
	insert into @colores(id, color, referencia) values
		(1, N'BLANCO', N'04755'),
		(3, N'GRIS CLARO', N'04757'),
		(4, N'GRIS OSCURO', N'04758'),
		(5, N'NEGRO', N'04759'),
		(8, N'BEIGE', N'04810')

	update c set Referencia = k.referencia
	from dbo.SOL_ARTICULOS_HONEYCOMB_COLORESTEJIDO c
	join @colores k on k.id = c.idColorTejido and k.color = c.ColorTejido
	where isnull(c.Referencia, '') = ''
	print '08: referencias de color cargadas: ' + cast(@@rowcount as varchar(10)) + ' de 5'

	select 'AVISO: el color no coincide con DEV o ya tenía otra Referencia (no se modifica)' as aviso, k.id, k.color as color_en_script, c.ColorTejido as color_en_bd, k.referencia as ref_en_script, c.Referencia as ref_en_bd
	from @colores k
	left join dbo.SOL_ARTICULOS_HONEYCOMB_COLORESTEJIDO c on c.idColorTejido = k.id
	where c.idColorTejido is null or c.ColorTejido <> k.color or isnull(c.Referencia, '') <> k.referencia
end
commit transaction
go

/* ---------------- Comprobaciones finales (solo lectura) ---------------- */
/* Los ids de artículo de las reglas tienen que ser los mismos que en DEV */
select 'AVISO: artículo de una regla que NO existe en ARTICULOS de esta BD' as aviso, v.id as articulo
from (values (2389), (2392), (2778), (16468), (16472), (16476), (16480), (16484), (16488), (16489), (16493), (16494), (16495), (16499), (16503), (16507), (16511), (16515), (16516), (16520), (16524), (16525), (16526), (16529), (16530), (16593)) as v(id)
where not exists (select 1 from dbo.ARTICULOS a where a.idrow = v.id)

/* Las Referencias de los colores tienen que existir como cod_solupyme */
select 'AVISO: Referencia de color que NO existe en ARTICULOS (cod_solupyme)' as aviso, c.idColorTejido, c.ColorTejido, c.Referencia
from dbo.SOL_ARTICULOS_HONEYCOMB_COLORESTEJIDO c
where isnull(c.Referencia, '') <> '' and not exists (select 1 from dbo.ARTICULOS a where a.cod_solupyme = c.Referencia)

select 'RESUMEN' as resumen,
	(select count(*) from dbo.SOL_FABRICACION_PARAMETROS where sistema = 'HONEYCOMB') as parametros,
	(select count(*) from dbo.SOL_ARTICULOS_FABRICACION_RELACION_V2 where sistema = 'HONEYCOMB') as reglas,
	(select count(*) from dbo.SOL_ARTICULOS_HONEYCOMB_COLORESTEJIDO where isnull(Referencia, '') <> '') as colores_con_referencia
go
set noexec off
go
