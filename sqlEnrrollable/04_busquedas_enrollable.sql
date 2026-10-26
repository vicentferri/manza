/* =====================================================================
   04 - Búsquedas del enrollable para el motor de reglas (v3)
   El enrollable se fabrica solo con reglas (como HoneyComb). Para que las reglas
   se escriban con valores legibles, este script añade:
     1. SOL_FABRICACION_BUSQUEDAS: columnas nuevas (todas opcionales; las búsquedas que
        ya existen quedan igual):
          producto        la búsqueda la ven todos los juegos de ese producto
                          (SOL_FABRICACION_SISTEMAS.producto), no solo uno
          clave2          segunda columna clave: el parámetro tiene dos entradas
                          (origen '@A;@B')
          filtro_columna  filtro fijo de la tabla (p. ej. tipo = 3)
          filtro_valor
          texto           columna con el nombre legible: los valores de la búsqueda
                          salen en el desplegable de las condiciones (valor · nombre)
     2. Motor (cambios aditivos; con las búsquedas de HoneyComb se ejecuta la misma consulta):
          sp_fabricacion_reglas_parametros  búsquedas por producto, de dos claves y con filtro
          sp_fabricacion_parametro_edit     valida las dos entradas y la visibilidad por producto
          sp_fabricacion_parametros_valores también da los valores de las búsquedas con texto
     3. Búsquedas del enrollable (producto 1), definidas por script:
          ENR_<CATALOGO>       id del catálogo del modelo nuevo de accionamientos (SOL_ACC_*) -> código
          ENR_ALTURA_VALOR     id de la altura -> valor
          ENR_TEJIDO_ARTICULO  tipo de tejido + color -> artículo (SOL_ARTICULOS_FABRICACION_RELACION
                               tipo 3, la misma relación que usaba la fabricación anterior)
          ENR_SALIDA_TEJIDO    salida del tejido -> artículo (SOL_ARTICULOS_SALIDATEJIDO)
        ENR_TEJIDO_ARTICULO es provisional: cuando se rehaga el modelo de tejidos bastará con
        apuntarla a las tablas nuevas (datos), sin tocar el motor ni las reglas. La salida del
        tejido (ENR_SALIDA_TEJIDO) se queda como está.
   Idempotente. Los objetos del motor vienen de sqlHoney/04 y 05 (se comprobó que el texto
   desplegado es el de esos ficheros antes de cambiarlos).
   ===================================================================== */
set ansi_nulls on
go
set quoted_identifier on
go

/* ---- 1. Columnas nuevas ---- */
if col_length('dbo.SOL_FABRICACION_BUSQUEDAS', 'producto') is null
	alter table dbo.SOL_FABRICACION_BUSQUEDAS add producto int null
		constraint FK_SOL_FABRICACION_BUSQUEDAS_PRODUCTO references dbo.SOL_FABRICACION_PRODUCTOS(producto)
if col_length('dbo.SOL_FABRICACION_BUSQUEDAS', 'clave2') is null
	alter table dbo.SOL_FABRICACION_BUSQUEDAS add clave2 sysname null
if col_length('dbo.SOL_FABRICACION_BUSQUEDAS', 'filtro_columna') is null
	alter table dbo.SOL_FABRICACION_BUSQUEDAS add filtro_columna sysname null
if col_length('dbo.SOL_FABRICACION_BUSQUEDAS', 'filtro_valor') is null
	alter table dbo.SOL_FABRICACION_BUSQUEDAS add filtro_valor varchar(100) null
if col_length('dbo.SOL_FABRICACION_BUSQUEDAS', 'texto') is null
	alter table dbo.SOL_FABRICACION_BUSQUEDAS add texto sysname null
go

/* ---------------------------------------------------------------------
   fn_fabricacion_busqueda_visible: 1 si la búsqueda se puede usar en el juego @sistema.
   General (sin sistema ni producto), del propio juego o del producto del juego.
   --------------------------------------------------------------------- */
