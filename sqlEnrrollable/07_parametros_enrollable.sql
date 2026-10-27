/* =====================================================================
   07 - Parámetros estándar de la fabricación del enrollable
   Todos los datos que trae una línea del configurador nuevo, como parámetros de los juegos de reglas de
   cada sistema (SOL_FABRICACION_PARAMETROS). El equipo escribe las reglas con ellos; los parámetros
   nunca se escriben a mano.
     1. SOL_FABRICACION_PRODUCTOS.sp_parametros_base: procedimiento que da de alta los parámetros de un
        juego nuevo (el backend lo llama al crear el juego en la pantalla). Producto 1:
        sp_enrollable_parametros_base.
     2. Búsquedas nuevas del tejido del maestro (nombre, color, criterio, grupo, tipo, impresión digital).
     3. sp_enrollable_parametros_base @sistema: crea los parámetros que falten; no toca los que ya existen
        (si el equipo cambió uno, se respeta) y no borra nada. Devuelve cuántos ha creado.
     4. Se aplica a todos los juegos de enrollable que ya existen.
   Parámetros (id = dato de la línea; sin sufijo = código legible, que sale de su catálogo SOL_ACC_*):
     Datos de la línea: @CANTIDAD @ANCHO @ALTO @CADENA_LONGITUD (cm, cadena a medida) @POSICION_ID / @POSICION
       (derecha o izquierda) @IMPRESION (0 / 1) @SALIDA_TEJIDO_ID / @SALIDA_TEJIDO / @SALIDA_TEJIDO_ARTICULO
     Pasos del configurador: @SISTEMA @ACCIONAMIENTO @TIPO_CADENA @ALTURA
       @ALTURA_VALOR @COLOR_CADENA @TIPO_MOTOR @MODELO_MOTOR @MANDO @CARGADOR @BATERIA @SOPORTE
       @COLOR_SOPORTE @TAPA @COLOR_TAPA @CONTRAPESO @COLOR_CONTRAPESO (cada uno con su _ID)
     Tejido del maestro: @TEJIDO_ID @TEJIDO_REFERENCIA (código Solupyme) @TEJIDO_ARTICULO @TEJIDO_NOMBRE
       @TEJIDO_COLOR @TEJIDO_CRITERIO @TEJIDO_GRUPO @TEJIDO_TIPO_ID / @TEJIDO_TIPO @TEJIDO_IMPRESION
   Un paso que la línea no usa (p. ej. @MANDO en una cadena) queda vacío.
   Sin tipo de aro ni tipo de cadena a medida desde el 2026-10-27 (ver 08): 53 parámetros.
   Requisito: sqlEnrrollable/04 y 05 y sqlTejidos/01. Idempotente.
   ===================================================================== */
set ansi_nulls on
go
set quoted_identifier on
go

if object_id('dbo.SOL_TEJIDOS_MAESTRO') is null or object_id('dbo.SOL_TEJIDOS_TIPOS') is null
	raiserror('Faltan las tablas del maestro de tejidos: aplique antes sqlTejidos/01', 16, 1)
go

/* ---- 1. Procedimiento que da de alta los parámetros base de cada producto ---- */
if col_length('dbo.SOL_FABRICACION_PRODUCTOS', 'sp_parametros_base') is null
	alter table dbo.SOL_FABRICACION_PRODUCTOS add sp_parametros_base sysname null
go

