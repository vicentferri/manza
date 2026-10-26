/* =====================================================================
   00 - Comprobación previa (SOLO LECTURA, no cambia nada)
   Ejecutar en la BD de destino antes del 01 y el 02:
     1) tipo actual de las columnas de ancho/alto que tocan los scripts
     2) huella de los nueve SPs de alta (02) y los dos de tarifa (03): ORIGINAL (se puede aplicar),
        YA APLICADO o DISTINTO (no aplicar: comparar con backup/ y avisar)
   ===================================================================== */
set nocount on

select o.name as tabla, c.name as columna, type_name(c.user_type_id) as tipo, c.precision, c.scale
from sys.columns c
join sys.objects o on o.object_id = c.object_id
where o.name in ('SOL_PEDIDOS_COLA_TIPO_3', 'SOL_PRESUPUESTOS_COLA_TIPO_3', 'temp_sol_pedidos_cola_tipo_3',
                 'SOL_PEDIDOS_COLA_TIPO_4', 'SOL_PRESUPUESTOS_COLA_TIPO_4', 'temp_sol_pedidos_cola_tipo_4',
                 'SOL_PEDIDOS_COLA_TIPO_7', 'SOL_PRESUPUESTOS_COLA_TIPO_7', 'SOL_PRESUPUESTOS_COLA_LINEAS', 'SOL_PRESUPUESTOS_COLA_TIPO_1')
  and c.name in ('ancho', 'ancho2', 'alto', 'PV_Ancho_1', 'PV_Alto_1', 'PV_Ancho_2', 'PV_AlturaMin_2', 'PV_AlturaMax_2')
order by o.name, c.name

declare @huellas table (sp sysname, ck_original int, len_original int, ck_nuevo int, len_nuevo int)
insert into @huellas values
	('sp_sol_pedidos_cola_tipo_1_add', 1769307993, 7609, -1447249083, 7627),
	('sp_sol_presupuestos_cola_tipo_1_add', 799621813, 5206, -234996438, 5242),
	('sol_temp_pedidos_cola_tipo_1_add', -1710586670, 6505, -1697766416, 6523),
	('sol_pedidos_cola_tipo_3_add', -1041525095, 4446, -1595532300, 4494),
	('sol_presupuestos_cola_tipo_3_add', -1393091120, 4602, -698831176, 4666),
	('sol_temp_pedidos_cola_tipo_3_add', -1952263522, 4467, 1507662716, 4515),
	('sol_pedidos_cola_tipo_4_add', 597352974, 4153, -387546635, 4181),
	('sol_presupuestos_cola_tipo_4_add', 1076678199, 4246, 1419026961, 4290),
	('sol_temp_pedidos_cola_tipo_4_add', -1069864685, 4180, 839335800, 4208),
	/* 03 */
	('temp_sp_fabricacion_tipo_2_tarifa', -1285060731, 5796, -246677723, 5802),
	('sp_tarifas_calculate_prices3_AT', -1789014845, 10113, 273506740, 10244)

select h.sp,
	case when m.object_id is null then 'NO EXISTE'
	     when checksum(m.definition) = h.ck_original and len(m.definition) = h.len_original then 'ORIGINAL'
	     when checksum(m.definition) = h.ck_nuevo and len(m.definition) = h.len_nuevo then 'YA APLICADO'
	     else 'DISTINTO' end as estado,
	checksum(m.definition) as ck, len(m.definition) as len
from @huellas h
left join sys.sql_modules m on m.object_id = object_id('dbo.' + h.sp)
order by h.sp
