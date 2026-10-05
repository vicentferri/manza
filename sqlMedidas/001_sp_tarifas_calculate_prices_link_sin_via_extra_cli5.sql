-- 001 · 2026-10-05 · Igualar TEST con DEV: el cliente 5 (Leroy Web) deja de sumar una vía extra.
-- Repetible (CREATE OR ALTER). Ejecutar con: sqlcmd -f 65001 -d <BD> -i este_fichero
GO
CREATE OR ALTER PROCEDURE [dbo].[sp_tarifas_calculate_prices_link]
(
	@clientes int,
	@tubos int,
	@tejidos int,
	@marcas int = 1, -- Ya no se utiliza (mantenido con default por compatibilidad)
	@Ancho decimal(12,2),
	@Alto decimal(12,2),
	@impresion int,
	@ancholama int,
	@numlamas int,
	@producto int,
	@centro int,
	@cantidad int,
	@subproducto int,
	@vias int = -1,
	@soporte varchar(25) = 'TEC',
	@tejidoscombinados int = 0,
	@mando int = 0,
	@cargador int = 0,
	@nucleo int = 0,
	@v1 decimal(12,2) output,
	@v2 varchar(255) output,
	@d2 int output,
	@m2 int output,
	@y2 int output,
	@d3 int output,
	@m3 int output,
	@y3 int output,
	@dt int output
)
as
begin

declare @tempAncho decimal(12,2)

	set @Ancho = @Ancho / 100
	set @Alto = @Alto / 100
	set @tempAncho = @Ancho

declare @x int
declare @y int
declare @idrow int
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

declare @AnchoSoporte decimal(12,2)
declare @soportes int
declare @v1_acc decimal(12,2)
declare @v2_acc varchar(255)
declare @v2_inc varchar(255)

set @v1 = 0
set @v2 = ''

if @producto = 1 /* ENROLLABLE */
begin
	/*
	  ==============================================================================
	  CAMBIO NUEVA TARIFA:
	  Para producto 1 (Enrollable), se consulta SIEMPRE la tabla base de cadena / sin motor (marcas = 1).
	  Tanto si el pedido viene con cadena (@subproducto = 1) como con motor (@subproducto = 2),
	  el precio base de tejido y tubo se extrae siempre de marcas = 1.
	  El incremento por motorización y sus accesorios se sumará posteriormente en la sección de incrementos.
	  ==============================================================================
	*/
	select @idrow=isnull(idrow,0) from sol_articulos_tarifas where
	clientes = @clientes and tubos=@tubos and tejidos=@tejidos and marcas=1 and impresion = @impresion and producto=@producto
end

if @producto = 2 /* JAPONES */
begin
	select @idrow=isnull(idrow,0) from sol_articulos_tarifas where clientes = @clientes and tejidos=@tejidos and impresion = @impresion and producto=@producto
end

if @producto = 3 /* VERTICAL */
begin
	print @clientes
	print @tejidos
	print @impresion
	print @producto
	print @ancholama

	select @idrow=isnull(idrow,0) from sol_articulos_tarifas where clientes = @clientes and tejidos=@tejidos and impresion = @impresion and producto=@producto and ancholama=@ancholama

	print 'IDROW=' + cast(@idrow as varchar)
end

if @producto = 4 /* COMPAC */
begin
	select @idrow=isnull(idrow,0) from sol_articulos_tarifas where clientes = @clientes and tejidos=@tejidos and impresion = @impresion and producto=@producto
end


