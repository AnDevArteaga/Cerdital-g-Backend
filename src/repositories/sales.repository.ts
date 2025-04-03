import pool from "../config/db";

//Obtener ventas por id de usuario
export const getSalesById = async (user_id: number) => {
    const { rows } = await pool.query(
        "SELECT * FROM ventas WHERE id_usuario = $1",
        [user_id],
    );
    return rows;
};

//Crear venta de un usuario
export const createSales = async (
    batch_id: number,
    pig_sold: number,
    average_weight: number,
    price_kg: number,
    user_id: number
) => {
    const date = new Date();
    const { rows } = await pool.query(
        "INSERT INTO ventas (id_lote, cerdos_vendidos, peso_promedio, precio_kg, fecha_creacion, id_usuario) VALUES ($1, $2, $3, $4, $5, $6)",
        [
            batch_id,
            pig_sold,
            average_weight,
            price_kg,
            date,
            user_id
        ],
    );
    return rows[0];
};

//elminar venta por id de venta
export const deleteSales = async (sales_id: number) => {
    const { rowCount } = await pool.query(
        "DELETE FROM ventas WHERE id_venta = $1",
        [sales_id],
    );
    return rowCount;
};

//editar venta por id de venta
export const updatedSales = async (
    sales_id: number,
    batch_id: number,
    pig_sold: number,
    average_weight: number,
    price_kg: number,
) => {
    const { rowCount } = await pool.query(
        "UPDATE ventas SET id_lote = $1, cerdos_vendidos = $2, peso_promedio = $3, precio_kg = $4 WHERE id_venta = $5",
        [ batch_id, pig_sold, average_weight, price_kg, sales_id],
    );
    return rowCount;
};  