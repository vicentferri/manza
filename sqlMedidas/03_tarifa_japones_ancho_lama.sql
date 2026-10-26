/* =====================================================================
   03 - Tarifa del panel japonés (Leroy): ancho de lama con decimales
   El configurador calcula el ancho de lama del japonés con decimales (ancho del
   mecanismo / vías + 5, redondeado a 0,05: 88,35). La tarifa de Leroy lo recibía
   en int y lo truncaba (88), y luego lo pasaba a metros: con columnas de 20 en
   20 cm, 80,35 se cobraba en la columna de 0,80 en vez de la de 1,00.

     temp_sp_fabricacion_tipo_2_tarifa : declare @ancholama int -> decimal(12,2)
     sp_tarifas_calculate_prices3_AT   : @ancholama int -> decimal(12,2) y, solo en
                                         el japonés (producto 2), ceiling() al cm
                                         antes de pasar a metros

   En el vertical @ancholama sirve para elegir la tarifa (89, 127...): llega entero
   y no cambia. El enrollable y el Compac pasan -1.
   El resto de cada SP es la definición de SOLARMANES_DEV local del 2026-10-22 (copia
   en backup/). Antes de tocar nada se comprueba la huella de los dos SPs: si alguno
   no es ni el original revisado ni el ya modificado, NO SE APLICA NINGUNO.
   Se puede ejecutar varias veces. Requiere el 01.
   ===================================================================== */
set ansi_nulls on
go
set quoted_identifier on
go

declare @huellas table (sp sysname, ck_original int, len_original int, ck_nuevo int, len_nuevo int)
insert into @huellas values
	('temp_sp_fabricacion_tipo_2_tarifa', -1285060731, 5796, -246677723, 5802),
	('sp_tarifas_calculate_prices3_AT', -1789014845, 10113, 273506740, 10244)

declare @distintos table (sp sysname, estado varchar(30))
insert into @distintos (sp, estado)
select h.sp, case when m.object_id is null then 'NO EXISTE' else 'DISTINTO' end
from @huellas h
left join sys.sql_modules m on m.object_id = object_id('dbo.' + h.sp)
where m.object_id is null
   or not ((checksum(m.definition) = h.ck_original and len(m.definition) = h.len_original)
        or (checksum(m.definition) = h.ck_nuevo and len(m.definition) = h.len_nuevo))

if exists (select 1 from @distintos)
begin
	select * from @distintos
	raiserror('03: NO SE EJECUTA, hay SPs distintos de la versión revisada (ver la lista)', 16, 1)
	set noexec on
end
go
	ALTER PROCEDURE [dbo].[temp_sp_fabricacion_tipo_2_tarifa]
