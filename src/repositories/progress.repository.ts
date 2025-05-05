import pool from "../config/db";

//Obtener progreso por id de usuario
export const getProgressById = async (user_id: number) => {
    const { rows } = await pool.query(
        "SELECT * FROM progreso WHERE id_usuario = $1",
        [user_id],
    );
    return rows;
};

//Crear progreso de un usuario
export const createProgress = async (
    batch_id: number,
    date_weight: string,
    weekly_average_weight: number,
    mortality: number,
    user_id: number,
    phase: number
) => {
    const { rows } = await pool.query(
        "INSERT INTO progreso (id_lote, fecha_pesaje, record_peso_promedio, mortalidad, id_usuario, fase) VALUES ($1, $2, $3, $4, $5, $6)",
        [
            batch_id,
            date_weight,
            weekly_average_weight,
            mortality,
            user_id,
            phase
        ],
    );
    return rows[0];
};

//elminar progreso por id de progreso
export const deleteProgress = async (progress_id: number) => {
    const { rowCount } = await pool.query(
        "DELETE FROM progreso WHERE id_progreso = $1",
        [progress_id],
    );
    return rowCount;
};

//actualizar progreso de un lote
export const updateProgress = async (
    progress_id: number,
    batch_id: number,
    date_weight: string,
    weekly_average_weight: number,
    mortality: number,
    phase: number

) => {
    const { rowCount } = await pool.query(
        "UPDATE progreso SET id_lote = $1, fecha_pesaje = $2, record_peso_promedio = $3, mortalidad = $4, fase = $5 WHERE id_progreso = $6",
        [
            batch_id,
            date_weight,
            weekly_average_weight,
            mortality,
            phase,
            progress_id
            
        ],
    );
    return rowCount;
};