/* ---- 2. Búsquedas nuevas del tejido del maestro ---- */
declare @b table(busqueda varchar(50), descripcion varchar(150), tabla sysname, clave sysname, resultado sysname, texto sysname null)
insert @b values
	('ENR_TEJIDO_NOMBRE',     'Enrollable: tejido del maestro -> nombre',             'SOL_TEJIDOS_MAESTRO', 'idrow', 'nombre',            null),
	('ENR_TEJIDO_COLOR',      'Enrollable: tejido del maestro -> color',              'SOL_TEJIDOS_MAESTRO', 'idrow', 'color',             null),
	('ENR_TEJIDO_CRITERIO',   'Enrollable: tejido del maestro -> criterio (ancho del rollo, cm)', 'SOL_TEJIDOS_MAESTRO', 'idrow', 'criterio', null),
	('ENR_TEJIDO_GRUPO',      'Enrollable: tejido del maestro -> grupo',              'SOL_TEJIDOS_MAESTRO', 'idrow', 'grupo',             null),
	('ENR_TEJIDO_IMPRESION',  'Enrollable: tejido del maestro -> impresión digital (1 / 0)', 'SOL_TEJIDOS_MAESTRO', 'idrow', 'impresion_digital', null),
	('ENR_TEJIDO_TIPO_ID',    'Enrollable: tejido del maestro -> tipo de tejido (id)', 'SOL_TEJIDOS_MAESTRO', 'idrow', 'tipo_tejido',      null),
	('ENR_TEJIDO_TIPO',       'Enrollable: tipo de tejido (id) -> nombre',            'SOL_TEJIDOS_TIPOS',   'idrow', 'descripcion',       'descripcion')

update b set descripcion = n.descripcion, tabla = n.tabla, clave = n.clave, resultado = n.resultado, texto = n.texto,
             sistema = null, producto = 1, clave2 = null, filtro_columna = null, filtro_valor = null
from SOL_FABRICACION_BUSQUEDAS b join @b n on n.busqueda = b.busqueda

insert SOL_FABRICACION_BUSQUEDAS (busqueda, sistema, producto, descripcion, tabla, clave, resultado, texto)
select n.busqueda, null, 1, n.descripcion, n.tabla, n.clave, n.resultado, n.texto
from @b n where not exists (select 1 from SOL_FABRICACION_BUSQUEDAS b where b.busqueda = n.busqueda)

/* Comprobación: todas las columnas existen */
select n.busqueda, 'columna inexistente' as problema from @b n
where not exists (select 1 from sys.columns c where c.object_id = object_id('dbo.' + n.tabla) and c.name = n.clave)
   or not exists (select 1 from sys.columns c where c.object_id = object_id('dbo.' + n.tabla) and c.name = n.resultado)
   or (n.texto is not null and not exists (select 1 from sys.columns c where c.object_id = object_id('dbo.' + n.tabla) and c.name = n.texto))
go

/* ---- 3. Parámetros base ---- */
if object_id('dbo.sp_enrollable_parametros_base') is not null
	drop procedure dbo.sp_enrollable_parametros_base
go

/* Crea en el juego @sistema los parámetros estándar del enrollable que aún no existan (no toca los que ya
   existen, no borra nada). Devuelve (creados). Error si el juego no es de un sistema del enrollable. */