if @idrow > 0
begin

	if @producto = 2
	begin
	 set @ancho = @ancholama
	 set @Ancho = @Ancho / 100
	 ---modificacion de vias para cliente 5 Leroy Web
	 --if @clientes = 5 set @vias = @vias + 1



	end

	select top 1 @x=x from sol_articulos_tarifas_lineas where idrow=@idrow and isnumeric(v1)=1 and v1>=@Ancho and y=0 order by y
	select top 1 @y=y from sol_articulos_tarifas_lineas where idrow=@idrow and isnumeric(v1)=1 and v1>=@Alto and x=0 order by x



	select @v1=v1,@v2=v2 from sol_articulos_tarifas_lineas where idrow=@idrow and isnumeric(v1)=1 and x=@x and y=@y

	print 'V1=' + cast(@v1 as varchar)
	print 'V2=' + cast(@v2 as varchar)

	if @producto = 1 or @producto = 2 or @producto = 3 or @producto = 4
	begin

	    if @producto = 1
		begin
			/*
			  ==============================================================================
			  INCREMENTOS DE MOTORIZACIÓN Y ACCESORIOS (PRODUCTO 1 - ENROLLABLE)
			  ==============================================================================
			  Si @subproducto = 2 (Motor), el artículo es motorizado.
			  Añadimos los incrementos correspondientes (PVP a @v1 y código C1 a @v2 con C1_Sum)
			  a nivel unitario ANTES de multiplicar por la cantidad final (@cantidad).
			  ==============================================================================
			*/
			if @subproducto = 2
			begin
				-- ----------------------------------------------------------------------
				-- 1. INCREMENTO BASE DEL MOTOR:
				--  PVP: 62,00 ?
				--  C1: 'C1 0004000'
				-- ----------------------------------------------------------------------
				set @v1 = @v1 + 62.00
				set @v2_inc = 'C1 0004000'
				set @v2 = dbo.C1_Sum(@v2, @v2_inc)

				-- ----------------------------------------------------------------------
				-- 2. VARIABLE MANDO:
				--  0 = Sin mando (no suma nada)
				--  1 = Mando de 1 canal   (PVP  31,00 ? | C1: 'C1 0002000')
				--  6 = Mando de 6 canales (PVP  76,80 ? | C1: 'C1 0004042')
				-- ----------------------------------------------------------------------
				if @mando = 1
				begin
					set @v1 = @v1 + 31.00
					set @v2_inc = 'C1 0002000'
					set @v2 = dbo.C1_Sum(@v2, @v2_inc)
				end
				else if @mando = 6
				begin
					set @v1 = @v1 + 76.80
					set @v2_inc = 'C1 0004042'
					set @v2 = dbo.C1_Sum(@v2, @v2_inc)
				end

				-- ----------------------------------------------------------------------
				-- 3. VARIABLE CARGADOR:
				--  0 = Sin cargador (no suma nada)
				--  1 = Con cargador       (PVP  31,00 ? | C1: 'C1 0002000')
				-- ----------------------------------------------------------------------
				if @cargador = 1
				begin
					set @v1 = @v1 + 31.00
					set @v2_inc = 'C1 0002000'
					set @v2 = dbo.C1_Sum(@v2, @v2_inc)
				end

				-- ----------------------------------------------------------------------
				-- 4. VARIABLE SMART HOME (NÚCLEO INTELIGENTE):
				--  0 = Sin núcleo inteligente (no suma nada)
				--  1 = Con núcleo inteligente (PVP 136,84 ? | C1: 'C1 0007202')
				-- ----------------------------------------------------------------------
				if @nucleo = 1
				begin
					set @v1 = @v1 + 136.84
					set @v2_inc = 'C1 0007202'
					set @v2 = dbo.C1_Sum(@v2, @v2_inc)
				end
			end

			-- Multiplicación final por la cantidad solicitada
			set @v1 = @v1 * @cantidad
			SELECT  @v2 = [dbo].[C1_Multiply](@v2,@cantidad)
		end

		if @producto = 2
		begin


			set @v1 = @v1 * @numlamas
			SELECT  @v2 = [dbo].[C1_Multiply](@v2,@numlamas)

			print 'Tejido V1=' + cast(@v1 as varchar) + ',V2=' + cast(@v2 as varchar)


			if @subproducto = 1 or @subproducto = 3
			begin
				set @v1_e = 0
				set @v2_e = ''
				set @Ancho = @tempAncho
				set @Ancho = @Ancho * 100

				if @Ancho >= 100
				begin
				execute sp_panel_japones_valora @vias,@clientes,@Ancho, 1, @v1_e out, @v2_e out

				set @v1 = @v1  + @v1_e
				set @v2 = dbo.C1_Sum(@v2,@v2_e)

				end
				else
				begin
					set @v1_e = 0
					set @v2_e = 0

				end



			--print 'Tejido + Riel V1=' + cast(@v1 as varchar) + ',V2=' + cast(@v2 as varchar)

			end

			/* SOPORTES */
			if (@soporte = 'P06' or @soporte = 'P12' or @soporte = 'P15')
			begin
				if (@soporte = 'P06') set @AnchoSoporte = 60
				if (@soporte = 'P12') set @AnchoSoporte = 120
				if (@soporte = 'P15') set @AnchoSoporte = 150


				set @Ancho = @tempAncho
				set @Ancho = @Ancho * 100
				set @soportes = @Ancho / 50.0

				if @soportes  < 2

					set @soportes = 2

				execute sp_tarifa_accesorios 1,@AnchoSoporte,@soportes,@v1_acc out,@v2_acc out

				--print 'Cálculo Soportes V1=' + cast(@v1_acc as varchar) + ',V2=' + cast(@v2_acc as varchar)

				set @v1_acc = @soportes * @v1_acc

				set @v1 = @v1  + @v1_acc
				set @v2 = dbo.C1_Sum(@v2,@v2_acc)

			--print 'Más Soportes V1=' + cast(@v1 as varchar) + ',V2=' + cast(@v2 as varchar)

			end
			/* SOPORTES */

			--print 'HIER=' + cast(@soporte as varchar)
			--print 'V2=' + cast(@v2 as varchar)

			set @v1 = @v1 * @cantidad
			set @v2 = [dbo].[C1_Multiply](@v2,@cantidad)
			--print 'Final V1=' + cast(@v1 as varchar) + ',V2=' + cast(@v2 as varchar)
		end

		if @producto = 3 and @subproducto = 3 /* Solo Riel */
		begin
			print 'solo riel'
		end

		if @producto = 3 and @subproducto = 2 /* Solo Tejido */
		begin
			set @v1 = 1.5*@v1
			SELECT  @v2 = [dbo].[C1_Multiply](@v2,@cantidad)
			SELECT  @v2 = [dbo].[C1_Multiply](@v2,1.5)
		end

		if @producto = 3 and @subproducto = 1 /* Tejido más Riel */
		begin
				--set @v1 = @v1 * @cantidad
				set @v2 = [dbo].[C1_Multiply](@v2,@cantidad)
				--print 'Tejido V1=' + cast(@v1 as varchar) + ',V2=' + cast(@v2 as varchar)

				/* SOPORTES */
				if (@soporte = 'P08' or @soporte = 'P12' or @soporte = 'P15')
				begin
					if (@soporte = 'P08') set @AnchoSoporte = 80
					if (@soporte = 'P12') set @AnchoSoporte = 120
					if (@soporte = 'P15') set @AnchoSoporte = 150

					set @Ancho = @tempAncho
					set @Ancho = @Ancho * 100
					set @soportes = @Ancho / 50.0

					if @soportes < 2

						set @soportes = 2

					execute sp_tarifa_accesorios 1,@AnchoSoporte,@soportes,@v1_acc out,@v2_acc out

					--print 'Cálculo Soportes V1=' + cast(@v1_acc as varchar) + ',V2=' + cast(@v2_acc as varchar)

					set @v1_acc = @soportes * @v1_acc
					set @v1 = @v1  + @v1_acc
					set @v2 = dbo.C1_Sum(@v2,@v2_acc)

					--print 'Más Soportes V1=' + cast(@v1 as varchar) + ',V2=' + cast(@v2 as varchar)
			end
			/* SOPORTES */

			/* TEJIDOS COMBINADOS */

			if @tejidoscombinados = 1
			begin
			print 'hier'
				declare @cantidadCombi int
				set @cantidadCombi = 1
				set @v1 = @v1 + 46.97*@cantidadCombi
				set @v2_inc =  [dbo].[C1_Multiply]('C1 0002472',@cantidadCombi)

				print 'hier 2'
				set @v2 = dbo.C1_Sum(@v2,@v2_inc)
				print @v2
			end

			/* TEJIDOS COMBINADOS */
			print 'hier'
			set @v1 = @v1 * @cantidad
			set @v2 = [dbo].[C1_Multiply](@v2,@cantidad)
		end

		if @producto = 31 /* Vertical Inclinada */
		begin
			set @v1 = 1.5*@v1
			SELECT  @v2 = [dbo].[C1_Multiply](@v2,@cantidad)
			SELECT  @v2 = [dbo].[C1_Multiply](@v2,1.5)
		end

	end


	execute [dbo].[sp_fechafabricacion] @clientes,@producto,@tejidos,@centro,@d2 out,@m2 out,@y2 out,@d3 out,@m3 out,@y3 out,@dt out

	if @centro = 0
	begin
		set @centro= 10000
		set @clientes = 5
	end


	/*Test ob es eina Promotion gibt */
	set @fecha = getdate()
	select @existe = count(*) from vw_nh_clientes_promociones where idcliente=@clientes and idrow=@centro and @fecha>=desde and @fecha<=hasta and promocion_activa=1
	if @existe > 0
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







return 1

end
GO
