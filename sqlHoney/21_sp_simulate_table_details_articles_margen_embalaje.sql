/* =====================================================================
   21 - sp_simulate_table_details_articles: margen1 en el embalaje
   Desglose del concepto Embalajes (-7): el total lleva margen1 y el texto
   lo indica (* Margen = x), para que siga sumando lo mismo que la casilla
   (scripts 18 y 20). HoneyComb y resto de productos. Resto igual que el 16.
   Copia anterior en
   backup/sp_simulate_table_details_articles_antes_margen_embalaje_20261016.sql.
   ===================================================================== */
set ansi_nulls on
go
set quoted_identifier on
go





alter procedure [dbo].[sp_simulate_table_details_articles]
(
  @tarifa int,
  @rowindex int,
  @colindex int,
  @type int
)
as
begin

	declare @x decimal(12,4)
	declare @y decimal(12,4)
	declare @criterio int
	declare @margen decimal(12,4)
	declare @margen2 decimal(12,4)
	declare @unitarios decimal(12,4)
	declare @monetarios decimal(12,4)
	declare @verticales decimal(12,4)
	declare @preciom2 decimal(12,4)
	declare @preciomontaje decimal(12,4)
	declare @densidad decimal(12,4)
	declare @tipoproducto int
	declare @grupotejido bit
	declare @ancho decimal(12,4)
	declare @alto decimal(12,4)
	declare @textoformula nvarchar(200)
	declare @textoformula1 nvarchar(200)
	declare @textoformula2 nvarchar(200)

	select @preciomontaje = ISNULL(preciomontaje,0),
			@criterio	   = criterio,
			@margen        = margen1,
			@margen2       = margen2,
			@preciom2      = preciom2,
			@densidad      = densidad,  
			@tipoproducto  = tipoproducto,
			@grupotejido   = grupotejido from SOL_TARIFAS_SIMULATE where idrow=@tarifa

	/* ================= HONEYCOMB (tipoproducto 7) =================
	   Mismo cálculo que la lista (sp_simulate_table_details) y que el mapa
	   (sp_solarmanes_precio_tejido_tabla_tarifa, bloque 10): alto 0,40 + 0,20*fila,
	   tejido plegado de HONEYCOMB / ALTO_PLIEGUES y margen del cliente (margen2).
	   Cada concepto calcula su total (@hc_objetivo) con la misma expresión que la lista;
	   las líneas no se redondean y una diferencia menor de medio céntimo (redondeos
	   internos de las funciones) se ajusta en la línea de mayor importe, así la suma de
	   la tabla es exactamente el importe de la lista.
	   Cantidad por ancho, monetarios y pletina (-8, -9, -10) siguen por el código general. */
	if @tipoproducto = 7 and @type between -7 and -1
	begin
		declare @hc_pliegues decimal(12,2)
		declare @hc_c01 decimal(12,2)
		declare @hc_cli nvarchar(60)
		declare @hc_objetivo decimal(18,6)
		declare @hc_suma decimal(18,6)
		declare @hc_filas table(orden int identity(1,1), articulo int, descripcion nvarchar(1000), cantidad decimal(18,4), precio decimal(18,4), total decimal(18,6))

		set @ancho = 20*@colindex
		set @alto = 0.01*(40 + 20*@rowindex)
		set @hc_pliegues = dbo.fn_fabricacion_tabla_valor('HONEYCOMB', 'ALTO_PLIEGUES', 100*@alto)
		set @hc_c01 = 0.01*@hc_pliegues
		set @margen2 = isnull(@margen2, 1)
		set @hc_cli = case when @margen2 <> 1 then ' * Margen cliente = ' + cast(cast(@margen2 as decimal(12,2)) as nvarchar(20)) else '' end

		---Tejido: precio m2 * ancho * tejido plegado * margen1 (fn_solarmanes_precio_tejido_honeycomb)
		if @type = -1
		begin
			set @hc_objetivo = isnull(@margen2 * dbo.fn_solarmanes_precio_tejido_honeycomb(@ancho, 100*@alto, @margen, @preciom2), 0)
			insert into @hc_filas(articulo, descripcion, cantidad, precio, total)
			select cab.tejido,
				isnull(case when @grupotejido = 1 then gru.descripcion collate database_default else art.descripcion collate database_default end, 'TEJIDO') + CHAR(10) +
				case when @hc_pliegues is null
					then 'Alto ' + cast(cast(@alto as decimal(12,2)) as nvarchar(20)) + ' m fuera de la tabla ALTO_PLIEGUES: sin precio'
					else 'Ancho ' + cast(cast(0.01*@ancho as decimal(12,2)) as nvarchar(20)) + ' m * Tejido plegado ' + cast(@hc_c01 as nvarchar(20))
						+ ' m (ALTO_PLIEGUES, alto ' + cast(cast(@alto as decimal(12,2)) as nvarchar(20)) + ' m) = '
						+ cast(cast(0.01*@ancho*@hc_c01 as decimal(12,4)) as nvarchar(20)) + ' m2'
				end + CHAR(10) +
				'P.Coste = ' + cast(cast(@preciom2 as decimal(12,2)) as nvarchar(20)) + '€/m2 * Margen = ' + cast(cast(@margen as decimal(12,2)) as nvarchar(20)) + @hc_cli,
				0.01*@ancho*isnull(@hc_c01,0),
				@preciom2*@margen*@margen2,
				@hc_objetivo
			from SOL_TARIFAS_SIMULATE cab
			left join SOL_ARTICULOS_TEJIDOS art on art.idrow = cab.tejido
			left join SOL_ARTICULOS_TEJIDOS_GRUPOS gru on gru.idrow = cab.grupo
			where cab.idrow = @tarifa
		end

		---Unitarios: cantidad * coste * margen de la línea (mmeca) * margen del cliente
		if @type = -2
		begin
			select @unitarios = isnull(sum(lin.cantidad*lin.precio2),0) from SOL_TARIFAS_SIMULATE_LINES lin
			inner join articulos art on art.idrow = lin.articulo
			where lin.idrow = @tarifa and lin.unidad in (1,4,5) and isnull(art.vertical,0) = 0 and isnull(art.tipocalculo,0) < 7
			set @hc_objetivo = @margen2 * @unitarios

			insert into @hc_filas(articulo, descripcion, cantidad, precio, total)
			select lin.articulo,
				lin.descripcion + CHAR(10) + cast(cast(lin.cantidad as decimal(12,2)) as nvarchar(10)) + ' ' + [dbo].[fn_Tipo_unidad_Articulo](art.UNIDAD1) + CHAR(10)
				+ 'P.Coste = ' + cast(cast(lin.precio as decimal(12,2)) as nvarchar(10)) + '€ * Margen = ' + cast(cast(lin.mmeca as decimal(12,2)) as nvarchar(10)) + @hc_cli,
				lin.cantidad,
				@margen2*lin.precio2,
				lin.cantidad*@margen2*lin.precio2
			from SOL_TARIFAS_SIMULATE_LINES lin
			inner join articulos art on art.idrow = lin.articulo
			where lin.idrow = @tarifa and lin.unidad in (1,4,5) and isnull(art.vertical,0) = 0 and isnull(art.tipocalculo,0) < 7
			order by lin.orden, lin.articulo
		end

		---Lineales: (ancho * cantidad + k) * coste * margen de la línea * margen del cliente (fn_Tarifa_Lineales)
		if @type = -3
		begin
			set @hc_objetivo = isnull(@margen2 * dbo.fn_Tarifa_Lineales(@tarifa, @ancho), 0)
			insert into @hc_filas(articulo, descripcion, cantidad, precio, total)
			select lin.articulo,
				lin.descripcion + CHAR(10) + cast(cast(0.01*@ancho as decimal(12,2)) as nvarchar(10)) + ' ancho * ' + cast(cast(lin.cantidad as decimal(12,2)) as nvarchar(10))
				+ case when isnull(lin.k,0) = 0 then '' else ' + ' + cast(cast(lin.k as decimal(12,2)) as nvarchar(10)) + ' de K' end + ' ' + [dbo].[fn_Tipo_unidad_Articulo](art.UNIDAD1) + CHAR(10)
				+ 'P.Coste = ' + cast(cast(lin.precio as decimal(12,2)) as nvarchar(10)) + '€ * Margen = ' + cast(cast(lin.mmeca as decimal(12,2)) as nvarchar(10)) + @hc_cli,
				case when lin.k is null then lin.cantidad*(0.01*@ancho) else lin.cantidad*(0.01*@ancho) + lin.k end,
				@margen2*lin.precio2,
				case when lin.k is null then lin.cantidad*(0.01*@ancho) else lin.cantidad*(0.01*@ancho) + lin.k end * @margen2*lin.precio2
			from SOL_TARIFAS_SIMULATE_LINES lin
			inner join articulos art on art.idrow = lin.articulo
			where lin.idrow = @tarifa and lin.unidad in (3) and (lin.desde <= @ancho and @ancho <= lin.hasta)
				and isnull(art.vertical,0) = 0 and isnull(art.tipocalculo,0) < 7
			order by lin.orden, lin.articulo

			/* fn_Tarifa_Lineales resta el descuento (dto) de las líneas: si lo hay se muestra como una línea más */
			select @hc_suma = isnull(sum(total),0) from @hc_filas
			if abs(@hc_objetivo - @hc_suma) >= 0.005
				insert into @hc_filas(articulo, descripcion, cantidad, precio, total)
				values(0, 'Descuento de lineales (dto)', 1, @hc_objetivo - @hc_suma, @hc_objetivo - @hc_suma)
		end

		---Montaje: minutos * precio minuto * margen1 * margen del cliente (fn_precio_tarifa_montaje)
		if @type = -4
		begin
			set @hc_objetivo = isnull(@margen2 * dbo.fn_precio_tarifa_montaje(@tarifa, @ancho, @preciomontaje, @margen), 0)
			insert into @hc_filas(articulo, descripcion, cantidad, precio, total)
			select null,
				'Montaje ' + CHAR(10) + cast(cast(isnull(tiempo,0) as decimal(12,2)) as nvarchar(10)) + ' minutos ' + CHAR(10)
				+ 'P.Coste = ' + cast(cast(@preciomontaje as decimal(12,2)) as nvarchar(10)) + '€/min * Margen = ' + cast(cast(@margen as decimal(12,2)) as nvarchar(10)) + @hc_cli,
				isnull(tiempo,0),
				@preciomontaje*@margen*@margen2,
				@hc_objetivo
			from SOL_TARIFAS_SIMULATE_TIMES where idrow = @tarifa and (desde <= @ancho and @ancho <= hasta)
		end

		---Verticales: alto de la fila * cantidad * coste * margen de la línea * margen del cliente
		if @type = -5
		begin
			select @verticales = isnull(sum(cantidad*precio2),0) from SOL_TARIFAS_SIMULATE_LINES
			where idrow = @tarifa and articulo in (select idrow from articulos where isnull(vertical,0) = 1)
			set @hc_objetivo = @margen2 * @verticales * @alto

			insert into @hc_filas(articulo, descripcion, cantidad, precio, total)
			select lin.articulo,
				lin.descripcion + CHAR(10) + cast(cast(@alto as decimal(12,2)) as nvarchar(10)) + ' alto * ' + cast(cast(lin.cantidad as decimal(12,2)) as nvarchar(10)) + ' ' + [dbo].[fn_Tipo_unidad_Articulo](art.UNIDAD1) + CHAR(10)
				+ 'P.Coste = ' + cast(cast(lin.precio as decimal(12,2)) as nvarchar(10)) + '€ * Margen = ' + cast(cast(lin.mmeca as decimal(12,2)) as nvarchar(10)) + @hc_cli,
				lin.cantidad*@alto,
				@margen2*lin.precio2,
				lin.cantidad*@margen2*lin.precio2*@alto
			from SOL_TARIFAS_SIMULATE_LINES lin
			inner join articulos art on art.idrow = lin.articulo
			where lin.idrow = @tarifa and isnull(art.vertical,0) = 1
			order by lin.orden, lin.articulo
		end

		---Peso (desmultiplicador): densidad * ancho * tejido plegado; si supera el umbral se cobra el recargo * margen1 * margen del cliente
		if @type = -6
		begin
			declare @hc_desm int, @hc_trigger decimal(12,2), @hc_desmval decimal(12,2), @hc_kg decimal(12,3), @hc_recargo decimal(12,2)
			select @hc_desm = isnull(desmultiplicador,0), @hc_trigger = isnull(desmultiplicador_trigger,0), @hc_desmval = isnull(desmultiplicador_value,0)
			from SOL_TARIFAS_SIMULATE where idrow = @tarifa
			set @hc_kg = @densidad * cast(0.01*@ancho as decimal(12,2)) * @hc_c01
			set @hc_recargo = dbo.fn_solarmanes_peso_tejido_valor(@tarifa, 0.01*@ancho, @hc_c01, @densidad)
			set @hc_objetivo = isnull(@margen2 * @margen * @hc_recargo, 0)
			insert into @hc_filas(articulo, descripcion, cantidad, precio, total)
			select null,
				'Peso' + CHAR(10) +
				case when @hc_desm <> 1 then 'Desmultiplicador desactivado en la tarifa: sin recargo'
					when @hc_c01 is null then 'Alto fuera de la tabla ALTO_PLIEGUES: sin recargo'
					else 'Densidad ' + cast(cast(@densidad as decimal(12,3)) as nvarchar(20)) + ' * ancho ' + cast(cast(0.01*@ancho as decimal(12,2)) as nvarchar(20))
						+ ' m * tejido plegado ' + cast(@hc_c01 as nvarchar(20)) + ' m = ' + cast(@hc_kg as nvarchar(20))
						+ case when @hc_kg > @hc_trigger then ' > umbral ' else ' <= umbral ' end + cast(@hc_trigger as nvarchar(20)) + CHAR(10)
						+ case when @hc_kg > @hc_trigger
							then 'Recargo = ' + cast(@hc_desmval as nvarchar(20)) + '€ * Margen = ' + cast(cast(@margen as decimal(12,2)) as nvarchar(20)) + @hc_cli
							else 'Sin recargo' end
				end,
				isnull(@hc_recargo,0),
				@margen*@margen2,
				@hc_objetivo
		end

		---Embalaje: el artículo de embalaje de la tarifa (temp_fn_precio_tarifa_embalaje)
		if @type = -7
		begin
			/* Igual que la función: si hay 6912 y 6913 manda el 6913. El alto de caja se guarda con 2 decimales */
			declare @hc_emb int = case when exists (select 1 from SOL_TARIFAS_SIMULATE_LINES where idrow = @tarifa and articulo = 6913) then 6913
				when exists (select 1 from SOL_TARIFAS_SIMULATE_LINES where idrow = @tarifa and articulo = 6912) then 6912 end
			declare @hc_caja decimal(12,2) = case @hc_emb when 6912 then 0.755 when 6913 then 0.615 end
			set @hc_objetivo = isnull(dbo.temp_fn_precio_tarifa_embalaje(@tarifa, @ancho, @margen), 0)
			insert into @hc_filas(articulo, descripcion, cantidad, precio, total)
			select top 1 articulo,
				descripcion + CHAR(10) + 'Precio ' + cast(cast(precio as decimal(12,2)) as nvarchar(10)) + '€ * (' + cast(cast(0.01*@ancho as decimal(12,2)) as nvarchar(10))
				+ ' ancho + 0.30) * alto caja ' + cast(@hc_caja as nvarchar(10)) + ' * Margen = ' + cast(cast(@margen as decimal(12,2)) as nvarchar(20)),
				cantidad,
				precio,
				@hc_objetivo
			from SOL_TARIFAS_SIMULATE_LINES where idrow = @tarifa and articulo = @hc_emb
		end

		/* Cuadre final: la suma de las líneas es exactamente el importe del concepto en la lista */
		select @hc_suma = isnull(sum(total),0) from @hc_filas
		if @hc_objetivo <> @hc_suma and abs(@hc_objetivo - @hc_suma) < 0.005
			update f set total = total + (@hc_objetivo - @hc_suma)
			from @hc_filas f
			where f.orden = (select top 1 orden from @hc_filas order by abs(total) desc, orden)

		select articulo, descripcion, cantidad, cast(precio as decimal(12,4)) as precio, total
		from @hc_filas order by orden
		return
	end
	/* ================= fin HONEYCOMB ================= */



	if @tipoproducto = 3
	begin
		set @x = 20*@colindex
		set @y = 100 + 10*@rowindex
		set @ancho = @x
		set @alto =  0.01*@y
	end
	else
	if @tipoproducto = 2
	begin
		set @x = 20*@colindex
		set @y = 60 + 20*@rowindex + 5.5

		set @ancho = @x
		set @alto =  0.01*@y
	end
	else
	begin
		set @x = 20*@colindex
		set @y = 20*(3+@rowindex)
		set @ancho = @x
		set @alto =  0.01*@y
	end

		declare @importe decimal(18,2)
		declare @importe1 decimal(18,2)
		declare @importe2 decimal(18,2)
		declare @cantidad as decimal(18,2)
		declare @cantidadtejido as decimal(18,2)
		declare @cantidadtejido1 as decimal(18,2)

	---Tejido
	if @type = -1 and @tipoproducto = 2
	begin
		set @cantidad = (@ancho * @alto) / 100
		set @textoformula = 'Criterio ' +cast(0.01*@ancho as varchar)+' x '+cast(@alto as varchar)+' x ' + cast(@preciom2 as varchar)+' x ' + cast(@margen as varchar)
		set @importe = 0.01*@ancho*@alto*@preciom2*@margen
	
		
		select  '1 ' + cab.tejido,art.descripcion  + ' - m2 ' + @textoformula as descripcion,
		@cantidad as cantidad,cast(@preciom2 as decimal(12,2)) as precio,
		cast(@importe as decimal(12,2)) as total from SOL_TARIFAS_SIMULATE cab
			inner join SOL_ARTICULOS_TEJIDOS art on art.idrow = cab.tejido
			where cab.idrow=@tarifa
	end

	
	if @type = -1 and  @tipoproducto not in (2,3)
	begin 

		set @cantidad = (@ancho * @alto) / 100

		set @importe = (dbo.fn_solarmanes_precio_tejido(@ancho,100*@alto,@criterio,@margen,@preciom2,1))
		if @importe is null set @importe = 0

		set @importe1 = (dbo.fn_solarmanes_precio_tejido(@ancho,100*@alto,@criterio,@margen,@preciom2,2))
		if @importe1 is null set @importe1 = 0

		set @importe2 = (dbo.fn_solarmanes_precio_tejido(@ancho,100*@alto,@criterio,@margen,@preciom2,3))
		if @importe2 is null set @importe2 = 0

		set @textoformula = str(dbo.fn_solarmanes_precio_tejido_p1(@ancho,100*@alto,@criterio,@margen,@preciom2,1)*100) + ' * ' + str(dbo.fn_solarmanes_precio_tejido_p2(@ancho,100*@alto,@criterio,@margen,@preciom2,1)*100) + ' + ' + str((dbo.fn_solarmanes_precio_tejido_crit(@ancho,100*@alto,@criterio,@margen,@preciom2,2) - dbo.fn_solarmanes_precio_tejido_m2(@ancho,100*@alto,@criterio,@margen,@preciom2,2))*100)  + ' / 100' 
		set @textoformula1 = str(dbo.fn_solarmanes_precio_tejido_p1(@ancho,100*@alto,@criterio,@margen,@preciom2,1)*100) + ' * ' + str(dbo.fn_solarmanes_precio_tejido_p2(@ancho,100*@alto,@criterio,@margen,@preciom2,1)*100) + ' / 100'
		set @textoformula2 = 'Criterio ' + str((dbo.fn_solarmanes_precio_tejido_crit(@ancho,100*@alto,@criterio,@margen,@preciom2,2)*100)) + ' -  m2 ' + str(dbo.fn_solarmanes_precio_tejido_m2(@ancho,100*@alto,@criterio,@margen,@preciom2,2)*100) + ' / 100'
	
		set @cantidadtejido = ((dbo.fn_solarmanes_precio_tejido_m2(@ancho,100*@alto,@criterio,@margen,@preciom2,1)) + (dbo.fn_solarmanes_precio_tejido_dif(@ancho,100*@alto,@criterio,@margen,@preciom2,1))) 
	
		set @cantidadtejido1 = dbo.fn_solarmanes_precio_tejido_m2(@ancho,100*@alto,@criterio,@margen,@preciom2,2)

		declare @cantidadtejido2 as decimal(18,2)
		set @cantidadtejido2 = dbo.fn_solarmanes_precio_tejido_dif(@ancho,100*@alto,@criterio,@margen,@preciom2,3)
		if @cantidadtejido2 = 0 set @cantidadtejido2 = 1
	
		if @grupotejido = 0
		begin
		select  '2 ' + cab.tejido,art.descripcion + ' - m2 ' + @textoformula2 as descripcion,cast(@cantidadtejido2 as decimal(12,2)) as cantidad,cast(@importe2 / @cantidadtejido2 as decimal(12,2)) as precio,cast(@importe2 as decimal(12,2)) as total from SOL_TARIFAS_SIMULATE cab
			inner join SOL_ARTICULOS_TEJIDOS art on art.idrow = cab.tejido
			where cab.idrow=@tarifa 
			union
			select  '1 ' + cab.tejido,art.descripcion  + ' - m2 ' + @textoformula1 as descripcion,@cantidadtejido1 as cantidad,cast(@importe1 / @cantidadtejido1 as decimal(12,2)) as precio,cast(@importe1 as decimal(12,2)) as total from SOL_TARIFAS_SIMULATE cab
			inner join SOL_ARTICULOS_TEJIDOS art on art.idrow = cab.tejido
			where cab.idrow=@tarifa 
			union
			select '3 ' + cab.tejido,art.descripcion + ' - m2 ' + @textoformula as descripcion,cast(@cantidadtejido as decimal(12,2)) as cantidad,cast(@importe / @cantidadtejido as decimal(12,2)) as precio,cast(@importe as decimal(12,2)) as total from SOL_TARIFAS_SIMULATE cab
			inner join SOL_ARTICULOS_TEJIDOS art on art.idrow = cab.tejido
			where cab.idrow=@tarifa 
		end

		if @grupotejido = 1
		begin
		select  '2 ' + cab.tejido,art.descripcion + ' - m2 ' + @textoformula2 as descripcion,cast(@cantidadtejido2 as decimal(12,2)) as cantidad,cast(@importe2 / @cantidadtejido2 as decimal(12,2)) as precio,cast(@importe2 as decimal(12,2)) as total from SOL_TARIFAS_SIMULATE cab
			inner join SOL_ARTICULOS_TEJIDOS_GRUPOS art on art.idrow = cab.grupo
			where cab.idrow=@tarifa 
			union
			select  '1 ' + cab.tejido,art.descripcion  + ' - m2 ' + @textoformula1 as descripcion,@cantidadtejido1 as cantidad,cast(@importe1 / @cantidadtejido1 as decimal(12,2)) as precio,cast(@importe1 as decimal(12,2)) as total from SOL_TARIFAS_SIMULATE cab
			inner join SOL_ARTICULOS_TEJIDOS_GRUPOS art on art.idrow = cab.grupo
			where cab.idrow=@tarifa 
			union
			select '3 ' + cab.tejido,art.descripcion + ' - m2 ' + @textoformula as descripcion,cast(@cantidadtejido as decimal(12,2)) as cantidad,cast(@importe / @cantidadtejido as decimal(12,2)) as precio,cast(@importe as decimal(12,2)) as total from SOL_TARIFAS_SIMULATE cab
			inner join SOL_ARTICULOS_TEJIDOS_GRUPOS art on art.idrow = cab.grupo
			where cab.idrow=@tarifa 
		end
	end

	if @type = -1 and  @tipoproducto = 3
	begin 
	
	set @textoformula = 'Alto ' + convert(nvarchar,cast((@alto*100 + 5.5) as decimal(18,2))) + ' * ' + str(dbo.fn_Vertical_numLamas(@ancho,@criterio)) +' lamas / 100'
	set @cantidad = (dbo.fn_solarmanes_precio_tejido_vertical_alto(@ancho,100*@alto,@criterio,@margen,@preciom2,1))


	set @importe = (dbo.fn_solarmanes_precio_tejido_vertical(@ancho,100*@alto,@criterio,@margen,@preciom2,1))
	if @importe is null set @importe = 0

	if @grupotejido = 0
	begin
		select  cab.tejido,art.descripcion + ' - ml ' + @textoformula  as descripcion,cast(@cantidad as decimal(12,2)) as cantidad,cast(@importe / @cantidad as decimal(12,2)) as precio,cast(@importe as decimal(12,2)) as total from SOL_TARIFAS_SIMULATE cab
		inner join SOL_ARTICULOS_TEJIDOS art on art.idrow = cab.tejido
		where cab.idrow=@tarifa 
	end

	if @grupotejido = 1
	begin
		select  cab.tejido,art.descripcion + ' - ml ' + @textoformula  as descripcion,cast(@cantidad as decimal(12,2)) as cantidad,cast(@importe / @cantidad as decimal(12,2)) as precio,cast(@importe as decimal(12,2)) as total from SOL_TARIFAS_SIMULATE cab
		inner join SOL_ARTICULOS_TEJIDOS_GRUPOS art on art.idrow = cab.grupo
		where cab.idrow=@tarifa 
	end
	
	end

	---Unitarios
	if @type = -2
	begin 
		select  lin.articulo,lin.descripcion + CHAR(10) + cast(cast(lin.cantidad as decimal(12,2)) as nvarchar(10)) + ' ' + [dbo].[fn_Tipo_unidad_Articulo](art.UNIDAD1) + CHAR(10) + 'P.Coste = ' + cast(cast(lin.precio as decimal(12,2)) as nvarchar(10)) + '€ * Margen = ' + cast(cast(lin.mmeca as decimal(12,2)) as nvarchar(10))    as descripcion,lin.cantidad,@margen2*lin.precio2 as precio,cast(lin.cantidad*@margen2*lin.precio2 as decimal(12,2)) as total from SOL_TARIFAS_SIMULATE_LINES lin
		inner join articulos art on art.idrow = lin.articulo
		where lin.idrow=@tarifa and lin.unidad in (1,4,5) and isnull(art.vertical,0)=0 and  isnull(art.tipocalculo,0) < 7
	end
	---Liniales
	if @type = -3
	begin 
		select  lin.articulo,lin.descripcion + CHAR(10) + cast(cast(0.01*@ancho as decimal(12,2)) as nvarchar(10)) + ' ancho * ' + cast(cast(lin.cantidad  as decimal(12,2)) as nvarchar(10)) + case when lin.k is null then '' else ' + ' + cast(cast(lin.k as decimal(12,2)) as nvarchar(10)) + ' de K' end + ' ' + [dbo].[fn_Tipo_unidad_Articulo](art.UNIDAD1) + CHAR(10) + ' * P.Coste = ' + cast(cast(lin.precio as decimal(12,2)) as nvarchar(10)) + '€ * Margen = ' + cast(cast(lin.mmeca as decimal(12,2)) as nvarchar(10))   as descripcion,case when lin.k is null then lin.cantidad * (0.01*@ancho) else (lin.cantidad * (0.01*@ancho)) + lin.k end as cantidad,lin.precio2 -isnull(lin.dto,0) as precio,cast((case when lin.k is null then lin.cantidad * (0.01*@ancho) else (lin.cantidad * (0.01*@ancho)) + lin.k end*@margen2*lin.precio2)  as decimal(12,2)) as total from SOL_TARIFAS_SIMULATE_LINES lin
		inner join articulos art on art.idrow = lin.articulo
		where lin.idrow=@tarifa and lin.unidad in (3) and (desde<=@ancho and @ancho <= hasta) and isnull(art.vertical,0)=0 and  isnull(art.tipocalculo,0) < 7
	end
	---Montaje
	if @type = -4
	begin 
		select 'Montaje ' + CHAR(10) + cast(cast(isnull(tiempo,0) as decimal(12,2)) as nvarchar(10)) + ' minutos ' + CHAR(10) + 'P.Coste = ' + cast(cast(@preciomontaje as decimal(12,2)) as nvarchar(10)) + '€ * Margen = ' + cast(cast(case when @tipoproducto = 3 then 1.45 else @margen end as decimal(12,2)) as nvarchar(10))  as descripcion, isnull(tiempo,0) as cantidad, @preciomontaje*case when @tipoproducto = 3 then 1.45 else @margen end as precio,isnull(tiempo*(@preciomontaje*case when @tipoproducto = 3 then 1.45 else @margen end),0) as total from SOL_TARIFAS_SIMULATE_TIMES where idrow=@tarifa and (desde<=@ancho and @ancho<=hasta)
	end
	---Verticales
	if @type = -5
	begin
		select  lin.articulo,lin.descripcion + CHAR(10) + cast(cast(@alto as decimal(12,2)) as nvarchar(10)) + ' alto * ' + cast(cast(lin.cantidad as decimal(12,2)) as nvarchar(10)) + ' ' + [dbo].[fn_Tipo_unidad_Articulo](art.UNIDAD1) + CHAR(10) + 'P.Coste = ' + cast(cast(lin.precio as decimal(12,2)) as nvarchar(10)) + '€ * Margen = ' + cast(cast(lin.mmeca as decimal(12,2)) as nvarchar(10))  as descripcion,lin.cantidad * @alto as cantidad,lin.precio2 as precio,cast(lin.cantidad*@margen2*lin.precio2*@alto as decimal(12,2)) as total from SOL_TARIFAS_SIMULATE_LINES lin
		inner join articulos art on art.idrow = lin.articulo
		where lin.idrow=@tarifa and isnull(art.vertical,0)=1
	end
	---Peso
	if @type = -6
	begin 
		select 'Peso' as descripcion,  dbo.fn_solarmanes_peso_tejido_valor(@tarifa,0.01*@ancho,@alto + 0.25,@densidad) as cantidad,@margen2 * @margen as precio,   @margen2 * (@margen*dbo.fn_solarmanes_peso_tejido_valor(@tarifa,0.01*@ancho,@alto + 0.25,@densidad)) as total from SOL_TARIFAS_SIMULATE_LINES where idrow=@tarifa and articulo between '6912' and '6913'
	end
	---embalajes
	if @type = -7
	begin 
		select descripcion + ' - m2 ' + CHAR(10) + 'precio ' + cast(cast(precio as decimal(12,2)) as nvarchar(10)) + '€ * (' + cast(cast(0.01*@ancho as decimal(12,2)) as nvarchar(10)) + ' ancho + 0.3) * ' + cast(cast(case when articulo = '6912' then 0.755 else 0.615 end as decimal(12,3)) as nvarchar(10)) + ' * Margen = ' + cast(cast(@margen as decimal(12,2)) as nvarchar(20)) as descripcion,  cantidad,  precio,precio*(0.01*@ancho + 0.3)  * case when articulo = '6912' then 0.755 else 0.615 end * @margen as total from SOL_TARIFAS_SIMULATE_LINES where idrow=@tarifa and articulo between '6912' and '6913'
	end
	---catidad X Ancho
	if @type = -8
	begin 
		select  lin.articulo,lin.descripcion + ' - ' + [dbo].[fn_Tipo_unidad_Articulo](art.UNIDAD1) + ' ' + syntaxis as descripcion,case when  (select data from dbo.AEB_string_to_table_linear(syntaxis,';') where pos = 1) * round((@ancho / (select data from dbo.AEB_string_to_table_linear(syntaxis,';') where pos = 2)),0,0) < (select data from dbo.AEB_string_to_table_linear(syntaxis,';') where pos = 3) 
		then (select data from dbo.AEB_string_to_table_linear(syntaxis,';') where pos = 3) 
		else (select data from dbo.AEB_string_to_table_linear(syntaxis,';') where pos = 1) * round((@ancho / (select data from dbo.AEB_string_to_table_linear(syntaxis,';') where pos = 2)),0,0) end  as cantidad
		,cast(lin.precio2 as decimal(12,4)) as precio,cast(case when  (select data from dbo.AEB_string_to_table_linear(syntaxis,';') where pos = 1) * round((@ancho / (select data from dbo.AEB_string_to_table_linear(syntaxis,';') where pos = 2)),0,0) < (select data from dbo.AEB_string_to_table_linear(syntaxis,';') where pos = 3) 
		then (select data from dbo.AEB_string_to_table_linear(syntaxis,';') where pos = 3) 
		else (select data from dbo.AEB_string_to_table_linear(syntaxis,';') where pos = 1) * round((@ancho / (select data from dbo.AEB_string_to_table_linear(syntaxis,';') where pos = 2)),0,0) end*lin.precio2 as decimal(12,2))  as total from SOL_TARIFAS_SIMULATE_LINES lin
		inner join articulos art on art.idrow = lin.articulo
		where lin.idrow=@tarifa and unidad in (1,4,5) and  isnull(art.tipocalculo,0) = 7
		
	end
	---Monetario
	if @type = -9
	begin 
		select  lin.articulo,lin.descripcion +   CHAR(10) + cast(cast(k as decimal(12,2)) as nvarchar(10)) + ' ' + [dbo].[fn_Tipo_unidad_Articulo](art.UNIDAD1) + CHAR(10) + 'P.Coste = ' + cast(cast(precio as decimal(12,2)) as nvarchar(10)) + '€ * Margen = ' + cast(cast(@margen as decimal(12,2)) as nvarchar(10))  as descripcion,lin.k as cantidad,lin.precio2 as precio,cast(k*lin.precio2 as decimal(12,2)) as total from SOL_TARIFAS_SIMULATE_LINES lin
		inner join articulos art on art.idrow = lin.articulo
		where lin.idrow=@tarifa and isnull(k,0)>0
	end

	---portatela y pletina
	if @type = -10
	begin 
		select  lin.articulo,lin.descripcion + ' - ' + [dbo].[fn_Tipo_unidad_Articulo](art.UNIDAD1) + ' ' + syntaxis as descripcion,
		round(((@ancho / (select data from dbo.AEB_string_to_table_linear(syntaxis,';') where pos = 1)) + (select data from dbo.AEB_string_to_table_linear(syntaxis,';') where pos = 2)) * (select data from dbo.AEB_string_to_table_linear(syntaxis,';') where pos = 1),0,0)
		as cantidad,
		cast(lin.precio2 / (lin.cantidad * 100) as decimal(12,4)) as precio,
		cast(round(((@ancho / (select data from dbo.AEB_string_to_table_linear(syntaxis,';') where pos = 1)) + (select data from dbo.AEB_string_to_table_linear(syntaxis,';') where pos = 2)) * (select data from dbo.AEB_string_to_table_linear(syntaxis,';') where pos = 1),0,0)  * (lin.precio2 / (lin.cantidad * 100)) as decimal(12,2))   as total
		 from SOL_TARIFAS_SIMULATE_LINES lin
		inner join articulos art on art.idrow = lin.articulo
		where lin.idrow=@tarifa and isnull(art.tipocalculo,0) = 8
		
	end

end
go