if object_id('dbo.fn_fabricacion_busqueda_visible') is not null
	drop function dbo.fn_fabricacion_busqueda_visible
go

create function [dbo].[fn_fabricacion_busqueda_visible]
(
	@busqueda varchar(50),
	@sistema varchar(50)
)
returns int
as
begin
	return case when exists (
		select 1 from SOL_FABRICACION_BUSQUEDAS b
		where b.busqueda = @busqueda
		  and ((b.sistema is null and b.producto is null)
		       or b.sistema = @sistema
		       or b.producto = (select s.producto from SOL_FABRICACION_SISTEMAS s where s.sistema = @sistema))
	) then 1 else 0 end
end
go

/* ---------------------------------------------------------------------
   sp_fabricacion_reglas_parametros: devuelve (name, type, value) con los
   parámetros del sistema para la fila @id de su tabla_origen.
   COLUMNA lee la columna de esa fila; FORMULA se calcula en orden con los
   parámetros anteriores. La tabla_origen debe tener columna id.
   BUSQUEDA: valor del parámetro origen buscado en SOL_FABRICACION_BUSQUEDAS
   (tabla/clave/resultado fijos por script; se comprueban contra sys.columns).
   TABLA: valor de la menor clave >= valor del parámetro origen en
   SOL_FABRICACION_TABLAS_VALORES (sin fila = NULL).
   2026-10-22 (sqlEnrrollable/04): BUSQUEDA admite búsquedas del producto del juego,
   una segunda clave (origen '@A;@B', las dos entradas tienen que tener valor) y un
   filtro fijo (filtro_columna = filtro_valor). Sin clave2 ni filtro la consulta es la
   misma de antes.
   --------------------------------------------------------------------- */
if object_id('dbo.sp_fabricacion_reglas_parametros') is not null
	drop procedure dbo.sp_fabricacion_reglas_parametros
go

