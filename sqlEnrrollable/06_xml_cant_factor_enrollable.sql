/* =====================================================================
   06 - XML de producción del enrollable: CANT y FACTOR según la unidad del artículo
   Mismo criterio que HoneyComb (sqlHoney/06, 2026-10-15), ahora también en el bloque del enrollable
   (articulo = 1) de sp_fichero_produccion_2:
     - Artículos que se cuentan (unidad 1 Ud, 4 juego, 5 par, 6 min): Cn_CANT = consumo y Cn_FACTOR = 1.
     - Artículos que se miden (2 m2, 3 ml) y los que no tienen unidad (como el tejido): Cn_CANT = 1 y el
       consumo en Cn_FACTOR.
     - Antes todos llevaban la cantidad de la línea en CANT y el consumo en FACTOR.
     - Las líneas sin artículo (SIN ARTÍCULO) no van al XML y los componentes salen en su orden (orden, id).
   Los demás productos (japonés, vertical, Compac, HoneyComb) no cambian.
   Cambio quirúrgico sobre la definición que hay en la BD: se sustituye el bloque del cursor de los
   componentes (debe aparecer exactamente una vez; si no, error y no se modifica nada). Si ya está aplicado
   no hace nada. Se deshace con 06_deshacer_xml_cant_factor_enrollable.sql. Copia de la definición anterior:
   backup/sp_fichero_produccion_2_antes_06_20261023.sql (SHA-256 FB3511DAA1AF...).
   ===================================================================== */
set ansi_nulls on
go
set quoted_identifier on
go

declare @def nvarchar(max) = object_definition(object_id('dbo.sp_fichero_produccion_2'))
declare @crlf nvarchar(2) = char(13) + char(10)
declare @old nvarchar(max) = cast(N'' as nvarchar(max))
	+ N'declare itLineas2 cursor forward_only for'
	+ @crlf + N'				select isnull(cod_sol,''''),cantidad,replace(cast(consumo as decimal(12,6)),''.'','',''),'
	+ @crlf + N'				replace(cast(0.01*ancho as decimal(12,6)),''.'','',''),replace(cast(0.01*alto as decimal(12,6)),''.'','',''),seccion from SOL_PEDIDOS_COLA_TIPO_1_FABRICACION '
	+ @crlf + N'				where idrow=@idrow'
	+ @crlf + N'					open itLineas2'
	+ @crlf + N'					fetch next from itLineas2 into @cod_sol,@cantidad2,@cod_factor,@cod_p1,@cod_p2,@cod_seccion'
	+ @crlf + N'					while @@FETCH_STATUS = 0'
	+ @crlf + N'																							begin'
	+ @crlf + N'					set @cod_p1 = isnull(@cod_p1,''0'')'
	+ @crlf + N'					set @cod_p2 = isnull(@cod_p2,''0'')'
	+ @crlf + N'					set @cod_factor = isnull(@cod_factor,''0'')'
	+ @crlf + N'					set @cod_seccion = isnull(@cod_seccion,''0'')'
	+ @crlf + N'					set @cantidad2 = replace(@cantidad2,''.'','','')'
	+ @crlf + N''
	+ @crlf + N'					set @cod_p3 = ''0'''
	+ @crlf + N'					set @CSV_A = '''''
	+ @crlf + N'					set @CSV_A += ''<C'' + cast(@orden as varchar) + ''>'' + @cod_sol + ''</C'' + cast(@orden as varchar) + ''>'''
	+ @crlf + N'					set @CSV_A += ''<C'' + cast(@orden as varchar) + ''_CANT>'' + @cantidad2 + ''</C'' + cast(@orden as varchar) + ''_CANT>'''
	+ @crlf + N'					set @CSV_A += ''<C'' + cast(@orden as varchar) + ''_P1>'' + @cod_p1 + ''</C'' + cast(@orden as varchar) + ''_P1>'''
	+ @crlf + N'					set @CSV_A += ''<C'' + cast(@orden as varchar) + ''_P2>'' + @cod_p2 + ''</C'' + cast(@orden as varchar) + ''_P2>'''
	+ @crlf + N'					set @CSV_A += ''<C'' + cast(@orden as varchar) + ''_P3>'' + @cod_p3 + ''</C'' + cast(@orden as varchar) + ''_P3>'''
	+ @crlf + N'					set @CSV_A += ''<C'' + cast(@orden as varchar) + ''_FACTOR>'' + @cod_factor + ''</C'' + cast(@orden as varchar) + ''_FACTOR>'''
	+ @crlf + N'					set @CSV_A += ''<C'' + cast(@orden as varchar) + ''_SECCION>'' + @cod_seccion + ''</C'' + cast(@orden as varchar) + ''_SECCION>'''
	+ @crlf + N'					set @orden = @orden + 1'
	+ @crlf + N'					insert into @CSV(value) values(@CSV_A)'
	+ @crlf + N'				 fetch next from itLineas2 into @cod_sol,@cantidad2,@cod_factor,@cod_p1,@cod_p2,@cod_seccion'
	+ @crlf + N'				 end'
	+ @crlf + N'					 close itLineas2'
	+ @crlf + N'					 deallocate itLineas2'