(
 @idrow int,
 @iancho decimal(12,2),
 @ialto decimal(12,2),
 @cantidad int,
 @preciomontaje decimal(12,4) = 0.21,
 @criterio int				  = 180,
 @margen decimal(12,4)		  = 2.22,
 @preciom2 decimal(12,4)	  = 3.31,
 @densidad decimal(12,3)	  = 0.330,
 @desmult int				  = 0,
 @v1 decimal(12,2) output,
 @v2 varchar(255) output
)
as
begin



 declare @c00 decimal(12,2)
 declare @c01 decimal(12,2)
 declare @c02 decimal(12,2)
 declare @unitarios decimal(12,4)
 declare @verticales decimal(12,4)
 declare @metrolineal decimal(12,4)
 declare @alto decimal(12,4)
 declare @alto2 decimal(12,4)
 declare @cliente int
 declare @impresion int 
 declare @lamas int 

 set @cliente = (select cliente from temp_sol_pedidos_cola where idrow = (select idrow from temp_sol_pedidos_cola_lineas where id = (select idrow from temp_sol_pedidos_cola_tipo_2 where id = @idrow)))
 SELECT @lamas = PJ_NumeroLamas,@impresion = impresion FROM [dbo].[temp_sol_pedidos_cola_tipo_2] WHERE id = @idrow

 
 select @unitarios = ISNULL(sum(cantidad*precio2),0) from temp_sol_pedidos_cola_tipo_3_fabricacion where idrow=@idrow and unidad in (1,4,5) and articulo in (select idrow from articulos where isnull(vertical,0)=0)
 select @verticales = ISNULL(sum(cantidad*precio2),0) from temp_sol_pedidos_cola_tipo_3_fabricacion where idrow=@idrow and articulo in (select idrow from articulos where isnull(vertical,0)=1)
 
 set @v1 = -1
 set @v2 = ''

 
 if @cliente <> 1 AND @cliente <> 5
 begin
 declare @tipo int
 declare @marca int
  declare @tejido int
  declare @tarifa int

  declare @margen2 decimal(12,4) = 1
 

 declare @monetarios decimal(12,4)
 
 declare @tipoproducto int
 declare @grupo int

  declare @sp_sistema nvarchar(50)
  declare @sp_modelo  nvarchar(50) 
  declare @sp_accionamiento  nvarchar(50) 
  declare @sp_tejido  nvarchar(50) 
  declare @sp_grupo  nvarchar(50) 
  declare @sp_tarifa  nvarchar(3) 
  declare @p1  decimal(5, 2) 
  declare @p2  decimal(5 ,2) 

  declare @sincronizado bit
 
 select    @tejido = PJ_Tejidos_id from temp_sol_pedidos_cola_tipo_2 where id =@idrow

 set @grupo = (select idrow from sol_articulos_tejidos_grupos where CHARINDEX(',' + cast(@tejido as nvarchar) ,nexos) > 0)

 if @grupo is null 
 begin
 if (select count(*) from sol_articulos_tejidos_grupos where CHARINDEX(cast(@tejido as nvarchar) ,nexos) > 0) = 1 set @grupo = (select idrow from sol_articulos_tejidos_grupos where CHARINDEX(cast(@tejido as nvarchar) ,nexos) > 0)
 if (select count(*) from sol_articulos_tejidos_grupos where CHARINDEX(cast(@tejido as nvarchar) ,nexos) > 0) > 1 set @grupo = (select idrow from sol_articulos_tejidos_grupos where substring(nexos,1,len(@tejido)) = @tejido )
 end

 if @grupo is null set @grupo = 0

 select top 1 @tarifa = idrow,  @sincronizado = op_synchronized from SOL_TARIFAS_SIMULATE where tipoproducto = 1  and tejido = -1 and sp_tarifa = 'T14' and grupo = @grupo
 AND sp_sistema = '2C27774C-ED24-478A-95D0-057F52B034C8'
 if @tarifa is null set @tarifa = 0

 if @tarifa > 0
 begin

 if @sincronizado = 0
 begin

	set @v1 = 10
	set @v2 = 20
end

