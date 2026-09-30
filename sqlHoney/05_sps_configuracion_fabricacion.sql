/* =====================================================================
   05 - SPs de configuración del motor de fabricación (pantalla v3)
   Solo trabajan con sistemas dados de alta y activos en
   SOL_FABRICACION_SISTEMAS: no pueden tocar reglas de otros sistemas
   (p. ej. ENROLLABLE del modelo SM antiguo) ni de CortinaDecor.
   Cliente: SOL_CLIENTES.idrow o NULL (= todos los clientes).
   Sustituye a los sp_honeycomb_fabricacion_* de la primera versión.
   ===================================================================== */
set ansi_nulls on
go
set quoted_identifier on
go

/* Limpieza de la primera versión */
if object_id('dbo.sp_honeycomb_fabricacion_regla_add') is not null drop procedure dbo.sp_honeycomb_fabricacion_regla_add
if object_id('dbo.sp_honeycomb_fabricacion_regla_update') is not null drop procedure dbo.sp_honeycomb_fabricacion_regla_update
if object_id('dbo.sp_honeycomb_fabricacion_regla_borrar') is not null drop procedure dbo.sp_honeycomb_fabricacion_regla_borrar
if object_id('dbo.sp_honeycomb_fabricacion_parametro_edit') is not null drop procedure dbo.sp_honeycomb_fabricacion_parametro_edit
if object_id('dbo.sp_honeycomb_fabricacion_parametro_borrar') is not null drop procedure dbo.sp_honeycomb_fabricacion_parametro_borrar
go

/* ---------------- REGLAS ---------------- */

if object_id('dbo.sp_fabricacion_regla_add') is not null
	drop procedure dbo.sp_fabricacion_regla_add
go

/* Devuelve el idrow creado, -1 sistema no válido, -2 cliente no válido */
create procedure [dbo].[sp_fabricacion_regla_add]
(
	@sistema varchar(50),
	@cliente int,
	@orden int,
	@atributo varchar(50),
	@articulos varchar(1024),
	@nombre_parametro1 varchar(50),
	@operacion char(1),
	@nombre_parametro2 varchar(50),
	@operacion2 char(1),
	@nombre_parametro3 varchar(50),
	@operacion3 char(1),
	@nombre_parametro4 varchar(50),
	@consumo varchar(255)
)
as
begin
	set nocount on

	if not exists (select 1 from SOL_FABRICACION_SISTEMAS where sistema = @sistema and activo = 1)
		return -1

	if @cliente is not null and not exists (select 1 from SOL_CLIENTES where idrow = @cliente)
		return -2

	insert into SOL_ARTICULOS_FABRICACION_RELACION_V2(orden, sistema, cliente, atributo, valor, articulos,
		nombre_parametro1, operacion, nombre_parametro2, operacion2,
		nombre_parametro3, operacion3, nombre_parametro4, consumo)
	values(isnull(@orden,0), @sistema, @cliente, isnull(@atributo,''), '', @articulos,
		@nombre_parametro1, isnull(nullif(upper(@operacion),''),'-'), @nombre_parametro2, isnull(nullif(upper(@operacion2),''),'-'),
		@nombre_parametro3, isnull(nullif(upper(@operacion3),''),'-'), @nombre_parametro4, @consumo)

	return scope_identity()
end
go

if object_id('dbo.sp_fabricacion_regla_update') is not null
	drop procedure dbo.sp_fabricacion_regla_update
go

/* Devuelve 1 OK, 0 regla no encontrada / campo o valor no válido */
create procedure [dbo].[sp_fabricacion_regla_update]
(
	@idrow int,
	@campo varchar(50),
	@valor varchar(1024)
)
as
begin
	set nocount on

	if not exists (select 1 from SOL_ARTICULOS_FABRICACION_RELACION_V2 r
	               join SOL_FABRICACION_SISTEMAS s on s.sistema = r.sistema and s.activo = 1
	               where r.idrow = @idrow)
		return 0

	if @campo in ('operacion','operacion2','operacion3')
		set @valor = case when upper(@valor) in ('Y','O','-') then upper(@valor) else '-' end

	if @campo = 'orden'
	begin
		if isnumeric(@valor) = 0 return 0
		update SOL_ARTICULOS_FABRICACION_RELACION_V2 set orden = cast(@valor as int) where idrow = @idrow
	end
	else if @campo = 'cliente'
	begin
		if isnull(@valor,'') = ''
			update SOL_ARTICULOS_FABRICACION_RELACION_V2 set cliente = null where idrow = @idrow
		else
		begin
			if isnumeric(@valor) = 0 return 0
			if not exists (select 1 from SOL_CLIENTES where idrow = cast(@valor as int)) return 0
			update SOL_ARTICULOS_FABRICACION_RELACION_V2 set cliente = cast(@valor as int) where idrow = @idrow
		end
	end
	else if @campo = 'atributo'          update SOL_ARTICULOS_FABRICACION_RELACION_V2 set atributo = isnull(@valor,'') where idrow = @idrow
	else if @campo = 'articulos'         update SOL_ARTICULOS_FABRICACION_RELACION_V2 set articulos = @valor where idrow = @idrow
	else if @campo = 'nombre_parametro1' update SOL_ARTICULOS_FABRICACION_RELACION_V2 set nombre_parametro1 = @valor where idrow = @idrow
	else if @campo = 'nombre_parametro2' update SOL_ARTICULOS_FABRICACION_RELACION_V2 set nombre_parametro2 = @valor where idrow = @idrow
	else if @campo = 'nombre_parametro3' update SOL_ARTICULOS_FABRICACION_RELACION_V2 set nombre_parametro3 = @valor where idrow = @idrow
	else if @campo = 'nombre_parametro4' update SOL_ARTICULOS_FABRICACION_RELACION_V2 set nombre_parametro4 = @valor where idrow = @idrow
	else if @campo = 'operacion'         update SOL_ARTICULOS_FABRICACION_RELACION_V2 set operacion = @valor where idrow = @idrow
	else if @campo = 'operacion2'        update SOL_ARTICULOS_FABRICACION_RELACION_V2 set operacion2 = @valor where idrow = @idrow
	else if @campo = 'operacion3'        update SOL_ARTICULOS_FABRICACION_RELACION_V2 set operacion3 = @valor where idrow = @idrow
	else if @campo = 'consumo'           update SOL_ARTICULOS_FABRICACION_RELACION_V2 set consumo = @valor where idrow = @idrow
	else return 0

	return 1
