
CREATE PROCEDURE [dbo].[sp_solarmanes_precio_tejido_tabla_tarifa]
(
 @tarifa int,
 @bloque int,
 @dest int = 0,
 @tipo int = 1,
 @id int = -1
)
as
begin

set nocount on

declare @miny decimal(12,2)
declare @maxy decimal(12,2)

select @miny = miny, @maxy = maxy from SOL_TARIFAS_EXPORTACION where idrow=@tipo

declare @table table 
(c00 decimal(12,2),c01 decimal(12,3),c02 decimal(12,2),c03 decimal(12,2),c04 decimal(12,2),c05 decimal(12,2),c06 decimal(12,2),c07 decimal(12,2),c08 decimal(12,2),c09 decimal(12,2),
 c10 decimal(12,2),c11 decimal(12,2),c12 decimal(12,2),c13 decimal(12,2),c14 decimal(12,2),c15 decimal(12,2),c16 decimal(12,2),c17 decimal(12,2),c18 decimal(12,2),c19 decimal(12,2),
 c20 decimal(12,2),c21 decimal(12,2),c22 decimal(12,2),c23 decimal(12,2),c24 decimal(12,2),c25 decimal(12,2),c26 decimal(12,2),c27 decimal(12,2),c28 decimal(12,2),c29 decimal(12,2),
 c30 decimal(12,2),c31 decimal(12,2),c32 decimal(12,2))

 declare @c00 decimal(12,2)
 declare @c01 decimal(12,3)
 declare @c02 decimal(12,2)
 declare @c03 decimal(12,2)
 declare @c04 decimal(12,2)
 declare @c05 decimal(12,2)
 declare @c06 decimal(12,2)
 declare @c07 decimal(12,2)
 declare @c08 decimal(12,2)
 declare @c09 decimal(12,2)
 declare @c10 decimal(12,2)
 declare @c11 decimal(12,2)
 declare @c12 decimal(12,2)
 declare @c13 decimal(12,2)
 declare @c14 decimal(12,2)
 declare @c15 decimal(12,2)
 declare @c16 decimal(12,2)
 declare @c17 decimal(12,2)
 declare @c18 decimal(12,2)
 declare @c19 decimal(12,2)
 declare @c20 decimal(12,2)
 declare @c21 decimal(12,2)
 declare @c22 decimal(12,2)
 declare @c23 decimal(12,2)
 declare @c24 decimal(12,2)
 declare @c25 decimal(12,2)
 declare @c26 decimal(12,2)
 declare @c27 decimal(12,2)
 declare @c28 decimal(12,2)
 declare @c29 decimal(12,2)
 declare @c30 decimal(12,2)
 declare @c31 decimal(12,2)
 declare @c32 decimal(12,2)
 

 /*
	25.02.2020 - INCREMENTOS UNITARIOS
 */
 declare @unitarios decimal(12,4)
 declare @verticales decimal(12,4)
 declare @metrolineal decimal(12,4)
 declare @preciomontaje decimal(12,4)
 declare @criterio int = 180
 declare @margen decimal(12,4) = 1
 declare @margen2 decimal(12,4) = 1
 declare @preciom2 decimal(12,4) = 1
 declare @densidad decimal(12,3) = 0.330

 declare @monetarios decimal(12,4)
 declare @tipoproducto int
 declare @pymax int

 /* 23.04.2026 Tipos de Productos
	1.- ENROLLABLES
	2.- PANELES JAPONESES
	3.- VERTICALES
	4.- LINEA BLANCA
	5.- NOCHE Y DIA
 */

 select @preciomontaje = ISNULL(preciomontaje,0),@criterio = criterio,@margen = margen1,@margen2 = margen2,@preciom2 = preciom2,
 @tipoproducto = tipoproducto from SOL_TARIFAS_SIMULATE where idrow=@tarifa

 if @tipoproducto = 4
 begin
	execute sp_solarmanes_precio_tejido_tabla_tarifa_lineablanca @tarifa,@bloque,@dest,@tipo,@id
	return 1
 end


 /* CALCULO DE LOS UNITARIOS */
 select @unitarios = ISNULL(sum(lin.cantidad*lin.precio2),0) from SOL_TARIFAS_SIMULATE_LINES lin