if @sincronizado = 1 
	 begin

	  select @sp_sistema = ISNULL(sp_sistema,''),
			 @sp_modelo = ISNULL(sp_modelo,''),	
			 @sp_accionamiento = ISNULL(sp_accionamiento,''),
			 @sp_tejido = ISNULL(sp_tejido,''),
			 @sp_grupo = ISNULL(sp_grupo,''),
			 @sp_tarifa = ISNULL(sp_tarifa,'')
			 
	  from SOL_TARIFAS_SIMULATE where idrow=@tarifa


	   set @c02 = (SELECT [dbo].[solarmnes_pvp_t1yt2] (
				   @sp_sistema
				  ,@sp_modelo
				  ,@sp_accionamiento
				  ,@sp_tejido
				  ,@sp_grupo
				  ,@sp_tarifa
				  ,@iancho/100
				  ,@ialto))

				  if @c02 = -99
	begin
	 set @v1 = -99
	 set @v2 = 'No hay tarifa'

	 
	end

	end

	if @c02 <> -99
	begin
	if @impresion = 1 set @c02 = @c02 + 32.34
	
	set @v1 = @c02
	set @v2 = cast(@cantidad*@c02 as varchar)
	end

	end
	
	
	if @tarifa = 0
	begin
	 set @v1 = -99
	 set @v2 = 'No hay tarifa'
	
	end
	end

	if @cliente = 1 OR @cliente = 5
	begin
	
	declare @tubos int 
	declare @tejidos int
	declare @marcas int 
	declare @Ancho decimal(12,2)
	
	
	declare @ancholama decimal(12,2)
	declare @producto int
	declare @centro int
	
	declare @subproducto int 
	declare @vias int = -1
	declare @modelo int = -1
	declare @cajonmodelo int = -1
	declare @cajonlacado int = -1
	declare @guiamodelo int = -1
	declare @guialacado int = -1
	declare @color int = -1
	

	declare @v3 decimal(12,2)

	
	
	

	SELECT @tejidos = [PJ_Tejidos_id]     
      ,@color =   [pj_tejidosC_id]    
      ,@vias = PJ_NumeroVias_2
	  ,@cantidad = PJ_Cantidad_1
	  , @alto = (case when PJ_NumeroVias_2 = - 1 then PJ_AltoLamaTerminada else  PJ_Alto_1 end),@Ancho = PJ_Ancho_2,@ancholama = PJ_AnchoLama
	  ,@lamas = PJ_NumeroLamas,@impresion = impresion

  FROM [dbo].[temp_sol_pedidos_cola_tipo_2] WHERE id = @idrow

  set @tubos = -1
 set @marcas = -1
 
  
  set @subproducto = 1
  set @producto = 2
  ---PARA SOLO TEJIDO
  IF @lamas = 1 SET @lamas = 2

  ---
  if @vias = -1 set @vias = @lamas
 
 set @v2 = ''

	EXECUTE  [dbo].[sp_tarifas_calculate_prices3_AT] 
   @cliente
  ,@tubos
  ,@tejidos
  ,@marcas
  ,@Ancho
  ,@Alto
  ,@impresion
  ,@ancholama
  ,@producto
  ,@centro
  ,@cantidad
  ,@subproducto
  ,@vias
  ,@modelo
  ,@cajonmodelo
  ,@cajonlacado
  ,@guiamodelo
  ,@guialacado
  ,@color
  ,@v1 OUTPUT
  ,@v2 OUTPUT
  ,@v3 OUTPUT

  --select 'AQUI DEVUELVE EL C2 DE AT:' + @v2
 
 
			--set  @v2 = [dbo].[C1_Multiply](@v2,@cantidad * @vias)
		

	set @v1 = (SELECT	@v1) 
	set @v2 = (SELECT	@v2)
	end

	
	return 1

	end
go
ALTER PROCEDURE [dbo].[sp_tarifas_calculate_prices3_AT]
(
	@clientes int,
	@tubos int,
	@tejidos int,
	@marcas int,
	@Ancho decimal(12,2),
	@Alto decimal(12,2),
	@impresion int,
	@ancholama decimal(12,2),
	@producto int,
	@centro int,
	@cantidad int,
	@subproducto int, 
	@vias int = -1,
	@modelo int = -1,
	@cajonmodelo int = -1,
	@cajonlacado int = -1,
	@guiamodelo int = -1,
	@guialacado int = -1,
	@color int = -1,
	@v1 decimal(12,2) output,
	@v2 varchar(255) output,
	@v3 decimal(12,2) output
)
as
begin
	declare @AnchoMaximo decimal(12,2)
	set @AnchoMaximo = 0
	
	set nocount on 

	declare @desglose table(label varchar(255),precio decimal(12,2), c1 varchar(15))

	set @Ancho = @Ancho / 100
	set @Alto = @Alto / 100

declare @x int
declare @y int
declare @idrow int = 0
declare @message varchar(500)
declare @iImpresion int
declare @existe int
declare @fecha datetime
declare @coefpvp decimal(12,2)
declare @modpvp  int
declare @coefc1  decimal(12,2)
declare @modpvc  int

declare @v1_e decimal(12,2)
declare @v2_e varchar(25)

declare @guiapvp decimal(12,2)
declare @guiac1 varchar(25)

declare @motorpvp decimal(12,2)
declare @motorc1 varchar(25)

declare @lacadopvp decimal(12,2)
declare @lacadoc1 varchar(25)



set @v1 = 0
set @v2 = ''