declare @new nvarchar(max) = cast(N'' as nvarchar(max))
	+ N'/* sqlEnrrollable/06: como HoneyComb, los artículos que se cuentan (unidad 1 Ud, 4 juego, 5 par, 6 min) llevan el'
	+ @crlf + N'				   consumo en Cn_CANT y Cn_FACTOR = 1; los que se miden (2 m2, 3 ml, y los que no tienen unidad, como el tejido)'
	+ @crlf + N'				   siguen con CANT 1 y el consumo en FACTOR. Cada <Detalles> es una unidad. Las líneas sin artículo (SIN ARTÍCULO)'
	+ @crlf + N'				   no van al XML y los componentes salen en su orden. */'
	+ @crlf + N'				declare @enr_unidad int'
	+ @crlf + N'				declare @enr_consumo decimal(12,6)'
	+ @crlf + N'				declare @enr_cant varchar(30)'
	+ @crlf + N''
	+ @crlf + N'				declare itLineas2 cursor forward_only for'
	+ @crlf + N'				select isnull(cod_sol,''''),cantidad,replace(cast(consumo as decimal(12,6)),''.'','',''),'
	+ @crlf + N'				replace(cast(0.01*ancho as decimal(12,6)),''.'','',''),replace(cast(0.01*alto as decimal(12,6)),''.'','',''),seccion,unidad,consumo from SOL_PEDIDOS_COLA_TIPO_1_FABRICACION '
	+ @crlf + N'				where idrow=@idrow and articulo is not null'
	+ @crlf + N'				order by orden,id'
	+ @crlf + N'					open itLineas2'
	+ @crlf + N'					fetch next from itLineas2 into @cod_sol,@cantidad2,@cod_factor,@cod_p1,@cod_p2,@cod_seccion,@enr_unidad,@enr_consumo'
	+ @crlf + N'					while @@FETCH_STATUS = 0'
	+ @crlf + N'					begin'
	+ @crlf + N'					set @cod_p1 = isnull(@cod_p1,''0'')'
	+ @crlf + N'					set @cod_p2 = isnull(@cod_p2,''0'')'
	+ @crlf + N'					set @cod_factor = isnull(@cod_factor,''0'')'
	+ @crlf + N'					set @cod_seccion = isnull(@cod_seccion,''0'')'
	+ @crlf + N''
	+ @crlf + N'					set @cod_p3 = ''0'''
	+ @crlf + N'					if @enr_unidad in (1,4,5,6)'
	+ @crlf + N'					begin'
	+ @crlf + N'						/* consumo sin ceros a la derecha: 8 -> ''8'', 0,5 -> ''0,5'' */'
	+ @crlf + N'						set @enr_cant = cast(isnull(@enr_consumo,0) as varchar(30))'
	+ @crlf + N'						set @enr_cant = reverse(substring(reverse(@enr_cant), patindex(''%[^0]%'', reverse(@enr_cant)), 30))'
	+ @crlf + N'						if right(@enr_cant,1) = ''.'' set @enr_cant = left(@enr_cant, len(@enr_cant)-1)'
	+ @crlf + N'						set @enr_cant = replace(@enr_cant,''.'','','')'
	+ @crlf + N'						set @cod_factor = ''1'''
	+ @crlf + N'					end'
	+ @crlf + N'					else'
	+ @crlf + N'						set @enr_cant = ''1'''
	+ @crlf + N'					set @CSV_A = '''''
	+ @crlf + N'					set @CSV_A += ''<C'' + cast(@orden as varchar) + ''>'' + @cod_sol + ''</C'' + cast(@orden as varchar) + ''>'''
	+ @crlf + N'					set @CSV_A += ''<C'' + cast(@orden as varchar) + ''_CANT>'' + @enr_cant + ''</C'' + cast(@orden as varchar) + ''_CANT>'''
	+ @crlf + N'					set @CSV_A += ''<C'' + cast(@orden as varchar) + ''_P1>'' + @cod_p1 + ''</C'' + cast(@orden as varchar) + ''_P1>'''
	+ @crlf + N'					set @CSV_A += ''<C'' + cast(@orden as varchar) + ''_P2>'' + @cod_p2 + ''</C'' + cast(@orden as varchar) + ''_P2>'''
	+ @crlf + N'					set @CSV_A += ''<C'' + cast(@orden as varchar) + ''_P3>'' + @cod_p3 + ''</C'' + cast(@orden as varchar) + ''_P3>'''
	+ @crlf + N'					set @CSV_A += ''<C'' + cast(@orden as varchar) + ''_FACTOR>'' + @cod_factor + ''</C'' + cast(@orden as varchar) + ''_FACTOR>'''
	+ @crlf + N'					set @CSV_A += ''<C'' + cast(@orden as varchar) + ''_SECCION>'' + @cod_seccion + ''</C'' + cast(@orden as varchar) + ''_SECCION>'''
	+ @crlf + N'					set @orden = @orden + 1'
	+ @crlf + N'					insert into @CSV(value) values(@CSV_A)'
	+ @crlf + N'					fetch next from itLineas2 into @cod_sol,@cantidad2,@cod_factor,@cod_p1,@cod_p2,@cod_seccion,@enr_unidad,@enr_consumo'
	+ @crlf + N'					end'
	+ @crlf + N'					close itLineas2'
	+ @crlf + N'					deallocate itLineas2'
declare @h int, @p int

if @def is null
	raiserror('No existe sp_fichero_produccion_2', 16, 1)
else if charindex(N'sqlEnrrollable/06', @def) > 0
	print 'sp_fichero_produccion_2: ya tenía el cambio del enrollable, no se modifica'
else
begin
	set @p = charindex(@old, @def)
	set @h = charindex(N'CREATE PROCEDURE [dbo].[sp_fichero_produccion_2]', @def)
	if @p = 0 or charindex(@old, @def, @p + 1) > 0
	   or @h = 0 or ltrim(rtrim(replace(replace(left(@def, @h - 1), char(13), ''), char(10), ''))) <> ''
		raiserror('sp_fichero_produccion_2 no tiene el texto esperado (bloque del enrollable): no se modifica', 16, 1)
	else
	begin
		set @def = stuff(@def, @p, len(@old), @new)
		set @def = stuff(@def, @h, 6, N'ALTER') /* solo la palabra CREATE: el resto de la cabecera queda como estaba */
		execute sp_executesql @def
		print 'sp_fichero_produccion_2: bloque del enrollable con CANT / FACTOR según la unidad'
	end
end
go