inner join articulos art on art.idrow = lin.articulo
where lin.idrow=@tarifa and lin.unidad in (1,4,5) and isnull(art.vertical,0)=0 and  isnull(art.tipocalculo,0) < 7


 select @verticales = ISNULL(sum(cantidad*precio2),0) from SOL_TARIFAS_SIMULATE_LINES where idrow=@tarifa and articulo in (select idrow from articulos where isnull(vertical,0)=1)
 select @monetarios = isnull(sum(k*precio2),0) from SOL_TARIFAS_SIMULATE_LINES where idrow=@tarifa --and isnull(k,0)>0

 declare @alto decimal(12,4)
 declare @px integer = 1

 if @tipoproducto = 1 set @pymax = 28
 if @tipoproducto = 2 set @pymax = 28
 if @tipoproducto = 3 set @pymax = 31
 if @tipoproducto = 5 set @pymax = 13

 
	declare @py integer = 0

	while @py < @pymax
	begin
			set @c02 = 0 
			set @c03 = 0
			set @c04 = 0 
			set @c05 = 0
			set @c06 = 0
			set @c07 = 0
			set @c08 = 0
			set @c09 = 0
			set @c10 = 0
			set @c11 = 0
			set @c12 = 0
			set @c13 = 0
			set @c14 = 0
			set @c15 = 0
			set @c16 = 0 
			set @c17 = 0
			set @c18 = 0
			set @c19 = 0
			set @c20 = 0 
			set @c21 = 0 
			set @c22 = 0
			set @c23 = 0
			set @c24 = 0
			set @c25 = 0
			set @c26 = 0
			set @c27 = 0 
			set @c28 = 0 
			set @c29 = 0 
			set @c30 = 0
			set @c31 = 0
			set @c32 = 0


		if @tipoproducto = 1 or @tipoproducto = 5
		begin
			set @alto = 0.2*(3+@py)
			set @c00 = @alto
			set @c01 = @alto + 0.25
		end

		if @tipoproducto = 2 
		begin
			set @alto = 0.2*(3+@py)
			set @c00 = @alto
			set @c01 = @alto + 0.055
		end

		
		
		if @tipoproducto = 3
		begin
			set @alto = 0.1*@py + 1
			set @c00 = @alto
			set @c01 = @alto + 0.055
		end


		/* MAPA TEJIDO */
		if @bloque = 1
		begin
			if @tipoproducto = 1
			begin
				set @c02 = dbo.fn_solarmanes_precio_tejido(40.0,100*@alto,@criterio,@margen,@preciom2,1) 
				set @c03 = dbo.fn_solarmanes_precio_tejido(60.0,100*@alto,@criterio,@margen,@preciom2,1)
				set @c04 = dbo.fn_solarmanes_precio_tejido(80.0,100*@alto,@criterio,@margen,@preciom2,1) 
				set @c05 = dbo.fn_solarmanes_precio_tejido(100.0,100*@alto,@criterio,@margen,@preciom2,1)
				set @c06 = dbo.fn_solarmanes_precio_tejido(120.0,100*@alto,@criterio,@margen,@preciom2,1)
				set @c07 = dbo.fn_solarmanes_precio_tejido(140.0,100*@alto,@criterio,@margen,@preciom2,1) 
				set @c08 = dbo.fn_solarmanes_precio_tejido(160.0,100*@alto,@criterio,@margen,@preciom2,1)
				set @c09 = dbo.fn_solarmanes_precio_tejido(180.0,100*@alto,@criterio,@margen,@preciom2,1) 
				set @c10 = dbo.fn_solarmanes_precio_tejido(200.0,100*@alto,@criterio,@margen,@preciom2,1)
				set @c11 = dbo.fn_solarmanes_precio_tejido(220.0,100*@alto,@criterio,@margen,@preciom2,1)
				set @c12 = dbo.fn_solarmanes_precio_tejido(240.0,100*@alto,@criterio,@margen,@preciom2,1)
				set @c13 = dbo.fn_solarmanes_precio_tejido(260.0,100*@alto,@criterio,@margen,@preciom2,1) 
				set @c14 = dbo.fn_solarmanes_precio_tejido(280.0,100*@alto,@criterio,@margen,@preciom2,1)
				set @c15 = dbo.fn_solarmanes_precio_tejido(300.0,100*@alto,@criterio,@margen,@preciom2,1)
				set @c16 = dbo.fn_solarmanes_precio_tejido(320.0,100*@alto,@criterio,@margen,@preciom2,1) 
				set @c17 = dbo.fn_solarmanes_precio_tejido(340.0,100*@alto,@criterio,@margen,@preciom2,1)
				set @c18 = dbo.fn_solarmanes_precio_tejido(360.0,100*@alto,@criterio,@margen,@preciom2,1)
				set @c19 = dbo.fn_solarmanes_precio_tejido(380.0,100*@alto,@criterio,@margen,@preciom2,1)
				set @c20 = dbo.fn_solarmanes_precio_tejido(400.0,100*@alto,@criterio,@margen,@preciom2,1) 
				set @c21 = dbo.fn_solarmanes_precio_tejido(420.0,100*@alto,@criterio,@margen,@preciom2,1) 
				set @c22 = dbo.fn_solarmanes_precio_tejido(440.0,100*@alto,@criterio,@margen,@preciom2,1) 
				set @c23 = dbo.fn_solarmanes_precio_tejido(460.0,100*@alto,@criterio,@margen,@preciom2,1)
				set @c24 = dbo.fn_solarmanes_precio_tejido(480.0,100*@alto,@criterio,@margen,@preciom2,1)
				set @c25 = dbo.fn_solarmanes_precio_tejido(500.0,100*@alto,@criterio,@margen,@preciom2,1)
				set @c26 = dbo.fn_solarmanes_precio_tejido(520.0,100*@alto,@criterio,@margen,@preciom2,1)
				set @c27 = dbo.fn_solarmanes_precio_tejido(540.0,100*@alto,@criterio,@margen,@preciom2,1) 
				set @c28 = dbo.fn_solarmanes_precio_tejido(560.0,100*@alto,@criterio,@margen,@preciom2,1) 
				set @c29 = dbo.fn_solarmanes_precio_tejido(580.0,100*@alto,@criterio,@margen,@preciom2,1) 
				set @c30 = dbo.fn_solarmanes_precio_tejido(600.0,100*@alto,@criterio,@margen,@preciom2,1)
				set @c31 = 0
				set @c32 = 0
			end

			if @tipoproducto = 2
			begin
				set @c02 = dbo.fn_solarmanes_precio_tejido(40.0,100*@alto,@criterio,@margen,@preciom2,1) 
				set @c03 = dbo.fn_solarmanes_precio_tejido(60.0,100*@alto,@criterio,@margen,@preciom2,1)
				set @c04 = dbo.fn_solarmanes_precio_tejido(80.0,100*@alto,@criterio,@margen,@preciom2,1) 
				set @c05 = dbo.fn_solarmanes_precio_tejido(100.0,100*@alto,@criterio,@margen,@preciom2,1)
				set @c06 = dbo.fn_solarmanes_precio_tejido(120.0,100*@alto,@criterio,@margen,@preciom2,1)
				set @c07 = dbo.fn_solarmanes_precio_tejido(140.0,100*@alto,@criterio,@margen,@preciom2,1) 
				set @c08 = dbo.fn_solarmanes_precio_tejido(160.0,100*@alto,@criterio,@margen,@preciom2,1)
				set @c09 = dbo.fn_solarmanes_precio_tejido(180.0,100*@alto,@criterio,@margen,@preciom2,1) 
				set @c10 = dbo.fn_solarmanes_precio_tejido(200.0,100*@alto,@criterio,@margen,@preciom2,1)
				set @c11 = dbo.fn_solarmanes_precio_tejido(220.0,100*@alto,@criterio,@margen,@preciom2,1)
				set @c12 = dbo.fn_solarmanes_precio_tejido(240.0,100*@alto,@criterio,@margen,@preciom2,1)
				set @c13 = dbo.fn_solarmanes_precio_tejido(260.0,100*@alto,@criterio,@margen,@preciom2,1) 
				set @c14 = dbo.fn_solarmanes_precio_tejido(280.0,100*@alto,@criterio,@margen,@preciom2,1)
				set @c15 = dbo.fn_solarmanes_precio_tejido(300.0,100*@alto,@criterio,@margen,@preciom2,1)
				set @c16 = dbo.fn_solarmanes_precio_tejido(320.0,100*@alto,@criterio,@margen,@preciom2,1) 
				set @c17 = dbo.fn_solarmanes_precio_tejido(340.0,100*@alto,@criterio,@margen,@preciom2,1)
				set @c18 = dbo.fn_solarmanes_precio_tejido(360.0,100*@alto,@criterio,@margen,@preciom2,1)
				set @c19 = dbo.fn_solarmanes_precio_tejido(380.0,100*@alto,@criterio,@margen,@preciom2,1)
				set @c20 = dbo.fn_solarmanes_precio_tejido(400.0,100*@alto,@criterio,@margen,@preciom2,1) 
				set @c21 = dbo.fn_solarmanes_precio_tejido(420.0,100*@alto,@criterio,@margen,@preciom2,1) 
				set @c22 = dbo.fn_solarmanes_precio_tejido(440.0,100*@alto,@criterio,@margen,@preciom2,1) 
				set @c23 = dbo.fn_solarmanes_precio_tejido(460.0,100*@alto,@criterio,@margen,@preciom2,1)
				set @c24 = dbo.fn_solarmanes_precio_tejido(480.0,100*@alto,@criterio,@margen,@preciom2,1)
				set @c25 = dbo.fn_solarmanes_precio_tejido(500.0,100*@alto,@criterio,@margen,@preciom2,1)
				set @c26 = dbo.fn_solarmanes_precio_tejido(520.0,100*@alto,@criterio,@margen,@preciom2,1)
				set @c27 = dbo.fn_solarmanes_precio_tejido(540.0,100*@alto,@criterio,@margen,@preciom2,1) 
				set @c28 = dbo.fn_solarmanes_precio_tejido(560.0,100*@alto,@criterio,@margen,@preciom2,1) 
				set @c29 = dbo.fn_solarmanes_precio_tejido(580.0,100*@alto,@criterio,@margen,@preciom2,1) 
				set @c30 = dbo.fn_solarmanes_precio_tejido(600.0,100*@alto,@criterio,@margen,@preciom2,1)
				set @c31 = 0
				set @c32 = 0
			end

			if @tipoproducto = 3
			begin
				set @c02 = dbo.fn_solarmanes_precio_tejido_vertical(40.0,100*@alto,@criterio,@margen,@preciom2,1) 
				set @c03 = dbo.fn_solarmanes_precio_tejido_vertical(60.0,100*@alto,@criterio,@margen,@preciom2,1)
				set @c04 = dbo.fn_solarmanes_precio_tejido_vertical(80.0,100*@alto,@criterio,@margen,@preciom2,1) 
				set @c05 = dbo.fn_solarmanes_precio_tejido_vertical(100.0,100*@alto,@criterio,@margen,@preciom2,1)
				set @c06 = dbo.fn_solarmanes_precio_tejido_vertical(120.0,100*@alto,@criterio,@margen,@preciom2,1)
				set @c07 = dbo.fn_solarmanes_precio_tejido_vertical(140.0,100*@alto,@criterio,@margen,@preciom2,1) 
				set @c08 = dbo.fn_solarmanes_precio_tejido_vertical(160.0,100*@alto,@criterio,@margen,@preciom2,1)
				set @c09 = dbo.fn_solarmanes_precio_tejido_vertical(180.0,100*@alto,@criterio,@margen,@preciom2,1) 
				set @c10 = dbo.fn_solarmanes_precio_tejido_vertical(200.0,100*@alto,@criterio,@margen,@preciom2,1)
				set @c11 = dbo.fn_solarmanes_precio_tejido_vertical(220.0,100*@alto,@criterio,@margen,@preciom2,1)
				set @c12 = dbo.fn_solarmanes_precio_tejido_vertical(240.0,100*@alto,@criterio,@margen,@preciom2,1)
				set @c13 = dbo.fn_solarmanes_precio_tejido_vertical(260.0,100*@alto,@criterio,@margen,@preciom2,1) 
				set @c14 = dbo.fn_solarmanes_precio_tejido_vertical(280.0,100*@alto,@criterio,@margen,@preciom2,1)
				set @c15 = dbo.fn_solarmanes_precio_tejido_vertical(300.0,100*@alto,@criterio,@margen,@preciom2,1)
				set @c16 = dbo.fn_solarmanes_precio_tejido_vertical(320.0,100*@alto,@criterio,@margen,@preciom2,1) 
				set @c17 = dbo.fn_solarmanes_precio_tejido_vertical(340.0,100*@alto,@criterio,@margen,@preciom2,1)
				set @c18 = dbo.fn_solarmanes_precio_tejido_vertical(360.0,100*@alto,@criterio,@margen,@preciom2,1)
				set @c19 = dbo.fn_solarmanes_precio_tejido_vertical(380.0,100*@alto,@criterio,@margen,@preciom2,1)
				set @c20 = dbo.fn_solarmanes_precio_tejido_vertical(400.0,100*@alto,@criterio,@margen,@preciom2,1) 
				set @c21 = dbo.fn_solarmanes_precio_tejido_vertical(420.0,100*@alto,@criterio,@margen,@preciom2,1) 
				set @c22 = dbo.fn_solarmanes_precio_tejido_vertical(440.0,100*@alto,@criterio,@margen,@preciom2,1) 
				set @c23 = dbo.fn_solarmanes_precio_tejido_vertical(460.0,100*@alto,@criterio,@margen,@preciom2,1)
				set @c24 = dbo.fn_solarmanes_precio_tejido_vertical(480.0,100*@alto,@criterio,@margen,@preciom2,1)
				set @c25 = dbo.fn_solarmanes_precio_tejido_vertical(500.0,100*@alto,@criterio,@margen,@preciom2,1)
				set @c26 = dbo.fn_solarmanes_precio_tejido_vertical(520.0,100*@alto,@criterio,@margen,@preciom2,1)
				set @c27 = dbo.fn_solarmanes_precio_tejido_vertical(540.0,100*@alto,@criterio,@margen,@preciom2,1) 
				set @c28 = dbo.fn_solarmanes_precio_tejido_vertical(560.0,100*@alto,@criterio,@margen,@preciom2,1) 
				set @c29 = dbo.fn_solarmanes_precio_tejido_vertical(580.0,100*@alto,@criterio,@margen,@preciom2,1) 
				set @c30 = dbo.fn_solarmanes_precio_tejido_vertical	(600.0,100*@alto,@criterio,@margen,@preciom2,1)
				set @c31 = 0
				set @c32 = 0
			end

			if @tipoproducto = 5
			begin
				set @c02 = dbo.fn_solarmanes_precio_tejido_nyd(40.0,100*@alto,@criterio,@margen,@preciom2,1) 
				set @c03 = dbo.fn_solarmanes_precio_tejido_nyd(60.0,100*@alto,@criterio,@margen,@preciom2,1)
				set @c04 = dbo.fn_solarmanes_precio_tejido_nyd(80.0,100*@alto,@criterio,@margen,@preciom2,1) 
				set @c05 = dbo.fn_solarmanes_precio_tejido_nyd(100.0,100*@alto,@criterio,@margen,@preciom2,1)
				set @c06 = dbo.fn_solarmanes_precio_tejido_nyd(120.0,100*@alto,@criterio,@margen,@preciom2,1)
				set @c07 = dbo.fn_solarmanes_precio_tejido_nyd(140.0,100*@alto,@criterio,@margen,@preciom2,1) 
				set @c08 = dbo.fn_solarmanes_precio_tejido_nyd(160.0,100*@alto,@criterio,@margen,@preciom2,1)
				set @c09 = dbo.fn_solarmanes_precio_tejido_nyd(180.0,100*@alto,@criterio,@margen,@preciom2,1) 
				set @c10 = dbo.fn_solarmanes_precio_tejido_nyd(200.0,100*@alto,@criterio,@margen,@preciom2,1)
				set @c11 = dbo.fn_solarmanes_precio_tejido_nyd(220.0,100*@alto,@criterio,@margen,@preciom2,1)
				set @c12 = dbo.fn_solarmanes_precio_tejido_nyd(240.0,100*@alto,@criterio,@margen,@preciom2,1)
				set @c13 = dbo.fn_solarmanes_precio_tejido_nyd(260.0,100*@alto,@criterio,@margen,@preciom2,1) 
				set @c14 = dbo.fn_solarmanes_precio_tejido_nyd(280.0,100*@alto,@criterio,@margen,@preciom2,1)
				set @c15 = dbo.fn_solarmanes_precio_tejido_nyd(300.0,100*@alto,@criterio,@margen,@preciom2,1)
				set @c16 = dbo.fn_solarmanes_precio_tejido_nyd(320.0,100*@alto,@criterio,@margen,@preciom2,1) 
				set @c17 = dbo.fn_solarmanes_precio_tejido_nyd(340.0,100*@alto,@criterio,@margen,@preciom2,1)
				set @c18 = dbo.fn_solarmanes_precio_tejido_nyd(360.0,100*@alto,@criterio,@margen,@preciom2,1)
				set @c19 = dbo.fn_solarmanes_precio_tejido_nyd(380.0,100*@alto,@criterio,@margen,@preciom2,1)
				set @c20 = dbo.fn_solarmanes_precio_tejido_nyd(400.0,100*@alto,@criterio,@margen,@preciom2,1) 
				set @c21 = dbo.fn_solarmanes_precio_tejido_nyd(420.0,100*@alto,@criterio,@margen,@preciom2,1) 
				set @c22 = dbo.fn_solarmanes_precio_tejido_nyd(440.0,100*@alto,@criterio,@margen,@preciom2,1) 
				set @c23 = dbo.fn_solarmanes_precio_tejido_nyd(460.0,100*@alto,@criterio,@margen,@preciom2,1)
				set @c24 = dbo.fn_solarmanes_precio_tejido_nyd(480.0,100*@alto,@criterio,@margen,@preciom2,1)
				set @c25 = dbo.fn_solarmanes_precio_tejido_nyd(500.0,100*@alto,@criterio,@margen,@preciom2,1)
				set @c26 = dbo.fn_solarmanes_precio_tejido_nyd(520.0,100*@alto,@criterio,@margen,@preciom2,1)
				set @c27 = dbo.fn_solarmanes_precio_tejido_nyd(540.0,100*@alto,@criterio,@margen,@preciom2,1) 
				set @c28 = dbo.fn_solarmanes_precio_tejido_nyd(560.0,100*@alto,@criterio,@margen,@preciom2,1) 
				set @c29 = dbo.fn_solarmanes_precio_tejido_nyd(580.0,100*@alto,@criterio,@margen,@preciom2,1) 
				set @c30 = dbo.fn_solarmanes_precio_tejido_nyd(600.0,100*@alto,@criterio,@margen,@preciom2,1)
				set @c31 = 0
				set @c32 = 0
			end
		end


		/* MAPA TEJIDO SIN MARGEN */
		if @bloque = 12
		begin
		if @tipoproducto = 1
		begin
			set @c02 = dbo.fn_solarmanes_precio_tejido(40.0,100*@alto,@criterio,@margen,@preciom2,2) 
			set @c03 = dbo.fn_solarmanes_precio_tejido(60.0,100*@alto,@criterio,@margen,@preciom2,2)
			set @c04 = dbo.fn_solarmanes_precio_tejido(80.0,100*@alto,@criterio,@margen,@preciom2,2) 
			set @c05 = dbo.fn_solarmanes_precio_tejido(100.0,100*@alto,@criterio,@margen,@preciom2,2)
			set @c06 = dbo.fn_solarmanes_precio_tejido(120.0,100*@alto,@criterio,@margen,@preciom2,2)
			set @c07 = dbo.fn_solarmanes_precio_tejido(140.0,100*@alto,@criterio,@margen,@preciom2,2) 
			set @c08 = dbo.fn_solarmanes_precio_tejido(160.0,100*@alto,@criterio,@margen,@preciom2,2)
			set @c09 = dbo.fn_solarmanes_precio_tejido(180.0,100*@alto,@criterio,@margen,@preciom2,2) 
			set @c10 = dbo.fn_solarmanes_precio_tejido(200.0,100*@alto,@criterio,@margen,@preciom2,2)
			set @c11 = dbo.fn_solarmanes_precio_tejido(220.0,100*@alto,@criterio,@margen,@preciom2,2)
			set @c12 = dbo.fn_solarmanes_precio_tejido(240.0,100*@alto,@criterio,@margen,@preciom2,2)
			set @c13 = dbo.fn_solarmanes_precio_tejido(260.0,100*@alto,@criterio,@margen,@preciom2,2) 
			set @c14 = dbo.fn_solarmanes_precio_tejido(280.0,100*@alto,@criterio,@margen,@preciom2,2)
			set @c15 = dbo.fn_solarmanes_precio_tejido(300.0,100*@alto,@criterio,@margen,@preciom2,2)
			set @c16 = dbo.fn_solarmanes_precio_tejido(320.0,100*@alto,@criterio,@margen,@preciom2,2) 
			set @c17 = dbo.fn_solarmanes_precio_tejido(340.0,100*@alto,@criterio,@margen,@preciom2,2)
			set @c18 = dbo.fn_solarmanes_precio_tejido(360.0,100*@alto,@criterio,@margen,@preciom2,2)
			set @c19 = dbo.fn_solarmanes_precio_tejido(380.0,100*@alto,@criterio,@margen,@preciom2,2)
			set @c20 = dbo.fn_solarmanes_precio_tejido(400.0,100*@alto,@criterio,@margen,@preciom2,2) 
			set @c21 = dbo.fn_solarmanes_precio_tejido(420.0,100*@alto,@criterio,@margen,@preciom2,2) 
			set @c22 = dbo.fn_solarmanes_precio_tejido(440.0,100*@alto,@criterio,@margen,@preciom2,2) 
			set @c23 = dbo.fn_solarmanes_precio_tejido(460.0,100*@alto,@criterio,@margen,@preciom2,2)
			set @c24 = dbo.fn_solarmanes_precio_tejido(480.0,100*@alto,@criterio,@margen,@preciom2,2)
			set @c25 = dbo.fn_solarmanes_precio_tejido(500.0,100*@alto,@criterio,@margen,@preciom2,2)
			set @c26 = dbo.fn_solarmanes_precio_tejido(520.0,100*@alto,@criterio,@margen,@preciom2,2)
			set @c27 = dbo.fn_solarmanes_precio_tejido(540.0,100*@alto,@criterio,@margen,@preciom2,2) 
			set @c28 = dbo.fn_solarmanes_precio_tejido(560.0,100*@alto,@criterio,@margen,@preciom2,2) 
			set @c29 = dbo.fn_solarmanes_precio_tejido(580.0,100*@alto,@criterio,@margen,@preciom2,2) 
			set @c30 = dbo.fn_solarmanes_precio_tejido(600.0,100*@alto,@criterio,@margen,@preciom2,2)
			set @c31 = 0
			set @c32 = 0
		end

		end

		/* MAPA TEJIDO MARGEN */
		if @bloque = 13
		begin
		if @tipoproducto = 1
		begin
		set @c02 = dbo.fn_solarmanes_precio_tejido(40.0,100*@alto,@criterio,@margen,@preciom2,3) 
		set @c03 = dbo.fn_solarmanes_precio_tejido(60.0,100*@alto,@criterio,@margen,@preciom2,3)
		set @c04 = dbo.fn_solarmanes_precio_tejido(80.0,100*@alto,@criterio,@margen,@preciom2,3) 
		set @c05 = dbo.fn_solarmanes_precio_tejido(100.0,100*@alto,@criterio,@margen,@preciom2,3)
		set @c06 = dbo.fn_solarmanes_precio_tejido(120.0,100*@alto,@criterio,@margen,@preciom2,3)
		set @c07 = dbo.fn_solarmanes_precio_tejido(140.0,100*@alto,@criterio,@margen,@preciom2,3) 
		set @c08 = dbo.fn_solarmanes_precio_tejido(160.0,100*@alto,@criterio,@margen,@preciom2,3)
		set @c09 = dbo.fn_solarmanes_precio_tejido(180.0,100*@alto,@criterio,@margen,@preciom2,3) 
		set @c10 = dbo.fn_solarmanes_precio_tejido(200.0,100*@alto,@criterio,@margen,@preciom2,3)
		set @c11 = dbo.fn_solarmanes_precio_tejido(220.0,100*@alto,@criterio,@margen,@preciom2,3)
		set @c12 = dbo.fn_solarmanes_precio_tejido(240.0,100*@alto,@criterio,@margen,@preciom2,3)
		set @c13 = dbo.fn_solarmanes_precio_tejido(260.0,100*@alto,@criterio,@margen,@preciom2,3) 
		set @c14 = dbo.fn_solarmanes_precio_tejido(280.0,100*@alto,@criterio,@margen,@preciom2,3)
		set @c15 = dbo.fn_solarmanes_precio_tejido(300.0,100*@alto,@criterio,@margen,@preciom2,3)
		set @c16 = dbo.fn_solarmanes_precio_tejido(320.0,100*@alto,@criterio,@margen,@preciom2,3) 
		set @c17 = dbo.fn_solarmanes_precio_tejido(340.0,100*@alto,@criterio,@margen,@preciom2,3)
		set @c18 = dbo.fn_solarmanes_precio_tejido(360.0,100*@alto,@criterio,@margen,@preciom2,3)
		set @c19 = dbo.fn_solarmanes_precio_tejido(380.0,100*@alto,@criterio,@margen,@preciom2,3)
		set @c20 = dbo.fn_solarmanes_precio_tejido(400.0,100*@alto,@criterio,@margen,@preciom2,3) 
		set @c21 = dbo.fn_solarmanes_precio_tejido(420.0,100*@alto,@criterio,@margen,@preciom2,3) 
		set @c22 = dbo.fn_solarmanes_precio_tejido(440.0,100*@alto,@criterio,@margen,@preciom2,3) 
		set @c23 = dbo.fn_solarmanes_precio_tejido(460.0,100*@alto,@criterio,@margen,@preciom2,3)
		set @c24 = dbo.fn_solarmanes_precio_tejido(480.0,100*@alto,@criterio,@margen,@preciom2,3)
		set @c25 = dbo.fn_solarmanes_precio_tejido(500.0,100*@alto,@criterio,@margen,@preciom2,3)
		set @c26 = dbo.fn_solarmanes_precio_tejido(520.0,100*@alto,@criterio,@margen,@preciom2,3)
		set @c27 = dbo.fn_solarmanes_precio_tejido(540.0,100*@alto,@criterio,@margen,@preciom2,3) 
		set @c28 = dbo.fn_solarmanes_precio_tejido(560.0,100*@alto,@criterio,@margen,@preciom2,3) 
		set @c29 = dbo.fn_solarmanes_precio_tejido(580.0,100*@alto,@criterio,@margen,@preciom2,3) 
		set @c30 = dbo.fn_solarmanes_precio_tejido(600.0,100*@alto,@criterio,@margen,@preciom2,3)
		set @c31 = 0
		set @c32 = 0
		end
		end

		/* MAPA ARTICULOS ML */
		if @bloque = 2 /* ALL */
		begin
		set @c02 = dbo.fn_Tarifa_Lineales(@tarifa,40.0) 
		set @c03 = dbo.fn_Tarifa_Lineales(@tarifa,60.0) 
		set @c04 = dbo.fn_Tarifa_Lineales(@tarifa,80.0)
		set @c05 = dbo.fn_Tarifa_Lineales(@tarifa,100.0)
		set @c06 = dbo.fn_Tarifa_Lineales(@tarifa,120.0)
		set @c07 = dbo.fn_Tarifa_Lineales(@tarifa,140.0)
		set @c08 = dbo.fn_Tarifa_Lineales(@tarifa,160.0) 
		set @c09 = dbo.fn_Tarifa_Lineales(@tarifa,180.0)
		set @c10 = dbo.fn_Tarifa_Lineales(@tarifa,200.0) 
		set @c11 = dbo.fn_Tarifa_Lineales(@tarifa,220.0) 
		set @c12 = dbo.fn_Tarifa_Lineales(@tarifa,240.0) 
		set @c13 = dbo.fn_Tarifa_Lineales(@tarifa,260.0) 
		set @c14 = dbo.fn_Tarifa_Lineales(@tarifa,280.0)
		set @c15 = dbo.fn_Tarifa_Lineales(@tarifa,300.0) 
		set @c16 = dbo.fn_Tarifa_Lineales(@tarifa,320.0) 
		set @c17 = dbo.fn_Tarifa_Lineales(@tarifa,340.0)
		set @c18 = dbo.fn_Tarifa_Lineales(@tarifa,360.0)
		set @c19 = dbo.fn_Tarifa_Lineales(@tarifa,380.0)
		set @c20 = dbo.fn_Tarifa_Lineales(@tarifa,400.0) 
		set @c21 = dbo.fn_Tarifa_Lineales(@tarifa,420.0) 
		set @c22 = dbo.fn_Tarifa_Lineales(@tarifa,440.0)
		set @c23 = dbo.fn_Tarifa_Lineales(@tarifa,460.0)
		set @c24 = dbo.fn_Tarifa_Lineales(@tarifa,480.0)
		set @c25 = dbo.fn_Tarifa_Lineales(@tarifa,500.0) 
		set @c26 = dbo.fn_Tarifa_Lineales(@tarifa,520.0)
		set @c27 = dbo.fn_Tarifa_Lineales(@tarifa,540.0)
		set @c28 = dbo.fn_Tarifa_Lineales(@tarifa,560.0)
		set @c29 = dbo.fn_Tarifa_Lineales(@tarifa,580.0)
		set @c30 = dbo.fn_Tarifa_Lineales(@tarifa,600.0)
		set @c31 = 0
		set @c32 = 0
		end

		/* MAPA ARTICULOS UD */
		if @bloque = 3 /* ALL */
		begin
		set @c02 = @unitarios
		set @c03 = @unitarios 
		set @c04 =  @unitarios 
		set @c05 = @unitarios 
		set @c06 =  @unitarios
		set @c07 = @unitarios
		set @c08 = @unitarios 
		set @c09 =  @unitarios 
		set @c10 =  @unitarios 
		set @c11 =  @unitarios 
		set @c12 =  @unitarios 
		set @c13 =  @unitarios 
		set @c14 =  @unitarios
		set @c15 =  @unitarios 
		set @c16 =  @unitarios
		set @c17 =  @unitarios
		set @c18 =  @unitarios
		set @c19 =  @unitarios
		set @c20 =  @unitarios
		set @c21 = @unitarios 
		set @c22 =  @unitarios
		set @c23 =  @unitarios
		set @c24 =  @unitarios 
		set @c25 = @unitarios 
		set @c26 = @unitarios
		set @c27 =  @unitarios
		set @c28 =  @unitarios
		set @c29 =  @unitarios
		set @c30 =  @unitarios
		set @c31 = 0
		set @c32 = 0
		end

		/* MAPA MANO DE OBRA */
		if @bloque = 4 
		begin
		if @tipoproducto = 3 set @margen = 1.45
		set @c02 = dbo.fn_precio_tarifa_montaje(@tarifa,40.0,@preciomontaje,@margen)
		set @c03 = dbo.fn_precio_tarifa_montaje(@tarifa,60.0,@preciomontaje,@margen)
		set @c04 = dbo.fn_precio_tarifa_montaje(@tarifa,80.0,@preciomontaje,@margen)
		set @c05 = dbo.fn_precio_tarifa_montaje(@tarifa,100.0,@preciomontaje,@margen)
		set @c06 = dbo.fn_precio_tarifa_montaje(@tarifa,120.0,@preciomontaje,@margen)
		set @c07 = dbo.fn_precio_tarifa_montaje(@tarifa,140.0,@preciomontaje,@margen)
		set @c08 = dbo.fn_precio_tarifa_montaje(@tarifa,160.0,@preciomontaje,@margen)
		set @c09 = dbo.fn_precio_tarifa_montaje(@tarifa,180.0,@preciomontaje,@margen)
		set @c10 = dbo.fn_precio_tarifa_montaje(@tarifa,200.0,@preciomontaje,@margen)
		set @c11 = dbo.fn_precio_tarifa_montaje(@tarifa,220.0,@preciomontaje,@margen)
		set @c12 = dbo.fn_precio_tarifa_montaje(@tarifa,240.0,@preciomontaje,@margen)
		set @c13 = dbo.fn_precio_tarifa_montaje(@tarifa,260.0,@preciomontaje,@margen)
		set @c14 = dbo.fn_precio_tarifa_montaje(@tarifa,280.0,@preciomontaje,@margen)
		set @c15 = dbo.fn_precio_tarifa_montaje(@tarifa,300.0,@preciomontaje,@margen)
		set @c16 = dbo.fn_precio_tarifa_montaje(@tarifa,320.0,@preciomontaje,@margen)
		set @c17 = dbo.fn_precio_tarifa_montaje(@tarifa,340.0,@preciomontaje,@margen)
		set @c18 = dbo.fn_precio_tarifa_montaje(@tarifa,360.0,@preciomontaje,@margen)
		set @c19 = dbo.fn_precio_tarifa_montaje(@tarifa,380.0,@preciomontaje,@margen)
		set @c20 = dbo.fn_precio_tarifa_montaje(@tarifa,400.0,@preciomontaje,@margen)
		set @c21 = dbo.fn_precio_tarifa_montaje(@tarifa,420.0,@preciomontaje,@margen)
		set @c22 = dbo.fn_precio_tarifa_montaje(@tarifa,440.0,@preciomontaje,@margen)
		set @c23 = dbo.fn_precio_tarifa_montaje(@tarifa,460.0,@preciomontaje,@margen)
		set @c24 = dbo.fn_precio_tarifa_montaje(@tarifa,480.0,@preciomontaje,@margen)
		set @c25 = dbo.fn_precio_tarifa_montaje(@tarifa,500.0,@preciomontaje,@margen)
		set @c26 = dbo.fn_precio_tarifa_montaje(@tarifa,520.0,@preciomontaje,@margen)
		set @c27 = dbo.fn_precio_tarifa_montaje(@tarifa,540.0,@preciomontaje,@margen)
		set @c28 = dbo.fn_precio_tarifa_montaje(@tarifa,560.0,@preciomontaje,@margen)
		set @c29 = dbo.fn_precio_tarifa_montaje(@tarifa,580.0,@preciomontaje,@margen)
		set @c30 = dbo.fn_precio_tarifa_montaje(@tarifa,600.0,@preciomontaje,@margen)
		set @c31 = 0
		set @c32 = 0
		end

		/* MAPA MONETARIOS */
		if @bloque = 14 /* ALL */
		begin
		set @c02 = @monetarios
		set @c03 = @monetarios 
		set @c04 =  @monetarios 
		set @c05 = @monetarios 
		set @c06 =  @monetarios
		set @c07 = @monetarios
		set @c08 = @monetarios 
		set @c09 =  @monetarios 
		set @c10 =  @monetarios 
		set @c11 =  @monetarios 
		set @c12 =  @monetarios 
		set @c13 =  @monetarios 
		set @c14 =  @monetarios
		set @c15 =  @monetarios 
		set @c16 =  @monetarios
		set @c17 =  @monetarios
		set @c18 =  @monetarios
		set @c19 =  @monetarios
		set @c20 =  @monetarios
		set @c21 = @monetarios 
		set @c22 =  @monetarios
		set @c23 =  @monetarios
		set @c24 =  @monetarios 
		set @c25 = @monetarios 
		set @c26 = @monetarios
		set @c27 =  @monetarios
		set @c28 =  @monetarios
		set @c29 =  @monetarios
		set @c30 =  @monetarios
		set @c31 = 0
		set @c32 = 0
		end


		/* MAPA EMBALAJE */
		if @bloque = 15 
		begin
		set @c02 = dbo.temp_fn_precio_tarifa_embalaje(@tarifa,40.0,1)
		set @c03 = dbo.temp_fn_precio_tarifa_embalaje(@tarifa,60.0,1)
		set @c04 = dbo.temp_fn_precio_tarifa_embalaje(@tarifa,80.0,1)
		set @c05 = dbo.temp_fn_precio_tarifa_embalaje(@tarifa,100.0,1)
		set @c06 = dbo.temp_fn_precio_tarifa_embalaje(@tarifa,120.0,1)
		set @c07 = dbo.temp_fn_precio_tarifa_embalaje(@tarifa,140.0,1)
		set @c08 = dbo.temp_fn_precio_tarifa_embalaje(@tarifa,160.0,1)
		set @c09 = dbo.temp_fn_precio_tarifa_embalaje(@tarifa,180.0,1)
		set @c10 = dbo.temp_fn_precio_tarifa_embalaje(@tarifa,200.0,1)
		set @c11 = dbo.temp_fn_precio_tarifa_embalaje(@tarifa,220.0,1)
		set @c12 = dbo.temp_fn_precio_tarifa_embalaje(@tarifa,240.0,1)
		set @c13 = dbo.temp_fn_precio_tarifa_embalaje(@tarifa,260.0,1)
		set @c14 = dbo.temp_fn_precio_tarifa_embalaje(@tarifa,280.0,1)
		set @c15 = dbo.temp_fn_precio_tarifa_embalaje(@tarifa,300.0,1)
		set @c16 = dbo.temp_fn_precio_tarifa_embalaje(@tarifa,320.0,1)
		set @c17 = dbo.temp_fn_precio_tarifa_embalaje(@tarifa,340.0,1)
		set @c18 = dbo.temp_fn_precio_tarifa_embalaje(@tarifa,360.0,1)
		set @c19 = dbo.temp_fn_precio_tarifa_embalaje(@tarifa,380.0,1)
		set @c20 = dbo.temp_fn_precio_tarifa_embalaje(@tarifa,400.0,1)
		set @c21 = dbo.temp_fn_precio_tarifa_embalaje(@tarifa,420.0,1)
		set @c22 = dbo.temp_fn_precio_tarifa_embalaje(@tarifa,440.0,1)
		set @c23 = dbo.temp_fn_precio_tarifa_embalaje(@tarifa,460.0,1)
		set @c24 = dbo.temp_fn_precio_tarifa_embalaje(@tarifa,480.0,1)
		set @c25 = dbo.temp_fn_precio_tarifa_embalaje(@tarifa,500.0,1)
		set @c26 = dbo.temp_fn_precio_tarifa_embalaje(@tarifa,520.0,1)
		set @c27 = dbo.temp_fn_precio_tarifa_embalaje(@tarifa,540.0,1)
		set @c28 = dbo.temp_fn_precio_tarifa_embalaje(@tarifa,560.0,1)
		set @c29 = dbo.temp_fn_precio_tarifa_embalaje(@tarifa,580.0,1)
		set @c30 = dbo.temp_fn_precio_tarifa_embalaje(@tarifa,600.0,1)
		set @c31 = 0
		set @c32 = 0
		end

		/* MAPA MECANISMO */
		if @bloque = 5 
		begin
		set @c02 = dbo.fn_Tarifa_Lineales(@tarifa,40.0) + @unitarios + dbo.fn_precio_tarifa_montaje(1,40.0,@preciomontaje,@margen)
		set @c03 = dbo.fn_Tarifa_Lineales(@tarifa,60.0) + @unitarios + dbo.fn_precio_tarifa_montaje(1,60.0,@preciomontaje,@margen)
		set @c04 = dbo.fn_Tarifa_Lineales(@tarifa,80.0) + @unitarios + dbo.fn_precio_tarifa_montaje(1,80.0,@preciomontaje,@margen)
		set @c05 = dbo.fn_Tarifa_Lineales(@tarifa,100.0) + @unitarios + dbo.fn_precio_tarifa_montaje(1,100.0,@preciomontaje,@margen)
		set @c06 = dbo.fn_Tarifa_Lineales(@tarifa,120.0) + @unitarios + dbo.fn_precio_tarifa_montaje(1,120.0,@preciomontaje,@margen)
		set @c07 = dbo.fn_Tarifa_Lineales(@tarifa,140.0) + @unitarios + dbo.fn_precio_tarifa_montaje(1,140.0,@preciomontaje,@margen)
		set @c08 = dbo.fn_Tarifa_Lineales(@tarifa,160.0) + @unitarios + dbo.fn_precio_tarifa_montaje(1,160.0,@preciomontaje,@margen)
		set @c09 = dbo.fn_Tarifa_Lineales(@tarifa,180.0) + @unitarios + dbo.fn_precio_tarifa_montaje(1,180.0,@preciomontaje,@margen)
		set @c10 = dbo.fn_Tarifa_Lineales(@tarifa,200.0) + @unitarios + dbo.fn_precio_tarifa_montaje(1,200.0,@preciomontaje,@margen)
		set @c11 = dbo.fn_Tarifa_Lineales(@tarifa,220.0) + @unitarios + dbo.fn_precio_tarifa_montaje(1,220.0,@preciomontaje,@margen)
		set @c12 = dbo.fn_Tarifa_Lineales(@tarifa,240.0) + @unitarios + dbo.fn_precio_tarifa_montaje(1,240.0,@preciomontaje,@margen)
		set @c13 = dbo.fn_Tarifa_Lineales(@tarifa,260.0) + @unitarios + dbo.fn_precio_tarifa_montaje(1,260.0,@preciomontaje,@margen)
		set @c14 = dbo.fn_Tarifa_Lineales(@tarifa,280.0) + @unitarios + dbo.fn_precio_tarifa_montaje(1,280.0,@preciomontaje,@margen)
		set @c15 = dbo.fn_Tarifa_Lineales(@tarifa,300.0) + @unitarios + dbo.fn_precio_tarifa_montaje(1,300.0,@preciomontaje,@margen)
		set @c16 = dbo.fn_Tarifa_Lineales(@tarifa,320.0) + @unitarios + dbo.fn_precio_tarifa_montaje(1,320.0,@preciomontaje,@margen)
		set @c17 = dbo.fn_Tarifa_Lineales(@tarifa,340.0) + @unitarios + dbo.fn_precio_tarifa_montaje(1,340.0,@preciomontaje,@margen)
		set @c18 = dbo.fn_Tarifa_Lineales(@tarifa,360.0) + @unitarios + dbo.fn_precio_tarifa_montaje(1,360.0,@preciomontaje,@margen)
		set @c19 = dbo.fn_Tarifa_Lineales(@tarifa,380.0) + @unitarios + dbo.fn_precio_tarifa_montaje(1,380.0,@preciomontaje,@margen)
		set @c20 = dbo.fn_Tarifa_Lineales(@tarifa,400.0) + @unitarios + dbo.fn_precio_tarifa_montaje(1,400.0,@preciomontaje,@margen)
		set @c21 = dbo.fn_Tarifa_Lineales(@tarifa,420.0) + @unitarios + dbo.fn_precio_tarifa_montaje(1,420.0,@preciomontaje,@margen)
		set @c22 = dbo.fn_Tarifa_Lineales(@tarifa,440.0) + @unitarios + dbo.fn_precio_tarifa_montaje(1,440.0,@preciomontaje,@margen)
		set @c23 = dbo.fn_Tarifa_Lineales(@tarifa,460.0) + @unitarios + dbo.fn_precio_tarifa_montaje(1,460.0,@preciomontaje,@margen)
		set @c24 = dbo.fn_Tarifa_Lineales(@tarifa,480.0) + @unitarios + dbo.fn_precio_tarifa_montaje(1,480.0,@preciomontaje,@margen)
		set @c25 = dbo.fn_Tarifa_Lineales(@tarifa,500.0) + @unitarios + dbo.fn_precio_tarifa_montaje(1,500.0,@preciomontaje,@margen)
		set @c26 = dbo.fn_Tarifa_Lineales(@tarifa,520.0) + @unitarios + dbo.fn_precio_tarifa_montaje(1,520.0,@preciomontaje,@margen)
		set @c27 = dbo.fn_Tarifa_Lineales(@tarifa,540.0) + @unitarios + dbo.fn_precio_tarifa_montaje(1,540.0,@preciomontaje,@margen)
		set @c28 = dbo.fn_Tarifa_Lineales(@tarifa,560.0) + @unitarios + dbo.fn_precio_tarifa_montaje(1,560.0,@preciomontaje,@margen)
		set @c29 = dbo.fn_Tarifa_Lineales(@tarifa,580.0) + @unitarios + dbo.fn_precio_tarifa_montaje(1,580.0,@preciomontaje,@margen)
		set @c30 = dbo.fn_Tarifa_Lineales(@tarifa,600.0) + @unitarios + dbo.fn_precio_tarifa_montaje(1,600.0,@preciomontaje,@margen)
		set @c31 = 0
		set @c32 = 0
		end

		/* MAPA PESO */
		if @bloque = 6
		begin
		set @c02 = dbo.fn_solarmanes_peso_tejido(0.40,@c01,@densidad)
		set @c03 = dbo.fn_solarmanes_peso_tejido(0.60,@c01,@densidad)
		set @c04 = dbo.fn_solarmanes_peso_tejido(0.80,@c01,@densidad)
		set @c05 = dbo.fn_solarmanes_peso_tejido(1.00,@c01,@densidad)
		set @c06 = dbo.fn_solarmanes_peso_tejido(1.20,@c01,@densidad)
		set @c07 = dbo.fn_solarmanes_peso_tejido(1.40,@c01,@densidad)
		set @c08 = dbo.fn_solarmanes_peso_tejido(1.60,@c01,@densidad)
		set @c09 = dbo.fn_solarmanes_peso_tejido(1.80,@c01,@densidad)
		set @c10 = dbo.fn_solarmanes_peso_tejido(2.00,@c01,@densidad)
		set @c11 = dbo.fn_solarmanes_peso_tejido(2.20,@c01,@densidad)
		set @c12 = dbo.fn_solarmanes_peso_tejido(2.40,@c01,@densidad)
		set @c13 = dbo.fn_solarmanes_peso_tejido(2.60,@c01,@densidad)
		set @c14 = dbo.fn_solarmanes_peso_tejido(2.80,@c01,@densidad)
		set @c15 = dbo.fn_solarmanes_peso_tejido(3.00,@c01,@densidad)
		set @c16 = dbo.fn_solarmanes_peso_tejido(3.20,@c01,@densidad)
		set @c17 = dbo.fn_solarmanes_peso_tejido(3.40,@c01,@densidad)
		set @c18 = dbo.fn_solarmanes_peso_tejido(3.60,@c01,@densidad)
		set @c19 = dbo.fn_solarmanes_peso_tejido(3.80,@c01,@densidad)
		set @c20 = dbo.fn_solarmanes_peso_tejido(4.00,@c01,@densidad)
		set @c21 = dbo.fn_solarmanes_peso_tejido(4.20,@c01,@densidad)
		set @c22 = dbo.fn_solarmanes_peso_tejido(4.40,@c01,@densidad)
		set @c23 = dbo.fn_solarmanes_peso_tejido(4.60,@c01,@densidad)
		set @c24 = dbo.fn_solarmanes_peso_tejido(4.80,@c01,@densidad)
		set @c25 = dbo.fn_solarmanes_peso_tejido(5.00,@c01,@densidad)
		set @c26 = dbo.fn_solarmanes_peso_tejido(5.20,@c01,@densidad)
		set @c27 = dbo.fn_solarmanes_peso_tejido(5.40,@c01,@densidad)
		set @c28 = dbo.fn_solarmanes_peso_tejido(5.60,@c01,@densidad)
		set @c29 = dbo.fn_solarmanes_peso_tejido(5.80,@c01,@densidad)
		set @c30 = dbo.fn_solarmanes_peso_tejido(6.00,@c01,@densidad)
		set @c31 = 0
		set @c32 = 0
		end

		/* MAPA DESMULTIPLICADOR */
		if @bloque = 7 
		begin
		set @c02 = @margen*dbo.fn_solarmanes_peso_tejido_valor(@tarifa,0.40,@c01,@densidad)
		set @c03 = @margen*dbo.fn_solarmanes_peso_tejido_valor(@tarifa,0.60,@c01,@densidad)
		set @c04 = @margen*dbo.fn_solarmanes_peso_tejido_valor(@tarifa,0.80,@c01,@densidad)
		set @c05 = @margen*dbo.fn_solarmanes_peso_tejido_valor(@tarifa,1.00,@c01,@densidad)
		set @c06 = @margen*dbo.fn_solarmanes_peso_tejido_valor(@tarifa,1.20,@c01,@densidad)
		set @c07 = @margen*dbo.fn_solarmanes_peso_tejido_valor(@tarifa,1.40,@c01,@densidad)
		set @c08 = @margen*dbo.fn_solarmanes_peso_tejido_valor(@tarifa,1.60,@c01,@densidad)
		set @c09 = @margen*dbo.fn_solarmanes_peso_tejido_valor(@tarifa,1.80,@c01,@densidad)
		set @c10 = @margen*dbo.fn_solarmanes_peso_tejido_valor(@tarifa,2.00,@c01,@densidad)
		set @c11 = @margen*dbo.fn_solarmanes_peso_tejido_valor(@tarifa,2.20,@c01,@densidad)
		set @c12 = @margen*dbo.fn_solarmanes_peso_tejido_valor(@tarifa,2.40,@c01,@densidad)
		set @c13 = @margen*dbo.fn_solarmanes_peso_tejido_valor(@tarifa,2.60,@c01,@densidad)
		set @c14 = @margen*dbo.fn_solarmanes_peso_tejido_valor(@tarifa,2.80,@c01,@densidad)
		set @c15 = @margen*dbo.fn_solarmanes_peso_tejido_valor(@tarifa,3.00,@c01,@densidad)
		set @c16 = @margen*dbo.fn_solarmanes_peso_tejido_valor(@tarifa,3.20,@c01,@densidad)
		set @c17 = @margen*dbo.fn_solarmanes_peso_tejido_valor(@tarifa,3.40,@c01,@densidad)
		set @c18 = @margen*dbo.fn_solarmanes_peso_tejido_valor(@tarifa,3.60,@c01,@densidad)
		set @c19 = @margen*dbo.fn_solarmanes_peso_tejido_valor(@tarifa,3.80,@c01,@densidad)
		set @c20 = @margen*dbo.fn_solarmanes_peso_tejido_valor(@tarifa,4.00,@c01,@densidad)
		set @c21 = @margen*dbo.fn_solarmanes_peso_tejido_valor(@tarifa,4.20,@c01,@densidad)
		set @c22 = @margen*dbo.fn_solarmanes_peso_tejido_valor(@tarifa,4.40,@c01,@densidad)
		set @c23 = @margen*dbo.fn_solarmanes_peso_tejido_valor(@tarifa,4.60,@c01,@densidad)
		set @c24 = @margen*dbo.fn_solarmanes_peso_tejido_valor(@tarifa,4.80,@c01,@densidad)
		set @c25 = @margen*dbo.fn_solarmanes_peso_tejido_valor(@tarifa,5.00,@c01,@densidad)
		set @c26 = @margen*dbo.fn_solarmanes_peso_tejido_valor(@tarifa,5.20,@c01,@densidad)
		set @c27 = @margen*dbo.fn_solarmanes_peso_tejido_valor(@tarifa,5.40,@c01,@densidad)
		set @c28 = @margen*dbo.fn_solarmanes_peso_tejido_valor(@tarifa,5.60,@c01,@densidad)
		set @c29 = @margen*dbo.fn_solarmanes_peso_tejido_valor(@tarifa,5.80,@c01,@densidad)
		set @c30 = @margen*dbo.fn_solarmanes_peso_tejido_valor(@tarifa,6.00,@c01,@densidad)
		set @c31 = 0
		set @c32 = 0
		end

		/* MAPA VERTICALES */
		if @bloque = 8
		begin
			set @c02 = @verticales*@alto
			set @c03 = @c02  
			set @c04 =  @c02 
			set @c05 = @c02 
			set @c06 =  @c02
			set @c07 = @c02
			set @c08 = @c02 
			set @c09 =  @c02 
			set @c10 =  @c02 
			set @c11 =  @c02 
			set @c12 =  @c02 
			set @c13 =  @c02 
			set @c14 =  @c02
			set @c15 =  @c02 
			set @c16 =  @c02
			set @c17 =  @c02
			set @c18 =  @c02
			set @c19 =  @c02
			set @c20 =  @c02
			set @c21 = @c02 
			set @c22 =  @c02
			set @c23 =  @c02
			set @c24 =  @c02 
			set @c25 = @c02 
			set @c26 = @c02
			set @c27 =  @c02
			set @c28 =  @c02
			set @c29 =  @c02
			set @c30 =  @c02
			set @c31 = 0
			set @c32 = 0
		end

		/* MAPA CANTIDAD POR ANCHO */
		if @bloque = 9
		begin
			set @c02 = dbo.fn_solarmanes_precio_articulos_tipo_7(@tarifa,40,@c02)
			set @c03 = dbo.fn_solarmanes_precio_articulos_tipo_7(@tarifa,60,@c03)
			set @c04 = dbo.fn_solarmanes_precio_articulos_tipo_7(@tarifa,80,@c04)
			set @c05 = dbo.fn_solarmanes_precio_articulos_tipo_7(@tarifa,100,@c05)
			set @c06 = dbo.fn_solarmanes_precio_articulos_tipo_7(@tarifa,120,@c06)
			set @c07 = dbo.fn_solarmanes_precio_articulos_tipo_7(@tarifa,140,@c07)
			set @c08 = dbo.fn_solarmanes_precio_articulos_tipo_7(@tarifa,160,@c08)
			set @c09 = dbo.fn_solarmanes_precio_articulos_tipo_7(@tarifa,180,@c09)
			set @c10 = dbo.fn_solarmanes_precio_articulos_tipo_7(@tarifa,200,@c10)
			set @c11 = dbo.fn_solarmanes_precio_articulos_tipo_7(@tarifa,220,@c11)
			set @c12 = dbo.fn_solarmanes_precio_articulos_tipo_7(@tarifa,240,@c12)
			set @c13 = dbo.fn_solarmanes_precio_articulos_tipo_7(@tarifa,260,@c13)
			set @c14 = dbo.fn_solarmanes_precio_articulos_tipo_7(@tarifa,280,@c14)
			set @c15 = dbo.fn_solarmanes_precio_articulos_tipo_7(@tarifa,300,@c15)
			set @c16 = dbo.fn_solarmanes_precio_articulos_tipo_7(@tarifa,320,@c16)
			set @c17 = dbo.fn_solarmanes_precio_articulos_tipo_7(@tarifa,340,@c17)
			set @c18 = dbo.fn_solarmanes_precio_articulos_tipo_7(@tarifa,360,@c18)
			set @c19 = dbo.fn_solarmanes_precio_articulos_tipo_7(@tarifa,380,@c19)
			set @c20 = dbo.fn_solarmanes_precio_articulos_tipo_7(@tarifa,400,@c20)
			set @c21 = dbo.fn_solarmanes_precio_articulos_tipo_7(@tarifa,420,@c21)
			set @c22 = dbo.fn_solarmanes_precio_articulos_tipo_7(@tarifa,440,@c22)
			set @c23 = dbo.fn_solarmanes_precio_articulos_tipo_7(@tarifa,460,@c23)
			set @c24 = dbo.fn_solarmanes_precio_articulos_tipo_7(@tarifa,480,@c24)
			set @c25 = dbo.fn_solarmanes_precio_articulos_tipo_7(@tarifa,500,@c25)
			set @c26 = dbo.fn_solarmanes_precio_articulos_tipo_7(@tarifa,520,@c26)
			set @c27 = dbo.fn_solarmanes_precio_articulos_tipo_7(@tarifa,540,@c27)
			set @c28 = dbo.fn_solarmanes_precio_articulos_tipo_7(@tarifa,560,@c28)
			set @c29 = dbo.fn_solarmanes_precio_articulos_tipo_7(@tarifa,580,@c29)
			set @c30 = dbo.fn_solarmanes_precio_articulos_tipo_7(@tarifa,600,@c30)
			set @c31 = 0
			set @c32 = 0
		end

		/* TIPO 8 */
		if @bloque = 20
		begin
			set @c02 = dbo.fn_solarmanes_precio_articulos_tipo_8(@tarifa,40,@c02)
			set @c03 = dbo.fn_solarmanes_precio_articulos_tipo_8(@tarifa,60,@c03)
			set @c04 = dbo.fn_solarmanes_precio_articulos_tipo_8(@tarifa,80,@c04)
			set @c05 = dbo.fn_solarmanes_precio_articulos_tipo_8(@tarifa,100,@c05)
			set @c06 = dbo.fn_solarmanes_precio_articulos_tipo_8(@tarifa,120,@c06)
			set @c07 = dbo.fn_solarmanes_precio_articulos_tipo_8(@tarifa,140,@c07)
			set @c08 = dbo.fn_solarmanes_precio_articulos_tipo_8(@tarifa,160,@c08)
			set @c09 = dbo.fn_solarmanes_precio_articulos_tipo_8(@tarifa,180,@c09)
			set @c10 = dbo.fn_solarmanes_precio_articulos_tipo_8(@tarifa,200,@c10)
			set @c11 = dbo.fn_solarmanes_precio_articulos_tipo_8(@tarifa,220,@c11)
			set @c12 = dbo.fn_solarmanes_precio_articulos_tipo_8(@tarifa,240,@c12)
			set @c13 = dbo.fn_solarmanes_precio_articulos_tipo_8(@tarifa,260,@c13)
			set @c14 = dbo.fn_solarmanes_precio_articulos_tipo_8(@tarifa,280,@c14)
			set @c15 = dbo.fn_solarmanes_precio_articulos_tipo_8(@tarifa,300,@c15)
			set @c16 = dbo.fn_solarmanes_precio_articulos_tipo_8(@tarifa,320,@c16)
			set @c17 = dbo.fn_solarmanes_precio_articulos_tipo_8(@tarifa,340,@c17)
			set @c18 = dbo.fn_solarmanes_precio_articulos_tipo_8(@tarifa,360,@c18)
			set @c19 = dbo.fn_solarmanes_precio_articulos_tipo_8(@tarifa,380,@c19)
			set @c20 = dbo.fn_solarmanes_precio_articulos_tipo_8(@tarifa,400,@c20)
			set @c21 = dbo.fn_solarmanes_precio_articulos_tipo_8(@tarifa,420,@c21)
			set @c22 = dbo.fn_solarmanes_precio_articulos_tipo_8(@tarifa,440,@c22)
			set @c23 = dbo.fn_solarmanes_precio_articulos_tipo_8(@tarifa,460,@c23)
			set @c24 = dbo.fn_solarmanes_precio_articulos_tipo_8(@tarifa,480,@c24)
			set @c25 = dbo.fn_solarmanes_precio_articulos_tipo_8(@tarifa,500,@c25)
			set @c26 = dbo.fn_solarmanes_precio_articulos_tipo_8(@tarifa,520,@c26)
			set @c27 = dbo.fn_solarmanes_precio_articulos_tipo_8(@tarifa,540,@c27)
			set @c28 = dbo.fn_solarmanes_precio_articulos_tipo_8(@tarifa,560,@c28)
			set @c29 = dbo.fn_solarmanes_precio_articulos_tipo_8(@tarifa,580,@c29)
			set @c30 = dbo.fn_solarmanes_precio_articulos_tipo_8(@tarifa,600,@c30)
			set @c31 = 0
			set @c32 = 0
		end
	
		/* MAPA COMPLETO */
		if @bloque = 10 /* ALL */  
		begin

		if @tipoproducto = 1
		begin
		set @c02 = @margen2 * (dbo.fn_solarmanes_precio_tejido(40.0,100*@alto,@criterio,@margen,@preciom2,1) + @unitarios  + dbo.fn_Tarifa_Lineales(@tarifa,40.0) + dbo.fn_precio_tarifa_montaje(@tarifa,40.0,@preciomontaje,@margen)   +  @margen*dbo.fn_solarmanes_peso_tejido_valor(@tarifa,0.40,@c01,@densidad) + @verticales*@alto) + dbo.temp_fn_precio_tarifa_embalaje(@tarifa,40.0,1) + dbo.fn_solarmanes_precio_articulos_tipo_7(@tarifa,40,@c01) + @monetarios + dbo.fn_solarmanes_precio_articulos_tipo_8(@tarifa,40,@c01)
		set @c03 = @margen2 * (dbo.fn_solarmanes_precio_tejido(60.0,100*@alto,@criterio,@margen,@preciom2,1) + @unitarios  + dbo.fn_Tarifa_Lineales(@tarifa,60.0) + dbo.fn_precio_tarifa_montaje(@tarifa,60.0,@preciomontaje,@margen)   +  @margen*dbo.fn_solarmanes_peso_tejido_valor(@tarifa,0.60,@c01,@densidad) + @verticales*@alto) + dbo.temp_fn_precio_tarifa_embalaje(@tarifa,60.0,1) + dbo.fn_solarmanes_precio_articulos_tipo_7(@tarifa,60,@c01) + @monetarios + dbo.fn_solarmanes_precio_articulos_tipo_8(@tarifa,60,@c01)
		set @c04 = @margen2 * (dbo.fn_solarmanes_precio_tejido(80.0,100*@alto,@criterio,@margen,@preciom2,1)  + @unitarios + dbo.fn_Tarifa_Lineales(@tarifa,80.0) + dbo.fn_precio_tarifa_montaje(@tarifa,80.0,@preciomontaje,@margen)   +  @margen*dbo.fn_solarmanes_peso_tejido_valor(@tarifa,0.80,@c01,@densidad) + @verticales*@alto) + dbo.temp_fn_precio_tarifa_embalaje(@tarifa,80.0,1) + dbo.fn_solarmanes_precio_articulos_tipo_7(@tarifa,80,@c01) + @monetarios + dbo.fn_solarmanes_precio_articulos_tipo_8(@tarifa,80,@c01)
		set @c05 = @margen2 * (dbo.fn_solarmanes_precio_tejido(100.0,100*@alto,@criterio,@margen,@preciom2,1) + @unitarios + dbo.fn_Tarifa_Lineales(@tarifa,100.0) + dbo.fn_precio_tarifa_montaje(@tarifa,100.0,@preciomontaje,@margen) +  @margen*dbo.fn_solarmanes_peso_tejido_valor(@tarifa,1.00,@c01,@densidad) + @verticales*@alto) + dbo.temp_fn_precio_tarifa_embalaje(@tarifa,100.0,1) + dbo.fn_solarmanes_precio_articulos_tipo_7(@tarifa,100,@c01) + @monetarios + dbo.fn_solarmanes_precio_articulos_tipo_8(@tarifa,100,@c01)
		set @c06 = @margen2 * (dbo.fn_solarmanes_precio_tejido(120.0,100*@alto,@criterio,@margen,@preciom2,1) + @unitarios + dbo.fn_Tarifa_Lineales(@tarifa,120.0) + dbo.fn_precio_tarifa_montaje(@tarifa,120.0,@preciomontaje,@margen) +  @margen*dbo.fn_solarmanes_peso_tejido_valor(@tarifa,1.20,@c01,@densidad) + @verticales*@alto) + dbo.temp_fn_precio_tarifa_embalaje(@tarifa,120.0,1) + dbo.fn_solarmanes_precio_articulos_tipo_7(@tarifa,120,@c01) + @monetarios + dbo.fn_solarmanes_precio_articulos_tipo_8(@tarifa,120,@c01)
		set @c07 = @margen2 * (dbo.fn_solarmanes_precio_tejido(140.0,100*@alto,@criterio,@margen,@preciom2,1) + @unitarios + dbo.fn_Tarifa_Lineales(@tarifa,140.0) + dbo.fn_precio_tarifa_montaje(@tarifa,140.0,@preciomontaje,@margen) +  @margen*dbo.fn_solarmanes_peso_tejido_valor(@tarifa,1.40,@c01,@densidad) + @verticales*@alto) + dbo.temp_fn_precio_tarifa_embalaje(@tarifa,140.0,1) + dbo.fn_solarmanes_precio_articulos_tipo_7(@tarifa,140,@c01) + @monetarios + dbo.fn_solarmanes_precio_articulos_tipo_8(@tarifa,140,@c01)
		set @c08 = @margen2 * (dbo.fn_solarmanes_precio_tejido(160.0,100*@alto,@criterio,@margen,@preciom2,1) + @unitarios + dbo.fn_Tarifa_Lineales(@tarifa,160.0) + dbo.fn_precio_tarifa_montaje(@tarifa,160.0,@preciomontaje,@margen) +  @margen*dbo.fn_solarmanes_peso_tejido_valor(@tarifa,1.60,@c01,@densidad) + @verticales*@alto) + dbo.temp_fn_precio_tarifa_embalaje(@tarifa,160.0,1) + dbo.fn_solarmanes_precio_articulos_tipo_7(@tarifa,160,@c01) + @monetarios + dbo.fn_solarmanes_precio_articulos_tipo_8(@tarifa,160,@c01)
		set @c09 = @margen2 * (dbo.fn_solarmanes_precio_tejido(180.0,100*@alto,@criterio,@margen,@preciom2,1) + @unitarios + dbo.fn_Tarifa_Lineales(@tarifa,180.0) + dbo.fn_precio_tarifa_montaje(@tarifa,180.0,@preciomontaje,@margen) +  @margen*dbo.fn_solarmanes_peso_tejido_valor(@tarifa,1.80,@c01,@densidad) + @verticales*@alto) + dbo.temp_fn_precio_tarifa_embalaje(@tarifa,180.0,1) + dbo.fn_solarmanes_precio_articulos_tipo_7(@tarifa,180,@c01) + @monetarios + dbo.fn_solarmanes_precio_articulos_tipo_8(@tarifa,180,@c01)
		set @c10 = @margen2 * (dbo.fn_solarmanes_precio_tejido(200.0,100*@alto,@criterio,@margen,@preciom2,1) + @unitarios + dbo.fn_Tarifa_Lineales(@tarifa,200.0) + dbo.fn_precio_tarifa_montaje(@tarifa,200.0,@preciomontaje,@margen) +  @margen*dbo.fn_solarmanes_peso_tejido_valor(@tarifa,2.00,@c01,@densidad) + @verticales*@alto) + dbo.temp_fn_precio_tarifa_embalaje(@tarifa,200.0,1) + dbo.fn_solarmanes_precio_articulos_tipo_7(@tarifa,200,@c01) + @monetarios + dbo.fn_solarmanes_precio_articulos_tipo_8(@tarifa,200,@c01)
		set @c11 = @margen2 * (dbo.fn_solarmanes_precio_tejido(220.0,100*@alto,@criterio,@margen,@preciom2,1) + @unitarios + dbo.fn_Tarifa_Lineales(@tarifa,220.0) + dbo.fn_precio_tarifa_montaje(@tarifa,220.0,@preciomontaje,@margen) +  @margen*dbo.fn_solarmanes_peso_tejido_valor(@tarifa,2.20,@c01,@densidad) + @verticales*@alto) + dbo.temp_fn_precio_tarifa_embalaje(@tarifa,220.0,1) + dbo.fn_solarmanes_precio_articulos_tipo_7(@tarifa,220,@c01) + @monetarios + dbo.fn_solarmanes_precio_articulos_tipo_8(@tarifa,220,@c01)
		set @c12 = @margen2 * (dbo.fn_solarmanes_precio_tejido(240.0,100*@alto,@criterio,@margen,@preciom2,1) + @unitarios + dbo.fn_Tarifa_Lineales(@tarifa,240.0) + dbo.fn_precio_tarifa_montaje(@tarifa,240.0,@preciomontaje,@margen) +  @margen*dbo.fn_solarmanes_peso_tejido_valor(@tarifa,2.40,@c01,@densidad) + @verticales*@alto) + dbo.temp_fn_precio_tarifa_embalaje(@tarifa,240.0,1) + dbo.fn_solarmanes_precio_articulos_tipo_7(@tarifa,240,@c01) + @monetarios + dbo.fn_solarmanes_precio_articulos_tipo_8(@tarifa,240,@c01)
		set @c13 = @margen2 * (dbo.fn_solarmanes_precio_tejido(260.0,100*@alto,@criterio,@margen,@preciom2,1) + @unitarios + dbo.fn_Tarifa_Lineales(@tarifa,260.0) + dbo.fn_precio_tarifa_montaje(@tarifa,260.0,@preciomontaje,@margen) +  @margen*dbo.fn_solarmanes_peso_tejido_valor(@tarifa,2.60,@c01,@densidad) + @verticales*@alto) + dbo.temp_fn_precio_tarifa_embalaje(@tarifa,260.0,1) + dbo.fn_solarmanes_precio_articulos_tipo_7(@tarifa,260,@c01) + @monetarios + dbo.fn_solarmanes_precio_articulos_tipo_8(@tarifa,260,@c01)
		set @c14 = @margen2 * (dbo.fn_solarmanes_precio_tejido(280.0,100*@alto,@criterio,@margen,@preciom2,1) + @unitarios + dbo.fn_Tarifa_Lineales(@tarifa,280.0) + dbo.fn_precio_tarifa_montaje(@tarifa,280.0,@preciomontaje,@margen) +  @margen*dbo.fn_solarmanes_peso_tejido_valor(@tarifa,2.80,@c01,@densidad) + @verticales*@alto) + dbo.temp_fn_precio_tarifa_embalaje(@tarifa,280.0,1) + dbo.fn_solarmanes_precio_articulos_tipo_7(@tarifa,280,@c01) + @monetarios + dbo.fn_solarmanes_precio_articulos_tipo_8(@tarifa,280,@c01)
		set @c15 = @margen2 * (dbo.fn_solarmanes_precio_tejido(300.0,100*@alto,@criterio,@margen,@preciom2,1) + @unitarios + dbo.fn_Tarifa_Lineales(@tarifa,300.0) + dbo.fn_precio_tarifa_montaje(@tarifa,300.0,@preciomontaje,@margen) +  @margen*dbo.fn_solarmanes_peso_tejido_valor(@tarifa,3.00,@c01,@densidad) + @verticales*@alto) + dbo.temp_fn_precio_tarifa_embalaje(@tarifa,300.0,1) + dbo.fn_solarmanes_precio_articulos_tipo_7(@tarifa,300,@c01) + @monetarios + dbo.fn_solarmanes_precio_articulos_tipo_8(@tarifa,300,@c01)
		set @c16 = @margen2 * (dbo.fn_solarmanes_precio_tejido(320.0,100*@alto,@criterio,@margen,@preciom2,1) + @unitarios + dbo.fn_Tarifa_Lineales(@tarifa,320.0) + dbo.fn_precio_tarifa_montaje(@tarifa,320.0,@preciomontaje,@margen) +  @margen*dbo.fn_solarmanes_peso_tejido_valor(@tarifa,3.20,@c01,@densidad) + @verticales*@alto) + dbo.temp_fn_precio_tarifa_embalaje(@tarifa,320.0,1) + dbo.fn_solarmanes_precio_articulos_tipo_7(@tarifa,320,@c01) + @monetarios + dbo.fn_solarmanes_precio_articulos_tipo_8(@tarifa,320,@c01)
		set @c17 = @margen2 * (dbo.fn_solarmanes_precio_tejido(340.0,100*@alto,@criterio,@margen,@preciom2,1) + @unitarios + dbo.fn_Tarifa_Lineales(@tarifa,340.0) + dbo.fn_precio_tarifa_montaje(@tarifa,340.0,@preciomontaje,@margen) +  @margen*dbo.fn_solarmanes_peso_tejido_valor(@tarifa,3.40,@c01,@densidad) + @verticales*@alto) + dbo.temp_fn_precio_tarifa_embalaje(@tarifa,340.0,1) + dbo.fn_solarmanes_precio_articulos_tipo_7(@tarifa,340,@c01) + @monetarios + dbo.fn_solarmanes_precio_articulos_tipo_8(@tarifa,340,@c01)
		set @c18 = @margen2 * (dbo.fn_solarmanes_precio_tejido(360.0,100*@alto,@criterio,@margen,@preciom2,1) + @unitarios + dbo.fn_Tarifa_Lineales(@tarifa,360.0) + dbo.fn_precio_tarifa_montaje(@tarifa,360.0,@preciomontaje,@margen) +  @margen*dbo.fn_solarmanes_peso_tejido_valor(@tarifa,3.60,@c01,@densidad) + @verticales*@alto) + dbo.temp_fn_precio_tarifa_embalaje(@tarifa,360.0,1) + dbo.fn_solarmanes_precio_articulos_tipo_7(@tarifa,360,@c01) + @monetarios + dbo.fn_solarmanes_precio_articulos_tipo_8(@tarifa,360,@c01)
		set @c19 = @margen2 * (dbo.fn_solarmanes_precio_tejido(380.0,100*@alto,@criterio,@margen,@preciom2,1) + @unitarios + dbo.fn_Tarifa_Lineales(@tarifa,380.0) + dbo.fn_precio_tarifa_montaje(@tarifa,380.0,@preciomontaje,@margen) +  @margen*dbo.fn_solarmanes_peso_tejido_valor(@tarifa,3.80,@c01,@densidad) + @verticales*@alto) + dbo.temp_fn_precio_tarifa_embalaje(@tarifa,380.0,1) + dbo.fn_solarmanes_precio_articulos_tipo_7(@tarifa,380,@c01) + @monetarios + dbo.fn_solarmanes_precio_articulos_tipo_8(@tarifa,380,@c01)
		set @c20 = @margen2 * (dbo.fn_solarmanes_precio_tejido(400.0,100*@alto,@criterio,@margen,@preciom2,1) + @unitarios + dbo.fn_Tarifa_Lineales(@tarifa,400.0) + dbo.fn_precio_tarifa_montaje(@tarifa,400.0,@preciomontaje,@margen) +  @margen*dbo.fn_solarmanes_peso_tejido_valor(@tarifa,4.00,@c01,@densidad) + @verticales*@alto) + dbo.temp_fn_precio_tarifa_embalaje(@tarifa,400.0,1) + dbo.fn_solarmanes_precio_articulos_tipo_7(@tarifa,400,@c01) + @monetarios + dbo.fn_solarmanes_precio_articulos_tipo_8(@tarifa,400,@c01)
		set @c21 = @margen2 * (dbo.fn_solarmanes_precio_tejido(420.0,100*@alto,@criterio,@margen,@preciom2,1) + @unitarios + dbo.fn_Tarifa_Lineales(@tarifa,420.0) + dbo.fn_precio_tarifa_montaje(@tarifa,420.0,@preciomontaje,@margen) +  @margen*dbo.fn_solarmanes_peso_tejido_valor(@tarifa,4.20,@c01,@densidad) + @verticales*@alto) + dbo.temp_fn_precio_tarifa_embalaje(@tarifa,420.0,1) + dbo.fn_solarmanes_precio_articulos_tipo_7(@tarifa,420,@c01) + @monetarios + dbo.fn_solarmanes_precio_articulos_tipo_8(@tarifa,420,@c01)
		set @c22 = @margen2 * (dbo.fn_solarmanes_precio_tejido(440.0,100*@alto,@criterio,@margen,@preciom2,1) + @unitarios + dbo.fn_Tarifa_Lineales(@tarifa,440.0) + dbo.fn_precio_tarifa_montaje(@tarifa,440.0,@preciomontaje,@margen) +  @margen*dbo.fn_solarmanes_peso_tejido_valor(@tarifa,4.40,@c01,@densidad) + @verticales*@alto) + dbo.temp_fn_precio_tarifa_embalaje(@tarifa,440.0,1) + dbo.fn_solarmanes_precio_articulos_tipo_7(@tarifa,440,@c01) + @monetarios + dbo.fn_solarmanes_precio_articulos_tipo_8(@tarifa,440,@c01)
		set @c23 = @margen2 * (dbo.fn_solarmanes_precio_tejido(460.0,100*@alto,@criterio,@margen,@preciom2,1) + @unitarios + dbo.fn_Tarifa_Lineales(@tarifa,460.0) + dbo.fn_precio_tarifa_montaje(@tarifa,460.0,@preciomontaje,@margen) +  @margen*dbo.fn_solarmanes_peso_tejido_valor(@tarifa,4.60,@c01,@densidad) + @verticales*@alto) + dbo.temp_fn_precio_tarifa_embalaje(@tarifa,460.0,1) + dbo.fn_solarmanes_precio_articulos_tipo_7(@tarifa,460,@c01) + @monetarios + dbo.fn_solarmanes_precio_articulos_tipo_8(@tarifa,460,@c01)
		set @c24 = @margen2 * (dbo.fn_solarmanes_precio_tejido(480.0,100*@alto,@criterio,@margen,@preciom2,1) + @unitarios + dbo.fn_Tarifa_Lineales(@tarifa,480.0) + dbo.fn_precio_tarifa_montaje(@tarifa,480.0,@preciomontaje,@margen) +  @margen*dbo.fn_solarmanes_peso_tejido_valor(@tarifa,4.80,@c01,@densidad) + @verticales*@alto) + dbo.temp_fn_precio_tarifa_embalaje(@tarifa,480.0,1) + dbo.fn_solarmanes_precio_articulos_tipo_7(@tarifa,480,@c01) + @monetarios + dbo.fn_solarmanes_precio_articulos_tipo_8(@tarifa,480,@c01)
		set @c25 = @margen2 * (dbo.fn_solarmanes_precio_tejido(500.0,100*@alto,@criterio,@margen,@preciom2,1) + @unitarios + dbo.fn_Tarifa_Lineales(@tarifa,500.0) + dbo.fn_precio_tarifa_montaje(@tarifa,500.0,@preciomontaje,@margen) +  @margen*dbo.fn_solarmanes_peso_tejido_valor(@tarifa,5.00,@c01,@densidad) + @verticales*@alto) + dbo.temp_fn_precio_tarifa_embalaje(@tarifa,500.0,1) + dbo.fn_solarmanes_precio_articulos_tipo_7(@tarifa,500,@c01) + @monetarios + dbo.fn_solarmanes_precio_articulos_tipo_8(@tarifa,500,@c01)
		set @c26 = @margen2 * (dbo.fn_solarmanes_precio_tejido(520.0,100*@alto,@criterio,@margen,@preciom2,1) + @unitarios + dbo.fn_Tarifa_Lineales(@tarifa,520.0) + dbo.fn_precio_tarifa_montaje(@tarifa,520.0,@preciomontaje,@margen) +  @margen*dbo.fn_solarmanes_peso_tejido_valor(@tarifa,5.20,@c01,@densidad) + @verticales*@alto) + dbo.temp_fn_precio_tarifa_embalaje(@tarifa,520.0,1) + dbo.fn_solarmanes_precio_articulos_tipo_7(@tarifa,520,@c01) + @monetarios + dbo.fn_solarmanes_precio_articulos_tipo_8(@tarifa,520,@c01)
		set @c27 = @margen2 * ( dbo.fn_solarmanes_precio_tejido(540.0,100*@alto,@criterio,@margen,@preciom2,1) + @unitarios + dbo.fn_Tarifa_Lineales(@tarifa,540.0) + dbo.fn_precio_tarifa_montaje(@tarifa,540.0,@preciomontaje,@margen) +  @margen*dbo.fn_solarmanes_peso_tejido_valor(@tarifa,5.40,@c01,@densidad) + @verticales*@alto) + dbo.temp_fn_precio_tarifa_embalaje(@tarifa,540.0,1) + dbo.fn_solarmanes_precio_articulos_tipo_7(@tarifa,540,@c01) + @monetarios + dbo.fn_solarmanes_precio_articulos_tipo_8(@tarifa,540,@c01)
		set @c28 = @margen2 * (dbo.fn_solarmanes_precio_tejido(560.0,100*@alto,@criterio,@margen,@preciom2,1) + @unitarios + dbo.fn_Tarifa_Lineales(@tarifa,560.0) + dbo.fn_precio_tarifa_montaje(@tarifa,560.0,@preciomontaje,@margen) +  @margen*dbo.fn_solarmanes_peso_tejido_valor(@tarifa,5.60,@c01,@densidad) + @verticales*@alto) + dbo.temp_fn_precio_tarifa_embalaje(@tarifa,560.0,1) + dbo.fn_solarmanes_precio_articulos_tipo_7(@tarifa,560,@c01) + @monetarios + dbo.fn_solarmanes_precio_articulos_tipo_8(@tarifa,560,@c01)
		set @c29 = @margen2 * (dbo.fn_solarmanes_precio_tejido(580.0,100*@alto,@criterio,@margen,@preciom2,1) + @unitarios + dbo.fn_Tarifa_Lineales(@tarifa,580.0) + dbo.fn_precio_tarifa_montaje(@tarifa,580.0,@preciomontaje,@margen) +  @margen*dbo.fn_solarmanes_peso_tejido_valor(@tarifa,5.80,@c01,@densidad) + @verticales*@alto) + dbo.temp_fn_precio_tarifa_embalaje(@tarifa,580.0,1) + dbo.fn_solarmanes_precio_articulos_tipo_7(@tarifa,580,@c01) + @monetarios + dbo.fn_solarmanes_precio_articulos_tipo_8(@tarifa,580,@c01)
		set @c30 = @margen2 * (dbo.fn_solarmanes_precio_tejido(600.0,100*@alto,@criterio,@margen,@preciom2,1) + @unitarios + dbo.fn_Tarifa_Lineales(@tarifa,600.0) + dbo.fn_precio_tarifa_montaje(@tarifa,600.0,@preciomontaje,@margen) +  @margen*dbo.fn_solarmanes_peso_tejido_valor(@tarifa,6.00,@c01,@densidad) + @verticales*@alto) + dbo.temp_fn_precio_tarifa_embalaje(@tarifa,600.0,1) + dbo.fn_solarmanes_precio_articulos_tipo_7(@tarifa,600,@c01) + @monetarios + dbo.fn_solarmanes_precio_articulos_tipo_8(@tarifa,600,@c01)
		
		set @c31 = 0
		set @c32 = 0
		end

		if @tipoproducto = 2
		begin
		set @c02 = @margen2 * (dbo.fn_solarmanes_precio_tejido(40.0,100*@alto,@criterio,@margen,@preciom2,1) + @unitarios  + dbo.fn_Tarifa_Lineales(@tarifa,40.0) + dbo.fn_precio_tarifa_montaje(@tarifa,40.0,@preciomontaje,@margen)   +  @margen*dbo.fn_solarmanes_peso_tejido_valor(@tarifa,0.40,@c01,@densidad) + @verticales*@alto) + dbo.temp_fn_precio_tarifa_embalaje(@tarifa,40.0,1) + dbo.fn_solarmanes_precio_articulos_tipo_7(@tarifa,40,@c01) + @monetarios + dbo.fn_solarmanes_precio_articulos_tipo_8(@tarifa,40,@c01)
		set @c03 = @margen2 * (dbo.fn_solarmanes_precio_tejido(60.0,100*@alto,@criterio,@margen,@preciom2,1) + @unitarios  + dbo.fn_Tarifa_Lineales(@tarifa,60.0) + dbo.fn_precio_tarifa_montaje(@tarifa,60.0,@preciomontaje,@margen)   +  @margen*dbo.fn_solarmanes_peso_tejido_valor(@tarifa,0.60,@c01,@densidad) + @verticales*@alto) + dbo.temp_fn_precio_tarifa_embalaje(@tarifa,60.0,1) + dbo.fn_solarmanes_precio_articulos_tipo_7(@tarifa,60,@c01) + @monetarios + dbo.fn_solarmanes_precio_articulos_tipo_8(@tarifa,60,@c01)
		set @c04 = @margen2 * (dbo.fn_solarmanes_precio_tejido(80.0,100*@alto,@criterio,@margen,@preciom2,1)  + @unitarios + dbo.fn_Tarifa_Lineales(@tarifa,80.0) + dbo.fn_precio_tarifa_montaje(@tarifa,80.0,@preciomontaje,@margen)   +  @margen*dbo.fn_solarmanes_peso_tejido_valor(@tarifa,0.80,@c01,@densidad) + @verticales*@alto) + dbo.temp_fn_precio_tarifa_embalaje(@tarifa,80.0,1) + dbo.fn_solarmanes_precio_articulos_tipo_7(@tarifa,80,@c01) + @monetarios + dbo.fn_solarmanes_precio_articulos_tipo_8(@tarifa,80,@c01)
		set @c05 = @margen2 * (dbo.fn_solarmanes_precio_tejido(100.0,100*@alto,@criterio,@margen,@preciom2,1) + @unitarios + dbo.fn_Tarifa_Lineales(@tarifa,100.0) + dbo.fn_precio_tarifa_montaje(@tarifa,100.0,@preciomontaje,@margen) +  @margen*dbo.fn_solarmanes_peso_tejido_valor(@tarifa,1.00,@c01,@densidad) + @verticales*@alto) + dbo.temp_fn_precio_tarifa_embalaje(@tarifa,100.0,1) + dbo.fn_solarmanes_precio_articulos_tipo_7(@tarifa,100,@c01) + @monetarios + dbo.fn_solarmanes_precio_articulos_tipo_8(@tarifa,100,@c01)
		set @c06 = @margen2 * (dbo.fn_solarmanes_precio_tejido(120.0,100*@alto,@criterio,@margen,@preciom2,1) + @unitarios + dbo.fn_Tarifa_Lineales(@tarifa,120.0) + dbo.fn_precio_tarifa_montaje(@tarifa,120.0,@preciomontaje,@margen) +  @margen*dbo.fn_solarmanes_peso_tejido_valor(@tarifa,1.20,@c01,@densidad) + @verticales*@alto) + dbo.temp_fn_precio_tarifa_embalaje(@tarifa,120.0,1) + dbo.fn_solarmanes_precio_articulos_tipo_7(@tarifa,120,@c01) + @monetarios + dbo.fn_solarmanes_precio_articulos_tipo_8(@tarifa,120,@c01)
		set @c07 = @margen2 * (dbo.fn_solarmanes_precio_tejido(140.0,100*@alto,@criterio,@margen,@preciom2,1) + @unitarios + dbo.fn_Tarifa_Lineales(@tarifa,140.0) + dbo.fn_precio_tarifa_montaje(@tarifa,140.0,@preciomontaje,@margen) +  @margen*dbo.fn_solarmanes_peso_tejido_valor(@tarifa,1.40,@c01,@densidad) + @verticales*@alto) + dbo.temp_fn_precio_tarifa_embalaje(@tarifa,140.0,1) + dbo.fn_solarmanes_precio_articulos_tipo_7(@tarifa,140,@c01) + @monetarios + dbo.fn_solarmanes_precio_articulos_tipo_8(@tarifa,140,@c01)
		set @c08 = @margen2 * (dbo.fn_solarmanes_precio_tejido(160.0,100*@alto,@criterio,@margen,@preciom2,1) + @unitarios + dbo.fn_Tarifa_Lineales(@tarifa,160.0) + dbo.fn_precio_tarifa_montaje(@tarifa,160.0,@preciomontaje,@margen) +  @margen*dbo.fn_solarmanes_peso_tejido_valor(@tarifa,1.60,@c01,@densidad) + @verticales*@alto) + dbo.temp_fn_precio_tarifa_embalaje(@tarifa,160.0,1) + dbo.fn_solarmanes_precio_articulos_tipo_7(@tarifa,160,@c01) + @monetarios + dbo.fn_solarmanes_precio_articulos_tipo_8(@tarifa,160,@c01)
		set @c09 = @margen2 * (dbo.fn_solarmanes_precio_tejido(180.0,100*@alto,@criterio,@margen,@preciom2,1) + @unitarios + dbo.fn_Tarifa_Lineales(@tarifa,180.0) + dbo.fn_precio_tarifa_montaje(@tarifa,180.0,@preciomontaje,@margen) +  @margen*dbo.fn_solarmanes_peso_tejido_valor(@tarifa,1.80,@c01,@densidad) + @verticales*@alto) + dbo.temp_fn_precio_tarifa_embalaje(@tarifa,180.0,1) + dbo.fn_solarmanes_precio_articulos_tipo_7(@tarifa,180,@c01) + @monetarios + dbo.fn_solarmanes_precio_articulos_tipo_8(@tarifa,180,@c01)
		set @c10 = @margen2 * (dbo.fn_solarmanes_precio_tejido(200.0,100*@alto,@criterio,@margen,@preciom2,1) + @unitarios + dbo.fn_Tarifa_Lineales(@tarifa,200.0) + dbo.fn_precio_tarifa_montaje(@tarifa,200.0,@preciomontaje,@margen) +  @margen*dbo.fn_solarmanes_peso_tejido_valor(@tarifa,2.00,@c01,@densidad) + @verticales*@alto) + dbo.temp_fn_precio_tarifa_embalaje(@tarifa,200.0,1) + dbo.fn_solarmanes_precio_articulos_tipo_7(@tarifa,200,@c01) + @monetarios + dbo.fn_solarmanes_precio_articulos_tipo_8(@tarifa,200,@c01)
		set @c11 = @margen2 * (dbo.fn_solarmanes_precio_tejido(220.0,100*@alto,@criterio,@margen,@preciom2,1) + @unitarios + dbo.fn_Tarifa_Lineales(@tarifa,220.0) + dbo.fn_precio_tarifa_montaje(@tarifa,220.0,@preciomontaje,@margen) +  @margen*dbo.fn_solarmanes_peso_tejido_valor(@tarifa,2.20,@c01,@densidad) + @verticales*@alto) + dbo.temp_fn_precio_tarifa_embalaje(@tarifa,220.0,1) + dbo.fn_solarmanes_precio_articulos_tipo_7(@tarifa,220,@c01) + @monetarios + dbo.fn_solarmanes_precio_articulos_tipo_8(@tarifa,220,@c01)
		set @c12 = @margen2 * (dbo.fn_solarmanes_precio_tejido(240.0,100*@alto,@criterio,@margen,@preciom2,1) + @unitarios + dbo.fn_Tarifa_Lineales(@tarifa,240.0) + dbo.fn_precio_tarifa_montaje(@tarifa,240.0,@preciomontaje,@margen) +  @margen*dbo.fn_solarmanes_peso_tejido_valor(@tarifa,2.40,@c01,@densidad) + @verticales*@alto) + dbo.temp_fn_precio_tarifa_embalaje(@tarifa,240.0,1) + dbo.fn_solarmanes_precio_articulos_tipo_7(@tarifa,240,@c01) + @monetarios + dbo.fn_solarmanes_precio_articulos_tipo_8(@tarifa,240,@c01)
		set @c13 = @margen2 * (dbo.fn_solarmanes_precio_tejido(260.0,100*@alto,@criterio,@margen,@preciom2,1) + @unitarios + dbo.fn_Tarifa_Lineales(@tarifa,260.0) + dbo.fn_precio_tarifa_montaje(@tarifa,260.0,@preciomontaje,@margen) +  @margen*dbo.fn_solarmanes_peso_tejido_valor(@tarifa,2.60,@c01,@densidad) + @verticales*@alto) + dbo.temp_fn_precio_tarifa_embalaje(@tarifa,260.0,1) + dbo.fn_solarmanes_precio_articulos_tipo_7(@tarifa,260,@c01) + @monetarios + dbo.fn_solarmanes_precio_articulos_tipo_8(@tarifa,260,@c01)
		set @c14 = @margen2 * (dbo.fn_solarmanes_precio_tejido(280.0,100*@alto,@criterio,@margen,@preciom2,1) + @unitarios + dbo.fn_Tarifa_Lineales(@tarifa,280.0) + dbo.fn_precio_tarifa_montaje(@tarifa,280.0,@preciomontaje,@margen) +  @margen*dbo.fn_solarmanes_peso_tejido_valor(@tarifa,2.80,@c01,@densidad) + @verticales*@alto) + dbo.temp_fn_precio_tarifa_embalaje(@tarifa,280.0,1) + dbo.fn_solarmanes_precio_articulos_tipo_7(@tarifa,280,@c01) + @monetarios + dbo.fn_solarmanes_precio_articulos_tipo_8(@tarifa,280,@c01)
		set @c15 = @margen2 * (dbo.fn_solarmanes_precio_tejido(300.0,100*@alto,@criterio,@margen,@preciom2,1) + @unitarios + dbo.fn_Tarifa_Lineales(@tarifa,300.0) + dbo.fn_precio_tarifa_montaje(@tarifa,300.0,@preciomontaje,@margen) +  @margen*dbo.fn_solarmanes_peso_tejido_valor(@tarifa,3.00,@c01,@densidad) + @verticales*@alto) + dbo.temp_fn_precio_tarifa_embalaje(@tarifa,300.0,1) + dbo.fn_solarmanes_precio_articulos_tipo_7(@tarifa,300,@c01) + @monetarios + dbo.fn_solarmanes_precio_articulos_tipo_8(@tarifa,300,@c01)
		set @c16 = @margen2 * (dbo.fn_solarmanes_precio_tejido(320.0,100*@alto,@criterio,@margen,@preciom2,1) + @unitarios + dbo.fn_Tarifa_Lineales(@tarifa,320.0) + dbo.fn_precio_tarifa_montaje(@tarifa,320.0,@preciomontaje,@margen) +  @margen*dbo.fn_solarmanes_peso_tejido_valor(@tarifa,3.20,@c01,@densidad) + @verticales*@alto) + dbo.temp_fn_precio_tarifa_embalaje(@tarifa,320.0,1) + dbo.fn_solarmanes_precio_articulos_tipo_7(@tarifa,320,@c01) + @monetarios + dbo.fn_solarmanes_precio_articulos_tipo_8(@tarifa,320,@c01)
		set @c17 = @margen2 * (dbo.fn_solarmanes_precio_tejido(340.0,100*@alto,@criterio,@margen,@preciom2,1) + @unitarios + dbo.fn_Tarifa_Lineales(@tarifa,340.0) + dbo.fn_precio_tarifa_montaje(@tarifa,340.0,@preciomontaje,@margen) +  @margen*dbo.fn_solarmanes_peso_tejido_valor(@tarifa,3.40,@c01,@densidad) + @verticales*@alto) + dbo.temp_fn_precio_tarifa_embalaje(@tarifa,340.0,1) + dbo.fn_solarmanes_precio_articulos_tipo_7(@tarifa,340,@c01) + @monetarios + dbo.fn_solarmanes_precio_articulos_tipo_8(@tarifa,340,@c01)
		set @c18 = @margen2 * (dbo.fn_solarmanes_precio_tejido(360.0,100*@alto,@criterio,@margen,@preciom2,1) + @unitarios + dbo.fn_Tarifa_Lineales(@tarifa,360.0) + dbo.fn_precio_tarifa_montaje(@tarifa,360.0,@preciomontaje,@margen) +  @margen*dbo.fn_solarmanes_peso_tejido_valor(@tarifa,3.60,@c01,@densidad) + @verticales*@alto) + dbo.temp_fn_precio_tarifa_embalaje(@tarifa,360.0,1) + dbo.fn_solarmanes_precio_articulos_tipo_7(@tarifa,360,@c01) + @monetarios + dbo.fn_solarmanes_precio_articulos_tipo_8(@tarifa,360,@c01)
		set @c19 = @margen2 * (dbo.fn_solarmanes_precio_tejido(380.0,100*@alto,@criterio,@margen,@preciom2,1) + @unitarios + dbo.fn_Tarifa_Lineales(@tarifa,380.0) + dbo.fn_precio_tarifa_montaje(@tarifa,380.0,@preciomontaje,@margen) +  @margen*dbo.fn_solarmanes_peso_tejido_valor(@tarifa,3.80,@c01,@densidad) + @verticales*@alto) + dbo.temp_fn_precio_tarifa_embalaje(@tarifa,380.0,1) + dbo.fn_solarmanes_precio_articulos_tipo_7(@tarifa,380,@c01) + @monetarios + dbo.fn_solarmanes_precio_articulos_tipo_8(@tarifa,380,@c01)
		set @c20 = @margen2 * (dbo.fn_solarmanes_precio_tejido(400.0,100*@alto,@criterio,@margen,@preciom2,1) + @unitarios + dbo.fn_Tarifa_Lineales(@tarifa,400.0) + dbo.fn_precio_tarifa_montaje(@tarifa,400.0,@preciomontaje,@margen) +  @margen*dbo.fn_solarmanes_peso_tejido_valor(@tarifa,4.00,@c01,@densidad) + @verticales*@alto) + dbo.temp_fn_precio_tarifa_embalaje(@tarifa,400.0,1) + dbo.fn_solarmanes_precio_articulos_tipo_7(@tarifa,400,@c01) + @monetarios + dbo.fn_solarmanes_precio_articulos_tipo_8(@tarifa,400,@c01)
		set @c21 = @margen2 * (dbo.fn_solarmanes_precio_tejido(420.0,100*@alto,@criterio,@margen,@preciom2,1) + @unitarios + dbo.fn_Tarifa_Lineales(@tarifa,420.0) + dbo.fn_precio_tarifa_montaje(@tarifa,420.0,@preciomontaje,@margen) +  @margen*dbo.fn_solarmanes_peso_tejido_valor(@tarifa,4.20,@c01,@densidad) + @verticales*@alto) + dbo.temp_fn_precio_tarifa_embalaje(@tarifa,420.0,1) + dbo.fn_solarmanes_precio_articulos_tipo_7(@tarifa,420,@c01) + @monetarios + dbo.fn_solarmanes_precio_articulos_tipo_8(@tarifa,420,@c01)
		set @c22 = @margen2 * (dbo.fn_solarmanes_precio_tejido(440.0,100*@alto,@criterio,@margen,@preciom2,1) + @unitarios + dbo.fn_Tarifa_Lineales(@tarifa,440.0) + dbo.fn_precio_tarifa_montaje(@tarifa,440.0,@preciomontaje,@margen) +  @margen*dbo.fn_solarmanes_peso_tejido_valor(@tarifa,4.40,@c01,@densidad) + @verticales*@alto) + dbo.temp_fn_precio_tarifa_embalaje(@tarifa,440.0,1) + dbo.fn_solarmanes_precio_articulos_tipo_7(@tarifa,440,@c01) + @monetarios + dbo.fn_solarmanes_precio_articulos_tipo_8(@tarifa,440,@c01)
		set @c23 = @margen2 * (dbo.fn_solarmanes_precio_tejido(460.0,100*@alto,@criterio,@margen,@preciom2,1) + @unitarios + dbo.fn_Tarifa_Lineales(@tarifa,460.0) + dbo.fn_precio_tarifa_montaje(@tarifa,460.0,@preciomontaje,@margen) +  @margen*dbo.fn_solarmanes_peso_tejido_valor(@tarifa,4.60,@c01,@densidad) + @verticales*@alto) + dbo.temp_fn_precio_tarifa_embalaje(@tarifa,460.0,1) + dbo.fn_solarmanes_precio_articulos_tipo_7(@tarifa,460,@c01) + @monetarios + dbo.fn_solarmanes_precio_articulos_tipo_8(@tarifa,460,@c01)
		set @c24 = @margen2 * (dbo.fn_solarmanes_precio_tejido(480.0,100*@alto,@criterio,@margen,@preciom2,1) + @unitarios + dbo.fn_Tarifa_Lineales(@tarifa,480.0) + dbo.fn_precio_tarifa_montaje(@tarifa,480.0,@preciomontaje,@margen) +  @margen*dbo.fn_solarmanes_peso_tejido_valor(@tarifa,4.80,@c01,@densidad) + @verticales*@alto) + dbo.temp_fn_precio_tarifa_embalaje(@tarifa,480.0,1) + dbo.fn_solarmanes_precio_articulos_tipo_7(@tarifa,480,@c01) + @monetarios + dbo.fn_solarmanes_precio_articulos_tipo_8(@tarifa,480,@c01)
		set @c25 = @margen2 * (dbo.fn_solarmanes_precio_tejido(500.0,100*@alto,@criterio,@margen,@preciom2,1) + @unitarios + dbo.fn_Tarifa_Lineales(@tarifa,500.0) + dbo.fn_precio_tarifa_montaje(@tarifa,500.0,@preciomontaje,@margen) +  @margen*dbo.fn_solarmanes_peso_tejido_valor(@tarifa,5.00,@c01,@densidad) + @verticales*@alto) + dbo.temp_fn_precio_tarifa_embalaje(@tarifa,500.0,1) + dbo.fn_solarmanes_precio_articulos_tipo_7(@tarifa,500,@c01) + @monetarios + dbo.fn_solarmanes_precio_articulos_tipo_8(@tarifa,500,@c01)
		set @c26 = @margen2 * (dbo.fn_solarmanes_precio_tejido(520.0,100*@alto,@criterio,@margen,@preciom2,1) + @unitarios + dbo.fn_Tarifa_Lineales(@tarifa,520.0) + dbo.fn_precio_tarifa_montaje(@tarifa,520.0,@preciomontaje,@margen) +  @margen*dbo.fn_solarmanes_peso_tejido_valor(@tarifa,5.20,@c01,@densidad) + @verticales*@alto) + dbo.temp_fn_precio_tarifa_embalaje(@tarifa,520.0,1) + dbo.fn_solarmanes_precio_articulos_tipo_7(@tarifa,520,@c01) + @monetarios + dbo.fn_solarmanes_precio_articulos_tipo_8(@tarifa,520,@c01)
		set @c27 = @margen2 * ( dbo.fn_solarmanes_precio_tejido(540.0,100*@alto,@criterio,@margen,@preciom2,1) + @unitarios + dbo.fn_Tarifa_Lineales(@tarifa,540.0) + dbo.fn_precio_tarifa_montaje(@tarifa,540.0,@preciomontaje,@margen) +  @margen*dbo.fn_solarmanes_peso_tejido_valor(@tarifa,5.40,@c01,@densidad) + @verticales*@alto) + dbo.temp_fn_precio_tarifa_embalaje(@tarifa,540.0,1) + dbo.fn_solarmanes_precio_articulos_tipo_7(@tarifa,540,@c01) + @monetarios + dbo.fn_solarmanes_precio_articulos_tipo_8(@tarifa,540,@c01)
		set @c28 = @margen2 * (dbo.fn_solarmanes_precio_tejido(560.0,100*@alto,@criterio,@margen,@preciom2,1) + @unitarios + dbo.fn_Tarifa_Lineales(@tarifa,560.0) + dbo.fn_precio_tarifa_montaje(@tarifa,560.0,@preciomontaje,@margen) +  @margen*dbo.fn_solarmanes_peso_tejido_valor(@tarifa,5.60,@c01,@densidad) + @verticales*@alto) + dbo.temp_fn_precio_tarifa_embalaje(@tarifa,560.0,1) + dbo.fn_solarmanes_precio_articulos_tipo_7(@tarifa,560,@c01) + @monetarios + dbo.fn_solarmanes_precio_articulos_tipo_8(@tarifa,560,@c01)
		set @c29 = @margen2 * (dbo.fn_solarmanes_precio_tejido(580.0,100*@alto,@criterio,@margen,@preciom2,1) + @unitarios + dbo.fn_Tarifa_Lineales(@tarifa,580.0) + dbo.fn_precio_tarifa_montaje(@tarifa,580.0,@preciomontaje,@margen) +  @margen*dbo.fn_solarmanes_peso_tejido_valor(@tarifa,5.80,@c01,@densidad) + @verticales*@alto) + dbo.temp_fn_precio_tarifa_embalaje(@tarifa,580.0,1) + dbo.fn_solarmanes_precio_articulos_tipo_7(@tarifa,580,@c01) + @monetarios + dbo.fn_solarmanes_precio_articulos_tipo_8(@tarifa,580,@c01)
		set @c30 = @margen2 * (dbo.fn_solarmanes_precio_tejido(600.0,100*@alto,@criterio,@margen,@preciom2,1) + @unitarios + dbo.fn_Tarifa_Lineales(@tarifa,600.0) + dbo.fn_precio_tarifa_montaje(@tarifa,600.0,@preciomontaje,@margen) +  @margen*dbo.fn_solarmanes_peso_tejido_valor(@tarifa,6.00,@c01,@densidad) + @verticales*@alto) + dbo.temp_fn_precio_tarifa_embalaje(@tarifa,600.0,1) + dbo.fn_solarmanes_precio_articulos_tipo_7(@tarifa,600,@c01) + @monetarios + dbo.fn_solarmanes_precio_articulos_tipo_8(@tarifa,600,@c01)
		
		set @c31 = 0
		set @c32 = 0
		end

		if @tipoproducto = 3
		begin
		set @c02 = @margen2 * (dbo.fn_solarmanes_precio_tejido_vertical(40.0,100*@alto,@criterio,@margen,@preciom2,1) + @unitarios  + dbo.fn_Tarifa_Lineales(@tarifa,40.0) + dbo.fn_precio_tarifa_montaje(@tarifa,40.0,@preciomontaje,1.45)   +  @margen*dbo.fn_solarmanes_peso_tejido_valor(@tarifa,0.40,@c01,@densidad) + @verticales*@alto) + dbo.temp_fn_precio_tarifa_embalaje(@tarifa,40.0,1) + dbo.fn_solarmanes_precio_articulos_tipo_7(@tarifa,40,@c01) + @monetarios + dbo.fn_solarmanes_precio_articulos_tipo_8(@tarifa,40,@c01)
		set @c03 = @margen2 * (dbo.fn_solarmanes_precio_tejido_vertical(60.0,100*@alto,@criterio,@margen,@preciom2,1) + @unitarios  + dbo.fn_Tarifa_Lineales(@tarifa,60.0) + dbo.fn_precio_tarifa_montaje(@tarifa,60.0,@preciomontaje,1.45)   +  @margen*dbo.fn_solarmanes_peso_tejido_valor(@tarifa,0.60,@c01,@densidad) + @verticales*@alto) + dbo.temp_fn_precio_tarifa_embalaje(@tarifa,60.0,1) + dbo.fn_solarmanes_precio_articulos_tipo_7(@tarifa,60,@c01) + @monetarios + dbo.fn_solarmanes_precio_articulos_tipo_8(@tarifa,60,@c01)
		set @c04 = @margen2 * (dbo.fn_solarmanes_precio_tejido_vertical(80.0,100*@alto,@criterio,@margen,@preciom2,1)  + @unitarios + dbo.fn_Tarifa_Lineales(@tarifa,80.0) + dbo.fn_precio_tarifa_montaje(@tarifa,80.0,@preciomontaje,1.45)   +  @margen*dbo.fn_solarmanes_peso_tejido_valor(@tarifa,0.80,@c01,@densidad) + @verticales*@alto) + dbo.temp_fn_precio_tarifa_embalaje(@tarifa,80.0,1) + dbo.fn_solarmanes_precio_articulos_tipo_7(@tarifa,80,@c01) + @monetarios + dbo.fn_solarmanes_precio_articulos_tipo_8(@tarifa,80,@c01)
		set @c05 = @margen2 * (dbo.fn_solarmanes_precio_tejido_vertical(100.0,100*@alto,@criterio,@margen,@preciom2,1) + @unitarios + dbo.fn_Tarifa_Lineales(@tarifa,100.0) + dbo.fn_precio_tarifa_montaje(@tarifa,100.0,@preciomontaje,1.45) +  @margen*dbo.fn_solarmanes_peso_tejido_valor(@tarifa,1.00,@c01,@densidad) + @verticales*@alto) + dbo.temp_fn_precio_tarifa_embalaje(@tarifa,100.0,1) + dbo.fn_solarmanes_precio_articulos_tipo_7(@tarifa,100,@c01) + @monetarios + dbo.fn_solarmanes_precio_articulos_tipo_8(@tarifa,100,@c01)
		set @c06 = @margen2 * (dbo.fn_solarmanes_precio_tejido_vertical(120.0,100*@alto,@criterio,@margen,@preciom2,1) + @unitarios + dbo.fn_Tarifa_Lineales(@tarifa,120.0) + dbo.fn_precio_tarifa_montaje(@tarifa,120.0,@preciomontaje,1.45) +  @margen*dbo.fn_solarmanes_peso_tejido_valor(@tarifa,1.20,@c01,@densidad) + @verticales*@alto) + dbo.temp_fn_precio_tarifa_embalaje(@tarifa,120.0,1) + dbo.fn_solarmanes_precio_articulos_tipo_7(@tarifa,120,@c01) + @monetarios + dbo.fn_solarmanes_precio_articulos_tipo_8(@tarifa,120,@c01)
		set @c07 = @margen2 * (dbo.fn_solarmanes_precio_tejido_vertical(140.0,100*@alto,@criterio,@margen,@preciom2,1) + @unitarios + dbo.fn_Tarifa_Lineales(@tarifa,140.0) + dbo.fn_precio_tarifa_montaje(@tarifa,140.0,@preciomontaje,1.45) +  @margen*dbo.fn_solarmanes_peso_tejido_valor(@tarifa,1.40,@c01,@densidad) + @verticales*@alto) + dbo.temp_fn_precio_tarifa_embalaje(@tarifa,140.0,1) + dbo.fn_solarmanes_precio_articulos_tipo_7(@tarifa,140,@c01) + @monetarios + dbo.fn_solarmanes_precio_articulos_tipo_8(@tarifa,140,@c01)
		set @c08 = @margen2 * (dbo.fn_solarmanes_precio_tejido_vertical(160.0,100*@alto,@criterio,@margen,@preciom2,1) + @unitarios + dbo.fn_Tarifa_Lineales(@tarifa,160.0) + dbo.fn_precio_tarifa_montaje(@tarifa,160.0,@preciomontaje,1.45) +  @margen*dbo.fn_solarmanes_peso_tejido_valor(@tarifa,1.60,@c01,@densidad) + @verticales*@alto) + dbo.temp_fn_precio_tarifa_embalaje(@tarifa,160.0,1) + dbo.fn_solarmanes_precio_articulos_tipo_7(@tarifa,160,@c01) + @monetarios + dbo.fn_solarmanes_precio_articulos_tipo_8(@tarifa,160,@c01)
		set @c09 = @margen2 * (dbo.fn_solarmanes_precio_tejido_vertical(180.0,100*@alto,@criterio,@margen,@preciom2,1) + @unitarios + dbo.fn_Tarifa_Lineales(@tarifa,180.0) + dbo.fn_precio_tarifa_montaje(@tarifa,180.0,@preciomontaje,1.45) +  @margen*dbo.fn_solarmanes_peso_tejido_valor(@tarifa,1.80,@c01,@densidad) + @verticales*@alto) + dbo.temp_fn_precio_tarifa_embalaje(@tarifa,180.0,1) + dbo.fn_solarmanes_precio_articulos_tipo_7(@tarifa,180,@c01) + @monetarios + dbo.fn_solarmanes_precio_articulos_tipo_8(@tarifa,180,@c01)
		set @c10 = @margen2 * (dbo.fn_solarmanes_precio_tejido_vertical(200.0,100*@alto,@criterio,@margen,@preciom2,1) + @unitarios + dbo.fn_Tarifa_Lineales(@tarifa,200.0) + dbo.fn_precio_tarifa_montaje(@tarifa,200.0,@preciomontaje,1.45) +  @margen*dbo.fn_solarmanes_peso_tejido_valor(@tarifa,2.00,@c01,@densidad) + @verticales*@alto) + dbo.temp_fn_precio_tarifa_embalaje(@tarifa,200.0,1) + dbo.fn_solarmanes_precio_articulos_tipo_7(@tarifa,200,@c01) + @monetarios + dbo.fn_solarmanes_precio_articulos_tipo_8(@tarifa,200,@c01)
		set @c11 = @margen2 * (dbo.fn_solarmanes_precio_tejido_vertical(220.0,100*@alto,@criterio,@margen,@preciom2,1) + @unitarios + dbo.fn_Tarifa_Lineales(@tarifa,220.0) + dbo.fn_precio_tarifa_montaje(@tarifa,220.0,@preciomontaje,1.45) +  @margen*dbo.fn_solarmanes_peso_tejido_valor(@tarifa,2.20,@c01,@densidad) + @verticales*@alto) + dbo.temp_fn_precio_tarifa_embalaje(@tarifa,220.0,1) + dbo.fn_solarmanes_precio_articulos_tipo_7(@tarifa,220,@c01) + @monetarios + dbo.fn_solarmanes_precio_articulos_tipo_8(@tarifa,220,@c01)
		set @c12 = @margen2 * (dbo.fn_solarmanes_precio_tejido_vertical(240.0,100*@alto,@criterio,@margen,@preciom2,1) + @unitarios + dbo.fn_Tarifa_Lineales(@tarifa,240.0) + dbo.fn_precio_tarifa_montaje(@tarifa,240.0,@preciomontaje,1.45) +  @margen*dbo.fn_solarmanes_peso_tejido_valor(@tarifa,2.40,@c01,@densidad) + @verticales*@alto) + dbo.temp_fn_precio_tarifa_embalaje(@tarifa,240.0,1) + dbo.fn_solarmanes_precio_articulos_tipo_7(@tarifa,240,@c01) + @monetarios + dbo.fn_solarmanes_precio_articulos_tipo_8(@tarifa,240,@c01)
		set @c13 = @margen2 * (dbo.fn_solarmanes_precio_tejido_vertical(260.0,100*@alto,@criterio,@margen,@preciom2,1) + @unitarios + dbo.fn_Tarifa_Lineales(@tarifa,260.0) + dbo.fn_precio_tarifa_montaje(@tarifa,260.0,@preciomontaje,1.45) +  @margen*dbo.fn_solarmanes_peso_tejido_valor(@tarifa,2.60,@c01,@densidad) + @verticales*@alto) + dbo.temp_fn_precio_tarifa_embalaje(@tarifa,260.0,1) + dbo.fn_solarmanes_precio_articulos_tipo_7(@tarifa,260,@c01) + @monetarios + dbo.fn_solarmanes_precio_articulos_tipo_8(@tarifa,260,@c01)
		set @c14 = @margen2 * (dbo.fn_solarmanes_precio_tejido_vertical(280.0,100*@alto,@criterio,@margen,@preciom2,1) + @unitarios + dbo.fn_Tarifa_Lineales(@tarifa,280.0) + dbo.fn_precio_tarifa_montaje(@tarifa,280.0,@preciomontaje,1.45) +  @margen*dbo.fn_solarmanes_peso_tejido_valor(@tarifa,2.80,@c01,@densidad) + @verticales*@alto) + dbo.temp_fn_precio_tarifa_embalaje(@tarifa,280.0,1) + dbo.fn_solarmanes_precio_articulos_tipo_7(@tarifa,280,@c01) + @monetarios + dbo.fn_solarmanes_precio_articulos_tipo_8(@tarifa,280,@c01)
		set @c15 = @margen2 * (dbo.fn_solarmanes_precio_tejido_vertical(300.0,100*@alto,@criterio,@margen,@preciom2,1) + @unitarios + dbo.fn_Tarifa_Lineales(@tarifa,300.0) + dbo.fn_precio_tarifa_montaje(@tarifa,300.0,@preciomontaje,1.45) +  @margen*dbo.fn_solarmanes_peso_tejido_valor(@tarifa,3.00,@c01,@densidad) + @verticales*@alto) + dbo.temp_fn_precio_tarifa_embalaje(@tarifa,300.0,1) + dbo.fn_solarmanes_precio_articulos_tipo_7(@tarifa,300,@c01) + @monetarios + dbo.fn_solarmanes_precio_articulos_tipo_8(@tarifa,300,@c01)
		set @c16 = @margen2 * (dbo.fn_solarmanes_precio_tejido_vertical(320.0,100*@alto,@criterio,@margen,@preciom2,1) + @unitarios + dbo.fn_Tarifa_Lineales(@tarifa,320.0) + dbo.fn_precio_tarifa_montaje(@tarifa,320.0,@preciomontaje,1.45) +  @margen*dbo.fn_solarmanes_peso_tejido_valor(@tarifa,3.20,@c01,@densidad) + @verticales*@alto) + dbo.temp_fn_precio_tarifa_embalaje(@tarifa,320.0,1) + dbo.fn_solarmanes_precio_articulos_tipo_7(@tarifa,320,@c01) + @monetarios + dbo.fn_solarmanes_precio_articulos_tipo_8(@tarifa,320,@c01)
		set @c17 = @margen2 * (dbo.fn_solarmanes_precio_tejido_vertical(340.0,100*@alto,@criterio,@margen,@preciom2,1) + @unitarios + dbo.fn_Tarifa_Lineales(@tarifa,340.0) + dbo.fn_precio_tarifa_montaje(@tarifa,340.0,@preciomontaje,1.45) +  @margen*dbo.fn_solarmanes_peso_tejido_valor(@tarifa,3.40,@c01,@densidad) + @verticales*@alto) + dbo.temp_fn_precio_tarifa_embalaje(@tarifa,340.0,1) + dbo.fn_solarmanes_precio_articulos_tipo_7(@tarifa,340,@c01) + @monetarios + dbo.fn_solarmanes_precio_articulos_tipo_8(@tarifa,340,@c01)
		set @c18 = @margen2 * (dbo.fn_solarmanes_precio_tejido_vertical(360.0,100*@alto,@criterio,@margen,@preciom2,1) + @unitarios + dbo.fn_Tarifa_Lineales(@tarifa,360.0) + dbo.fn_precio_tarifa_montaje(@tarifa,360.0,@preciomontaje,1.45) +  @margen*dbo.fn_solarmanes_peso_tejido_valor(@tarifa,3.60,@c01,@densidad) + @verticales*@alto) + dbo.temp_fn_precio_tarifa_embalaje(@tarifa,360.0,1) + dbo.fn_solarmanes_precio_articulos_tipo_7(@tarifa,360,@c01) + @monetarios + dbo.fn_solarmanes_precio_articulos_tipo_8(@tarifa,360,@c01)
		set @c19 = @margen2 * (dbo.fn_solarmanes_precio_tejido_vertical(380.0,100*@alto,@criterio,@margen,@preciom2,1) + @unitarios + dbo.fn_Tarifa_Lineales(@tarifa,380.0) + dbo.fn_precio_tarifa_montaje(@tarifa,380.0,@preciomontaje,1.45) +  @margen*dbo.fn_solarmanes_peso_tejido_valor(@tarifa,3.80,@c01,@densidad) + @verticales*@alto) + dbo.temp_fn_precio_tarifa_embalaje(@tarifa,380.0,1) + dbo.fn_solarmanes_precio_articulos_tipo_7(@tarifa,380,@c01) + @monetarios + dbo.fn_solarmanes_precio_articulos_tipo_8(@tarifa,380,@c01)
		set @c20 = @margen2 * (dbo.fn_solarmanes_precio_tejido_vertical(400.0,100*@alto,@criterio,@margen,@preciom2,1) + @unitarios + dbo.fn_Tarifa_Lineales(@tarifa,400.0) + dbo.fn_precio_tarifa_montaje(@tarifa,400.0,@preciomontaje,1.45) +  @margen*dbo.fn_solarmanes_peso_tejido_valor(@tarifa,4.00,@c01,@densidad) + @verticales*@alto) + dbo.temp_fn_precio_tarifa_embalaje(@tarifa,400.0,1) + dbo.fn_solarmanes_precio_articulos_tipo_7(@tarifa,400,@c01) + @monetarios + dbo.fn_solarmanes_precio_articulos_tipo_8(@tarifa,400,@c01)
		set @c21 = @margen2 * (dbo.fn_solarmanes_precio_tejido_vertical(420.0,100*@alto,@criterio,@margen,@preciom2,1) + @unitarios + dbo.fn_Tarifa_Lineales(@tarifa,420.0) + dbo.fn_precio_tarifa_montaje(@tarifa,420.0,@preciomontaje,1.45) +  @margen*dbo.fn_solarmanes_peso_tejido_valor(@tarifa,4.20,@c01,@densidad) + @verticales*@alto) + dbo.temp_fn_precio_tarifa_embalaje(@tarifa,420.0,1) + dbo.fn_solarmanes_precio_articulos_tipo_7(@tarifa,420,@c01) + @monetarios + dbo.fn_solarmanes_precio_articulos_tipo_8(@tarifa,420,@c01)
		set @c22 = @margen2 * (dbo.fn_solarmanes_precio_tejido_vertical(440.0,100*@alto,@criterio,@margen,@preciom2,1) + @unitarios + dbo.fn_Tarifa_Lineales(@tarifa,440.0) + dbo.fn_precio_tarifa_montaje(@tarifa,440.0,@preciomontaje,1.45) +  @margen*dbo.fn_solarmanes_peso_tejido_valor(@tarifa,4.40,@c01,@densidad) + @verticales*@alto) + dbo.temp_fn_precio_tarifa_embalaje(@tarifa,440.0,1) + dbo.fn_solarmanes_precio_articulos_tipo_7(@tarifa,440,@c01) + @monetarios + dbo.fn_solarmanes_precio_articulos_tipo_8(@tarifa,440,@c01)
		set @c23 = @margen2 * (dbo.fn_solarmanes_precio_tejido_vertical(460.0,100*@alto,@criterio,@margen,@preciom2,1) + @unitarios + dbo.fn_Tarifa_Lineales(@tarifa,460.0) + dbo.fn_precio_tarifa_montaje(@tarifa,460.0,@preciomontaje,1.45) +  @margen*dbo.fn_solarmanes_peso_tejido_valor(@tarifa,4.60,@c01,@densidad) + @verticales*@alto) + dbo.temp_fn_precio_tarifa_embalaje(@tarifa,460.0,1) + dbo.fn_solarmanes_precio_articulos_tipo_7(@tarifa,460,@c01) + @monetarios + dbo.fn_solarmanes_precio_articulos_tipo_8(@tarifa,460,@c01)
		set @c24 = @margen2 * (dbo.fn_solarmanes_precio_tejido_vertical(480.0,100*@alto,@criterio,@margen,@preciom2,1) + @unitarios + dbo.fn_Tarifa_Lineales(@tarifa,480.0) + dbo.fn_precio_tarifa_montaje(@tarifa,480.0,@preciomontaje,1.45) +  @margen*dbo.fn_solarmanes_peso_tejido_valor(@tarifa,4.80,@c01,@densidad) + @verticales*@alto) + dbo.temp_fn_precio_tarifa_embalaje(@tarifa,480.0,1) + dbo.fn_solarmanes_precio_articulos_tipo_7(@tarifa,480,@c01) + @monetarios + dbo.fn_solarmanes_precio_articulos_tipo_8(@tarifa,480,@c01)
		set @c25 = @margen2 * (dbo.fn_solarmanes_precio_tejido_vertical(500.0,100*@alto,@criterio,@margen,@preciom2,1) + @unitarios + dbo.fn_Tarifa_Lineales(@tarifa,500.0) + dbo.fn_precio_tarifa_montaje(@tarifa,500.0,@preciomontaje,1.45) +  @margen*dbo.fn_solarmanes_peso_tejido_valor(@tarifa,5.00,@c01,@densidad) + @verticales*@alto) + dbo.temp_fn_precio_tarifa_embalaje(@tarifa,500.0,1) + dbo.fn_solarmanes_precio_articulos_tipo_7(@tarifa,500,@c01) + @monetarios + dbo.fn_solarmanes_precio_articulos_tipo_8(@tarifa,500,@c01)
		set @c26 = @margen2 * (dbo.fn_solarmanes_precio_tejido_vertical(520.0,100*@alto,@criterio,@margen,@preciom2,1) + @unitarios + dbo.fn_Tarifa_Lineales(@tarifa,520.0) + dbo.fn_precio_tarifa_montaje(@tarifa,520.0,@preciomontaje,1.45) +  @margen*dbo.fn_solarmanes_peso_tejido_valor(@tarifa,5.20,@c01,@densidad) + @verticales*@alto) + dbo.temp_fn_precio_tarifa_embalaje(@tarifa,520.0,1) + dbo.fn_solarmanes_precio_articulos_tipo_7(@tarifa,520,@c01) + @monetarios + dbo.fn_solarmanes_precio_articulos_tipo_8(@tarifa,520,@c01)
		set @c27 = @margen2 * ( dbo.fn_solarmanes_precio_tejido_vertical(540.0,100*@alto,@criterio,@margen,@preciom2,1) + @unitarios + dbo.fn_Tarifa_Lineales(@tarifa,540.0) + dbo.fn_precio_tarifa_montaje(@tarifa,540.0,@preciomontaje,1.45) +  @margen*dbo.fn_solarmanes_peso_tejido_valor(@tarifa,5.40,@c01,@densidad) + @verticales*@alto) + dbo.temp_fn_precio_tarifa_embalaje(@tarifa,540.0,1) + dbo.fn_solarmanes_precio_articulos_tipo_7(@tarifa,540,@c01) + @monetarios + dbo.fn_solarmanes_precio_articulos_tipo_8(@tarifa,540,@c01)
		set @c28 = @margen2 * (dbo.fn_solarmanes_precio_tejido_vertical(560.0,100*@alto,@criterio,@margen,@preciom2,1) + @unitarios + dbo.fn_Tarifa_Lineales(@tarifa,560.0) + dbo.fn_precio_tarifa_montaje(@tarifa,560.0,@preciomontaje,1.45) +  @margen*dbo.fn_solarmanes_peso_tejido_valor(@tarifa,5.60,@c01,@densidad) + @verticales*@alto) + dbo.temp_fn_precio_tarifa_embalaje(@tarifa,560.0,1) + dbo.fn_solarmanes_precio_articulos_tipo_7(@tarifa,560,@c01) + @monetarios + dbo.fn_solarmanes_precio_articulos_tipo_8(@tarifa,560,@c01)
		set @c29 = @margen2 * (dbo.fn_solarmanes_precio_tejido_vertical(580.0,100*@alto,@criterio,@margen,@preciom2,1) + @unitarios + dbo.fn_Tarifa_Lineales(@tarifa,580.0) + dbo.fn_precio_tarifa_montaje(@tarifa,580.0,@preciomontaje,1.45) +  @margen*dbo.fn_solarmanes_peso_tejido_valor(@tarifa,5.80,@c01,@densidad) + @verticales*@alto) + dbo.temp_fn_precio_tarifa_embalaje(@tarifa,580.0,1) + dbo.fn_solarmanes_precio_articulos_tipo_7(@tarifa,580,@c01) + @monetarios + dbo.fn_solarmanes_precio_articulos_tipo_8(@tarifa,580,@c01)
		set @c30 = @margen2 * (dbo.fn_solarmanes_precio_tejido_vertical(600.0,100*@alto,@criterio,@margen,@preciom2,1) + @unitarios + dbo.fn_Tarifa_Lineales(@tarifa,600.0) + dbo.fn_precio_tarifa_montaje(@tarifa,600.0,@preciomontaje,1.45) +  @margen*dbo.fn_solarmanes_peso_tejido_valor(@tarifa,6.00,@c01,@densidad) + @verticales*@alto) + dbo.temp_fn_precio_tarifa_embalaje(@tarifa,600.0,1) + dbo.fn_solarmanes_precio_articulos_tipo_7(@tarifa,600,@c01) + @monetarios + dbo.fn_solarmanes_precio_articulos_tipo_8(@tarifa,600,@c01)
		set @c31 = 0
		set @c32 = 0
		end

		if @tipoproducto = 5
		begin
		set @c02 = @margen2 * (dbo.fn_solarmanes_precio_tejido_nyd(40.0,100*@alto,@criterio,@margen,@preciom2,1) + @unitarios  + dbo.fn_Tarifa_Lineales(@tarifa,40.0) + dbo.fn_precio_tarifa_montaje(@tarifa,40.0,@preciomontaje,@margen)   +  @margen*dbo.fn_solarmanes_peso_tejido_valor(@tarifa,0.40,@c01,@densidad) + @verticales*@alto) + dbo.temp_fn_precio_tarifa_embalaje(@tarifa,40.0,1) + dbo.fn_solarmanes_precio_articulos_tipo_7(@tarifa,40,@c01) + @monetarios + dbo.fn_solarmanes_precio_articulos_tipo_8(@tarifa,40,@c01)
		set @c03 = @margen2 * (dbo.fn_solarmanes_precio_tejido_nyd(60.0,100*@alto,@criterio,@margen,@preciom2,1) + @unitarios  + dbo.fn_Tarifa_Lineales(@tarifa,60.0) + dbo.fn_precio_tarifa_montaje(@tarifa,60.0,@preciomontaje,@margen)   +  @margen*dbo.fn_solarmanes_peso_tejido_valor(@tarifa,0.60,@c01,@densidad) + @verticales*@alto) + dbo.temp_fn_precio_tarifa_embalaje(@tarifa,60.0,1) + dbo.fn_solarmanes_precio_articulos_tipo_7(@tarifa,60,@c01) + @monetarios + dbo.fn_solarmanes_precio_articulos_tipo_8(@tarifa,60,@c01)
		set @c04 = @margen2 * (dbo.fn_solarmanes_precio_tejido_nyd(80.0,100*@alto,@criterio,@margen,@preciom2,1)  + @unitarios + dbo.fn_Tarifa_Lineales(@tarifa,80.0) + dbo.fn_precio_tarifa_montaje(@tarifa,80.0,@preciomontaje,@margen)   +  @margen*dbo.fn_solarmanes_peso_tejido_valor(@tarifa,0.80,@c01,@densidad) + @verticales*@alto) + dbo.temp_fn_precio_tarifa_embalaje(@tarifa,80.0,1) + dbo.fn_solarmanes_precio_articulos_tipo_7(@tarifa,80,@c01) + @monetarios + dbo.fn_solarmanes_precio_articulos_tipo_8(@tarifa,80,@c01)
		set @c05 = @margen2 * (dbo.fn_solarmanes_precio_tejido_nyd(100.0,100*@alto,@criterio,@margen,@preciom2,1) + @unitarios + dbo.fn_Tarifa_Lineales(@tarifa,100.0) + dbo.fn_precio_tarifa_montaje(@tarifa,100.0,@preciomontaje,@margen) +  @margen*dbo.fn_solarmanes_peso_tejido_valor(@tarifa,1.00,@c01,@densidad) + @verticales*@alto) + dbo.temp_fn_precio_tarifa_embalaje(@tarifa,100.0,1) + dbo.fn_solarmanes_precio_articulos_tipo_7(@tarifa,100,@c01) + @monetarios + dbo.fn_solarmanes_precio_articulos_tipo_8(@tarifa,100,@c01)
		set @c06 = @margen2 * (dbo.fn_solarmanes_precio_tejido_nyd(120.0,100*@alto,@criterio,@margen,@preciom2,1) + @unitarios + dbo.fn_Tarifa_Lineales(@tarifa,120.0) + dbo.fn_precio_tarifa_montaje(@tarifa,120.0,@preciomontaje,@margen) +  @margen*dbo.fn_solarmanes_peso_tejido_valor(@tarifa,1.20,@c01,@densidad) + @verticales*@alto) + dbo.temp_fn_precio_tarifa_embalaje(@tarifa,120.0,1) + dbo.fn_solarmanes_precio_articulos_tipo_7(@tarifa,120,@c01) + @monetarios + dbo.fn_solarmanes_precio_articulos_tipo_8(@tarifa,120,@c01)
		set @c07 = @margen2 * (dbo.fn_solarmanes_precio_tejido_nyd(140.0,100*@alto,@criterio,@margen,@preciom2,1) + @unitarios + dbo.fn_Tarifa_Lineales(@tarifa,140.0) + dbo.fn_precio_tarifa_montaje(@tarifa,140.0,@preciomontaje,@margen) +  @margen*dbo.fn_solarmanes_peso_tejido_valor(@tarifa,1.40,@c01,@densidad) + @verticales*@alto) + dbo.temp_fn_precio_tarifa_embalaje(@tarifa,140.0,1) + dbo.fn_solarmanes_precio_articulos_tipo_7(@tarifa,140,@c01) + @monetarios + dbo.fn_solarmanes_precio_articulos_tipo_8(@tarifa,140,@c01)
		set @c08 = @margen2 * (dbo.fn_solarmanes_precio_tejido_nyd(160.0,100*@alto,@criterio,@margen,@preciom2,1) + @unitarios + dbo.fn_Tarifa_Lineales(@tarifa,160.0) + dbo.fn_precio_tarifa_montaje(@tarifa,160.0,@preciomontaje,@margen) +  @margen*dbo.fn_solarmanes_peso_tejido_valor(@tarifa,1.60,@c01,@densidad) + @verticales*@alto) + dbo.temp_fn_precio_tarifa_embalaje(@tarifa,160.0,1) + dbo.fn_solarmanes_precio_articulos_tipo_7(@tarifa,160,@c01) + @monetarios + dbo.fn_solarmanes_precio_articulos_tipo_8(@tarifa,160,@c01)
		set @c09 = @margen2 * (dbo.fn_solarmanes_precio_tejido_nyd(180.0,100*@alto,@criterio,@margen,@preciom2,1) + @unitarios + dbo.fn_Tarifa_Lineales(@tarifa,180.0) + dbo.fn_precio_tarifa_montaje(@tarifa,180.0,@preciomontaje,@margen) +  @margen*dbo.fn_solarmanes_peso_tejido_valor(@tarifa,1.80,@c01,@densidad) + @verticales*@alto) + dbo.temp_fn_precio_tarifa_embalaje(@tarifa,180.0,1) + dbo.fn_solarmanes_precio_articulos_tipo_7(@tarifa,180,@c01) + @monetarios + dbo.fn_solarmanes_precio_articulos_tipo_8(@tarifa,180,@c01)
		set @c10 = @margen2 * (dbo.fn_solarmanes_precio_tejido_nyd(200.0,100*@alto,@criterio,@margen,@preciom2,1) + @unitarios + dbo.fn_Tarifa_Lineales(@tarifa,200.0) + dbo.fn_precio_tarifa_montaje(@tarifa,200.0,@preciomontaje,@margen) +  @margen*dbo.fn_solarmanes_peso_tejido_valor(@tarifa,2.00,@c01,@densidad) + @verticales*@alto) + dbo.temp_fn_precio_tarifa_embalaje(@tarifa,200.0,1) + dbo.fn_solarmanes_precio_articulos_tipo_7(@tarifa,200,@c01) + @monetarios + dbo.fn_solarmanes_precio_articulos_tipo_8(@tarifa,200,@c01)
		set @c11 = @margen2 * (dbo.fn_solarmanes_precio_tejido_nyd(220.0,100*@alto,@criterio,@margen,@preciom2,1) + @unitarios + dbo.fn_Tarifa_Lineales(@tarifa,220.0) + dbo.fn_precio_tarifa_montaje(@tarifa,220.0,@preciomontaje,@margen) +  @margen*dbo.fn_solarmanes_peso_tejido_valor(@tarifa,2.20,@c01,@densidad) + @verticales*@alto) + dbo.temp_fn_precio_tarifa_embalaje(@tarifa,220.0,1) + dbo.fn_solarmanes_precio_articulos_tipo_7(@tarifa,220,@c01) + @monetarios + dbo.fn_solarmanes_precio_articulos_tipo_8(@tarifa,220,@c01)
		set @c12 = @margen2 * (dbo.fn_solarmanes_precio_tejido_nyd(240.0,100*@alto,@criterio,@margen,@preciom2,1) + @unitarios + dbo.fn_Tarifa_Lineales(@tarifa,240.0) + dbo.fn_precio_tarifa_montaje(@tarifa,240.0,@preciomontaje,@margen) +  @margen*dbo.fn_solarmanes_peso_tejido_valor(@tarifa,2.40,@c01,@densidad) + @verticales*@alto) + dbo.temp_fn_precio_tarifa_embalaje(@tarifa,240.0,1) + dbo.fn_solarmanes_precio_articulos_tipo_7(@tarifa,240,@c01) + @monetarios + dbo.fn_solarmanes_precio_articulos_tipo_8(@tarifa,240,@c01)
		set @c13 = @margen2 * (dbo.fn_solarmanes_precio_tejido_nyd(260.0,100*@alto,@criterio,@margen,@preciom2,1) + @unitarios + dbo.fn_Tarifa_Lineales(@tarifa,260.0) + dbo.fn_precio_tarifa_montaje(@tarifa,260.0,@preciomontaje,@margen) +  @margen*dbo.fn_solarmanes_peso_tejido_valor(@tarifa,2.60,@c01,@densidad) + @verticales*@alto) + dbo.temp_fn_precio_tarifa_embalaje(@tarifa,260.0,1) + dbo.fn_solarmanes_precio_articulos_tipo_7(@tarifa,260,@c01) + @monetarios + dbo.fn_solarmanes_precio_articulos_tipo_8(@tarifa,260,@c01)
		set @c14 = @margen2 * (dbo.fn_solarmanes_precio_tejido_nyd(280.0,100*@alto,@criterio,@margen,@preciom2,1) + @unitarios + dbo.fn_Tarifa_Lineales(@tarifa,280.0) + dbo.fn_precio_tarifa_montaje(@tarifa,280.0,@preciomontaje,@margen) +  @margen*dbo.fn_solarmanes_peso_tejido_valor(@tarifa,2.80,@c01,@densidad) + @verticales*@alto) + dbo.temp_fn_precio_tarifa_embalaje(@tarifa,280.0,1) + dbo.fn_solarmanes_precio_articulos_tipo_7(@tarifa,280,@c01) + @monetarios + dbo.fn_solarmanes_precio_articulos_tipo_8(@tarifa,280,@c01)
		set @c15 = @margen2 * (dbo.fn_solarmanes_precio_tejido_nyd(300.0,100*@alto,@criterio,@margen,@preciom2,1) + @unitarios + dbo.fn_Tarifa_Lineales(@tarifa,300.0) + dbo.fn_precio_tarifa_montaje(@tarifa,300.0,@preciomontaje,@margen) +  @margen*dbo.fn_solarmanes_peso_tejido_valor(@tarifa,3.00,@c01,@densidad) + @verticales*@alto) + dbo.temp_fn_precio_tarifa_embalaje(@tarifa,300.0,1) + dbo.fn_solarmanes_precio_articulos_tipo_7(@tarifa,300,@c01) + @monetarios + dbo.fn_solarmanes_precio_articulos_tipo_8(@tarifa,300,@c01)
		set @c16 = @margen2 * (dbo.fn_solarmanes_precio_tejido_nyd(320.0,100*@alto,@criterio,@margen,@preciom2,1) + @unitarios + dbo.fn_Tarifa_Lineales(@tarifa,320.0) + dbo.fn_precio_tarifa_montaje(@tarifa,320.0,@preciomontaje,@margen) +  @margen*dbo.fn_solarmanes_peso_tejido_valor(@tarifa,3.20,@c01,@densidad) + @verticales*@alto) + dbo.temp_fn_precio_tarifa_embalaje(@tarifa,320.0,1) + dbo.fn_solarmanes_precio_articulos_tipo_7(@tarifa,320,@c01) + @monetarios + dbo.fn_solarmanes_precio_articulos_tipo_8(@tarifa,320,@c01)
		set @c17 = @margen2 * (dbo.fn_solarmanes_precio_tejido_nyd(340.0,100*@alto,@criterio,@margen,@preciom2,1) + @unitarios + dbo.fn_Tarifa_Lineales(@tarifa,340.0) + dbo.fn_precio_tarifa_montaje(@tarifa,340.0,@preciomontaje,@margen) +  @margen*dbo.fn_solarmanes_peso_tejido_valor(@tarifa,3.40,@c01,@densidad) + @verticales*@alto) + dbo.temp_fn_precio_tarifa_embalaje(@tarifa,340.0,1) + dbo.fn_solarmanes_precio_articulos_tipo_7(@tarifa,340,@c01) + @monetarios + dbo.fn_solarmanes_precio_articulos_tipo_8(@tarifa,340,@c01)
		set @c18 = @margen2 * (dbo.fn_solarmanes_precio_tejido_nyd(360.0,100*@alto,@criterio,@margen,@preciom2,1) + @unitarios + dbo.fn_Tarifa_Lineales(@tarifa,360.0) + dbo.fn_precio_tarifa_montaje(@tarifa,360.0,@preciomontaje,@margen) +  @margen*dbo.fn_solarmanes_peso_tejido_valor(@tarifa,3.60,@c01,@densidad) + @verticales*@alto) + dbo.temp_fn_precio_tarifa_embalaje(@tarifa,360.0,1) + dbo.fn_solarmanes_precio_articulos_tipo_7(@tarifa,360,@c01) + @monetarios + dbo.fn_solarmanes_precio_articulos_tipo_8(@tarifa,360,@c01)
		set @c19 = @margen2 * (dbo.fn_solarmanes_precio_tejido_nyd(380.0,100*@alto,@criterio,@margen,@preciom2,1) + @unitarios + dbo.fn_Tarifa_Lineales(@tarifa,380.0) + dbo.fn_precio_tarifa_montaje(@tarifa,380.0,@preciomontaje,@margen) +  @margen*dbo.fn_solarmanes_peso_tejido_valor(@tarifa,3.80,@c01,@densidad) + @verticales*@alto) + dbo.temp_fn_precio_tarifa_embalaje(@tarifa,380.0,1) + dbo.fn_solarmanes_precio_articulos_tipo_7(@tarifa,380,@c01) + @monetarios + dbo.fn_solarmanes_precio_articulos_tipo_8(@tarifa,380,@c01)
		set @c20 = @margen2 * (dbo.fn_solarmanes_precio_tejido_nyd(400.0,100*@alto,@criterio,@margen,@preciom2,1) + @unitarios + dbo.fn_Tarifa_Lineales(@tarifa,400.0) + dbo.fn_precio_tarifa_montaje(@tarifa,400.0,@preciomontaje,@margen) +  @margen*dbo.fn_solarmanes_peso_tejido_valor(@tarifa,4.00,@c01,@densidad) + @verticales*@alto) + dbo.temp_fn_precio_tarifa_embalaje(@tarifa,400.0,1) + dbo.fn_solarmanes_precio_articulos_tipo_7(@tarifa,400,@c01) + @monetarios + dbo.fn_solarmanes_precio_articulos_tipo_8(@tarifa,400,@c01)
		set @c21 = @margen2 * (dbo.fn_solarmanes_precio_tejido_nyd(420.0,100*@alto,@criterio,@margen,@preciom2,1) + @unitarios + dbo.fn_Tarifa_Lineales(@tarifa,420.0) + dbo.fn_precio_tarifa_montaje(@tarifa,420.0,@preciomontaje,@margen) +  @margen*dbo.fn_solarmanes_peso_tejido_valor(@tarifa,4.20,@c01,@densidad) + @verticales*@alto) + dbo.temp_fn_precio_tarifa_embalaje(@tarifa,420.0,1) + dbo.fn_solarmanes_precio_articulos_tipo_7(@tarifa,420,@c01) + @monetarios + dbo.fn_solarmanes_precio_articulos_tipo_8(@tarifa,420,@c01)
		set @c22 = @margen2 * (dbo.fn_solarmanes_precio_tejido_nyd(440.0,100*@alto,@criterio,@margen,@preciom2,1) + @unitarios + dbo.fn_Tarifa_Lineales(@tarifa,440.0) + dbo.fn_precio_tarifa_montaje(@tarifa,440.0,@preciomontaje,@margen) +  @margen*dbo.fn_solarmanes_peso_tejido_valor(@tarifa,4.40,@c01,@densidad) + @verticales*@alto) + dbo.temp_fn_precio_tarifa_embalaje(@tarifa,440.0,1) + dbo.fn_solarmanes_precio_articulos_tipo_7(@tarifa,440,@c01) + @monetarios + dbo.fn_solarmanes_precio_articulos_tipo_8(@tarifa,440,@c01)
		set @c23 = @margen2 * (dbo.fn_solarmanes_precio_tejido_nyd(460.0,100*@alto,@criterio,@margen,@preciom2,1) + @unitarios + dbo.fn_Tarifa_Lineales(@tarifa,460.0) + dbo.fn_precio_tarifa_montaje(@tarifa,460.0,@preciomontaje,@margen) +  @margen*dbo.fn_solarmanes_peso_tejido_valor(@tarifa,4.60,@c01,@densidad) + @verticales*@alto) + dbo.temp_fn_precio_tarifa_embalaje(@tarifa,460.0,1) + dbo.fn_solarmanes_precio_articulos_tipo_7(@tarifa,460,@c01) + @monetarios + dbo.fn_solarmanes_precio_articulos_tipo_8(@tarifa,460,@c01)
		set @c24 = @margen2 * (dbo.fn_solarmanes_precio_tejido_nyd(480.0,100*@alto,@criterio,@margen,@preciom2,1) + @unitarios + dbo.fn_Tarifa_Lineales(@tarifa,480.0) + dbo.fn_precio_tarifa_montaje(@tarifa,480.0,@preciomontaje,@margen) +  @margen*dbo.fn_solarmanes_peso_tejido_valor(@tarifa,4.80,@c01,@densidad) + @verticales*@alto) + dbo.temp_fn_precio_tarifa_embalaje(@tarifa,480.0,1) + dbo.fn_solarmanes_precio_articulos_tipo_7(@tarifa,480,@c01) + @monetarios + dbo.fn_solarmanes_precio_articulos_tipo_8(@tarifa,480,@c01)
		set @c25 = @margen2 * (dbo.fn_solarmanes_precio_tejido_nyd(500.0,100*@alto,@criterio,@margen,@preciom2,1) + @unitarios + dbo.fn_Tarifa_Lineales(@tarifa,500.0) + dbo.fn_precio_tarifa_montaje(@tarifa,500.0,@preciomontaje,@margen) +  @margen*dbo.fn_solarmanes_peso_tejido_valor(@tarifa,5.00,@c01,@densidad) + @verticales*@alto) + dbo.temp_fn_precio_tarifa_embalaje(@tarifa,500.0,1) + dbo.fn_solarmanes_precio_articulos_tipo_7(@tarifa,500,@c01) + @monetarios + dbo.fn_solarmanes_precio_articulos_tipo_8(@tarifa,500,@c01)
		set @c26 = @margen2 * (dbo.fn_solarmanes_precio_tejido_nyd(520.0,100*@alto,@criterio,@margen,@preciom2,1) + @unitarios + dbo.fn_Tarifa_Lineales(@tarifa,520.0) + dbo.fn_precio_tarifa_montaje(@tarifa,520.0,@preciomontaje,@margen) +  @margen*dbo.fn_solarmanes_peso_tejido_valor(@tarifa,5.20,@c01,@densidad) + @verticales*@alto) + dbo.temp_fn_precio_tarifa_embalaje(@tarifa,520.0,1) + dbo.fn_solarmanes_precio_articulos_tipo_7(@tarifa,520,@c01) + @monetarios + dbo.fn_solarmanes_precio_articulos_tipo_8(@tarifa,520,@c01)
		set @c27 = @margen2 * ( dbo.fn_solarmanes_precio_tejido_nyd(540.0,100*@alto,@criterio,@margen,@preciom2,1) + @unitarios + dbo.fn_Tarifa_Lineales(@tarifa,540.0) + dbo.fn_precio_tarifa_montaje(@tarifa,540.0,@preciomontaje,@margen) +  @margen*dbo.fn_solarmanes_peso_tejido_valor(@tarifa,5.40,@c01,@densidad) + @verticales*@alto) + dbo.temp_fn_precio_tarifa_embalaje(@tarifa,540.0,1) + dbo.fn_solarmanes_precio_articulos_tipo_7(@tarifa,540,@c01) + @monetarios + dbo.fn_solarmanes_precio_articulos_tipo_8(@tarifa,540,@c01)
		set @c28 = @margen2 * (dbo.fn_solarmanes_precio_tejido_nyd(560.0,100*@alto,@criterio,@margen,@preciom2,1) + @unitarios + dbo.fn_Tarifa_Lineales(@tarifa,560.0) + dbo.fn_precio_tarifa_montaje(@tarifa,560.0,@preciomontaje,@margen) +  @margen*dbo.fn_solarmanes_peso_tejido_valor(@tarifa,5.60,@c01,@densidad) + @verticales*@alto) + dbo.temp_fn_precio_tarifa_embalaje(@tarifa,560.0,1) + dbo.fn_solarmanes_precio_articulos_tipo_7(@tarifa,560,@c01) + @monetarios + dbo.fn_solarmanes_precio_articulos_tipo_8(@tarifa,560,@c01)
		set @c29 = @margen2 * (dbo.fn_solarmanes_precio_tejido_nyd(580.0,100*@alto,@criterio,@margen,@preciom2,1) + @unitarios + dbo.fn_Tarifa_Lineales(@tarifa,580.0) + dbo.fn_precio_tarifa_montaje(@tarifa,580.0,@preciomontaje,@margen) +  @margen*dbo.fn_solarmanes_peso_tejido_valor(@tarifa,5.80,@c01,@densidad) + @verticales*@alto) + dbo.temp_fn_precio_tarifa_embalaje(@tarifa,580.0,1) + dbo.fn_solarmanes_precio_articulos_tipo_7(@tarifa,580,@c01) + @monetarios + dbo.fn_solarmanes_precio_articulos_tipo_8(@tarifa,580,@c01)
		set @c30 = @margen2 * (dbo.fn_solarmanes_precio_tejido_nyd(600.0,100*@alto,@criterio,@margen,@preciom2,1) + @unitarios + dbo.fn_Tarifa_Lineales(@tarifa,600.0) + dbo.fn_precio_tarifa_montaje(@tarifa,600.0,@preciomontaje,@margen) +  @margen*dbo.fn_solarmanes_peso_tejido_valor(@tarifa,6.00,@c01,@densidad) + @verticales*@alto) + dbo.temp_fn_precio_tarifa_embalaje(@tarifa,600.0,1) + dbo.fn_solarmanes_precio_articulos_tipo_7(@tarifa,600,@c01) + @monetarios + dbo.fn_solarmanes_precio_articulos_tipo_8(@tarifa,600,@c01)
		
		set @c31 = 0
		set @c32 = 0
		end


		end

		insert into @table (c00,c01,c02,c03,c04,c05,c06,c07,c08,c09,c10,c11,c12,c13,c14,c15,c16,c17,c18,c19,c20,c21,c22,c23,c24,c25,c26,c27,c28,c29,c30,c31,c32)
		values(@c00,@c01,@c02,@c03,@c04,@c05,@c06,@c07,@c08,@c09,@c10,@c11,@c12,@c13,@c14,@c15,@c16,@c17,@c18,@c19,@c20,@c21,@c22,@c23,@c24,@c25,@c26,@c27,@c28,@c29,@c30,@c31,@c32)
		set @py += 1
	end

	if @dest = 0
	begin
		delete from SOL_TARIFAS_SIMULATE_TABLE where idrow=@tarifa

		if @tipoproducto = 5
		begin
		insert into SOL_TARIFAS_SIMULATE_TABLE(idrow,c00 ,c01 ,c02 ,c03 ,c04 ,c05 ,c06 ,c07 ,c08 ,c09 ,c10 ,c11 ,c12 ,c13, c14, c15)
		select @tarifa,c00 ,c01 ,c02 ,c03 ,c04 ,c05 ,c06 ,c07 ,c08 ,c09 ,c10 ,c11 ,c12 ,c13, c14, c15  from @table
		end
		else
		begin
		insert into SOL_TARIFAS_SIMULATE_TABLE(idrow,c00 ,c01 ,c02 ,c03 ,c04 ,c05 ,c06 ,c07 ,c08 ,c09 ,c10 ,c11 ,c12 ,c13 ,c14 ,c15 ,c16 ,c17 ,c18 ,c19 ,c20 ,c21 ,c22 ,c23 ,c24 ,c25 ,c26 ,c27 ,c28 ,c29 ,c30 ,c31 ,c32 )
		select @tarifa,c00 ,c01 ,c02 ,c03 ,c04 ,c05 ,c06 ,c07 ,c08 ,c09 ,c10 ,c11 ,c12 ,c13 ,c14 ,c15 ,c16 ,c17 ,c18 ,c19 ,c20 ,c21 ,c22 ,c23 ,c24 ,c25 ,c26 ,c27 ,c28 ,c29 ,c30 ,c31 ,c32 from @table
		end

		select idrow,c00 ,c01 ,c02 ,c03 ,c04 ,c05 ,c06 ,c07 ,c08 ,c09 ,c10 ,c11 ,c12 ,c13 ,c14 ,c15 ,c16 ,c17 ,c18 ,c19 ,c20 ,c21 ,c22 ,c23 ,c24 ,c25 ,c26 ,c27 ,c28 ,c29 ,c30 ,c31 ,c32 from SOL_TARIFAS_SIMULATE_TABLE where idrow=@tarifa
	end
	
	if @dest = 1
	begin
		insert into SOL_TARIFAS_SIMULATE_TABLE_EXPORT(idrow,c00 ,c01 ,c02 ,c03 ,c04 ,c05 ,c06 ,c07 ,c08 ,c09 ,c10 ,c11 ,c12 ,c13 ,c14 ,c15 ,c16 ,c17 ,c18 ,c19 ,c20 ,c21 ,c22 ,c23 ,c24 ,c25 ,c26 ,c27 ,c28 ,c29 ,c30 ,c31 ,c32 )
		select @tarifa,c00 ,c01 ,c02 ,c03 ,c04 ,c05 ,c06 ,c07 ,c08 ,c09 ,c10 ,c11 ,c12 ,c13 ,c14 ,c15 ,c16 ,c17 ,c18 ,c19 ,c20 ,c21 ,c22 ,c23 ,c24 ,c25 ,c26 ,c27 ,c28 ,c29 ,c30 ,c31 ,c32 from @table 
		where c00>=@miny and c00<=@maxy
	end

	if @dest = 2
	begin
		insert into SOL_TARIFAS_SIMULATE_TABLE_EXPORT_C1(idrow,c00 ,c01 ,c02 ,c03 ,c04 ,c05 ,c06 ,c07 ,c08 ,c09 ,c10 ,c11 ,c12 ,c13 ,c14 ,c15 ,c16 ,c17 ,c18 ,c19 ,c20 ,c21 ,c22 ,c23 ,c24 ,c25 ,c26 ,c27 ,c28 ,c29 ,c30 ,c31 ,c32 )
		select @tarifa,c00 ,c01 ,c02 ,c03 ,c04 ,c05 ,c06 ,c07 ,c08 ,c09 ,c10 ,c11 ,c12 ,c13 ,c14 ,c15 ,c16 ,c17 ,c18 ,c19 ,c20 ,c21 ,c22 ,c23 ,c24 ,c25 ,c26 ,c27 ,c28 ,c29 ,c30 ,c31 ,c32 from @table 
		where c00>=@miny and c00<=@maxy
	end

	if @dest = 3
	begin
		delete from SOL_TARIFAS_SIMULATE_CLIENTE_TABLE where idrow=@id

		insert into SOL_TARIFAS_SIMULATE_CLIENTE_TABLE(idrow,c00 ,c01 ,c02 ,c03 ,c04 ,c05 ,c06 ,c07 ,c08 ,c09 ,c10 ,c11 ,c12 ,c13 ,c14 ,c15 ,c16 ,c17 ,c18 ,c19 ,c20 ,c21 ,c22 ,c23 ,c24 ,c25 ,c26 ,c27 ,c28 ,c29 ,c30 ,c31 ,c32 )
		select @id,c00 ,c01 ,c02 ,c03 ,c04 ,c05 ,c06 ,c07 ,c08 ,c09 ,c10 ,c11 ,c12 ,c13 ,c14 ,c15 ,c16 ,c17 ,c18 ,c19 ,c20 ,c21 ,c22 ,c23 ,c24 ,c25 ,c26 ,c27 ,c28 ,c29 ,c30 ,c31 ,c32 from @table

		--select @id,c00 ,c01 ,c02 ,c03 ,c04 ,c05 ,c06 ,c07 ,c08 ,c09 ,c10 ,c11 ,c12 ,c13 ,c14 ,c15 ,c16 ,c17 ,c18 ,c19 ,c20 ,c21 ,c22 ,c23 ,c24 ,c25 ,c26 ,c27 ,c28 ,c29 ,c30 ,c31 ,c32 from SOL_TARIFAS_SIMULATE_TABLE where idrow=@tarifa
	end

	if @dest = 4
	begin
	
		delete from SOL_TARIFAS_SIMULATE_TABLE_SYNC where idrow=@tarifa

		insert into SOL_TARIFAS_SIMULATE_TABLE_SYNC(idrow,c00 ,c01 ,c02 ,c03 ,c04 ,c05 ,c06 ,c07 ,c08 ,c09 ,c10 ,c11 ,c12 ,c13 ,c14 ,c15 ,c16 ,c17 ,c18 ,c19 ,c20 ,c21 ,c22 ,c23 ,c24 ,c25 ,c26 ,c27 ,c28 ,c29 ,c30)
		select @tarifa,c00 ,c01 ,c02 ,c03 ,c04 ,c05 ,c06 ,c07 ,c08 ,c09 ,c10 ,c11 ,c12 ,c13 ,c14 ,c15 ,c16 ,c17 ,c18 ,c19 ,c20 ,c21 ,c22 ,c23 ,c24 ,c25 ,c26 ,c27 ,c28 ,c29 ,c30  from @table 
		where c00>=@miny and c00<=@maxy

		select idrow,c00 ,c01 ,c02 ,c03 ,c04 ,c05 ,c06 ,c07 ,c08 ,c09 ,c10 ,c11 ,c12 ,c13 ,c14 ,c15 ,c16 ,c17 ,c18 ,c19 ,c20 ,c21 ,c22 ,c23 ,c24 ,c25 ,c26 ,c27 ,c28 ,c29 ,c30,
		(select sp_sistema from SOL_TARIFAS_SIMULATE where idrow=@tarifa) as sp_sistema,
		(select sp_modelo from SOL_TARIFAS_SIMULATE where idrow=@tarifa) as sp_modelo,
		(select sp_accionamiento from SOL_TARIFAS_SIMULATE where idrow=@tarifa) as sp_accionamiento,
		(select sp_tejido from SOL_TARIFAS_SIMULATE where idrow=@tarifa) as sp_tejido,
		(select sp_grupo from SOL_TARIFAS_SIMULATE where idrow=@tarifa) as sp_grupo,
		(select sp_tarifa from SOL_TARIFAS_SIMULATE where idrow=@tarifa) as sp_tarifa
		from SOL_TARIFAS_SIMULATE_TABLE_SYNC where idrow=@tarifa order by c00

	end

	return 1

	end