if @producto = 1 /* ENROLLABLE */
begin

if @marcas = 55 select @idrow=isnull(idrow,0) from sol_articulos_tarifas where clientes = @clientes  and tejidos=@tejidos and marcas=55 and impresion = @impresion and producto=@producto		
if @marcas <> 55 select @idrow=isnull(idrow,0) from sol_articulos_tarifas where clientes = @clientes  and tejidos=@tejidos and marcas=1 and impresion = @impresion and producto=@producto
		
		

end

if @producto = 2 /* JAPONES */
begin
declare @maxancho int
	 select @maxancho=max(ancho)
	from SOL_ARTICULOS_MECANISMO_JAPONES_TARIFAS where vias=@vias and cliente=@clientes 

	if @Ancho * 100 <= @maxancho
	begin

		select @idrow=isnull(idrow,0) from sol_articulos_tarifas where clientes = @clientes and tejidos=@tejidos and 
	impresion = @impresion and producto=@producto
	end

end

if @producto = 3 /* VERTICAL */
begin
select @idrow=isnull(idrow,0) from sol_articulos_tarifas where clientes = @clientes and tejidos=@tejidos and impresion = @impresion 
	and producto=@producto and ancholama=@ancholama and tipos = @marcas
end

if @producto = 4 /* COMPAC */
begin
	select @idrow=isnull(idrow,0) from sol_articulos_tarifas where clientes = @clientes and tejidos=@tejidos and impresion = @impresion 
	and producto=@producto 
end


if @producto = 6 /* PANEL ZIP */
begin
	select top 1 @idrow=isnull(idrow,0) from sol_articulos_tarifas where clientes = @clientes and tejidos=@tejidos and 
	impresion = @impresion and producto=@producto 
	--and cajon=@cajonmodelo and lacado=@cajonlacado
end



