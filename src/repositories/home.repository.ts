import pool from "../config/db";

// Obtener lotes activos de un usuario
export const getLotesActive = async (user_id: number) => {
    const { rows } = await pool.query(
        "SELECT * FROM lotes WHERE id_usuario = $1 AND activo = true AND deleted_at IS NULL",
        [user_id],
    );
    return rows;
};


