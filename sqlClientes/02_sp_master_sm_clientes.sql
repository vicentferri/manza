/* =====================================================================
   02 - sp_master_sm_clientes: alta y renombrado de clientes
   Copia del procedimiento anterior: backup/sp_master_sm_clientes_antes_20261015.sql

   Cambios respecto a la versión anterior:
   1. Alta: además de NH_CLIENTES, se crea la fila en SOL_CLIENTES con el MISMO id
      (las tablas de configuración por cliente dependen de SOL_CLIENTES).
   2. Alta: el domicilio de entrega se crea en el cliente nuevo. Antes se creaba
      siempre en el cliente 1 (Leroy Merlin).
   3. Renombrado: se actualiza también SOL_CLIENTES.descripcion (máx. 50 caracteres).
   4. Si el cliente existe en NH_CLIENTES y le falta la fila en SOL_CLIENTES, se
      crea al guardarlo (corrige solo los casos pendientes).
   Sin cambios: la firma (@idrow, @descripcion), que un nombre repetido no se da
   de alta dos veces y que no devuelve resultado (el backend lo trata como OK).
   Requiere: 01 (los clientes existentes ya sincronizados).
   ===================================================================== */
set ansi_nulls on
go
set quoted_identifier on
go

if object_id('dbo.sp_master_sm_clientes') is null
	exec('create procedure dbo.sp_master_sm_clientes as return 0')
go

alter procedure [dbo].[sp_master_sm_clientes]
(
 @idrow int,
 @descripcion varchar(255)
)
as
begin
	declare @existe int

	if @idrow = -1
	begin
		select @existe = count(*) from NH_CLIENTES where UPPER(NomFiscal) = UPPER(@descripcion)
		if @existe = 0
		begin
			INSERT INTO NH_CLIENTES(NomCliente,NomFiscal,alta,pais,idioma,areacliente,tipocliente,obsoleto,aseguradora,tipologia,responsable_cuenta,tipofacturacion,
			C1_Comercial,C2_Rappel,C3_Publicidad,C4_ProntoPago,Mar_Cliente,Mar_acc,Mar_Mec,Mar_Tejido)
			values(@descripcion,@descripcion,getdate(),1,1,1,1,0,-1,0,-1,-1,0,0,0,0,0,0,0,0)
			set @idrow = SCOPE_IDENTITY()
			if @idrow > 0
			begin
				/* Domicilio de entrega del cliente nuevo (antes IDCLIENTE = 1) */
				insert into NH_CLIENTES_DOMICILIOS(IDCLIENTE,CORREO,ENTREGA,NOMBRE,PAIS,DiasTransporte)
				values(@idrow,1,1,@descripcion,1,3)
			end
		end
		else
		begin
			set @idrow = 0
		end
	end
	else
	begin
		update nh_clientes set
		NomFiscal = @descripcion
		where idcliente = @idrow
	end

	/* SOL_CLIENTES.idrow = NH_CLIENTES.IdCliente (clave de las tablas de configuración por cliente) */
	if @idrow > 0 and exists (select 1 from NH_CLIENTES where IdCliente = @idrow)
	begin
		if exists (select 1 from SOL_CLIENTES where idrow = @idrow)
		begin
			update SOL_CLIENTES set descripcion = left(@descripcion, 50)
			where idrow = @idrow
		end
		else
		begin
			set identity_insert SOL_CLIENTES on
			insert into SOL_CLIENTES(idrow, descripcion, cif, C1_Comercial, C2_Rappel, C3_Publicidad, Mar_Cliente, Mar_Acc, Mar_Mec)
			select n.IdCliente, left(isnull(nullif(ltrim(rtrim(n.NomFiscal)), ''), @descripcion), 50), left(n.[NIF/CIF], 50),
				n.C1_Comercial, n.C2_Rappel, n.C3_Publicidad, n.Mar_Cliente, n.Mar_Acc, n.Mar_Mec
			from NH_CLIENTES n where n.IdCliente = @idrow
			set identity_insert SOL_CLIENTES off
		end
	end
end
go