create procedure [dbo].[sp_fabricacion_reglas_parametros]
(
	@sistema varchar(50),
	@id int
)
as
begin
	set nocount on

	declare @parametros as dbo.Parameters3Type
	declare @tabla sysname
	declare @sql nvarchar(max)
	declare @xml xml
	declare @pname varchar(50)
	declare @ptipo varchar(10)
	declare @porigen varchar(255)
	declare @pvalor varchar(255)
	declare @calculado decimal(18,4)
	declare @pbusqueda varchar(50)
	declare @ptabla varchar(50)
	declare @entrada varchar(255)
	declare @entrada2 varchar(255)
	declare @origen1 varchar(255), @origen2 varchar(255)
	declare @btabla sysname, @bclave sysname, @bresultado sysname
	declare @bclave2 sysname, @bfiltro sysname, @bfiltroValor varchar(100)

	select @tabla = tabla_origen from SOL_FABRICACION_SISTEMAS where sistema = @sistema

	if object_id('dbo.' + @tabla) is not null
	begin
		set @sql = N'set @x = (select * from dbo.' + quotename(@tabla) + N' where id = @id for xml raw(''r''), type)'
		execute sp_executesql @sql, N'@id int, @x xml output', @id, @xml output
	end

	declare itParametros cursor local forward_only for
	select p.name, p.tipo,
	       case when p.tipo = 'COLUMNA' then c.name else p.origen end,
	       p.busqueda, p.tabla
	from SOL_FABRICACION_PARAMETROS p
	left join sys.columns c on c.object_id = object_id('dbo.' + @tabla) and c.name = p.origen
	where p.sistema = @sistema
	order by p.orden, p.idrow
	open itParametros
	fetch next from itParametros into @pname, @ptipo, @porigen, @pbusqueda, @ptabla
	while @@fetch_status = 0
	begin
		set @pvalor = null

		/* BUSQUEDA y TABLA parten del valor de otro parámetro ya calculado (BUSQUEDA de dos
		   claves: de dos, '@A;@B') */
		set @entrada = null
		set @entrada2 = null
		set @origen1 = ltrim(rtrim(@porigen))
		set @origen2 = null
		if @ptipo = 'BUSQUEDA' and charindex(';', @origen1) > 0
		begin
			set @origen2 = ltrim(rtrim(substring(@origen1, charindex(';', @origen1) + 1, 255)))
			set @origen1 = ltrim(rtrim(left(@origen1, charindex(';', @origen1) - 1)))
		end
		if @ptipo in ('BUSQUEDA','TABLA')
			select @entrada = ltrim(rtrim(value)) from @parametros where upper(name) = upper(@origen1)
		if @origen2 is not null
			select @entrada2 = ltrim(rtrim(value)) from @parametros where upper(name) = upper(@origen2)

		if @ptipo = 'BUSQUEDA' and isnull(@entrada,'') <> ''
		begin
			set @btabla = null
			select @btabla = b.tabla, @bclave = b.clave, @bresultado = b.resultado,
			       @bclave2 = b.clave2, @bfiltro = b.filtro_columna, @bfiltroValor = b.filtro_valor
			from SOL_FABRICACION_BUSQUEDAS b
			where b.busqueda = @pbusqueda and dbo.fn_fabricacion_busqueda_visible(b.busqueda, @sistema) = 1
			  and exists (select 1 from sys.columns c where c.object_id = object_id('dbo.' + b.tabla) and c.name = b.clave)
			  and exists (select 1 from sys.columns c where c.object_id = object_id('dbo.' + b.tabla) and c.name = b.resultado)
			  and (b.clave2 is null or exists (select 1 from sys.columns c where c.object_id = object_id('dbo.' + b.tabla) and c.name = b.clave2))
			  and (b.filtro_columna is null or exists (select 1 from sys.columns c where c.object_id = object_id('dbo.' + b.tabla) and c.name = b.filtro_columna))

			/* Búsqueda de dos claves: hacen falta las dos entradas */
			if @btabla is not null and @bclave2 is not null and isnull(@entrada2,'') = ''
				set @btabla = null

			if @btabla is not null
			begin
				set @sql = N'select top 1 @r = upper(ltrim(rtrim(cast(' + quotename(@bresultado) + N' as varchar(255))))) '
				         + N'from dbo.' + quotename(@btabla)
				         + N' where ltrim(rtrim(cast(' + quotename(@bclave) + N' as varchar(255)))) = @e'
				if @bclave2 is not null
					set @sql = @sql + N' and ltrim(rtrim(cast(' + quotename(@bclave2) + N' as varchar(255)))) = @e2'
				if @bfiltro is not null
					set @sql = @sql + N' and ltrim(rtrim(cast(' + quotename(@bfiltro) + N' as varchar(255)))) = @f'
				execute sp_executesql @sql, N'@e varchar(255), @e2 varchar(255), @f varchar(100), @r varchar(255) output',
				        @entrada, @entrada2, @bfiltroValor, @pvalor output
				set @pvalor = nullif(@pvalor, '')
			end
		end

		if @ptipo = 'TABLA' and try_cast(replace(@entrada, ',', '.') as decimal(12,2)) is not null
		begin
			select top 1 @pvalor = cast(cast(v.valor as decimal(12,2)) as varchar(255))
			from SOL_FABRICACION_TABLAS t
			join SOL_FABRICACION_TABLAS_VALORES v on v.idtabla = t.idrow
			where t.sistema = @sistema and t.tabla = @ptabla
			  and v.clave >= try_cast(replace(@entrada, ',', '.') as decimal(12,2))
			order by v.clave
		end

		if @ptipo = 'COLUMNA' and @porigen is not null
			set @pvalor = upper(ltrim(rtrim(@xml.value('(/r/@*[local-name()=sql:variable("@porigen")])[1]', 'varchar(255)'))))

		if @ptipo = 'FORMULA'
		begin
			set @calculado = null
			execute sp_fabricacion_evaluar @porigen, @parametros, @calculado out
			set @pvalor = cast(@calculado as varchar(255))
		end

		insert into @parametros(name, type, value) values(@pname, @ptipo, @pvalor)

		fetch next from itParametros into @pname, @ptipo, @porigen, @pbusqueda, @ptabla
	end
	close itParametros
	deallocate itParametros

	select name, type, value from @parametros