end
go

if object_id('dbo.sp_fabricacion_regla_edit') is not null
	drop procedure dbo.sp_fabricacion_regla_edit
go

/* Guarda la regla completa (ventana de edición).
   Devuelve 1 OK, 0 regla no encontrada, -1 sistema no válido, -2 cliente no válido */
create procedure [dbo].[sp_fabricacion_regla_edit]
(
	@idrow int,
	@sistema varchar(50),
	@cliente int,
	@orden int,
	@atributo varchar(50),
	@articulos varchar(1024),
	@nombre_parametro1 varchar(50),
	@operacion char(1),
	@nombre_parametro2 varchar(50),
	@operacion2 char(1),
	@nombre_parametro3 varchar(50),
	@operacion3 char(1),
	@nombre_parametro4 varchar(50),
	@consumo varchar(255)
)
as
begin
	set nocount on

	if not exists (select 1 from SOL_FABRICACION_SISTEMAS where sistema = @sistema and activo = 1)
		return -1

	if @cliente is not null and not exists (select 1 from SOL_CLIENTES where idrow = @cliente)
		return -2

	/* Solo reglas de sistemas del catálogo, y sin cambiar de sistema */
	if not exists (select 1 from SOL_ARTICULOS_FABRICACION_RELACION_V2 where idrow = @idrow and sistema = @sistema)
		return 0

	update SOL_ARTICULOS_FABRICACION_RELACION_V2 set
		cliente           = @cliente,
		orden             = isnull(@orden, 0),
		atributo          = isnull(@atributo, ''),
		articulos         = @articulos,
		nombre_parametro1 = @nombre_parametro1,
		operacion         = isnull(nullif(upper(@operacion),''),'-'),
		nombre_parametro2 = @nombre_parametro2,
		operacion2        = isnull(nullif(upper(@operacion2),''),'-'),
		nombre_parametro3 = @nombre_parametro3,
		operacion3        = isnull(nullif(upper(@operacion3),''),'-'),
		nombre_parametro4 = @nombre_parametro4,
		consumo           = @consumo
	where idrow = @idrow

	return 1
end
go

if object_id('dbo.sp_fabricacion_regla_borrar') is not null
	drop procedure dbo.sp_fabricacion_regla_borrar
go

create procedure [dbo].[sp_fabricacion_regla_borrar]
(
	@idrow int
)
as
begin
	set nocount on
	delete r from SOL_ARTICULOS_FABRICACION_RELACION_V2 r
	join SOL_FABRICACION_SISTEMAS s on s.sistema = r.sistema and s.activo = 1
	where r.idrow = @idrow
	return @@rowcount
end
go

/* ---------------- PARAMETROS ---------------- */

if object_id('dbo.sp_fabricacion_parametro_edit') is not null
	drop procedure dbo.sp_fabricacion_parametro_edit
go

/* Alta o modificación. Devuelve 1 OK, -1 nombre inválido, -2 tipo inválido,
   -3 columna inexistente en la tabla del sistema, -4 fórmula vacía,
   -5 sistema no válido */
create procedure [dbo].[sp_fabricacion_parametro_edit]
(
	@sistema varchar(50),
	@name varchar(50),
	@tipo varchar(10),
	@origen varchar(255),
	@orden int
)
as
begin
	set nocount on

	declare @tabla sysname

	select @tabla = tabla_origen from SOL_FABRICACION_SISTEMAS where sistema = @sistema and activo = 1
	if @tabla is null
		return -5

	set @name = upper(ltrim(rtrim(isnull(@name,''))))
	set @tipo = upper(ltrim(rtrim(isnull(@tipo,''))))
	set @origen = ltrim(rtrim(isnull(@origen,'')))

	if left(@name,1) <> '@' set @name = '@' + @name

	if len(@name) < 2 or substring(@name, 2, 50) like '%[^A-Z0-9_]%'
		return -1

	if @tipo not in ('COLUMNA','FORMULA')
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

	if exists (select 1 from SOL_FABRICACION_PARAMETROS where sistema = @sistema and name = @name)
		update SOL_FABRICACION_PARAMETROS set
			tipo = @tipo, origen = @origen, orden = isnull(@orden, orden)
		where sistema = @sistema and name = @name
	else
		insert into SOL_FABRICACION_PARAMETROS(sistema, name, tipo, origen, orden)
		values(@sistema, @name, @tipo, @origen, isnull(@orden, 0))

	return 1
end
go

if object_id('dbo.sp_fabricacion_parametro_borrar') is not null
	drop procedure dbo.sp_fabricacion_parametro_borrar
go

create procedure [dbo].[sp_fabricacion_parametro_borrar]
(
	@sistema varchar(50),
	@name varchar(50)
)
as
begin
	set nocount on
	delete from SOL_FABRICACION_PARAMETROS where sistema = @sistema and name = @name
	return @@rowcount
end
go
