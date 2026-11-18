# Cerdital

API de la app de granja. El productor registra lotes de cerdos y, sobre cada lote, la alimentación, la sanidad, el pesaje semanal, los costos y las ventas. El inicio resume lotes activos y la utilidad.

La app móvil habla con esta API. Este repositorio es el backend.

## Qué cubre

Registro e inicio de sesión. El JWT dura 7 días. Cada consulta usa el usuario del token: el `user_id` del cuerpo o de la URL tiene que ser el mismo.

Lotes, con raza, fase, peso promedio y cerdos actuales. Alimentación, tratamientos, agenda y catálogos (razas, fases, alimentos, enfermedades). El pesaje descuenta la mortalidad del lote. Una venta descuenta los cerdos vendidos. Cada venta vale cerdos por peso por precio del kilo. La utilidad del inicio es ese valor menos los costos del lote.

En sandbox local no hace falta Firebase. Las notificaciones salen solo si existe `firebase.json` en la raíz, y el push de prueba se manda al dispositivo de quien está autenticado. El cambio de contraseña pide sesión y solo aplica al correo de esa sesión. Recuperar la clave con un código, sin estar adentro, queda para cuando la app se venda.

## Arranque

Hace falta Node 20. `npm test` levanta un Postgres y un Redis de prueba, no usa la base de producción. Para dejar la API corriendo hace falta Docker y un `.env` copiado de `.env.example`.

```sh
npm install
npm test
docker compose up -d
cp .env.example .env
npm run dev
```

La API escucha en `http://localhost:5000`. El contrato, con cuerpos, respuestas y ejemplos, está en `/api-docs`. El JSON queda en `/api-docs.json`. Postgres y Redis salen del compose. El esquema y los catálogos de ejemplo están en `db/schema.sql` y se cargan la primera vez que se crea el volumen.

Ese esquema es para una base nueva. No lo corras sobre la base que ya usa la app en producción. En esa base, corre una vez `db/migrate-sync.sql`: agrega el id del celular, la fecha de cambio y el borrado lógico, sin borrar filas.

| Variable | Uso |
|---|---|
| `JWT_SECRET` | Firma del JWT |
| `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` | Postgres |
| `RD_HOST`, `RD_PORT`, `RD_PASSWORD` | Redis. En el servidor que ya está desplegado el puerto no es 6379: hay que dejar el que usa ese Redis |
| `PUBLIC_URL` | URL que muestra Swagger |
| `firebase.json` | Credencial de Firebase. No se sube al repositorio. Sin el archivo, la API arranca y no envía push |

## Recorrido mínimo

```sh
curl -s -X POST http://localhost:5000/api/auth/register \
  -H 'content-type: application/json' \
  -d '{"fullName":"Granja norte","phone":"3001234567","email":"granja@example.com","password":"clave-demo-1"}'

curl -s -X POST http://localhost:5000/api/auth/login \
  -H 'content-type: application/json' \
  -d '{"email":"granja@example.com","password":"clave-demo-1","token":""}'
```

Con el JWT:

```sh
curl -s -X POST http://localhost:5000/api/batch/createBatch \
  -H "authorization: Bearer <jwt>" \
  -H 'content-type: application/json' \
  -d '{"user_id":1,"batch_name":"Lote norte","pigs":10,"race":"Landrace","average_weight":20,"phase":4}'
```

La fase `4` del esquema local es ceba. Las razas de ejemplo son Landrace, Yorkshire, Duroc y Pietrain.

## Rutas