end
go

/* ---------------------------------------------------------------------
   sp_fabricacion_parametro_edit
   --------------------------------------------------------------------- */
if object_id('dbo.sp_fabricacion_parametro_edit') is not null
	drop procedure dbo.sp_fabricacion_parametro_edit
go

/* Alta o modificación. Devuelve 1 OK, -1 nombre inválido, -2 tipo inválido,
   -3 columna inexistente en la tabla del sistema, -4 fórmula vacía,
   -5 sistema no válido, -6 origen no es un parámetro anterior del sistema,
   -7 búsqueda no válida, -8 tabla de valores no válida,
   -9 la búsqueda necesita dos parámetros de entrada (o solo admite uno).
   BUSQUEDA y TABLA (estructura en 01): origen = parámetro de entrada.
   2026-10-22 (sqlEnrrollable/04): búsquedas del producto del juego y de dos claves
   (origen '@A;@B', los dos parámetros anteriores). */
create procedure [dbo].[sp_fabricacion_parametro_edit]
(
	@sistema varchar(50),
	@name varchar(50),
	@tipo varchar(10),
	@origen varchar(255),
	@orden int,
	@busqueda varchar(50) = null,
	@tablaValores varchar(50) = null
)
as
begin
	set nocount on

	declare @tabla sysname
	declare @origen1 varchar(255), @origen2 varchar(255)
	declare @dosClaves bit = 0

	select @tabla = tabla_origen from SOL_FABRICACION_SISTEMAS where sistema = @sistema and activo = 1
	if @tabla is null
		return -5

	set @name = upper(ltrim(rtrim(isnull(@name,''))))
	set @tipo = upper(ltrim(rtrim(isnull(@tipo,''))))
	set @origen = ltrim(rtrim(isnull(@origen,'')))

	if left(@name,1) <> '@' set @name = '@' + @name

	/* Collation binaria: con la de la BD, [A-Z] incluye Ñ y vocales con tilde, que la pantalla no admite */
	if len(@name) < 2 or substring(@name, 2, 50) collate Latin1_General_BIN like '%[^A-Z0-9_]%'
		return -1

	if @tipo not in ('COLUMNA','FORMULA','BUSQUEDA','TABLA')
		return -2

	if @tipo = 'COLUMNA'
	begin
		select @origen = c.name from sys.columns c
		where c.object_id = object_id('dbo.' + @tabla) and c.name = @origen

		if @@rowcount = 0
			return -3
	end

	if @tipo = 'FORMULA' and len(@origen) = 0
		return -4

	if @tipo in ('BUSQUEDA','TABLA')
	begin
		/* Los parámetros de entrada tienen que calcularse antes (orden menor).
		   Búsqueda de dos claves: '@A;@B' */
		set @origen1 = upper(ltrim(rtrim(case when @tipo = 'BUSQUEDA' and charindex(';', @origen) > 0
		                                      then left(@origen, charindex(';', @origen) - 1) else @origen end)))
		set @origen2 = case when @tipo = 'BUSQUEDA' and charindex(';', @origen) > 0
		                    then upper(ltrim(rtrim(substring(@origen, charindex(';', @origen) + 1, 255)))) end
		if left(@origen1,1) <> '@' set @origen1 = '@' + @origen1
		if @origen2 is not null and left(@origen2,1) <> '@' set @origen2 = '@' + @origen2
		if not exists (select 1 from SOL_FABRICACION_PARAMETROS
		               where sistema = @sistema and name = @origen1 and name <> @name and orden < isnull(@orden, 0))
			return -6
		if @origen2 is not null and not exists (select 1 from SOL_FABRICACION_PARAMETROS
		               where sistema = @sistema and name = @origen2 and name <> @name and orden < isnull(@orden, 0))
			return -6
		set @origen = @origen1 + isnull(';' + @origen2, '')
	end

	if @tipo = 'BUSQUEDA'
	begin
		if dbo.fn_fabricacion_busqueda_visible(@busqueda, @sistema) = 0
			return -7
		if exists (select 1 from SOL_FABRICACION_BUSQUEDAS where busqueda = @busqueda and clave2 is not null)
			set @dosClaves = 1
		if (@dosClaves = 1 and @origen2 is null) or (@dosClaves = 0 and @origen2 is not null)
			return -9
	end
	else
		set @busqueda = null

	if @tipo = 'TABLA'
	begin
		if not exists (select 1 from SOL_FABRICACION_TABLAS where sistema = @sistema and tabla = @tablaValores)
			return -8
	end
	else
		set @tablaValores = null

	if exists (select 1 from SOL_FABRICACION_PARAMETROS where sistema = @sistema and name = @name)
		update SOL_FABRICACION_PARAMETROS set
			tipo = @tipo, origen = @origen, orden = isnull(@orden, orden),
			busqueda = @busqueda, tabla = @tablaValores
		where sistema = @sistema and name = @name
	else
		insert into SOL_FABRICACION_PARAMETROS(sistema, name, tipo, origen, orden, busqueda, tabla)
		values(@sistema, @name, @tipo, @origen, isnull(@orden, 0), @busqueda, @tablaValores)

	return 1
