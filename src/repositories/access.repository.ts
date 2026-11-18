import pool from "../config/db";
import { ForbiddenError } from "../errors";

type Kind = "lote" | "alimentacion" | "salud" | "costo" | "venta" | "progreso";

const sql: Record<Kind, string> = {
    lote: "SELECT id_usuario FROM lotes WHERE id_lote = $1 AND deleted_at IS NULL",
    alimentacion: "SELECT id_usuario FROM alimentacion WHERE id_alimentacion = $1 AND deleted_at IS NULL",
    salud: "SELECT id_usuario FROM salud_tratamiento WHERE id_tratamiento = $1 AND deleted_at IS NULL",
    costo: "SELECT id_usuario FROM costos WHERE id_costo = $1 AND deleted_at IS NULL",
    venta: "SELECT id_usuario FROM ventas WHERE id_venta = $1 AND deleted_at IS NULL",
    progreso: "SELECT id_usuario FROM progreso WHERE id_progreso = $1 AND deleted_at IS NULL",
};

export async function assertOwner(kind: Kind, id: number, userId: number) {
    const { rows } = await pool.query(sql[kind], [id]);
    if (rows.length < 1) {
        throw new Error(kind === "lote" ? "No existe el lote" : "No existe el registro");
    }
    if (Number(rows[0].id_usuario) !== Number(userId)) {
        throw new ForbiddenError();
    }
}
