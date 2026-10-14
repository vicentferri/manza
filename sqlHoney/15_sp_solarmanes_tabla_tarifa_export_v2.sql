/* =====================================================================
   15 - sp_solarmanes_tabla_tarifa_export_v2 (rama honeyComb_tarifas)
   Tipo de exportación 8 (HONEYCOMB): la cabecera de anchos llega solo hasta
   1,40; las columnas siguientes salen vacías (el mapa del tipo de producto 7
   las deja a NULL) y el resultado devuelve c00-c07, como cada tipo devuelve
   solo sus columnas. Resto de tipos sin cambios.
   Requiere 10 (SOL_TARIFAS_EXPORTACION idrow 8). Copia anterior en backup/.
   ===================================================================== */
set ansi_nulls on
go
set quoted_identifier on
go

	alter procedure [dbo].[sp_solarmanes_tabla_tarifa_export_v2]
	(
	    @tipo int,
		@tarifas varchar(8000) = '1019',
		@mapa int = 1,
		@dtocomercial decimal(12,2) = -0.10,
		@margencliente decimal(12,2) = 1.9

	)
	as
	begin

	set nocount on

	declare @idrow int
	declare @name varchar(255)
	


	delete from SOL_TARIFAS_SIMULATE_TABLE_EXPORT_C1		/* C1 */
	delete from SOL_TARIFAS_SIMULATE_TABLE_EXPORT_V2    /* MARGEN CLIENTE */ 

	declare itTarifas cursor forward_only for
	select idrow from SOL_TARIFAS_SIMULATE where idrow in (select data from dbo.string_to_table(@tarifas,','))
	open itTarifas
	fetch next from itTarifas into @idrow
	while @@fetch_status = 0
	begin
		select top 1 @name = nombre from SOL_TARIFAS_SIMULATE where idrow=@idrow

		if @tipo <> 7
		begin

			insert into SOL_TARIFAS_SIMULATE_TABLE_EXPORT_C1(idrow,c00 ,c01 ,c02 ,c03 ,c04 ,c05 ,c06 ,c07 ,c08 ,c09 ,c10 ,c11 ,c12 ,c13 ,c14 ,c15 ,c16 ,c17 ,c18 ,c19 ,c20 ,c21 ,c22 ,c23 ,c24 ,c25 ,c26 ,c27 ,c28 ,c29 ,c30 ,c31 ,c32,c33,
			c34,c35,c36,c37,c38,c39,c40,c41,c42,c43,c44,c45,c46,c47,c48,c49,c50,c51,c52,c53,c54,c55,c56,c57,c58,c59,c60)
			values(@idrow,'' ,'' ,'' ,'' ,'' ,'' ,'' ,'' ,'' ,'' ,'' ,'' ,'' ,'' ,'' ,'' ,'' ,'' ,'' ,'' ,'' ,'' ,'' ,'' ,'','' ,'' ,'' ,'' ,'' ,'' ,'','','',
			'','','','','','','','','','','','','','','','','','','','','','','','','','','')

			insert into SOL_TARIFAS_SIMULATE_TABLE_EXPORT_C1(idrow,c00 ,c01 ,c02 ,c03 ,c04 ,c05 ,c06 ,c07 ,c08 ,c09 ,c10 ,c11 ,c12 ,c13 ,c14 ,c15 ,c16 ,c17 ,c18 ,c19 ,c20 ,c21 ,c22 ,c23 ,c24 ,c25 ,c26 ,c27 ,c28 ,c29 ,c30 ,c31 ,c32,c33 )
			values(@idrow,'' ,'' ,substring(@name,1,4) ,substring(@name,5,4) ,substring(@name,9,4) ,substring(@name,13,4) ,substring(@name,17,4) ,substring(@name,21,4) ,
			substring(@name,25,4) ,substring(@name,29,4) ,substring(@name,33,4) ,substring(@name,37,4) ,substring(@name,41,4) ,substring(@name,45,4) ,substring(@name,49,4) ,
			substring(@name,53,4) ,substring(@name,57,4) ,substring(@name,61,4) ,substring(@name,65,4) ,substring(@name,69,4) ,
			substring(@name,73,4) ,substring(@name,77,4) ,substring(@name,81,4) ,substring(@name,85,4) ,substring(@name,89,4),
			substring(@name,93,4) ,substring(@name,97,4) ,substring(@name,101,4) ,substring(@name,105,4) ,substring(@name,109,4) ,
			substring(@name,113,4) ,substring(@name,117,4),substring(@name,121,4),substring(@name,125,4))

			if @tipo = 8	/* HONEYCOMB: anchos 0,40-1,40 */
			insert into SOL_TARIFAS_SIMULATE_TABLE_EXPORT_C1(idrow,c00 ,c01 ,c02 ,c03 ,c04 ,c05 ,c06 ,c07 )
			values(@idrow,'' ,'','0,40' ,'0,60' ,'0,80' ,'1,00' ,'1,20' ,'1,40')
			else
			insert into SOL_TARIFAS_SIMULATE_TABLE_EXPORT_C1(idrow,c00 ,c01 ,c02 ,c03 ,c04 ,c05 ,c06 ,c07 ,c08 ,c09 ,c10 ,c11 ,c12 ,c13 ,c14 ,c15 ,c16 ,c17 ,c18 ,c19 ,c20 ,c21 ,c22 ,c23 ,c24 ,c25 ,c26 ,c27 ,c28 ,c29 ,c30 ,c31 ,c32,c33 )
			values(@idrow,'' ,'','0,40' ,'0,60' ,'0,80' ,'1,00' ,'1,20' ,'1,40' ,'1,60' ,'1,80' ,'2,00' ,'2,20' ,'2,40' ,'2,60' ,'2,80' ,'3,00' ,'3,20' ,'3,40' ,'3,60' ,'3,80' ,'4,00' ,'4,20' ,'4,40' ,'4,60' ,'4,80' ,'5,00','5,20' ,'5,40' ,'5,60' ,'5,80' ,'6,00' ,'6,20' ,'6,40', '6.60')

		
		execute sp_solarmanes_precio_tejido_tabla_tarifa @idrow,10,2,@tipo
		end
		else
		begin
			insert into SOL_TARIFAS_SIMULATE_TABLE_EXPORT_C1(idrow,c00,c01,c02,c03,c04,c05,c06,c07,c08,c09,c10,c11,c12,c13,c14,c15,c16,c17,c18,c19,c20,c21,c22,c23,c24,c25,c26,c27,c28,c29,c30,c31,c32,c33,c34,c35,c36,c37,c38,c39,c40,c41,c42,c43,c44,c45,c46,c47,c48,c49,c50,c52,c53,c54,c55,c56,c57,c58,c59,c60)
			values(@idrow,'','','','','','','','','','','','','','','','','','','','','','','','','','','','','','','','','','','','','','','','','','','','','','','','','','','','','','','','','','','','')

			insert into SOL_TARIFAS_SIMULATE_TABLE_EXPORT_C1(idrow,c00 ,c01 ,c02 ,c03 ,c04 ,c05 ,c06 ,c07 ,c08 ,c09 ,c10 ,c11 ,c12 ,c13 ,c14 ,c15 ,c16 ,c17 ,c18 ,c19 ,c20 ,c21 ,c22 ,c23 ,c24 ,c25 ,c26 ,c27 ,c28 ,c29 ,c30 ,c31 ,c32, c33 )
			values(@idrow,'' ,'' ,substring(@name,1,4) ,substring(@name,5,4) ,substring(@name,9,4) ,substring(@name,13,4) ,substring(@name,17,4) ,substring(@name,21,4) ,
			substring(@name,25,4) ,substring(@name,29,4) ,substring(@name,33,4) ,substring(@name,37,4) ,'' ,'' ,'' ,'' ,'' ,'' ,'' ,'' ,'' ,'' ,'' ,'' ,'','' ,'' ,'' ,'' ,'' ,'' ,'','','')

			insert into SOL_TARIFAS_SIMULATE_TABLE_EXPORT_C1(idrow,c00 ,c01 ,c02 ,c03 ,c04 ,c05 ,c06 ,c07 ,c08 ,c09 ,c10 ,c11 ,c12 ,c13 ,c14 ,c15 ,c16 ,c17 ,c18 ,c19 ,c20 ,c21 ,c22 ,c23 ,c24 ,c25 ,c26 ,c27 ,c28 ,c29 ,c30 ,c31 ,c32,c33,c34,c35,c36,c37,c38,c39,c40,c41,c42,c43,c44,c45,c46,c47,c48,c49,c50,c52,c53,c54,c55,c56,c57,c58,c59,c60 )
			values(@idrow,'' ,'','0,40' ,'0,60' ,'0,80' ,'1,00' ,'1,20' ,'1,40' ,'1,60' ,'1,80' ,'2,00' ,'2,20' ,'2,40' ,'2,60' ,'2,80' ,'3,00' ,'3,20' ,'3,40' ,'3,60' ,'3,80' ,'4,00' ,'4,20' ,'4,40' ,'4,60' ,'4,80' ,'5,00','5,20' ,'5,40' ,'5,60' ,'5,80' ,'6,00' ,'6,20' ,'6,40','6,60','6.80','7.00','7.20','7.40','7.60','7.80','8.00',
			'8.20','8.40','8.60','8.80','9.00','9.20','9.40','9.60','9.80','10.00','10.20','10.40','10.60','10.80','11.00','11.20','11.40','11.60','11.80')

		
			execute sp_solarmanes_precio_tejido_tabla_tarifa_lineablanca @idrow,10,2,@tipo

		end

		

	fetch next from itTarifas into @idrow
	end
	close itTarifas
	deallocate itTarifas

	

	/* 0.- COPIA */
	insert into SOL_TARIFAS_SIMULATE_TABLE_EXPORT_V2
	select * from SOL_TARIFAS_SIMULATE_TABLE_EXPORT_C1  order by idrow

	set @dtocomercial = (1-@dtocomercial)



	/* 1.- APLICO EL C1 */
	--update SOL_TARIFAS_SIMULATE_TABLE_EXPORT_V2 set
	--pos = 2,
	--c02 = cast(@dtocomercial*isnull(c02,0) as decimal(12,2)),
	--c03 = cast(@dtocomercial*isnull(c03,0) as decimal(12,2)),
	--c04 = cast(@dtocomercial*isnull(c04,0) as decimal(12,2)),
	--c05 = cast(@dtocomercial*isnull(c05,0) as decimal(12,2)),
	--c06 = cast(@dtocomercial*isnull(c06,0) as decimal(12,2)),
	--c07 = cast(@dtocomercial*isnull(c07,0) as decimal(12,2)),
	--c08 = cast(@dtocomercial*isnull(c08,0) as decimal(12,2)),
	--c09 = cast(@dtocomercial*isnull(c09,0) as decimal(12,2)),
	--c10 = cast(@dtocomercial*isnull(c10,0) as decimal(12,2)),
	--c11 = cast(@dtocomercial*isnull(c11,0) as decimal(12,2)),
	--c12 = cast(@dtocomercial*isnull(c12,0) as decimal(12,2)),
	--c13 = cast(@dtocomercial*isnull(c13,0) as decimal(12,2)),
	--c14 = cast(@dtocomercial*isnull(c14,0) as decimal(12,2)),
	--c15 = cast(@dtocomercial*isnull(c15,0) as decimal(12,2)),
	--c16 = cast(@dtocomercial*isnull(c16,0) as decimal(12,2)),
	--c17 = cast(@dtocomercial*isnull(c17,0) as decimal(12,2)),
	--c18 = cast(@dtocomercial*isnull(c18,0) as decimal(12,2)),
	--c19 = cast(@dtocomercial*isnull(c19,0) as decimal(12,2)),
	--c20 = cast(@dtocomercial*isnull(c20,0) as decimal(12,2)),
	--c21 = cast(@dtocomercial*isnull(c21,0) as decimal(12,2)),
	--c22 = cast(@dtocomercial*isnull(c22,0) as decimal(12,2)),
	--c23 = cast(@dtocomercial*isnull(c23,0) as decimal(12,2)),
	--c24 = cast(@dtocomercial*isnull(c24,0) as decimal(12,2)),
	--c25 = cast(@dtocomercial*isnull(c25,0) as decimal(12,2)),
	--c26 = cast(@dtocomercial*isnull(c26,0) as decimal(12,2)),
	--c27 = cast(@dtocomercial*isnull(c27,0) as decimal(12,2)),
	--c28 = cast(@dtocomercial*isnull(c28,0) as decimal(12,2)),
	--c29 = cast(@dtocomercial*isnull(c29,0) as decimal(12,2)),
	--c30 = cast(@dtocomercial*isnull(c30,0) as decimal(12,2)),
	--c31 = cast(@dtocomercial*isnull(c31,0) as decimal(12,2)),
	--c32 = cast(@dtocomercial*isnull(c32,0) as decimal(12,2)),
	--c33 = cast(@dtocomercial*isnull(c33,0) as decimal(12,2)),
	--c34 = cast(@dtocomercial*isnull(c34,0) as decimal(12,2)),
	--c35 = cast(@dtocomercial*isnull(c35,0) as decimal(12,2)),
	--c36 = cast(@dtocomercial*isnull(c36,0) as decimal(12,2)),
	--c37 = cast(@dtocomercial*isnull(c37,0) as decimal(12,2)),
	--c38 = cast(@dtocomercial*isnull(c38,0) as decimal(12,2)),
	--c39 = cast(@dtocomercial*isnull(c39,0) as decimal(12,2)),
	--c40 = cast(@dtocomercial*isnull(c40,0) as decimal(12,2)),
	--c41 = cast(@dtocomercial*isnull(c41,0) as decimal(12,2)),
	--c42 = cast(@dtocomercial*isnull(c42,0) as decimal(12,2)),
	--c43 = cast(@dtocomercial*isnull(c43,0) as decimal(12,2)),
	--c44 = cast(@dtocomercial*isnull(c44,0) as decimal(12,2)),
	--c45 = cast(@dtocomercial*isnull(c45,0) as decimal(12,2)),
	--c46 = cast(@dtocomercial*isnull(c46,0) as decimal(12,2)),
	--c47 = cast(@dtocomercial*isnull(c47,0) as decimal(12,2)),
	--c48 = cast(@dtocomercial*isnull(c48,0) as decimal(12,2)),
	--c49 = cast(@dtocomercial*isnull(c49,0) as decimal(12,2)),
	--c50 = cast(@dtocomercial*isnull(c50,0) as decimal(12,2)),
	--c51 = cast(@dtocomercial*isnull(c51,0) as decimal(12,2)),
	--c52 = cast(@dtocomercial*isnull(c52,0) as decimal(12,2)),
	--c53 = cast(@dtocomercial*isnull(c53,0) as decimal(12,2)),
	--c54 = cast(@dtocomercial*isnull(c54,0) as decimal(12,2)),
	--c55 = cast(@dtocomercial*isnull(c55,0) as decimal(12,2)),
	--c56 = cast(@dtocomercial*isnull(c56,0) as decimal(12,2)),
	--c57 = cast(@dtocomercial*isnull(c57,0) as decimal(12,2)),
	--c58 = cast(@dtocomercial*isnull(c58,0) as decimal(12,2)),
	--c59 = cast(@dtocomercial*isnull(c59,0) as decimal(12,2)),
	--c60 = cast(@dtocomercial*isnull(c60,0) as decimal(12,2)),
	--c61 = cast(@dtocomercial*isnull(c61,0) as decimal(12,2))
	--WHERE C00 <> ''
	

	if @mapa = 2
	begin
	/* 2.- ACTUALIZO FRENTE A C1 */
	--update SOL_TARIFAS_SIMULATE_TABLE_EXPORT_C1 set
	--pos = 1,
	--c02 = cast(@dtocomercial*isnull(c02,0) as decimal(12,2)),
	--c03 = cast(@dtocomercial*isnull(c03,0) as decimal(12,2)),
	--c04 = cast(@dtocomercial*isnull(c04,0) as decimal(12,2)),
	--c05 = cast(@dtocomercial*isnull(c05,0) as decimal(12,2)),
	--c06 = cast(@dtocomercial*isnull(c06,0) as decimal(12,2)),
	--c07 = cast(@dtocomercial*isnull(c07,0) as decimal(12,2)),
	--c08 = cast(@dtocomercial*isnull(c08,0) as decimal(12,2)),
	--c09 = cast(@dtocomercial*isnull(c09,0) as decimal(12,2)),
	--c10 = cast(@dtocomercial*isnull(c10,0) as decimal(12,2)),
	--c11 = cast(@dtocomercial*isnull(c11,0) as decimal(12,2)),
	--c12 = cast(@dtocomercial*isnull(c12,0) as decimal(12,2)),
	--c13 = cast(@dtocomercial*isnull(c13,0) as decimal(12,2)),
	--c14 = cast(@dtocomercial*isnull(c14,0) as decimal(12,2)),
	--c15 = cast(@dtocomercial*isnull(c15,0) as decimal(12,2)),
	--c16 = cast(@dtocomercial*isnull(c16,0) as decimal(12,2)),
	--c17 = cast(@dtocomercial*isnull(c17,0) as decimal(12,2)),
	--c18 = cast(@dtocomercial*isnull(c18,0) as decimal(12,2)),
	--c19 = cast(@dtocomercial*isnull(c19,0) as decimal(12,2)),
	--c20 = cast(@dtocomercial*isnull(c20,0) as decimal(12,2)),
	--c21 = cast(@dtocomercial*isnull(c21,0) as decimal(12,2)),
	--c22 = cast(@dtocomercial*isnull(c22,0) as decimal(12,2)),
	--c23 = cast(@dtocomercial*isnull(c23,0) as decimal(12,2)),
	--c24 = cast(@dtocomercial*isnull(c24,0) as decimal(12,2)),
	--c25 = cast(@dtocomercial*isnull(c25,0) as decimal(12,2)),
	--c26 = cast(@dtocomercial*isnull(c26,0) as decimal(12,2)),
	--c27 = cast(@dtocomercial*isnull(c27,0) as decimal(12,2)),
	--c28 = cast(@dtocomercial*isnull(c28,0) as decimal(12,2)),
	--c29 = cast(@dtocomercial*isnull(c29,0) as decimal(12,2)),
	--c30 = cast(@dtocomercial*isnull(c30,0) as decimal(12,2)),
	--c31 = cast(@dtocomercial*isnull(c31,0) as decimal(12,2)),
	--c32 = cast(@dtocomercial*isnull(c32,0) as decimal(12,2)),
	--c33 = cast(@dtocomercial*isnull(c33,0) as decimal(12,2)),
	--c34 = cast(@dtocomercial*isnull(c34,0) as decimal(12,2)),
	--c35 = cast(@dtocomercial*isnull(c35,0) as decimal(12,2)),
	--c36 = cast(@dtocomercial*isnull(c36,0) as decimal(12,2)),
	--c37 = cast(@dtocomercial*isnull(c37,0) as decimal(12,2)),
	--c38 = cast(@dtocomercial*isnull(c38,0) as decimal(12,2)),
	--c39 = cast(@dtocomercial*isnull(c39,0) as decimal(12,2)),
	--c40 = cast(@dtocomercial*isnull(c40,0) as decimal(12,2)),
	--c41 = cast(@dtocomercial*isnull(c41,0) as decimal(12,2)),
	--c42 = cast(@dtocomercial*isnull(c42,0) as decimal(12,2)),
	--c43 = cast(@dtocomercial*isnull(c43,0) as decimal(12,2)),
	--c44 = cast(@dtocomercial*isnull(c44,0) as decimal(12,2)),
	--c45 = cast(@dtocomercial*isnull(c45,0) as decimal(12,2)),
	--c46 = cast(@dtocomercial*isnull(c46,0) as decimal(12,2)),
	--c47 = cast(@dtocomercial*isnull(c47,0) as decimal(12,2)),
	--c48 = cast(@dtocomercial*isnull(c48,0) as decimal(12,2)),
	--c49 = cast(@dtocomercial*isnull(c49,0) as decimal(12,2)),
	--c50 = cast(@dtocomercial*isnull(c50,0) as decimal(12,2)),
	--c51 = cast(@dtocomercial*isnull(c51,0) as decimal(12,2)),
	--c52 = cast(@dtocomercial*isnull(c52,0) as decimal(12,2)),
	--c53 = cast(@dtocomercial*isnull(c53,0) as decimal(12,2)),
	--c54 = cast(@dtocomercial*isnull(c54,0) as decimal(12,2)),
	--c55 = cast(@dtocomercial*isnull(c55,0) as decimal(12,2)),
	--c56 = cast(@dtocomercial*isnull(c56,0) as decimal(12,2)),
	--c57 = cast(@dtocomercial*isnull(c57,0) as decimal(12,2)),
	--c58 = cast(@dtocomercial*isnull(c58,0) as decimal(12,2)),
	--c59 = cast(@dtocomercial*isnull(c59,0) as decimal(12,2)),
	--c60 = cast(@dtocomercial*isnull(c60,0) as decimal(12,2))
	--WHERE C00 <> ''


	/* 3.- APLICO MARGEN */
	update SOL_TARIFAS_SIMULATE_TABLE_EXPORT_C1 set
	c02 = replace(cast(@margencliente*c02 as decimal(12,2)),'.',','),
	c03 = replace(cast(@margencliente*c03 as decimal(12,2)),'.',','),
	c04 = replace(cast(@margencliente*c04 as decimal(12,2)),'.',','),
	c05 = replace(cast(@margencliente*c05 as decimal(12,2)),'.',','),
	c06 = replace(cast(@margencliente*c06 as decimal(12,2)),'.',','),
	c07 = replace(cast(@margencliente*c07 as decimal(12,2)),'.',','),
	c08 = replace(cast(@margencliente*c08 as decimal(12,2)),'.',','),
	c09 = replace(cast(@margencliente*c09 as decimal(12,2)),'.',','),
	c10 = replace(cast(@margencliente*c10 as decimal(12,2)),'.',','),
	c11 = replace(cast(@margencliente*c11 as decimal(12,2)),'.',','),
	c12 = replace(cast(@margencliente*c12 as decimal(12,2)),'.',','),
	c13 = replace(cast(@margencliente*c13 as decimal(12,2)),'.',','),
	c14 = replace(cast(@margencliente*c14 as decimal(12,2)),'.',','),
	c15 = replace(cast(@margencliente*c15 as decimal(12,2)),'.',','),
	c16 = replace(cast(@margencliente*c16 as decimal(12,2)),'.',','),
	c17 = replace(cast(@margencliente*c17 as decimal(12,2)),'.',','),
	c18 = replace(cast(@margencliente*c18 as decimal(12,2)),'.',','),
	c19 = replace(cast(@margencliente*c19 as decimal(12,2)),'.',','),
	c20 = replace(cast(@margencliente*c20 as decimal(12,2)),'.',','),
	c21 = replace(cast(@margencliente*c21 as decimal(12,2)),'.',','),
	c22 = replace(cast(@margencliente*c22 as decimal(12,2)),'.',','),
	c23 = replace(cast(@margencliente*c23 as decimal(12,2)),'.',','),
	c24 = replace(cast(@margencliente*c24 as decimal(12,2)),'.',','),
	c25 = replace(cast(@margencliente*c25 as decimal(12,2)),'.',','),
	c26 = replace(cast(@margencliente*c26 as decimal(12,2)),'.',','),
	c27 = replace(cast(@margencliente*c27 as decimal(12,2)),'.',','),
	c28 = replace(cast(@margencliente*c28 as decimal(12,2)),'.',','),
	c29 = replace(cast(@margencliente*c29 as decimal(12,2)),'.',','),
	c30 = replace(cast(@margencliente*c30 as decimal(12,2)),'.',','),
	c31 = replace(cast(@margencliente*c31 as decimal(12,2)),'.',','),
	c32 = replace(cast(@margencliente*c32 as decimal(12,2)),'.',','),
	c33 = replace(cast(@margencliente*c33 as decimal(12,2)),'.',','),
	c34 = replace(cast(@margencliente*c34 as decimal(12,2)),'.',','),
	c35 = replace(cast(@margencliente*c35 as decimal(12,2)),'.',','),
	c36 = replace(cast(@margencliente*c36 as decimal(12,2)),'.',','),
	c37 = replace(cast(@margencliente*c37 as decimal(12,2)),'.',','),
	c38 = replace(cast(@margencliente*c38 as decimal(12,2)),'.',','),
	c39 = replace(cast(@margencliente*c39 as decimal(12,2)),'.',','),
	c40 = replace(cast(@margencliente*c40 as decimal(12,2)),'.',','),
	c41 = replace(cast(@margencliente*c41 as decimal(12,2)),'.',','),
	c42 = replace(cast(@margencliente*c42 as decimal(12,2)),'.',','),
	c43 = replace(cast(@margencliente*c43 as decimal(12,2)),'.',','),
	c44 = replace(cast(@margencliente*c44 as decimal(12,2)),'.',','),
	c45 = replace(cast(@margencliente*c45 as decimal(12,2)),'.',','),
	c46 = replace(cast(@margencliente*c46 as decimal(12,2)),'.',','),
	c47 = replace(cast(@margencliente*c47 as decimal(12,2)),'.',','),
	c48 = replace(cast(@margencliente*c48 as decimal(12,2)),'.',','),
	c49 = replace(cast(@margencliente*c49 as decimal(12,2)),'.',','),
	c50 = replace(cast(@margencliente*c50 as decimal(12,2)),'.',','),
	c51 = replace(cast(@margencliente*c51 as decimal(12,2)),'.',','),
	c52 = replace(cast(@margencliente*c52 as decimal(12,2)),'.',','),
	c53 = replace(cast(@margencliente*c53 as decimal(12,2)),'.',','),
	c54 = replace(cast(@margencliente*c54 as decimal(12,2)),'.',','),
	c55 = replace(cast(@margencliente*c55 as decimal(12,2)),'.',','),
	c56 = replace(cast(@margencliente*c56 as decimal(12,2)),'.',','),
	c57 = replace(cast(@margencliente*c57 as decimal(12,2)),'.',','),
	c58 = replace(cast(@margencliente*c58 as decimal(12,2)),'.',','),
	c59 = replace(cast(@margencliente*c59 as decimal(12,2)),'.',','),
	c60 = replace(cast(@margencliente*c60 as decimal(12,2)),'.',',')
	WHERE C00 <> ''

	end


	if @mapa = 1
	begin
	/* 4.- SI c1 ES NUMERO */
	update SOL_TARIFAS_SIMULATE_TABLE_EXPORT_V2 set
	c02= dbo.C1_Generate(c02,7),
	c03= dbo.C1_Generate(c03,7),
	c04= dbo.C1_Generate(c04,7),
	c05= dbo.C1_Generate(c05,7),
	c06= dbo.C1_Generate(c06,7),
	c07= dbo.C1_Generate(c07,7),
	c08= dbo.C1_Generate(c08,7),
	c09= dbo.C1_Generate(c09,7),
	c10= dbo.C1_Generate(c10,7),
	c11= dbo.C1_Generate(c11,7),
	c12= dbo.C1_Generate(c12,7),
	c13= dbo.C1_Generate(c13,7),
	c14= dbo.C1_Generate(c14,7),
	c15= dbo.C1_Generate(c15,7),
	c16= dbo.C1_Generate(c16,7),
	c17= dbo.C1_Generate(c17,7),
	c18= dbo.C1_Generate(c18,7),
	c19= dbo.C1_Generate(c19,7),
	c20= dbo.C1_Generate(c20,7),
	c21= dbo.C1_Generate(c21,7),
	c22= dbo.C1_Generate(c22,7),
	c23= dbo.C1_Generate(c23,7),
	c24= dbo.C1_Generate(c24,7),
	c25= dbo.C1_Generate(c25,7),
	c26= dbo.C1_Generate(c26,7),
	c27= dbo.C1_Generate(c27,7),
	c28= dbo.C1_Generate(c28,7),
	c29= dbo.C1_Generate(c29,7),
	c30= dbo.C1_Generate(c30,7),
	c31= dbo.C1_Generate(c31,7),
	c32= dbo.C1_Generate(c32,7),
	c33= dbo.C1_Generate(c33,7),
	c34= dbo.C1_Generate(c34,7),
	c35= dbo.C1_Generate(c35,7),
	c36= dbo.C1_Generate(c36,7),
	c37= dbo.C1_Generate(c37,7),
	c38= dbo.C1_Generate(c38,7),
	c39= dbo.C1_Generate(c39,7),
	c40= dbo.C1_Generate(c40,7),
	c41= dbo.C1_Generate(c41,7),
	c42= dbo.C1_Generate(c42,7),
	c43= dbo.C1_Generate(c43,7),
	c44= dbo.C1_Generate(c44,7),
	c45= dbo.C1_Generate(c45,7),
	c46= dbo.C1_Generate(c46,7),
	c47= dbo.C1_Generate(c47,7),
	c48= dbo.C1_Generate(c48,7),
	c49= dbo.C1_Generate(c49,7),
	c50= dbo.C1_Generate(c50,7),
	c51= dbo.C1_Generate(c51,7),
	c52= dbo.C1_Generate(c52,7),
	c53= dbo.C1_Generate(c53,7),
	c54= dbo.C1_Generate(c54,7),
	c55= dbo.C1_Generate(c55,7),
	c56= dbo.C1_Generate(c56,7),
	c57= dbo.C1_Generate(c57,7),
	c58= dbo.C1_Generate(c58,7),
	c59= dbo.C1_Generate(c59,7),
	c60= dbo.C1_Generate(c60,7)
	WHERE C00 <> ''
	end

	

	
	if @mapa = 2
	begin
		/* 5.- AGREGAR */ 
		insert into SOL_TARIFAS_SIMULATE_TABLE_EXPORT_C1(idrow,pos,c00,c01,c02,c03,c04,c05,c06,c07,c08,c09,c10,c11,c12,c13,c14,c15,c16,c17,c18,c19,c20,c21,c22,c23,c24,c25,c26,c27,c28,c29,c30,c31,c32,
		c33,c34,c35,c36,c37,c38,c39,c40,c41,c42,c43,c44,c45,c46,c47,c48,c49,c50,c51,c52,c53,c54,c55,c56,c57,c58,c59,c60,c61)
		select idrow,pos,c00,c01,c02,c03,c04,c05,c06,c07,c08,c09,c10,c11,c12,c13,c14,c15,c16,c17,c18,c19,c20,c21,c22,c23,c24,c25,c26,c27,c28,c29,c30,c31,c32,
		c33,c34,c35,c36,c37,c38,c39,c40,c41,c42,c43,c44,c45,c46,c47,c48,c49,c50,c51,c52,c53,c54,c55,c56,c57,c58,c59,c60,c61 from SOL_TARIFAS_SIMULATE_TABLE_EXPORT_V2 WHERE C00 <> ''
		order by idrow
	end
	


	if @tipo = 1
	begin
		--select c00,c02,c03,c04,c05,c06,c07,c08,c09,c10,c11,c12,c13,c14,c15 from SOL_TARIFAS_SIMULATE_TABLE_EXPORT_C1 order by idrow,c00,pos
		
		select idrow,dbo.pac(c00) as c00,dbo.pac(c01) as c01,
		dbo.pac(c02) as c02,dbo.pac(c03) as c03,dbo.pac(c04) as c04,dbo.pac(c05) as c05,dbo.pac(c06) as c06,dbo.pac(c07) as c07,dbo.pac(c08) as c08,dbo.pac(c09) as c09,dbo.pac(c10) as c10,
		dbo.pac(c11) as c11,dbo.pac(c12) as c12,dbo.pac(c13) as c13,dbo.pac(c14) as c14,dbo.pac(c15) as c15 from SOL_TARIFAS_SIMULATE_TABLE_EXPORT_C1 order by idrow,c00,pos
		

	end


	if @tipo = 2
	begin
		--select c00,c02,c03,c04,c05,c06,c07,c08,c09,c10,c11,c12,c13,c14,c15,c16,c17,c18 from SOL_TARIFAS_SIMULATE_TABLE_EXPORT_C1 order by idrow,c00,pos
		select idrow,dbo.pac(c00) as c00,dbo.pac(c01) as c01,
		dbo.pac(c02) as c02,dbo.pac(c03) as c03,dbo.pac(c04) as c04,dbo.pac(c05) as c05,dbo.pac(c06) as c06,dbo.pac(c07) as c07,dbo.pac(c08) as c08,dbo.pac(c09) as c09,dbo.pac(c10) as c10,
		dbo.pac(c11) as c11,dbo.pac(c12) as c12,dbo.pac(c13) as c13,dbo.pac(c14) as c14,dbo.pac(c15) as c15,dbo.pac(c16) as c16,dbo.pac(c17) as c17,dbo.pac(c18) as c18 from SOL_TARIFAS_SIMULATE_TABLE_EXPORT_C1 order by idrow,c00,pos
	end

	if @tipo = 3
	begin
		--select c00,c02,c03,c04,c05,c06,c07,c08,c09,c10,c11,c12,c13,c14,c15,c16,c17,c18 from SOL_TARIFAS_SIMULATE_TABLE_EXPORT_C1 order by idrow,c00,pos
		select idrow,dbo.pac(c00) as c00,dbo.pac(c01) as c01,
		dbo.pac(c02) as c02,dbo.pac(c03) as c03,dbo.pac(c04) as c04,dbo.pac(c05) as c05,dbo.pac(c06) as c06,dbo.pac(c07) as c07,dbo.pac(c08) as c08,dbo.pac(c09) as c09,dbo.pac(c10) as c10,
		dbo.pac(c11) as c11,dbo.pac(c12) as c12,dbo.pac(c13) as c13,dbo.pac(c14) as c14,dbo.pac(c15) as c15,dbo.pac(c16) as c16,dbo.pac(c17) as c17,dbo.pac(c18) as c18 from SOL_TARIFAS_SIMULATE_TABLE_EXPORT_C1 order by idrow,c00,pos
	end

	if @tipo = 4
	begin
		--select c00,c02,c03,c04,c05,c06,c07,c08,c09,c10,c11,c12,c13,c14,c15,c16,c17,c18,c19,c20,c21,c22,c23,c24,c25 from SOL_TARIFAS_SIMULATE_TABLE_EXPORT_C1 order by idrow,c00,pos
		select idrow,dbo.pac(c00) as c00,dbo.pac(c01) as c01,
		dbo.pac(c02) as c02,dbo.pac(c03) as c03,dbo.pac(c04) as c04,dbo.pac(c05) as c05,dbo.pac(c06) as c06,dbo.pac(c07) as c07,dbo.pac(c08) as c08,dbo.pac(c09) as c09,dbo.pac(c10) as c10,
		dbo.pac(c11) as c11,dbo.pac(c12) as c12,dbo.pac(c13) as c13,dbo.pac(c14) as c14,dbo.pac(c15) as c15,dbo.pac(c16) as c16,dbo.pac(c17) as c17,dbo.pac(c18) as c18,dbo.pac(c19) as c19,dbo.pac(c20) as c20,
		dbo.pac(c21) as c21,dbo.pac(c22) as c22,dbo.pac(c23) as c23,dbo.pac(c24) as c24,dbo.pac(c25) as c25 from SOL_TARIFAS_SIMULATE_TABLE_EXPORT_C1 order by idrow,c00,pos
	end

	if @tipo = 5
	begin
		--select dbo.pac(c00) as c00,dbo.pac(c02) as c02,c03,c04,c05,c06,c07,c08,c09,c10,c11,c12,c13,c14,c15,c16,c17,c18,c19,c20,c21,c22,c23,c24,c25,c26,c27,c28,c29,c30 from SOL_TARIFAS_SIMULATE_TABLE_EXPORT_C1 order by idrow,c00,pos
		select idrow,dbo.pac(c00) as c00,dbo.pac(c01) as c01,
		dbo.pac(c02) as c02,dbo.pac(c03) as c03,dbo.pac(c04) as c04,dbo.pac(c05) as c05,dbo.pac(c06) as c06,dbo.pac(c07) as c07,dbo.pac(c08) as c08,dbo.pac(c09) as c09,dbo.pac(c10) as c10,
		dbo.pac(c11) as c11,dbo.pac(c12) as c12,dbo.pac(c13) as c13,dbo.pac(c14) as c14,dbo.pac(c15) as c15,dbo.pac(c16) as c16,dbo.pac(c17) as c17,dbo.pac(c18) as c18,dbo.pac(c19) as c19,dbo.pac(c20) as c20,
		dbo.pac(c21) as c21,dbo.pac(c22) as c22,dbo.pac(c23) as c23,dbo.pac(c24) as c24,dbo.pac(c25) as c25,dbo.pac(c26) as c26,dbo.pac(c27) as c27,dbo.pac(c28) as c28,dbo.pac(c29) as c29,dbo.pac(c30) as c30 
		from SOL_TARIFAS_SIMULATE_TABLE_EXPORT_C1 order by idrow,c00,pos
	end


	if @tipo = 6
	begin
		--select idrow,c00,c02,c02,c03,c04,c05,c06,c07,c08,c09,c10 from SOL_TARIFAS_SIMULATE_TABLE_EXPORT_C1 order by idrow,c00,pos
		select idrow,dbo.pac(c00) as c00,dbo.pac(c01) as c01,
		dbo.pac(c02) as c02,dbo.pac(c03) as c03,dbo.pac(c04) as c04,dbo.pac(c05) as c05,dbo.pac(c06) as c06,dbo.pac(c07) as c07,dbo.pac(c08) as c08,dbo.pac(c09) as c09,dbo.pac(c10) as c10
		from SOL_TARIFAS_SIMULATE_TABLE_EXPORT_C1 order by idrow,c00,pos
	end

	if @tipo = 7
	begin
		select idrow,dbo.pac(c00) as c00,dbo.pac(c01) as c01,
		dbo.pac(c02) as c02,dbo.pac(c03) as c03,dbo.pac(c04) as c04,dbo.pac(c05) as c05,dbo.pac(c06) as c06,dbo.pac(c07) as c07,dbo.pac(c08) as c08,dbo.pac(c09) as c09,dbo.pac(c10) as c10,
		dbo.pac(c11) as c11,dbo.pac(c12) as c12,dbo.pac(c13) as c13,dbo.pac(c14) as c14,dbo.pac(c15) as c15,dbo.pac(c16) as c16,dbo.pac(c17) as c17,dbo.pac(c18) as c18,dbo.pac(c19) as c19,dbo.pac(c20) as c20,
		dbo.pac(c21) as c21,dbo.pac(c22) as c22,dbo.pac(c23) as c23,dbo.pac(c24) as c24,dbo.pac(c25) as c25,dbo.pac(c26) as c26,dbo.pac(c27) as c27,dbo.pac(c28) as c28,dbo.pac(c29) as c29,dbo.pac(c30) as c30, 
		dbo.pac(c31) as c31,dbo.pac(c32) as c32,dbo.pac(c33) as c33,dbo.pac(c34) as c34,dbo.pac(c35) as c35,dbo.pac(c36) as c36,dbo.pac(c37) as c37,dbo.pac(c38) as c38,dbo.pac(c39) as c39,dbo.pac(c40) as c40,
		dbo.pac(c41) as c41,dbo.pac(c42) as c42,dbo.pac(c43) as c43,dbo.pac(c44) as c44,dbo.pac(c45) as c45,dbo.pac(c46) as c46,dbo.pac(c47) as c47,dbo.pac(c48) as c48,dbo.pac(c49) as c49,dbo.pac(c50) as c50,
		dbo.pac(c51) as c51,dbo.pac(c52) as c52,dbo.pac(c53) as c53,dbo.pac(c54) as c54,dbo.pac(c55) as c55,dbo.pac(c56) as c56,dbo.pac(c57) as c57,dbo.pac(c58) as c58,dbo.pac(c59) as c59,dbo.pac(c60) as c60
		from SOL_TARIFAS_SIMULATE_TABLE_EXPORT_C1 order by idrow,c00,pos

	end

	if @tipo = 8	/* HONEYCOMB: anchos 0,40-1,40 */
	begin
		select idrow,dbo.pac(c00) as c00,dbo.pac(c01) as c01,
		dbo.pac(c02) as c02,dbo.pac(c03) as c03,dbo.pac(c04) as c04,dbo.pac(c05) as c05,dbo.pac(c06) as c06,dbo.pac(c07) as c07
		from SOL_TARIFAS_SIMULATE_TABLE_EXPORT_C1 order by idrow,c00,pos
	end

	return 1

	end

go