if @idrow > 0
begin

	select @AnchoMaximo = 100.0*replace(max(rx),',','.') from SOL_ARTICULOS_TARIFAS_LINEAS where idrow=@idrow and y=1 and len(isnull(v1,''))>0 group by idrow

	if @producto = 2
	begin
	 /* ancho de lama con decimales (88,35): al cm superior, como la medida, para no caer en la columna inferior */
	 set @ancho = ceiling(@ancholama)
	 set @Ancho = @Ancho / 100
	end


	declare @tx int
	declare @ty int

	set @ty = (select count(*) from sol_articulos_tarifas_lineas where idrow=@idrow and isnumeric(v1)=1 and v1>=@Ancho and y=0)
	set @tx = (select count(*) from sol_articulos_tarifas_lineas where idrow=@idrow and isnumeric(v1)=1 and v1>=@Alto and x=0 )

	if @tx = 0 or @ty = 0
	begin
	 set @v1 = -99
	 set @v2 = 'C1 0000000'

	 insert into @desglose(label, precio,c1) values('Tejido',@v1,@v2)
	end


	if @tx <> 0 and @ty <> 0
	begin

	--select 'ANCHO:' + cast(@Ancho as varchar)
	--select 'ALTO:' + cast(@Alto as varchar)
	--select 'IDROW:' + cast(@idrow as varchar)

	select top 1 @x=x from sol_articulos_tarifas_lineas where idrow=@idrow and isnumeric(v1)=1 and v1>=@Ancho and y=0 order by y
	select top 1 @y=y from sol_articulos_tarifas_lineas where idrow=@idrow and isnumeric(v1)=1 and v1>=@Alto and x=0 order by x
	
	select @v1=replace(v1,',','.'),@v2=v2 from sol_articulos_tarifas_lineas 
	where idrow=@idrow and isnumeric(v1)=1 and x=@x and y=@y
	
	--select 'PVP:' + cast(@v1 as varchar)

	if @producto = 1 or @producto = 2 or @producto = 3 or @producto = 4 or @producto = 6
	begin

		if @producto = 1
		begin
			SELECT  @v2 = [dbo].[C1_Multiply](@v2,@cantidad)
			select 'HIER 1 C1:' + cast(@v2 as varchar)
		end

	
		if @producto = 2 
		begin
			SELECT  @v2 = [dbo].[C1_Multiply](@v2,@vias)
			select 'HIER 2 C1:' + cast(@v2 as varchar)
		end

		if @producto = 3 
		begin
			
			if @subproducto = 2
			begin
				set @v1 = 1.5*@v1
				SELECT  @v2 = [dbo].[C1_Multiply](@v2,@cantidad)
				SELECT  @v2 = [dbo].[C1_Multiply](@v2,1.5)
			end
			else
			begin
				SELECT  @v2 = [dbo].[C1_Multiply](@v2,@cantidad)
				select 'HIER 3 C1:' + cast(@v2 as varchar)
			end

			
		end
		

		if @producto = 4
		begin
			SELECT  @v2 = [dbo].[C1_Multiply](@v2,@cantidad)
			select 'HIER 4 C1:' + cast(@v2 as varchar)
		end

		if @producto = 6
		begin
			insert into @desglose(label, precio,c1) values('Tejido',@v1,@v2)
		end

		

		
		/*
		if @producto = 2
		begin
			if @subproducto = 1 or @subproducto = 3
			begin
				set @v1_e = 0
				set @v2_e = ''
				set @Ancho = @Ancho * 100
				execute sp_panel_japones_valora @vias,@clientes,@Ancho, @cantidad, @v1_e out, @v2_e out

				set @v1 = @v1  + @v1_e
				set @v2 = dbo.C1_Sum(@v2,@v2_e)
			end
		end
		*/

		/*
		if @producto = 6 and @guiamodelo > 0 and @guialacado >= 0
		begin

				set @guiapvp = 0
				set @guiac1 = 'C1 0000000'
				select top 1 @guiapvp = pvp, @guiac1=c1 from SOL_ARTICULOS_INCREMENTOS where cliente=@clientes and tipo=1 and value=@guiamodelo and 
				bruto=@guialacado and altura >= @Alto*100

				print @guiapvp

				set @v1 += @guiapvp 
				set @v2 = [dbo].[C1_Sum](@v2,@guiac1)
		end
		*/

		

	    if @producto = 6 and @marcas > 0 and @modelo > 0 or  @producto = 1 and @marcas > 0 and @modelo > 0
		begin
		
			print 'in v1=' + cast(@v1 as varchar)
			print 'in v2=' + @v2
			print 'marca:' + cast(@marcas as varchar)
			print 'modelo:' + cast(@modelo as varchar)
			print 'color:' + cast(@color as varchar)

			--- incrementos de lacados para cajon zip
			if @producto = 6 and @cajonlacado <> -1 
		begin
		declare @basico bit
		declare @factor decimal(5,2)

			SELECT top 1  @lacadopvp=PVP, @lacadoc1=C1, @basico = Basico, @factor= factor FROM SOL_ARTICULOS_INCREMENTOS_LACADOS WHERE id=@cajonlacado

			if @basico = 1 
			begin
			if @lacadopvp is null
			begin
			set	@lacadopvp = 0
			set	@lacadoc1 = 'C1 0000000'
			end
			end

			if @basico = 0
			begin
			set @lacadopvp = @v1*@factor
			set @lacadoc1 = [dbo].[C1_Multiply](@v2,@factor)
			end


			print 'lacadopvp:' + cast(@lacadopvp as varchar)
			print 'lacadoc1:' + @lacadoc1

			set @v1 += @lacadopvp 
			set @v2 = [dbo].[C1_Sum](@v2,@lacadoc1)
					

			end
			---incremento de motor
			SELECT top 1  @motorpvp=PVP, @motorc1=C1 FROM SOL_ARTICULOS_INCREMENTOS_GENERICOS WHERE PRODUCTO=@producto AND MARCA=@marcas AND MODELO=@modelo and cliente = @clientes

			if @motorpvp is null
			begin
			set	@motorpvp = 0
			set	@motorc1 = 'C1 0000000'
			end

			print 'motorpvp:' + cast(@motorpvp as varchar)
			print 'motorc1:' + @motorc1

			set @v1 += @motorpvp 
			set @v2 = [dbo].[C1_Sum](@v2,@motorc1)
			
			print 'out v1=' + cast(@v1 as varchar)
			print 'out v2=' + @v2

			insert into @desglose(label, precio,c1) values('Accionamiento',@motorpvp,@motorc1)
		
			if @color > 0
			begin
				insert into @desglose(label, precio,c1)
				select top 1 descripcion,precio,c1 from SOL_ARTICULOS_ACCIONAMIENTOS_RADIO_TIPO_CLIENTE where modelo=@color
			end


			insert into @desglose(label, precio,c1) values('Total',@v1,@v2)
		end

		--- incrementos de lacados para compac
		
		if @producto = 4 and @cajonlacado > 0
		begin
		

			SELECT top 1  @lacadopvp=PVP, @lacadoc1=C1, @basico = Basico, @factor= factor FROM SOL_ARTICULOS_INCREMENTOS_LACADOS WHERE id=@cajonlacado

			if @basico = 1 
			begin
				if @lacadopvp is null
				begin
					set	@lacadopvp = 0
					set	@lacadoc1 = 'C1 0000000'
				end
			end

			if @basico = 0
			begin
			set @lacadopvp = @v1*@factor
			set @lacadoc1 = [dbo].[C1_Multiply](@v2,@factor)
			end


			select 'lacadopvp:' + cast(@lacadopvp as varchar)
			select 'lacadoc1:' + @lacadoc1

			set @v1 += @lacadopvp 
			set @v2 = [dbo].[C1_Sum](@v2,@lacadoc1)
					

			select 'FINAL:' + cast(@v2 as varchar)

			end
			end

	


	/*Test ob es eina Promotion gibt */
	set @fecha = getdate()
	select @existe = count(*) from vw_nh_clientes_promociones where idcliente=@clientes and idrow=@centro and @fecha>=desde and @fecha<=hasta and promocion_activa=1
	if @existe > 0 and @tx <> 0 and @ty <> 0
	begin

	select @coefpvp = promocion_coeficiente,
		   @modpvp  = promocion_modificapvp,
		   @coefc1  = promocion_coeficiente2,
	       @modpvc  = promocion_modificapvc from vw_nh_clientes_promociones where idcliente=@clientes and idrow=@centro and @fecha>=desde and @fecha<=hasta and promocion_activa=1

		   if @modpvp = 1
		   begin
			 set @v1 = @v1*(1-0.01*@coefpvp)
		   end 

		   if @modpvc = 1
		   begin
			 set @v2 = dbo.C1_Modif(@v2,@coefc1)
		   end 


	end


