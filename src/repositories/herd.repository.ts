import { PoolClient } from "pg";
import pool from "../config/db";

export async function withTransaction<T>(work: (client: PoolClient) => Promise<T>): Promise<T> {
    const client = await pool.connect();
    try {
        await client.query("BEGIN");
        const result = await work(client);
        await client.query("COMMIT");
        return result;
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
}

const byId = {
    venta: { table: "ventas", column: "id_venta" },
    progreso: { table: "progreso", column: "id_progreso" },
    salud: { table: "salud_tratamiento", column: "id_tratamiento" },
    alimentacion: { table: "alimentacion", column: "id_alimentacion" },
    agenda: { table: "agenda", column: "id_agenda" },
    costo: { table: "costos", column: "id_costo" },
    lote: { table: "lotes", column: "id_lote" },
} as const;

export type RowKind = keyof typeof byId;

export async function softDeleteById(client: PoolClient, kind: RowKind, id: number) {
    const target = byId[kind];
    const { rows } = await client.query(
        `UPDATE ${target.table}
         SET deleted_at = now(), updated_at = now()
         WHERE ${target.column} = $1 AND deleted_at IS NULL
         RETURNING *`,
        [id],
    );
    return rows[0] ?? null;
}

export async function recomputeHerd(
    client: PoolClient,
    batchId: number,
    phase: number | undefined,
    conflictMessage: string,
) {
    const lote = await client.query(
        `SELECT numero_cerdos_registrado
         FROM lotes
         WHERE id_lote = $1 AND deleted_at IS NULL
         FOR UPDATE`,
        [batchId],
    );
    if (!lote.rows[0]) throw new Error("No existe el lote");

    const deaths = await client.query(
        `SELECT COALESCE(SUM(mortalidad), 0) AS total
         FROM progreso
         WHERE id_lote = $1 AND deleted_at IS NULL`,
        [batchId],
    );
    const sold = await client.query(
        `SELECT COALESCE(SUM(cerdos_vendidos), 0) AS total
         FROM ventas
         WHERE id_lote = $1 AND deleted_at IS NULL`,
        [batchId],
    );
    const next = Number(lote.rows[0].numero_cerdos_registrado)
        - Number(deaths.rows[0].total)
        - Number(sold.rows[0].total);
    if (next < 0) throw new Error(conflictMessage);

    const updated = await client.query(
        `UPDATE lotes
         SET numeros_cerdos_actuales = $2,
             mortalidad = $3,
             activo = $4,
             fase = COALESCE($5, fase),
             updated_at = now()
         WHERE id_lote = $1
         RETURNING *`,
        [batchId, next, Number(deaths.rows[0].total), next > 0, phase ?? null],
    );
    return updated.rows[0];
}
