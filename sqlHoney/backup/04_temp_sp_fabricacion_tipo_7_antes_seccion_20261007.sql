/* =====================================================================
   04 - Motor de fabricación por reglas (v3) + HoneyComb (tipo 7)
   Replica la metodología de sp_fabricacion_mrp_cd (CortinaDecor), genérico
   por sistema (SOL_FABRICACION_SISTEMAS):
     - fn_fabricacion_condicion ........ evalúa una condición
     - fn_fabricacion_pos_operador ..... busca operadores de consumo
     - sp_fabricacion_evaluar .......... evalúa un consumo / fórmula (admite cadenas de operaciones)
   2026-10-07 (robustez): condiciones, fórmulas y artículos mal escritos o con
   valores no numéricos dan "no se cumple" / -1 / se ignoran, nunca un error
   que pare la fabricación del pedido. Comprobado por backend/test/fabricacion.
     - sp_fabricacion_reglas_parametros  construye los parámetros de una línea
     - sp_fabricacion_reglas_aplicar ... aplica las reglas del sistema/cliente
     - fn_fabricacion_articulos_detalle  texto de Artículos en la pantalla (admite @PARAM)
     - temp_sp_fabricacion_tipo_7 ...... HoneyComb: une lo anterior con las
       tablas del tipo 7. Solo procesa líneas tipo 7 y solo borra la
       fabricación de tipo 7. Firma sin cambios (lo llama sp_fabricacion_generate).
   Para migrar otro producto: alta en SOL_FABRICACION_SISTEMAS, sus parámetros
   y un procedimiento como temp_sp_fabricacion_tipo_7 con sus tablas.
   2026-10-06 (tejido): requiere las tablas nuevas de 01 (busquedas, tablas de valores).
     - Operaciones con parámetros como operando (@A ** @B) y *T (multiplica y
       deja 2 decimales sin redondear).
     - Parámetros BUSQUEDA y TABLA.
     - Artículo dinámico en la regla (@PARAMETRO en Artículos). Si no se resuelve
       a un artículo existente, se genera una línea sin artículo con el aviso
       "SIN ARTÍCULO" en la descripción (hoja y simulación; no va al XML).
   ===================================================================== */
set ansi_nulls on
go
set quoted_identifier on
go

/* ---------------------------------------------------------------------
   fn_fabricacion_condicion: 1 si se cumple la condición, 0 si no.
   Mismos operadores y mismo orden de detección que sp_fabricacion_mrp_cd
   (a <= @P <= b, @P <= n, @P << n, @P == v, @P >= n, @P >> n), con el mismo
   resultado para condiciones válidas, pero sin usar las fn_fabricacion_*
   antiguas, que dan error de conversión (y paran la fabricación del pedido)
   con valores no numéricos o con coma decimal (2026-10-07):
     - Comparaciones numéricas: si el parámetro o el número no son números,
       la condición no se cumple (0). Se admite coma decimal.
     - ==: sin espacios ni mayúsculas, como antes; si los dos lados son
       números se comparan como números (150 == 150.00).
   --------------------------------------------------------------------- */
if object_id('dbo.fn_fabricacion_condicion') is not null
	drop function dbo.fn_fabricacion_condicion
go

