/* =====================================================================
   14 - sp_simulate_table_details (rama honeyComb_tarifas)
   Desglose de una casilla del mapa. Hallazgo 4: debe sumar lo mismo que el
   bloque 10 de sp_solarmanes_precio_tejido_tabla_tarifa.
   - HoneyComb (tipoproducto 7): alto 0,40 + 0,20*fila, c01 = tejido plegado
     y tejido con fn_solarmanes_precio_tejido_honeycomb.
   - c01 como en el mapa: +0,25 (1 y 5), +0,055 (2 y 3). Antes 2 iba sin
     suplemento y 3/5 quedaban en NULL (peso a NULL).
   - Tejido como en el mapa: panel con fn_solarmanes_precio_tejido y noche y
     día con fn_solarmanes_precio_tejido_nyd.
   - Monetarios sin el filtro k > 0, como en el mapa.
   Línea blanca (4) no se toca: su mapa sale de otro SP (hallazgo 3).
   2026-10-15: HoneyComb devuelve los importes sin redondear (cuadran con el
   mapa y con el desglose de cada concepto, script 16).
   Copia anterior en backup/.
   ===================================================================== */
set ansi_nulls on
go
set quoted_identifier on
go

alter procedure [dbo].[sp_simulate_table_details]
(
  @tarifa int,
  @rowindex int,
  @colindex int
)
as
begin

	declare @x int
	declare @y int
	declare @t_tejido decimal(12,2)
	declare @t_unitarios decimal(12,2)
	declare @t_lineales decimal(12,2)
	declare @t_montaje decimal(12,2)
	declare @t_peso decimal(12,2)
	declare @t_verticales decimal(12,2)
	declare @t_embalaje decimal(12,2) 
	declare @t_tipo7 decimal(12,2) 
	declare @t_monetarios decimal(12,2) 
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
	declare @pletina decimal(12,4)

	declare @ancho decimal(12,4)
	declare @alto decimal(12,4)
	declare @c01 decimal(12,2)
	declare @value decimal(12,2)


	 select @preciomontaje = ISNULL(preciomontaje,0),
			@criterio	   = criterio,
			@margen        = margen1,
			@margen2       = margen2,
			@preciom2      = preciom2,
			@densidad      = densidad,
			@tipoproducto  = tipoproducto from SOL_TARIFAS_SIMULATE where idrow=@tarifa


	if @tipoproducto = 3
	begin
		set @x = 20*@colindex
		set @y = 100 + 10*@rowindex
	end
	else
	if @tipoproducto = 2
	begin
		set @x = 20*@colindex
		set @y = 60 + 20*@rowindex
	end
	else
	if @tipoproducto = 7
	begin
		set @x = 20*@colindex
		set @y = 40 + 20*@rowindex
	end
	else
	begin
		set @x = 20*@colindex
		set @y = 20*(3+@rowindex)
	end

	
	set @ancho = @x
	set @alto =  0.01*@y

	/*
	select 'ANCHO=' + cast(@ancho as varchar)
	select 'ALTO=' + cast(@alto as varchar)
	select 'TIPO PRODUCTO=' + cast(@tipoproducto as varchar)
	*/

	/* c01 igual que en el mapa (sp_solarmanes_precio_tejido_tabla_tarifa) */
	if @tipoproducto in (1,5)
		set @c01 = @alto + 0.25

	if @tipoproducto in (2,3)
		set @c01 = @alto + 0.055

	if @tipoproducto = 7
		set @c01 = 0.01*dbo.fn_fabricacion_tabla_valor('HONEYCOMB', 'ALTO_PLIEGUES', 100*@alto)

	 select @unitarios = ISNULL(sum(lin.cantidad*lin.precio2),0) from SOL_TARIFAS_SIMULATE_LINES lin
	inner join articulos art on art.idrow = lin.articulo
	where lin.idrow=@tarifa and lin.unidad in (1,4,5) and isnull(art.vertical,0)=0 and  isnull(art.tipocalculo,0) < 7

	select @verticales = ISNULL(sum(cantidad*precio2),0) from SOL_TARIFAS_SIMULATE_LINES where idrow=@tarifa and articulo in (select idrow from articulos where isnull(vertical,0)=1)
	select @monetarios = isnull(sum(k*precio2),0) from SOL_TARIFAS_SIMULATE_LINES where idrow=@tarifa

	---AYT
	--- por lo tipos de producto vamos a la funcion de precio y medidas
	--- el tipo 3 es vertical. de momento el resto como enrollable (1)
	if @tipoproducto = 3   
	begin
		set @t_tejido     = @margen2 *(dbo.fn_solarmanes_precio_tejido_vertical(@ancho,100*@alto,@criterio,@margen,@preciom2,1))
	end

	if @tipoproducto = 5
	begin
		set @t_tejido = @margen2 *(dbo.fn_solarmanes_precio_tejido_nyd(@ancho,100*@alto,@criterio,@margen,@preciom2,1))
	end

	if @tipoproducto = 7
	begin
		set @t_tejido = @margen2 *(dbo.fn_solarmanes_precio_tejido_honeycomb(@ancho,100*@alto,@margen,@preciom2))
	end

	if @tipoproducto not in (3,5,7)
	begin
		set @t_tejido = @margen2 *(dbo.fn_solarmanes_precio_tejido(@ancho,100*@alto,@criterio,@margen,@preciom2,1))
	end


	

		set @t_unitarios  = @margen2 * (@unitarios)
		set @t_lineales   = @margen2 * (dbo.fn_Tarifa_Lineales(@tarifa,@ancho))
		set @t_montaje    = @margen2 * (dbo.fn_precio_tarifa_montaje(@tarifa,@ancho,@preciomontaje,case when @tipoproducto = 3 then 1.45 else @margen end) )
		set @t_peso       = @margen2 * (@margen*dbo.fn_solarmanes_peso_tejido_valor(@tarifa,0.01*@ancho,@c01,@densidad))
		set @t_verticales = @margen2 * (@verticales*@alto)
		set @t_embalaje   = dbo.temp_fn_precio_tarifa_embalaje(@tarifa,@ancho,1)
		set @t_tipo7      = dbo.fn_solarmanes_precio_articulos_tipo_7(@tarifa,@ancho,@c01) 
		set @t_monetarios = @monetarios
		set @pletina      = dbo.fn_solarmanes_precio_articulos_tipo_8(@tarifa,@ancho,@c01) 

		set @value = @t_tejido + @t_unitarios + @t_lineales + @t_montaje + @t_peso + @t_verticales + @t_embalaje + @t_tipo7 + @t_monetarios + @pletina

		/* HoneyComb (2026-10-15): importes sin redondear. La pantalla redondea al mostrar, así la suma de
		   los conceptos es la casilla del mapa y cada concepto la suma de su desglose
		   (sp_simulate_table_details_articles, script 16). El resto de productos sigue igual. */
		if @tipoproducto = 7
		begin
			declare @hc_conceptos table(articulo int, descripcion varchar(50), precio decimal(18,6))
			insert into @hc_conceptos(articulo, descripcion, precio) values
			(-1, 'Tejido', isnull(@margen2 * dbo.fn_solarmanes_precio_tejido_honeycomb(@ancho,100*@alto,@margen,@preciom2),0)),
			(-2, 'Unitarios', isnull(@margen2 * @unitarios,0)),
			(-3, 'Lineales', isnull(@margen2 * dbo.fn_Tarifa_Lineales(@tarifa,@ancho),0)),
			(-4, 'Montaje', isnull(@margen2 * dbo.fn_precio_tarifa_montaje(@tarifa,@ancho,@preciomontaje,@margen),0)),
			(-5, 'Verticales', isnull(@margen2 * @verticales * @alto,0)),
			(-6, 'Peso', isnull(@margen2 * @margen * dbo.fn_solarmanes_peso_tejido_valor(@tarifa,0.01*@ancho,@c01,@densidad),0)),
			(-7, 'Embalajes', isnull(dbo.temp_fn_precio_tarifa_embalaje(@tarifa,@ancho,1),0)),
			(-8, 'Cantidad por Ancho', isnull(dbo.fn_solarmanes_precio_articulos_tipo_7(@tarifa,@ancho,@c01),0)),
			(-9, 'Monetarios', isnull(@monetarios,0)),
			(-10, 'Portatela y Pletina', isnull(dbo.fn_solarmanes_precio_articulos_tipo_8(@tarifa,@ancho,@c01),0))

			delete from sol_tarifas_simulate_table_details where idrow=@tarifa and x=@ancho and y=100*@alto
			insert into sol_tarifas_simulate_table_details(idrow,x,y,articulo,descripcion,cantidad,precio)
			select @tarifa, @ancho, 100*@alto, articulo, descripcion, 1, precio from @hc_conceptos

			select articulo, descripcion, cast(1 as decimal(12,6)) as cantidad, cast(precio as decimal(18,6)) as precio, cast(precio as decimal(18,6)) as total
			from @hc_conceptos order by articulo desc
			return
		end

		set @alto = 100*@alto
		delete from sol_tarifas_simulate_table_details where idrow=@tarifa and x=@ancho and y=@alto
		insert into sol_tarifas_simulate_table_details(idrow,x,y,articulo,descripcion,cantidad,precio) values(@tarifa,@ancho,@alto,-1,'Tejido',1,isnull(@t_tejido,0))
		insert into sol_tarifas_simulate_table_details(idrow,x,y,articulo,descripcion,cantidad,precio) values(@tarifa,@ancho,@alto,-2,'Unitarios',1,isnull(@t_unitarios,0))
		insert into sol_tarifas_simulate_table_details(idrow,x,y,articulo,descripcion,cantidad,precio) values(@tarifa,@ancho,@alto,-3,'Lineales',1,isnull(@t_lineales,0))
		insert into sol_tarifas_simulate_table_details(idrow,x,y,articulo,descripcion,cantidad,precio) values(@tarifa,@ancho,@alto,-4,'Montaje',1,isnull(@t_montaje,0))
		insert into sol_tarifas_simulate_table_details(idrow,x,y,articulo,descripcion,cantidad,precio) values(@tarifa,@ancho,@alto,-5,'Verticales',1,isnull(@t_verticales,0))
		insert into sol_tarifas_simulate_table_details(idrow,x,y,articulo,descripcion,cantidad,precio) values(@tarifa,@ancho,@alto,-6,'Peso',1,isnull(@t_peso,0))
		insert into sol_tarifas_simulate_table_details(idrow,x,y,articulo,descripcion,cantidad,precio) values(@tarifa,@ancho,@alto,-7,'Embalajes',1,isnull(@t_embalaje,0))
		insert into sol_tarifas_simulate_table_details(idrow,x,y,articulo,descripcion,cantidad,precio) values(@tarifa,@ancho,@alto,-8,'Cantidad por Ancho',1,isnull(@t_tipo7,0))
		insert into sol_tarifas_simulate_table_details(idrow,x,y,articulo,descripcion,cantidad,precio) values(@tarifa,@ancho,@alto,-9,'Monetarios',1,isnull(@t_monetarios,0))
		insert into sol_tarifas_simulate_table_details(idrow,x,y,articulo,descripcion,cantidad,precio) values(@tarifa,@ancho,@alto,-10,'Portatela y Pletina',1,isnull(@pletina,0))

		select top 100 articulo,descripcion,cantidad,cast(precio as decimal(12,4)) as precio,cast(total as decimal(12,2)) as total from sol_tarifas_simulate_table_details 
		where idrow=@tarifa and x=@x and y=@y order by articulo desc


end

go