end
go

/* ---------------------------------------------------------------------
   sp_fabricacion_parametros_valores
   --------------------------------------------------------------------- */
if object_id('dbo.sp_fabricacion_parametros_valores') is not null
	drop procedure dbo.sp_fabricacion_parametros_valores
go

/* Valores posibles de los parámetros del sistema que tienen catálogo (valores_*).
   Devuelve (name, valor, texto). Las tablas y columnas se comprueban contra
   sys.columns antes de usarlas; las que no existen se ignoran.
   2026-10-22 (sqlEnrrollable/04): también los parámetros BUSQUEDA cuya búsqueda tiene
   columna texto (valor = resultado de la búsqueda, texto = nombre), salvo que el parámetro
   tenga su propio catálogo valores_*. */
create procedure [dbo].[sp_fabricacion_parametros_valores]
(
	@sistema varchar(50)
)
as
begin
	set nocount on

	declare @resultado table(name varchar(50), valor varchar(255), texto varchar(255))
	declare @name varchar(50), @tabla sysname, @valor sysname, @texto sysname
	declare @filtro sysname, @filtroValor varchar(100)
	declare @sql nvarchar(max)

	declare itValores cursor local forward_only for
	select p.name, p.valores_tabla, p.valores_valor, p.valores_texto, null, null
	from SOL_FABRICACION_PARAMETROS p
	where p.sistema = @sistema
	  and p.valores_tabla is not null
	  and exists (select 1 from sys.columns c where c.object_id = object_id('dbo.' + p.valores_tabla) and c.name = p.valores_valor)
	  and exists (select 1 from sys.columns c where c.object_id = object_id('dbo.' + p.valores_tabla) and c.name = p.valores_texto)
	union all
	select p.name, b.tabla, b.resultado, b.texto, b.filtro_columna, b.filtro_valor
	from SOL_FABRICACION_PARAMETROS p
	join SOL_FABRICACION_BUSQUEDAS b on b.busqueda = p.busqueda
	where p.sistema = @sistema
	  and p.tipo = 'BUSQUEDA'
	  and p.valores_tabla is null
	  and b.texto is not null
	  and dbo.fn_fabricacion_busqueda_visible(b.busqueda, @sistema) = 1
	  and exists (select 1 from sys.columns c where c.object_id = object_id('dbo.' + b.tabla) and c.name = b.resultado)
	  and exists (select 1 from sys.columns c where c.object_id = object_id('dbo.' + b.tabla) and c.name = b.texto)
	  and (b.filtro_columna is null or exists (select 1 from sys.columns c where c.object_id = object_id('dbo.' + b.tabla) and c.name = b.filtro_columna))
	open itValores
	fetch next from itValores into @name, @tabla, @valor, @texto, @filtro, @filtroValor
	while @@fetch_status = 0
	begin
		set @sql = N'select distinct @name, upper(ltrim(rtrim(cast(' + quotename(@valor) + N' as varchar(255))))), '
		         + N'upper(ltrim(rtrim(cast(' + quotename(@texto) + N' as varchar(255))))) '
		         + N'from dbo.' + quotename(@tabla) + N' where ' + quotename(@valor) + N' is not null'
		if @filtro is not null
			set @sql = @sql + N' and ltrim(rtrim(cast(' + quotename(@filtro) + N' as varchar(255)))) = @f'

		insert into @resultado(name, valor, texto)
		execute sp_executesql @sql, N'@name varchar(50), @f varchar(100)', @name, @filtroValor

		fetch next from itValores into @name, @tabla, @valor, @texto, @filtro, @filtroValor
	end
	close itValores
	deallocate itValores

	select name, valor, texto from @resultado order by name, texto, valor