create procedure [dbo].[sp_enrollable_parametros_base]
(
	@sistema varchar(50)
)
as
begin
	set nocount on

	declare @p table(name varchar(50), tipo varchar(10), origen varchar(255), orden int, busqueda varchar(50))
	declare @name varchar(50), @tipo varchar(10), @origen varchar(255), @orden int, @busqueda varchar(50)
	declare @r int, @creados int = 0

	if not exists (select 1 from SOL_FABRICACION_SISTEMAS where sistema = @sistema and producto = 1 and activo = 1)
	begin
		raiserror('El juego no es de un sistema del enrollable', 16, 1)
		return -1
	end

	insert @p values
		/* Datos de la línea */
		('@CANTIDAD',            'COLUMNA',  'cantidad',               10,  null),
		('@ANCHO',               'COLUMNA',  'ancho',                  20,  null),
		('@ALTO',                'COLUMNA',  'alto',                   30,  null),
		('@CADENA_LONGITUD',     'COLUMNA',  'nacc_cadena_longitud',   40,  null),
		('@POSICION_ID',         'COLUMNA',  'acc_posicion_id',        50,  null),
		('@POSICION',            'COLUMNA',  'acc_posicion_text',      60,  null),
		('@IMPRESION',           'COLUMNA',  'impresion',              70,  null),
		('@SALIDA_TEJIDO_ID',    'COLUMNA',  'tej_salida_id',          80,  null),
		('@SALIDA_TEJIDO',       'COLUMNA',  'tej_salida_text',        90,  null),
		/* Ids de cada paso del configurador */
		('@TEJIDO_ID',           'COLUMNA',  'nacc_tejido_id',         100, null),
		('@SISTEMA_ID',          'COLUMNA',  'nacc_sistema_id',        110, null),
		('@ACCIONAMIENTO_ID',    'COLUMNA',  'nacc_accionamiento_id',  120, null),
		('@TIPO_CADENA_ID',      'COLUMNA',  'nacc_tipo_cadena_id',    130, null),
		('@ALTURA_ID',           'COLUMNA',  'nacc_altura_id',         160, null),
		('@COLOR_CADENA_ID',     'COLUMNA',  'nacc_color_cadena_id',   170, null),
		('@TIPO_MOTOR_ID',       'COLUMNA',  'nacc_tipo_motor_id',     180, null),
		('@MODELO_MOTOR_ID',     'COLUMNA',  'nacc_modelo_motor_id',   190, null),
		('@MANDO_ID',            'COLUMNA',  'nacc_mando_id',          200, null),
		('@CARGADOR_ID',         'COLUMNA',  'nacc_cargador_id',       210, null),
		('@BATERIA_ID',          'COLUMNA',  'nacc_bateria_id',        220, null),
		('@SOPORTE_ID',          'COLUMNA',  'nacc_soporte_id',        230, null),
		('@COLOR_SOPORTE_ID',    'COLUMNA',  'nacc_soporte_color_id',  240, null),
		('@TAPA_ID',             'COLUMNA',  'nacc_tapa_id',           250, null),
		('@COLOR_TAPA_ID',       'COLUMNA',  'nacc_tapa_color_id',     260, null),
		('@CONTRAPESO_ID',       'COLUMNA',  'nacc_contrapeso_id',     270, null),
		('@COLOR_CONTRAPESO_ID', 'COLUMNA',  'nacc_contrapeso_color_id', 280, null),
		/* Códigos legibles de cada paso (búsquedas en su catálogo SOL_ACC_*) */
		('@SALIDA_TEJIDO_ARTICULO', 'BUSQUEDA', '@SALIDA_TEJIDO_ID',   300, 'ENR_SALIDA_TEJIDO'),
		('@SISTEMA',             'BUSQUEDA', '@SISTEMA_ID',            310, 'ENR_SISTEMA'),
		('@ACCIONAMIENTO',       'BUSQUEDA', '@ACCIONAMIENTO_ID',      320, 'ENR_ACCIONAMIENTO'),
		('@TIPO_CADENA',         'BUSQUEDA', '@TIPO_CADENA_ID',        330, 'ENR_TIPO_CADENA'),
		('@ALTURA',              'BUSQUEDA', '@ALTURA_ID',             360, 'ENR_ALTURA'),
		('@ALTURA_VALOR',        'BUSQUEDA', '@ALTURA_ID',             370, 'ENR_ALTURA_VALOR'),
		('@COLOR_CADENA',        'BUSQUEDA', '@COLOR_CADENA_ID',       380, 'ENR_COLOR_CADENA'),
		('@TIPO_MOTOR',          'BUSQUEDA', '@TIPO_MOTOR_ID',         390, 'ENR_TIPO_MOTOR'),
		('@MODELO_MOTOR',        'BUSQUEDA', '@MODELO_MOTOR_ID',       400, 'ENR_MODELO_MOTOR'),
		('@MANDO',               'BUSQUEDA', '@MANDO_ID',              410, 'ENR_MANDO'),
		('@CARGADOR',            'BUSQUEDA', '@CARGADOR_ID',           420, 'ENR_CARGADOR'),
		('@BATERIA',             'BUSQUEDA', '@BATERIA_ID',            430, 'ENR_BATERIA'),
		('@SOPORTE',             'BUSQUEDA', '@SOPORTE_ID',            440, 'ENR_SOPORTE'),
		('@COLOR_SOPORTE',       'BUSQUEDA', '@COLOR_SOPORTE_ID',      450, 'ENR_COLOR_SOPORTE'),
		('@TAPA',                'BUSQUEDA', '@TAPA_ID',               460, 'ENR_TAPA'),
		('@COLOR_TAPA',          'BUSQUEDA', '@COLOR_TAPA_ID',         470, 'ENR_COLOR_TAPA'),
		('@CONTRAPESO',          'BUSQUEDA', '@CONTRAPESO_ID',         480, 'ENR_CONTRAPESO'),
		('@COLOR_CONTRAPESO',    'BUSQUEDA', '@COLOR_CONTRAPESO_ID',   490, 'ENR_COLOR_CONTRAPESO'),
		/* Tejido del maestro de tejidos */
		('@TEJIDO_REFERENCIA',   'BUSQUEDA', '@TEJIDO_ID',             500, 'ENR_TEJIDO_SOLUPYME'),
		('@TEJIDO_ARTICULO',     'BUSQUEDA', '@TEJIDO_REFERENCIA',     510, 'ARTICULO_POR_CODIGO'),
		('@TEJIDO_NOMBRE',       'BUSQUEDA', '@TEJIDO_ID',             520, 'ENR_TEJIDO_NOMBRE'),
		('@TEJIDO_COLOR',        'BUSQUEDA', '@TEJIDO_ID',             530, 'ENR_TEJIDO_COLOR'),
		('@TEJIDO_CRITERIO',     'BUSQUEDA', '@TEJIDO_ID',             540, 'ENR_TEJIDO_CRITERIO'),
		('@TEJIDO_GRUPO',        'BUSQUEDA', '@TEJIDO_ID',             550, 'ENR_TEJIDO_GRUPO'),
		('@TEJIDO_TIPO_ID',      'BUSQUEDA', '@TEJIDO_ID',             560, 'ENR_TEJIDO_TIPO_ID'),
		('@TEJIDO_TIPO',         'BUSQUEDA', '@TEJIDO_TIPO_ID',        570, 'ENR_TEJIDO_TIPO'),
		('@TEJIDO_IMPRESION',    'BUSQUEDA', '@TEJIDO_ID',             580, 'ENR_TEJIDO_IMPRESION')

	declare itP cursor local forward_only for select name, tipo, origen, orden, busqueda from @p order by orden
	open itP
	fetch next from itP into @name, @tipo, @origen, @orden, @busqueda
	while @@fetch_status = 0
	begin
		if not exists (select 1 from SOL_FABRICACION_PARAMETROS where sistema = @sistema and name = @name)
		begin
			execute @r = sp_fabricacion_parametro_edit @sistema, @name, @tipo, @origen, @orden, @busqueda, null
			if @r <> 1
			begin
				close itP
				deallocate itP
				raiserror('No se ha podido crear el parámetro %s (código %d)', 16, 1, @name, @r)
				return -2
			end
			set @creados += 1
		end
		fetch next from itP into @name, @tipo, @origen, @orden, @busqueda
	end
	close itP
	deallocate itP

	select @creados as creados
	return 1
end
go

update SOL_FABRICACION_PRODUCTOS set sp_parametros_base = 'sp_enrollable_parametros_base' where producto = 1
go

/* ---- 4. Se aplica a los juegos de enrollable que ya existen ---- */
declare @juego varchar(50), @n int
declare @t table(creados int)
declare itJ cursor local forward_only for
	select sistema from SOL_FABRICACION_SISTEMAS where producto = 1 and activo = 1 order by sistema
open itJ
fetch next from itJ into @juego
while @@fetch_status = 0
begin
	delete @t
	insert @t execute sp_enrollable_parametros_base @juego
	select @n = creados from @t
	print @juego + ': ' + cast(@n as varchar) + ' parámetros creados'
	fetch next from itJ into @juego
end
close itJ
deallocate itJ
go
