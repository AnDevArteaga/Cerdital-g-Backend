import pool from "../config/db";
import { ForbiddenError } from "../errors";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const clientTables = {
    lotes: "lotes",
    alimentacion: "alimentacion",
    salud_tratamiento: "salud_tratamiento",
    ventas: "ventas",
    progreso: "progreso",
    costos: "costos",
    agenda: "agenda",
} as const;

export type ClientTable = keyof typeof clientTables;

export function optionalClientId(value: unknown): string | null {
    if (value === undefined || value === null || value === "") return null;
    if (typeof value !== "string" || !UUID.test(value)) {
        throw new Error("El id no es válido");
    }
    return value;
}

export function requiredClientId(value: unknown): string {
    const id = optionalClientId(value);
    if (!id) throw new Error("Falta el id del registro");
    return id;
}

export async function findClient(table: ClientTable, clientId: string, userId: number) {
    const { rows } = await pool.query(
        `SELECT * FROM ${clientTables[table]} WHERE client_id = $1`,
        [clientId],
    );
    const row = rows[0];
    if (!row) return null;
    if (Number(row.id_usuario) !== Number(userId)) throw new ForbiddenError();
    if (row.deleted_at) throw new Error("El registro fue borrado");
    return row;
}
