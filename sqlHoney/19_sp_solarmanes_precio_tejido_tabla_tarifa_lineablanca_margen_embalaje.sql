/* =====================================================================
   19 - sp_solarmanes_precio_tejido_tabla_tarifa_lineablanca: margen1 en el
   embalaje. Mismo cambio que el 18 para línea blanca (tipoproducto 4):
   bloques 10 y 15 llaman a temp_fn_precio_tarifa_embalaje con margen1 en
   vez de 1. No estaba versionado: copia anterior en
   backup/sp_solarmanes_precio_tejido_tabla_tarifa_lineablanca_antes_margen_embalaje_20261016.sql.
   ===================================================================== */
set ansi_nulls on
go
set quoted_identifier on
go
alter procedure [dbo].[sp_solarmanes_precio_tejido_tabla_tarifa_lineablanca]
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
(c00 decimal(12,2),c01 decimal(12,2),c02 decimal(12,2),c03 decimal(12,2),c04 decimal(12,2),c05 decimal(12,2),c06 decimal(12,2),c07 decimal(12,2),c08 decimal(12,2),c09 decimal(12,2),
 c10 decimal(12,2),c11 decimal(12,2),c12 decimal(12,2),c13 decimal(12,2),c14 decimal(12,2),c15 decimal(12,2),c16 decimal(12,2),c17 decimal(12,2),c18 decimal(12,2),c19 decimal(12,2),
 c20 decimal(12,2),c21 decimal(12,2),c22 decimal(12,2),c23 decimal(12,2),c24 decimal(12,2),c25 decimal(12,2),c26 decimal(12,2),c27 decimal(12,2),c28 decimal(12,2),c29 decimal(12,2),
 c30 decimal(12,2),c31 decimal(12,2),c32 decimal(12,2),c33 decimal(12,2),c34 decimal(12,2),c35 decimal(12,2),c36 decimal(12,2),c37 decimal(12,2),c38 decimal(12,2),c39 decimal(12,2),
 c40 decimal(12,2),c41 decimal(12,2),c42 decimal(12,2),c43 decimal(12,2),c44 decimal(12,2),c45 decimal(12,2),c46 decimal(12,2),c47 decimal(12,2),c48 decimal(12,2),c49 decimal(12,2),
 c50 decimal(12,2),c51 decimal(12,2),c52 decimal(12,2),c53 decimal(12,2),c54 decimal(12,2),c55 decimal(12,2),c56 decimal(12,2),c57 decimal(12,2),c58 decimal(12,2),c59 decimal(12,2),
 c60 decimal(12,2),c61 decimal(12,2),c62 decimal(12,2))

 declare @c00 decimal(12,2)
 declare @c01 decimal(12,2)
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
 declare @c33 decimal(12,2)
 declare @c34 decimal(12,2)
 declare @c35 decimal(12,2)
 declare @c36 decimal(12,2)
 declare @c37 decimal(12,2)
 declare @c38 decimal(12,2)
 declare @c39 decimal(12,2)
 declare @c40 decimal(12,2)
 declare @c41 decimal(12,2)
 declare @c42 decimal(12,2)
 declare @c43 decimal(12,2)
 declare @c44 decimal(12,2)
 declare @c45 decimal(12,2)
 declare @c46 decimal(12,2)
 declare @c47 decimal(12,2)
 declare @c48 decimal(12,2)
 declare @c49 decimal(12,2)
 declare @c50 decimal(12,2)
 declare @c51 decimal(12,2)
 declare @c52 decimal(12,2)
 declare @c53 decimal(12,2)
 declare @c54 decimal(12,2)
 declare @c55 decimal(12,2)
 declare @c56 decimal(12,2)
 declare @c57 decimal(12,2)
 declare @c58 decimal(12,2)
 declare @c59 decimal(12,2)
 declare @c60 decimal(12,2)
 declare @c61 decimal(12,2)
 declare @c62 decimal(12,2)
 
 

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


 select @preciomontaje = ISNULL(preciomontaje,0),@criterio = criterio,@margen = margen1,@margen2 = margen2,@preciom2 = preciom2,
 @tipoproducto = tipoproducto from SOL_TARIFAS_SIMULATE where idrow=@tarifa

 select @unitarios = ISNULL(sum(cantidad*precio2),0) from SOL_TARIFAS_SIMULATE_LINES where idrow=@tarifa and unidad in (1,4,5) and articulo in (select idrow from articulos 
 where isnull(vertical,0)=0 or isnull(tipocalculo,0) >= 7)
 select @verticales = ISNULL(sum(cantidad*precio2),0) from SOL_TARIFAS_SIMULATE_LINES where idrow=@tarifa and articulo in (select idrow from articulos where isnull(vertical,0)=1)
 --select @metrolineal = ISNULL(sum(cantidad*precio2),0) from SOL_TARIFAS_SIMULATE_LINES where idrow=@tarifa and unidad=3

 select @monetarios = isnull(sum(k*precio2),0) from SOL_TARIFAS_SIMULATE_LINES where idrow=@tarifa --and isnull(k,0)>0

 declare @alto decimal(12,4)
 declare @px integer = 1

 if @tipoproducto = 1 set @pymax = 28
 if @tipoproducto = 3 set @pymax = 31
 if @tipoproducto = 4 set @pymax = 1
 
	declare @py integer = 0

	while @py < @pymax
	begin

		if @tipoproducto = 1
		begin
			set @alto = 0.2*(3+@py)
			set @c00 = @alto
			set @c01 = @alto + 0.25
		end
		
		if @tipoproducto = 3
		begin
			set @alto = 0.1*@py + 1
			set @c00 = @alto
			set @c01 = @alto + 0
		end

		if @tipoproducto = 4
		begin
			set @alto = 0.1*@py + 1
			set @c00 = @alto
			set @c01 = @alto + 0
		end


		/* MAPA TEJIDO */
		if @bloque = 1
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
				set @c31 = dbo.fn_solarmanes_precio_tejido(620.0,100*@alto,@criterio,@margen,@preciom2,1) 
				set @c32 = dbo.fn_solarmanes_precio_tejido(640.0,100*@alto,@criterio,@margen,@preciom2,1)
				set @c33 = dbo.fn_solarmanes_precio_tejido(660.0,100*@alto,@criterio,@margen,@preciom2,1) 
				set @c34 = dbo.fn_solarmanes_precio_tejido(680.0,100*@alto,@criterio,@margen,@preciom2,1)
				set @c35 = dbo.fn_solarmanes_precio_tejido(700.0,100*@alto,@criterio,@margen,@preciom2,1)
				set @c36 = dbo.fn_solarmanes_precio_tejido(720.0,100*@alto,@criterio,@margen,@preciom2,1) 
				set @c37 = dbo.fn_solarmanes_precio_tejido(740.0,100*@alto,@criterio,@margen,@preciom2,1)
				set @c38 = dbo.fn_solarmanes_precio_tejido(760.0,100*@alto,@criterio,@margen,@preciom2,1) 
				set @c39 = dbo.fn_solarmanes_precio_tejido(780.0,100*@alto,@criterio,@margen,@preciom2,1)
				set @c40 = dbo.fn_solarmanes_precio_tejido(800.0,100*@alto,@criterio,@margen,@preciom2,1)
				set @c41 = dbo.fn_solarmanes_precio_tejido(820.0,100*@alto,@criterio,@margen,@preciom2,1)
				set @c42 = dbo.fn_solarmanes_precio_tejido(840.0,100*@alto,@criterio,@margen,@preciom2,1) 
				set @c43 = dbo.fn_solarmanes_precio_tejido(860.0,100*@alto,@criterio,@margen,@preciom2,1)
				set @c44 = dbo.fn_solarmanes_precio_tejido(880.0,100*@alto,@criterio,@margen,@preciom2,1)
				set @c45 = dbo.fn_solarmanes_precio_tejido(900.0,100*@alto,@criterio,@margen,@preciom2,1) 
				set @c46 = dbo.fn_solarmanes_precio_tejido(920.0,100*@alto,@criterio,@margen,@preciom2,1)
				set @c47 = dbo.fn_solarmanes_precio_tejido(940.0,100*@alto,@criterio,@margen,@preciom2,1)
				set @c48 = dbo.fn_solarmanes_precio_tejido(960.0,100*@alto,@criterio,@margen,@preciom2,1)
				set @c49 = dbo.fn_solarmanes_precio_tejido(980.0,100*@alto,@criterio,@margen,@preciom2,1) 
				set @c50 = dbo.fn_solarmanes_precio_tejido(1000.0,100*@alto,@criterio,@margen,@preciom2,1) 
				set @c51 = dbo.fn_solarmanes_precio_tejido(1020.0,100*@alto,@criterio,@margen,@preciom2,1) 
				set @c52 = dbo.fn_solarmanes_precio_tejido(1040.0,100*@alto,@criterio,@margen,@preciom2,1)
				set @c53 = dbo.fn_solarmanes_precio_tejido(1060.0,100*@alto,@criterio,@margen,@preciom2,1)
				set @c54 = dbo.fn_solarmanes_precio_tejido(1080.0,100*@alto,@criterio,@margen,@preciom2,1)
				set @c55 = dbo.fn_solarmanes_precio_tejido(1100.0,100*@alto,@criterio,@margen,@preciom2,1)
				set @c56 = dbo.fn_solarmanes_precio_tejido(1120.0,100*@alto,@criterio,@margen,@preciom2,1) 
				set @c57 = dbo.fn_solarmanes_precio_tejido(1140.0,100*@alto,@criterio,@margen,@preciom2,1) 
				set @c58 = dbo.fn_solarmanes_precio_tejido(1160.0,100*@alto,@criterio,@margen,@preciom2,1) 
				set @c59 = dbo.fn_solarmanes_precio_tejido(1180.0,100*@alto,@criterio,@margen,@preciom2,1)
				set @c60 = dbo.fn_solarmanes_precio_tejido(1200.0,100*@alto,@criterio,@margen,@preciom2,1)
		end


		/* MAPA TEJIDO SIN MARGEN */
		if @bloque = 12
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

		/* MAPA TEJIDO MARGEN */
		if @bloque = 13
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
		set @c31 = dbo.fn_Tarifa_Lineales(@tarifa,620.0) 
		set @c32 = dbo.fn_Tarifa_Lineales(@tarifa,640.0) 
		set @c33 = dbo.fn_Tarifa_Lineales(@tarifa,660.0)
		set @c34 = dbo.fn_Tarifa_Lineales(@tarifa,680.0)
		set @c35 = dbo.fn_Tarifa_Lineales(@tarifa,700.0)
		set @c36 = dbo.fn_Tarifa_Lineales(@tarifa,720.0)
		set @c37 = dbo.fn_Tarifa_Lineales(@tarifa,740.0) 
		set @c38 = dbo.fn_Tarifa_Lineales(@tarifa,760.0)
		set @c39 = dbo.fn_Tarifa_Lineales(@tarifa,780.0) 
		set @c40 = dbo.fn_Tarifa_Lineales(@tarifa,800.0) 
		set @c41 = dbo.fn_Tarifa_Lineales(@tarifa,820.0) 
		set @c42 = dbo.fn_Tarifa_Lineales(@tarifa,840.0) 
		set @c43 = dbo.fn_Tarifa_Lineales(@tarifa,860.0)
		set @c44 = dbo.fn_Tarifa_Lineales(@tarifa,880.0) 
		set @c45 = dbo.fn_Tarifa_Lineales(@tarifa,900.0) 
		set @c46 = dbo.fn_Tarifa_Lineales(@tarifa,920.0)
		set @c47 = dbo.fn_Tarifa_Lineales(@tarifa,940.0)
		set @c48 = dbo.fn_Tarifa_Lineales(@tarifa,960.0)
		set @c49 = dbo.fn_Tarifa_Lineales(@tarifa,980.0) 
		set @c50 = dbo.fn_Tarifa_Lineales(@tarifa,1000.0) 
		set @c51 = dbo.fn_Tarifa_Lineales(@tarifa,1020.0)
		set @c52 = dbo.fn_Tarifa_Lineales(@tarifa,1040.0)
		set @c53 = dbo.fn_Tarifa_Lineales(@tarifa,1060.0)
		set @c54 = dbo.fn_Tarifa_Lineales(@tarifa,1080.0) 
		set @c55 = dbo.fn_Tarifa_Lineales(@tarifa,1100.0)
		set @c56 = dbo.fn_Tarifa_Lineales(@tarifa,1120.0)
		set @c57 = dbo.fn_Tarifa_Lineales(@tarifa,1140.0)
		set @c58 = dbo.fn_Tarifa_Lineales(@tarifa,1160.0)
		set @c59 = dbo.fn_Tarifa_Lineales(@tarifa,1180.0)
		set @c60 = dbo.fn_Tarifa_Lineales(@tarifa,1200.0)
		
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
		set @c31 =  @unitarios
		set @c32 =  @unitarios
		set @c33 = @unitarios 
		set @c34 =  @unitarios 
		set @c35 = @unitarios 
		set @c36 =  @unitarios
		set @c37 = @unitarios
		set @c38 = @unitarios 
		set @c39 =  @unitarios 
		set @c40 =  @unitarios 
		set @c41 =  @unitarios 
		set @c42 =  @unitarios 
		set @c43 =  @unitarios 
		set @c44 =  @unitarios
		set @c45 =  @unitarios 
		set @c56 =  @unitarios
		set @c47 =  @unitarios
		set @c48 =  @unitarios
		set @c49 =  @unitarios
		set @c50 =  @unitarios
		set @c51 = @unitarios 
		set @c52 =  @unitarios
		set @c53 =  @unitarios
		set @c54 =  @unitarios 
		set @c55 = @unitarios 
		set @c56 = @unitarios
		set @c57 =  @unitarios
		set @c58 =  @unitarios
		set @c59 =  @unitarios
		set @c60 =  @unitarios
		end

		/* MAPA MANO DE OBRA */
		if @bloque = 4 
		begin
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
		set @c31 = dbo.fn_precio_tarifa_montaje(@tarifa,620.0,@preciomontaje,@margen)
		set @c32 = dbo.fn_precio_tarifa_montaje(@tarifa,640.0,@preciomontaje,@margen)
		set @c33 = dbo.fn_precio_tarifa_montaje(@tarifa,660.0,@preciomontaje,@margen)
		set @c34 = dbo.fn_precio_tarifa_montaje(@tarifa,680.0,@preciomontaje,@margen)
		set @c35 = dbo.fn_precio_tarifa_montaje(@tarifa,700.0,@preciomontaje,@margen)
		set @c36 = dbo.fn_precio_tarifa_montaje(@tarifa,720.0,@preciomontaje,@margen)
		set @c37 = dbo.fn_precio_tarifa_montaje(@tarifa,740.0,@preciomontaje,@margen)
		set @c38 = dbo.fn_precio_tarifa_montaje(@tarifa,760.0,@preciomontaje,@margen)
		set @c39 = dbo.fn_precio_tarifa_montaje(@tarifa,780.0,@preciomontaje,@margen)
		set @c40 = dbo.fn_precio_tarifa_montaje(@tarifa,800.0,@preciomontaje,@margen)
		set @c41 = dbo.fn_precio_tarifa_montaje(@tarifa,820.0,@preciomontaje,@margen)
		set @c42 = dbo.fn_precio_tarifa_montaje(@tarifa,840.0,@preciomontaje,@margen)
		set @c43 = dbo.fn_precio_tarifa_montaje(@tarifa,860.0,@preciomontaje,@margen)
		set @c44 = dbo.fn_precio_tarifa_montaje(@tarifa,880.0,@preciomontaje,@margen)
		set @c45 = dbo.fn_precio_tarifa_montaje(@tarifa,900.0,@preciomontaje,@margen)
		set @c46 = dbo.fn_precio_tarifa_montaje(@tarifa,920.0,@preciomontaje,@margen)
		set @c47 = dbo.fn_precio_tarifa_montaje(@tarifa,940.0,@preciomontaje,@margen)
		set @c48 = dbo.fn_precio_tarifa_montaje(@tarifa,960.0,@preciomontaje,@margen)
		set @c49 = dbo.fn_precio_tarifa_montaje(@tarifa,980.0,@preciomontaje,@margen)
		set @c50 = dbo.fn_precio_tarifa_montaje(@tarifa,1000.0,@preciomontaje,@margen)
		set @c51 = dbo.fn_precio_tarifa_montaje(@tarifa,1020.0,@preciomontaje,@margen)
		set @c52 = dbo.fn_precio_tarifa_montaje(@tarifa,1040.0,@preciomontaje,@margen)
		set @c53 = dbo.fn_precio_tarifa_montaje(@tarifa,1060.0,@preciomontaje,@margen)
		set @c54 = dbo.fn_precio_tarifa_montaje(@tarifa,1080.0,@preciomontaje,@margen)
		set @c55 = dbo.fn_precio_tarifa_montaje(@tarifa,1100.0,@preciomontaje,@margen)
		set @c56 = dbo.fn_precio_tarifa_montaje(@tarifa,1120.0,@preciomontaje,@margen)
		set @c57 = dbo.fn_precio_tarifa_montaje(@tarifa,1140.0,@preciomontaje,@margen)
		set @c58 = dbo.fn_precio_tarifa_montaje(@tarifa,1160.0,@preciomontaje,@margen)
		set @c59 = dbo.fn_precio_tarifa_montaje(@tarifa,1180.0,@preciomontaje,@margen)	
		set @c60 = dbo.fn_precio_tarifa_montaje(@tarifa,1200.0,@preciomontaje,@margen)				
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
		set @c31 =  @monetarios
		set @c32 =  @monetarios
		set @c33 = @monetarios 
		set @c34 =  @monetarios 
		set @c35 = @monetarios 
		set @c36 =  @monetarios
		set @c37 = @monetarios
		set @c38 = @monetarios 
		set @c39 =  @monetarios 
		set @c40 =  @monetarios 
		set @c41 =  @monetarios 
		set @c42 =  @monetarios 
		set @c43 =  @monetarios 
		set @c44 =  @monetarios
		set @c45 =  @monetarios 
		set @c46 =  @monetarios
		set @c47 =  @monetarios
		set @c48 =  @monetarios
		set @c49 =  @monetarios
		set @c50 =  @monetarios
		set @c51 = @monetarios 
		set @c52 =  @monetarios
		set @c53 =  @monetarios
		set @c54 =  @monetarios 
		set @c55 = @monetarios 
		set @c56 = @monetarios
		set @c57 =  @monetarios
		set @c58 =  @monetarios
		set @c59 =  @monetarios
		set @c60 =  @monetarios
		end


		/* MAPA EMBALAJE */
		if @bloque = 15 
		begin
		set @c02 = dbo.temp_fn_precio_tarifa_embalaje(@tarifa,40.0,@margen)
		set @c03 = dbo.temp_fn_precio_tarifa_embalaje(@tarifa,60.0,@margen)
		set @c04 = dbo.temp_fn_precio_tarifa_embalaje(@tarifa,80.0,@margen)
		set @c05 = dbo.temp_fn_precio_tarifa_embalaje(@tarifa,100.0,@margen)
		set @c06 = dbo.temp_fn_precio_tarifa_embalaje(@tarifa,120.0,@margen)
		set @c07 = dbo.temp_fn_precio_tarifa_embalaje(@tarifa,140.0,@margen)
		set @c08 = dbo.temp_fn_precio_tarifa_embalaje(@tarifa,160.0,@margen)
		set @c09 = dbo.temp_fn_precio_tarifa_embalaje(@tarifa,180.0,@margen)
		set @c10 = dbo.temp_fn_precio_tarifa_embalaje(@tarifa,200.0,@margen)
		set @c11 = dbo.temp_fn_precio_tarifa_embalaje(@tarifa,220.0,@margen)
		set @c12 = dbo.temp_fn_precio_tarifa_embalaje(@tarifa,240.0,@margen)
		set @c13 = dbo.temp_fn_precio_tarifa_embalaje(@tarifa,260.0,@margen)
		set @c14 = dbo.temp_fn_precio_tarifa_embalaje(@tarifa,280.0,@margen)
		set @c15 = dbo.temp_fn_precio_tarifa_embalaje(@tarifa,300.0,@margen)
		set @c16 = dbo.temp_fn_precio_tarifa_embalaje(@tarifa,320.0,@margen)
		set @c17 = dbo.temp_fn_precio_tarifa_embalaje(@tarifa,340.0,@margen)
		set @c18 = dbo.temp_fn_precio_tarifa_embalaje(@tarifa,360.0,@margen)
		set @c19 = dbo.temp_fn_precio_tarifa_embalaje(@tarifa,380.0,@margen)
		set @c20 = dbo.temp_fn_precio_tarifa_embalaje(@tarifa,400.0,@margen)
		set @c21 = dbo.temp_fn_precio_tarifa_embalaje(@tarifa,420.0,@margen)
		set @c22 = dbo.temp_fn_precio_tarifa_embalaje(@tarifa,440.0,@margen)
		set @c23 = dbo.temp_fn_precio_tarifa_embalaje(@tarifa,460.0,@margen)
		set @c24 = dbo.temp_fn_precio_tarifa_embalaje(@tarifa,480.0,@margen)
		set @c25 = dbo.temp_fn_precio_tarifa_embalaje(@tarifa,500.0,@margen)
		set @c26 = dbo.temp_fn_precio_tarifa_embalaje(@tarifa,520.0,@margen)
		set @c27 = dbo.temp_fn_precio_tarifa_embalaje(@tarifa,540.0,@margen)
		set @c28 = dbo.temp_fn_precio_tarifa_embalaje(@tarifa,560.0,@margen)
		set @c29 = dbo.temp_fn_precio_tarifa_embalaje(@tarifa,580.0,@margen)
		set @c30 = dbo.temp_fn_precio_tarifa_embalaje(@tarifa,600.0,@margen)
		set @c31 = dbo.temp_fn_precio_tarifa_embalaje(@tarifa,620.0,@margen)
		set @c32 = dbo.temp_fn_precio_tarifa_embalaje(@tarifa,640.0,@margen)
		set @c33 = dbo.temp_fn_precio_tarifa_embalaje(@tarifa,660.0,@margen)
		set @c34 = dbo.temp_fn_precio_tarifa_embalaje(@tarifa,680.0,@margen)
		set @c35 = dbo.temp_fn_precio_tarifa_embalaje(@tarifa,700.0,@margen)
		set @c36 = dbo.temp_fn_precio_tarifa_embalaje(@tarifa,720.0,@margen)
		set @c37 = dbo.temp_fn_precio_tarifa_embalaje(@tarifa,740.0,@margen)
		set @c38 = dbo.temp_fn_precio_tarifa_embalaje(@tarifa,760.0,@margen)
		set @c39 = dbo.temp_fn_precio_tarifa_embalaje(@tarifa,780.0,@margen)
		set @c40 = dbo.temp_fn_precio_tarifa_embalaje(@tarifa,800.0,@margen)
		set @c41 = dbo.temp_fn_precio_tarifa_embalaje(@tarifa,820.0,@margen)
		set @c42 = dbo.temp_fn_precio_tarifa_embalaje(@tarifa,840.0,@margen)
		set @c43 = dbo.temp_fn_precio_tarifa_embalaje(@tarifa,860.0,@margen)
		set @c44 = dbo.temp_fn_precio_tarifa_embalaje(@tarifa,880.0,@margen)
		set @c45 = dbo.temp_fn_precio_tarifa_embalaje(@tarifa,900.0,@margen)
		set @c46 = dbo.temp_fn_precio_tarifa_embalaje(@tarifa,920.0,@margen)
		set @c47 = dbo.temp_fn_precio_tarifa_embalaje(@tarifa,940.0,@margen)
		set @c48 = dbo.temp_fn_precio_tarifa_embalaje(@tarifa,960.0,@margen)
		set @c49 = dbo.temp_fn_precio_tarifa_embalaje(@tarifa,980.0,@margen)
		set @c50 = dbo.temp_fn_precio_tarifa_embalaje(@tarifa,1000.0,@margen)
		set @c51 = dbo.temp_fn_precio_tarifa_embalaje(@tarifa,1020.0,@margen)
		set @c52 = dbo.temp_fn_precio_tarifa_embalaje(@tarifa,1040.0,@margen)
		set @c53 = dbo.temp_fn_precio_tarifa_embalaje(@tarifa,1060.0,@margen)
		set @c54 = dbo.temp_fn_precio_tarifa_embalaje(@tarifa,1080.0,@margen)
		set @c55 = dbo.temp_fn_precio_tarifa_embalaje(@tarifa,1100.0,@margen)
		set @c56 = dbo.temp_fn_precio_tarifa_embalaje(@tarifa,1120.0,@margen)
		set @c57 = dbo.temp_fn_precio_tarifa_embalaje(@tarifa,1140.0,@margen)
		set @c58 = dbo.temp_fn_precio_tarifa_embalaje(@tarifa,1160.0,@margen)
		set @c59 = dbo.temp_fn_precio_tarifa_embalaje(@tarifa,1180.0,@margen)
		set @c60 = dbo.temp_fn_precio_tarifa_embalaje(@tarifa,1200.0,@margen)
		end

		/* MAPA MECANISMO */
		if @bloque = 5 
		begin
		set @c02 = dbo.fn_Tarifa_Lineales(@tarifa,40.0) + @unitarios + dbo.fn_precio_tarifa_montaje(@tarifa,40.0,@preciomontaje,@margen)
		set @c03 = dbo.fn_Tarifa_Lineales(@tarifa,60.0) + @unitarios + dbo.fn_precio_tarifa_montaje(@tarifa,60.0,@preciomontaje,@margen)
		set @c04 = dbo.fn_Tarifa_Lineales(@tarifa,80.0) + @unitarios + dbo.fn_precio_tarifa_montaje(@tarifa,80.0,@preciomontaje,@margen)
		set @c05 = dbo.fn_Tarifa_Lineales(@tarifa,100.0) + @unitarios + dbo.fn_precio_tarifa_montaje(@tarifa,100.0,@preciomontaje,@margen)
		set @c06 = dbo.fn_Tarifa_Lineales(@tarifa,120.0) + @unitarios + dbo.fn_precio_tarifa_montaje(@tarifa,120.0,@preciomontaje,@margen)
		set @c07 = dbo.fn_Tarifa_Lineales(@tarifa,140.0) + @unitarios + dbo.fn_precio_tarifa_montaje(@tarifa,140.0,@preciomontaje,@margen)
		set @c08 = dbo.fn_Tarifa_Lineales(@tarifa,160.0) + @unitarios + dbo.fn_precio_tarifa_montaje(@tarifa,160.0,@preciomontaje,@margen)
		set @c09 = dbo.fn_Tarifa_Lineales(@tarifa,180.0) + @unitarios + dbo.fn_precio_tarifa_montaje(@tarifa,180.0,@preciomontaje,@margen)
		set @c10 = dbo.fn_Tarifa_Lineales(@tarifa,200.0) + @unitarios + dbo.fn_precio_tarifa_montaje(@tarifa,200.0,@preciomontaje,@margen)
		set @c11 = dbo.fn_Tarifa_Lineales(@tarifa,220.0) + @unitarios + dbo.fn_precio_tarifa_montaje(@tarifa,220.0,@preciomontaje,@margen)
		set @c12 = dbo.fn_Tarifa_Lineales(@tarifa,240.0) + @unitarios + dbo.fn_precio_tarifa_montaje(@tarifa,240.0,@preciomontaje,@margen)
		set @c13 = dbo.fn_Tarifa_Lineales(@tarifa,260.0) + @unitarios + dbo.fn_precio_tarifa_montaje(@tarifa,260.0,@preciomontaje,@margen)
		set @c14 = dbo.fn_Tarifa_Lineales(@tarifa,280.0) + @unitarios + dbo.fn_precio_tarifa_montaje(@tarifa,280.0,@preciomontaje,@margen)
		set @c15 = dbo.fn_Tarifa_Lineales(@tarifa,300.0) + @unitarios + dbo.fn_precio_tarifa_montaje(@tarifa,300.0,@preciomontaje,@margen)
		set @c16 = dbo.fn_Tarifa_Lineales(@tarifa,320.0) + @unitarios + dbo.fn_precio_tarifa_montaje(@tarifa,320.0,@preciomontaje,@margen)
		set @c17 = dbo.fn_Tarifa_Lineales(@tarifa,340.0) + @unitarios + dbo.fn_precio_tarifa_montaje(@tarifa,340.0,@preciomontaje,@margen)
		set @c18 = dbo.fn_Tarifa_Lineales(@tarifa,360.0) + @unitarios + dbo.fn_precio_tarifa_montaje(@tarifa,360.0,@preciomontaje,@margen)
		set @c19 = dbo.fn_Tarifa_Lineales(@tarifa,380.0) + @unitarios + dbo.fn_precio_tarifa_montaje(@tarifa,380.0,@preciomontaje,@margen)
		set @c20 = dbo.fn_Tarifa_Lineales(@tarifa,400.0) + @unitarios + dbo.fn_precio_tarifa_montaje(@tarifa,400.0,@preciomontaje,@margen)
		set @c21 = dbo.fn_Tarifa_Lineales(@tarifa,420.0) + @unitarios + dbo.fn_precio_tarifa_montaje(@tarifa,420.0,@preciomontaje,@margen)
		set @c22 = dbo.fn_Tarifa_Lineales(@tarifa,440.0) + @unitarios + dbo.fn_precio_tarifa_montaje(@tarifa,440.0,@preciomontaje,@margen)
		set @c23 = dbo.fn_Tarifa_Lineales(@tarifa,460.0) + @unitarios + dbo.fn_precio_tarifa_montaje(@tarifa,460.0,@preciomontaje,@margen)
		set @c24 = dbo.fn_Tarifa_Lineales(@tarifa,480.0) + @unitarios + dbo.fn_precio_tarifa_montaje(@tarifa,480.0,@preciomontaje,@margen)
		set @c25 = dbo.fn_Tarifa_Lineales(@tarifa,500.0) + @unitarios + dbo.fn_precio_tarifa_montaje(@tarifa,500.0,@preciomontaje,@margen)
		set @c26 = dbo.fn_Tarifa_Lineales(@tarifa,520.0) + @unitarios + dbo.fn_precio_tarifa_montaje(@tarifa,520.0,@preciomontaje,@margen)
		set @c27 = dbo.fn_Tarifa_Lineales(@tarifa,540.0) + @unitarios + dbo.fn_precio_tarifa_montaje(@tarifa,540.0,@preciomontaje,@margen)
		set @c28 = dbo.fn_Tarifa_Lineales(@tarifa,560.0) + @unitarios + dbo.fn_precio_tarifa_montaje(@tarifa,560.0,@preciomontaje,@margen)
		set @c29 = dbo.fn_Tarifa_Lineales(@tarifa,580.0) + @unitarios + dbo.fn_precio_tarifa_montaje(@tarifa,580.0,@preciomontaje,@margen)
		set @c30 = dbo.fn_Tarifa_Lineales(@tarifa,600.0) + @unitarios + dbo.fn_precio_tarifa_montaje(@tarifa,600.0,@preciomontaje,@margen)
		set @c31 = dbo.fn_Tarifa_Lineales(@tarifa,620.0) + @unitarios + dbo.fn_precio_tarifa_montaje(@tarifa,620.0,@preciomontaje,@margen)
		set @c32 = dbo.fn_Tarifa_Lineales(@tarifa,640.0) + @unitarios + dbo.fn_precio_tarifa_montaje(@tarifa,640.0,@preciomontaje,@margen)
		set @c33 = dbo.fn_Tarifa_Lineales(@tarifa,660.0) + @unitarios + dbo.fn_precio_tarifa_montaje(@tarifa,660.0,@preciomontaje,@margen)
		set @c34 = dbo.fn_Tarifa_Lineales(@tarifa,680.0) + @unitarios + dbo.fn_precio_tarifa_montaje(@tarifa,680.0,@preciomontaje,@margen)
		set @c35 = dbo.fn_Tarifa_Lineales(@tarifa,700.0) + @unitarios + dbo.fn_precio_tarifa_montaje(@tarifa,700.0,@preciomontaje,@margen)
		set @c36 = dbo.fn_Tarifa_Lineales(@tarifa,720.0) + @unitarios + dbo.fn_precio_tarifa_montaje(@tarifa,720.0,@preciomontaje,@margen)
		set @c37 = dbo.fn_Tarifa_Lineales(@tarifa,740.0) + @unitarios + dbo.fn_precio_tarifa_montaje(@tarifa,740.0,@preciomontaje,@margen)
		set @c38 = dbo.fn_Tarifa_Lineales(@tarifa,760.0) + @unitarios + dbo.fn_precio_tarifa_montaje(@tarifa,760.0,@preciomontaje,@margen)
		set @c39 = dbo.fn_Tarifa_Lineales(@tarifa,780.0) + @unitarios + dbo.fn_precio_tarifa_montaje(@tarifa,780.0,@preciomontaje,@margen)
		set @c40 = dbo.fn_Tarifa_Lineales(@tarifa,800.0) + @unitarios + dbo.fn_precio_tarifa_montaje(@tarifa,800.0,@preciomontaje,@margen)
		set @c41 = dbo.fn_Tarifa_Lineales(@tarifa,820.0) + @unitarios + dbo.fn_precio_tarifa_montaje(@tarifa,820.0,@preciomontaje,@margen)
		set @c42 = dbo.fn_Tarifa_Lineales(@tarifa,840.0) + @unitarios + dbo.fn_precio_tarifa_montaje(@tarifa,840.0,@preciomontaje,@margen)
		set @c43 = dbo.fn_Tarifa_Lineales(@tarifa,860.0) + @unitarios + dbo.fn_precio_tarifa_montaje(@tarifa,860.0,@preciomontaje,@margen)
		set @c44 = dbo.fn_Tarifa_Lineales(@tarifa,880.0) + @unitarios + dbo.fn_precio_tarifa_montaje(@tarifa,880.0,@preciomontaje,@margen)
		set @c45 = dbo.fn_Tarifa_Lineales(@tarifa,900.0) + @unitarios + dbo.fn_precio_tarifa_montaje(@tarifa,900.0,@preciomontaje,@margen)
		set @c46 = dbo.fn_Tarifa_Lineales(@tarifa,920.0) + @unitarios + dbo.fn_precio_tarifa_montaje(@tarifa,920.0,@preciomontaje,@margen)
		set @c47 = dbo.fn_Tarifa_Lineales(@tarifa,940.0) + @unitarios + dbo.fn_precio_tarifa_montaje(@tarifa,940.0,@preciomontaje,@margen)
		set @c48 = dbo.fn_Tarifa_Lineales(@tarifa,960.0) + @unitarios + dbo.fn_precio_tarifa_montaje(@tarifa,960.0,@preciomontaje,@margen)
		set @c49 = dbo.fn_Tarifa_Lineales(@tarifa,980.0) + @unitarios + dbo.fn_precio_tarifa_montaje(@tarifa,980.0,@preciomontaje,@margen)
		set @c50 = dbo.fn_Tarifa_Lineales(@tarifa,1000.0) + @unitarios + dbo.fn_precio_tarifa_montaje(@tarifa,1000.0,@preciomontaje,@margen)
		set @c51 = dbo.fn_Tarifa_Lineales(@tarifa,1020.0) + @unitarios + dbo.fn_precio_tarifa_montaje(@tarifa,1020.0,@preciomontaje,@margen)
		set @c52 = dbo.fn_Tarifa_Lineales(@tarifa,1040.0) + @unitarios + dbo.fn_precio_tarifa_montaje(@tarifa,1040.0,@preciomontaje,@margen)
		set @c53 = dbo.fn_Tarifa_Lineales(@tarifa,1060.0) + @unitarios + dbo.fn_precio_tarifa_montaje(@tarifa,1060.0,@preciomontaje,@margen)
		set @c54 = dbo.fn_Tarifa_Lineales(@tarifa,1080.0) + @unitarios + dbo.fn_precio_tarifa_montaje(@tarifa,1080.0,@preciomontaje,@margen)
		set @c55 = dbo.fn_Tarifa_Lineales(@tarifa,1100.0) + @unitarios + dbo.fn_precio_tarifa_montaje(@tarifa,1000.0,@preciomontaje,@margen)
		set @c56 = dbo.fn_Tarifa_Lineales(@tarifa,1120.0) + @unitarios + dbo.fn_precio_tarifa_montaje(@tarifa,1120.0,@preciomontaje,@margen)
		set @c57 = dbo.fn_Tarifa_Lineales(@tarifa,1140.0) + @unitarios + dbo.fn_precio_tarifa_montaje(@tarifa,1140.0,@preciomontaje,@margen)
		set @c58 = dbo.fn_Tarifa_Lineales(@tarifa,1160.0) + @unitarios + dbo.fn_precio_tarifa_montaje(@tarifa,1160.0,@preciomontaje,@margen)
		set @c59 = dbo.fn_Tarifa_Lineales(@tarifa,1180.0) + @unitarios + dbo.fn_precio_tarifa_montaje(@tarifa,1180.0,@preciomontaje,@margen)
		set @c60 = dbo.fn_Tarifa_Lineales(@tarifa,1200.0) + @unitarios + dbo.fn_precio_tarifa_montaje(@tarifa,1200.0,@preciomontaje,@margen)
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
		set @c31 = dbo.fn_solarmanes_peso_tejido(6.20,@c01,@densidad)
		set @c32 = dbo.fn_solarmanes_peso_tejido(6.40,@c01,@densidad)
		set @c33 = dbo.fn_solarmanes_peso_tejido(6.60,@c01,@densidad)
		set @c34 = dbo.fn_solarmanes_peso_tejido(6.80,@c01,@densidad)
		set @c35 = dbo.fn_solarmanes_peso_tejido(7.00,@c01,@densidad)
		set @c36 = dbo.fn_solarmanes_peso_tejido(7.20,@c01,@densidad)
		set @c37 = dbo.fn_solarmanes_peso_tejido(7.40,@c01,@densidad)
		set @c38 = dbo.fn_solarmanes_peso_tejido(7.60,@c01,@densidad)
		set @c39 = dbo.fn_solarmanes_peso_tejido(7.80,@c01,@densidad)
		set @c40 = dbo.fn_solarmanes_peso_tejido(8.00,@c01,@densidad)
		set @c41 = dbo.fn_solarmanes_peso_tejido(8.20,@c01,@densidad)
		set @c42 = dbo.fn_solarmanes_peso_tejido(8.40,@c01,@densidad)
		set @c43 = dbo.fn_solarmanes_peso_tejido(8.60,@c01,@densidad)
		set @c44 = dbo.fn_solarmanes_peso_tejido(8.80,@c01,@densidad)
		set @c45 = dbo.fn_solarmanes_peso_tejido(9.00,@c01,@densidad)
		set @c46 = dbo.fn_solarmanes_peso_tejido(9.20,@c01,@densidad)
		set @c47 = dbo.fn_solarmanes_peso_tejido(9.40,@c01,@densidad)
		set @c48 = dbo.fn_solarmanes_peso_tejido(9.60,@c01,@densidad)
		set @c49 = dbo.fn_solarmanes_peso_tejido(9.80,@c01,@densidad)
		set @c50 = dbo.fn_solarmanes_peso_tejido(10.00,@c01,@densidad)
		set @c51 = dbo.fn_solarmanes_peso_tejido(10.20,@c01,@densidad)
		set @c52 = dbo.fn_solarmanes_peso_tejido(10.40,@c01,@densidad)
		set @c53 = dbo.fn_solarmanes_peso_tejido(10.60,@c01,@densidad)
		set @c54 = dbo.fn_solarmanes_peso_tejido(10.80,@c01,@densidad)
		set @c55 = dbo.fn_solarmanes_peso_tejido(11.00,@c01,@densidad)
		set @c56 = dbo.fn_solarmanes_peso_tejido(11.20,@c01,@densidad)
		set @c57 = dbo.fn_solarmanes_peso_tejido(11.40,@c01,@densidad)
		set @c58 = dbo.fn_solarmanes_peso_tejido(11.60,@c01,@densidad)
		set @c59 = dbo.fn_solarmanes_peso_tejido(11.80,@c01,@densidad)
		set @c60 = dbo.fn_solarmanes_peso_tejido(12.00,@c01,@densidad)
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
		set @c31 = @margen*dbo.fn_solarmanes_peso_tejido_valor(@tarifa,6.20,@c01,@densidad)
		set @c32 = @margen*dbo.fn_solarmanes_peso_tejido_valor(@tarifa,6.40,@c01,@densidad)		
		set @c33 = @margen*dbo.fn_solarmanes_peso_tejido_valor(@tarifa,6.60,@c01,@densidad)
		set @c34 = @margen*dbo.fn_solarmanes_peso_tejido_valor(@tarifa,6.80,@c01,@densidad)
		set @c35 = @margen*dbo.fn_solarmanes_peso_tejido_valor(@tarifa,7.00,@c01,@densidad)
		set @c36 = @margen*dbo.fn_solarmanes_peso_tejido_valor(@tarifa,7.20,@c01,@densidad)
		set @c37 = @margen*dbo.fn_solarmanes_peso_tejido_valor(@tarifa,7.40,@c01,@densidad)
		set @c38 = @margen*dbo.fn_solarmanes_peso_tejido_valor(@tarifa,7.60,@c01,@densidad)
		set @c39 = @margen*dbo.fn_solarmanes_peso_tejido_valor(@tarifa,7.80,@c01,@densidad)
		set @c40 = @margen*dbo.fn_solarmanes_peso_tejido_valor(@tarifa,8.00,@c01,@densidad)
		set @c41 = @margen*dbo.fn_solarmanes_peso_tejido_valor(@tarifa,8.20,@c01,@densidad)
		set @c42 = @margen*dbo.fn_solarmanes_peso_tejido_valor(@tarifa,8.40,@c01,@densidad)
		set @c43 = @margen*dbo.fn_solarmanes_peso_tejido_valor(@tarifa,8.60,@c01,@densidad)
		set @c44 = @margen*dbo.fn_solarmanes_peso_tejido_valor(@tarifa,8.80,@c01,@densidad)
		set @c45 = @margen*dbo.fn_solarmanes_peso_tejido_valor(@tarifa,9.00,@c01,@densidad)
		set @c46 = @margen*dbo.fn_solarmanes_peso_tejido_valor(@tarifa,9.20,@c01,@densidad)
		set @c47 = @margen*dbo.fn_solarmanes_peso_tejido_valor(@tarifa,9.40,@c01,@densidad)
		set @c48 = @margen*dbo.fn_solarmanes_peso_tejido_valor(@tarifa,9.60,@c01,@densidad)
		set @c49 = @margen*dbo.fn_solarmanes_peso_tejido_valor(@tarifa,9.80,@c01,@densidad)
		set @c50 = @margen*dbo.fn_solarmanes_peso_tejido_valor(@tarifa,10.00,@c01,@densidad)
		set @c51 = @margen*dbo.fn_solarmanes_peso_tejido_valor(@tarifa,10.20,@c01,@densidad)
		set @c52 = @margen*dbo.fn_solarmanes_peso_tejido_valor(@tarifa,10.40,@c01,@densidad)
		set @c53 = @margen*dbo.fn_solarmanes_peso_tejido_valor(@tarifa,10.60,@c01,@densidad)
		set @c54 = @margen*dbo.fn_solarmanes_peso_tejido_valor(@tarifa,10.80,@c01,@densidad)
		set @c55 = @margen*dbo.fn_solarmanes_peso_tejido_valor(@tarifa,11.00,@c01,@densidad)
		set @c56 = @margen*dbo.fn_solarmanes_peso_tejido_valor(@tarifa,11.20,@c01,@densidad)
		set @c57 = @margen*dbo.fn_solarmanes_peso_tejido_valor(@tarifa,11.40,@c01,@densidad)
		set @c58 = @margen*dbo.fn_solarmanes_peso_tejido_valor(@tarifa,11.60,@c01,@densidad)
		set @c59 = @margen*dbo.fn_solarmanes_peso_tejido_valor(@tarifa,11.80,@c01,@densidad)
		set @c60 = @margen*dbo.fn_solarmanes_peso_tejido_valor(@tarifa,12.00,@c01,@densidad)
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
			set @c31 = @c02
			set @c32 = @c02
			set @c33 = @c02  
			set @c34 =  @c02 
			set @c35 = @c02 
			set @c36 =  @c02
			set @c37 = @c02
			set @c38 = @c02 
			set @c39 =  @c02 
			set @c40 =  @c02 
			set @c41 =  @c02 
			set @c42 =  @c02 
			set @c43 =  @c02 
			set @c44 =  @c02
			set @c45 =  @c02 
			set @c46 =  @c02
			set @c47 =  @c02
			set @c48 =  @c02
			set @c49 =  @c02
			set @c50 =  @c02
			set @c51 = @c02 
			set @c52 =  @c02
			set @c53 =  @c02
			set @c54 =  @c02 
			set @c55 = @c02 
			set @c56 = @c02
			set @c57 =  @c02
			set @c58 =  @c02
			set @c59 =  @c02
			set @c60 =  @c02
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
			set @c31 = dbo.fn_solarmanes_precio_articulos_tipo_7(@tarifa,620,@c30)
			set @c32 = dbo.fn_solarmanes_precio_articulos_tipo_7(@tarifa,640,@c30)
			set @c33 = dbo.fn_solarmanes_precio_articulos_tipo_7(@tarifa,660,@c03)
			set @c34 = dbo.fn_solarmanes_precio_articulos_tipo_7(@tarifa,680,@c04)
			set @c35 = dbo.fn_solarmanes_precio_articulos_tipo_7(@tarifa,700,@c05)
			set @c36 = dbo.fn_solarmanes_precio_articulos_tipo_7(@tarifa,720,@c06)
			set @c37 = dbo.fn_solarmanes_precio_articulos_tipo_7(@tarifa,740,@c07)
			set @c38 = dbo.fn_solarmanes_precio_articulos_tipo_7(@tarifa,760,@c08)
			set @c39 = dbo.fn_solarmanes_precio_articulos_tipo_7(@tarifa,780,@c09)
			set @c40 = dbo.fn_solarmanes_precio_articulos_tipo_7(@tarifa,800,@c10)
			set @c41 = dbo.fn_solarmanes_precio_articulos_tipo_7(@tarifa,820,@c11)
			set @c42 = dbo.fn_solarmanes_precio_articulos_tipo_7(@tarifa,840,@c12)
			set @c43 = dbo.fn_solarmanes_precio_articulos_tipo_7(@tarifa,860,@c13)
			set @c44 = dbo.fn_solarmanes_precio_articulos_tipo_7(@tarifa,880,@c14)
			set @c45 = dbo.fn_solarmanes_precio_articulos_tipo_7(@tarifa,900,@c15)
			set @c46 = dbo.fn_solarmanes_precio_articulos_tipo_7(@tarifa,920,@c16)
			set @c47 = dbo.fn_solarmanes_precio_articulos_tipo_7(@tarifa,940,@c17)
			set @c48 = dbo.fn_solarmanes_precio_articulos_tipo_7(@tarifa,960,@c18)
			set @c49 = dbo.fn_solarmanes_precio_articulos_tipo_7(@tarifa,980,@c19)
			set @c50 = dbo.fn_solarmanes_precio_articulos_tipo_7(@tarifa,1000,@c20)
			set @c51 = dbo.fn_solarmanes_precio_articulos_tipo_7(@tarifa,1020,@c21)
			set @c52 = dbo.fn_solarmanes_precio_articulos_tipo_7(@tarifa,1040,@c22)
			set @c53 = dbo.fn_solarmanes_precio_articulos_tipo_7(@tarifa,1060,@c23)
			set @c54 = dbo.fn_solarmanes_precio_articulos_tipo_7(@tarifa,1080,@c24)
			set @c55 = dbo.fn_solarmanes_precio_articulos_tipo_7(@tarifa,1100,@c25)
			set @c56 = dbo.fn_solarmanes_precio_articulos_tipo_7(@tarifa,1120,@c26)
			set @c57 = dbo.fn_solarmanes_precio_articulos_tipo_7(@tarifa,1140,@c27)
			set @c58 = dbo.fn_solarmanes_precio_articulos_tipo_7(@tarifa,1160,@c28)
			set @c59 = dbo.fn_solarmanes_precio_articulos_tipo_7(@tarifa,1180,@c29)
			set @c60 = dbo.fn_solarmanes_precio_articulos_tipo_7(@tarifa,1200,@c30)
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
			set @c31 = dbo.fn_solarmanes_precio_articulos_tipo_8(@tarifa,620,@c30)
			set @c32 = dbo.fn_solarmanes_precio_articulos_tipo_8(@tarifa,640,@c30)
			set @c33 = dbo.fn_solarmanes_precio_articulos_tipo_8(@tarifa,660,@c03)
			set @c34 = dbo.fn_solarmanes_precio_articulos_tipo_8(@tarifa,680,@c04)
			set @c35 = dbo.fn_solarmanes_precio_articulos_tipo_8(@tarifa,700,@c05)
			set @c36 = dbo.fn_solarmanes_precio_articulos_tipo_8(@tarifa,720,@c06)
			set @c37 = dbo.fn_solarmanes_precio_articulos_tipo_8(@tarifa,740,@c07)
			set @c38 = dbo.fn_solarmanes_precio_articulos_tipo_8(@tarifa,760,@c08)
			set @c39 = dbo.fn_solarmanes_precio_articulos_tipo_8(@tarifa,780,@c09)
			set @c40 = dbo.fn_solarmanes_precio_articulos_tipo_8(@tarifa,800,@c10)
			set @c41 = dbo.fn_solarmanes_precio_articulos_tipo_8(@tarifa,820,@c11)
			set @c42 = dbo.fn_solarmanes_precio_articulos_tipo_8(@tarifa,840,@c12)
			set @c43 = dbo.fn_solarmanes_precio_articulos_tipo_8(@tarifa,860,@c13)
			set @c44 = dbo.fn_solarmanes_precio_articulos_tipo_8(@tarifa,880,@c14)
			set @c45 = dbo.fn_solarmanes_precio_articulos_tipo_8(@tarifa,900,@c15)
			set @c46 = dbo.fn_solarmanes_precio_articulos_tipo_8(@tarifa,920,@c16)
			set @c47 = dbo.fn_solarmanes_precio_articulos_tipo_8(@tarifa,940,@c17)
			set @c48 = dbo.fn_solarmanes_precio_articulos_tipo_8(@tarifa,960,@c18)
			set @c49 = dbo.fn_solarmanes_precio_articulos_tipo_8(@tarifa,980,@c19)
			set @c50 = dbo.fn_solarmanes_precio_articulos_tipo_8(@tarifa,1000,@c20)
			set @c51 = dbo.fn_solarmanes_precio_articulos_tipo_8(@tarifa,1020,@c21)
			set @c52 = dbo.fn_solarmanes_precio_articulos_tipo_8(@tarifa,1040,@c22)
			set @c53 = dbo.fn_solarmanes_precio_articulos_tipo_8(@tarifa,1060,@c23)
			set @c54 = dbo.fn_solarmanes_precio_articulos_tipo_8(@tarifa,1080,@c24)
			set @c55 = dbo.fn_solarmanes_precio_articulos_tipo_8(@tarifa,1100,@c25)
			set @c56 = dbo.fn_solarmanes_precio_articulos_tipo_8(@tarifa,1120,@c26)
			set @c57 = dbo.fn_solarmanes_precio_articulos_tipo_8(@tarifa,1140,@c27)
			set @c58 = dbo.fn_solarmanes_precio_articulos_tipo_8(@tarifa,1160,@c28)
			set @c59 = dbo.fn_solarmanes_precio_articulos_tipo_8(@tarifa,1180,@c29)
			set @c60 = dbo.fn_solarmanes_precio_articulos_tipo_8(@tarifa,1200,@c30)
		end

		/* MAPA COMPLETO */
		if @bloque = 10 /* ALL */  
		begin

	
		set @c02 = @margen2 * (dbo.fn_solarmanes_precio_tejido(40.0,100*@alto,@criterio,@margen,@preciom2,1) + @unitarios  + dbo.fn_Tarifa_Lineales(@tarifa,40.0) + dbo.fn_precio_tarifa_montaje(@tarifa,40.0,@preciomontaje,@margen)   +  @margen*dbo.fn_solarmanes_peso_tejido_valor(@tarifa,0.40,@c01,@densidad) + @verticales*@alto) + dbo.temp_fn_precio_tarifa_embalaje(@tarifa,40.0,@margen) + dbo.fn_solarmanes_precio_articulos_tipo_7(@tarifa,40,@c01) + @monetarios + dbo.fn_solarmanes_precio_articulos_tipo_8(@tarifa,40,@c01)
		set @c03 = @margen2 * (dbo.fn_solarmanes_precio_tejido(60.0,100*@alto,@criterio,@margen,@preciom2,1) + @unitarios  + dbo.fn_Tarifa_Lineales(@tarifa,60.0) + dbo.fn_precio_tarifa_montaje(@tarifa,60.0,@preciomontaje,@margen)   +  @margen*dbo.fn_solarmanes_peso_tejido_valor(@tarifa,0.60,@c01,@densidad) + @verticales*@alto) + dbo.temp_fn_precio_tarifa_embalaje(@tarifa,60.0,@margen) + dbo.fn_solarmanes_precio_articulos_tipo_7(@tarifa,60,@c01) + @monetarios + dbo.fn_solarmanes_precio_articulos_tipo_8(@tarifa,60,@c01)
		set @c04 = @margen2 * (dbo.fn_solarmanes_precio_tejido(80.0,100*@alto,@criterio,@margen,@preciom2,1)  + @unitarios + dbo.fn_Tarifa_Lineales(@tarifa,80.0) + dbo.fn_precio_tarifa_montaje(@tarifa,80.0,@preciomontaje,@margen)   +  @margen*dbo.fn_solarmanes_peso_tejido_valor(@tarifa,0.80,@c01,@densidad) + @verticales*@alto) + dbo.temp_fn_precio_tarifa_embalaje(@tarifa,80.0,@margen) + dbo.fn_solarmanes_precio_articulos_tipo_7(@tarifa,80,@c01) + @monetarios + dbo.fn_solarmanes_precio_articulos_tipo_8(@tarifa,80,@c01)
		set @c05 = @margen2 * (dbo.fn_solarmanes_precio_tejido(100.0,100*@alto,@criterio,@margen,@preciom2,1) + @unitarios + dbo.fn_Tarifa_Lineales(@tarifa,100.0) + dbo.fn_precio_tarifa_montaje(@tarifa,100.0,@preciomontaje,@margen) +  @margen*dbo.fn_solarmanes_peso_tejido_valor(@tarifa,1.00,@c01,@densidad) + @verticales*@alto) + dbo.temp_fn_precio_tarifa_embalaje(@tarifa,100.0,@margen) + dbo.fn_solarmanes_precio_articulos_tipo_7(@tarifa,100,@c01) + @monetarios + dbo.fn_solarmanes_precio_articulos_tipo_8(@tarifa,100,@c01)
		set @c06 = @margen2 * (dbo.fn_solarmanes_precio_tejido(120.0,100*@alto,@criterio,@margen,@preciom2,1) + @unitarios + dbo.fn_Tarifa_Lineales(@tarifa,120.0) + dbo.fn_precio_tarifa_montaje(@tarifa,120.0,@preciomontaje,@margen) +  @margen*dbo.fn_solarmanes_peso_tejido_valor(@tarifa,1.20,@c01,@densidad) + @verticales*@alto) + dbo.temp_fn_precio_tarifa_embalaje(@tarifa,120.0,@margen) + dbo.fn_solarmanes_precio_articulos_tipo_7(@tarifa,120,@c01) + @monetarios + dbo.fn_solarmanes_precio_articulos_tipo_8(@tarifa,120,@c01)
		set @c07 = @margen2 * (dbo.fn_solarmanes_precio_tejido(140.0,100*@alto,@criterio,@margen,@preciom2,1) + @unitarios + dbo.fn_Tarifa_Lineales(@tarifa,140.0) + dbo.fn_precio_tarifa_montaje(@tarifa,140.0,@preciomontaje,@margen) +  @margen*dbo.fn_solarmanes_peso_tejido_valor(@tarifa,1.40,@c01,@densidad) + @verticales*@alto) + dbo.temp_fn_precio_tarifa_embalaje(@tarifa,140.0,@margen) + dbo.fn_solarmanes_precio_articulos_tipo_7(@tarifa,140,@c01) + @monetarios + dbo.fn_solarmanes_precio_articulos_tipo_8(@tarifa,140,@c01)
		set @c08 = @margen2 * (dbo.fn_solarmanes_precio_tejido(160.0,100*@alto,@criterio,@margen,@preciom2,1) + @unitarios + dbo.fn_Tarifa_Lineales(@tarifa,160.0) + dbo.fn_precio_tarifa_montaje(@tarifa,160.0,@preciomontaje,@margen) +  @margen*dbo.fn_solarmanes_peso_tejido_valor(@tarifa,1.60,@c01,@densidad) + @verticales*@alto) + dbo.temp_fn_precio_tarifa_embalaje(@tarifa,160.0,@margen) + dbo.fn_solarmanes_precio_articulos_tipo_7(@tarifa,160,@c01) + @monetarios + dbo.fn_solarmanes_precio_articulos_tipo_8(@tarifa,160,@c01)
		set @c09 = @margen2 * (dbo.fn_solarmanes_precio_tejido(180.0,100*@alto,@criterio,@margen,@preciom2,1) + @unitarios + dbo.fn_Tarifa_Lineales(@tarifa,180.0) + dbo.fn_precio_tarifa_montaje(@tarifa,180.0,@preciomontaje,@margen) +  @margen*dbo.fn_solarmanes_peso_tejido_valor(@tarifa,1.80,@c01,@densidad) + @verticales*@alto) + dbo.temp_fn_precio_tarifa_embalaje(@tarifa,180.0,@margen) + dbo.fn_solarmanes_precio_articulos_tipo_7(@tarifa,180,@c01) + @monetarios + dbo.fn_solarmanes_precio_articulos_tipo_8(@tarifa,180,@c01)
		set @c10 = @margen2 * (dbo.fn_solarmanes_precio_tejido(200.0,100*@alto,@criterio,@margen,@preciom2,1) + @unitarios + dbo.fn_Tarifa_Lineales(@tarifa,200.0) + dbo.fn_precio_tarifa_montaje(@tarifa,200.0,@preciomontaje,@margen) +  @margen*dbo.fn_solarmanes_peso_tejido_valor(@tarifa,2.00,@c01,@densidad) + @verticales*@alto) + dbo.temp_fn_precio_tarifa_embalaje(@tarifa,200.0,@margen) + dbo.fn_solarmanes_precio_articulos_tipo_7(@tarifa,200,@c01) + @monetarios + dbo.fn_solarmanes_precio_articulos_tipo_8(@tarifa,200,@c01)
		set @c11 = @margen2 * (dbo.fn_solarmanes_precio_tejido(220.0,100*@alto,@criterio,@margen,@preciom2,1) + @unitarios + dbo.fn_Tarifa_Lineales(@tarifa,220.0) + dbo.fn_precio_tarifa_montaje(@tarifa,220.0,@preciomontaje,@margen) +  @margen*dbo.fn_solarmanes_peso_tejido_valor(@tarifa,2.20,@c01,@densidad) + @verticales*@alto) + dbo.temp_fn_precio_tarifa_embalaje(@tarifa,220.0,@margen) + dbo.fn_solarmanes_precio_articulos_tipo_7(@tarifa,220,@c01) + @monetarios + dbo.fn_solarmanes_precio_articulos_tipo_8(@tarifa,220,@c01)
		set @c12 = @margen2 * (dbo.fn_solarmanes_precio_tejido(240.0,100*@alto,@criterio,@margen,@preciom2,1) + @unitarios + dbo.fn_Tarifa_Lineales(@tarifa,240.0) + dbo.fn_precio_tarifa_montaje(@tarifa,240.0,@preciomontaje,@margen) +  @margen*dbo.fn_solarmanes_peso_tejido_valor(@tarifa,2.40,@c01,@densidad) + @verticales*@alto) + dbo.temp_fn_precio_tarifa_embalaje(@tarifa,240.0,@margen) + dbo.fn_solarmanes_precio_articulos_tipo_7(@tarifa,240,@c01) + @monetarios + dbo.fn_solarmanes_precio_articulos_tipo_8(@tarifa,240,@c01)
		set @c13 = @margen2 * (dbo.fn_solarmanes_precio_tejido(260.0,100*@alto,@criterio,@margen,@preciom2,1) + @unitarios + dbo.fn_Tarifa_Lineales(@tarifa,260.0) + dbo.fn_precio_tarifa_montaje(@tarifa,260.0,@preciomontaje,@margen) +  @margen*dbo.fn_solarmanes_peso_tejido_valor(@tarifa,2.60,@c01,@densidad) + @verticales*@alto) + dbo.temp_fn_precio_tarifa_embalaje(@tarifa,260.0,@margen) + dbo.fn_solarmanes_precio_articulos_tipo_7(@tarifa,260,@c01) + @monetarios + dbo.fn_solarmanes_precio_articulos_tipo_8(@tarifa,260,@c01)
		set @c14 = @margen2 * (dbo.fn_solarmanes_precio_tejido(280.0,100*@alto,@criterio,@margen,@preciom2,1) + @unitarios + dbo.fn_Tarifa_Lineales(@tarifa,280.0) + dbo.fn_precio_tarifa_montaje(@tarifa,280.0,@preciomontaje,@margen) +  @margen*dbo.fn_solarmanes_peso_tejido_valor(@tarifa,2.80,@c01,@densidad) + @verticales*@alto) + dbo.temp_fn_precio_tarifa_embalaje(@tarifa,280.0,@margen) + dbo.fn_solarmanes_precio_articulos_tipo_7(@tarifa,280,@c01) + @monetarios + dbo.fn_solarmanes_precio_articulos_tipo_8(@tarifa,280,@c01)
		set @c15 = @margen2 * (dbo.fn_solarmanes_precio_tejido(300.0,100*@alto,@criterio,@margen,@preciom2,1) + @unitarios + dbo.fn_Tarifa_Lineales(@tarifa,300.0) + dbo.fn_precio_tarifa_montaje(@tarifa,300.0,@preciomontaje,@margen) +  @margen*dbo.fn_solarmanes_peso_tejido_valor(@tarifa,3.00,@c01,@densidad) + @verticales*@alto) + dbo.temp_fn_precio_tarifa_embalaje(@tarifa,300.0,@margen) + dbo.fn_solarmanes_precio_articulos_tipo_7(@tarifa,300,@c01) + @monetarios + dbo.fn_solarmanes_precio_articulos_tipo_8(@tarifa,300,@c01)
		set @c16 = @margen2 * (dbo.fn_solarmanes_precio_tejido(320.0,100*@alto,@criterio,@margen,@preciom2,1) + @unitarios + dbo.fn_Tarifa_Lineales(@tarifa,320.0) + dbo.fn_precio_tarifa_montaje(@tarifa,320.0,@preciomontaje,@margen) +  @margen*dbo.fn_solarmanes_peso_tejido_valor(@tarifa,3.20,@c01,@densidad) + @verticales*@alto) + dbo.temp_fn_precio_tarifa_embalaje(@tarifa,320.0,@margen) + dbo.fn_solarmanes_precio_articulos_tipo_7(@tarifa,320,@c01) + @monetarios + dbo.fn_solarmanes_precio_articulos_tipo_8(@tarifa,320,@c01)
		set @c17 = @margen2 * (dbo.fn_solarmanes_precio_tejido(340.0,100*@alto,@criterio,@margen,@preciom2,1) + @unitarios + dbo.fn_Tarifa_Lineales(@tarifa,340.0) + dbo.fn_precio_tarifa_montaje(@tarifa,340.0,@preciomontaje,@margen) +  @margen*dbo.fn_solarmanes_peso_tejido_valor(@tarifa,3.40,@c01,@densidad) + @verticales*@alto) + dbo.temp_fn_precio_tarifa_embalaje(@tarifa,340.0,@margen) + dbo.fn_solarmanes_precio_articulos_tipo_7(@tarifa,340,@c01) + @monetarios + dbo.fn_solarmanes_precio_articulos_tipo_8(@tarifa,340,@c01)
		set @c18 = @margen2 * (dbo.fn_solarmanes_precio_tejido(360.0,100*@alto,@criterio,@margen,@preciom2,1) + @unitarios + dbo.fn_Tarifa_Lineales(@tarifa,360.0) + dbo.fn_precio_tarifa_montaje(@tarifa,360.0,@preciomontaje,@margen) +  @margen*dbo.fn_solarmanes_peso_tejido_valor(@tarifa,3.60,@c01,@densidad) + @verticales*@alto) + dbo.temp_fn_precio_tarifa_embalaje(@tarifa,360.0,@margen) + dbo.fn_solarmanes_precio_articulos_tipo_7(@tarifa,360,@c01) + @monetarios + dbo.fn_solarmanes_precio_articulos_tipo_8(@tarifa,360,@c01)
		set @c19 = @margen2 * (dbo.fn_solarmanes_precio_tejido(380.0,100*@alto,@criterio,@margen,@preciom2,1) + @unitarios + dbo.fn_Tarifa_Lineales(@tarifa,380.0) + dbo.fn_precio_tarifa_montaje(@tarifa,380.0,@preciomontaje,@margen) +  @margen*dbo.fn_solarmanes_peso_tejido_valor(@tarifa,3.80,@c01,@densidad) + @verticales*@alto) + dbo.temp_fn_precio_tarifa_embalaje(@tarifa,380.0,@margen) + dbo.fn_solarmanes_precio_articulos_tipo_7(@tarifa,380,@c01) + @monetarios + dbo.fn_solarmanes_precio_articulos_tipo_8(@tarifa,380,@c01)
		set @c20 = @margen2 * (dbo.fn_solarmanes_precio_tejido(400.0,100*@alto,@criterio,@margen,@preciom2,1) + @unitarios + dbo.fn_Tarifa_Lineales(@tarifa,400.0) + dbo.fn_precio_tarifa_montaje(@tarifa,400.0,@preciomontaje,@margen) +  @margen*dbo.fn_solarmanes_peso_tejido_valor(@tarifa,4.00,@c01,@densidad) + @verticales*@alto) + dbo.temp_fn_precio_tarifa_embalaje(@tarifa,400.0,@margen) + dbo.fn_solarmanes_precio_articulos_tipo_7(@tarifa,400,@c01) + @monetarios + dbo.fn_solarmanes_precio_articulos_tipo_8(@tarifa,400,@c01)
		set @c21 = @margen2 * (dbo.fn_solarmanes_precio_tejido(420.0,100*@alto,@criterio,@margen,@preciom2,1) + @unitarios + dbo.fn_Tarifa_Lineales(@tarifa,420.0) + dbo.fn_precio_tarifa_montaje(@tarifa,420.0,@preciomontaje,@margen) +  @margen*dbo.fn_solarmanes_peso_tejido_valor(@tarifa,4.20,@c01,@densidad) + @verticales*@alto) + dbo.temp_fn_precio_tarifa_embalaje(@tarifa,420.0,@margen) + dbo.fn_solarmanes_precio_articulos_tipo_7(@tarifa,420,@c01) + @monetarios + dbo.fn_solarmanes_precio_articulos_tipo_8(@tarifa,420,@c01)
		set @c22 = @margen2 * (dbo.fn_solarmanes_precio_tejido(440.0,100*@alto,@criterio,@margen,@preciom2,1) + @unitarios + dbo.fn_Tarifa_Lineales(@tarifa,440.0) + dbo.fn_precio_tarifa_montaje(@tarifa,440.0,@preciomontaje,@margen) +  @margen*dbo.fn_solarmanes_peso_tejido_valor(@tarifa,4.40,@c01,@densidad) + @verticales*@alto) + dbo.temp_fn_precio_tarifa_embalaje(@tarifa,440.0,@margen) + dbo.fn_solarmanes_precio_articulos_tipo_7(@tarifa,440,@c01) + @monetarios + dbo.fn_solarmanes_precio_articulos_tipo_8(@tarifa,440,@c01)
		set @c23 = @margen2 * (dbo.fn_solarmanes_precio_tejido(460.0,100*@alto,@criterio,@margen,@preciom2,1) + @unitarios + dbo.fn_Tarifa_Lineales(@tarifa,460.0) + dbo.fn_precio_tarifa_montaje(@tarifa,460.0,@preciomontaje,@margen) +  @margen*dbo.fn_solarmanes_peso_tejido_valor(@tarifa,4.60,@c01,@densidad) + @verticales*@alto) + dbo.temp_fn_precio_tarifa_embalaje(@tarifa,460.0,@margen) + dbo.fn_solarmanes_precio_articulos_tipo_7(@tarifa,460,@c01) + @monetarios + dbo.fn_solarmanes_precio_articulos_tipo_8(@tarifa,460,@c01)
		set @c24 = @margen2 * (dbo.fn_solarmanes_precio_tejido(480.0,100*@alto,@criterio,@margen,@preciom2,1) + @unitarios + dbo.fn_Tarifa_Lineales(@tarifa,480.0) + dbo.fn_precio_tarifa_montaje(@tarifa,480.0,@preciomontaje,@margen) +  @margen*dbo.fn_solarmanes_peso_tejido_valor(@tarifa,4.80,@c01,@densidad) + @verticales*@alto) + dbo.temp_fn_precio_tarifa_embalaje(@tarifa,480.0,@margen) + dbo.fn_solarmanes_precio_articulos_tipo_7(@tarifa,480,@c01) + @monetarios + dbo.fn_solarmanes_precio_articulos_tipo_8(@tarifa,480,@c01)
		set @c25 = @margen2 * (dbo.fn_solarmanes_precio_tejido(500.0,100*@alto,@criterio,@margen,@preciom2,1) + @unitarios + dbo.fn_Tarifa_Lineales(@tarifa,500.0) + dbo.fn_precio_tarifa_montaje(@tarifa,500.0,@preciomontaje,@margen) +  @margen*dbo.fn_solarmanes_peso_tejido_valor(@tarifa,5.00,@c01,@densidad) + @verticales*@alto) + dbo.temp_fn_precio_tarifa_embalaje(@tarifa,500.0,@margen) + dbo.fn_solarmanes_precio_articulos_tipo_7(@tarifa,500,@c01) + @monetarios + dbo.fn_solarmanes_precio_articulos_tipo_8(@tarifa,500,@c01)
		set @c26 = @margen2 * (dbo.fn_solarmanes_precio_tejido(520.0,100*@alto,@criterio,@margen,@preciom2,1) + @unitarios + dbo.fn_Tarifa_Lineales(@tarifa,520.0) + dbo.fn_precio_tarifa_montaje(@tarifa,520.0,@preciomontaje,@margen) +  @margen*dbo.fn_solarmanes_peso_tejido_valor(@tarifa,5.20,@c01,@densidad) + @verticales*@alto) + dbo.temp_fn_precio_tarifa_embalaje(@tarifa,520.0,@margen) + dbo.fn_solarmanes_precio_articulos_tipo_7(@tarifa,520,@c01) + @monetarios + dbo.fn_solarmanes_precio_articulos_tipo_8(@tarifa,520,@c01)
		set @c27 = @margen2 * (dbo.fn_solarmanes_precio_tejido(540.0,100*@alto,@criterio,@margen,@preciom2,1) + @unitarios + dbo.fn_Tarifa_Lineales(@tarifa,540.0) + dbo.fn_precio_tarifa_montaje(@tarifa,540.0,@preciomontaje,@margen) +  @margen*dbo.fn_solarmanes_peso_tejido_valor(@tarifa,5.40,@c01,@densidad) + @verticales*@alto) + dbo.temp_fn_precio_tarifa_embalaje(@tarifa,540.0,@margen) + dbo.fn_solarmanes_precio_articulos_tipo_7(@tarifa,540,@c01) + @monetarios + dbo.fn_solarmanes_precio_articulos_tipo_8(@tarifa,540,@c01)
		set @c28 = @margen2 * (dbo.fn_solarmanes_precio_tejido(560.0,100*@alto,@criterio,@margen,@preciom2,1) + @unitarios + dbo.fn_Tarifa_Lineales(@tarifa,560.0) + dbo.fn_precio_tarifa_montaje(@tarifa,560.0,@preciomontaje,@margen) +  @margen*dbo.fn_solarmanes_peso_tejido_valor(@tarifa,5.60,@c01,@densidad) + @verticales*@alto) + dbo.temp_fn_precio_tarifa_embalaje(@tarifa,560.0,@margen) + dbo.fn_solarmanes_precio_articulos_tipo_7(@tarifa,560,@c01) + @monetarios + dbo.fn_solarmanes_precio_articulos_tipo_8(@tarifa,560,@c01)
		set @c29 = @margen2 * (dbo.fn_solarmanes_precio_tejido(580.0,100*@alto,@criterio,@margen,@preciom2,1) + @unitarios + dbo.fn_Tarifa_Lineales(@tarifa,580.0) + dbo.fn_precio_tarifa_montaje(@tarifa,580.0,@preciomontaje,@margen) +  @margen*dbo.fn_solarmanes_peso_tejido_valor(@tarifa,5.80,@c01,@densidad) + @verticales*@alto) + dbo.temp_fn_precio_tarifa_embalaje(@tarifa,580.0,@margen) + dbo.fn_solarmanes_precio_articulos_tipo_7(@tarifa,580,@c01) + @monetarios + dbo.fn_solarmanes_precio_articulos_tipo_8(@tarifa,580,@c01)
		set @c30 = @margen2 * (dbo.fn_solarmanes_precio_tejido(600.0,100*@alto,@criterio,@margen,@preciom2,1) + @unitarios + dbo.fn_Tarifa_Lineales(@tarifa,600.0) + dbo.fn_precio_tarifa_montaje(@tarifa,600.0,@preciomontaje,@margen) +  @margen*dbo.fn_solarmanes_peso_tejido_valor(@tarifa,6.00,@c01,@densidad) + @verticales*@alto) + dbo.temp_fn_precio_tarifa_embalaje(@tarifa,600.0,@margen) + dbo.fn_solarmanes_precio_articulos_tipo_7(@tarifa,600,@c01) + @monetarios + dbo.fn_solarmanes_precio_articulos_tipo_8(@tarifa,600,@c01)
		set @c31 = @margen2 * (dbo.fn_solarmanes_precio_tejido(620.0,100*@alto,@criterio,@margen,@preciom2,1) + @unitarios + dbo.fn_Tarifa_Lineales(@tarifa,620.0) + dbo.fn_precio_tarifa_montaje(@tarifa,620.0,@preciomontaje,@margen) +  @margen*dbo.fn_solarmanes_peso_tejido_valor(@tarifa,6.20,@c01,@densidad) + @verticales*@alto) + dbo.temp_fn_precio_tarifa_embalaje(@tarifa,620.0,@margen) + dbo.fn_solarmanes_precio_articulos_tipo_7(@tarifa,620,@c01) + @monetarios + dbo.fn_solarmanes_precio_articulos_tipo_8(@tarifa,620,@c01)
		set @c32 = @margen2 * (dbo.fn_solarmanes_precio_tejido(640.0,100*@alto,@criterio,@margen,@preciom2,1) + @unitarios + dbo.fn_Tarifa_Lineales(@tarifa,640.0) + dbo.fn_precio_tarifa_montaje(@tarifa,640.0,@preciomontaje,@margen) +  @margen*dbo.fn_solarmanes_peso_tejido_valor(@tarifa,6.40,@c01,@densidad) + @verticales*@alto) + dbo.temp_fn_precio_tarifa_embalaje(@tarifa,640.0,@margen) + dbo.fn_solarmanes_precio_articulos_tipo_7(@tarifa,640,@c01) + @monetarios + dbo.fn_solarmanes_precio_articulos_tipo_8(@tarifa,640,@c01)		 
		set @c33 = @margen2 * (dbo.fn_solarmanes_precio_tejido(660.0,100*@alto,@criterio,@margen,@preciom2,1) + @unitarios  + dbo.fn_Tarifa_Lineales(@tarifa,660.0) + dbo.fn_precio_tarifa_montaje(@tarifa,660.0,@preciomontaje,@margen)   +  @margen*dbo.fn_solarmanes_peso_tejido_valor(@tarifa,6.60,@c01,@densidad) + @verticales*@alto) + dbo.temp_fn_precio_tarifa_embalaje(@tarifa,660.0,@margen) + dbo.fn_solarmanes_precio_articulos_tipo_7(@tarifa,660,@c01) + @monetarios + dbo.fn_solarmanes_precio_articulos_tipo_8(@tarifa,660,@c01)
		set @c34 = @margen2 * (dbo.fn_solarmanes_precio_tejido(680.0,100*@alto,@criterio,@margen,@preciom2,1)  + @unitarios + dbo.fn_Tarifa_Lineales(@tarifa,680.0) + dbo.fn_precio_tarifa_montaje(@tarifa,680.0,@preciomontaje,@margen)   +  @margen*dbo.fn_solarmanes_peso_tejido_valor(@tarifa,6.80,@c01,@densidad) + @verticales*@alto) + dbo.temp_fn_precio_tarifa_embalaje(@tarifa,680.0,@margen) + dbo.fn_solarmanes_precio_articulos_tipo_7(@tarifa,680,@c01) + @monetarios + dbo.fn_solarmanes_precio_articulos_tipo_8(@tarifa,680,@c01)
		set @c35 = @margen2 * (dbo.fn_solarmanes_precio_tejido(700.0,100*@alto,@criterio,@margen,@preciom2,1) + @unitarios + dbo.fn_Tarifa_Lineales(@tarifa,700.0) + dbo.fn_precio_tarifa_montaje(@tarifa,700.0,@preciomontaje,@margen) +  @margen*dbo.fn_solarmanes_peso_tejido_valor(@tarifa,7.00,@c01,@densidad) + @verticales*@alto) + dbo.temp_fn_precio_tarifa_embalaje(@tarifa,700.0,@margen) + dbo.fn_solarmanes_precio_articulos_tipo_7(@tarifa,700,@c01) + @monetarios + dbo.fn_solarmanes_precio_articulos_tipo_8(@tarifa,700,@c01)
		set @c36 = @margen2 * (dbo.fn_solarmanes_precio_tejido(720.0,100*@alto,@criterio,@margen,@preciom2,1) + @unitarios + dbo.fn_Tarifa_Lineales(@tarifa,720.0) + dbo.fn_precio_tarifa_montaje(@tarifa,720.0,@preciomontaje,@margen) +  @margen*dbo.fn_solarmanes_peso_tejido_valor(@tarifa,7.20,@c01,@densidad) + @verticales*@alto) + dbo.temp_fn_precio_tarifa_embalaje(@tarifa,720.0,@margen) + dbo.fn_solarmanes_precio_articulos_tipo_7(@tarifa,720,@c01) + @monetarios + dbo.fn_solarmanes_precio_articulos_tipo_8(@tarifa,720,@c01)
		set @c37 = @margen2 * (dbo.fn_solarmanes_precio_tejido(740.0,100*@alto,@criterio,@margen,@preciom2,1) + @unitarios + dbo.fn_Tarifa_Lineales(@tarifa,740.0) + dbo.fn_precio_tarifa_montaje(@tarifa,740.0,@preciomontaje,@margen) +  @margen*dbo.fn_solarmanes_peso_tejido_valor(@tarifa,7.40,@c01,@densidad) + @verticales*@alto) + dbo.temp_fn_precio_tarifa_embalaje(@tarifa,740.0,@margen) + dbo.fn_solarmanes_precio_articulos_tipo_7(@tarifa,740,@c01) + @monetarios + dbo.fn_solarmanes_precio_articulos_tipo_8(@tarifa,740,@c01)
		set @c38 = @margen2 * (dbo.fn_solarmanes_precio_tejido(760.0,100*@alto,@criterio,@margen,@preciom2,1) + @unitarios + dbo.fn_Tarifa_Lineales(@tarifa,760.0) + dbo.fn_precio_tarifa_montaje(@tarifa,760.0,@preciomontaje,@margen) +  @margen*dbo.fn_solarmanes_peso_tejido_valor(@tarifa,7.60,@c01,@densidad) + @verticales*@alto) + dbo.temp_fn_precio_tarifa_embalaje(@tarifa,760.0,@margen) + dbo.fn_solarmanes_precio_articulos_tipo_7(@tarifa,760,@c01) + @monetarios + dbo.fn_solarmanes_precio_articulos_tipo_8(@tarifa,760,@c01)
		set @c39 = @margen2 * (dbo.fn_solarmanes_precio_tejido(780.0,100*@alto,@criterio,@margen,@preciom2,1) + @unitarios + dbo.fn_Tarifa_Lineales(@tarifa,780.0) + dbo.fn_precio_tarifa_montaje(@tarifa,780.0,@preciomontaje,@margen) +  @margen*dbo.fn_solarmanes_peso_tejido_valor(@tarifa,7.80,@c01,@densidad) + @verticales*@alto) + dbo.temp_fn_precio_tarifa_embalaje(@tarifa,780.0,@margen) + dbo.fn_solarmanes_precio_articulos_tipo_7(@tarifa,780,@c01) + @monetarios + dbo.fn_solarmanes_precio_articulos_tipo_8(@tarifa,780,@c01)
		set @c40 = @margen2 * (dbo.fn_solarmanes_precio_tejido(800.0,100*@alto,@criterio,@margen,@preciom2,1) + @unitarios + dbo.fn_Tarifa_Lineales(@tarifa,800.0) + dbo.fn_precio_tarifa_montaje(@tarifa,800.0,@preciomontaje,@margen) +  @margen*dbo.fn_solarmanes_peso_tejido_valor(@tarifa,8.00,@c01,@densidad) + @verticales*@alto) + dbo.temp_fn_precio_tarifa_embalaje(@tarifa,800.0,@margen) + dbo.fn_solarmanes_precio_articulos_tipo_7(@tarifa,800,@c01) + @monetarios + dbo.fn_solarmanes_precio_articulos_tipo_8(@tarifa,800,@c01)
		set @c41 = @margen2 * (dbo.fn_solarmanes_precio_tejido(820.0,100*@alto,@criterio,@margen,@preciom2,1) + @unitarios + dbo.fn_Tarifa_Lineales(@tarifa,820.0) + dbo.fn_precio_tarifa_montaje(@tarifa,820.0,@preciomontaje,@margen) +  @margen*dbo.fn_solarmanes_peso_tejido_valor(@tarifa,8.20,@c01,@densidad) + @verticales*@alto) + dbo.temp_fn_precio_tarifa_embalaje(@tarifa,820.0,@margen) + dbo.fn_solarmanes_precio_articulos_tipo_7(@tarifa,820,@c01) + @monetarios + dbo.fn_solarmanes_precio_articulos_tipo_8(@tarifa,820,@c01)
		set @c42 = @margen2 * (dbo.fn_solarmanes_precio_tejido(840.0,100*@alto,@criterio,@margen,@preciom2,1) + @unitarios + dbo.fn_Tarifa_Lineales(@tarifa,840.0) + dbo.fn_precio_tarifa_montaje(@tarifa,840.0,@preciomontaje,@margen) +  @margen*dbo.fn_solarmanes_peso_tejido_valor(@tarifa,8.40,@c01,@densidad) + @verticales*@alto) + dbo.temp_fn_precio_tarifa_embalaje(@tarifa,840.0,@margen) + dbo.fn_solarmanes_precio_articulos_tipo_7(@tarifa,840,@c01) + @monetarios + dbo.fn_solarmanes_precio_articulos_tipo_8(@tarifa,840,@c01)
		set @c43 = @margen2 * (dbo.fn_solarmanes_precio_tejido(860.0,100*@alto,@criterio,@margen,@preciom2,1) + @unitarios + dbo.fn_Tarifa_Lineales(@tarifa,860.0) + dbo.fn_precio_tarifa_montaje(@tarifa,860.0,@preciomontaje,@margen) +  @margen*dbo.fn_solarmanes_peso_tejido_valor(@tarifa,8.60,@c01,@densidad) + @verticales*@alto) + dbo.temp_fn_precio_tarifa_embalaje(@tarifa,860.0,@margen) + dbo.fn_solarmanes_precio_articulos_tipo_7(@tarifa,860,@c01) + @monetarios + dbo.fn_solarmanes_precio_articulos_tipo_8(@tarifa,860,@c01)
		set @c44 = @margen2 * (dbo.fn_solarmanes_precio_tejido(880.0,100*@alto,@criterio,@margen,@preciom2,1) + @unitarios + dbo.fn_Tarifa_Lineales(@tarifa,880.0) + dbo.fn_precio_tarifa_montaje(@tarifa,880.0,@preciomontaje,@margen) +  @margen*dbo.fn_solarmanes_peso_tejido_valor(@tarifa,8.80,@c01,@densidad) + @verticales*@alto) + dbo.temp_fn_precio_tarifa_embalaje(@tarifa,880.0,@margen) + dbo.fn_solarmanes_precio_articulos_tipo_7(@tarifa,880,@c01) + @monetarios + dbo.fn_solarmanes_precio_articulos_tipo_8(@tarifa,880,@c01)
		set @c45 = @margen2 * (dbo.fn_solarmanes_precio_tejido(900.0,100*@alto,@criterio,@margen,@preciom2,1) + @unitarios + dbo.fn_Tarifa_Lineales(@tarifa,900.0) + dbo.fn_precio_tarifa_montaje(@tarifa,900.0,@preciomontaje,@margen) +  @margen*dbo.fn_solarmanes_peso_tejido_valor(@tarifa,9.00,@c01,@densidad) + @verticales*@alto) + dbo.temp_fn_precio_tarifa_embalaje(@tarifa,900.0,@margen) + dbo.fn_solarmanes_precio_articulos_tipo_7(@tarifa,900,@c01) + @monetarios + dbo.fn_solarmanes_precio_articulos_tipo_8(@tarifa,900,@c01)
		set @c46 = @margen2 * (dbo.fn_solarmanes_precio_tejido(920.0,100*@alto,@criterio,@margen,@preciom2,1) + @unitarios + dbo.fn_Tarifa_Lineales(@tarifa,920.0) + dbo.fn_precio_tarifa_montaje(@tarifa,920.0,@preciomontaje,@margen) +  @margen*dbo.fn_solarmanes_peso_tejido_valor(@tarifa,9.20,@c01,@densidad) + @verticales*@alto) + dbo.temp_fn_precio_tarifa_embalaje(@tarifa,920.0,@margen) + dbo.fn_solarmanes_precio_articulos_tipo_7(@tarifa,920,@c01) + @monetarios + dbo.fn_solarmanes_precio_articulos_tipo_8(@tarifa,920,@c01)
		set @c47 = @margen2 * (dbo.fn_solarmanes_precio_tejido(940.0,100*@alto,@criterio,@margen,@preciom2,1) + @unitarios + dbo.fn_Tarifa_Lineales(@tarifa,940.0) + dbo.fn_precio_tarifa_montaje(@tarifa,940.0,@preciomontaje,@margen) +  @margen*dbo.fn_solarmanes_peso_tejido_valor(@tarifa,9.40,@c01,@densidad) + @verticales*@alto) + dbo.temp_fn_precio_tarifa_embalaje(@tarifa,940.0,@margen) + dbo.fn_solarmanes_precio_articulos_tipo_7(@tarifa,940,@c01) + @monetarios + dbo.fn_solarmanes_precio_articulos_tipo_8(@tarifa,940,@c01)
		set @c48 = @margen2 * (dbo.fn_solarmanes_precio_tejido(960.0,100*@alto,@criterio,@margen,@preciom2,1) + @unitarios + dbo.fn_Tarifa_Lineales(@tarifa,960.0) + dbo.fn_precio_tarifa_montaje(@tarifa,960.0,@preciomontaje,@margen) +  @margen*dbo.fn_solarmanes_peso_tejido_valor(@tarifa,9.60,@c01,@densidad) + @verticales*@alto) + dbo.temp_fn_precio_tarifa_embalaje(@tarifa,960.0,@margen) + dbo.fn_solarmanes_precio_articulos_tipo_7(@tarifa,960,@c01) + @monetarios + dbo.fn_solarmanes_precio_articulos_tipo_8(@tarifa,960,@c01)
		set @c49 = @margen2 * (dbo.fn_solarmanes_precio_tejido(980.0,100*@alto,@criterio,@margen,@preciom2,1) + @unitarios + dbo.fn_Tarifa_Lineales(@tarifa,980.0) + dbo.fn_precio_tarifa_montaje(@tarifa,980.0,@preciomontaje,@margen) +  @margen*dbo.fn_solarmanes_peso_tejido_valor(@tarifa,9.80,@c01,@densidad) + @verticales*@alto) + dbo.temp_fn_precio_tarifa_embalaje(@tarifa,980.0,@margen) + dbo.fn_solarmanes_precio_articulos_tipo_7(@tarifa,980,@c01) + @monetarios + dbo.fn_solarmanes_precio_articulos_tipo_8(@tarifa,980,@c01)
		set @c50 = @margen2 * (dbo.fn_solarmanes_precio_tejido(1000.0,100*@alto,@criterio,@margen,@preciom2,1) + @unitarios + dbo.fn_Tarifa_Lineales(@tarifa,1000.0) + dbo.fn_precio_tarifa_montaje(@tarifa,1000.0,@preciomontaje,@margen) +  @margen*dbo.fn_solarmanes_peso_tejido_valor(@tarifa,10.00,@c01,@densidad) + @verticales*@alto) + dbo.temp_fn_precio_tarifa_embalaje(@tarifa,1000.0,@margen) + dbo.fn_solarmanes_precio_articulos_tipo_7(@tarifa,1000,@c01) + @monetarios + dbo.fn_solarmanes_precio_articulos_tipo_8(@tarifa,1000,@c01)
		set @c51 = @margen2 * (dbo.fn_solarmanes_precio_tejido(1020.0,100*@alto,@criterio,@margen,@preciom2,1) + @unitarios + dbo.fn_Tarifa_Lineales(@tarifa,1020.0) + dbo.fn_precio_tarifa_montaje(@tarifa,1020.0,@preciomontaje,@margen) +  @margen*dbo.fn_solarmanes_peso_tejido_valor(@tarifa,10.20,@c01,@densidad) + @verticales*@alto) + dbo.temp_fn_precio_tarifa_embalaje(@tarifa,1020.0,@margen) + dbo.fn_solarmanes_precio_articulos_tipo_7(@tarifa,1020,@c01) + @monetarios + dbo.fn_solarmanes_precio_articulos_tipo_8(@tarifa,1020,@c01)
		set @c52 = @margen2 * (dbo.fn_solarmanes_precio_tejido(1040.0,100*@alto,@criterio,@margen,@preciom2,1) + @unitarios + dbo.fn_Tarifa_Lineales(@tarifa,1040.0) + dbo.fn_precio_tarifa_montaje(@tarifa,1040.0,@preciomontaje,@margen) +  @margen*dbo.fn_solarmanes_peso_tejido_valor(@tarifa,10.40,@c01,@densidad) + @verticales*@alto) + dbo.temp_fn_precio_tarifa_embalaje(@tarifa,1040.0,@margen) + dbo.fn_solarmanes_precio_articulos_tipo_7(@tarifa,1040,@c01) + @monetarios + dbo.fn_solarmanes_precio_articulos_tipo_8(@tarifa,1040,@c01)
		set @c53 = @margen2 * (dbo.fn_solarmanes_precio_tejido(1060.0,100*@alto,@criterio,@margen,@preciom2,1) + @unitarios + dbo.fn_Tarifa_Lineales(@tarifa,1060.0) + dbo.fn_precio_tarifa_montaje(@tarifa,1060.0,@preciomontaje,@margen) +  @margen*dbo.fn_solarmanes_peso_tejido_valor(@tarifa,10.60,@c01,@densidad) + @verticales*@alto) + dbo.temp_fn_precio_tarifa_embalaje(@tarifa,1060.0,@margen) + dbo.fn_solarmanes_precio_articulos_tipo_7(@tarifa,1060,@c01) + @monetarios + dbo.fn_solarmanes_precio_articulos_tipo_8(@tarifa,1060,@c01)
		set @c54 = @margen2 * (dbo.fn_solarmanes_precio_tejido(1080.0,100*@alto,@criterio,@margen,@preciom2,1) + @unitarios + dbo.fn_Tarifa_Lineales(@tarifa,1080.0) + dbo.fn_precio_tarifa_montaje(@tarifa,1080.0,@preciomontaje,@margen) +  @margen*dbo.fn_solarmanes_peso_tejido_valor(@tarifa,10.80,@c01,@densidad) + @verticales*@alto) + dbo.temp_fn_precio_tarifa_embalaje(@tarifa,1080.0,@margen) + dbo.fn_solarmanes_precio_articulos_tipo_7(@tarifa,1080,@c01) + @monetarios + dbo.fn_solarmanes_precio_articulos_tipo_8(@tarifa,1080,@c01)
		set @c55 = @margen2 * (dbo.fn_solarmanes_precio_tejido(1100.0,100*@alto,@criterio,@margen,@preciom2,1) + @unitarios + dbo.fn_Tarifa_Lineales(@tarifa,1100.0) + dbo.fn_precio_tarifa_montaje(@tarifa,1100.0,@preciomontaje,@margen) +  @margen*dbo.fn_solarmanes_peso_tejido_valor(@tarifa,11.00,@c01,@densidad) + @verticales*@alto) + dbo.temp_fn_precio_tarifa_embalaje(@tarifa,1100.0,@margen) + dbo.fn_solarmanes_precio_articulos_tipo_7(@tarifa,1100,@c01) + @monetarios + dbo.fn_solarmanes_precio_articulos_tipo_8(@tarifa,1100,@c01)
		set @c56 = @margen2 * (dbo.fn_solarmanes_precio_tejido(1120.0,100*@alto,@criterio,@margen,@preciom2,1) + @unitarios + dbo.fn_Tarifa_Lineales(@tarifa,1120.0) + dbo.fn_precio_tarifa_montaje(@tarifa,1120.0,@preciomontaje,@margen) +  @margen*dbo.fn_solarmanes_peso_tejido_valor(@tarifa,11.20,@c01,@densidad) + @verticales*@alto) + dbo.temp_fn_precio_tarifa_embalaje(@tarifa,1120.0,@margen) + dbo.fn_solarmanes_precio_articulos_tipo_7(@tarifa,1120,@c01) + @monetarios + dbo.fn_solarmanes_precio_articulos_tipo_8(@tarifa,1120,@c01)
		set @c57 = @margen2 * (dbo.fn_solarmanes_precio_tejido(1140.0,100*@alto,@criterio,@margen,@preciom2,1) + @unitarios + dbo.fn_Tarifa_Lineales(@tarifa,1140.0) + dbo.fn_precio_tarifa_montaje(@tarifa,1140.0,@preciomontaje,@margen) +  @margen*dbo.fn_solarmanes_peso_tejido_valor(@tarifa,11.40,@c01,@densidad) + @verticales*@alto) + dbo.temp_fn_precio_tarifa_embalaje(@tarifa,1140.0,@margen) + dbo.fn_solarmanes_precio_articulos_tipo_7(@tarifa,1140,@c01) + @monetarios + dbo.fn_solarmanes_precio_articulos_tipo_8(@tarifa,1140,@c01)
		set @c58 = @margen2 * (dbo.fn_solarmanes_precio_tejido(1160.0,100*@alto,@criterio,@margen,@preciom2,1) + @unitarios + dbo.fn_Tarifa_Lineales(@tarifa,1160.0) + dbo.fn_precio_tarifa_montaje(@tarifa,1160.0,@preciomontaje,@margen) +  @margen*dbo.fn_solarmanes_peso_tejido_valor(@tarifa,11.60,@c01,@densidad) + @verticales*@alto) + dbo.temp_fn_precio_tarifa_embalaje(@tarifa,1160.0,@margen) + dbo.fn_solarmanes_precio_articulos_tipo_7(@tarifa,1160,@c01) + @monetarios + dbo.fn_solarmanes_precio_articulos_tipo_8(@tarifa,1160,@c01)
		set @c59 = @margen2 * (dbo.fn_solarmanes_precio_tejido(1180.0,100*@alto,@criterio,@margen,@preciom2,1) + @unitarios + dbo.fn_Tarifa_Lineales(@tarifa,1180.0) + dbo.fn_precio_tarifa_montaje(@tarifa,1180.0,@preciomontaje,@margen) +  @margen*dbo.fn_solarmanes_peso_tejido_valor(@tarifa,11.80,@c01,@densidad) + @verticales*@alto) + dbo.temp_fn_precio_tarifa_embalaje(@tarifa,1180.0,@margen) + dbo.fn_solarmanes_precio_articulos_tipo_7(@tarifa,1180,@c01) + @monetarios + dbo.fn_solarmanes_precio_articulos_tipo_8(@tarifa,1180,@c01)
		set @c60 = @margen2 * (dbo.fn_solarmanes_precio_tejido(1200.0,100*@alto,@criterio,@margen,@preciom2,1) + @unitarios + dbo.fn_Tarifa_Lineales(@tarifa,1200.0) + dbo.fn_precio_tarifa_montaje(@tarifa,1200.0,@preciomontaje,@margen) +  @margen*dbo.fn_solarmanes_peso_tejido_valor(@tarifa,12.00,@c01,@densidad) + @verticales*@alto) + dbo.temp_fn_precio_tarifa_embalaje(@tarifa,1200.0,@margen) + dbo.fn_solarmanes_precio_articulos_tipo_7(@tarifa,1200,@c01) + @monetarios + dbo.fn_solarmanes_precio_articulos_tipo_8(@tarifa,1200,@c01)
		end

			insert into @table (c00,c01,c02,c03,c04,c05,c06,c07,c08,c09,c10,c11,c12,c13,c14,c15,c16,c17,c18,c19,c20,c21,c22,c23,c24,c25,c26,c27,c28,c29,c30,c31,c32,c33,c34,c35,c36,c37,c38,c39,c40,c41,c42,c43,c44,c45,c46,c47,c48,c49,c50,c51,c52,c53,c54,c55,c56,c57,c58,c59,c60)
			values(@c00,@c01,@c02,@c03,@c04,@c05,@c06,@c07,@c08,@c09,@c10,@c11,@c12,@c13,@c14,@c15,@c16,@c17,@c18,@c19,@c20,@c21,@c22,@c23,@c24,@c25,@c26,@c27,@c28,@c29,@c30,@c31,@c32,@c33,@c34,@c35,@c36,@c37,@c38,@c39,@c40,@c41,@c42,@c43,@c44,@c45,@c46,@c47,@c48,@c49,@c50,@c51,@c52,@c53,@c54,@c55,@c56,@c57,@c58,@c59,@c60)
		
		set @py += 1
	end

	if @dest = 0
	begin
		delete from SOL_TARIFAS_SIMULATE_TABLE where idrow=@tarifa

			insert into SOL_TARIFAS_SIMULATE_TABLE(idrow,c00 ,c01 ,c02 ,c03 ,c04 ,c05 ,c06 ,c07 ,c08 ,c09 ,c10 ,c11 ,c12 ,c13 ,c14 ,c15 ,c16 ,c17 ,c18 ,c19 ,c20 ,c21 ,c22 ,c23 ,c24 ,c25 ,c26 ,c27 ,c28 ,c29 ,c30 ,c31 ,c32,c33,c34,c35,c36,c37,c38,c39,c40,c41,c42,c43,c44,c45,c46,c47,c48,c49,c50,c51,c52,c53,c54,c55,c56,c57,c58,c59,c60 )
			select @tarifa,c00 ,c01 ,c02 ,c03 ,c04 ,c05 ,c06 ,c07 ,c08 ,c09 ,c10 ,c11 ,c12 ,c13 ,c14 ,c15 ,c16 ,c17 ,c18 ,c19 ,c20 ,c21 ,c22 ,c23 ,c24 ,c25 ,c26 ,c27 ,c28 ,c29 ,c30 ,c31 ,c32,c33,c34,c35,c36,c37,c38,c39,c40,c41,c42,c43,c44,c45,c46,c47,c48,c49,c50,c51,c52,c53,c54,c55,c56,c57,c58,c59,c60 from @table

			select idrow,c00 ,c01 ,c02 ,c03 ,c04 ,c05 ,c06 ,c07 ,c08 ,c09 ,c10 ,c11 ,c12 ,c13 ,c14 ,c15 ,c16 ,c17 ,c18 ,c19 ,c20 ,c21 ,c22 ,c23 ,c24 ,c25 ,c26 ,c27 ,c28 ,c29 ,c30 ,c31 ,c32,c33,c34,c35,c36,c37,c38,c39,c40,c41,c42,c43,c44,c45,c46,c47,c48,c49,c50,c51,c52,c53,c54,c55,c56,c57,c58,c59,c60 from SOL_TARIFAS_SIMULATE_TABLE where idrow=@tarifa

	end
	
	if @dest = 1
	begin
			insert into SOL_TARIFAS_SIMULATE_TABLE_EXPORT(idrow,c00 ,c01 ,c02 ,c03 ,c04 ,c05 ,c06 ,c07 ,c08 ,c09 ,c10 ,c11 ,c12 ,c13 ,c14 ,c15 ,c16 ,c17 ,c18 ,c19 ,c20 ,c21 ,c22 ,c23 ,c24 ,c25 ,c26 ,c27 ,c28 ,c29 ,c30 ,c31 ,c32,c33,c34,c35,c36,c37,c38,c39,c40,c41,c42,c43,c44,c45,c46,c47,c48,c49,c50,c51,c52,c53,c54,c55,c56,c57,c58,c59,c60 )
			select @tarifa,c00 ,c01 ,c02 ,c03 ,c04 ,c05 ,c06 ,c07 ,c08 ,c09 ,c10 ,c11 ,c12 ,c13 ,c14 ,c15 ,c16 ,c17 ,c18 ,c19 ,c20 ,c21 ,c22 ,c23 ,c24 ,c25 ,c26 ,c27 ,c28 ,c29 ,c30 ,c31 ,c32,c33,c34,c35,c36,c37,c38,c39,c40,c41,c42,c43,c44,c45,c46,c47,c48,c49,c50,c51,c52,c53,c54,c55,c56,c57,c58,c59,c60 from @table 
			where c00>=@miny and c00<=@maxy
		
	end

	if @dest = 2
	begin
			insert into SOL_TARIFAS_SIMULATE_TABLE_EXPORT_C1(idrow,c00 ,c01 ,c02 ,c03 ,c04 ,c05 ,c06 ,c07 ,c08 ,c09 ,c10 ,c11 ,c12 ,c13 ,c14 ,c15 ,c16 ,c17 ,c18 ,c19 ,c20 ,c21 ,c22 ,c23 ,c24 ,c25 ,c26 ,c27 ,c28 ,c29 ,c30 ,c31 ,c32,c33,c34,c35,c36,c37,c38,c39,c40,c41,c42,c43,c44,c45,c46,c47,c48,c49,c50,c51,c52,c53,c54,c55,c56,c57,c58,c59,c60 )
			select @tarifa,c00 ,c01 ,c02 ,c03 ,c04 ,c05 ,c06 ,c07 ,c08 ,c09 ,c10 ,c11 ,c12 ,c13 ,c14 ,c15 ,c16 ,c17 ,c18 ,c19 ,c20 ,c21 ,c22 ,c23 ,c24 ,c25 ,c26 ,c27 ,c28 ,c29 ,c30 ,c31 ,c32,c33,c34,c35,c36,c37,c38,c39,c40,c41,c42,c43,c44,c45,c46,c47,c48,c49,c50,c51,c52,c53,c54,c55,c56,c57,c58,c59,c60 from @table 
			where c00>=@miny and c00<=@maxy
	end

	if @dest = 3
	begin
		delete from SOL_TARIFAS_SIMULATE_CLIENTE_TABLE where idrow=@id
			insert into SOL_TARIFAS_SIMULATE_CLIENTE_TABLE(idrow,c00 ,c01 ,c02 ,c03 ,c04 ,c05 ,c06 ,c07 ,c08 ,c09 ,c10 ,c11 ,c12 ,c13 ,c14 ,c15 ,c16 ,c17 ,c18 ,c19 ,c20 ,c21 ,c22 ,c23 ,c24 ,c25 ,c26 ,c27 ,c28 ,c29 ,c30 ,c31 ,c32,c33,c34,c35,c36,c37,c38,c39,c40,c41,c42,c43,c44,c45,c46,c47,c48,c49,c50,c51,c52,c53,c54,c55,c56,c57,c58,c59,c60 )
			select @id,c00 ,c01 ,c02 ,c03 ,c04 ,c05 ,c06 ,c07 ,c08 ,c09 ,c10 ,c11 ,c12 ,c13 ,c14 ,c15 ,c16 ,c17 ,c18 ,c19 ,c20 ,c21 ,c22 ,c23 ,c24 ,c25 ,c26 ,c27 ,c28 ,c29 ,c30 ,c31 ,c32,c33,c34,c35,c36,c37,c38,c39,c40,c41,c42,c43,c44,c45,c46,c47,c48,c49,c50,c51,c52,c53,c54,c55,c56,c57,c58,c59,c60 from @table
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

go
