/* =====================================================================
   Comprobación de SOLO LECTURA para ejecutar en producción antes (y después) de desplegar
   sqlEnrrollable. No modifica nada.
   1. Huella (SHA-256) de los procedimientos que toca el script 03, comparada con la de la
      copia local en la que se probó (restaurada de producción el 2026-10-21):
        ORIGINAL   = como antes del 03 (debe salir así antes de desplegar)
        CON EL 03  = ya desplegado
        DISTINTA   = el texto no es el probado: no desplegar el 03 sin revisarlo
                     (el 03 se pararía igualmente si no encuentra lo que espera)
        NO EXISTE  = normal para la copia antes del 03 y para el original después
   2. Qué existe ya de los scripts 01 y 02 y del requisito sqlHoney/22.
   3. Líneas de enrollable del modelo nuevo. Hoy las fabrica dev_sp_fabricacion_tipo_1, que no
      conoce el modelo nuevo; con el 03 las fabrica temp_sp_fabricacion_tipo_1_v3 y, mientras su
      sistema no tenga reglas, al regenerarlas salen sin fabricación.
   ===================================================================== */
set nocount on

select e.procedimiento,
       case when m.definition is null then 'NO EXISTE'
            when convert(varchar(64), hashbytes('SHA2_256', m.definition), 2) = e.original then 'ORIGINAL (igual que en local)'
            when convert(varchar(64), hashbytes('SHA2_256', m.definition), 2) = e.con03 then 'CON EL 03'
            else 'DISTINTA: revisar antes de desplegar' end as estado,
       len(m.definition) as longitud
from (values
	('dev_sp_fabricacion_tipo_1', 'D31543E8BDA0BFBA06D3B5E024D2D77C18F3E83F6E8AF0CA0A0BE8565D161F2A', null),
	('dev_sp_fabricacion_tipo_1_copia_20261022', null, '503E0127E8E79D9D3D25620231C5683E330B3DD83BF1A8078615F1C5CEC278A5'),
	('sp_fabricacion_generate', '2381690305C24711FF02898D3DBFB4E6E202494B2A11E701E38216A526F57F7C', '7F18B753EE38CB593234240CFE3C9ED6AF989DC6B091222FF61E6F4EEE015C68')
) e(procedimiento, original, con03)
left join sys.sql_modules m on m.object_id = object_id('dbo.' + e.procedimiento)
order by e.procedimiento

select case when object_id('dbo.SOL_PEDIDOS_COLA_TIPO_1_PARAMETERS') is null then 'no' else 'sí' end as [01 tabla de parámetros],
       case when object_id('dbo.temp_sp_fabricacion_tipo_1_v3') is null then 'no' else 'sí' end as [02 procedimiento v3],
       case when object_id('dbo.SOL_FABRICACION_PRODUCTOS') is null then 'no (falta sqlHoney/22)' else 'sí' end as [requisito sqlHoney 22]

select count(*) as lineas_modelo_nuevo,
       sum(case when f.idrow is not null then 1 else 0 end) as con_fabricacion,
       count(distinct l.idrow) as pedidos
from SOL_PEDIDOS_COLA_TIPO_1 t
join SOL_PEDIDOS_COLA_LINEAS l on l.id = t.idrow
left join (select distinct idrow from SOL_PEDIDOS_COLA_TIPO_1_FABRICACION) f on f.idrow = t.id
where t.nacc_accionamiento_id is not null
