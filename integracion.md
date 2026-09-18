# Investigación: el campo `integracion` — CERRADO, no hay bug (ver conclusión)

> Documento de trabajo. Este análisis pasó por dos hipótesis erróneas antes de llegar a la
> conclusión final (se dejan documentadas más abajo porque explican por qué el código parece
> raro a primera vista). **La conclusión válida es la última sección.** Si vienes a ejecutar
> algo a partir de este documento: no hay ningún cambio de código que aplicar para esto — es un
> cierre de investigación, no un plan de fix.

## Resumen (léase primero)

El campo `integracion` (columna en `USERS` y `CLIENTES_USERS`) es un **discriminador de dos
vías**, confirmado contra el SP real en producción vía `sp_helptext`/SSMS (2026-09-16):

- `integracion = -1` → cliente genérico, usa el portal Manza (`/manza/config/`).
- `integracion = 1` → cliente de una integración específica (hoy en día, únicamente Leroy
  Merlín, `cliente = 1`), usa `/leroy/config`.

Los tres sitios del frontend que comprueban este campo son **coherentes entre sí y correctos**
para este diseño:

| Sitio | Condición | Efecto para cliente Manza (`-1`) | Efecto para cliente Leroy (`1`) |
|---|---|---|---|
| `frontend/src/app/services/AuthGuard.ts:45` (protege `/routes` y `/manza`) | bloquea si `integracion > 0` | No bloquea → entra a `/manza` ✓ | Bloquea → no entra a `/manza`/`/routes` ✓ (usa el otro portal) |
| `frontend/src/app/manza/config/config.component.ts:185` | bloquea si `integracion > 0` | No bloquea ✓ | Bloquea ✓ |
| `frontend/src/app/leroymerlin/config/config.component.ts:669` | bloquea si `integracion < 0` | Bloquea → no entra a `/leroy` ✓ (no es cliente Leroy) | No bloquea → entra a `/leroy` ✓ |

**No hace falta cambiar nada en `AuthGuard.ts`, `manza/config.component.ts` ni
`leroymerlin/config.component.ts`.** El único gap real es que esto no está documentado en
ningún sitio del código (ver "Recomendación mínima" al final).

---

## Cómo se llegó aquí (para que quede constancia del razonamiento)

### Hipótesis 1 (descartada): "hay un bug de signos, no se sabe cuál es el correcto"

Al ver los tres chequeos con signos opuestos (`> 0` en dos sitios, `< 0` en el tercero) y sin
ningún endpoint de creación de usuario (`register()` en
`backend/controllers/common/users.js:10`, `client_register()` en
`backend/controllers/sm/clientes.js:519`) que fijara `integracion` explícitamente, la primera
lectura fue "esto es una inconsistencia accidental, no se puede saber qué signo es el correcto
sin mirar la BD real".

### Hipótesis 2 (descartada, y la más engañosa): "el bug está en `AuthGuard`/`manza`"

Se localizó una copia previa del proyecto en `C:\MANZA` (`C:\MANZA\manza` /
`C:\MANZA\manza_backend` = código antiguo pre-migración de usuarios;
`C:\MANZA\propuestas` = documento de diseño + scripts SQL de la migración que introdujo
`CLIENTES_USERS`, `isAdmin`, `PermisosGuard`, etc. — la misma migración que ya está aplicada en
`prod`). Uno de esos scripts, `C:\MANZA\propuestas\03_STORED_PROCEDURES_UPDATE.sql` (líneas
196-209), mostraba una versión de `sp_nh_add_cliente_domicilio` que ponía
`integracion = 1` para **todos** los clientes sin excepción (usando además `@cliente = 189`
como caso especial de Leroy Merlín, un ID que no aparece en ningún otro sitio del código real —
en `backend/controllers/sm/lm/leroymerlin.js` el caso especial de Leroy Merlín se identifica
siempre como `cliente == 1`, nunca `189`).

Con esa lectura (todos los clientes reciben `integracion = 1`), `AuthGuard`/`manza` (que
bloquean con `> 0`) parecían el bug, porque bloquearían a todo cliente recién creado.

**Esta hipótesis se descartó al pedir confirmación directa: el usuario comprobó el SP real
desplegado en el SQL Server vivo (`sp_helptext`/SSMS, no un fichero de este repo) y su texto
real es:**

```sql
UPDATE dbo.CLIENTES_USERS SET integracion = -1, username = @usuario WHERE idrow = @userid;
UPDATE dbo.CLIENTES_USERS SET url = '/manza/config/', code = @id, nombre = @poblacion WHERE idrow = @userid;

IF @cliente = 1
    UPDATE dbo.CLIENTES_USERS SET url = '/leroy/config', integracion = 1 WHERE idrow = @userid;
END
```

Es decir: por defecto `-1` (Manza), y solo `1` para el cliente Leroy Merlín (`cliente = 1`,
coincide con el resto del código). **El fichero `C:\MANZA\propuestas\03_STORED_PROCEDURES_UPDATE.sql`
no refleja lo que hay realmente desplegado** — es un borrador/copia desactualizada de esa
migración, no la versión que terminó en producción (probablemente se corrigió durante la
implementación real sin que ese fichero de propuesta se actualizara a la vez).

