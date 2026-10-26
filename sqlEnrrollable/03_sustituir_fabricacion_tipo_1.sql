/* =====================================================================
   03 - Sustituye la fabricación del enrollable por la del motor de reglas (v3)
   Decisión del usuario (2026-10-22): no conviven dos fabricaciones del enrollable.
   La actual (dev_sp_fabricacion_tipo_1, también la de Leroy Merlín, que no se usa) se
   guarda como copia y sp_fabricacion_generate pasa a llamar solo a
   temp_sp_fabricacion_tipo_1_v3.
     1. Copia: dev_sp_fabricacion_tipo_1_copia_20261022, con el texto exacto del actual
        (solo cambia el nombre de la cabecera; se comprueba con SHA-256). No la llama nadie.
        El texto también está en backup/dev_sp_fabricacion_tipo_1_definicion_20261022.sql.
     2. sp_fabricacion_generate: la llamada a dev_sp_fabricacion_tipo_1 se cambia por
        temp_sp_fabricacion_tipo_1_v3 (cambio quirúrgico sobre su definición; la llamada que
        está dentro de un comentario no se toca).
     3. Se borra dev_sp_fabricacion_tipo_1, solo si la copia existe y es idéntica y el router
        ya no lo llama.
   Efecto: las líneas del modelo nuevo se fabrican por reglas; las del modelo antiguo ya no
   se calculan ni se borran (conservan la fabricación que tuvieran).
   Seguridad: cada paso comprueba lo que espera encontrar; si no, se para con un error sin
   modificar nada. Si ya está aplicado no hace nada. Se deshace con 03_deshacer_sustituir_fabricacion_tipo_1.sql.
   Requisito: 02 (temp_sp_fabricacion_tipo_1_v3).
   ===================================================================== */
set ansi_nulls on
go
set quoted_identifier on
go

if object_id('dbo.temp_sp_fabricacion_tipo_1_v3') is null
	raiserror('Falta temp_sp_fabricacion_tipo_1_v3: aplique antes el script 02', 16, 1)
go

/* ---- 1. Copia ---- */
declare @orig nvarchar(max) = object_definition(object_id('dbo.dev_sp_fabricacion_tipo_1'))
declare @copia nvarchar(max) = object_definition(object_id('dbo.dev_sp_fabricacion_tipo_1_copia_20261022'))
declare @cabOrig nvarchar(100) = N'CREATE PROCEDURE [dbo].[dev_sp_fabricacion_tipo_1]'
declare @cabCopia nvarchar(100) = N'CREATE PROCEDURE [dbo].[dev_sp_fabricacion_tipo_1_copia_20261022]'
declare @h int

if @copia is not null
begin
	if @orig is not null and hashbytes('SHA2_256', replace(@copia, @cabCopia, @cabOrig)) <> hashbytes('SHA2_256', @orig)
		raiserror('La copia dev_sp_fabricacion_tipo_1_copia_20261022 ya existe y no es igual al procedimiento actual: no se sigue', 16, 1)
	else
		print 'Copia: ya existía'
end
else if @orig is null
	raiserror('No existe dev_sp_fabricacion_tipo_1 ni su copia', 16, 1)
else
begin
	set @h = charindex(@cabOrig, @orig)
	if @h = 0 or charindex(@cabOrig, @orig, @h + 1) > 0
	   or ltrim(rtrim(replace(replace(replace(left(@orig, @h - 1), char(13), ''), char(10), ''), char(9), ''))) <> ''
		raiserror('dev_sp_fabricacion_tipo_1 no tiene la cabecera esperada: no se copia', 16, 1)
	else
	begin
		set @copia = stuff(@orig, @h, len(@cabOrig), @cabCopia)
		execute sp_executesql @copia
		if hashbytes('SHA2_256', replace(object_definition(object_id('dbo.dev_sp_fabricacion_tipo_1_copia_20261022')), @cabCopia, @cabOrig)) = hashbytes('SHA2_256', @orig)
			print 'Copia: dev_sp_fabricacion_tipo_1_copia_20261022 creada e idéntica'
		else
			raiserror('La copia creada no es idéntica', 16, 1)
	end
end
go

