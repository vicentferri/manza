/* =====================================================================
   06 - sp_fichero_produccion_2: bloque HoneyComb (articulo = 7)
   Único cambio respecto a la versión anterior (backup/sp_fichero_produccion_2_DEV_20260929.sql):
   se añade el bloque "if @articulo = 7" que genera <Articulo>22000</Articulo>
   con los componentes de SOL_PEDIDOS_COLA_TIPO_7_FABRICACION.
   2026-10-06: las líneas sin artículo (articulo NULL, aviso "SIN ARTÍCULO") no se envían al XML.
   2026-10-07: las líneas del XML se devuelven en el orden en que se escriben (columna n + order by).
   Antes salían con "select value from @CSV" sin orden, que SQL Server no garantiza: en DEV el
   último bloque de un pedido salió al principio (XML roto). Afecta a todos los productos.
   El resto del procedimiento queda idéntico.
   ===================================================================== */
set ansi_nulls on
go
set quoted_identifier on
go

alter procedure [dbo].[sp_fichero_produccion_2]
(
@id int
)
as
begin

declare @idLin int
declare @articulo int
declare @CSV table (n int identity(1,1), value text)
declare @CSV_A varchar(MAX) = ''
declare @Cliente varchar(10)
declare @fecha varchar(50)
declare @referencia varchar(50)
declare @idrow int
declare @ancho varchar(10)
declare @alto varchar(10)
declare @cantidad int
declare @tipo int
declare @descripcion varchar(255)
declare @descripcionCLI varchar(255)
declare @Tienda varchar(5)
declare @cod_sol varchar(10)
declare @cantidad2 varchar(10)
declare @cod_p1 varchar(10)
declare @cod_p2 varchar(10)
declare @cod_p3 varchar(10)
declare @cod_factor varchar(10)
declare @cod_seccion varchar(10)
declare @c1 varchar(25)
declare @entrega varchar(25)
declare @refcliente varchar(25)
declare @orden int
declare @numero int
declare @clientrega int
declare @targetCliente int
declare @TipoLama varchar(10)

declare @strPrecio varchar(10)

set nocount on
select top 1 
@fecha = dbo.FormateaFechaYYYYMMDD(fecha),
@referencia = isnull(referencia,''),
@cliente = cast(cliente as varchar),
@refcliente  = isnull(refcliente,''),
@clientrega = cliente_entrega from sol_pedidos_cola 
where idrow=@id

set @targetCliente = cast(@cliente as int)

select top 1 @Tienda = ISNULL(CODSOLUPYME,'000') from NH_CLIENTES_DOMICILIOS where idrow=@clientrega

if @cliente = '1' or @cliente='5' set @cliente = '002000'
if @cliente = '4' set @cliente = '1'

if Len(@refcliente)  > 0
begin
	set @referencia = @refcliente
end

insert into @CSV(value) values('<root><Cabecera><Cliente>' + @cliente + '</Cliente><Fecha>' + @fecha + '</Fecha><Pedido>' + @referencia + '</Pedido></Cabecera>')