end
end

set @message = 'C='+cast(@clientes as varchar) + ',Tu='+cast(@tubos as varchar) + ',Te=' + cast(@tejidos as varchar) + ',Ma='+cast(@marcas as varchar)
set @message +='An=' + cast(@ancho as varchar) + ',Al=' + cast(@alto as varchar) + ',Imp=' + cast(@impresion as varchar)
set @message +=',IDROW='+cast(@idrow as varchar) + ',V1='+cast(@v1 as varchar) + ',V2=' + @v2 
insert into messages(mensaje) values(@message)


update SOL_ARTICULOS_TARIFAS_CLIENTES set 
promocion_activa = 0
where promocion_activa=1 and hasta<getdate()

--select 'HIER=' + cast(@v2 as varchar)

set @v3 = @AnchoMaximo

select * from @desglose


return 1

end
go

set noexec off
go

/* Comprobación: @ancholama tiene que salir en decimal(12,2) en los dos */
select o.name as sp, p.name as parametro, type_name(p.user_type_id) as tipo, p.precision, p.scale
from sys.parameters p
join sys.objects o on o.object_id = p.object_id
where o.name = 'sp_tarifas_calculate_prices3_AT' and p.name = '@ancholama'
select 'temp_sp_fabricacion_tipo_2_tarifa' as sp,
	case when object_definition(object_id('dbo.temp_sp_fabricacion_tipo_2_tarifa')) like '%declare @ancholama decimal(12,2)%' then 'decimal(12,2)' else 'SIN CAMBIAR' end as ancholama
go
