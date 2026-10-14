
CREATE procedure [dbo].[sp_simulate_table_details]
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

	if @tipoproducto = 1
		set @c01 = @alto + 0.25

	if @tipoproducto = 2
	begin
		set @c01 = @alto 
	end

	 select @unitarios = ISNULL(sum(lin.cantidad*lin.precio2),0) from SOL_TARIFAS_SIMULATE_LINES lin
	inner join articulos art on art.idrow = lin.articulo
	where lin.idrow=@tarifa and lin.unidad in (1,4,5) and isnull(art.vertical,0)=0 and  isnull(art.tipocalculo,0) < 7

	select @verticales = ISNULL(sum(cantidad*precio2),0) from SOL_TARIFAS_SIMULATE_LINES where idrow=@tarifa and articulo in (select idrow from articulos where isnull(vertical,0)=1)
	select @monetarios = isnull(sum(k*precio2),0) from SOL_TARIFAS_SIMULATE_LINES where idrow=@tarifa and isnull(k,0)>0

	---AYT
	--- por lo tipos de producto vamos a la funcion de precio y medidas
	--- el tipo 3 es vertical. de momento el resto como enrollable (1)
	if @tipoproducto = 3   
	begin
		set @t_tejido     = @margen2 *(dbo.fn_solarmanes_precio_tejido_vertical(@ancho,100*@alto,@criterio,@margen,@preciom2,1))
	end

	if @tipoproducto = 2  
	begin
		set @t_tejido = @margen2*0.01*@ancho*(@alto+0.055)*@preciom2*@margen
	end

	if @tipoproducto not in (2,3)
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

		set @value = @t_tejido + @t_unitarios + @t_lineales + @t_montaje + @t_peso + @t_verticales + @t_embalaje + @t_tipo7 + @t_monetarios

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

