# Genera sqlEnrrollable/06_xml_cant_factor_enrollable.sql y su deshacer a partir de la definición anterior de
# sp_fichero_produccion_2 (backup/sp_fichero_produccion_2_antes_06_20261023.sql) y del bloque nuevo escrito aquí.
# Uso: python herramientas/generar_06.py   (desde sqlEnrrollable)
import os

base = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
d = open(os.path.join(base, 'backup', 'sp_fichero_produccion_2_antes_06_20261023.sql'), encoding='utf-8', newline='').read()
a = d.index('declare itLineas2 cursor forward_only for')
b = d.index('deallocate itLineas2', a) + len('deallocate itLineas2')
old = d[a:b].split('\r\n')

T = '\t' * 4
new = [
    "/* sqlEnrrollable/06: como HoneyComb, los artículos que se cuentan (unidad 1 Ud, 4 juego, 5 par, 6 min) llevan el",
    T + "   consumo en Cn_CANT y Cn_FACTOR = 1; los que se miden (2 m2, 3 ml, y los que no tienen unidad, como el tejido)",
    T + "   siguen con CANT 1 y el consumo en FACTOR. Cada <Detalles> es una unidad. Las líneas sin artículo (SIN ARTÍCULO)",
    T + "   no van al XML y los componentes salen en su orden. */",
    T + "declare @enr_unidad int",
    T + "declare @enr_consumo decimal(12,6)",
    T + "declare @enr_cant varchar(30)",
    "",
    T + "declare itLineas2 cursor forward_only for",
    T + "select isnull(cod_sol,''),cantidad,replace(cast(consumo as decimal(12,6)),'.',','),",
    T + "replace(cast(0.01*ancho as decimal(12,6)),'.',','),replace(cast(0.01*alto as decimal(12,6)),'.',','),seccion,unidad,consumo from SOL_PEDIDOS_COLA_TIPO_1_FABRICACION ",
    T + "where idrow=@idrow and articulo is not null",
    T + "order by orden,id",
    T + "\topen itLineas2",
    T + "\tfetch next from itLineas2 into @cod_sol,@cantidad2,@cod_factor,@cod_p1,@cod_p2,@cod_seccion,@enr_unidad,@enr_consumo",
    T + "\twhile @@FETCH_STATUS = 0",
    T + "\tbegin",
    T + "\tset @cod_p1 = isnull(@cod_p1,'0')",
    T + "\tset @cod_p2 = isnull(@cod_p2,'0')",
    T + "\tset @cod_factor = isnull(@cod_factor,'0')",
    T + "\tset @cod_seccion = isnull(@cod_seccion,'0')",
    "",
    T + "\tset @cod_p3 = '0'",
    T + "\tif @enr_unidad in (1,4,5,6)",
    T + "\tbegin",
    T + "\t\t/* consumo sin ceros a la derecha: 8 -> '8', 0,5 -> '0,5' */",
    T + "\t\tset @enr_cant = cast(isnull(@enr_consumo,0) as varchar(30))",
    T + "\t\tset @enr_cant = reverse(substring(reverse(@enr_cant), patindex('%[^0]%', reverse(@enr_cant)), 30))",
    T + "\t\tif right(@enr_cant,1) = '.' set @enr_cant = left(@enr_cant, len(@enr_cant)-1)",
    T + "\t\tset @enr_cant = replace(@enr_cant,'.',',')",
    T + "\t\tset @cod_factor = '1'",
    T + "\tend",
    T + "\telse",
    T + "\t\tset @enr_cant = '1'",
    T + "\tset @CSV_A = ''",
    T + "\tset @CSV_A += '<C' + cast(@orden as varchar) + '>' + @cod_sol + '</C' + cast(@orden as varchar) + '>'",
    T + "\tset @CSV_A += '<C' + cast(@orden as varchar) + '_CANT>' + @enr_cant + '</C' + cast(@orden as varchar) + '_CANT>'",
    T + "\tset @CSV_A += '<C' + cast(@orden as varchar) + '_P1>' + @cod_p1 + '</C' + cast(@orden as varchar) + '_P1>'",
    T + "\tset @CSV_A += '<C' + cast(@orden as varchar) + '_P2>' + @cod_p2 + '</C' + cast(@orden as varchar) + '_P2>'",
    T + "\tset @CSV_A += '<C' + cast(@orden as varchar) + '_P3>' + @cod_p3 + '</C' + cast(@orden as varchar) + '_P3>'",
    T + "\tset @CSV_A += '<C' + cast(@orden as varchar) + '_FACTOR>' + @cod_factor + '</C' + cast(@orden as varchar) + '_FACTOR>'",
    T + "\tset @CSV_A += '<C' + cast(@orden as varchar) + '_SECCION>' + @cod_seccion + '</C' + cast(@orden as varchar) + '_SECCION>'",
    T + "\tset @orden = @orden + 1",
    T + "\tinsert into @CSV(value) values(@CSV_A)",
    T + "\tfetch next from itLineas2 into @cod_sol,@cantidad2,@cod_factor,@cod_p1,@cod_p2,@cod_seccion,@enr_unidad,@enr_consumo",
    T + "\tend",
    T + "\tclose itLineas2",
    T + "\tdeallocate itLineas2",
]