create function [dbo].[fn_fabricacion_condicion]
(
	@condicion varchar(255),
	@parametros dbo.Parameters3Type readonly
)
returns int
as
begin
	declare @op varchar(2) = null
	declare @p1 varchar(255), @p2 varchar(255), @p3 varchar(255)
	declare @valor varchar(255)
	declare @actual decimal(12,2), @numero decimal(12,2), @desde decimal(12,2), @hasta decimal(12,2)

	/* Igual que mrp_cd: los espacios se eliminan antes de evaluar */
	set @condicion = replace(isnull(@condicion, ''), ' ', '')

	/* Mismo orden de detección que mrp_cd (gana el último que encaja) */
	if (select count(*) from dbo.string_to_table_delimiter(@condicion,'<=')) = 3 set @op = 'IN'
	if (select count(*) from dbo.string_to_table_delimiter(@condicion,'<=')) = 2 set @op = '<='
	if (select count(*) from dbo.string_to_table_delimiter(@condicion,'<<')) = 2 set @op = '<<'
	if (select count(*) from dbo.string_to_table_delimiter(@condicion,'==')) = 2 set @op = '=='
	if (select count(*) from dbo.string_to_table_delimiter(@condicion,'>=')) = 2 set @op = '>='
	if (select count(*) from dbo.string_to_table_delimiter(@condicion,'>>')) = 2 set @op = '>>'

	if @op is null
		return 0

	select @p1 = data from dbo.string_to_table_delimiter(@condicion, case when @op = 'IN' then '<=' else @op end) where pos = 1
	select @p2 = data from dbo.string_to_table_delimiter(@condicion, case when @op = 'IN' then '<=' else @op end) where pos = 2
	select @p3 = data from dbo.string_to_table_delimiter(@condicion, case when @op = 'IN' then '<=' else @op end) where pos = 3

	if @op = '=='
	begin
		select @valor = replace(value, ' ', '') from @parametros where upper(name) = upper(@p1)
		if try_cast(replace(@valor, ',', '.') as decimal(18,6)) is not null
		   and try_cast(replace(@p2, ',', '.') as decimal(18,6)) is not null
			return case when try_cast(replace(@valor, ',', '.') as decimal(18,6))
			               = try_cast(replace(@p2, ',', '.') as decimal(18,6)) then 1 else 0 end
		return case when @valor = @p2 then 1 else 0 end
	end

	/* Numéricas: el parámetro está a la izquierda (en el intervalo, en medio) */
	select @valor = value from @parametros where upper(name) = upper(case when @op = 'IN' then @p2 else @p1 end)
	set @actual = try_cast(replace(@valor, ',', '.') as decimal(12,2))
	set @numero = try_cast(replace(@p2, ',', '.') as decimal(12,2))
	set @desde  = try_cast(replace(@p1, ',', '.') as decimal(12,2))
	set @hasta  = try_cast(replace(@p3, ',', '.') as decimal(12,2))

	return case
		when @op = 'IN' and @desde <= @actual and @actual <= @hasta then 1
		when @op = '<=' and @actual <= @numero then 1
		when @op = '<<' and @actual <  @numero then 1
		when @op = '>=' and @actual >= @numero then 1
		when @op = '>>' and @actual >  @numero then 1
		else 0 end
end
go

/* ---------------------------------------------------------------------
   fn_fabricacion_pos_operador: posición del primer operador de consumo
   (++, --, **, *R, *T) en @texto a partir de @desde; 0 si no hay ninguno.
   --------------------------------------------------------------------- */
if object_id('dbo.fn_fabricacion_pos_operador') is not null
	drop function dbo.fn_fabricacion_pos_operador
go

create function [dbo].[fn_fabricacion_pos_operador]
(
	@texto varchar(255),
	@desde int
)
returns int
as
begin
	declare @pos int = 0, @p int

	set @p = charindex('++', @texto, @desde) if @p > 0 and (@pos = 0 or @p < @pos) set @pos = @p
	set @p = charindex('--', @texto, @desde) if @p > 0 and (@pos = 0 or @p < @pos) set @pos = @p
	set @p = charindex('**', @texto, @desde) if @p > 0 and (@pos = 0 or @p < @pos) set @pos = @p
	set @p = charindex('*R', @texto, @desde) if @p > 0 and (@pos = 0 or @p < @pos) set @pos = @p
	set @p = charindex('*T', @texto, @desde) if @p > 0 and (@pos = 0 or @p < @pos) set @pos = @p

	return @pos
end
go

