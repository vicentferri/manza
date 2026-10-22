/* =====================================================================
   03 (deshacer) - Vuelve a la fabricación anterior del enrollable:
     1. Recrea dev_sp_fabricacion_tipo_1 desde dev_sp_fabricacion_tipo_1_copia_20261022
        (mismo texto, solo cambia el nombre de la cabecera; se comprueba con SHA-256).
     2. sp_fabricacion_generate vuelve a llamar a dev_sp_fabricacion_tipo_1 (se quita
        exactamente el texto que puso el 03).
     3. Borra la copia, solo si el original ha quedado idéntico.
   Si no está aplicado no hace nada. temp_sp_fabricacion_tipo_1_v3 (02) no se toca.
   ===================================================================== */
set ansi_nulls on
go
set quoted_identifier on
go

/* ---- 1. Recrear el original ---- */
declare @orig nvarchar(max) = object_definition(object_id('dbo.dev_sp_fabricacion_tipo_1'))
declare @copia nvarchar(max) = object_definition(object_id('dbo.dev_sp_fabricacion_tipo_1_copia_20261022'))
declare @cabOrig nvarchar(100) = N'CREATE PROCEDURE [dbo].[dev_sp_fabricacion_tipo_1]'
declare @cabCopia nvarchar(100) = N'CREATE PROCEDURE [dbo].[dev_sp_fabricacion_tipo_1_copia_20261022]'
declare @h int

if @orig is not null
	print 'dev_sp_fabricacion_tipo_1: ya existía'
else if @copia is null
	raiserror('No existe dev_sp_fabricacion_tipo_1 ni su copia: no se puede deshacer', 16, 1)
else
begin
	set @h = charindex(@cabCopia, @copia)
	if @h = 0 or charindex(@cabCopia, @copia, @h + 1) > 0
		raiserror('La copia no tiene la cabecera esperada: no se recrea', 16, 1)
	else
	begin
		set @orig = stuff(@copia, @h, len(@cabCopia), @cabOrig)
		execute sp_executesql @orig
		print 'dev_sp_fabricacion_tipo_1: recreado desde la copia'
	end
end
go

/* ---- 2. sp_fabricacion_generate ---- */
declare @def nvarchar(max) = object_definition(object_id('dbo.sp_fabricacion_generate'))
declare @nl nvarchar(2) = case when charindex(char(13), @def) > 0 then char(13) + char(10) else char(10) end
declare @comentario nvarchar(300) = N'/* sqlEnrrollable/03: el enrollable solo se fabrica por reglas (motor v3). La fabricación anterior está en dev_sp_fabricacion_tipo_1_copia_20261022 */'
declare @nueva nvarchar(100) = N'execute temp_sp_fabricacion_tipo_1_v3 @idPedido,0,1'
declare @m int, @ini int, @sangria nvarchar(50), @bloque nvarchar(max), @h int

set @m = charindex(@comentario, isnull(@def, ''))
if charindex(N'sqlEnrrollable/03', isnull(@def, '')) = 0
	print 'sp_fabricacion_generate: ya llamaba a dev_sp_fabricacion_tipo_1'
else if object_id('dbo.dev_sp_fabricacion_tipo_1') is null
	raiserror('No existe dev_sp_fabricacion_tipo_1: no se cambia sp_fabricacion_generate', 16, 1)
else
begin
	set @ini = @m - charindex(char(10), reverse(left(@def, @m - 1)))
	set @sangria = substring(@def, @ini + 1, @m - @ini - 1)
	set @bloque = @comentario + @nl + @sangria + @nueva
	if @m = 0 or substring(@def, @m, len(@bloque)) <> @bloque
		raiserror('sp_fabricacion_generate: el texto del 03 se ha modificado a mano; no se deshace', 16, 1)
	else
	begin
		set @def = stuff(@def, @m, len(@bloque), N'execute dev_sp_fabricacion_tipo_1 @idPedido,0,1')
		set @h = patindex(N'%[^ ' + char(9) + char(13) + char(10) + N']%', @def)
		set @def = stuff(@def, @h, charindex(N' PROCEDURE', @def, @h) - @h, N'ALTER')
		execute sp_executesql @def
		print 'sp_fabricacion_generate: vuelve a llamar a dev_sp_fabricacion_tipo_1'
	end
end
go

/* ---- 3. Borrar la copia ---- */
declare @orig nvarchar(max) = object_definition(object_id('dbo.dev_sp_fabricacion_tipo_1'))
declare @copia nvarchar(max) = object_definition(object_id('dbo.dev_sp_fabricacion_tipo_1_copia_20261022'))

if @copia is null
	print 'Copia: ya estaba borrada'
else if @orig is null
     or hashbytes('SHA2_256', replace(@copia, N'CREATE PROCEDURE [dbo].[dev_sp_fabricacion_tipo_1_copia_20261022]', N'CREATE PROCEDURE [dbo].[dev_sp_fabricacion_tipo_1]')) <> hashbytes('SHA2_256', @orig)
	raiserror('dev_sp_fabricacion_tipo_1 no es idéntico a la copia: no se borra la copia', 16, 1)
else
begin
	drop procedure dbo.dev_sp_fabricacion_tipo_1_copia_20261022
	print 'Copia: borrada'
end
go
