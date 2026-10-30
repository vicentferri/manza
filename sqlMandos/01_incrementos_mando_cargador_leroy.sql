/* Incrementos del mando A-OK y del cargador AM25 para Leroy Merlín (cliente 1) y Leroy Merlín Web (cliente 5),
   en el enrollable (producto 1).
   - Mando A-OK 1 canal (id 6):   31,00 € · C1 0002000
   - Mando A-OK 6 canales (id 8): 76,80 € · C1 0004042 (la fila del motor AM35 PLUS L 6/18 del cliente 5 estaba
     a 71,78 € · C1 0003778 y con la descripción "INCREMENTO")
   - Cargador USB motor AM25 (idrow 4): 31,00 € · C1 0002000 (promoción, igual que el mando de 1 canal)
   Idempotente: deja los valores fijos aunque ya estén así. */

set nocount on;

begin tran;

update dbo.sol_articulos_accionamientos_radio_tipo_cliente
   set precio = 31.00, c1 = 'C1 0002000'
 where id = 6 and cliente in (1, 5) and producto = 1
   and (precio <> 31.00 or isnull(c1, '') <> 'C1 0002000');
print 'Mando A-OK 1 canal: ' + cast(@@rowcount as varchar(10)) + ' filas';

update dbo.sol_articulos_accionamientos_radio_tipo_cliente
   set precio = 76.80, c1 = 'C1 0004042', descripcion = 'MANDO 6 CANALES A-OK PREMIUM'
 where id = 8 and cliente in (1, 5) and producto = 1
   and (precio <> 76.80 or isnull(c1, '') <> 'C1 0004042' or isnull(descripcion, '') <> 'MANDO 6 CANALES A-OK PREMIUM');
print 'Mando A-OK 6 canales: ' + cast(@@rowcount as varchar(10)) + ' filas';

update dbo.SOL_ARTICULOS_MANDOS_CARGADORES
   set pvp = 31.00, c1 = 'C1 0002000'
 where idrow = 4
   and (pvp <> 31.00 or isnull(c1, '') <> 'C1 0002000');
print 'Cargador AM25: ' + cast(@@rowcount as varchar(10)) + ' filas';

commit;

-- Comprobación
select id, cliente, producto, modelo, Nmodelo, descripcion, precio, c1, codigo_48
  from dbo.sol_articulos_accionamientos_radio_tipo_cliente
 where id in (6, 8) and cliente in (1, 5) and producto = 1
 order by cliente, id, modelo;

select idrow, id_marca, descripcion, pvp, c1, codigo_48
  from dbo.SOL_ARTICULOS_MANDOS_CARGADORES
 where idrow = 4;