/* ---------------------------------------------------------------------
   sp_fabricacion_evaluar: evalúa una expresión de consumo/fórmula.
   Forma: operando (operador operando)*, de izquierda a derecha, en el orden
   escrito (sin prioridad de **). Operando: número (punto o coma decimal) o
   @PARAMETRO. Operadores: ++ suma, -- resta, ** multiplica, *R multiplica y
   redondea hacia arriba, *T multiplica y deja 2 decimales sin redondear
   (1,9488 -> 1,94). Ejemplos: 400, @ANCHO, @ANCHO -- 1.5 ** 2,
   @TEJIDO_ANCHO ** @TEJIDO_ALTO *T 0.0001, 0.01 ** @ALTO ** 2.
   Si algo no se puede calcular (parámetro inexistente, vacío o no numérico,
   operando mal escrito, resultado fuera de rango) devuelve -1, nunca un error:
   un error pararía la fabricación de todo el pedido.
   2026-10-07: ya no usa sp_fabricacion_tag (que da error con coma decimal o
   valores no numéricos, devuelve 0 con un parámetro de texto o vacío y redondea
   los números a 2 decimales: @ANCHO ** 0.0133 daba 1,50 en vez de 2,00).
   --------------------------------------------------------------------- */
if object_id('dbo.sp_fabricacion_evaluar') is not null
	drop procedure dbo.sp_fabricacion_evaluar
go

create procedure [dbo].[sp_fabricacion_evaluar]
(
	@expresion varchar(255),
	@parametros dbo.Parameters3Type readonly,
	@resultado decimal(12,2) output
)
as
begin
	set nocount on
	declare @valor varchar(255)
	declare @pos int
	declare @resto varchar(255)
	declare @op char(2)
	declare @numero decimal(18,6)
	declare @acumulado decimal(18,6)
	declare @termino varchar(255)

	set @expresion = replace(isnull(@expresion,''), ' ', '')
	set @resultado = -1

	/* Primer operando */
	set @pos = dbo.fn_fabricacion_pos_operador(@expresion, 1)
	set @termino = case when @pos > 0 then left(@expresion, @pos - 1) else @expresion end
	if left(@termino, 1) = '@'
	begin
		set @valor = null
		select @valor = value from @parametros where upper(name) = upper(@termino)
		set @termino = @valor
	end
	set @acumulado = try_cast(replace(@termino, ',', '.') as decimal(18,6))
	if @acumulado is null
		return

	/* Operaciones siguientes */
	set @resto = case when @pos > 0 then substring(@expresion, @pos, 255) else '' end
	while len(@resto) > 0
	begin
		set @op = left(@resto, 2)
		set @pos = dbo.fn_fabricacion_pos_operador(@resto, 3)
		set @termino = case when @pos > 0 then substring(@resto, 3, @pos - 3) else substring(@resto, 3, 255) end
		if left(@termino, 1) = '@'
		begin
			set @valor = null
			select @valor = value from @parametros where upper(name) = upper(@termino)
			set @termino = @valor
		end
		set @numero = try_cast(replace(@termino, ',', '.') as decimal(18,6))
		if @numero is null
			return

		/* try_cast: un resultado fuera de rango da -1 en vez de error */
		if @op = '++' set @acumulado = try_cast(@acumulado + @numero as decimal(18,6))
		if @op = '--' set @acumulado = try_cast(@acumulado - @numero as decimal(18,6))
		if @op = '**' set @acumulado = try_cast(@acumulado * @numero as decimal(18,6))
		if @op = '*R' set @acumulado = try_cast(ceiling(@acumulado * @numero) as decimal(18,6))
		if @op = '*T' set @acumulado = try_cast(round(@acumulado * @numero, 2, 1) as decimal(18,6))
		if @acumulado is null
			return

		set @resto = case when @pos > 0 then substring(@resto, @pos, 255) else '' end
	end

	set @resultado = isnull(try_cast(@acumulado as decimal(12,2)), -1)
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
	declare @calculado decimal(12,2)
	declare @pbusqueda varchar(50)
	declare @ptabla varchar(50)
	declare @entrada varchar(255)
	declare @btabla sysname, @bclave sysname, @bresultado sysname

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

		/* BUSQUEDA y TABLA parten del valor de otro parámetro ya calculado */
		set @entrada = null
		if @ptipo in ('BUSQUEDA','TABLA')
			select @entrada = ltrim(rtrim(value)) from @parametros where upper(name) = upper(ltrim(rtrim(@porigen)))

		if @ptipo = 'BUSQUEDA' and isnull(@entrada,'') <> ''
		begin
			set @btabla = null
			select @btabla = b.tabla, @bclave = b.clave, @bresultado = b.resultado
			from SOL_FABRICACION_BUSQUEDAS b
			where b.busqueda = @pbusqueda and (b.sistema is null or b.sistema = @sistema)
			  and exists (select 1 from sys.columns c where c.object_id = object_id('dbo.' + b.tabla) and c.name = b.clave)
			  and exists (select 1 from sys.columns c where c.object_id = object_id('dbo.' + b.tabla) and c.name = b.resultado)

			if @btabla is not null
			begin
				set @sql = N'select top 1 @r = upper(ltrim(rtrim(cast(' + quotename(@bresultado) + N' as varchar(255))))) '
				         + N'from dbo.' + quotename(@btabla)
				         + N' where ltrim(rtrim(cast(' + quotename(@bclave) + N' as varchar(255)))) = @e'
				execute sp_executesql @sql, N'@e varchar(255), @r varchar(255) output', @entrada, @pvalor output
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
   fn_fabricacion_articulos_detalle: texto de la columna Artículos de la
   pantalla. Los ids pasan por fn_get_articles (sin cambios: la usan otras
   pantallas) y los artículos dinámicos se muestran como '@PARAM (según pedido)'.
   --------------------------------------------------------------------- */