declare itLineasPedido cursor forward_only for
select id,articulo from sol_pedidos_cola_lineas where idrow=@id
open itLineasPedido
fetch next from itLineasPedido into @idLin,@articulo
while @@FETCH_STATUS = 0
begin

	if @articulo = 1
	begin
		/* ENROLLABLES */
			declare itLineas cursor forward_only for
			select id,replace(cast(0.01*ancho as decimal(12,6)),'.',',') as ancho,replace(cast(0.01*alto as decimal(12,6)),'.',',') as alto,cantidad,tipo,isnull(t1_pvp_c1,t1_pvp),t1_fecha_Entrega,
			(select refcliente from sol_pedidos_cola where idrow=@id)
			from SOL_PEDIDOS_COLA_TIPO_1 where idrow=@idLin 
			open itLineas 
			fetch next from itLineas into @idrow,@ancho,@alto,@cantidad,@tipo,@c1,@entrega,@refcliente
			while @@fetch_status = 0
			begin

				set @numero = 1
				while @numero <= @cantidad
				begin
				 
					set @descripcion = 'Descripcion';
					set @descripcionCLI = 'Descripcion CLI'; 

					if @cliente = '002000' 
					begin
						set @descripcion = 'LEROY MERLIN';
						set @descripcionCLI = @refcliente; 
					end

					declare @c1Precio decimal(12,2)

					
					if isnumeric(@c1) = 1
					begin
						set @c1Precio = cast(@c1 as decimal(12,2))

						if @targetCliente = 5
						set @c1Precio = cast(@c1 as decimal(12,2))
						else
						set @c1Precio = @cantidad*cast(@c1 as decimal(12,2))

						set @strPrecio = cast(@c1Precio as varchar)
						set @strPrecio = replace(@strPrecio,'.',',')
					end
					else
					begin
					set @strPrecio = dbo.fn_decimal_from_c1 (@c1,@cantidad)
					end

					set @strPrecio = ISNULL(@strPrecio,0)
					
					

					
					insert into @CSV(value) values('<Detalles><Articulo>API.001</Articulo><Descripcion>' + @descripcion + '</Descripcion><DescCliente>' + @descripcionCLI + '</DescCliente>')
					insert into @CSV(value) values('<Unidades>1</Unidades><Ancho>' + @ancho + '</Ancho>')
					insert into @CSV(value) values('<Alto>' + @alto  + '</Alto>')
					insert into @CSV(value) values('<Precio>'+@strPrecio+'</Precio>')
					insert into @CSV(value) values('<Tienda>'+cast(@Tienda as varchar)+'</Tienda>')

					set @orden = 1

				declare itLineas2 cursor forward_only for
				select isnull(cod_sol,''),cantidad,replace(cast(consumo as decimal(12,6)),'.',','),
				replace(cast(0.01*ancho as decimal(12,6)),'.',','),replace(cast(0.01*alto as decimal(12,6)),'.',','),seccion from SOL_PEDIDOS_COLA_TIPO_1_FABRICACION 
				where idrow=@idrow
					open itLineas2
					fetch next from itLineas2 into @cod_sol,@cantidad2,@cod_factor,@cod_p1,@cod_p2,@cod_seccion
					while @@FETCH_STATUS = 0
																							begin
					set @cod_p1 = isnull(@cod_p1,'0')
					set @cod_p2 = isnull(@cod_p2,'0')
					set @cod_factor = isnull(@cod_factor,'0')
					set @cod_seccion = isnull(@cod_seccion,'0')
					set @cantidad2 = replace(@cantidad2,'.',',')

					set @cod_p3 = '0'
					set @CSV_A = ''
					set @CSV_A += '<C' + cast(@orden as varchar) + '>' + @cod_sol + '</C' + cast(@orden as varchar) + '>'
					set @CSV_A += '<C' + cast(@orden as varchar) + '_CANT>' + @cantidad2 + '</C' + cast(@orden as varchar) + '_CANT>'
					set @CSV_A += '<C' + cast(@orden as varchar) + '_P1>' + @cod_p1 + '</C' + cast(@orden as varchar) + '_P1>'
					set @CSV_A += '<C' + cast(@orden as varchar) + '_P2>' + @cod_p2 + '</C' + cast(@orden as varchar) + '_P2>'
					set @CSV_A += '<C' + cast(@orden as varchar) + '_P3>' + @cod_p3 + '</C' + cast(@orden as varchar) + '_P3>'
					set @CSV_A += '<C' + cast(@orden as varchar) + '_FACTOR>' + @cod_factor + '</C' + cast(@orden as varchar) + '_FACTOR>'
					set @CSV_A += '<C' + cast(@orden as varchar) + '_SECCION>' + @cod_seccion + '</C' + cast(@orden as varchar) + '_SECCION>'
					set @orden = @orden + 1
					insert into @CSV(value) values(@CSV_A)
				 fetch next from itLineas2 into @cod_sol,@cantidad2,@cod_factor,@cod_p1,@cod_p2,@cod_seccion
				 end
					 close itLineas2
					 deallocate itLineas2

					insert into @CSV(value) values('</Detalles>')
				
				set @numero = @numero + 1
				end

			fetch next from itLineas into @idrow,@ancho,@alto,@cantidad,@tipo,@c1,@entrega,@refcliente
			end
			close itLineas
			deallocate itLineas
		/* ENROLLABLES */
	end

	if @articulo = 2
	begin
		/* JAPONES */
			declare itLineas cursor for
			select id,tipo,t2_pvp_c1,t2_FechaEntrega,(select refcliente from sol_pedidos_cola where idrow=@id)
			from SOL_PEDIDOS_COLA_TIPO_2 where idrow=@idLin
			open itLineas 
			fetch next from itLineas into @idrow,@tipo,@c1,@entrega,@refcliente
			while @@fetch_status = 0
			begin

				execute sp_panel_japones_info @idrow,@cantidad out,@ancho out,@alto out

				set @descripcion = 'Descripcion';
				set @descripcionCLI = 'Descripcion CLI'; 

				if @cliente = '002000' 
				begin
					set @descripcion = 'LEROY MERLIN';
					set @descripcionCLI = @refcliente; 
				end
         
				insert into @CSV(value) values('<Detalles><Articulo>API.002</Articulo><Descripcion>' + @descripcion + '</Descripcion><DescCliente>' + @descripcionCLI + '</DescCliente>')
				insert into @CSV(value) values('<Unidades>1</Unidades><Ancho>' + @ancho + '</Ancho>')
				insert into @CSV(value) values('<Alto>' + @alto  + '</Alto><Precio>'+dbo.fn_decimal_from_c1 (@c1,@cantidad)+'</Precio><Tienda>'+cast(@Tienda as varchar)+'</Tienda>')

				set @orden = 1

				declare itLineas2 cursor for
				select isnull(cod_sol,''),cantidad,replace(cast(0.01*consumo as decimal(12,6)),'.',','),
				replace(cast(0.01*ancho as decimal(12,6)),'.',','),replace(cast(0.01*alto as decimal(12,6)),'.',','),seccion from SOL_PEDIDOS_COLA_TIPO_2_FABRICACION 
				where idrow=@idrow
				open itLineas2
				fetch next from itLineas2 into @cod_sol,@cantidad2,@cod_factor,@cod_p1,@cod_p2,@cod_seccion
				while @@FETCH_STATUS = 0
				begin
					set @cod_p1 = isnull(@cod_p1,'0')
					set @cod_p2 = isnull(@cod_p2,'0')
					set @cod_factor = isnull(@cod_factor,'0')
					set @cod_seccion = isnull(@cod_seccion,'0')
					set @cod_p3 = '0'
					set @CSV_A = ''
					set @CSV_A += '<C' + cast(@orden as varchar) + '>' + @cod_sol + '</C' + cast(@orden as varchar) + '>'
					set @CSV_A += '<C' + cast(@orden as varchar) + '_CANT>' + @cantidad2 + '</C' + cast(@orden as varchar) + '_CANT>'
					set @CSV_A += '<C' + cast(@orden as varchar) + '_P1>' + @cod_p1 + '</C' + cast(@orden as varchar) + '_P1>'
					set @CSV_A += '<C' + cast(@orden as varchar) + '_P2>' + @cod_p2 + '</C' + cast(@orden as varchar) + '_P2>'
					set @CSV_A += '<C' + cast(@orden as varchar) + '_P3>' + @cod_p3 + '</C' + cast(@orden as varchar) + '_P3>'
					set @CSV_A += '<C' + cast(@orden as varchar) + '_FACTOR>' + @cod_factor + '</C' + cast(@orden as varchar) + '_FACTOR>'
					set @CSV_A += '<C' + cast(@orden as varchar) + '_SECCION>' + @cod_seccion + '</C' + cast(@orden as varchar) + '_SECCION>'
					set @orden = @orden + 1
					insert into @CSV(value) values(@CSV_A)
				 fetch next from itLineas2 into @cod_sol,@cantidad2,@cod_factor,@cod_p1,@cod_p2,@cod_seccion
				 end
				 close itLineas2
				 deallocate itLineas2

				insert into @CSV(value) values('</Detalles>')

			fetch next from itLineas into @idrow,@tipo,@c1,@entrega,@refcliente
			end
			close itLineas
			deallocate itLineas
		/* JAPONES */
	end

	if @articulo = 3
	begin
			declare itLineas cursor for
			select id,tipo,isnull(t3_pvp_c1,t3_pvp),t3_Fecha_Entrega,(select refcliente from sol_pedidos_cola where idrow=@id),TipoLama
			from SOL_PEDIDOS_COLA_TIPO_3 where idrow=@idLin
			open itLineas 
			fetch next from itLineas into @idrow,@tipo,@c1,@entrega,@refcliente,@TipoLama
			while @@fetch_status = 0
			begin
				execute sp_panel_vertical_info @idrow,@cantidad out,@ancho out,@alto out

				set @descripcion = 'Descripcion';
				set @descripcionCLI = 'Descripcion CLI'; 

				if @cliente = '002000' 
				begin
					set @descripcion = 'LEROY MERLIN';
					set @descripcionCLI = @refcliente; 
				end

				set @c1 = replace(@c1,'.',',')
         
				
				insert into @CSV(value) values('<Detalles><Articulo>'+@TipoLama+'</Articulo><Descripcion>' + @descripcion + '</Descripcion><DescCliente>' + @descripcionCLI + '</DescCliente>')
				insert into @CSV(value) values('<Unidades>1</Unidades><Ancho>' + @ancho + '</Ancho>')
				insert into @CSV(value) values('<Alto>' + @alto  + '</Alto><Precio>'+@c1+'</Precio><Tienda>'+cast(@Tienda as varchar)+'</Tienda>')

				set @orden = 1

				declare itLineas2 cursor for
				select isnull(cod_sol,''),cantidad,replace(cast(0.01*consumo as decimal(12,6)),'.',','),
				replace(cast(0.01*ancho as decimal(12,6)),'.',','),replace(cast(0.01*alto as decimal(12,6)),'.',','),seccion from SOL_PEDIDOS_COLA_TIPO_3_FABRICACION 
				where idrow=@idrow
				open itLineas2
				fetch next from itLineas2 into @cod_sol,@cantidad2,@cod_factor,@cod_p1,@cod_p2,@cod_seccion
				while @@FETCH_STATUS = 0
				begin
					set @cod_p1 = isnull(@cod_p1,'0')
					set @cod_p2 = isnull(@cod_p2,'0')
					set @cod_factor = isnull(@cod_factor,'0')
					set @cod_seccion = isnull(@cod_seccion,'0')
					set @cod_p3 = '0'
					set @CSV_A = ''
					set @CSV_A += '<C' + cast(@orden as varchar) + '>' + @cod_sol + '</C' + cast(@orden as varchar) + '>'
					set @CSV_A += '<C' + cast(@orden as varchar) + '_CANT>' + @cantidad2 + '</C' + cast(@orden as varchar) + '_CANT>'
					set @CSV_A += '<C' + cast(@orden as varchar) + '_P1>' + @cod_p1 + '</C' + cast(@orden as varchar) + '_P1>'
					set @CSV_A += '<C' + cast(@orden as varchar) + '_P2>' + @cod_p2 + '</C' + cast(@orden as varchar) + '_P2>'
					set @CSV_A += '<C' + cast(@orden as varchar) + '_P3>' + @cod_p3 + '</C' + cast(@orden as varchar) + '_P3>'
					set @CSV_A += '<C' + cast(@orden as varchar) + '_FACTOR>' + @cod_factor + '</C' + cast(@orden as varchar) + '_FACTOR>'
					set @CSV_A += '<C' + cast(@orden as varchar) + '_SECCION>' + @cod_seccion + '</C' + cast(@orden as varchar) + '_SECCION>'
					set @orden = @orden + 1
					insert into @CSV(value) values(@CSV_A)
				 fetch next from itLineas2 into @cod_sol,@cantidad2,@cod_factor,@cod_p1,@cod_p2,@cod_seccion
				 end
				 close itLineas2
				 deallocate itLineas2

				insert into @CSV(value) values('</Detalles>')

			fetch next from itLineas into @idrow,@tipo,@c1,@entrega,@refcliente,@TipoLama
			end
			close itLineas
			deallocate itLineas
		/* VERTICAL */
	end

	if @articulo = 4
	begin
	/* SOLAR MINI */
			declare itLineas cursor forward_only for
			select id,replace(cast(0.01*ancho as decimal(12,6)),'.',',') as ancho,replace(cast(0.01*alto as decimal(12,6)),'.',',') as alto,cantidad,tipo,t4_pvp,t4_fecha_Entrega,
			(select refcliente from sol_pedidos_cola where idrow=@id)
			from SOL_PEDIDOS_COLA_TIPO_4 where idrow=@idLin 
			open itLineas 
			fetch next from itLineas into @idrow,@ancho,@alto,@cantidad,@tipo,@c1,@entrega,@refcliente
			while @@fetch_status = 0
			begin

				set @refcliente = isnull(@refcliente,1)

				set @numero = 1
				while @numero <= @cantidad
				begin
				 
					set @descripcion = 'SOLARMINI';
					set @descripcionCLI = @refcliente;

					if @cliente = '002000' 
					begin
						set @descripcion = 'LEROY MERLIN';
						set @descripcionCLI = @refcliente; 
					end

					--set @strPrecio = dbo.fn_decimal_from_c1 (@c1,@cantidad)
					set @strPrecio = replace(@c1,'.',',')
         
					insert into @CSV(value) values('<Detalles><Articulo>API.001</Articulo><Descripcion>' + @descripcion + '</Descripcion><DescCliente>' + @descripcionCLI + '</DescCliente>')
					insert into @CSV(value) values('<Unidades>1</Unidades><Ancho>' + @ancho + '</Ancho>')
					insert into @CSV(value) values('<Alto>' + @alto  + '</Alto><Precio>'+@strPrecio+'</Precio><Tienda>'+cast(@Tienda as varchar)+'</Tienda>')

					set @orden = 1

				declare itLineas2 cursor for
				select isnull(cod_sol,''),cantidad,replace(cast(0.01*consumo as decimal(12,6)),'.',','),
				replace(cast(0.01*ancho as decimal(12,6)),'.',','),replace(cast(0.01*alto as decimal(12,6)),'.',','),seccion from SOL_PEDIDOS_COLA_TIPO_4_FABRICACION 
				where idrow=@idrow
					open itLineas2
					fetch next from itLineas2 into @cod_sol,@cantidad2,@cod_factor,@cod_p1,@cod_p2,@cod_seccion
					while @@FETCH_STATUS = 0
					begin
					set @cod_p1 = isnull(@cod_p1,'0')
					set @cod_p2 = isnull(@cod_p2,'0')
					set @cod_factor = isnull(@cod_factor,'0')
					set @cod_seccion = isnull(@cod_seccion,'0')
					set @cantidad2 = replace(@cantidad2,'.',',')

					set @cod_p3 = '0'
					set @CSV_A = ''
					set @CSV_A += '<C' + cast(@orden as varchar) + '>' + @cod_sol + '</C' + cast(@orden as varchar) + '>'
					set @CSV_A += '<C' + cast(@orden as varchar) + '_CANT>' + '1' + '</C' + cast(@orden as varchar) + '_CANT>'
					set @CSV_A += '<C' + cast(@orden as varchar) + '_P1>' + @cod_p1 + '</C' + cast(@orden as varchar) + '_P1>'
					set @CSV_A += '<C' + cast(@orden as varchar) + '_P2>' + @cod_p2 + '</C' + cast(@orden as varchar) + '_P2>'
					set @CSV_A += '<C' + cast(@orden as varchar) + '_P3>' + @cod_p3 + '</C' + cast(@orden as varchar) + '_P3>'
					set @CSV_A += '<C' + cast(@orden as varchar) + '_FACTOR>' + @cod_factor + '</C' + cast(@orden as varchar) + '_FACTOR>'
					set @CSV_A += '<C' + cast(@orden as varchar) + '_SECCION>' + @cod_seccion + '</C' + cast(@orden as varchar) + '_SECCION>'
					set @orden = @orden + 1
					insert into @CSV(value) values(@CSV_A)
				 fetch next from itLineas2 into @cod_sol,@cantidad2,@cod_factor,@cod_p1,@cod_p2,@cod_seccion
				 end
					 close itLineas2
					 deallocate itLineas2

					insert into @CSV(value) values('</Detalles>')
				
				set @numero = @numero + 1
				end

			fetch next from itLineas into @idrow,@ancho,@alto,@cantidad,@tipo,@c1,@entrega,@refcliente
			end
			close itLineas
			deallocate itLineas
		/* COMPAC */
	end

	if @articulo = 7
	begin
	/* HONEYCOMB */
			declare itLineas cursor forward_only for
			select id,replace(cast(0.01*ancho as decimal(12,6)),'.',',') as ancho,replace(cast(0.01*alto as decimal(12,6)),'.',',') as alto,cantidad,7,isnull(T7_PVP_C1,cast(T7_PVP as varchar(25))),T7_Fecha_Entrega,
			(select refcliente from sol_pedidos_cola where idrow=@id)
			from SOL_PEDIDOS_COLA_TIPO_7 where idrow=@idLin
			open itLineas
			fetch next from itLineas into @idrow,@ancho,@alto,@cantidad,@tipo,@c1,@entrega,@refcliente
			while @@fetch_status = 0
			begin
				set @refcliente = isnull(@refcliente,1)
				set @numero = 1
				while @numero <= @cantidad
				begin
					set @descripcion = 'HONEYCOMB';
					set @descripcionCLI = @refcliente;
					if @cliente = '002000'
					begin
						set @descripcion = 'LEROY MERLIN';
						set @descripcionCLI = @refcliente;
					end

					set @strPrecio = isnull(replace(@c1,'.',','),'0')

					insert into @CSV(value) values('<Detalles><Articulo>22000</Articulo><Descripcion>' + @descripcion + '</Descripcion><DescCliente>' + @descripcionCLI + '</DescCliente>')
					insert into @CSV(value) values('<Unidades>1</Unidades><Ancho>' + @ancho + '</Ancho>')
					insert into @CSV(value) values('<Alto>' + @alto  + '</Alto><Precio>'+@strPrecio+'</Precio><Tienda>'+cast(@Tienda as varchar)+'</Tienda>')

					set @orden = 1

				declare itLineas2 cursor for
				select isnull(cod_sol,''),cantidad,replace(cast(consumo as decimal(12,6)),'.',','),
				replace(cast(0.01*ancho as decimal(12,6)),'.',','),replace(cast(0.01*alto as decimal(12,6)),'.',','),seccion from SOL_PEDIDOS_COLA_TIPO_7_FABRICACION
				where idrow=@idrow and articulo is not null /* sin articulo (aviso SIN ARTICULO) no va al XML */
				order by orden,id
					open itLineas2
					fetch next from itLineas2 into @cod_sol,@cantidad2,@cod_factor,@cod_p1,@cod_p2,@cod_seccion
					while @@FETCH_STATUS = 0
					begin
					set @cod_p1 = isnull(@cod_p1,'0')
					set @cod_p2 = isnull(@cod_p2,'0')
					set @cod_factor = isnull(@cod_factor,'0')
					set @cod_seccion = isnull(@cod_seccion,'0')
					set @cod_p3 = '0'
					set @CSV_A = ''
					set @CSV_A += '<C' + cast(@orden as varchar) + '>' + @cod_sol + '</C' + cast(@orden as varchar) + '>'
					set @CSV_A += '<C' + cast(@orden as varchar) + '_CANT>' + '1' + '</C' + cast(@orden as varchar) + '_CANT>'
					set @CSV_A += '<C' + cast(@orden as varchar) + '_P1>' + @cod_p1 + '</C' + cast(@orden as varchar) + '_P1>'
					set @CSV_A += '<C' + cast(@orden as varchar) + '_P2>' + @cod_p2 + '</C' + cast(@orden as varchar) + '_P2>'
					set @CSV_A += '<C' + cast(@orden as varchar) + '_P3>' + @cod_p3 + '</C' + cast(@orden as varchar) + '_P3>'
					set @CSV_A += '<C' + cast(@orden as varchar) + '_FACTOR>' + @cod_factor + '</C' + cast(@orden as varchar) + '_FACTOR>'
					set @CSV_A += '<C' + cast(@orden as varchar) + '_SECCION>' + @cod_seccion + '</C' + cast(@orden as varchar) + '_SECCION>'
					set @orden = @orden + 1
					insert into @CSV(value) values(@CSV_A)
				 fetch next from itLineas2 into @cod_sol,@cantidad2,@cod_factor,@cod_p1,@cod_p2,@cod_seccion
				 end
					 close itLineas2
					 deallocate itLineas2
					insert into @CSV(value) values('</Detalles>')
				set @numero = @numero + 1
				end
			fetch next from itLineas into @idrow,@ancho,@alto,@cantidad,@tipo,@c1,@entrega,@refcliente
			end
			close itLineas
			deallocate itLineas
	/* HONEYCOMB */
	end


fetch next from itLineasPedido into @idLin,@articulo
end
close itLineasPedido
deallocate itLineasPedido


 insert into @CSV(value) values('</root>')
 select value from @CSV order by n


return 1

end


go
