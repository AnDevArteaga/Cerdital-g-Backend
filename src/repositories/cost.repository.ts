import pool from "../config/db";

//Obtener costo por id de usuario
export const getCostById = async (user_id: number) => {
    const { rows } = await pool.query(
        "SELECT * FROM costos WHERE id_usuario = $1 AND deleted_at IS NULL",
        [user_id],
    );
    return rows;
};

//Crear costo de un usuario, se crea automaticamente despues de crear un lote, lo ahi se ejecuta
export const createCost = async (batch_id: number, user_id: number, clientId: string | null = null) => {
    const date = new Date();

    const { rows } = await pool.query(
        `INSERT INTO costos (id_lote, id_usuario, compra_cerdos, alimentacion, medicamentos, mano_obra, transporte, otros, fecha_creacion, client_id)
         VALUES ($1, $2, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, $3, COALESCE($4::uuid, gen_random_uuid()))
         ON CONFLICT (client_id) DO NOTHING
         RETURNING *`,
        [batch_id, user_id, date, clientId],
    );

    return rows[0];
};

export const getCostByBatch = async (batchId: number) => {
    const { rows } = await pool.query(
        "SELECT * FROM costos WHERE id_lote = $1 AND deleted_at IS NULL",
        [batchId],
    );
    return rows[0] ?? null;
};


//elminar costo por id de costo
export const deleteCost = async (cost_id: number) => {
    const { rowCount } = await pool.query(
        "UPDATE costos SET deleted_at = now(), updated_at = now() WHERE id_costo = $1 AND deleted_at IS NULL",
        [cost_id],
    );
    return rowCount;
};

//editar costo por id de costo
export const updatedCost = async (
    cost_id: number,
    batch_id: number,
    purchase_pigs: number,
    feeding: number,
    medicine: number,
    handwork: number,
    transport: number,
    other: number,
) => {
    const { rowCount } = await pool.query(
        "UPDATE costos SET id_lote = $1, compra_cerdos = $2, alimentacion = $3, medicamentos = $4, mano_obra = $5, transporte = $6, otros = $7, updated_at = now() WHERE id_costo = $8",
        [batch_id, purchase_pigs, feeding, medicine, handwork, transport, other, cost_id],
    );
    return rowCount;
};  