if object_id('dbo.fn_fabricacion_articulos_detalle') is not null
	drop function dbo.fn_fabricacion_articulos_detalle
go

create function [dbo].[fn_fabricacion_articulos_detalle]
(
	@articulos varchar(1024)
)
returns varchar(max)
as
begin
	declare @ids varchar(1024) = ''
	declare @dinamicos varchar(1024) = ''

	select @ids = @ids + case when @ids = '' then '' else ',' end + ltrim(rtrim(data))
	from dbo.string_to_table(replace(isnull(@articulos,''), ';', ','), ',')
	where ltrim(rtrim(data)) <> '' and ltrim(rtrim(data)) not like '%[^0-9]%' and try_cast(ltrim(rtrim(data)) as int) is not null
	order by pos

	select @dinamicos = @dinamicos + upper(ltrim(rtrim(data))) + ' (según pedido) '
	from dbo.string_to_table(replace(isnull(@articulos,''), ';', ','), ',')
	where left(ltrim(data), 1) = '@'
	order by pos

	return isnull(case when @ids = '' then '' else dbo.fn_get_articles(@ids, ',') end, '') + @dinamicos
end
go

/* ---------------------------------------------------------------------
   sp_fabricacion_reglas_aplicar: devuelve (orden, articulo, consumo, idregla)
   de las reglas del sistema que se cumplen con @parametros.
   Cliente: si @cliente tiene reglas propias en el sistema se usan solo esas;
   si no, las generales (cliente NULL).
   Condiciones: se encadenan de izquierda a derecha. Op 'O' = OR con la
   anterior; cualquier otro ('Y' o '-') = AND. Condición vacía = se ignora.
   Sin condiciones, la regla siempre aplica.
   Consumo: lista separada por ';' posicional con los artículos. Un único
   consumo vale para todos. Sin consumo = 1.
   Artículos: ids o @PARAMETRO (artículo dinámico, p. ej. @TEJIDO_ARTICULO).
   Si el parámetro no da un artículo existente se devuelve articulo NULL y
   aviso 'SIN ARTÍCULO: ...' (la línea se ve en la hoja y en la simulación).
   Medidas del componente (2026-10-07): si la regla tiene param_ancho / param_alto, devuelve
   su valor (cm) y con_ancho / con_alto = 1; temp_sp_fabricacion_tipo_7 los guarda en la fila.
   Devuelve (orden, articulo, consumo, idregla, aviso, ancho, alto, con_ancho, con_alto).
   --------------------------------------------------------------------- */