end
go

/* ---- 3. Búsquedas del enrollable (producto 1) ---- */
declare @b table(busqueda varchar(50), descripcion varchar(150), tabla sysname, clave sysname, resultado sysname,
                 clave2 sysname null, filtro_columna sysname null, filtro_valor varchar(100) null, texto sysname null)
insert @b values
	('ENR_SISTEMA',          'Enrollable: sistema -> código',                 'SOL_ACC_SISTEMA',            'id', 'codigo', null, null, null, 'nombre'),
	('ENR_ACCIONAMIENTO',    'Enrollable: accionamiento -> código',           'SOL_ACC_ACCIONAMIENTO',      'id', 'codigo', null, null, null, 'nombre'),
	('ENR_TIPO_CADENA',      'Enrollable: tipo de cadena -> código',          'SOL_ACC_TIPO_CADENA',        'id', 'codigo', null, null, null, 'nombre'),
	('ENR_TIPO_ARO',         'Enrollable: tipo de aro de cadena -> código',   'SOL_ACC_TIPO_ARO_CADENA',    'id', 'codigo', null, null, null, 'nombre'),
	('ENR_CADENA_MEDIDA',    'Enrollable: medida de cadena -> código',        'SOL_ACC_TIPO_CADENA_MEDIDA', 'id', 'codigo', null, null, null, 'nombre'),
	('ENR_ALTURA',           'Enrollable: altura de mando -> código',         'SOL_ACC_ALTURA',             'id', 'codigo', null, null, null, 'nombre'),
	('ENR_ALTURA_VALOR',     'Enrollable: altura de mando -> valor',          'SOL_ACC_ALTURA',             'id', 'valor',  null, null, null, null),
	('ENR_COLOR_CADENA',     'Enrollable: color de cadena -> código',         'SOL_ACC_COLOR_CADENA',       'id', 'codigo', null, null, null, 'nombre'),
	('ENR_TIPO_MOTOR',       'Enrollable: tipo de motor -> código',           'SOL_ACC_TIPO_MOTOR',         'id', 'codigo', null, null, null, 'nombre'),
	('ENR_MODELO_MOTOR',     'Enrollable: modelo de motor -> código',         'SOL_ACC_MODELO_MOTOR',       'id', 'codigo', null, null, null, 'nombre'),
	('ENR_MANDO',            'Enrollable: mando -> código',                   'SOL_ACC_MANDO',              'id', 'codigo', null, null, null, 'nombre'),
	('ENR_CARGADOR',         'Enrollable: cargador -> código',                'SOL_ACC_CARGADOR',           'id', 'codigo', null, null, null, 'nombre'),
	('ENR_BATERIA',          'Enrollable: batería -> código',                 'SOL_ACC_BATERIA',            'id', 'codigo', null, null, null, 'nombre'),
	('ENR_SOPORTE',          'Enrollable: soporte -> código',                 'SOL_ACC_SOPORTE',            'id', 'codigo', null, null, null, 'nombre'),
	('ENR_COLOR_SOPORTE',    'Enrollable: color de soporte -> código',        'SOL_ACC_COLOR_SOPORTE',      'id', 'codigo', null, null, null, 'nombre'),
	('ENR_TAPA',             'Enrollable: tapa -> código',                    'SOL_ACC_TAPA',               'id', 'codigo', null, null, null, 'nombre'),
	('ENR_COLOR_TAPA',       'Enrollable: color de tapa -> código',           'SOL_ACC_COLOR_TAPA',         'id', 'codigo', null, null, null, 'nombre'),
	('ENR_CONTRAPESO',       'Enrollable: contrapeso -> código',              'SOL_ACC_CONTRAPESO',         'id', 'codigo', null, null, null, 'nombre'),
	('ENR_COLOR_CONTRAPESO', 'Enrollable: color de contrapeso -> código',     'SOL_ACC_COLOR_CONTRAPESO',   'id', 'codigo', null, null, null, 'nombre'),
	('ENR_TEJIDO_ARTICULO',  'Enrollable: tipo de tejido + color -> artículo', 'SOL_ARTICULOS_FABRICACION_RELACION', 'value1', 'articulos', 'value2', 'tipo', '3', null),
	('ENR_SALIDA_TEJIDO',    'Enrollable: salida del tejido -> artículo',     'SOL_ARTICULOS_SALIDATEJIDO', 'idrow', 'articulos', null, null, null, null)