**Importante para el futuro:** no uses `C:\MANZA\propuestas\03_STORED_PROCEDURES_UPDATE.sql`
como referencia de lo que hace `sp_nh_add_cliente_domicilio` hoy — está desactualizado en este
punto concreto. Si hace falta consultar el SP, hazlo contra la base de datos real
(`sp_helptext dbo.sp_nh_add_cliente_domicilio`), no contra ese fichero.

### Contexto histórico adicional: el SP anterior a la migración tampoco tenía el `-1`

`C:\MANZA\propuestas\anterior nh_add.txt` contiene el `sp_nh_add_cliente_domicilio` **previo a
toda la migración** de `USERS`/`CLIENTES_USERS` (usa la tabla `users` en minúscula, sin
`CLIENTES_USERS`, consistente con el resto del código pre-separación). Su lógica de
`integracion` era:

```sql
update users set integracion = 1, username = @usuario where idrow = @userid

update users set url = '/leroy/config', code = @id, nombre = @poblacion
where idrow = @userid and empresa = 1
```

Aquí tampoco hay ningún `-1`: pone `integracion = 1` para **cualquier** cliente que haga match
(el filtro `empresa = 1` solo decide la URL de destino, no toca `integracion`). Es decir, la
cronología completa de este campo es:

1. **SP pre-migración** (`anterior nh_add.txt`): `integracion = 1` para todos, sin discriminador.
2. **Borrador de la migración** (`03_STORED_PROCEDURES_UPDATE.sql`): traslada el mismo
   `integracion = 1` para todos a `CLIENTES_USERS`, sin corregirlo (y con un ID de Leroy erróneo,
   `189`, en vez de `1`).
3. **SP realmente desplegado hoy** (confirmado por `sp_helptext` en vivo): en algún punto entre
   el borrador y el despliegue final se corrigió, añadiendo el `-1` por defecto y dejando `1`
   solo para `@cliente = 1`. Esta es la versión vigente y la que es coherente con
   `AuthGuard`/`manza`/`leroymerlin`.

No hace falta identificar quién hizo esa corrección ni cuándo exactamente — solo constatar que
la versión viva ya incorpora el discriminador correcto, y que ni el SP antiguo ni el borrador de
migración deben tomarse como referencia de lo que hace el sistema hoy.

---

## Conclusión final

No hay ninguna incoherencia que arreglar en el mecanismo de `integracion` tal y como funciona
hoy. Es un diseño válido (aunque no documentado) de dos valores con signo para distinguir el
portal de destino de un cliente.

### Lo único que queda como mejora menor (opcional, no urgente)

1. **Documentar el campo in situ.** Ahora mismo no hay ni un comentario en ninguno de los tres
   ficheros frontend, ni en el backend, que explique que `integracion` es un discriminador de
   portal (`-1` Manza / `1` Leroy Merlín) y no un flag de activo/bloqueado. Cualquiera que lo
   mire sin este contexto llega a la misma conclusión errónea que la Hipótesis 1/2 de este
   documento. Añadir un comentario breve en:
   - `frontend/src/app/services/AuthGuard.ts:45`
   - `frontend/src/app/manza/config/config.component.ts:185`
   - `frontend/src/app/leroymerlin/config/config.component.ts:669`
   - El propio SP `sp_nh_add_cliente_domicilio` (o un README junto a los scripts SQL del
     proyecto, ya que el SP vive fuera de este repo).

   Ejemplo de comentario:
   ```ts
   // integracion: -1 = cliente genérico (portal Manza), 1 = cliente Leroy Merlín (portal /leroy).
   // Lo fija sp_nh_add_cliente_domicilio al dar de alta la tienda/domicilio del cliente.
   ```

2. **`client_register()` (`backend/controllers/sm/clientes.js:519`, SP `Users_Client_Add`) no
   fija `integracion`.** Solo `sp_nh_add_cliente_domicilio` (el flujo de
   `/routes/master/setupcli`) lo hace. Si `client_register()` es una vía de alta de cliente
   realmente usada en paralelo (y no solo un endpoint legacy/sin usar), un cliente creado por
   ahí se queda con `integracion = NULL`. Esto **no rompe nada hoy**: en JavaScript,
   `null > 0` y `null < 0` son ambos `false`, así que un cliente con `integracion = NULL` se
   comporta igual que uno con `-1` en los tres chequeos (entra a Manza, no entra a Leroy) — que
   es el default razonable. Se deja anotado por si en el futuro se añade una tercera
   integración y este caso deja de ser inofensivo.
3. **`@cliente = 1` está hardcodeado en el SP** como identificador de Leroy Merlín. Si ese ID
   cambiara alguna vez (nueva base de datos, reimportación de clientes, etc.) el SP dejaría de
   marcar correctamente a los clientes Leroy. No es un problema hoy, es una fragilidad a tener
   en cuenta si se toca esa zona en el futuro.

Ninguno de estos tres puntos requiere acción inmediata. Este documento se puede dar por cerrado.

## Nota sobre `auth.md`

Esta corrección no afecta a `auth.md` (el problema de endpoints backend sin autenticación) —
son hallazgos independientes y ese análisis se mantiene sin cambios.