if object_id('dbo.sp_fabricacion_reglas_aplicar') is not null
	drop procedure dbo.sp_fabricacion_reglas_aplicar
go

create procedure [dbo].[sp_fabricacion_reglas_aplicar]
(
	@sistema varchar(50),
	@cliente int,
	@parametros dbo.Parameters3Type readonly
)
as
begin
	set nocount on

	declare @resultado table(orden int, articulo int, consumo decimal(12,2), idregla int, aviso varchar(255),
	                         ancho decimal(12,2), alto decimal(12,2), con_ancho bit, con_alto bit)
	declare @clienteReglas int = null

	declare @idregla int
	declare @orden int
	declare @atributo varchar(50)
	declare @artid int
	declare @artvalor varchar(255)
	declare @aviso varchar(255)
	declare @articulos varchar(1024)
	declare @cond1 varchar(255), @cond2 varchar(255), @cond3 varchar(255), @cond4 varchar(255)
	declare @op1 char(1), @op2 char(1), @op3 char(1)
	declare @consumo varchar(255)
	declare @aplica int
	declare @cumple int
	declare @k int
	declare @cond varchar(255)
	declare @op char(1)
	declare @numconsumos int
	declare @art varchar(50)
	declare @artpos int
	declare @expr varchar(255)
	declare @consumido decimal(12,2)
	declare @pancho varchar(50), @palto varchar(50)
	declare @vancho decimal(12,2), @valto decimal(12,2)

	if @cliente is not null and exists (select 1 from SOL_ARTICULOS_FABRICACION_RELACION_V2 where sistema = @sistema and cliente = @cliente)
		set @clienteReglas = @cliente

	declare itReglas cursor local forward_only for
	select idrow, orden, ltrim(rtrim(isnull(atributo,''))), replace(isnull(articulos,''),';',','),
	       ltrim(rtrim(isnull(nombre_parametro1,''))), ltrim(rtrim(isnull(nombre_parametro2,''))),
	       ltrim(rtrim(isnull(nombre_parametro3,''))), ltrim(rtrim(isnull(nombre_parametro4,''))),
	       upper(isnull(operacion,'-')), upper(isnull(operacion2,'-')), upper(isnull(operacion3,'-')),
	       ltrim(rtrim(isnull(consumo,''))),
	       ltrim(rtrim(isnull(param_ancho,''))), ltrim(rtrim(isnull(param_alto,'')))
	from SOL_ARTICULOS_FABRICACION_RELACION_V2
	where sistema = @sistema
	  and ((@clienteReglas is null and cliente is null) or cliente = @clienteReglas)
	order by orden, idrow
	open itReglas
	fetch next from itReglas into @idregla, @orden, @atributo, @articulos, @cond1, @cond2, @cond3, @cond4, @op1, @op2, @op3, @consumo, @pancho, @palto
	while @@fetch_status = 0
	begin

		set @aplica = null
		set @k = 1
		while @k <= 4
		begin
			set @cond = case @k when 1 then @cond1 when 2 then @cond2 when 3 then @cond3 else @cond4 end
			set @op   = case @k when 2 then @op1 when 3 then @op2 when 4 then @op3 else '-' end

			if len(@cond) > 0
			begin
				set @cumple = dbo.fn_fabricacion_condicion(@cond, @parametros)

				if @aplica is null
					set @aplica = @cumple
				else if @op = 'O'
					set @aplica = case when @aplica = 1 or @cumple = 1 then 1 else 0 end
				else
					set @aplica = case when @aplica = 1 and @cumple = 1 then 1 else 0 end
			end

			set @k = @k + 1
		end

		if isnull(@aplica, 1) = 1 and len(@articulos) > 0
		begin
			/* Medidas propias del componente (p. ej. tejido: ancho de corte y pliegues), en cm */
			set @vancho = null
			set @valto = null
			select @vancho = try_cast(replace(value, ',', '.') as decimal(12,2)) from @parametros where @pancho <> '' and upper(name) = upper(@pancho)
			select @valto  = try_cast(replace(value, ',', '.') as decimal(12,2)) from @parametros where @palto  <> '' and upper(name) = upper(@palto)

			select @numconsumos = count(*) from dbo.string_to_table(@consumo, ';')

			/* Solo dígitos (como la pantalla): isnumeric acepta '1e5', '$' o '.' y el cast a int
			   daría error; try_cast solo convierte '' en 0 */
			declare itArticulos cursor local forward_only for
			select pos, ltrim(rtrim(data)) from dbo.string_to_table(@articulos, ',')
			where (ltrim(rtrim(data)) <> '' and ltrim(rtrim(data)) not like '%[^0-9]%' and try_cast(ltrim(rtrim(data)) as int) is not null)
			   or left(ltrim(data), 1) = '@'
			open itArticulos
			fetch next from itArticulos into @artpos, @art
			while @@fetch_status = 0
			begin
				set @expr = null
				if @numconsumos = 1
					select @expr = ltrim(rtrim(data)) from dbo.string_to_table(@consumo, ';') where pos = 1
				else
					select @expr = ltrim(rtrim(data)) from dbo.string_to_table(@consumo, ';') where pos = @artpos

				if len(isnull(@expr,'')) = 0
					set @consumido = 1
				else
				begin
					set @consumido = null
					execute sp_fabricacion_evaluar @expr, @parametros, @consumido out
				end

				/* Artículo fijo o dinámico (@PARAMETRO) */
				set @aviso = null
				if left(@art, 1) = '@'
				begin
					set @artvalor = null
					select @artvalor = ltrim(rtrim(value)) from @parametros where upper(name) = upper(@art)
					set @artid = try_cast(try_cast(replace(@artvalor, ',', '.') as decimal(18,2)) as int)
					if @artid is null or not exists (select 1 from articulos where idrow = @artid)
					begin
						set @artid = null
						set @aviso = left('SIN ARTÍCULO: ' + case when @atributo <> '' then @atributo + ' ' else '' end
						           + '(' + upper(@art) + ' = ' + isnull(nullif(@artvalor, ''), 'vacío') + ')', 255)
					end
				end
				else
					set @artid = try_cast(@art as int)

				insert into @resultado(orden, articulo, consumo, idregla, aviso, ancho, alto, con_ancho, con_alto)
				values(@orden, @artid, @consumido, @idregla, @aviso, @vancho, @valto,
				       case when @pancho <> '' then 1 else 0 end, case when @palto <> '' then 1 else 0 end)

				fetch next from itArticulos into @artpos, @art
			end
			close itArticulos
			deallocate itArticulos
		end

		fetch next from itReglas into @idregla, @orden, @atributo, @articulos, @cond1, @cond2, @cond3, @cond4, @op1, @op2, @op3, @consumo, @pancho, @palto
	end
	close itReglas
	deallocate itReglas

	select orden, articulo, consumo, idregla, aviso, ancho, alto, con_ancho, con_alto from @resultado