/* ---- 2. sp_fabricacion_generate ---- */
declare @def nvarchar(max) = object_definition(object_id('dbo.sp_fabricacion_generate'))
declare @nl nvarchar(2) = case when charindex(char(13), @def) > 0 then char(13) + char(10) else char(10) end
declare @llamada nvarchar(100) = N'execute dev_sp_fabricacion_tipo_1 @idPedido,0,1'
declare @comentario nvarchar(300) = N'/* sqlEnrrollable/03: el enrollable solo se fabrica por reglas (motor v3). La fabricación anterior está en dev_sp_fabricacion_tipo_1_copia_20261022 */'
declare @nueva nvarchar(100) = N'execute temp_sp_fabricacion_tipo_1_v3 @idPedido,0,1'
declare @fin int, @e int, @h int, @ini int, @sangria nvarchar(50)

if object_id('dbo.dev_sp_fabricacion_tipo_1_copia_20261022') is null
	raiserror('No existe la copia: no se cambia sp_fabricacion_generate', 16, 1)
else if charindex(N'sqlEnrrollable/03', @def) > 0
	print 'sp_fabricacion_generate: ya llamaba a temp_sp_fabricacion_tipo_1_v3'
else
begin
	/* La primera llamada está dentro de un comentario; la buena es la que sigue al comentario */
	set @fin = charindex(N'*/', @def, charindex(N'ModeloFabricacionSM', @def))
	set @e = charindex(@llamada, @def, @fin)
	set @h = charindex(N'CREATE PROCEDURE [dbo].[sp_fabricacion_generate]', @def)
	/* Sangría de la línea de la llamada (para el comentario y la llamada nueva) */
	set @ini = @e - charindex(char(10), reverse(left(@def, @e - 1)))
	set @sangria = substring(@def, @ini + 1, @e - @ini - 1)

	if charindex(N'ModeloFabricacionSM', @def) = 0 or @fin = 0 or @e = 0 or charindex(@llamada, @def, @e + 1) > 0
	   or charindex(N'execute temp_sp_fabricacion_tipo_2 @idPedido,0,1', @def, @e) = 0
	   or replace(replace(@sangria, char(9), ''), ' ', '') <> ''
	   or @h = 0 or ltrim(rtrim(replace(replace(left(@def, @h - 1), char(13), ''), char(10), ''))) <> ''
		raiserror('sp_fabricacion_generate no tiene el texto esperado: no se modifica', 16, 1)
	else
	begin
		set @def = stuff(@def, @e, len(@llamada), @comentario + @nl + @sangria + @nueva)
		set @def = stuff(@def, @h, len(N'CREATE PROCEDURE'), N'ALTER PROCEDURE')
		execute sp_executesql @def
		print 'sp_fabricacion_generate: ahora llama a temp_sp_fabricacion_tipo_1_v3'
	end
end
go

/* ---- 3. Borrar el original ---- */
declare @orig nvarchar(max) = object_definition(object_id('dbo.dev_sp_fabricacion_tipo_1'))
declare @copia nvarchar(max) = object_definition(object_id('dbo.dev_sp_fabricacion_tipo_1_copia_20261022'))
declare @gen nvarchar(max) = object_definition(object_id('dbo.sp_fabricacion_generate'))

if @orig is null
	print 'dev_sp_fabricacion_tipo_1: ya estaba borrado'
else if @copia is null
     or hashbytes('SHA2_256', replace(@copia, N'CREATE PROCEDURE [dbo].[dev_sp_fabricacion_tipo_1_copia_20261022]', N'CREATE PROCEDURE [dbo].[dev_sp_fabricacion_tipo_1]')) <> hashbytes('SHA2_256', @orig)
	raiserror('La copia no existe o no es idéntica: no se borra dev_sp_fabricacion_tipo_1', 16, 1)
else if charindex(N'sqlEnrrollable/03', @gen) = 0
	raiserror('sp_fabricacion_generate todavía llama a dev_sp_fabricacion_tipo_1: no se borra', 16, 1)
else
begin
	drop procedure dbo.dev_sp_fabricacion_tipo_1
	print 'dev_sp_fabricacion_tipo_1: borrado (queda la copia)'
end
go
