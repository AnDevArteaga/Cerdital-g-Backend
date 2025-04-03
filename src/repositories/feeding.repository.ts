import pool from "../config/db";

//Obtener alimentacion por id de usuario
export const getFeedingById = async (user_id: number) => {
    const { rows } = await pool.query(
        "SELECT * FROM alimentacion WHERE id_usuario = $1",
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
) => {
    const date = new Date();
    const { rows } = await pool.query(
        "INSERT INTO alimentacion (id_lote, tipo_alimento, marca_alimento, cantidad_kg, costo_unitario, fecha_creacion, id_usuario) VALUES ($1, $2, $3, $4, $5, $6, $7)",
        [
            batch_id,
            feeding_type,
            feeding_mark,
            amount,
            cost,
            date,
            user_id,
        ],
    );
    return rows[0];
};

//elminar alimentacion por id de alimentacion
export const deleteFeeding = async (feeding_id: number) => {
    const { rowCount } = await pool.query(
        "DELETE FROM alimentacion WHERE id_alimentacion = $1",
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
        "UPDATE alimentacion SET tipo_alimento = $1, marca_alimento = $2, cantidad_kg = $3, costo_unitario = $4 WHERE id_alimentacion = $5",
        [feeding_type,feeding_mark, amount, cost, feeding_id],
    );
    return rowCount;
};

