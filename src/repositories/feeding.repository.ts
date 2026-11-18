import pool from "../config/db";

//Obtener alimentacion por id de usuario
export const getFeedingById = async (user_id: number) => {
    const { rows } = await pool.query(
        "SELECT * FROM alimentacion WHERE id_usuario = $1 AND deleted_at IS NULL",
        [user_id],
    );
    return rows;
};

//Crear alimentacion de un usuario
export const createFeeding = async (
    batch_id: number,
    feeding_type: string,
    feeding_mark: string,
    amount: number,
    cost: number,
    user_id: number,
    clientId: string | null = null,
) => {
    const date = new Date();
    const { rows } = await pool.query(
        `INSERT INTO alimentacion (id_lote, tipo_alimento, marca_alimento, cantidad_kg, costo_unitario, fecha_creacion, id_usuario, client_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7, COALESCE($8::uuid, gen_random_uuid()))
         ON CONFLICT (client_id) DO NOTHING
         RETURNING *`,
        [
            batch_id,
            feeding_type,
            feeding_mark,
            amount,
            cost,
            date,
            user_id,
            clientId,
        ],
    );
    return rows[0];
};

//elminar alimentacion por id de alimentacion
export const deleteFeeding = async (feeding_id: number) => {
    const { rowCount } = await pool.query(
        "UPDATE alimentacion SET deleted_at = now(), updated_at = now() WHERE id_alimentacion = $1 AND deleted_at IS NULL",
        [feeding_id],
    );
    return rowCount;
};

//editar alimentacion por id de alimentacion
export const updatedFeeding = async (
    feeding_id: number,
    feeding_type: string,
    feeding_mark: string,
    amount: number,
    cost: number,
) => {
    const { rowCount } = await pool.query(
        "UPDATE alimentacion SET tipo_alimento = $1, marca_alimento = $2, cantidad_kg = $3, costo_unitario = $4, updated_at = now() WHERE id_alimentacion = $5",
        [feeding_type,feeding_mark, amount, cost, feeding_id],
    );
    return rowCount;
};

