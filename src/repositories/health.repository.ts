import pool from "../config/db";

//Obtener salud por id de usuario
export const getHealthById = async (user_id: number) => {
    const { rows } = await pool.query(
        "SELECT * FROM salud_tratamiento WHERE id_usuario = $1 AND deleted_at IS NULL",
        [user_id],
    );
    return rows;
};

//Crear salud de un usuario
export const createHealth = async (
    batch_id: number,
    disease: string,
    treatment: string,
    user_id: number,
    clientId: string | null = null,
) => {
    const date = new Date();
    const { rows } = await pool.query(
        `INSERT INTO salud_tratamiento (id_lote, enfermedad, tratamiento, fecha_creacion, id_usuario, client_id)
         VALUES ($1, $2, $3, $4, $5, COALESCE($6::uuid, gen_random_uuid()))
         ON CONFLICT (client_id) DO NOTHING
         RETURNING *`,
        [
            batch_id,
            disease,
            treatment,
            date,
            user_id,
            clientId,
        ],
    );
    return rows[0];
};

//elminar salud por id de salud
export const deleteHealth = async (health_id: number) => {
    const { rowCount } = await pool.query(
        "UPDATE salud_tratamiento SET deleted_at = now(), updated_at = now() WHERE id_tratamiento = $1 AND deleted_at IS NULL",
        [health_id],
    );
    return rowCount;
};

//editar alimentacion por id de alimentacion
export const updatedHealth = async (
    health_id: number,
    batch_id: number,
    disease: string,
    treatment: string,
) => {
    const { rowCount } = await pool.query(
        "UPDATE salud_tratamiento SET id_lote = $1, enfermedad = $2, tratamiento = $3, updated_at = now() WHERE id_tratamiento = $4", 
        [batch_id, disease, treatment, health_id],
    );
    return rowCount;
};
