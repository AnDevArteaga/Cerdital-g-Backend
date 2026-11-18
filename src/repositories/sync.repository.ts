import { PoolClient } from "pg";
import pool from "../config/db";

const pullTables = {
    lotes: "lotes",
    alimentacion: "alimentacion",
    sanidad: "salud_tratamiento",
    pesajes: "progreso",
    ventas: "ventas",
    costos: "costos",
    agenda: "agenda",
} as const;

export async function pullRows(userId: number, since: Date | null) {
    const cursorQuery = await pool.query("SELECT now() AS cursor");
    const cursor = cursorQuery.rows[0].cursor as Date;
    const load = async (table: string) => {
        const { rows } = await pool.query(
            `SELECT * FROM ${table}
             WHERE id_usuario = $1
               AND updated_at <= $2
               AND ($3::timestamptz IS NULL OR updated_at > $3)
             ORDER BY updated_at ASC`,
            [userId, cursor, since],
        );
        return rows;
    };

    return {
        cursor,
        lotes: await load(pullTables.lotes),
        alimentacion: await load(pullTables.alimentacion),
        sanidad: await load(pullTables.sanidad),
        pesajes: await load(pullTables.pesajes),
        ventas: await load(pullTables.ventas),
        costos: await load(pullTables.costos),
        agenda: await load(pullTables.agenda),
    };
}

export async function updateLote(
    client: PoolClient,
    clientId: string,
    userId: number,
    name: string | null,
    race: string | null,
    weight: number | null,
    phase: number | null,
) {
    const { rows } = await client.query(
        `UPDATE lotes
         SET nombre_lote = COALESCE($3, nombre_lote),
             raza = COALESCE($4, raza),
             peso_promedio = COALESCE($5, peso_promedio),
             fase = COALESCE($6, fase),
             updated_at = now()
         WHERE client_id = $1 AND id_usuario = $2 AND deleted_at IS NULL
         RETURNING *`,
        [clientId, userId, name, race, weight, phase],
    );
    return rows[0] ?? null;
}

export async function updateFeedingRow(
    client: PoolClient,
    clientId: string,
    userId: number,
    feedingType: string,
    feedingMark: string,
    amount: number,
    cost: number,
) {
    const { rows } = await client.query(
        `UPDATE alimentacion
         SET tipo_alimento = $3,
             marca_alimento = $4,
             cantidad_kg = $5,
             costo_unitario = $6,
             updated_at = now()
         WHERE client_id = $1 AND id_usuario = $2 AND deleted_at IS NULL
         RETURNING *`,
        [clientId, userId, feedingType, feedingMark, amount, cost],
    );
    return rows[0] ?? null;
}

export async function updateHealthRow(
    client: PoolClient,
    clientId: string,
    userId: number,
    disease: string,
    treatment: string,
) {
    const { rows } = await client.query(
        `UPDATE salud_tratamiento
         SET enfermedad = $3, tratamiento = $4, updated_at = now()
         WHERE client_id = $1 AND id_usuario = $2 AND deleted_at IS NULL
         RETURNING *`,
        [clientId, userId, disease, treatment],
    );
    return rows[0] ?? null;
}

export async function updateAgendaRow(
    client: PoolClient,
    clientId: string,
    userId: number,
    title: string | null,
    description: string | null,
    eventDate: string | null,
) {
    const { rows } = await client.query(
        `UPDATE agenda
         SET titulo = COALESCE($3, titulo),
             descripcion = COALESCE($4, descripcion),
             fecha_evento = COALESCE($5, fecha_evento),
             updated_at = now()
         WHERE client_id = $1 AND id_usuario = $2 AND deleted_at IS NULL
         RETURNING *`,
        [clientId, userId, title, description, eventDate],
    );
    return rows[0] ?? null;
}

export async function updateSaleRow(
    client: PoolClient,
    clientId: string,
    userId: number,
    pigs: number,
    weight: number,
    price: number,
) {
    const { rows } = await client.query(
        `UPDATE ventas
         SET cerdos_vendidos = $3,
             peso_promedio = $4,
             precio_kg = $5,
             updated_at = now()
         WHERE client_id = $1 AND id_usuario = $2 AND deleted_at IS NULL
         RETURNING *`,
        [clientId, userId, pigs, weight, price],
    );
    return rows[0] ?? null;
}

export async function updateProgressRow(
    client: PoolClient,
    clientId: string,
    userId: number,
    dateWeight: string,
    weight: number,
    mortality: number,
    phase: number,
) {
    const { rows } = await client.query(
        `UPDATE progreso
         SET fecha_pesaje = $3,
             record_peso_promedio = $4,
             mortalidad = $5,
             fase = $6,
             updated_at = now()
         WHERE client_id = $1 AND id_usuario = $2 AND deleted_at IS NULL
         RETURNING *`,
        [clientId, userId, dateWeight, weight, mortality, phase],
    );
    return rows[0] ?? null;
}

const clientTables = {
    lotes: "lotes",
    alimentacion: "alimentacion",
    salud_tratamiento: "salud_tratamiento",
    ventas: "ventas",
    progreso: "progreso",
    costos: "costos",
    agenda: "agenda",
} as const;

export type SyncTable = keyof typeof clientTables;

export async function softDeleteClient(
    client: PoolClient,
    table: SyncTable,
    clientId: string,
    userId: number,
) {
    const { rows } = await client.query(
        `UPDATE ${clientTables[table]}
         SET deleted_at = now(), updated_at = now()
         WHERE client_id = $1 AND id_usuario = $2 AND deleted_at IS NULL
         RETURNING *`,
        [clientId, userId],
    );
    return rows[0] ?? null;
}

export async function readClient(client: PoolClient, table: SyncTable, clientId: string) {
    const { rows } = await client.query(
        `SELECT * FROM ${clientTables[table]} WHERE client_id = $1`,
        [clientId],
    );
    return rows[0] ?? null;
}

export async function softDeleteLote(client: PoolClient, batchId: number, userId: number) {
    const tables = ["alimentacion", "salud_tratamiento", "ventas", "progreso", "costos"];
    for (const table of tables) {
        await client.query(
            `UPDATE ${table}
             SET deleted_at = now(), updated_at = now()
             WHERE id_lote = $1 AND deleted_at IS NULL`,
            [batchId],
        );
    }
    const { rows } = await client.query(
        `UPDATE lotes
         SET deleted_at = now(), updated_at = now()
         WHERE id_lote = $1 AND id_usuario = $2 AND deleted_at IS NULL
         RETURNING *`,
        [batchId, userId],
    );
    return rows[0] ?? null;
}