end
go

/* ---------------------------------------------------------------------
   temp_sp_fabricacion_tipo_7: fabricación HoneyComb de un pedido.
   --------------------------------------------------------------------- */
alter procedure [dbo].[temp_sp_fabricacion_tipo_7]
(
	@idPedido int,
	@print int = 0,
	@real int = 0
)
as
begin
set nocount on

/* No existen tablas temp_ para el tipo 7: la simulación de presupuesto no genera fabricación HoneyComb */
if @real <> 1
	return 0

declare @sistema varchar(50) = 'HONEYCOMB'
declare @parametros as dbo.Parameters3Type
declare @componentes table(orden int, articulo int, consumo decimal(12,2), idregla int, aviso varchar(255),
                           ancho decimal(12,2), alto decimal(12,2), con_ancho bit, con_alto bit)
declare @lineas table(pos int, idLinea int)

declare @idLinea int
declare @Pos int
declare @id int
declare @cliente int
declare @cantidad int
declare @ancho decimal(12,2)
declare @alto decimal(12,2)

select @cliente = cliente from SOL_PEDIDOS_COLA where idrow = @idPedido

insert into @lineas(pos, idLinea)
select pos, id from (
	select row_number() over (order by id) as pos, id, tipo
	from sol_pedidos_cola_lineas where idrow = @idPedido
) l
where l.tipo = 7