def lit(lines):
    partes = ["N'" + l.replace("'", "''") + "'" for l in lines]
    return "cast(N'' as nvarchar(max))\n\t+ " + "\n\t+ @crlf + ".join(partes)


CAB = """/* =====================================================================
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
   backup/sp_fabricacion_produccion_2_antes_06_20261023.sql (SHA-256 FB3511DAA1AF...).
   ===================================================================== */
set ansi_nulls on
go
set quoted_identifier on
go

""".replace('sp_fabricacion_produccion_2_antes', 'sp_fichero_produccion_2_antes')

CAB_UN = """/* =====================================================================
   06 (deshacer) - Vuelve al XML anterior del enrollable
   Devuelve el bloque del enrollable de sp_fichero_produccion_2 al texto anterior al script 06 (el
   procedimiento recupera la huella SHA-256 FB3511DAA1AF...). Si no está aplicado no hace nada.
   ===================================================================== */
set ansi_nulls on
go
set quoted_identifier on
go

"""

DECL = """declare @def nvarchar(max) = object_definition(object_id('dbo.sp_fichero_produccion_2'))
declare @crlf nvarchar(2) = char(13) + char(10)
declare @old nvarchar(max) = """ + lit(old) + """
declare @new nvarchar(max) = """ + lit(new) + """
declare @h int, @p int

"""

APLICAR = CAB + DECL + """if @def is null
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
"""

DESHACER = CAB_UN + DECL + """if charindex(N'sqlEnrrollable/06', isnull(@def, '')) = 0
	print 'sp_fichero_produccion_2: no tenía el cambio del enrollable'
else
begin
	set @p = charindex(@new, @def)
	set @h = charindex(N'CREATE PROCEDURE [dbo].[sp_fichero_produccion_2]', @def)
	if @p = 0 or charindex(@new, @def, @p + 1) > 0 or @h = 0
		raiserror('El bloque del 06 se ha modificado a mano: no se deshace', 16, 1)
	else
	begin
		set @def = stuff(@def, @p, len(@new), @old)
		set @def = stuff(@def, @h, 6, N'ALTER') /* solo la palabra CREATE: el resto de la cabecera queda como estaba */
		execute sp_executesql @def
		print 'sp_fichero_produccion_2: vuelve al bloque anterior del enrollable'
	end
end
go
"""

open(os.path.join(base, '06_xml_cant_factor_enrollable.sql'), 'w', encoding='utf-8', newline='\n').write(APLICAR)
open(os.path.join(base, '06_deshacer_xml_cant_factor_enrollable.sql'), 'w', encoding='utf-8', newline='\n').write(DESHACER)
print('generados', len(APLICAR), len(DESHACER))
