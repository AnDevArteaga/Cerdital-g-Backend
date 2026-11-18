const error = {
    description: "Error",
    content: {
        "application/json": {
            schema: { $ref: "#/components/schemas/Error" },
        },
    },
};

const saved = {
    description: "Guardado. `record` es la fila, con su `client_id`.",
    content: {
        "application/json": {
            schema: { $ref: "#/components/schemas/Guardado" },
        },
    },
};

const meta = {
    description: "Hecho",
    content: {
        "application/json": {
            schema: { $ref: "#/components/schemas/Meta" },
        },
    },
};

const auth = [{ bearerAuth: [] as string[] }];

export const swaggerSpec = {
    openapi: "3.0.0",
    info: {
        title: "Cerdital G",
        version: "1.0.0",
        description: [
            "API de la granja. El lote es el centro: al crearlo nace su hoja de costos en cero. La alimentación, la sanidad, el pesaje, las ventas y la agenda cuelgan de ese lote.",
            "",
            "Hay dos papeles. `usuario` es el administrador de una granja: ve y escribe solo lo suyo. `superadmin` entra al panel `/api/admin` y ve todas las granjas. Quien se registra queda como `usuario`. El super admin se crea al arrancar, con `SUPERADMIN_EMAIL` y `SUPERADMIN_PASSWORD`.",
            "",
            "Casi todo pide `Authorization: Bearer <jwt>`. El JWT dura 7 días y trae `userId` y `rol`. El `user_id` de la URL o del cuerpo, si se manda, tiene que ser el del token.",
            "",
            "Los POST piden los campos en inglés (`batch_name`, `pig_sold`). Los GET devuelven las columnas de la base, en español (`nombre_lote`, `cerdos_vendidos`). Los `NUMERIC` llegan como texto.",
            "",
            "Un listado vacío responde 404 con `{ status, message }`, no un arreglo vacío. El inicio, si no hay nada, responde 200 con ceros.",
            "",
            "La web y la app con señal usan estas rutas directo. La app sin señal guarda en el teléfono y, al volver la red, manda la cola con `/api/sync/push` (hasta 20 cambios) y baja lo nuevo con `/api/sync/pull`.",
            "",
            "Crear un lote, alimentación, tratamiento, pesaje, venta o evento devuelve la fila en `record`. Si el mismo `client_id` llega otra vez, no se duplica ni se vuelven a restar cerdos. El servidor calcula los cerdos: registrados menos muertes menos vendidos. Si el resultado quedaría negativo, ese cambio no se aplica.",
        ].join("\n"),
    },
    servers: [
        { url: process.env.PUBLIC_URL || "http://localhost:5000", description: "Esta API" },
    ],
    tags: [
        { name: "Servicio", description: "Comprobar que la API está viva." },
        { name: "Auth", description: "Cuenta, sesión y token del celular." },
        { name: "Lotes", description: "El lote y los cerdos que tiene ahora." },
        { name: "Alimentación", description: "Consumos del lote. No se suman solos a la hoja de costos." },
        { name: "Sanidad", description: "Enfermedad y tratamiento." },
        { name: "Finanzas", description: "Costos editados a mano y ventas. Una venta resta cerdos." },
        { name: "Progreso", description: "Pesaje. La mortalidad resta cerdos y puede cambiar la fase." },
        { name: "Agenda", description: "Eventos. A medianoche se avisa por push si Firebase está configurado." },
        { name: "Inicio", description: "Lotes activos, costos, ventas y utilidad." },
        { name: "Catálogos", description: "Fases, razas, alimentos y enfermedades. Son los mismos para todas las granjas." },
        { name: "Sync", description: "Cola de la app sin señal. La web no la necesita." },
        { name: "Admin", description: "Solo el super admin. Todas las granjas y su manejo." },
        { name: "Push", description: "Aviso de prueba al dispositivo guardado en el login." },
    ],
    components: {
        securitySchemes: {
            bearerAuth: {
                type: "http",
                scheme: "bearer",
                bearerFormat: "JWT",
                description: "El `token` que devuelve `POST /api/auth/login`.",
            },
        },
        schemas: {
            Error: {
                type: "object",
                properties: {
                    status: { type: "integer", example: 400 },
                    message: { type: "string", example: "No hay lote seleccionado" },
                },
            },
            Meta: {
                type: "object",
                properties: {
                    status: { type: "integer", example: 200 },
                    message: { type: "string", example: "Hecho" },
                },
            },
            Guardado: {
                type: "object",
                properties: {
                    status: { type: "integer", example: 200 },
                    message: { type: "string", example: "Lote creado exitosamente" },
                    record: { type: "object", additionalProperties: true, description: "Fila guardada, con `client_id`, `updated_at` y `deleted_at`." },
                },
            },
            LoginBody: {
                type: "object",
                required: ["email", "password"],
                properties: {
                    email: { type: "string", format: "email", example: "granja@example.com" },
                    password: { type: "string", example: "clave-demo-1" },
                    token: { type: "string", description: "Token de Firebase del celular. La web lo manda vacío. Si se manda, reemplaza el dispositivo anterior: la cuenta guarda un solo aparato.", example: "" },
                },
            },
            RegisterBody: {
                type: "object",
                required: ["fullName", "phone", "email", "password"],
                properties: {
                    fullName: { type: "string", description: "Nombre de la granja o de quien la administra.", example: "Granja norte" },
                    phone: { type: "string", minLength: 10, example: "3001234567" },
                    email: { type: "string", format: "email", example: "granja@example.com" },
                    password: { type: "string", minLength: 5, example: "clave-demo-1" },
                },
            },
            LoteBody: {
                type: "object",
                required: ["batch_name", "pigs", "race", "average_weight", "phase"],
                properties: {
                    user_id: { type: "integer", description: "Opcional. Si se manda, tiene que ser el usuario del token.", example: 1 },
                    batch_name: { type: "string", example: "Lote norte" },
                    pigs: { type: "integer", minimum: 1, description: "Cerdos con los que nace el lote. Quedan como registrados y como actuales.", example: 20 },
                    race: { type: "string", description: "Nombre de la raza, tal como está en el catálogo. Ejemplo: Landrace, Yorkshire, Duroc, Pietrain.", example: "Landrace" },
                    average_weight: { type: "number", example: 12.5 },
                    phase: { type: "integer", description: "Id de fase. En el esquema local: 1 Lactancia, 2 Precebo, 3 Levante, 4 Ceba.", example: 4 },
                    client_id: { type: "string", format: "uuid", description: "Id que genera el celular. Si no viene, lo genera el servidor." },
                    cost_client_id: { type: "string", format: "uuid", description: "Id del costo que nace con el lote. Lo usa la sincronización." },
                },
            },
            SyncPush: {
                type: "object",
                required: ["changes"],
                properties: {
                    changes: {
                        type: "array",
                        maxItems: 20,
                        items: { $ref: "#/components/schemas/SyncChange" },
                    },
                },
            },
            SyncChange: {
                type: "object",
                required: ["client_id", "type", "action", "data"],
                properties: {
                    client_id: { type: "string", format: "uuid" },
                    type: { type: "string", enum: ["lote", "alimentacion", "sanidad", "pesaje", "venta", "costo", "agenda"] },
                    action: { type: "string", enum: ["crear", "editar", "borrar"] },
                    data: {
                        type: "object",
                        additionalProperties: true,
                        description: "Mismos nombres que el POST de esa ruta. En alimentación, sanidad, pesaje y venta el lote va en `batch_id` o en `batch_client_id`.",
                    },
                },
            },
        },
    },
    paths: {
        "/health": {
            get: {
                tags: ["Servicio"],
                summary: "La API responde",
                responses: {
                    200: {
                        description: "Arriba",
                        content: { "application/json": { schema: { type: "object", properties: { ok: { type: "boolean", example: true } } } } },
                    },
                },
            },
        },
        "/api/auth/register": {
            post: {
                tags: ["Auth"],
                summary: "Crear la cuenta de una granja",
                description: "Siempre queda con rol `usuario`. La contraseña pide al menos 5 caracteres, el teléfono 10 y el correo 5. No devuelve JWT: después hay que hacer login.",
                requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/RegisterBody" } } } },
                responses: {
                    200: {
                        description: "Cuenta creada",
                        content: {
                            "application/json": {
                                example: {
                                    user: { id_usuario: 2, correo: "granja@example.com", rol: "usuario" },
                                    meta: { status: 200, message: "Registro exitoso" },
                                },
                            },
                        },
                    },
                    400: { ...error, description: "Correo repetido, teléfono corto, contraseña corta o nombre vacío." },
                },
            },
        },
        "/api/auth/login": {
            post: {
                tags: ["Auth"],
                summary: "Entrar",
                description: "Devuelve el JWT y el rol. Con ese rol la web manda al tablero de la granja o al panel del super admin.",
                requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/LoginBody" } } } },
                responses: {
                    200: {
                        description: "Sesión abierta",
                        content: {
                            "application/json": {
                                example: {
                                    user: {
                                        id: 2,
                                        email: "granja@example.com",
                                        fullName: "Granja norte",
                                        phone: "3001234567",
                                        rol: "usuario",
                                        token: "<jwt>",
                                    },
                                    meta: { status: 200, message: "Inicio de sesión exitoso" },
                                },
                            },
                        },
                    },
                    400: { ...error, description: "Correo inexistente o contraseña incorrecta." },
                },
            },
        },
        "/api/auth/checkUser": {
            post: {
                tags: ["Auth"],
                summary: "Saber si el correo ya existe",
                requestBody: {
                    required: true,
                    content: { "application/json": { schema: { type: "object", required: ["email"], properties: { email: { type: "string" } } } } },
                },
                responses: {
                    200: { ...meta, description: "El correo existe. `message` es `Usuario encontrado`." },
                    404: { ...error, description: "El correo no existe." },
                },
            },
        },
        "/api/auth/changePassword": {
            post: {
                tags: ["Auth"],
                summary: "Cambiar la contraseña de esta sesión",
                description: "El correo del cuerpo tiene que ser el de la cuenta del token. No sirve para recuperar la clave desde afuera.",
                security: auth,
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                required: ["email", "password"],
                                properties: {
                                    email: { type: "string" },
                                    password: { type: "string", minLength: 5 },
                                },
                            },
                        },
                    },
                },
                responses: {
                    200: { ...meta, description: "`Contraseña cambiada exitosamente`." },
                    400: error,
                    401: { ...error, description: "Sin token o token vencido." },
                    403: { ...error, description: "El correo no es el de esta sesión." },
                },
            },
        },
        "/api/auth/logout/{id}": {
            post: {
                tags: ["Auth"],
                summary: "Cerrar sesión en el celular",
                description: "Borra el token de Firebase de esa cuenta. El JWT sigue válido hasta que venza. `id` tiene que ser el usuario del token.",
                security: auth,
                parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
                responses: {
                    200: { ...meta, description: "`Sesión Cerrada exitosamente`." },
                    401: error,
                    403: error,
                },
            },
        },
        "/api/batch/createBatch": {
            post: {
                tags: ["Lotes"],
                summary: "Crear un lote",
                description: "También crea la hoja de costos de ese lote, con todos los rubros en cero. `pigs` tiene que ser al menos 1.",
                security: auth,
                requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/LoteBody" } } } },
                responses: {
                    200: saved,
                    400: error,
                    401: error,
                    403: error,
                },
            },
        },
        "/api/batch/getBatchById/{user_id}": {
            get: {
                tags: ["Lotes"],
                summary: "Lotes de la granja",
                description: "Incluye activos y cerrados. `fase` llega como `{ id, nombre }`. Si la raza está en el catálogo, `raza` llega como `{ tiporaza: { id, nombre }, raza: { id, nombre } }`; si no, queda el texto guardado. Redis puede responder la misma lista durante una hora.",
                security: auth,
                parameters: [{ name: "user_id", in: "path", required: true, schema: { type: "integer" } }],
                responses: {
                    200: {
                        description: "Lista, o mensaje de que todavía no hay lotes si el arreglo viene vacío.",
                        content: {
                            "application/json": {
                                example: {
                                    batch: [{
                                        id_lote: 1,
                                        nombre_lote: "Lote norte",
                                        numero_cerdos_registrado: 20,
                                        numeros_cerdos_actuales: 17,
                                        peso_promedio: "12.50",
                                        mortalidad: "1.00",
                                        activo: true,
                                        fase: { id: 4, nombre: "Ceba" },
                                        raza: { tiporaza: { id: 1, nombre: "Materna" }, raza: { id: 1, nombre: "Landrace" } },
                                    }],
                                    meta: { status: 200, message: "Lote encontrado" },
                                },
                            },
                        },
                    },
                    401: error,
                    403: error,
                    404: error,
                },
            },
        },
        "/api/batch/editBatch/{batch_id}": {
            put: {
                tags: ["Lotes"],
                summary: "Corregir raza, peso o cantidad del lote",
                description: "Si se manda `number_of_pigs`, también hay que mandar `pig_registered` y `current_pig`: el servidor recalcula los actuales y rechaza un resultado negativo. `number_of_pigs` en 0 no se acepta.",
                security: auth,
                parameters: [{ name: "batch_id", in: "path", required: true, schema: { type: "integer" } }],
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    user_id: { type: "integer" },
                                    race: { type: "string" },
                                    average_weight: { type: "number" },
                                    number_of_pigs: { type: "integer", description: "Nueva cantidad registrada." },
                                    pig_registered: { type: "integer", description: "Registrados que tiene el lote hoy." },
                                    current_pig: { type: "integer", description: "Actuales que tiene el lote hoy." },
                                },
                            },
                        },
                    },
                },
                responses: { 200: meta, 400: error, 401: error, 403: error },
            },
        },
        "/api/feeding/createFeeding": {
            post: {
                tags: ["Alimentación"],
                summary: "Registrar un consumo",
                description: "Es un apunte: tipo, marca, kilos y costo por kilo. No se suma solo a `costos.alimentacion`.",
                security: auth,
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                required: ["batch_id", "feeding_type", "feeding_mark", "amount", "cost"],
                                properties: {
                                    user_id: { type: "integer" },
                                    batch_id: { type: "integer", example: 1 },
                                    feeding_type: { type: "string", example: "Finalizador" },
                                    feeding_mark: { type: "string", example: "Concentrado local" },
                                    amount: { type: "number", description: "Kilos.", example: 10 },
                                    cost: { type: "number", description: "Costo por kilo.", example: 2500 },
                                    client_id: { type: "string", format: "uuid" },
                                },
                            },
                        },
                    },
                },
                responses: { 200: saved, 400: error, 401: error, 403: error },
            },
        },
        "/api/feeding/getFeedingById/{user_id}": {
            get: {
                tags: ["Alimentación"],
                summary: "Consumos de la granja",
                description: "Cada fila trae las columnas de `alimentacion` más `nombre_lote`.",
                security: auth,
                parameters: [{ name: "user_id", in: "path", required: true, schema: { type: "integer" } }],
                responses: {
                    200: {
                        description: "Lista en `feeding`.",
                        content: {
                            "application/json": {
                                example: {
                                    feeding: [{
                                        id_alimentacion: 1,
                                        id_lote: 1,
                                        nombre_lote: "Lote norte",
                                        tipo_alimento: "Finalizador",
                                        marca_alimento: "Concentrado local",
                                        cantidad_kg: "10.00",
                                        costo_unitario: "2500.00",
                                        fecha_creacion: "2026-11-13T20:00:00.000Z",
                                    }],
                                    meta: { status: 200, message: "Alimentación encontrada" },
                                },
                            },
                        },
                    },
                    404: { ...error, description: "Todavía no hay consumos." },
                    401: error,
                    403: error,
                },
            },
        },
        "/api/feeding/editFeeding/{feeding_id}": {
            put: {
                tags: ["Alimentación"],
                summary: "Corregir un consumo",
                security: auth,
                parameters: [{ name: "feeding_id", in: "path", required: true, schema: { type: "integer" } }],
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                required: ["batch_id", "feeding_type", "feeding_mark", "amount", "cost"],
                                properties: {
                                    batch_id: { type: "integer" },
                                    feeding_type: { type: "string" },
                                    feeding_mark: { type: "string" },
                                    amount: { type: "number" },
                                    cost: { type: "number" },
                                },
                            },
                        },
                    },
                },
                responses: { 200: meta, 400: error, 401: error, 403: error },
            },
        },
        "/api/health/createHealth": {
            post: {
                tags: ["Sanidad"],
                summary: "Registrar enfermedad y tratamiento",
                security: auth,
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                required: ["batch_id", "disease", "treatment"],
                                properties: {
                                    user_id: { type: "integer" },
                                    batch_id: { type: "integer", example: 1 },
                                    disease: { type: "string", example: "Diarrea" },
                                    treatment: { type: "string", example: "Suero oral" },
                                    client_id: { type: "string", format: "uuid" },
                                },
                            },
                        },
                    },
                },
                responses: { 200: saved, 400: error, 401: error, 403: error },
            },
        },
        "/api/health/getHealthById/{user_id}": {
            get: {
                tags: ["Sanidad"],
                summary: "Tratamientos de la granja",
                security: auth,
                parameters: [{ name: "user_id", in: "path", required: true, schema: { type: "integer" } }],
                responses: {
                    200: {
                        description: "Lista en `health`.",
                        content: {
                            "application/json": {
                                example: {
                                    health: [{
                                        id_tratamiento: 1,
                                        id_lote: 1,
                                        enfermedad: "Diarrea",
                                        tratamiento: "Suero oral",
                                        fecha_creacion: "2026-11-13T20:00:00.000Z",
                                    }],
                                    meta: { status: 200, message: "Salud encontrada" },
                                },
                            },
                        },
                    },
                    404: { ...error, description: "Todavía no hay tratamientos." },
                    401: error,
                    403: error,
                },
            },
        },
        "/api/health/editHealth/{health_id}": {
            put: {
                tags: ["Sanidad"],
                summary: "Corregir un tratamiento",
                security: auth,
                parameters: [{ name: "health_id", in: "path", required: true, schema: { type: "integer" } }],
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                required: ["batch_id", "disease", "treatment"],
                                properties: {
                                    batch_id: { type: "integer" },
                                    disease: { type: "string" },
                                    treatment: { type: "string" },
                                },
                            },
                        },
                    },
                },
                responses: { 200: meta, 400: error, 401: error, 403: error },
            },
        },
        "/api/health/deleteHealth/{health_id}": {
            delete: {
                tags: ["Sanidad"],
                summary: "Borrar un tratamiento",
                description: "Borrado lógico: la fila queda con `deleted_at` y la sincronización todavía la puede ver.",
                security: auth,
                parameters: [{ name: "health_id", in: "path", required: true, schema: { type: "integer" } }],
                responses: { 200: meta, 400: error, 401: error, 403: error },
            },
        },
        "/api/finance/getCostById/{user_id}": {
            get: {
                tags: ["Finanzas"],
                summary: "Hojas de costos de la granja",
                description: "Hay una por lote, creada junto con el lote. Los rubros se editan a mano.",
                security: auth,
                parameters: [{ name: "user_id", in: "path", required: true, schema: { type: "integer" } }],
                responses: {
                    200: {
                        description: "Lista en `cost`.",
                        content: {
                            "application/json": {
                                example: {
                                    cost: [{
                                        id_costo: 1,
                                        id_lote: 1,
                                        compra_cerdos: "800000.00",
                                        alimentacion: "0.00",
                                        medicamentos: "0.00",
                                        mano_obra: "0.00",
                                        transporte: "0.00",
                                        otros: "0.00",
                                    }],
                                    meta: { status: 200, message: "Costo encontrado" },
                                },
                            },
                        },
                    },
                    404: { ...error, description: "Todavía no hay costos." },
                    401: error,
                    403: error,
                },
            },
        },
        "/api/finance/editCost/{cost_id}": {
            put: {
                tags: ["Finanzas"],
                summary: "Editar la hoja de costos",
                description: "Reemplaza los seis rubros. El HTTP es 200. El `status` de adentro del JSON queda en 201.",
                security: auth,
                parameters: [{ name: "cost_id", in: "path", required: true, schema: { type: "integer" } }],
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                required: ["batch_id", "purchase_pigs", "feeding", "medicine", "handwork", "transport", "other"],
                                properties: {
                                    user_id: { type: "integer" },
                                    batch_id: { type: "integer", example: 1 },
                                    purchase_pigs: { type: "number", example: 800000 },
                                    feeding: { type: "number", example: 0 },
                                    medicine: { type: "number", example: 0 },
                                    handwork: { type: "number", example: 0 },
                                    transport: { type: "number", example: 0 },
                                    other: { type: "number", example: 0 },
                                },
                            },
                        },
                    },
                },
                responses: { 200: meta, 400: error, 401: error, 403: error },
            },
        },
        "/api/finance/createSales": {
            post: {
                tags: ["Finanzas"],
                summary: "Registrar una venta",
                description: "El valor es cerdos × peso promedio × precio por kilo. Resta `pig_sold` de los cerdos actuales. Si no alcanzan, no se guarda. Si el lote queda en cero, se cierra.",
                security: auth,
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                required: ["batch_id", "pig_sold", "average_weight", "price_kg"],
                                properties: {
                                    user_id: { type: "integer" },
                                    batch_id: { type: "integer", example: 1 },
                                    pig_sold: { type: "integer", minimum: 1, example: 2 },
                                    average_weight: { type: "number", example: 80 },
                                    price_kg: { type: "number", example: 9000 },
                                    client_id: { type: "string", format: "uuid" },
                                },
                            },
                        },
                    },
                },
                responses: {
                    201: saved,
                    400: { ...error, description: "Por ejemplo `Cerdos insuficientes para vender esa cantidad`." },
                    401: error,
                    403: error,
                },
            },
        },
        "/api/finance/getSalesById/{user_id}": {
            get: {
                tags: ["Finanzas"],
                summary: "Ventas de la granja",
                security: auth,
                parameters: [{ name: "user_id", in: "path", required: true, schema: { type: "integer" } }],
                responses: {
                    200: {
                        description: "Lista en `sales`.",
                        content: {
                            "application/json": {
                                example: {
                                    sales: [{
                                        id_venta: 1,
                                        id_lote: 1,
                                        cerdos_vendidos: 2,
                                        peso_promedio: "80.00",
                                        precio_kg: "9000.00",
                                        fecha_creacion: "2026-11-13T20:00:00.000Z",
                                    }],
                                    meta: { status: 200, message: "venta encontrado" },
                                },
                            },
                        },
                    },
                    404: { ...error, description: "Todavía no hay ventas." },
                    401: error,
                    403: error,
                },
            },
        },
        "/api/finance/deleteSales/{sales_id}": {
            delete: {
                tags: ["Finanzas"],
                summary: "Borrar una venta",
                description: "Borrado lógico. Los cerdos del lote se recalculan: registrados menos muertes de pesajes vivos menos cerdos de ventas vivas.",
                security: auth,
                parameters: [{ name: "sales_id", in: "path", required: true, schema: { type: "integer" } }],
                responses: { 200: meta, 400: error, 401: error, 403: error },
            },
        },
        "/api/progress/createProgress": {
            post: {
                tags: ["Progreso"],
                summary: "Registrar un pesaje",
                description: "`mortality` son las muertes de este pesaje y se restan de los cerdos actuales. `phase` puede mover el lote de fase. Si las muertes dejan el lote en cero, se cierra. `mortality` puede ser 0.",
                security: auth,
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                required: ["batch_id", "date_weight", "weekly_average_weight", "mortality", "phase"],
                                properties: {
                                    user_id: { type: "integer" },
                                    batch_id: { type: "integer", example: 1 },
                                    date_weight: { type: "string", format: "date", example: "2026-11-13" },
                                    weekly_average_weight: { type: "number", example: 14 },
                                    mortality: { type: "number", example: 1 },
                                    phase: { type: "integer", example: 4 },
                                    client_id: { type: "string", format: "uuid" },
                                },
                            },
                        },
                    },
                },
                responses: { 200: saved, 400: error, 401: error, 403: error },
            },
        },
        "/api/progress/getProgressById/{user_id}": {
            get: {
                tags: ["Progreso"],
                summary: "Pesajes agrupados por lote",
                description: "`phase` dentro de cada `record` es el id de la fase, no el nombre.",
                security: auth,
                parameters: [{ name: "user_id", in: "path", required: true, schema: { type: "integer" } }],
                responses: {
                    200: {
                        description: "Lista en `progress`.",
                        content: {
                            "application/json": {
                                example: {
                                    progress: [{
                                        batch_id: 1,
                                        mortality: 1,
                                        record: [{
                                            progress_id: 1,
                                            date_weight: "2026-11-13",
                                            weekly_average_weight: "14.00",
                                            phase: 4,
                                        }],
                                    }],
                                    meta: { status: 200, message: "Progresos encontrados" },
                                },
                            },
                        },
                    },
                    404: { ...error, description: "Todavía no hay pesajes." },
                    401: error,
                    403: error,
                },
            },
        },
        "/api/progress/editProgress/{progress_id}": {
            put: {
                tags: ["Progreso"],
                summary: "Corregir un pesaje",
                description: "Vuelve a aplicar la mortalidad y la fase sobre el lote.",
                security: auth,
                parameters: [{ name: "progress_id", in: "path", required: true, schema: { type: "integer" } }],
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                required: ["batch_id", "date_weight", "weekly_average_weight", "mortality", "phase"],
                                properties: {
                                    batch_id: { type: "integer" },
                                    date_weight: { type: "string" },
                                    weekly_average_weight: { type: "number" },
                                    mortality: { type: "number" },
                                    phase: { type: "integer" },
                                },
                            },
                        },
                    },
                },
                responses: { 200: meta, 400: error, 401: error, 403: error },
            },
        },
        "/api/agenda": {
            post: {
                tags: ["Agenda"],
                summary: "Crear un evento",
                description: "A medianoche, si el evento es de ese día y Firebase está configurado, se manda el push al dispositivo de la cuenta y el evento queda marcado como avisado.",
                security: auth,
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                required: ["title", "description", "event_date"],
                                properties: {
                                    user_id: { type: "integer" },
                                    title: { type: "string", example: "Vacuna" },
                                    description: { type: "string", example: "Vacunar el lote norte" },
                                    event_date: { type: "string", example: "2026-11-14T08:00:00" },
                                    client_id: { type: "string", format: "uuid" },
                                },
                            },
                        },
                    },
                },
                responses: { 200: saved, 400: error, 401: error, 403: error },
            },
        },
        "/api/agenda/{user_id}": {
            get: {
                tags: ["Agenda"],
                summary: "Eventos de la granja",
                security: auth,
                parameters: [{ name: "user_id", in: "path", required: true, schema: { type: "integer" } }],
                responses: {
                    200: {
                        description: "Lista en `agenda`, con columnas `id_agenda`, `titulo`, `descripcion`, `fecha_evento`, `estado`.",
                        content: { "application/json": { schema: { type: "object", additionalProperties: true } } },
                    },
                    404: { ...error, description: "Todavía no hay eventos." },
                    401: error,
                    403: error,
                },
            },
        },
        "/api/home/{user_id}": {
            get: {
                tags: ["Inicio"],
                summary: "Resumen de la granja",
                description: "Lotes activos, suma de costos, suma de ventas (cerdos × peso × precio) y utilidad (ventas menos costos). `batchsByPhase` agrupa los lotes activos por el nombre de la fase. El nombre del campo es `batchs`, con esa escritura. Si no hay lotes, igual responde 200 con ceros.",
                security: auth,
                parameters: [{ name: "user_id", in: "path", required: true, schema: { type: "integer" } }],
                responses: {
                    200: {
                        description: "Resumen",
                        content: {
                            "application/json": {
                                example: {
                                    batchsActive: 1,
                                    totalCosts: 800000,
                                    totalSales: 1440000,
                                    profit: 640000,
                                    batchsByPhase: [{ phase: "Ceba", batchs: 1 }],
                                    meta: { status: 200, message: "Datos de inicio" },
                                },
                            },
                        },
                    },
                    401: error,
                    403: error,
                    404: error,
                },
            },
        },
        "/api/list/getPhaseList": {
            get: {
                tags: ["Catálogos"],
                summary: "Fases",
                description: "En el esquema local: 1 Lactancia, 2 Precebo, 3 Levante, 4 Ceba.",
                security: auth,
                responses: {
                    200: {
                        description: "Lista en `phaseList`. Cada item tiene `id_fase` y `nombre_fase`.",
                        content: { "application/json": { schema: { type: "object", additionalProperties: true } } },
                    },
                    401: error,
                    404: error,
                },
            },
        },
        "/api/list/getRaceTypeList": {
            get: {
                tags: ["Catálogos"],
                summary: "Tipos de raza",
                description: "Materna y paterna. El `id` de cada tipo se usa para pedir sus razas.",
                security: auth,
                responses: { 200: { description: "Lista en `raceType`.", content: { "application/json": { schema: { type: "object", additionalProperties: true } } } }, 401: error, 404: error },
            },
        },
        "/api/list/getRaceList/{race_type_id}": {
            get: {
                tags: ["Catálogos"],
                summary: "Razas de un tipo",
                description: "Materna: Landrace y Yorkshire. Paterna: Duroc y Pietrain. Al crear el lote se manda `nombre_raza`.",
                security: auth,
                parameters: [{ name: "race_type_id", in: "path", required: true, schema: { type: "integer" } }],
                responses: { 200: { description: "Lista en `race`, con `id` y `nombre_raza`.", content: { "application/json": { schema: { type: "object", additionalProperties: true } } } }, 401: error, 404: error },
            },
        },
        "/api/list/getFeedingTypeList": {
            get: {
                tags: ["Catálogos"],
                summary: "Tipos de alimento",
                security: auth,
                responses: { 200: { description: "Lista en `feedingType`, con `id` y `nombre`.", content: { "application/json": { schema: { type: "object", additionalProperties: true } } } }, 401: error, 404: error },
            },
        },
        "/api/list/getFeedingMarkList/{feeding_type_id}": {
            get: {
                tags: ["Catálogos"],
                summary: "Marcas de un tipo de alimento",
                description: "En el esquema local solo Finalizador tiene marca: Concentrado local. Un tipo sin marcas devuelve `feedingMark` vacío y la marca se puede escribir a mano.",
                security: auth,
                parameters: [{ name: "feeding_type_id", in: "path", required: true, schema: { type: "integer" } }],
                responses: { 200: { description: "Lista en `feedingMark`, con `id` y `nombre_marca`.", content: { "application/json": { schema: { type: "object", additionalProperties: true } } } }, 401: error, 404: error },
            },
        },
        "/api/list/getDiseaseList": {
            get: {
                tags: ["Catálogos"],
                summary: "Enfermedades",
                description: "En el esquema local: Diarrea y Problemas respiratorios. El tratamiento se escribe libre.",
                security: auth,
                responses: { 200: { description: "Lista en `disease`, con `id` y `nombre`.", content: { "application/json": { schema: { type: "object", additionalProperties: true } } } }, 401: error, 404: error },
            },
        },
        "/api/sync/push": {
            post: {
                tags: ["Sync"],
                summary: "Subir una tanda de la cola",
                description: [
                    "Hasta 20 cambios. Cada uno se aplica solo. La respuesta es 200 aunque alguno quede en conflicto.",
                    "",
                    "El pedido entero responde 400 solo si `changes` no es una lista o trae más de 20.",
                    "",
                    "`data` usa los mismos nombres que el POST de esa ruta. El lote hijo puede ir en `batch_id` o en `batch_client_id`.",
                    "",
                    "El costo no se crea por aquí: nace con el lote. `costo` + `crear` devuelve el costo que ya existe. Para cambiarlo, `editar` con `purchase_pigs`, `feeding`, `medicine`, `handwork`, `transport` y `other`.",
                    "",
                    "Repetir un `client_id` de una creación no vuelve a restar cerdos. Editar o borrar un pesaje o una venta recalcula el lote. Si quedaría negativo, ese ítem vuelve como `conflicto` y no se toca.",
                ].join("\n"),
                security: auth,
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: { $ref: "#/components/schemas/SyncPush" },
                            example: {
                                changes: [
                                    {
                                        client_id: "11111111-1111-4111-8111-111111111111",
                                        type: "lote",
                                        action: "crear",
                                        data: {
                                            batch_name: "Lote norte",
                                            pigs: 10,
                                            race: "Landrace",
                                            average_weight: 20,
                                            phase: 4,
                                            cost_client_id: "22222222-2222-4222-8222-222222222222",
                                        },
                                    },
                                    {
                                        client_id: "33333333-3333-4333-8333-333333333333",
                                        type: "venta",
                                        action: "crear",
                                        data: { batch_client_id: "11111111-1111-4111-8111-111111111111", pig_sold: 2, average_weight: 80, price_kg: 9000 },
                                    },
                                ],
                            },
                        },
                    },
                },
                responses: {
                    200: {
                        description: "Un resultado por cambio, en el mismo orden.",
                        content: {
                            "application/json": {
                                example: {
                                    results: [
                                        { client_id: "11111111-1111-4111-8111-111111111111", type: "lote", action: "crear", status: "guardado", record: { id_lote: 1 } },
                                        { client_id: "33333333-3333-4333-8333-333333333333", type: "venta", action: "crear", status: "conflicto", message: "Cerdos insuficientes para vender esa cantidad" },
                                    ],
                                },
                            },
                        },
                    },
                    400: error,
                    401: error,
                },
            },
        },
        "/api/sync/pull": {
            get: {
                tags: ["Sync"],
                summary: "Bajar lo que cambió desde la última marca",
                description: "Sin `since`, baja todo lo de esa cuenta. Con `since`, solo filas con `updated_at` mayor que esa marca y menor o igual que `cursor`. Incluye filas borradas (`deleted_at` con fecha) para que el teléfono las quite. Las columnas son las de la base, en español, más `client_id`, `updated_at` y `deleted_at`. Guarda `cursor` y úsalo como el próximo `since`.",
                security: auth,
                parameters: [{
                    name: "since",
                    in: "query",
                    required: false,
                    schema: { type: "string", format: "date-time" },
                    description: "Marca ISO, normalmente el `cursor` de la descarga anterior.",
                }],
                responses: {
                    200: {
                        description: "Foto o delta de la cuenta.",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        cursor: { type: "string", format: "date-time" },
                                        lotes: { type: "array", items: { type: "object", additionalProperties: true } },
                                        alimentacion: { type: "array", items: { type: "object", additionalProperties: true } },
                                        sanidad: { type: "array", items: { type: "object", additionalProperties: true } },
                                        pesajes: { type: "array", items: { type: "object", additionalProperties: true } },
                                        ventas: { type: "array", items: { type: "object", additionalProperties: true } },
                                        costos: { type: "array", items: { type: "object", additionalProperties: true } },
                                        agenda: { type: "array", items: { type: "object", additionalProperties: true } },
                                    },
                                },
                            },
                        },
                    },
                    400: { ...error, description: "`since` no es una fecha válida." },
                    401: error,
                },
            },
        },
        "/api/admin/overview": {
            get: {
                tags: ["Admin"],
                summary: "Tablero de todas las granjas",
                description: "Solo `superadmin`. No incluye la cuenta del super admin. La utilidad es ventas menos costos. `ventasPorMes` agrupa por `YYYY-MM`.",
                security: auth,
                responses: {
                    200: {
                        description: "Totales, gráficas y la tabla de granjas.",
                        content: {
                            "application/json": {
                                example: {
                                    usuarios: 1,
                                    lotesActivos: 1,
                                    cerdos: 17,
                                    costos: 800000,
                                    ventas: 1440000,
                                    utilidad: 640000,
                                    lotesPorFase: [{ fase: "Ceba", lotes: 1 }],
                                    utilidadPorUsuario: [{ nombre: "Granja norte", utilidad: 640000 }],
                                    ventasPorMes: [{ mes: "2026-11", total: 1440000 }],
                                    granjas: [{
                                        id: 2,
                                        nombre: "Granja norte",
                                        correo: "granja@example.com",
                                        telefono: "3001234567",
                                        rol: "usuario",
                                        lotesActivos: 1,
                                        cerdos: 17,
                                        costos: 800000,
                                        ventas: 1440000,
                                        utilidad: 640000,
                                    }],
                                },
                            },
                        },
                    },
                    401: error,
                    403: { ...error, description: "Solo el super admin puede ver este panel." },
                },
            },
        },
        "/api/admin/users/{id}": {
            get: {
                tags: ["Admin"],
                summary: "Manejo de una granja",
                description: "Usuario, resumen, lotes por fase y las listas de lotes, alimentación, sanidad, costos, ventas, progreso y agenda. Las ventas traen `valor` calculado.",
                security: auth,
                parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
                responses: {
                    200: { description: "Detalle de esa cuenta.", content: { "application/json": { schema: { type: "object", additionalProperties: true } } } },
                    401: error,
                    403: error,
                    404: { ...error, description: "No existe el usuario." },
                },
            },
        },
        "/api/admin/users": {
            post: {
                tags: ["Admin"],
                summary: "Abrir la cuenta de una granja",
                description: "La crea como `usuario`. El cuerpo es el mismo del registro.",
                security: auth,
                requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/RegisterBody" } } } },
                responses: {
                    201: {
                        description: "Granja creada",
                        content: {
                            "application/json": {
                                example: {
                                    status: 201,
                                    message: "Granja creada",
                                    user: { id_usuario: 3, correo: "otra@example.com", rol: "usuario" },
                                },
                            },
                        },
                    },
                    400: error,
                    401: error,
                    403: error,
                },
            },
        },
        "/api/push/test": {
            post: {
                tags: ["Push"],
                summary: "Mandar un aviso de prueba",
                description: "Usa el token de Firebase guardado en el último login de esta cuenta. Si no hay `firebase.json`, responde 503.",
                security: auth,
                responses: {
                    200: { ...meta, description: "Notificación enviada." },
                    400: { ...error, description: "Esta cuenta no tiene un dispositivo registrado." },
                    401: error,
                    503: { ...error, description: "Firebase no está configurado." },
                    500: error,
                },
            },
        },
    },
};