declare itLineas cursor local forward_only for
select pos, idLinea from @lineas order by pos
open itLineas
fetch next from itLineas into @Pos, @idLinea
while @@fetch_status = 0
begin

	set @id = null
	select top 1 @id = id, @cantidad = cantidad, @ancho = ancho, @alto = alto
	from SOL_PEDIDOS_COLA_TIPO_7 where idrow = @idLinea

	if @id is not null
	begin

		delete from SOL_PEDIDOS_COLA_TIPO_7_FABRICACION where idrow = @id
		delete from SOL_PEDIDOS_COLA_TIPO_7_PARAMETERS where idrow = @id
		delete from @parametros
		delete from @componentes

		/* PARAMETROS */
		insert into @parametros(name, type, value)
		execute sp_fabricacion_reglas_parametros @sistema, @id

		insert into SOL_PEDIDOS_COLA_TIPO_7_PARAMETERS(idrow, idpedido, parametro, valor)
		select @id, @Pos, name, value from @parametros

		/* REGLAS */
		insert into @componentes(orden, articulo, consumo, idregla, aviso, ancho, alto, con_ancho, con_alto)
		execute sp_fabricacion_reglas_aplicar @sistema, @cliente, @parametros

		/* Sin artículo (dinámico no resuelto): articulo NULL y el aviso como descripción.
		   Ancho / alto (van al XML en Cn_P1 / Cn_P2): los de la regla si los tiene (tejido: ancho de
		   corte y pliegues, como mrp_cd); si no, los de la línea. Si la regla los tiene pero no se
		   pueden calcular quedan vacíos (en el XML 0), nunca con la medida de la ventana. */
		insert into SOL_PEDIDOS_COLA_TIPO_7_FABRICACION(idrow, idpedido, numero, articulo, descripcion, cantidad, unidad, orden, consumo, ancho, alto)
		select @id, @Pos, 1, articulo, isnull(aviso, ''), @cantidad, case when articulo is null then null else 1 end, orden, consumo,
		       case when con_ancho = 1 then ancho else @ancho end,
		       case when con_alto = 1  then alto  else @alto  end
		from @componentes
		order by orden, idregla

		/* ENRIQUECER (igual que mrp_cd) */
		update SOL_PEDIDOS_COLA_TIPO_7_FABRICACION set
		unidad = (select UPPER(unidad1) from articulos where idrow = articulo),
		precio = isnull((select precio_coste from articulos where idrow = articulo), 0)
		where idrow = @id and articulo is not null

		/* Unidad 3 (metros): el consumo de la regla se expresa en cm */
		update SOL_PEDIDOS_COLA_TIPO_7_FABRICACION set
		consumo = 0.01 * consumo
		where idrow = @id and unidad = 3

		update SOL_PEDIDOS_COLA_TIPO_7_FABRICACION set
		descripcion = (select UPPER(descripcion) from articulos where idrow = articulo),
		descUnidad  = (select descripcion from SOL_ARTICULOS_UNIDADES where SOL_ARTICULOS_UNIDADES.unidad = SOL_PEDIDOS_COLA_TIPO_7_FABRICACION.unidad),
		cod_sol     = (select cod_solupyme from articulos where articulos.idrow = SOL_PEDIDOS_COLA_TIPO_7_FABRICACION.articulo),
		fam_sol     = (select fam_solupyme from articulos where articulos.idrow = SOL_PEDIDOS_COLA_TIPO_7_FABRICACION.articulo),
		seccion     = (select isnull(seccion,'') from articulos where articulos.idrow = SOL_PEDIDOS_COLA_TIPO_7_FABRICACION.articulo)
		where idrow = @id and articulo is not null

	end

	fetch next from itLineas into @Pos, @idLinea
end
close itLineas
deallocate itLineas

return 1
end
go
