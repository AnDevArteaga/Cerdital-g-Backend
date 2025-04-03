import pool from "../config/db";

//Obtener costo por id de usuario
export const getCostById = async (user_id: number) => {
    const { rows } = await pool.query(
        "SELECT * FROM costos WHERE id_usuario = $1",
        [user_id],
    );
    return rows;
};

//Crear costo de un usuario, se crea automaticamente despues de crear un lote, lo ahi se ejecuta
export const createCost = async (batch_id: number, user_id: number) => {
    const date = new Date();

    const { rows } = await pool.query(
        "INSERT INTO costos (id_lote, id_usuario, compra_cerdos, alimentacion, medicamentos, mano_obra, transporte, otros, fecha_creacion) VALUES ($1, $2, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, $3)",
        [batch_id, user_id, date]
    );

    return rows[0];
};


//elminar costo por id de costo
export const deleteCost = async (cost_id: number) => {
    const { rowCount } = await pool.query(
        "DELETE FROM costos WHERE id_costo = $1",
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
        "UPDATE costos SET id_lote = $1, compra_cerdos = $2, alimentacion = $3, medicamentos = $4, mano_obra = $5, transporte = $6, otros = $7 WHERE id_costo = $8",
        [batch_id, purchase_pigs, feeding, medicine, handwork, transport, other, cost_id],
    );
    return rowCount;
};  