| Ruta | Para qué |
|---|---|
| `POST /api/auth/register`, `/login`, `/checkUser` | Cuenta |
| `POST /api/auth/changePassword`, `/logout/:id` | Sesión abierta |
| `POST /api/batch/createBatch`, `GET /getBatchById/:user_id`, `PUT /editBatch/:batch_id` | Lotes |
| `POST /api/feeding/createFeeding`, `GET /getFeedingById/:user_id`, `PUT /editFeeding/:feeding_id` | Alimentación |
| `POST /api/health/createHealth`, `GET /getHealthById/:user_id`, `PUT /editHealth/:health_id`, `DELETE /deleteHealth/:health_id` | Sanidad |
| `GET /api/finance/getCostById/:user_id`, `PUT /editCost/:cost_id` | Costos, creados con el lote |
| `POST /api/finance/createSales`, `GET /getSalesById/:user_id`, `DELETE /deleteSales/:sales_id` | Ventas |
| `POST /api/progress/createProgress`, `GET /getProgressById/:user_id`, `PUT /editProgress/:progress_id` | Pesaje |
| `GET /api/home/:user_id` | Lotes activos, costos, ventas y utilidad |
| `GET /api/agenda/:user_id`, `POST /api/agenda` | Agenda |
| `GET /api/list/...` | Catálogos |
| `POST /api/push/test` | Push al dispositivo del usuario, si Firebase está configurado |
| `POST /api/sync/push`, `GET /api/sync/pull?since=` | Sincronización de la app |
| `GET /api/admin/overview`, `GET /api/admin/users/:id`, `POST /api/admin/users` | Panel del super admin |

El rol va en el JWT. Quien se registra queda como `usuario` y usa la web igual que la app: su granja, sus lotes y su estadística. El super admin sale de `SUPERADMIN_EMAIL` y `SUPERADMIN_PASSWORD` al arrancar la API. Ese panel ve todas las granjas, la utilidad y el detalle de cada una. Un usuario normal recibe 403 si entra ahí.

En una base que ya existe, corre una vez `db/migrate-admin.sql` después de `db/migrate-sync.sql`.

Crear un lote, una alimentación, un tratamiento, un pesaje, una venta o un evento devuelve el registro en `record`, con su `client_id`. Si el mismo `client_id` llega otra vez, no se duplica.

## Sincronización

La web y la app con señal siguen usando las rutas de arriba: lotes, alimentación, sanidad, finanzas, progreso, inicio, agenda y catálogos. La app sin señal guarda en el teléfono y, al volver la red, manda la cola en tandas de hasta 20.

`POST /api/sync/push`

```json
{
  "changes": [
    {
      "client_id": "11111111-1111-4111-8111-111111111111",
      "type": "lote",
      "action": "crear",
      "data": {
        "batch_name": "Lote norte",
        "pigs": 10,
        "race": "Landrace",
        "average_weight": 20,
        "phase": 4,
        "cost_client_id": "22222222-2222-4222-8222-222222222222"
      }
    }
  ]
}
```

`type` es `lote`, `alimentacion`, `sanidad`, `pesaje`, `venta`, `costo` o `agenda`. `action` es `crear`, `editar` o `borrar`. El lote de una alimentación, sanidad, pesaje o venta va en `batch_id` o en `batch_client_id`. Los datos usan los mismos nombres que el POST de cada ruta. El costo nace con el lote; después se edita con el `client_id` del costo.

Cada resultado es `guardado`, con el registro, o `conflicto`, con el mensaje. Una venta repetida no vuelve a restar cerdos. Si la venta o el pesaje dejan el lote en negativo, ese cambio vuelve en conflicto. Borrar una venta o un pesaje recalcula los cerdos.

`GET /api/sync/pull?since=` devuelve las filas de ese usuario que cambiaron después de la marca, borradas incluidas: `lotes`, `alimentacion`, `sanidad`, `pesajes`, `ventas`, `costos` y `agenda`. La respuesta trae `cursor` para la siguiente vez. Sin `since`, baja todo lo de esa cuenta.

A medianoche, la agenda del día manda el push y marca el evento como enviado. Redis guarda por una hora las lecturas de lotes, alimentación, ventas e inicio.

## Layout

| Carpeta | Qué es |
|---|---|
| `src/routes` | HTTP |
| `src/services` | Reglas del lote, el pesaje y la venta |
| `src/repositories` | SQL |
| `db/schema.sql` | Tablas y catálogos para una base nueva |
| `tests` | Lote, pesaje, utilidad y que un usuario no lee el lote de otro |