/* Alta o actualización de las búsquedas ENR_ (las demás no se tocan) */
update b set descripcion = n.descripcion, tabla = n.tabla, clave = n.clave, resultado = n.resultado,
             clave2 = n.clave2, filtro_columna = n.filtro_columna, filtro_valor = n.filtro_valor, texto = n.texto,
             sistema = null, producto = 1
from SOL_FABRICACION_BUSQUEDAS b join @b n on n.busqueda = b.busqueda

insert SOL_FABRICACION_BUSQUEDAS (busqueda, sistema, producto, descripcion, tabla, clave, resultado, clave2, filtro_columna, filtro_valor, texto)
select n.busqueda, null, 1, n.descripcion, n.tabla, n.clave, n.resultado, n.clave2, n.filtro_columna, n.filtro_valor, n.texto
from @b n
where not exists (select 1 from SOL_FABRICACION_BUSQUEDAS b where b.busqueda = n.busqueda)

/* Comprobación: todas las columnas existen */
select n.busqueda, 'columna inexistente' as problema
from @b n
where not exists (select 1 from sys.columns c where c.object_id = object_id('dbo.' + n.tabla) and c.name = n.clave)
   or not exists (select 1 from sys.columns c where c.object_id = object_id('dbo.' + n.tabla) and c.name = n.resultado)
   or (n.clave2 is not null and not exists (select 1 from sys.columns c where c.object_id = object_id('dbo.' + n.tabla) and c.name = n.clave2))
   or (n.filtro_columna is not null and not exists (select 1 from sys.columns c where c.object_id = object_id('dbo.' + n.tabla) and c.name = n.filtro_columna))
   or (n.texto is not null and not exists (select 1 from sys.columns c where c.object_id = object_id('dbo.' + n.tabla) and c.name = n.texto))
go
